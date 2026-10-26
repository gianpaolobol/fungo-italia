# Paired Web / internal TestFlight release

This procedure implements the owner mandate of 26 October 2026. A successful commit or workflow alone is not delivery proof.

## Distribution scopes

| Scope | Required authority | Required technical evidence |
|---|---|---|
| Owner internal beta | Existing pinned owner review, unchanged scientific snapshot | Same-source native/UI/demo success, signed IPA source, Apple VALID + IN_BETA_TESTING, sole owner group |
| Public educational demo beta | A separate approved declaration for the exact new source/artifact/IPA/native receipt | All internal evidence, immutable original web ZIP, every file hash, live Apple/audience readback, PWA upgrade |
| Definitive App Store | Actual independent scientific readiness and distinct authorization | All production checks and explicit App Store submission authority |

The owner internal science declaration remains `publicWebAllowed=false`; no source field is promoted to independently reviewed. The public beta declaration is a distribution authorization only. No declaration for build21 authorizes a newer source.

## One application source

`consolidated-testflight.yml` generates the original web candidate and iOS binary from `github.sha`. `consolidated-evidence.mjs` requires actual successful push/main native StoreKit, purchase UI iPhone/iPad and demo iPhone/iPad runs on that SHA. The source proof binds the web content hash and icon; the signed receipt adds IPA SHA-256, build/version and producer run ID. Native embedded Expo source must match before upload; Apple processing, actual beta state and exclusive owner audience are read back.

The ordinary independent-readiness gate stays in place. The separate manual `promote-paired-demo.yml` has no automatic public trigger and requires a tracked declaration at `revisione/public-demo-authorizations/<full-source-sha>.json` plus its canonical SHA-256. **An approved declaration requires an actual applicable public-distribution confirmation from the owner; never invent approval, scope, or date.** Bind the confirmed scope to the concrete candidate only after its required proofs exist. A pending document cannot publish. The current executive handoff requires a distinct explicit authorization for the new public snapshot; the earlier build21 confirmation cannot supply that approval. Technical work and owner-only TestFlight delivery are already authorized.

An authorization binds source/version/build, icon/web/IPA hashes, Apple build ID, original producer and web artifact IDs/ZIP SHA-256, native proof run IDs, scientific content digest/file count and pinned owner review digest. Fields required by `tools/paired-demo-policy.mjs` also keep `certified=false`, `independentReviewComplete=false`, `appStoreReady=false`, `externalTestFlightAllowed=false`. `confirmation` quotes the owner's actual approval. `approvedAt` records the actual owner authorization time for this qualified immutable snapshot; do not substitute a tooling or recording timestamp for the human decision. Its canonical digest is SHA-256 of `JSON.stringify(parsedAuthorization)`.

## Promotion

1. Finish the paired producer, preserve its `Consolidated-TestFlight-evidence`, `Consolidated-signed-IPA` and `Paired-web-candidate` artifacts. Record exact source/build/hash and real Apple state. Do not borrow a different source's receipts.
2. Prepare the exact candidate declaration only after all authorized internal delivery work and concrete proofs are ready; obtain the distinct new public approval required by the current handoff. Technical authorization to build or internal scientific review alone is insufficient. Record the real confirmation and bind it to the qualified source/build/hashes without reusing the old build21 record.
3. Commit approved declaration and publisher-only documentation/tooling after the signed source. Any application/runtime/data change requires a new paired build. The publisher rejects incomplete GitHub comparisons and any changed app file or rename.
4. Manually dispatch `promote-paired-demo.yml` on main with `source_commit` and `authorization_sha256`. The publisher validates original artifact metadata and full ZIP before extraction, then every file against the manifest. It rechecks current science, the original successful producer/source/beta jobs, exact-source native runs, live Apple version/build/state, group and absence of individual testers. Main must still equal the orchestrator SHA at the end of live verification.
5. Chromium and WebKit capture the actual old PWA with private synthetic notes/favorites and an exam checkpoint/history created through the real UI. Archive every previous served byte and original receipt as `Paired-previous-web-rollback-snapshot` before deployment. No device/user storage is cleared.
6. Repeat final source and Apple checks immediately before Pages deployment. Verify the deployed receipt, metadata and every published byte with cache-bypassing requests and no redirects. Test actual worker activation through the update button, exact app script/icon, 71 Areas, exam resume, notes/favorites/history and offline reload in both engines. Retain reports/screenshots and new receipt for90days.
7. A failure after deployment is a real failed verification, even if Pages deployed. Record it explicitly; do not claim alignment until fixed and reverified.

## Rollback preserving alignment and user data

Never restore only an old web snapshot while keeping a newer iOS application, and never treat an OTA as a native resource rollback. The archive is the verified previous web/receipt source for investigation and recovery, not a bypass of current authorization or Apple gates.

For a functional rollback, create a new main commit that selectively reverts the faulty application change while retaining current storage keys/schema and all release guards. Keep version migration compatible with both saved checkpoints and history; add a synthetic previous-state fixture if data shape changed. Run the complete paired pipeline on the new revert SHA, obtain a new signed iOS build and actual owner-only Apple receipt, and obtain an explicit public demo authorization for that revert candidate. Promote both through the same verified process. No local-storage clearing, IndexedDB deletion, progress overwrite, destructive migration or reinstall is part of rollback. On-device downgrade availability is controlled by Apple; do not claim an automatic iOS rollback.

## Current limits

A distinct new public candidate approval is still pending under the executive handoff; the earlier build21 confirmation is historical. No physical iPhone Home Screen icon/state has been inspected by these browser tests. Real native/iPhone/iPad, PWA upgrade and rollback execution must be reported from their actual artifacts; this runbook and passing policy tests do not establish that delivery occurred.

## Qualified internal candidate —26 October2026

Applicationfab2b3eb5724b92b74ad3ed0e76ad2094ea2fd03 is actually available as1.1.0(22) in owner-only TestFlight, AppleVALID/IN_BETA_TESTING at23:18:33UTC. Original producer40414345353 succeeded; webcandidate12695390804 is the matching original artifact. [Actual receipts, integrity and remaining checks](evidence/paired-release-fab2b3e-20261026/README.md). The exact new public declaration is pending; this runbook is not approval. Additional native map recovery audit40418678224 remains running. No public delivery or remote upgrade is yet claimed.
