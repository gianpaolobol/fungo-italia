# StoreKit iPhone investigation — 16 October 2026

Status: **initial iPhone verification is not fixed or release-approved**.
Base: `8bb2f0cc3165daca9103a2619e5d4b4878916de9`.

## Update — 17 October 2026, 07:31 UTC

This update supersedes the release/run status in the original report below.

- Main advanced independently to `2c077e74e43f398f25d2430ed8e202e5197d6111`, replacing `latest(for:)` with verified `currentEntitlements`. The diagnostic branch now incorporates that change; it must not restore the old verifier on merge.
- Native test `38914426911` retried successfully. The newer native run `38979804811` also passed for the changed verifier.
- Main UI run `38980636163` failed on both iPhone and iPad at the initial verification gate. The API substitution alone has not resolved the issue.
- Candidate run `38982998646` passed its native-evidence guard and uploaded **1.0.0 (11)**. Apple audit `38897130747`, refreshed 17 October 07:31 UTC, reports build `f15030a5-6079-4077-a09c-369431bd3547` as **VALID**, not expired. App Store version 1.0 remains PREPARE_FOR_SUBMISSION and still references build 7. VALID does not prove tester-group distribution or successful device testing.
- The PR's completed diagnostic run `38942792729` confirmed `enabled=false`, `hittable=true` on iPhone. Thus that failure was not an off-screen purchase button. Its app `Transaction.latest` entered without returning during the test. The separate runner lookup also exceeded its 30 s deadline and returned only during teardown; its different bundle identity means that is not an app authorization result.
- The retained service log shows concurrent unfinished-transaction and product-transaction queries, receipt synchronization, and `Did fail to synchronize due to missing response data`. A later `No active account` error belongs to the **UI runner bundle**, not the app; it must not be used to conclude the app needs an Apple login. These logs support a StoreKit service/client integration failure but do not establish that the app observer causes it.

### Controlled observer experiment

The separately named PR diagnostic workflow now runs two fresh iPhone jobs: **normal** and **disabled observer**. Both execute only `testColdLaunchEntitlementVerification`, without purchasing, prewarming via a runner-identity transaction query, or relaunching. The normal app retains the complete production observer. The disabled job temporarily replaces only the module's `OnCreate` listener block in its own runner checkout; it records the exact diff, base commit and observer mode in the artifact. The verifier, purchase implementation and UI authorization gate are identical between variants. No disabling flag or altered observer is saved to the production source or uploaded to Apple.

This tests a specific hypothesis: whether starting `Transaction.updates` while the initial entitlement query is running contributes to the receipt-sync stall. A passing disabled-observer trial alone is **not** release evidence, does not validate refunds or renewal handling, and is not sufficient for a production change. If both fail, the listener hypothesis is not supported by that comparison. Repeat a decisive comparison before attributing causality; separate CI hosts introduce environmental variability.

Local validation after incorporating main: TypeScript and six targeted tests passed. Workflow YAML parses, every shell block passes `bash -n`, and an explicit byte comparison confirms the temporary observer mutation leaves `OnDestroy`, bridge methods, verifier and purchase code unchanged. The new Swift cold-start test still requires macOS execution.

---

## Original evidence — 16 October

## Retrieved evidence

| Run | Result | What it proves |
| --- | --- | --- |
| [38913728976](https://github.com/gianpaolobol/fungo-italia/actions/runs/38913728976) | UI iPad PASS, iPhone FAIL | iPad completed one lifecycle test in 360.405 s. iPhone failed after 287.203 s, including a relaunch. |
| [38914204431, attempt 2](https://github.com/gianpaolobol/fungo-italia/actions/runs/38914204431/attempts/2) | Native PASS | Same Swift verifier on iPhone 16 Pro Max/iOS 18.6 completed one test in 247.937 s. React billing bootstrap is excluded in this hosted unit target. It does not validate the full app or purchase button. |
| [38914426911](https://github.com/gianpaolobol/fungo-italia/actions/runs/38914426911) | Originally CANCELLED; retry requested during investigation | This newer-created matching run blocked the candidate, despite the older run's later successful attempt. |
| [38918215801](https://github.com/gianpaolobol/fungo-italia/actions/runs/38918215801) | Candidate FAIL before compilation | Guard explicitly rejected `38914426911 cancelled`; no new IPA was built by this run. |

Both UI jobs selected Xcode 26.6, iOS 18.6 (22G86), the same fixture and the same test source. Their devices and runner instances differ: iPhone 16 Pro Max versus iPad Pro 13-inch M4. These are not controlled repeated trials establishing a device-specific Apple bug.

The downloaded iPhone artifact records:

- 14:38:08.317 UTC: current-entitlement lookup and product lookup enter.
- 14:38:08.635 UTC: product lookup returns.
- 14:40:20.919 UTC, after relaunch: current-entitlement lookup enters again.
- 14:40:21.045 UTC: the second product lookup returns.
- Neither entitlement lookup logs a return. The UI displays the actual Italian fixture price and `Abbonamento non verificabile. Riprova o ripristina gli acquisti.`
- The session's transaction list is empty. The misleading existing log name `STOREKIT_TEST_PRODUCTS []` refers to **transactions**, not a failed product-catalog lookup.

## Code path and limits of the conclusion

`useSubscription.refresh()` starts access and price requests independently. The bridge reaches `entitlement()` and awaits `verifiedEntitlement()`, whose only external suspension is `Transaction.latest(for: annualID)`. This bounds the stalled operation to the native verification path; the original logs do not contain an internal entry/return pair around `latest`, a task stack or StoreKit service diagnostics.

The JavaScript 20 s timeout rejects the UI wait, clears access and keeps `purchaseReady=false`. It does **not** cancel Swift/StoreKit. Restarting the app replaces the app process but does not reset the simulator's StoreKit service. The successful product request proves catalog availability, not completion of the transaction lookup. An empty local transaction history should produce nil from `latest(for:)`, not be treated as an alternative authorization signal.

The app's UI remains responsive and fail-closed. There is no evidence for a globally blocked main actor, nor enough evidence to attribute the suspension to MainActor isolation, Expo, missing Apple account, missing privacy/DSA data or the simulator service. In particular, the passing unit test also calls the verifier on MainActor. Removing actor isolation or replacing verification with an inactive default would be speculative.

A real StoreKit suspension appears in the complete app, so this cannot be dismissed as a test assertion error. Whether it also occurs on a physical iPhone in the sandbox is unverified. A separate test defect is established by inspection: `readyToTap` conflated `isEnabled` with `isHittable`, so an off-screen enabled control could produce the same assertion text. That ambiguity does not explain away the missing native completion logs.

## Applied diagnostic/test correction

- Keep the actual cold app launch and mandatory enabled-purchase assertion. Remove the ineffective automatic relaunch fallback.
- Wait for `exists && isEnabled` to identify gate completion. Scroll to reveal the enabled purchase control and assert hitability separately before tapping. No forced tap or changed premium state.
- On a failed initial gate, log `exists`, `isEnabled`, `isHittable` and probe the same product's `Transaction.latest` from the separate UI runner, with a 30 s diagnostic deadline. The probe runs **after** the cold-start failure, cannot warm the service before the assertion, and cannot make the original failed condition pass. It requires nil for the cleared fixture.
- Log entry and return immediately around the production verifier's `Transaction.latest`, without recording transaction identifiers or receipts.
- Preserve app logs on successful UI runs as well as failed runs, plus StoreKit service logs on failure.
- Use a separately named diagnostic workflow on pull requests with per-ref concurrency. It neither cancels main's UI run nor emits the production workflow name consumed by privileged release workflows. No native authorization logic, release eligibility rules, privacy answers or DSA declaration are changed.

The probe uses an unstructured task to avoid a structured task-group scope waiting forever for an uncooperative StoreKit operation after timeout. Cancellation is best effort; it is not a claim that StoreKit cancels internally. XCTest ends the failed test and the app is terminated by defer.

## Validation and decision procedure

1. Local checks: `npm ci`, `npm run prepare:data`, `npm run typecheck`, then `node --test scripts/subscription-policy.test.mjs scripts/store-config.test.mjs scripts/ios-native-linking.test.mjs`. At patch preparation: TypeScript PASS, six targeted tests PASS. Swift compilation and UI execution require the macOS Actions runner; Linux checks do not prove them.
2. Open the diagnostic PR. Its `Diagnose StoreKit cold-start verification` workflow now compiles two isolated iPhone observer variants and runs only the cold no-purchase test. Download both observer artifacts. Refund, expiry, cancellation and the actual purchase flow remain requirements of the separate production `Verify StoreKit purchase interface` workflow; the cold diagnostic does not validate them.
3. Interpret the new evidence:
   - Enabled but off-screen button: assertion/layout issue; scrolling addresses it, while native completion must still be present.
   - App lookup stalls and runner lookup also times out: cross-process local StoreKit service/fixture failure is supported. Preserve service logs and reproduce on a fresh simulator before changing app logic.
   - Runner returns nil but app lookup stalls: narrows the failure to the app client/integration path, not all StoreKit clients. The runner has a different application identity; a successful runner query does not prove that its StoreKit context matches the app context. It does not by itself prove an actor deadlock. Capture app stacks and compare an otherwise identical full React host before testing any actor/scheduling change.
   - App and runner finish: compare cold-run repetitions and production inputs before claiming stability.
4. Run physical-device TestFlight diagnostics: initial installation without a subscription, verified sandbox purchase, terminate/reopen, explicit Restore Purchases, background/foreground, cancellation while the paid interval remains valid, refund and expiration, and an unavailable-store scenario where purchase stays disabled and retry is available. Record device/iOS/build/source and results; do not infer these observations from unit tests. The current UI test name mentions restore but does not tap the explicit restore control.

## Resuming TestFlight without opening production

The candidate guard walks runs in creation order and stops at the first matching run whose inputs include Swift module, JS access integration, dependencies, Expo configuration, fixture and native test harness. Rerunning candidate 38918215801 immediately would encounter the same cancelled newer-created run. The older successful retry does not override that policy.

A retry of the cancelled native job has been requested. Only if run 38914426911 actually becomes successful, rerun the failed candidate job in run 38918215801. That builds the **original source revision**, not the diagnostic PR. The guard rechecks equivalence and must log `VERIFIED_NATIVE_STOREKIT_RUN`. A diagnostic PR changes Swift bytes (logging), so it needs new matching native evidence before any candidate of that PR's source can be eligible.

The candidate workflow retains `storekitUIVerified:false`, `testFlightOnly:true`, the source SHA and both evidence run IDs in its receipt. A signed/uploaded candidate is not proof of Apple VALID processing, testing on a physical phone, selection for App Store, or review approval. Check each separately. This PR must not be merged solely to trigger a production upload while the cold iPhone gate remains red.

Privacy questionnaire, DSA trader declaration, agreements, subscription submission and scientific release readiness remain separate requirements. No status changes in those systems were performed during this investigation.
