# CI delivery infrastructure repair

Goal: complete the same-source owner-only TestFlight and public non-certified demo without weakening any release gate.

Evidence: cc2a34d source producer40403907609 was canceled twice while119MB browser dependencies downloaded slowly from the Ubuntu Azure mirror. All StoreKit/native/iPhone/iPad suites on cc2a34d succeeded. Androidsmoke job121863189639 failed because it still expected the removed Areas paywall. No new signedIPA or Apple build was produced from those canceled source attempts.

Implementation: use the exact Playwright1.56.1 Noble image already qualified by existing webCI and actual capture preflight40408806282; keep all browser suites and lockfile version guard. Correct Android Areas assertions and retain paid-exam restrictions. Continue EAS production-derived signing, then upload that same hash-verified IPA with the proven Applealtool API-key transport; no EAS submission is created or canceled. Keep all pre/post-sign source, science, native, owner-audience and actual Apple availability gates. Retain redacted uploader log and clean temporary keys.

Validation before integration:299 Node tests,0 failures/skips; TypeScript; deterministic data; Python,JS,YAML and bash syntax; narrow transport mutation tests and separate technical review. The new exact source must run all native/browser/Android checks again before signing. Earlier cc2 proofs are history, not future qualifications.

No App Store release or independent mycological certification is authorized. Scientific snapshot remains867 files with the same owner review digest. Public distribution scope has been confirmed in the active session; bind it to the actual qualified candidate only after Apple owner-only IN_BETA_TESTING is confirmed.

Attempt3 reached both65-test suites andChromium unifiedPASS, thenWebKit page.reload defaultload failed with an internal engine error. A DOM-ready reload hypothesis is under actual container diagnostic, including persistent public PWA offline checkpoint/history preservation. Do not infer a pass before that diagnostic completes.
