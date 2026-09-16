import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { buildForecastBatch } from "@/lib/forecast-service";
import { betaAreas } from "@/lib/seed-data";
import { fetchOpenMeteoSnapshot } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) {
    return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  }

  const now = new Date();
  const batch = await buildForecastBatch(betaAreas, async (area) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6_000);
    try {
      return await fetchOpenMeteoSnapshot(
        area.center[0],
        area.center[1],
        controller.signal,
        now,
      );
    } finally {
      clearTimeout(timeout);
    }
  }, now);

  return NextResponse.json(batch, {
    headers: {
      "Cache-Control": "private, max-age=900, stale-while-revalidate=1800",
    },
  });
}
