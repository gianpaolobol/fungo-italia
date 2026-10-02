import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const explore = readFileSync(new URL("../app/explore-client.tsx", import.meta.url), "utf8");
const detail = readFileSync(new URL("../components/atlas-card-detail.tsx", import.meta.url), "utf8");
const fallback = readFileSync(new URL("../components/forecast-map-fallback.tsx", import.meta.url), "utf8");

test("mobile workspace uses dynamic viewport height and switches list/map before desktop", () => {
  assert.match(explore, /h-\[calc\(100dvh-250px\)\]/);
  assert.match(explore, /lg:block lg:h-\[calc\(100dvh-190px\)\]/);
  assert.match(explore, /lg:hidden/);
  assert.match(explore, /xl:block xl:h-\[calc\(100dvh-190px\)\]/);
});

test("narrow-screen content consistently allows shrinking and wrapping", () => {
  const minWidthGuards = (explore.match(/min-w-0/g) ?? []).length;
  const wrapGuards = (explore.match(/break-words/g) ?? []).length;
  assert.ok(minWidthGuards >= 20, `expected broad min-w-0 coverage, found ${minWidthGuards}`);
  assert.ok(wrapGuards >= 8, `expected broad break-words coverage, found ${wrapGuards}`);
  assert.match(detail, /min-w-0/);
  assert.match(detail, /break-words/);
});

test("horizontal scrolling is limited to deliberate chip/tab rows rather than the page", () => {
  assert.match(explore, /overflow-x-auto/);
  assert.match(explore, /scrollbar-none/);
  assert.match(detail, /overflow-x-auto/);
});

test("mobile fallback map remains usable as a compact responsive grid", () => {
  assert.match(fallback, /grid-cols-2/);
  assert.match(fallback, /sm:grid-cols-3/);
  assert.match(fallback, /max-w-xl/);
});

test("desktop and tablet layouts use progressive grid breakpoints instead of fixed widths", () => {
  assert.match(explore, /lg:grid-cols-\[360px_minmax\(0,1fr\)\]/);
  assert.match(explore, /xl:grid-cols-\[360px_minmax\(0,1fr\)_340px\]/);
  assert.match(explore, /md:grid-cols-2/);
  assert.match(explore, /xl:grid-cols-3/);
});
