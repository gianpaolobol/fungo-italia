# Owner internal beta implementation plan

> Execute inline using superpowers:executing-plans; review the whole change before push.

Goal: publish an owner-only TestFlight beta with the owner's real declaration and all native checks successful.
Architecture: immutable scientific snapshot + owner beta policy, separate from independent App Store readiness.
Stack: existing Node ESM scripts, GitHub Actions, EAS production-derived consolidated-beta, Apple API.
Spec: docs/superpowers/specs/2026-10-26-owner-internal-beta-design.md

## Constraints and review focus
- Owner review is not independent. Never change scientific approval flags or fabricate qualifications.
- Changed/missing/extra scientific files or images, changed gaps or broadened audience must fail.
- Toxicology structural errors block even when the owner approved a snapshot.
- All exact-source native/UI/demo workflows must pass. No public web promotion for owner beta.
- A VALID binary alone is insufficient: account holder group and actual internal beta state must be read back.

## Task 1: Science policy and declaration
- [ ] Add failing tests for missing/wrong declaration, hashes, gaps, errors, audience and scope.
- [ ] Implement scripts/internal-beta-science.mjs and tests; add pinned declaration under revisione/.
- [ ] Snapshot all tracked scientific data/reference/course images and known current gaps/warnings. Keep strict validators unchanged.
- [ ] Run dedicated/full Node tests, regeneration and TypeScript.

## Task 2: Pipeline and receipt boundaries
- [ ] Add tests that a receipt requires a matching owner science report and retains pending independent status.
- [ ] Integrate beta gate, preserve all reports, repeat before signing and bind source receipt.
- [ ] Prevent public web promotion for owner beta; retain strict checks in other production paths.
- [ ] Run regression suite; review full diff; commit/push with expected main SHA.

## Task 3: Build and verify
- [ ] Monitor native iPhone/iPad, StoreKit, demo and source checks; diagnose/fix actual failures.
- [ ] EAS production-derived build, upload, account-holder group assignment and actual beta-state readback.
- [ ] Preserve run/job logs and signed/Apple receipts; report source SHA/build and real availability.
