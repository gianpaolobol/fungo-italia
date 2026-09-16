import assert from "node:assert/strict";
import test from "node:test";

import { normalizeOpenMeteo } from "./weather.ts";

const now = new Date("2026-09-16T12:00:00.000Z");

test("Open-Meteo payload is normalized with 7 and 14 day rain windows", () => {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date("2026-09-03T00:00:00.000Z");
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
  const snapshot = normalizeOpenMeteo({
    latitude: 44.3,
    longitude: 10.8,
    elevation: 920,
    current: {
      time: "2026-09-16T11:45",
      temperature_2m: 14.5,
      relative_humidity_2m: 81,
    },
    daily: {
      time: days,
      temperature_2m_min: days.map(() => 8),
      temperature_2m_max: days.map(() => 19),
      precipitation_sum: days.map((_, index) => index + 1),
      precipitation_probability_max: days.map(() => 65),
      et0_fao_evapotranspiration: days.map(() => 2),
    },
  }, now);

  assert.equal(snapshot.precipitation7dMm, 77);
  assert.equal(snapshot.precipitation14dMm, 105);
  assert.equal(snapshot.temperatureC, 14.5);
  assert.equal(snapshot.relativeHumidity, 81);
  assert.equal(snapshot.source, "open-meteo");
  assert.equal(snapshot.elevationM, 920);
});

test("missing optional weather values stay null instead of becoming zero", () => {
  const snapshot = normalizeOpenMeteo({
    current: { time: "2026-09-16T11:45" },
    daily: { time: ["2026-09-16"], precipitation_sum: [null] },
  }, now);

  assert.equal(snapshot.temperatureC, null);
  assert.equal(snapshot.relativeHumidity, null);
  assert.equal(snapshot.precipitation7dMm, null);
  assert.equal(snapshot.et0Mm, null);
});

test("invalid provider payload is rejected", () => {
  assert.throws(() => normalizeOpenMeteo(null, now), /meteo non valida/i);
});
