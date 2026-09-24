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
   - versioned beta release registry
9. Responsive navigation and dedicated pages for Atlas, Observations and Proposals.

## Verification

- Jasmine helper suite: 10 spec files passed, 0 failed.
- TypeScript typecheck: clean.
- Anonymous endpoint smoke test: catalog, forecast, media, proposals and all write endpoints return 401 and do not expose private/editorial data.
- Production publish completed successfully according to Floot publish status.
- Automated screenshot capture could not run because no Floot preview/editor window was open during QA; this does not block the production deployment.

## Scientific-safety ruling

The Floot public migration is intentionally stricter than the original private-beta source: review-needed descriptive and safety prose is omitted from the public bundle rather than merely hidden at render time. Identity, training resolution, nomenclature, source links and approved workflow data remain available. This prevents accidental scientific leakage during the migration.

## Remaining operational step

The first real beta users must register through Floot Auth. Scientific reviewer/curator roles are stored server-side and are not trusted from client input. Role assignment/bootstrap remains an operational administration step; critical scientific proposals cannot self-approve or bypass the independent-review sequence.
