export type WeatherSnapshot = {
  observedAt: string;
  expiresAt: string;
  temperatureC: number | null;
  relativeHumidity: number | null;
  precipitation7dMm: number | null;
  precipitation14dMm: number | null;
  precipitationProbability: number | null;
  et0Mm: number | null;
  latitude: number | null;
  longitude: number | null;
  elevationM: number | null;
  source: "open-meteo" | "fallback";
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sumTrailing(values: unknown, count: number): number | null {
  if (!Array.isArray(values)) return null;
  const window = values.slice(-count);
  if (window.length === 0 || window.some((value) => finiteNumber(value) === null)) return null;
  return Number(window.reduce<number>((sum, value) => sum + (finiteNumber(value) ?? 0), 0).toFixed(1));
}

function lastFinite(values: unknown): number | null {
  if (!Array.isArray(values)) return null;
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = finiteNumber(values[index]);
    if (value !== null) return value;
  }
  return null;
}

function normalizeProviderTime(value: unknown, fallback: Date): string {
  if (typeof value !== "string" || value.length < 10) return fallback.toISOString();
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const parsed = new Date(hasOffset ? value : `${value}:00Z`);
  return Number.isNaN(parsed.getTime()) ? fallback.toISOString() : parsed.toISOString();
}

export function normalizeOpenMeteo(payload: unknown, now = new Date()): WeatherSnapshot {
  if (!isRecord(payload)) throw new Error("Risposta meteo non valida.");
  const current = isRecord(payload.current) ? payload.current : {};
  const daily = isRecord(payload.daily) ? payload.daily : {};
  const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  return {
    observedAt: normalizeProviderTime(current.time, now),
    expiresAt: expiresAt.toISOString(),
    temperatureC: finiteNumber(current.temperature_2m),
    relativeHumidity: finiteNumber(current.relative_humidity_2m),
    precipitation7dMm: sumTrailing(daily.precipitation_sum, 7),
    precipitation14dMm: sumTrailing(daily.precipitation_sum, 14),
    precipitationProbability: lastFinite(daily.precipitation_probability_max),
    et0Mm: lastFinite(daily.et0_fao_evapotranspiration),
    latitude: finiteNumber(payload.latitude),
    longitude: finiteNumber(payload.longitude),
    elevationM: finiteNumber(payload.elevation),
    source: "open-meteo",
  };
}

export async function fetchOpenMeteoSnapshot(
  latitude: number,
  longitude: number,
  signal: AbortSignal,
  now = new Date(),
): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m");
  url.searchParams.set(
    "daily",
    "temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration",
  );
  url.searchParams.set("past_days", "14");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Provider meteo non disponibile (${response.status}).`);
  return normalizeOpenMeteo(await response.json(), now);
}
