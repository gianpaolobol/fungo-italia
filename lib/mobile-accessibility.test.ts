import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const explore = source("../app/explore-client.tsx");
const detail = source("../components/atlas-card-detail.tsx");
const map = source("../components/forecast-map.tsx");
const fallback = source("../components/forecast-map-fallback.tsx");
const css = source("../app/globals.css");

test("global layout blocks horizontal viewport overflow", () => {
  assert.match(css, /html\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*hidden/s);
  assert.match(css, /body\s*\{[^}]*max-width:\s*100%[^}]*overflow-x:\s*hidden/s);
  assert.match(explore, /max-w-full overflow-x-hidden/);
});

test("mobile fixed actions and drawers respect safe-area insets", () => {
  assert.match(explore, /pb-\[env\(safe-area-inset-bottom\)\]/);
  assert.match(explore, /bottom-\[max\(12px,env\(safe-area-inset-bottom\)\)\]/);
});

test("atlas navigation and filter controls meet the 44px touch target baseline", () => {
  assert.doesNotMatch(detail, /min-h-10 shrink-0 rounded-full/);
  assert.match(detail, /min-h-11 shrink-0 rounded-full/);
  assert.match(detail, /-ml-2 h-11 rounded-xl/);
  assert.doesNotMatch(explore, /className="h-10 w-full rounded-xl"/);
  assert.match(explore, /className="h-11 w-full rounded-xl"/);
  assert.match(fallback, /min-h-11 min-w-0 rounded-2xl/);
});

test("keyboard focus remains visible and reduced motion is honored", () => {
  assert.match(css, /:focus-visible\s*\{/);
  assert.match(css, /outline:\s*3px solid var\(--ring\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation-duration:\s*0\.01ms !important/);
});

test("map has accessible region semantics, loading announcement and fallback controls", () => {
  assert.match(map, /role="region"/);
  assert.match(map, /aria-label="Mappa delle condizioni favorevoli per i funghi"/);
  assert.match(map, /role="status"/);
  assert.match(map, /aria-live="polite"/);
  assert.match(fallback, /aria-label="Mappa accessibile delle aree"/);
  assert.match(fallback, /type="button"/);
  assert.match(fallback, /aria-pressed=\{selectedId === area\.id\}/);
});

test("interactive view and depth toggles expose their selected state", () => {
  assert.match(explore, /aria-pressed=\{mobileView === "map"\}/);
  assert.match(explore, /aria-pressed=\{mobileView === "list"\}/);
  assert.match(detail, /aria-pressed=\{depth === entry\}/);
});

test("map selection motion follows the reduced-motion user preference", () => {
  assert.match(map, /prefers-reduced-motion: reduce/);
  assert.match(map, /duration: reduceMotion \? 0 : 500/);
});

test("MapLibre attribution is kept visible and moved above mobile bottom controls", () => {
  assert.match(map, /new AttributionControl\(\{ compact: true \}\)/);
  assert.match(css, /\.maplibregl-ctrl-attrib\s*\{/);
  assert.match(css, /@media \(max-width: 1023px\)[\s\S]*\.maplibregl-ctrl-bottom-right[\s\S]*bottom:\s*82px/);
});
