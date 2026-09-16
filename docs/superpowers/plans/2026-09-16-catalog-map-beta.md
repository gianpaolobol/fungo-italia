# Catalog Editing and Forecast Map Beta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver a usable private beta with an interactive national map, explainable weather-aware area recommendations, catalog change proposals, scoped scientific review, and a mobile layout verified on iPhone 13 mini dimensions.

**Architecture:** The existing Vinext application remains the delivery surface. MapLibre renders an OSM raster base plus public H3-resolution-6 polygons; a provider-neutral forecast module combines curated area inputs and normalized weather without claiming certainty. D1 stores append-only catalog change sets, reviewer grants, decisions, releases, environmental snapshots, and versioned forecasts.

**Tech Stack:** Vinext/Next, React 19, TypeScript, MapLibre GL JS, h3-js, Tailwind CSS, Shadcn primitives, Drizzle ORM, Cloudflare D1/R2, Open-Meteo adapter, Sites SIWC.

**Spec:** docs/superpowers/specs/2026-09-16-catalogo-editoriale-previsioni-mappa-design.md

## Global Constraints

- S1 controls inclusion and taxonomic resolution; S2 alone controls published edibility.
- A genus, section, group or aggregate must never be expanded to species without source evidence.
- Public geometry uses H3 resolution 6; private observation coordinates never reach public APIs.
- Forecasts are probabilistic, dated, confidence-labelled, and explainable.
- Catalog history is append-only; publication never destroys an earlier revision.
- Critical scientific changes require a curator decision distinct from the author.
- OpenStreetMap attribution remains visible and the tile URL is configurable.
- No horizontal overflow from 320 to 1,920 CSS px; iPhone 13 mini is verified at 375 × 812.

---

### Task 1: Versioned editorial and forecast schema

**Files:**
- Modify: db/schema.ts
- Generate: drizzle/0001_*.sql
- Create: lib/catalog-workflow.ts
- Test: lib/catalog-workflow.test.ts

**Interfaces:**
- Produces CatalogRole, ChangeStatus, ChangeCriticality, ReviewStage, and nextChangeStatus(input).
- Produces the D1 tables catalog_role_grants, catalog_change_sets, catalog_field_changes, catalog_review_decisions, catalog_releases, forecast_model_versions, environmental_snapshots, and cell_taxon_forecasts.

    export type ChangeCriticality = "ordinary" | "critical";
    export type ChangeStatus =
      | "draft" | "submitted" | "inReview" | "changesRequested"
      | "approved" | "rejected" | "published" | "superseded";
    export function nextChangeStatus(input: ReviewStateInput): ChangeStatus;

- [ ] Write failing tests proving that an author cannot approve their own critical change and that an independent curator can approve it.
- [ ] Run node --experimental-strip-types --test lib/catalog-workflow.test.ts and confirm ERR_MODULE_NOT_FOUND.
- [ ] Implement the minimal pure workflow and normalized Drizzle tables.
- [ ] Run node --experimental-strip-types --test lib/catalog-workflow.test.ts, then pnpm test; expect zero failures.
- [ ] Run pnpm db:generate; inspect the generated SQL for eight CREATE TABLE statements, foreign keys, and indexes.
- [ ] Commit: feat: add versioned catalog workflow schema.

### Task 2: Explainable forecast and provider-neutral weather

**Files:**
- Create: lib/forecast.ts
- Test: lib/forecast.test.ts
- Create: lib/weather.ts
- Test: lib/weather.test.ts
- Create: app/api/forecast/route.ts
- Modify: lib/domain.ts
- Modify: lib/seed-data.ts

**Interfaces:**
- Produces WeatherSnapshot, ForecastResult, normalizeOpenMeteo(payload, now), and calculateForecast(area, weather).
- GET /api/forecast returns generatedAt, providerStatus, and forecasts; every forecast contains component scores, confidence, freshness, reasons, and taxon IDs.

    export interface WeatherSnapshot {
      observedAt: string;
      expiresAt: string;
      temperatureC: number | null;
      relativeHumidity: number | null;
      precipitation7dMm: number | null;
      precipitation14dMm: number | null;
      precipitationProbability: number | null;
      et0Mm: number | null;
      source: "open-meteo" | "fallback";
    }

    export function normalizeOpenMeteo(
      payload: unknown,
      now: Date,
    ): WeatherSnapshot;

    export function calculateForecast(
      area: Area,
      weather: WeatherSnapshot | null,
    ): ForecastResult;

- [ ] Write failing tests for precipitation windows, stale-data confidence, bounded scores, and provider failure.
- [ ] Run node --experimental-strip-types --test lib/weather.test.ts lib/forecast.test.ts and confirm missing exports.
- [ ] Implement weather normalization and deterministic scoring.
- [ ] Implement the batch forecast route with timeout, explicit degraded fallback, and no private coordinates.
- [ ] Re-run the two focused files, then pnpm test; expect zero failures.
- [ ] Commit: feat: add explainable weather forecasts.

### Task 3: H3 map geometry and MapLibre surface

**Files:**
- Modify: package.json
- Modify: pnpm-lock.yaml
- Create: lib/map-geometry.ts
- Test: lib/map-geometry.test.ts
- Create: components/forecast-map.tsx
- Modify: app/globals.css

**Interfaces:**
- Produces areaToPublicFeature(area, forecast) and areasToFeatureCollection(areas, forecasts).
- ForecastMap consumes public areas, forecast results, selected ID, and onSelect(id).

    export function areaToPublicFeature(
      area: Area,
      forecast: ForecastResult,
    ): GeoJSON.Feature<GeoJSON.Polygon, PublicAreaProperties>;

    export function ForecastMap(props: {
      areas: Area[];
      forecasts: ForecastResult[];
      selectedId: string;
      onSelect: (id: string) => void;
    }): React.ReactElement;

- [ ] Write a failing test proving H3 resolution 6, closed GeoJSON rings, longitude/latitude order, and absence of private fields.
- [ ] Run node --experimental-strip-types --test lib/map-geometry.test.ts and confirm ERR_MODULE_NOT_FOUND.
- [ ] Run node "$SITES_PNPM_BIN" add maplibre-gl h3-js and verify package.json plus pnpm-lock.yaml changed.
- [ ] Implement the geometry converter and pass the focused test.
- [ ] Implement MapLibre with a configurable OSM raster style, visible attribution, selectable polygons, loading and failure states.
- [ ] Run pnpm test and pnpm build; both must exit zero.
- [ ] Commit: feat: add interactive forecast map.

### Task 4: Mobile-first exploration workspace

**Files:**
- Modify: app/explore-client.tsx
- Modify: app/globals.css
- Create: lib/explore-view.ts
- Test: lib/explore-view.test.ts

**Interfaces:**
- Produces rankAreas(areas, forecasts, filters).
- Mobile exposes mutually exclusive map and list modes plus a bottom drawer for details.
- Desktop keeps list, map, and detail visible without content exceeding the viewport.

    export function rankAreas(
      areas: Area[],
      forecasts: ForecastResult[],
      filters: { query: string; region: string },
    ): RankedArea[];

- [ ] Write failing tests for stable ranking, missing forecasts, region filters, and text-safe labels.
- [ ] Run node --experimental-strip-types --test lib/explore-view.test.ts and confirm ERR_MODULE_NOT_FOUND.
- [ ] Implement the ranking and filtering helper.
- [ ] Replace the iframe with ForecastMap, the mobile mode switch, and drawer detail.
- [ ] Add 100dvh, safe-area padding, min-width zero, wrapping, 44 px controls, and overflow guards.
- [ ] Run pnpm test, pnpm lint, and pnpm build; each must exit zero.
- [ ] Commit: feat: make map workspace responsive.

### Task 5: Collector catalog proposals

**Files:**
- Create: lib/catalog-proposal.ts
- Test: lib/catalog-proposal.test.ts
- Create: app/api/catalog/proposals/route.ts
- Create: app/catalog/proposals/new/page.tsx
- Create: app/catalog/proposals/new/proposal-form.tsx
- Modify: app/explore-client.tsx

**Interfaces:**
- Produces validateCatalogProposal(input) and classifyCriticality(fieldPaths).
- Authenticated POST /api/catalog/proposals creates one submitted change set and its immutable field changes.

    export function classifyCriticality(
      fieldPaths: readonly string[],
    ): "ordinary" | "critical";

    export function validateCatalogProposal(
      input: unknown,
    ): { success: true; data: CatalogProposalInput } |
       { success: false; errors: string[] };

- [ ] Write failing validation tests for create/update proposals, source requirement, supported ranks, and automatic critical classification.
- [ ] Run node --experimental-strip-types --test lib/catalog-proposal.test.ts and confirm ERR_MODULE_NOT_FOUND.
- [ ] Implement validation and criticality classification.
- [ ] Implement transactional D1 proposal creation with immutable author metadata.
- [ ] Build the responsive proposal form and link it from atlas cards.
- [ ] Run the focused test, pnpm test, pnpm lint, and pnpm build; each must exit zero.
- [ ] Commit: feat: let collectors propose catalog changes.

### Task 6: Scoped micologist review

**Files:**
- Create: lib/catalog-permissions.ts
- Test: lib/catalog-permissions.test.ts
- Create: app/api/admin/catalog/reviews/route.ts
- Create: app/admin/catalog/page.tsx
- Create: app/admin/catalog/review-client.tsx
- Modify: app/explore-client.tsx

**Interfaces:**
- Produces canReviewChange(grants, change) and canApproveCriticalChange(actor, change).
- GET /api/admin/catalog/reviews lists only in-scope changes; POST records approve, reject, or request-changes decisions.

    export function canReviewChange(
      grants: readonly ReviewerGrant[],
      change: ReviewableChange,
    ): boolean;

    export function canApproveCriticalChange(
      actor: ReviewerActor,
      change: ReviewableChange,
    ): boolean;

- [ ] Write failing permission tests for regional scope, taxonomic scope, curator override, and self-review prohibition.
- [ ] Run node --experimental-strip-types --test lib/catalog-permissions.test.ts and confirm ERR_MODULE_NOT_FOUND.
- [ ] Implement permission and role resolution, including runtime curator bootstrap configuration.
- [ ] Implement review APIs with transactional decisions and append-only audit records.
- [ ] Implement the review queue with evidence, before/after fields, and decision controls.
- [ ] Run the focused test, pnpm test, pnpm lint, pnpm build, and rg "catalog_change_sets|catalog_review_decisions" drizzle; all checks must succeed.
- [ ] Commit: feat: add scoped scientific review.

### Task 6A: Published catalog overlay and direct ordinary editing

**Files:**
- Create: lib/catalog-publication.ts
- Test: lib/catalog-publication.test.ts
- Create: app/api/catalog/route.ts
- Modify: app/api/catalog/proposals/route.ts
- Modify: app/api/admin/catalog/reviews/route.ts
- Modify: app/explore-client.tsx

**Interfaces:**
- Produces applyPublishedChanges(baseTaxa, changes).
- GET /api/catalog returns the base release plus published revisions.
- In-scope micologists may directly publish ordinary changes; critical changes still require independent review.

    export function applyPublishedChanges(
      baseTaxa: Taxon[],
      changes: PublishedFieldChange[],
    ): Taxon[];

- [ ] Write failing tests for ordinary name overlays, non-assessed new taxa, version ordering, and rejected-change exclusion.
- [ ] Implement deterministic overlay logic without mutating the source release.
- [ ] Add authenticated catalog API and client refresh.
- [ ] Create one CatalogRelease for each publication and atomically link the change set.
- [ ] Run focused tests, full tests, lint, and build.
- [ ] Commit: feat: publish verified catalog revisions.

### Task 7: Mobile visual QA, integration, and publication

**Files:**
- Modify as defects require: app/**/*.tsx, components/**/*.tsx, app/globals.css
- Modify: README.md

**Interfaces:**
- Produces a verified private Sites deployment and synchronized GitHub source.

- [ ] Start the supervised Sites preview.
- [ ] Test 375 × 812, 320 × 568, 768 × 1,024, and 1,440 × 900 viewports.
- [ ] Verify no horizontal overflow, clipped text, hidden controls, safe-area collisions, or unusable map gestures.
- [ ] Add a regression test before every testable defect fix.
- [ ] Verify keyboard navigation, focus visibility, labels, loading, empty, error, stale-weather, and unauthorized-review states.
- [ ] Run pnpm test, pnpm lint, pnpm build, git diff --check, and rg "CREATE TABLE" drizzle/0001_*.sql; require zero failures.
- [ ] Merge the verified feature branch, synchronize GitHub, package the exact commit, and deploy the existing private Site.
- [ ] Confirm terminal deployment success and return the production URL.
