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

function sumObserved(
  times: unknown,
  values: unknown,
  count: number,
  now: Date,
): number | null {
  if (!Array.isArray(times) || !Array.isArray(values)) return null;
  const today = now.toISOString().slice(0, 10);
  const observed = values.filter((_, index) => {
    const date = times[index];
    return typeof date === "string" && date < today;
  });
  const window = observed.slice(-count);
  if (window.length === 0 || window.some((value) => finiteNumber(value) === null)) return null;
  return Number(window.reduce<number>((sum, value) => sum + (finiteNumber(value) ?? 0), 0).toFixed(1));
}

function valueForToday(times: unknown, values: unknown, now: Date): number | null {
  if (!Array.isArray(times) || !Array.isArray(values)) return null;
  const today = now.toISOString().slice(0, 10);
  const todayIndex = times.findIndex((value) => value === today);
  return todayIndex >= 0 ? finiteNumber(values[todayIndex]) : null;
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
    precipitation7dMm: sumObserved(daily.time, daily.precipitation_sum, 7, now),
    precipitation14dMm: sumObserved(daily.time, daily.precipitation_sum, 14, now),
    precipitationProbability: valueForToday(daily.time, daily.precipitation_probability_max, now),
    et0Mm: valueForToday(daily.time, daily.et0_fao_evapotranspiration, now),
    latitude: finiteNumber(payload.latitude),
    longitude: finiteNumber(payload.longitude),
    elevationM: finiteNumber(payload.elevation),
    source: "open-meteo",
  };
}

export async function fetchOpenMeteoSnapshots(
  coordinates: Array<{ latitude: number; longitude: number }>,
  signal: AbortSignal,
  now = new Date(),
): Promise<WeatherSnapshot[]> {
  if (coordinates.length === 0) return [];
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", coordinates.map((point) => point.latitude).join(","));
  url.searchParams.set("longitude", coordinates.map((point) => point.longitude).join(","));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m");
  url.searchParams.set(
    "daily",
    "temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration",
  );
  url.searchParams.set("past_days", "14");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Provider meteo non disponibile (${response.status}).`);
  const payload: unknown = await response.json();
  const entries = Array.isArray(payload) ? payload : [payload];
  if (entries.length !== coordinates.length) throw new Error("Risposta meteo batch incompleta.");
  return entries.map((entry) => normalizeOpenMeteo(entry, now));
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
