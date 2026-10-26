# Owner review for internal TestFlight

The owner explicitly stated on 26 October 2026: «per ora attesto io come revisione e mi riservo di inviare ad altri revisori successivamente». This resolves the requested policy decision for an owner-only internal beta. It is an owner declaration, not an independent mycologist's attestation or a claim of professional certification.

Keep the independent release validator and toxicology strict checks unchanged. The beta gate runs and records them, rejects structural toxicology errors, validates a pinned owner declaration and scientific-content hashes, and permits only the exact documented outstanding gaps/warnings of the declared snapshot. New content, missing evidence, different audience, broadened approval or additional gaps fail closed. Owner review never sets independentReviewStatus to reviewed.

Approach: an explicit owner-only beta policy, rather than relabeling owner approval as independent or removing checks. Bind all tracked scientific dataset files and bundled reference/course photographs to the declared snapshot, including the full list and hashes. Keep the owner identity as a self-declared owner, without inventing mycological qualifications or a signature. Pin the declaration digest in the gate; any new declaration requires a reviewed policy change.

The paired source pipeline builds/tests both web candidates but owner-approved content does not promote public web. Native StoreKit, purchase UI and demo must all succeed on the exact main SHA. The signed receipt carries the beta scientific decision and explicitly appStoreReady=false. Revalidate science before signing and verify receipt/content identity before upload. Existing audience preflight and Apple readback require exactly the account-holder internal group, no individual testers, no other automatic audience, and actual internal beta availability.

App Store production paths require independent scientific and toxicology readiness. No App Store selection or submission is part of this task. No user-facing reviewer management, reviewer invitation, new photographs or food classifications are added.
