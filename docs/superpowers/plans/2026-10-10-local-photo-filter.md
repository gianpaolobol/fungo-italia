# Local photo filter implementation plan

Goal: implement the approved private, bounded photo filtering flow.
Architecture: native Apple Vision classifier, TypeScript batch/checkpoint engine, existing PhotoLibrary review UI and 3+1 store.
Spec: docs/superpowers/specs/2026-10-10-local-photo-filter.md
Execution: inline, already requested by the user.

Constraints: <=20 sequential images per batch; no outbound image/GPS transfer; no species/food inference; preserve existing reviews and backup branch.
Review focus: iCloud unavailable; permission limited/revoked; classifier labels absent; pause during work; persistence failure/relaunch.

1. Add failing tests for batch limits, classification decisions, interrupted resumption and persistence failures; implement src/photoScan.ts.
2. Add local Expo Swift module PhotoKit + Apple Vision with bounded thumbnail retrieval and honest supported-label checks; verify autolinking.
3. Replace PhotoLibrary full-library scan with one-batch UI, resume/pause/background cancellation and manual confirmation into existing 3+1 store; typecheck, all tests and catalog validation.
4. Commit main, build/submit a new iOS binary using existing credentials, verify build logs and Apple readiness; add to the existing internal group when Apple processing completes. Test positive/negative personal photo batches with the user; no claim of device accuracy before that.
