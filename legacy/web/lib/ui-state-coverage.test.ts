import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const explore = source("../app/explore-client.tsx");
const map = source("../components/forecast-map.tsx");
const reviews = source("../app/admin/catalog/review-client.tsx");

test("atlas exposes loading, error and empty search states", () => {
  assert.match(explore, /Ricerca in corso/);
  assert.match(explore, /Ricerca server non disponibile/);
  assert.match(explore, /Nessun risultato per i filtri selezionati/);
});

test("forecast workspace exposes live, partial and degraded feedback", () => {
  assert.match(explore, /forecastStatus/);
  assert.match(explore, /Meteo aggiornato/);
  assert.match(explore, /Dati parziali/);
  assert.match(map, /status === "loading"/);
  assert.match(map, /status === "error"/);
});

test("scientific review UI distinguishes loading, unauthorized, error and empty states", () => {
  assert.match(reviews, /status === "loading"/);
  assert.match(reviews, /status === "forbidden"/);
  assert.match(reviews, /status === "error"/);
  assert.match(reviews, /Nessuna proposta in attesa/);
  assert.match(reviews, /Incarico non configurato/);
});
