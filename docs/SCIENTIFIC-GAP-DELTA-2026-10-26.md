# Scientific validation — measured delta (26 October 2026)

Source: [GitHub Actions run 40283979615](https://github.com/gianpaolobol/fungo-italia/actions/runs/40283979615), job `compare-gaps` on the PR branch.

| Blocking gap | Baseline main | After regenerated evidence | Change |
|---|---:|---:|---:|
| Missing habitat | 118 | 113 | -5 |
| Missing lookalikes | 103 | 98 | -5 |
| Habitat lacking pointwise evidence | 115 | 110 | -5 |
| Incomplete reference image sets | 5 | 5 | 0 |
| Independent review not attested | 148 | 148 | 0 |

All 148 checked records matched the S1 curriculum registry (`unmatchedCurriculum: 0`). `npm run prepare:data`, source propagation assertion, gap export, delta check and artifact upload succeeded. **Strict release readiness failed as designed**, because real evidence/review blockers remain. The baseline/after comparison does not mean the taxonomic or medical content was independently verified.

Related generator run: [40283979611](https://github.com/gianpaolobol/fungo-italia/actions/runs/40283979611), `generator` and `technical-provenance` passed when checked; browser job was still running.

## Next independently verifiable work
1. Use the uploaded `scientific-gap-register.csv` grouped by S1 source page and objective level; prioritize admitted deadly-poisonous taxa. Record field-level source locations and exact claim text, preserving the original rank and group ambiguities.
2. Address the five missing image sets only with subject/rights/view/author provenance; do not invent or reuse another taxon's images.
3. Obtain genuine independent micologist reviews, with identity, date, scope and verdict. Do not synthesize reviewer attestations or auto-approve the remaining 148 records.
4. Repeat delta CI and strict gate on a single SHA. Only after strict pass may production signing/upload be considered, followed by iPhone/iPad StoreKit tests and Apple/TestFlight audit.

Release status: **BLOCKED**.