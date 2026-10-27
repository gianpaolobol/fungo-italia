# iOS study alignment implementation plan

Goal: distribute the twelve approved web changes to the owner-only internal TestFlight group after the explicit web confirmation.
Architecture: preserve the old scientific declaration. Add a pinned current confirmation scoped to the exact already approved868-file snapshot; use the existing native receipt and workflow revalidation. Never assert independent review or App Store readiness.
Tech stack: existing Node24 / Expo / GitHub Actions / EAS.
Spec: user twelve-point mandate and subsequent Confermo after actual web delivery.

- [x] Test that the fresh confirmation accepts only the approved snapshot and owner group, rejects altered approval/scope/source/science and cannot authorize App Store/external testing.
- [x] Add narrowly scoped adapter to internal-beta-science while preserving legacy proof validation, negative strict diagnostics and receipt source identity.
- [x] Run complete Node suite, typecheck and deterministic data regeneration; review exact diff.
- [x] Commit confirmation, policy/tests and master. Reconcile current main/PR128, integrate with lease, run all native/StoreKit/UI/demo gates on the final source.
- [x] Verify actual signed IPA and Apple VALID/IN_BETA_TESTING owner audience. Preserve evidence and report real status, never a premature availability claim.

Review focus: changed scientific bytes, stale/cross-source receipt, broadened audience, lost saved data, web metadata incorrectly attributed to Apple. Existing workflow proves actual native source, audience and storage regressions. No OTA or App Store submission.
