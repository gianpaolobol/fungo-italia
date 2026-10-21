# Agaricus demo and single annual implementation plan

Goal: align initial iOS 1.0 resubmission to free Agaricus demo and one EUR19.99 annual, with no permanent Base product.
Architecture: preserve existing main annual StoreKit verification; filter demo in a shared policy, parameterize photographic training size, isolate demo storage. No new dependency or entitlement bypass. The 1.1 Dashboard branch remains separate and must later adopt this policy before release.
Spec: user-approved design in conversation, 21 October 2026: eight Agaricus educational profiles (seven catalog entries and genus), four photographed species, repeatable demo training, all content and tests with annual; retain local progress at expiry.

## Review focus
- Demo cannot restore paid sessions or expose paid autocomplete choices.
- Small demo must complete/retry/restore with four distinct cases; full exam stays fifteen.
- Expiry cannot delete paid history or unlock paid Areas.
- Public screenshots cannot contain prices; private IAP screenshot remains intact.
- Apple submission cannot use 1.1 build13 or claim failed StoreKit UI passed.

## Tasks
- [x] 1. Add real-data regression tests for demo selection and short training/restore/retry; observe failure, implement lib/demo-policy.mjs and optional training count, run exam suite.
- [x] 2. Wire App.tsx, PhotoExam.tsx and SubscriptionGate.tsx to Agaricus demo, isolated storage and annual-only access. Preserve verified annual logic; run typecheck, relevant source tests and iOS export.
- [x] 3. Update store/it-IT.json, annual price configuration, public screenshot manifest/uploader exclusions and review notes; validate script syntax and public/private screenshot separation.
- [ ] 4. Publish PR112, execute scoped Apple corrections and fresh native/UI checks on candidate. Build/upload only under verified release gates; attach annual and group to submission, read back every state. Record explicit blockers rather than submitting diagnostic beta.

Execution: inline, authorized by user instruction to proceed and align everything for Apple. No further scope approval required.
