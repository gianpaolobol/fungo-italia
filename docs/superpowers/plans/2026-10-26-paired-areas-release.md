# Paired Areas release implementation plan

Goal: deliver the shared Areas correction to owner-only TestFlight and prepare an immutable, separately authorized web promotion.
Spec: executive handoff of 26 October 2026 in this session.
Architecture: preserve the existing consolidated pipeline and independent scientific gate. Fix obsolete browser/native expectations, strengthen same-source proof, then bind a distinct public demo authorization to the resulting exact candidate. No authorization is inferred for the new public snapshot.
Execution: inline, autonomous, as explicitly requested. Fresh clone on fix/paired-areas-release-20261026; no shared checkout overwritten.

## Global constraints
- No scientific data changes or invented review; owner-only beta; no App Store submission.
- Web promotion only after actual Apple VALID/IN_BETA_TESTING, exact hashes and distinct public authorization.
- Preserve all local state and StoreKit purchase/restore/refund/expiry assertions.

## Review focus
- Stale UI tests expecting paywall on Areas.
- Changed or cancelled native proofs cannot authorize release.
- Main advancing during a build must block stale promotion.
- Public authorization cannot be reused from build 21.
- Upgrade and rollback must preserve private drafts and study/exam storage.

## Task 1 — unblock and verify Areas
- [ ] Reproduce obsolete smoke failure (CI 40400178249, job 121844006651).
- [ ] Update web smoke for 71 areas, habitat details, search, region and map, both engines.
- [ ] Update native free/purchased paths to assert Areas without opening subscription; retain billing tests.
- [ ] Run deterministic regeneration, Node, TypeScript, web build and both browser suites.
- [ ] Commit, push through authenticated connector and run exact-source CI.

## Task 2 — paired TestFlight
- [ ] Require successful native/iPhone/iPad proofs from same SHA.
- [ ] Build signed IPA, verify embedded source, submit, verify owner-only Apple availability.
- [ ] Preserve receipt and immutable candidate; record source/build/hash, without reusing build21 proof.

## Task 3 — public demo promotion and rollback
- [ ] Prepare generalized publisher with a pinned, explicit authorization for the exact immutable release.
- [ ] Verify original artifact ZIP, every file, native receipt, live Apple state and audience.
- [ ] Prepare real Chromium/WebKit PWA capture/upgrade with storage preservation.
- [ ] Prepare the exact qualified public candidate, then obtain the distinct explicit approval required by this executive handoff.
- [ ] After authorization deploy, verify served bytes and PWA; retain previous receipt/artifact for verified rollback.

## Ledger
- Diagnosis: browser smoke line24 and native free demo expected the old paid Areas gate. Shared App.tsx already renders Areas independently of billing.
- Scope: this handoff conditions new public promotion on a separate explicit authorization; the build21 authorization is insufficient.

- Technical review found tile visibility insufficient; now decoded pixels required. Existing sentinel no longer recreated on reload.
- Preserved parallel main cc9730e attribution correction; its source CI reproduced initScript storage access inside isolated map, fixed via top-level-only seed with real browser RED→GREEN regression.
- Generic publisher prepared with explicit per-snapshot approval, successful producer/native/Apple readbacks, end-of-proof main guard, full previous web archive and real exam/PWA state checks. No approved public declaration exists.

- The historical «confermo» supported demo21. The later executive handoff requires distinct approval for the new public snapshot; complete authorized technical/internal work first. No new approval record, signature or independent certification inferred.
- Browser upgrade now also requires aligned release text and absence of the obsolete TestFlight mismatch card in both engines; final live execution pending.

- Real WebKit origin shutdown uncovered a production bootstrap unhandled automatic update rejection. Actual generated-runtime VM regression RED1/GREEN3; fixed reg.update rejection only, no browser error filtering. All299 Node tests and TypeScript pass locally. New container preflight40413648238 pending; main remains cc2 until final execution proof.
