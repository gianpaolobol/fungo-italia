# Branch consolidation implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development to execute these tasks without repeating user approvals already supplied for main push and TestFlight.

**Goal:** Select useful work from all 168 remote branches and consolidate one annual-only learning app on main, then prepare an exactly aligned TestFlight candidate.

**Architecture:** Main remains the integration base. Select recovery112, learning107, icon106 and qualified historical audit111; do not merge obsolete billing or replay workflows.

**Tech Stack:** Expo58, TypeScript, React Native, Node>=24.3, StoreKit2, GitHub Actions/EAS.

**Spec:** User decisions in this conversation: free download; full annual19.99EUR; repeatable free Agaricus demo; preserve history and verified Apple entitlements. Detailed selection in docs/audit/BRANCH-SELECTION-2026-10-21.md.

## Global Constraints
- Only it.fungoitalia.premium.annual grants full access; no Base prerequisite or local entitlement.
- Demo seven catalog Agaricus profiles plus one genus; four-case photographic training, unlimited retries.
- Keep paid progress after expiry and old bank history; no invented scientific classifications or permissions.
- Diagnostic TestFlight is separate from App Store submission. No automatic production OTA or App Store selection on main push.

## Review Focus
- Switching free/paid must preserve both histories and checkpoints.
- Old 89case photo history retains compatible evidence; removed cases do not become theory success.
- Four-case demo restore/retry and full15case simulation must both work.
- Failed writes must not overwrite persisted data.
- Workflow dispatch and source proof must refer to new exact source, never old build13 or failed-run replay.

### Task1: Learning integration
Files: App.tsx, components/PhotoExam.tsx, StudyDashboard/StudyMushroom/StudyTimeline, hooks/useStudy.ts, lib/study*, web/public/exam-core*, scripts/study-*.test.mjs, src/data/exam-bank.json, docs/STUDY-COVERAGE.md.
- [x] Port107 learning model and Dashboard onto112 annual-only app; remove Base/quota/preview paths.
- [x] Add tests for demo4/full15, isolation and old-bank compatible evidence migration. Run failures before fixes.
- [x] Regenerate86photo cases and336theory questions, preserving concrete provenance.
- [x] Run learning tests, full Node suite and TypeScript; fix relevant regressions.

### Task2: Audit and release integration
Files: docs/audit/*, workflow files, scripts/candidate*, store release records, README/AGENTS/HANDOFF.
- [x] Classify all168branches, document selected/rejected work and import111 audit with supersession corrections.
- [x] Preserve approved icon and112 correction artifacts; remove automatic production/submission chains for this release.
- [x] Add isolated exact-source diagnostic TestFlight workflow with truthful native/UI evidence and owner beta group only.
- [x] Verify workflow syntax, full source suite, iOS export and data regeneration.

### Task3: Review, main and TestFlight
- [ ] Independent whole diff review and fix high-impact findings.
- [ ] Create backup of previous main, commit selected tree and push main with lease through GitHub connector.
- [ ] Run new CI and native/UI checks on exact consolidated source; build/upload a diagnostic TestFlight with honest results and provenance.
- [ ] Read back Apple source/version/build/group; report precisely any remaining block. No App Store submission with unverified billing.
