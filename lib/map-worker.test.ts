import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("MapLibre usa un worker pubblico stabile invece del chunk implicito", () => {
  const component = readFileSync(
    new URL("../components/forecast-map.tsx", import.meta.url),
    "utf8",
  );
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.match(component, /setWorkerUrl\("\/maplibre-gl-worker\.mjs"\)/);
  assert.match(packageJson.scripts.build, /prepare-maplibre-worker/);
  assert.match(packageJson.scripts.dev, /prepare-maplibre-worker/);
});
