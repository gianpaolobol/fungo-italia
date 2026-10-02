import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  buildCommonsCandidate,
  stripHtml,
  type CommonsMediaCandidate,
} from "@/lib/commons-media";

type CommonsPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  }

  const taxon = new URL(request.url).searchParams.get("taxon")?.trim();
  if (!taxon || taxon.length > 120) return NextResponse.json({ images: [] });

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap "${taxon}"`,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1100",
    format: "json",
    origin: "*",
  });

  try {
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params}`,
      {
        headers: {
          "User-Agent": "FungoItaliaBeta/1.0 (licensed mycology atlas media resolver)",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) throw new Error(`Commons ${response.status}`);

    const payload = await response.json() as {
      query?: { pages?: Record<string, CommonsPage> };
    };

    const images = Object.values(payload.query?.pages ?? {})
      .flatMap((page): CommonsMediaCandidate[] => {
        const info = page.imageinfo?.[0];
        const meta = info?.extmetadata ?? {};
        const candidate = buildCommonsCandidate({
          id: `commons-${page.pageid}`,
          requestedTaxon: taxon,
          imageUrl: info?.thumburl,
          sourceUrl:
            info?.descriptionurl ??
            `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
          title: page.title,
          author: meta.Artist?.value,
          license: meta.LicenseShortName?.value,
          licenseUrl: meta.LicenseUrl?.value,
          caption: meta.ImageDescription?.value,
          categories: stripHtml(meta.Categories?.value),
        });
        return candidate ? [candidate] : [];
      })
      .sort((left, right) => right.matchScore - left.matchScore)
      .slice(0, 6);

    return NextResponse.json(
      {
        images,
        source: "Wikimedia Commons",
        verifiedOnly: true,
      },
      {
        headers: { "Cache-Control": "private, max-age=86400" },
      },
    );
  } catch (error) {
    console.error("commons_media_failed", error);
    return NextResponse.json({ images: [], status: "degraded" });
  }
}
