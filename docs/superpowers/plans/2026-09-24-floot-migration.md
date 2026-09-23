# Floot Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the completed Fungo Italia private beta on Floot with equivalent core behavior, Floot-managed auth/database/storage, preserved scientific-safety gates, and repeatable deployment without ChatGPT Work.

**Architecture:** Rebuild the existing Next.js/Vinext application as a Floot React 19 application using Floot pages/components/helpers/endpoints. Static catalog and scientific-policy data remain sourced from the verified GitHub corpus; mutable application data moves from Cloudflare D1 to Floot-managed Postgres, R2 uploads move to Floot Storage, and ChatGPT Sites header-based auth moves to Floot Auth. Migration is incremental: first a faithful read-only atlas shell with hardcoded/ported verified data, then backend resources, then write flows and admin/review flows, then production publish and smoke testing.

**Tech Stack:** React 19, Floot pages/components/helpers/endpoints, React Router, React Query v5, Floot Auth, Floot-managed Postgres (postgres-js + Kysely), Floot Storage, Wikimedia Commons API, Open-Meteo API, existing Fungo Italia TypeScript catalog logic ported as helpers.

**Spec:** `docs/superpowers/specs/2026-09-23-floot-migration-design.md`

## Global Constraints

- No intentional functional regression relative to the completed private beta.
- Preserve the 66 genus/group cards, 148 Minimo cards, and 214 searchable documents.
- Preserve URL-state semantics for query, filters, learning depth, and group→child→group return context.
- Preserve scientific publication safety: `reviewNeeded` content must never become public scientific fact automatically.
- Morphology/ecology may be public only when the source review status allows it; safety-critical content follows the stricter existing approval rule.
- Replace ChatGPT Sites auth with Floot Auth; do not emulate the old `oai-authenticated-user-*` headers.
- Replace D1 with Floot-managed Postgres; all SQL identifiers use snake_case.
- Replace R2 with Floot Storage; uploaded user media remains private unless explicitly intended to be public.
- Floot endpoints use GET/POST only.
- Frontend must remain usable at 320x568, 375x812, 768x1024, and 1440x900 with no horizontal overflow.
- Keep the original GitHub implementation as rollback/reference until Floot acceptance criteria pass.
- Do not expand scientific scope or approve the 295 outstanding review batches as part of this migration.

## Review Focus

- Anonymous/expired session: protected pages and write endpoints must fail closed without leaking private or editorial data.
- Corrupted or absent Postgres rows: catalog must degrade to the verified base corpus without exposing review-needed scientific text.
- Media upload edge cases: unsupported MIME type, >12 MB file, failed presign/PUT, and orphan cleanup must not create broken observation rows.
- Deep-link navigation: opening a genus/taxon directly with malformed query/filter/depth parameters must normalize safely and remain navigable.
- External API failure: Commons and Open-Meteo timeouts/rate failures must show degraded states rather than crash the app.

---

### Task 1: Create Floot Project, Design System, and Read-Only Atlas Baseline

**Files:**
- Create in Floot: `static/__dev/design-principles.md`
- Create/replace in Floot: `base.css`
- Create in Floot: `pages/_index.tsx`
- Create in Floot: `pages/_index.module.css`
- Create in Floot: `pages/_index.pageLayout.tsx`
- Create in Floot: `helpers/catalogData.tsx`
- Create in Floot: `helpers/navigationState.tsx`
- Create in Floot: `helpers/navigationState.spec.tsx`
- Create in Floot: `static/__dev/notes/source-baseline.md`

**Interfaces:**
- Consumes: GitHub source data from `lib/objective-catalog.ts`, `lib/atlas-catalog.ts`, `lib/minimum-*.ts`, `lib/seed-data.ts`, and safety policy helpers.
- Produces: `catalogData` export containing the 214-document read-only corpus and `navigationState` helpers for query/filter/depth/card state.

- [ ] **Step 1: Create the Floot project**

Create project name `Fungo Italia` with the original product request as its initial prompt and preserve the approved migration spec in project notes.

Expected: a new Floot project ID and live preview URL.

- [ ] **Step 2: Apply the design phase in one patch**

Create a design system whose distinctive thread is “field notebook + inspection instrument”: warm off-white paper surfaces, deep forest green primary, restrained amber safety signal, hairline dividers, compact expert-tool pacing, and a more literary display face paired with a quiet sans body face.

Expected: `static/__dev/design-principles.md` and `base.css` both exist; base.css defines required light/dark tokens.

- [ ] **Step 3: Write failing navigation-state tests**

Create `helpers/navigationState.spec.tsx` with tests that assert:
- malformed depth falls back to `essential`;
- query/filter state survives open-card and close-card transitions;
- genus→child→genus restores the previous genus depth;
- unknown card IDs do not destroy search state;
- malformed URL input never throws.

Expected: tests fail because `navigationState` implementation does not yet exist.

- [ ] **Step 4: Implement `helpers/navigationState.tsx`**

Port the semantics from `lib/minimum-navigation.ts` and `lib/atlas-navigation-state.ts` into a Floot helper with one exported symbol named `navigationState`.

Expected: the helper exposes pure functions for parse/serialize/open/close/group-child-return state.

- [ ] **Step 5: Run helper tests**

Expected: all `navigationState` tests pass.

- [ ] **Step 6: Port verified static catalog data**

Create `helpers/catalogData.tsx` containing the verified base corpus used by the private beta:
- 66 genus/group cards;
- 148 Minimo cards;
- 214 search documents;
- beta areas;
- review-status metadata required by the public safety policy.

Do not import unpublished scientific claims into public fields.

Expected: counts are exactly 66/148/214.

- [ ] **Step 7: Build the read-only home/atlas scaffold**

Create `pages/_index.tsx` with:
- authenticated-state placeholder banner for now;
- map/area section using existing beta-area values;
- Atlas search field and filters;
- result cards;
- genus/taxon detail panel;
- depth selector;
- genus→child→genus navigation.

Use realistic ported data, not dummy placeholders.

Expected: the preview renders the core app and all 214 documents are reachable in-memory.

- [ ] **Step 8: Verify preview behavior**

Use browser execution to assert:
- search returns expected taxa;
- one genus opens;
- one child opens;
- returning restores genus depth;
- no horizontal overflow at 320px and 1440px.

Expected: checks pass.

- [ ] **Step 9: Create checkpoint**

Checkpoint title: `Read-only atlas baseline`.

---

### Task 2: Provision Floot Auth and Postgres, Then Create the Core Schema

**Files:**
- Floot-managed generated: `helpers/db.tsx`
- Floot-managed generated: `helpers/schema.tsx`
- Create in Floot: `helpers/currentUser.tsx`
- Create in Floot: `helpers/currentUser.spec.tsx`
- Create in Floot: `components/AppShell.tsx`
- Create in Floot: `components/AppShell.module.css`
- Modify: `pages/_index.pageLayout.tsx`

**Interfaces:**
- Consumes: Floot Auth session identity and Task 1 catalog baseline.
- Produces: stable application user object `{ id, email, displayName }`, Postgres schema, authenticated application shell.

- [ ] **Step 1: Provision Floot database and auth resources**

Provision one managed Postgres database and one Floot Auth resource.

Expected: resources are connected to the project and database/auth environment is available.

- [ ] **Step 2: Create Postgres enum types**

Create enums:
- `user_role`: collector, mycologist, scientific_curator
- `observation_status`: pending, reviewed, rejected
- `catalog_role`: contributor, mycologist, scientific_curator
- `catalog_change_status`: submitted, under_review, approved, rejected, published
- `catalog_criticality`: normal, high, critical
- `review_decision`: approve, reject, request_changes

Expected: enum types exist.

- [ ] **Step 3: Create core tables**

Create snake_case tables mirroring the existing D1 semantics:
- users
- observations
- observation_photos
- reviewer_assignments
- reviews
- catalog_role_grants
- catalog_change_sets
- catalog_field_changes
- catalog_review_decisions
- catalog_releases
- forecast_model_versions
- environmental_snapshots
- cell_taxon_forecasts

For catalog taxa/learning cards, keep immutable beta corpus in code for v1; only published override/change metadata lives in Postgres.

Expected: schema pull succeeds and generated `helpers/schema.tsx` reflects the tables.

- [ ] **Step 4: Write failing current-user tests**

Test:
- no auth user => null;
- authenticated user => normalized id/email/displayName;
- first login upserts a collector user;
- configured curator email results in curator bootstrap grant only once.

Expected: tests fail until helper is implemented.

- [ ] **Step 5: Implement `helpers/currentUser.tsx`**

Use Floot Auth identity, upsert into users, and apply bootstrap curator logic using project configuration, never client input.

Expected: tests pass.

- [ ] **Step 6: Build authenticated `AppShell`**

Render user display name, sign-out action, and page content. Ensure unauthenticated users see the Floot login flow rather than the old ChatGPT Sites paths.

Expected: login/logout works in preview.

- [ ] **Step 7: Verify fail-closed behavior**

Attempt direct access without session.

Expected: no private user data, observation data, or admin controls render.

- [ ] **Step 8: Create checkpoint**

Checkpoint title: `Auth and Postgres foundation`.

---

### Task 3: Port Catalog Search and Scientific Safety Policy to Floot Endpoints

**Files:**
- Create: `helpers/catalogSearch.tsx`
- Create: `helpers/catalogSearch.spec.tsx`
- Create: `helpers/publicScientificPolicy.tsx`
- Create: `helpers/publicScientificPolicy.spec.tsx`
- Create: `endpoints/catalog_GET.ts`
- Create: `endpoints/catalog_GET.schema.ts`
- Create: `helpers/useCatalog.tsx`
- Modify: `pages/_index.tsx`

**Interfaces:**
- Consumes: Task 1 catalog corpus, Task 2 current user and Postgres published change metadata.
- Produces: authenticated catalog GET endpoint with search mode and base/live release mode.

- [ ] **Step 1: Write failing scientific-policy tests**

Cover:
- `reviewNeeded` morphology/ecology is hidden;
- reviewed morphology/ecology is visible;
- safety-critical content requires approved state;
- genus/group review-needed bullets and taxonomy notes remain hidden;
- published overrides cannot downgrade safety rules.

Expected: tests fail.

- [ ] **Step 2: Port public scientific policy**

Implement one exported `publicScientificPolicy` symbol that mirrors existing `public-scientific-policy.ts` and `public-genus-policy.ts`.

Expected: policy tests pass.

- [ ] **Step 3: Write failing catalog-search tests**

Cover:
- 214 indexed documents;
- source/current name aliases searchable;
- abbreviations searchable;
- filters for type/rank/genus/edibility/review;
- no hidden review-needed morphology/ecology in public search text;
- malformed params normalize rather than throw.

Expected: tests fail.

- [ ] **Step 4: Implement catalog search**

Port search semantics and public projection into `helpers/catalogSearch.tsx`.

Expected: all search tests pass.

- [ ] **Step 5: Implement `catalog_GET` endpoint and schema**

Behavior:
- unauthenticated => 401;
- search params => paginated search response;
- no search params => base corpus plus published approved overrides;
- DB failure => `status: "degraded"` and verified base corpus;
- no internal `searchText` field in response.

Expected: endpoint returns typed output.

- [ ] **Step 6: Add React Query hook and wire the page**

Replace in-memory-only search with endpoint-backed search, using placeholderData identity and explicit loading/error/degraded states.

Expected: search remains usable when endpoint succeeds and falls back safely when DB is unavailable.

- [ ] **Step 7: Verify review-focus cases**

Simulate corrupted/missing published rows.

Expected: app degrades to verified base corpus and still hides review-needed content.

- [ ] **Step 8: Create checkpoint**

Checkpoint title: `Catalog API and scientific safety`.

---

### Task 4: Port Forecast and Map Behavior

**Files:**
- Create: `helpers/forecastService.tsx`
- Create: `helpers/forecastService.spec.tsx`
- Create: `endpoints/forecast_GET.ts`
- Create: `endpoints/forecast_GET.schema.ts`
- Create: `helpers/useForecast.tsx`
- Create: `components/ForecastMap.tsx`
- Create: `components/ForecastMap.module.css`
- Modify: `pages/_index.tsx`

**Interfaces:**
- Consumes: beta areas, Open-Meteo, current user.
- Produces: forecast batch endpoint and responsive map/fallback presentation.

- [ ] **Step 1: Write failing forecast tests**

Cover:
- score/recommendation calculation;
- missing weather produces explicit unavailable confidence/reason;
- stale or failed external data does not imply positive presence;
- chunked weather requests preserve area ordering;
- no exact mushroom-location coordinates are exposed.

Expected: tests fail.

- [ ] **Step 2: Port forecast logic**

Implement forecast scoring and reasons in `helpers/forecastService.tsx`.

Expected: tests pass.

- [ ] **Step 3: Implement forecast endpoint**

Fetch Open-Meteo in chunks with per-chunk timeout and partial degradation. Do not rely on in-memory server cache for correctness.

Expected: endpoint returns all areas with explicit degraded status where needed.

- [ ] **Step 4: Build map component**

Use the closest Floot-compatible mapping approach available; if the existing MapLibre worker model cannot be used inside Floot, use a non-worker map library or a deterministic accessible list fallback. Preserve area selection, labels, and accessibility.

Expected: map/area navigation works in preview without worker errors.

- [ ] **Step 5: Verify external API failure**

Force Commons/Open-Meteo fetch failure.

Expected: UI shows degraded/unavailable state, not a crash or false positive.

- [ ] **Step 6: Create checkpoint**

Checkpoint title: `Forecast and map port`.

---

### Task 5: Port Wikimedia Commons Media Resolver

**Files:**
- Create: `helpers/commonsMedia.tsx`
- Create: `helpers/commonsMedia.spec.tsx`
- Create: `endpoints/media_GET.ts`
- Create: `endpoints/media_GET.schema.ts`
- Create: `helpers/useMedia.tsx`
- Modify relevant atlas detail UI.

**Interfaces:**
- Consumes: current taxon scientific/source names and authenticated user.
- Produces: up to six license-verified Commons images with attribution.

- [ ] **Step 1: Write failing media-policy tests**

Cover:
- allow CC0, Public Domain, CC BY, CC BY-SA;
- reject NC, ND, missing author/license/source;
- require taxonomic match confidence;
- sanitize HTML metadata;
- timeout returns degraded empty result.

Expected: tests fail.

- [ ] **Step 2: Port Commons candidate builder**

Implement license and taxonomic match policy.

Expected: tests pass.

- [ ] **Step 3: Implement media GET endpoint**

Authenticated only; taxon length max 120; Wikimedia request timeout 10s; max six sorted verified candidates.

Expected: typed response and degraded fallback.

- [ ] **Step 4: Wire detail gallery**

Show image, author, source, license, and explicit “gallery in preparation” state when no verified image exists.

Expected: attribution is visible and no unverified image appears.

- [ ] **Step 5: Create checkpoint**

Checkpoint title: `Verified media resolver`.

---

### Task 6: Port Observation Creation and Private Media Upload

**Files:**
- Create: `pages/observations.new.tsx`
- Create: `pages/observations.new.module.css`
- Create: `pages/observations.new.pageLayout.tsx`
- Create: `helpers/observationValidation.tsx`
- Create: `helpers/observationValidation.spec.tsx`
- Create: `endpoints/observation-upload_POST.ts`
- Create: `endpoints/observation-upload_POST.schema.ts`
- Create: `endpoints/observations_POST.ts`
- Create: `endpoints/observations_POST.schema.ts`
- Create: `helpers/useCreateObservation.tsx`

**Interfaces:**
- Consumes: Floot Auth, Postgres, Floot Storage, catalog taxa.
- Produces: complete observation flow with private exact coordinates and private photo storage.

- [ ] **Step 1: Write failing observation validation tests**

Cover:
- latitude/longitude bounds;
- description/date required;
- taxon ID normalization;
- public coordinate aggregation;
- private coordinates never copied into public coordinate fields verbatim;
- accepted MIME jpeg/png/webp only;
- 12 MB max file size.

Expected: tests fail.

- [ ] **Step 2: Implement observation validation**

Port `lib/observation.ts` semantics into one helper.

Expected: tests pass.

- [ ] **Step 3: Implement upload-presign endpoint**

Use `@floot/storage` with private visibility and unique filenames. Validate MIME and size before presign.

Expected: returns presigned PUT URL + opaque storage filename, never file bytes.

- [ ] **Step 4: Implement observation POST endpoint**

Authenticated only. Validate body, insert observation, then insert photo metadata only for successfully uploaded filenames belonging to the current request/user.

Expected: failed upload cannot create a photo row; failed DB write does not expose coordinates.

- [ ] **Step 5: Build observation form**

Use Floot UI kit Form/Input/Textarea/FileDropzone. Upload files directly from browser to presigned URL, then submit metadata.

Expected: one complete observation with photo can be created.

- [ ] **Step 6: Verify edge cases**

Test unsupported MIME, >12 MB, failed PUT, and duplicate submit.

Expected: clear errors and no duplicate/broken rows.

- [ ] **Step 7: Create checkpoint**

Checkpoint title: `Observation and private upload flow`.

---

### Task 7: Port Proposal and Scientific Review Workflow

**Files:**
- Create: `pages/catalog.proposals.new.tsx`
- Create: `pages/catalog.proposals.new.module.css`
- Create: `pages/admin.catalog.tsx`
- Create: `pages/admin.catalog.module.css`
- Create: `helpers/catalogPermissions.tsx`
- Create: `helpers/catalogPermissions.spec.tsx`
- Create: `helpers/catalogWorkflow.tsx`
- Create: `helpers/catalogWorkflow.spec.tsx`
- Create: `endpoints/catalog-proposals_POST.ts`
- Create: `endpoints/catalog-proposals_POST.schema.ts`
- Create: `endpoints/catalog-reviews_GET.ts`
- Create: `endpoints/catalog-reviews_GET.schema.ts`
- Create: `endpoints/catalog-reviews_POST.ts`
- Create: `endpoints/catalog-reviews_POST.schema.ts`
- Create: `endpoints/admin-atlas_POST.ts`
- Create: `endpoints/admin-atlas_POST.schema.ts`

**Interfaces:**
- Consumes: current user, role grants, catalog data, Postgres.
- Produces: contribution/review/publish workflow preserving independent-review and critical-change rules.

- [ ] **Step 1: Write failing permission tests**

Cover:
- author cannot review own change;
- inactive grants denied;
- region/taxonomic scope enforced;
- critical approval requires scientific curator;
- critical approval requires prior independent mycologist review;
- curator cannot be same person as author or mycologist reviewer.

Expected: tests fail.

- [ ] **Step 2: Port permission logic**

Implement one exported `catalogPermissions` helper.

Expected: tests pass.

- [ ] **Step 3: Write failing workflow tests**

Cover valid transitions only:
- submitted → under_review;
- under_review → approved/rejected/request_changes as applicable;
- critical changes require two-stage independent review;
- only approved changes can become published;
- published release is immutable/versioned.

Expected: tests fail.

- [ ] **Step 4: Implement workflow helper**

Port existing catalog-workflow semantics.

Expected: tests pass.

- [ ] **Step 5: Implement proposal/review/admin endpoints**

All endpoints authenticated and server-side authorized. Never trust role or reviewer IDs from client input.

Expected: unauthorized attempts return 403.

- [ ] **Step 6: Build proposal and admin pages**

Provide proposal form and review workbench sufficient for the existing private beta workflow.

Expected: contributor can submit; reviewer sees only in-scope work; curator can publish eligible approved changes.

- [ ] **Step 7: Verify safety gate**

Create a reviewNeeded claim and attempt to publish/display it without the required review.

Expected: it remains hidden from public scientific projection.

- [ ] **Step 8: Create checkpoint**

Checkpoint title: `Scientific review workflow`.

---

### Task 8: End-to-End QA, Production Publish, and Post-Publish Verification

**Files:**
- Create in Floot: `static/__dev/notes/qa-checklist.md`
- Update in GitHub after acceptance: `docs/catalog/beta-progress.md`
- Update in GitHub after acceptance: `README.md`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: live Floot deployment URL and documented migration status.

- [ ] **Step 1: Run helper test suite**

Expected: all Floot helper tests pass.

- [ ] **Step 2: Run project typecheck**

Expected: no blocking syntax/runtime-contract errors.

- [ ] **Step 3: Execute browser smoke at 320x568**

Verify login, home, atlas, search, filters, genus card, child card, back navigation, no horizontal overflow.

Expected: pass.

- [ ] **Step 4: Execute browser smoke at 375x812**

Expected: pass.

- [ ] **Step 5: Execute browser smoke at 768x1024**

Expected: pass.

- [ ] **Step 6: Execute browser smoke at 1440x900**

Expected: pass.

- [ ] **Step 7: Exercise write flows**

Create one test observation with private image; create one catalog proposal; verify unauthorized review is blocked; verify authorized review flow.

Expected: all pass and exact coordinates remain private.

- [ ] **Step 8: Verify review-focus failures**

Test:
- expired/anonymous auth;
- DB error/degraded catalog;
- upload failure;
- malformed deep link;
- Commons/Open-Meteo timeout.

Expected: all fail safely with explicit degraded/error UI.

- [ ] **Step 9: Check publish status**

Call Floot publish status.

Expected: project is not yet live, or current live URL is identified before replacement.

- [ ] **Step 10: Publish to a Floot subdomain**

Publish only the verified state.

Expected: Floot returns a live production URL.

- [ ] **Step 11: Poll publish job to completion**

Expected: status becomes live.

- [ ] **Step 12: Run post-publish smoke against production**

Verify:
- login/logout;
- home;
- atlas;
- one genus and one taxon;
- forecast degraded/live behavior;
- observation creation;
- media resolver;
- no reviewNeeded leak.

Expected: pass.

- [ ] **Step 13: Document release**

Update GitHub beta progress and README with:
- Floot migration completed;
- live URL;
- acceptance test summary;
- original Cloudflare/OpenAI Sites implementation retained as rollback reference.

Expected: GitHub docs accurately reflect production state.

- [ ] **Step 14: Create final checkpoint**

Checkpoint title: `Floot beta published and verified`.
