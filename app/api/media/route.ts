import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isCompatibleCommonsLicense, stripHtml } from "@/lib/commons-media";

type CommonsPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{ thumburl?: string; descriptionurl?: string; extmetadata?: Record<string, { value?: string }> }>;
};

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  const taxon = new URL(request.url).searchParams.get("taxon")?.trim();
  if (!taxon || taxon.length > 120) return NextResponse.json({ images: [] });
  const params = new URLSearchParams({
    action: "query", generator: "search", gsrsearch: `filetype:bitmap ${taxon}`,
    gsrnamespace: "6", gsrlimit: "8", prop: "imageinfo", iiprop: "url|extmetadata",
    iiurlwidth: "900", format: "json", origin: "*",
  });
  try {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { "User-Agent": "FungoItaliaBeta/1.0" } });
    if (!response.ok) throw new Error(`Commons ${response.status}`);
    const payload = await response.json() as { query?: { pages?: Record<string, CommonsPage> } };
    const images = Object.values(payload.query?.pages ?? {}).flatMap((page) => {
      const info = page.imageinfo?.[0];
      const meta = info?.extmetadata ?? {};
      const license = stripHtml(meta.LicenseShortName?.value);
      if (!info?.thumburl || !isCompatibleCommonsLicense(license)) return [];
      return [{
        id: `commons-${page.pageid}`, imageUrl: info.thumburl,
        sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        author: stripHtml(meta.Artist?.value) || "Autore indicato su Wikimedia Commons",
        license, licenseUrl: meta.LicenseUrl?.value ?? "https://commons.wikimedia.org/",
        caption: stripHtml(meta.ImageDescription?.value) || page.title.replace(/^File:/, ""),
      }];
    }).slice(0, 6);
    return NextResponse.json({ images, source: "Wikimedia Commons" }, { headers: { "Cache-Control": "private, max-age=86400" } });
  } catch (error) {
    console.error("commons_media_failed", error);
    return NextResponse.json({ images: [], status: "degraded" });
  }
}
