# Fungo Italia Beta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a registration-gated, Italy-wide mushroom-search web beta with privacy-preserving area recommendations, a multilingual taxonomy atlas, and verified observation intake.

**Architecture:** Vinext/Next server and client components provide the working surface. D1 stores structured product data and R2 stores observation photos; dispatch-owned ChatGPT sign-in supplies user identity. A lightweight SVG/cartographic surface provides a reliable Italy overview in the first deploy while the area model remains compatible with a later MapLibre/OpenStreetMap renderer.

**Tech Stack:** Vinext, React 19, TypeScript, Tailwind CSS, Shadcn primitives, Drizzle ORM, Cloudflare D1/R2, Sites SIWC.

**Spec:** `docs/design.md`

## Global Constraints

- Registration is required.
- Coverage is Italy-wide from launch.
- No exact outing routes or personal collecting spots are public.
- Visits are delayed, anonymous, and aggregated into broad areas.
- No user-managed map layer stack.
- Scientific, national common, regional/local, and historical names remain distinct.
- Edibility follows the Regione Piemonte reasoned guide and never authorizes consumption.

---

### Task 1: Domain model and deterministic recommendation logic

**Files:**
- Create: `lib/domain.ts`
- Create: `lib/domain.test.ts`
- Modify: `db/schema.ts`

**Interfaces:**
- Produces: `Area`, `Taxon`, `Recommendation`, `scoreArea(area)` and database tables for users, taxa, names, areas, visits, observations, photos, assignments, and reviews.

- [ ] Write tests that require privacy-safe visit bands, bounded recommendation scores, and taxon display labels.
- [ ] Run the tests and verify they fail because the domain module is absent.
- [ ] Implement the minimum typed domain logic and schema.
- [ ] Run tests and verify they pass.

### Task 2: Registration-gated product surface

**Files:**
- Modify: `app/page.tsx`
- Create: `app/explore-client.tsx`
- Create: `lib/seed-data.ts`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `public/favicon.svg`

**Interfaces:**
- Consumes: `Area`, `Taxon`, and `scoreArea` from Task 1.
- Produces: responsive list/map workspace, filters, area details, atlas tab, and sign-in-aware header.

- [ ] Write component-facing data assertions for the representative national dataset.
- [ ] Verify the assertions fail before seed data exists.
- [ ] Implement the dataset and product surface with real interactions.
- [ ] Verify type checking and tests pass.

### Task 3: Observation and verification workflow

**Files:**
- Create: `app/api/observations/route.ts`
- Create: `app/observations/new/page.tsx`
- Create: `app/observations/new/observation-form.tsx`
- Create: `lib/observation.ts`
- Create: `lib/observation.test.ts`

**Interfaces:**
- Consumes: authenticated user identity, D1 `DB`, and R2 `UPLOADS`.
- Produces: validated observation submission with private coordinates, public aggregation, photo metadata, and pending-review status.

- [ ] Write tests for coordinate validation, public coordinate aggregation, and required evidence.
- [ ] Verify tests fail before implementation.
- [ ] Implement validation and the protected form/API boundary.
- [ ] Verify tests and build pass.

### Task 4: Database migration, agent tools, and deployment

**Files:**
- Generate: `drizzle/*.sql`
- Create: `app/webmcp.tsx`
- Modify: `app/explore-client.tsx`

**Interfaces:**
- Consumes: completed application and schema.
- Produces: deployable migration and page-scoped tools for reading recommendations and selecting an area.

- [ ] Generate and inspect the D1 migration.
- [ ] Add tools that reuse visible selection/filter actions without hidden side effects.
- [ ] Run all tests and the production build.
- [ ] Commit, package, save, deploy privately, and verify the terminal deployment status.

