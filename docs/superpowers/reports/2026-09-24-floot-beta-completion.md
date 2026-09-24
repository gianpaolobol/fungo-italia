# Floot beta completion report — 2026-09-24

## Production

- Floot project: `Fungo Italia`
- Floot project id: `99184b41-e319-4281-a5bb-bbb5a52edc99`
- Production URL: https://fungo-italia.floot.app
- Publication status: live
- GitHub source branch kept isolated: `feat/floot-migration`
- Original `main` remains the rollback/reference implementation.

## Implemented migration scope

1. Read-only atlas baseline with the verified corpus:
   - 148 Minimo cards
   - 66 genus/group cards
   - 214 searchable documents
   - source/current nomenclature mapping preserved
   - progressive learning depth and genus→child→genus navigation preserved
2. Floot Auth + managed Postgres.
3. Scientific publication gate:
   - unpublished `reviewNeeded` morphology/ecology/safety/confusion prose is not carried into the public migration bundle
   - safety content remains subject to the strict approval rule
4. Authenticated catalog endpoint with fail-closed anonymous behavior.
5. National territorial forecast:
   - 45 aggregate areas
   - Open-Meteo integration
   - safe degraded/partial behavior
   - no personal collection coordinates exposed
6. Wikimedia Commons media:
   - license compatibility filtering
   - taxon metadata matching
   - attribution/source display
7. Observation flow:
   - private direct-to-storage photo uploads
   - JPEG/PNG/WebP only
   - 12 MB/photo, max 6 photos
   - exact coordinates private
   - public coordinates aggregated to a 0.2° cell
8. Scientific proposal/review workflow:
   - author cannot review own proposal
   - normal/high changes require a qualified independent reviewer
   - critical changes require independent mycologist then scientific curator
   - active regional/taxonomic grants are enforced server-side
   - versioned beta release registry
9. Scientific administration:
   - one-time curator bootstrap code
   - server-side role assignment for registered users
   - optional regional and taxonomic scopes
10. Rapid field-recognition layer (`Colpo d’occhio`) for taxa, genera and teaching groups:\n   - 2–4 Commons reference images\n   - exactly 3 key characters\n   - optional fourth differentiating character\n   - habitat and ecological role\n   - up to 3 principal lookalikes\n   - public visibility only after the scientific workflow publishes the quick-recognition proposal\n11. Responsive navigation and dedicated pages for Atlas, Observations and Proposals.

## Verification

- Jasmine helper suite: 10 spec files passed, 0 failed.
- TypeScript typecheck: clean.
- Anonymous endpoint smoke test: catalog, forecast, media, proposals, curator bootstrap, role grant and write endpoints return 401 and do not expose private/editorial data.
- Production publish completed successfully according to Floot publish status.
- Automated screenshot capture could not run because no Floot preview/editor window was open during QA; this does not block the production deployment.

## Scientific-safety ruling

The Floot public migration is intentionally stricter than the original private-beta source: review-needed descriptive and safety prose is omitted from the public bundle rather than merely hidden at render time. Identity, training resolution, nomenclature, source links and approved workflow data remain available. This prevents accidental scientific leakage during the migration.

## First-use procedure

1. Register the first real beta account through Floot Auth.
2. Open the Proposals page and use the one-time curator bootstrap code supplied privately to the project owner.
3. Register additional reviewer accounts and assign `mycologist` / `scientific_curator` roles with optional scopes.
4. Critical proposals remain blocked until the independent mycologist and curator stages are both satisfied.

No client-provided role is trusted by the server.
