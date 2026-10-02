# Atlante micologico versionato beta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pubblicare una beta funzionante che separa Atlante e Obiettivi, espone taxa atomici ordinati sistematicamente, supporta gallerie con licenze, consente modifiche dirette all'admin fondatore e mantiene visibili le aree quando la mappa di base fallisce.

**Architecture:** Il catalogo base rimane rigenerabile dalle fonti approvate, ma viene separato in `objectiveRecords` e `atlasTaxa`. Le modifiche persistenti sono revisioni append-only applicate come overlay. Wikimedia Commons fornisce candidati fotografici con attribuzione completa; la mappa usa OpenFreeMap e un fallback SVG selezionabile.

**Tech Stack:** TypeScript, React 19, Vinext/Next API routes, Cloudflare D1, MapLibre GL, OpenFreeMap, Wikimedia Commons API, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-17-atlante-versionato-obiettivi-mappa-design.md`

## Global Constraints

- Registrazione obbligatoria per ogni funzione applicativa.
- Species Fungorum è riferimento primario; Index Fungorum e MycoBank sono riscontri, mai aggiornamenti automatici.
- Guida Regione Piemonte esclusiva per commestibilità; nessuna falsa precisione oltre il rango della fonte.
- Admin fondatore pubblica direttamente durante la beta; ogni modifica resta versionata.
- Immagini soltanto con autore, licenza, pagina sorgente e URL licenza.
- Vista minima 320 px, nessun overflow orizzontale.
- La perdita della base cartografica non deve nascondere aree o controlli.

---

### Task 1: Inventario atomico e modello di dominio

**Files:**
- Create: `lib/atlas-catalog.ts`
- Create: `lib/atlas-catalog.test.ts`
- Create: `scripts/generate-atlas-taxa.mjs`
- Create: `data/atlas-taxa.json`
- Modify: `lib/domain.ts`
- Modify: `lib/objective-catalog.ts`

**Interfaces:**
- Produces: `atlasTaxa: AtlasTaxon[]`, `objectiveRecords: TrainingObjectiveRecord[]`, `sortAtlasTaxa(taxa)`.
- Consumes: `data/taxonomic-objectives.json` and existing detailed beta taxa.

- [ ] **Step 1: Write failing catalog-separation tests**

```ts
test("objective headings are not atlas cards", () => {
  assert.equal(atlasTaxa.some((taxon) => taxon.id === "objective-agaricus"), false);
  assert.equal(objectiveRecords.some((entry) => entry.scientificName === "Agaricus"), true);
});

test("explicit taxa become atlas records and Agaricales sort first", () => {
  assert.ok(atlasTaxa.some((taxon) => taxon.scientificName === "Amanita phalloides"));
  assert.equal(sortAtlasTaxa(atlasTaxa)[0].order, "Agaricales");
});
```

- [ ] **Step 2: Run focused test and confirm RED**

Run: `pnpm exec node --experimental-strip-types --test lib/atlas-catalog.test.ts`  
Expected: FAIL because `atlas-catalog.ts` does not exist.

- [ ] **Step 3: Implement source-aware extraction and types**

Add `AtlasTaxon` fields for accepted name, authorship, hierarchy, diagnostic characters, odor, ecology, media status, external identifiers and source citations. Resolve abbreviated binomials only inside the parent objective context; discard prose tokens and retain unresolved rows in a coverage report.

- [ ] **Step 4: Generate and validate `data/atlas-taxa.json`**

Run: `node scripts/generate-atlas-taxa.mjs`  
Expected: deterministic JSON, no duplicate accepted names, no objective-prefixed IDs, every record linked to a source page.

- [ ] **Step 5: Run focused and full tests**

Run: `pnpm exec node --experimental-strip-types --test lib/atlas-catalog.test.ts && pnpm test`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/domain.ts lib/objective-catalog.ts lib/atlas-catalog.ts lib/atlas-catalog.test.ts scripts/generate-atlas-taxa.mjs data/atlas-taxa.json
git commit -m "feat: separate atlas taxa from training objectives"
```

### Task 2: Archivio versionato e admin fondatore

**Files:**
- Modify: `db/schema.ts`
- Create: `drizzle/0002_versioned_atlas.sql`
- Create: `lib/founder-admin.ts`
- Create: `lib/founder-admin.test.ts`
- Create: `lib/atlas-revisions.ts`
- Create: `lib/atlas-revisions.test.ts`
- Create: `app/api/admin/atlas/route.ts`
- Create: `app/admin/atlas/page.tsx`
- Create: `app/admin/atlas/atlas-editor.tsx`

**Interfaces:**
- Produces: `isFounderAdmin(email, configuredEmails)`, `applyAtlasRevisions(base, changes)`, GET/PATCH `/api/admin/atlas`.
- Consumes: `CATALOG_CURATOR_EMAILS`, authenticated ChatGPT user, D1.

- [ ] **Step 1: Write failing permission and revision tests**

```ts
test("configured curator is founder admin during beta", () => {
  assert.equal(isFounderAdmin("admin@example.it", "ADMIN@example.it"), true);
});

test("rename keeps stable id and previous name searchable", () => {
  const result = applyAtlasRevisions([baseTaxon], [renameRevision]);
  assert.equal(result[0].id, baseTaxon.id);
  assert.ok(result[0].aliases.includes(baseTaxon.scientificName));
});
```

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `pnpm exec node --experimental-strip-types --test lib/founder-admin.test.ts lib/atlas-revisions.test.ts`  
Expected: FAIL for missing modules.

- [ ] **Step 3: Add normalized D1 tables**

Create tables for taxon names, placements, profiles, media, revisions and releases. Use append-only revision rows; hidden media remains historically addressable. Generate and inspect migration SQL.

- [ ] **Step 4: Implement founder-only direct publishing API**

PATCH validates field paths, source citation and rationale, writes user/revision/release in one D1 batch and returns the updated record. Non-founder receives 403.

- [ ] **Step 5: Implement responsive editor**

Editor supports accepted/common names, rank, hierarchy, edibility, safety, diagnostics, odor, habitat, distribution, sources and media URL metadata.

- [ ] **Step 6: Verify focused tests and migration**

Run: `pnpm exec node --experimental-strip-types --test lib/founder-admin.test.ts lib/atlas-revisions.test.ts && pnpm db:generate`  
Expected: PASS and stable migration.

- [ ] **Step 7: Commit**

```bash
git add db/schema.ts drizzle lib/founder-admin.ts lib/founder-admin.test.ts lib/atlas-revisions.ts lib/atlas-revisions.test.ts app/api/admin/atlas app/admin/atlas
git commit -m "feat: add founder-managed versioned atlas"
```

### Task 3: API pubblica separata per Atlante e Obiettivi

**Files:**
- Modify: `app/api/catalog/route.ts`
- Create: `app/api/objectives/route.ts`
- Create: `lib/catalog-api.test.ts`
- Modify: `lib/catalog-publication.ts`

**Interfaces:**
- Produces: catalog payload `{ taxa, release, status }`; objectives payload `{ objectives, coverage }`.
- Consumes: atlas base, published revisions, objective source records.

- [ ] **Step 1: Write failing payload tests**

```ts
test("catalog payload excludes training headings", () => {
  assert.equal(buildCatalogPayload([]).taxa.some((taxon) => taxon.id.startsWith("objective-")), false);
});
```

- [ ] **Step 2: Run test and confirm RED**

Run: `pnpm exec node --experimental-strip-types --test lib/catalog-api.test.ts`  
Expected: FAIL for missing builder.

- [ ] **Step 3: Implement builders and routes**

Keep degraded operation deterministic when D1 is absent. Apply revisions in publication order and return explicit coverage counts.

- [ ] **Step 4: Run focused/full tests and commit**

Run: `pnpm exec node --experimental-strip-types --test lib/catalog-api.test.ts && pnpm test`  
Expected: PASS.

```bash
git add app/api/catalog/route.ts app/api/objectives/route.ts lib/catalog-publication.ts lib/catalog-api.test.ts
git commit -m "feat: expose separate atlas and objective APIs"
```

### Task 4: Navigazione e viste Atlante/Obiettivi

**Files:**
- Modify: `app/explore-client.tsx`
- Create: `components/atlas-view.tsx`
- Create: `components/objectives-view.tsx`
- Create: `components/taxon-detail.tsx`
- Create: `lib/navigation.test.ts`

**Interfaces:**
- Produces: four ordered tabs and reusable atlas/objective/detail components.
- Consumes: `AtlasTaxon[]`, `TrainingObjectiveRecord[]`.

- [ ] **Step 1: Write failing source-level navigation test**

```ts
test("navigation orders Cerca Atlante Obiettivi Metodo", () => {
  assert.deepEqual(extractTabLabels(source), ["Cerca", "Atlante", "Obiettivi", "Metodo"]);
});
```

- [ ] **Step 2: Run test and confirm RED**

Run: `pnpm exec node --experimental-strip-types --test lib/navigation.test.ts`  
Expected: FAIL because Obiettivi is absent.

- [ ] **Step 3: Split the oversized client and implement views**

Atlante groups by order/family/genus, searches accepted/historic/common/regional names and opens a detail drawer. Obiettivi presents the 124 source headings and links every resolved cited taxon to Atlante.

- [ ] **Step 4: Verify mobile structure**

Add `min-w-0`, wrapping and horizontally scrollable tab list at 320 px; no fixed card width.

- [ ] **Step 5: Run tests/typecheck and commit**

Run: `pnpm exec node --experimental-strip-types --test lib/navigation.test.ts && pnpm exec tsc --noEmit`  
Expected: PASS.

```bash
git add app/explore-client.tsx components/atlas-view.tsx components/objectives-view.tsx components/taxon-detail.tsx lib/navigation.test.ts
git commit -m "feat: separate atlas and objectives experiences"
```

### Task 5: Galleria fotografica con licenze

**Files:**
- Create: `lib/media-license.ts`
- Create: `lib/media-license.test.ts`
- Create: `lib/commons-media.ts`
- Create: `lib/commons-media.test.ts`
- Create: `app/api/media/route.ts`
- Create: `components/taxon-gallery.tsx`
- Modify: `components/taxon-detail.tsx`

**Interfaces:**
- Produces: `isReusableLicense(name)`, `normalizeCommonsMedia(payload)`, GET `/api/media?taxon=...`.
- Consumes: Wikimedia Commons MediaSearch/API image metadata.

- [ ] **Step 1: Write failing license and normalization tests**

```ts
test("rejects images without an explicit reusable license", () => {
  assert.equal(isReusableLicense("All Rights Reserved"), false);
  assert.equal(isReusableLicense("CC BY-SA 4.0"), true);
});
```

- [ ] **Step 2: Run focused test and confirm RED**

Run: `pnpm exec node --experimental-strip-types --test lib/media-license.test.ts lib/commons-media.test.ts`  
Expected: FAIL for missing modules.

- [ ] **Step 3: Implement server-side Commons lookup**

Search accepted name plus synonyms, request imageinfo/extmetadata, allow CC0/Public Domain/CC BY/CC BY-SA, sanitize attribution, cap results and cache responses. Never treat a result as verified solely because it matched text.

- [ ] **Step 4: Implement gallery and empty state**

Show principal image, full-screen dialog, attribution, license link, source link and `Galleria in preparazione` when no compatible media exists.

- [ ] **Step 5: Verify tests/typecheck and commit**

Run: `pnpm exec node --experimental-strip-types --test lib/media-license.test.ts lib/commons-media.test.ts && pnpm exec tsc --noEmit`  
Expected: PASS.

```bash
git add lib/media-license.ts lib/media-license.test.ts lib/commons-media.ts lib/commons-media.test.ts app/api/media/route.ts components/taxon-gallery.tsx components/taxon-detail.tsx
git commit -m "feat: add licensed taxon galleries"
```

### Task 6: Mappa resiliente e fallback

**Files:**
- Modify: `components/forecast-map.tsx`
- Create: `components/forecast-map-fallback.tsx`
- Modify: `lib/map-worker.test.ts`
- Create: `lib/map-resilience.test.ts`

**Interfaces:**
- Produces: `classifyMapError(error)`, fallback area selector, retry action.
- Consumes: OpenFreeMap style, existing H3 GeoJSON features.

- [ ] **Step 1: Write failing resilience tests**

```ts
test("a tile error does not make the whole map fatal", () => {
  assert.equal(classifyMapError({ sourceId: "basemap" }), "resource");
});
```

- [ ] **Step 2: Run focused test and confirm RED**

Run: `pnpm exec node --experimental-strip-types --test lib/map-resilience.test.ts`  
Expected: FAIL for missing classifier.

- [ ] **Step 3: Replace fragile style and isolate errors**

Use configurable OpenFreeMap style. Fatal state is limited to initialization/WebGL/worker failure; resource failures retain overlay and controls.

- [ ] **Step 4: Add non-WebGL fallback**

Render an SVG Italy viewport using existing aggregated polygons, colored by recommendation and selectable with keyboard/touch. Add `Riprova mappa`.

- [ ] **Step 5: Verify tests and commit**

Run: `pnpm exec node --experimental-strip-types --test lib/map-worker.test.ts lib/map-resilience.test.ts lib/map-geometry.test.ts`  
Expected: PASS.

```bash
git add components/forecast-map.tsx components/forecast-map-fallback.tsx lib/map-worker.test.ts lib/map-resilience.test.ts
git commit -m "fix: keep search areas visible when basemap fails"
```

### Task 7: Integrazione, responsive QA e pubblicazione

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `docs/catalog/source-coverage.md`
- Modify: `README.md`

**Interfaces:**
- Consumes all preceding public components and datasets.
- Produces the published beta and evidence of coverage.

- [ ] **Step 1: Connect page props and degraded states**

Pass atlas/objectives separately, keep registered-user gating, expose admin editor only to configured founder.

- [ ] **Step 2: Run the full automated verification**

Run: `pnpm test`  
Expected: 0 failures.

Run: `pnpm exec tsc --noEmit`  
Expected: exit 0.

Run: `pnpm lint`  
Expected: exit 0.

Run: `pnpm build`  
Expected: production build complete.

- [ ] **Step 3: Perform live-size QA**

Verify at 320 px and desktop: four tabs, no horizontal overflow, atlas detail/galleries, objectives links, admin access/denial, map and fallback. Confirm unauthenticated routes return registration flow.

- [ ] **Step 4: Validate coverage report**

Confirm every source row is `published`, `resolved` or `blocked` with reason; record atlas taxa, objective headings, media searches and missing galleries.

- [ ] **Step 5: Commit, synchronize and publish**

```bash
git add app/page.tsx app/globals.css docs/catalog/source-coverage.md README.md
git commit -m "release: publish versioned atlas beta"
```

Push exact commit to GitHub and Sites source, package the successful build, deploy a saved Site version, then verify production asset/API responses and the live URL.
