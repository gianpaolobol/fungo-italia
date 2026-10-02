import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { buildForecastBatch } from "@/lib/forecast-service";
import { betaAreas } from "@/lib/seed-data";
import { fetchOpenMeteoSnapshots, type WeatherSnapshot } from "@/lib/weather";

export const dynamic = "force-dynamic";

let forecastCache: { expiresAt: number; value: Awaited<ReturnType<typeof buildForecastBatch>> } | null = null;

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) {
    return NextResponse.json({ error: "Registrazione richiesta." }, { status: 401 });
  }

  const now = new Date();
  if (forecastCache && forecastCache.expiresAt > now.getTime()) {
    return NextResponse.json(forecastCache.value, {
      headers: { "Cache-Control": "private, max-age=900, stale-while-revalidate=1800" },
    });
  }

  const weatherByArea = new Map<string, WeatherSnapshot>();
  const chunkSize = 15;
  const chunks: Array<{ offset: number; areas: typeof betaAreas }> = [];
  for (let offset = 0; offset < betaAreas.length; offset += chunkSize) {
    const areaChunk = betaAreas.slice(offset, offset + chunkSize);
    chunks.push({ offset, areas: areaChunk });
  }
  const settledChunks = await Promise.allSettled(chunks.map(async (chunk) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const snapshots = await fetchOpenMeteoSnapshots(
        chunk.areas.map((area) => ({ latitude: area.center[0], longitude: area.center[1] })),
        controller.signal,
        now,
      );
      return { chunk, snapshots };
    } finally {
      clearTimeout(timeout);
    }
  }));
  settledChunks.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error("weather_batch_failed", { offset: chunks[index].offset, error: result.reason });
      return;
    }
    result.value.chunk.areas.forEach((area, areaIndex) => {
      weatherByArea.set(area.id, result.value.snapshots[areaIndex]);
    });
  });

  const batch = await buildForecastBatch(betaAreas, async (area) => {
    const snapshot = weatherByArea.get(area.id);
    if (!snapshot) throw new Error("Meteo non disponibile per l'area.");
    return snapshot;
  }, now);
  forecastCache = { expiresAt: now.getTime() + 30 * 60 * 1000, value: batch };

  return NextResponse.json(batch, {
    headers: {
      "Cache-Control": "private, max-age=900, stale-while-revalidate=1800",
    },
  });
}
