import assert from "node:assert/strict";
import test from "node:test";

import { normalizeOpenMeteo } from "./weather.ts";

const now = new Date("2026-09-16T12:00:00.000Z");

test("Open-Meteo payload separates observed rain from future forecast", () => {
  const days = Array.from({ length: 21 }, (_, index) => {
    const date = new Date("2026-09-02T00:00:00.000Z");
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
  assert.equal(snapshot.precipitation26dMm, null);
  assert.equal(snapshot.meanTemperature20dC, null);
  assert.equal(snapshot.waterBalance14dMm, 77);
  assert.equal(snapshot.temperatureC, 14.5);
  assert.equal(snapshot.relativeHumidity, 81);
  assert.equal(snapshot.source, "open-meteo");
  assert.equal(snapshot.elevationM, 920);
});

test("future rain never contributes to observed 7 and 14 day totals", () => {
  const snapshot = normalizeOpenMeteo({
    current: { time: "2026-09-16T12:00", temperature_2m: 15, relative_humidity_2m: 70 },
    daily: {
      time: ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17"],
      precipitation_sum: [2, 3, 100, 200],
      precipitation_probability_max: [10, 20, 70, 90],
      et0_fao_evapotranspiration: [1, 1, 2, 3],
    },
  }, now);

  assert.equal(snapshot.precipitation7dMm, null);
  assert.equal(snapshot.precipitation14dMm, null);
  assert.equal(snapshot.precipitation26dMm, null);
  assert.equal(snapshot.waterBalance14dMm, null);
  assert.equal(snapshot.precipitationProbability, 70);
});

test("missing optional weather values stay null instead of becoming zero", () => {
  const snapshot = normalizeOpenMeteo({
    current: { time: "2026-09-16T11:45" },
    daily: { time: ["2026-09-16"], precipitation_sum: [null] },
  }, now);

  assert.equal(snapshot.temperatureC, null);
  assert.equal(snapshot.relativeHumidity, null);
  assert.equal(snapshot.precipitation7dMm, null);
  assert.equal(snapshot.precipitation26dMm, null);
  assert.equal(snapshot.meanTemperature20dC, null);
  assert.equal(snapshot.waterBalance14dMm, null);
  assert.equal(snapshot.et0Mm, null);
});

test("invalid provider payload is rejected", () => {
  assert.throws(() => normalizeOpenMeteo(null, now), /meteo non valida/i);
});

test("complete UTC windows calculate totals while missing days and temperatures stay unavailable",()=>{
 const time=Array.from({length:26},(_,i)=>{const date=new Date(now);date.setUTCDate(date.getUTCDate()-26+i);return date.toISOString().slice(0,10);});
 const daily={time,precipitation_sum:time.map(()=>2),temperature_2m_min:time.map(()=>8),temperature_2m_max:time.map(()=>18),et0_fao_evapotranspiration:time.map(()=>1)};
 const complete=normalizeOpenMeteo({daily},now);
 assert.equal(complete.precipitation7dMm,14);assert.equal(complete.precipitation14dMm,28);assert.equal(complete.precipitation26dMm,52);assert.equal(complete.meanTemperature20dC,13);assert.equal(complete.waterBalance14dMm,14);
 const missing=normalizeOpenMeteo({daily:{...daily,time:time.filter((_,i)=>i!==24)}},now);
 assert.equal(missing.precipitation7dMm,null);assert.equal(missing.precipitation14dMm,null);assert.equal(missing.precipitation26dMm,null);assert.equal(missing.meanTemperature20dC,null);
 const gap=normalizeOpenMeteo({daily:{...daily,temperature_2m_min:daily.temperature_2m_min.map((value,i)=>i===25?null:value)}},now);
 assert.equal(gap.meanTemperature20dC,null);
});
