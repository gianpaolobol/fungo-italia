# Paired release — technical checkpoint

Application source: `fab2b3eb5724b92b74ad3ed0e76ad2094ea2fd03`.

All mandatory source, native StoreKit, purchase UI and free-demo checks passed on this exact main SHA. Source includes 299 Node tests, TypeScript, deterministic catalog, iOS export, web build, 65 WebKit and65 Chromium cases, and both shared-app/offline smokes. No scientific data or review fields changed. Independent readiness remains false; pinned owner review permits only the internal beta.

The original source receipt is retained byte-for-byte as source-proof.json, ZIP artifact12695513286, SHA-256782dbb9f9d8a8a2c9344433140ce4645d2c39d1e013b8e12fa0374fb7ccf0ef8; original JSON SHA-256fffaff068c4095d1f1f54dabeea5b4e1df9811fa9e6943b9f64ad1417ac497f1. status.json links the original immutable web candidate and actual proof runs. UI suites each passed both required functional tests; their existing opt-in entitlement startup diagnostic is explicitly skipped by design, and is not claimed as tested.

[Producer40414345353](https://github.com/gianpaolobol/fungo-italia/actions/runs/40414345353) is building/signing the new internal beta. No new IPA, Apple availability, public deployment or public upgrade is yet attested by this checkpoint. Additional same-application-source iPhone/iPad map/filter audit40415217045 remains running. The prior available builds remain historical21 on TestFlight and19 on web until new receipts prove otherwise.

Main must remain frozen through upload and actual Apple verification. This checkpoint branch does not advance main. A distinct explicit authorization for the new concrete public candidate remains required by the executive handoff; old21 consent is not reused. No App Store or external TestFlight distribution.
