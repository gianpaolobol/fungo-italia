# Release evidence — 2026-10-08

## Actual CI evidence
- Strict scientific run 37757254191: FAIL; 148/148 records blocked; 0 independently reviewed; 143/148 image triplets; 6/148 odors; 8/148 spore prints; 45/148 edibility fields. Do not label scientifically certified.
- PWA run 37757609965: 59 browser tests PASS, 2 FAIL. First failure: Chromium executable absent (CI now installs Chromium and WebKit; commit 87bbcf8). Second: public atlas test excludes founding-source identifiers/titles but generated data exposed 'Guida ragionata alla commestibilità'; requires provenance policy reconciliation without removing real scientific citations.
- Technical generator run 37752516602: PASS, but outputs were generated in runner, not committed to branch.
- No iPhone physical-device attestation. No independent mycological review.

## Scientific release blockers
1. Complete fields and evidence per 148 taxa.
2. Preserve distinct scientific evidence, internal founding documents and public source citations. No fabricated citations.
3. Complete toxicology association source audits and verify species-specific taxonomy.
4. Commit generated catalog and web assets, rerun strict release gate and browser tests, inspect deployed revision.
5. Independent qualified mycologist sign-off.

## Build provenance
GitHub artifact attestations can attest the source SHA and build provenance, but do not certify biological accuracy: https://docs.github.com/en/actions/concepts/security/artifact-attestations .

Decision: HOLD MERGE. CI green for technical compilation alone is not scientific release approval.
