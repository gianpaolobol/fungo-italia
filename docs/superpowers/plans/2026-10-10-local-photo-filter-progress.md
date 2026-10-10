# Local photo filter progress

Tasks 1–3 implemented. Node tests: 71/71 pass. TypeScript clean. Expo autolinking finds FungoPhotoFilter. iOS bundle export verified separately. Swift binary compilation and device accuracy remain pending EAS/TestFlight.

Fresh final review identified five issues, all addressed: strip Expo ph:// identifier before PhotoKit lookup; replace getUri previews with native local-only 160-point previews; persist immutable metadata-only manifest before processing; expose archived batches for editing/confirmation; create stable per-photo observations so incremental confirmation never truncates/drops selected images.

Regression tests for immutable traversal and full/incremental confirmation failed before implementation and pass after it. Batch limit, sequential operation, pause/resume, disk failure, classification error, missing fungal class, corrupt checkpoint all covered.

Ruling: use one observation per confirmed photo — existing 3+1 grouping truncates at eight and merge preserves existing IDs; individual stable IDs avoid loss. Cost: related images require manual association in a later workflow.

Ruling: native Swift behavior requires EAS compilation and real-device validation — Linux cannot execute PhotoKit/Vision. Automated tests establish batch logic, not recognition accuracy.

Backup branch must remain unchanged. No cloud classifier or photo/GPS upload added.
