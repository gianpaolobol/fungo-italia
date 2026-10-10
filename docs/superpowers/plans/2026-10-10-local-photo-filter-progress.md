# Local photo filter progress

Implementation published on main. TestFlight iOS 1.0.0 (5) is VALID and Testing in the existing internal group Proprietario — prova iPhone (one tester). Italian test notes updated and verified. EAS build 8c713f27-d793-4000-b0d3-41aeff01f857 and submission e3e978c0-b4c3-4342-96ab-7648b206bd96 succeeded; runtime 9d5f0a507eaa68f99fc6794a7f063631362c38f8.

Validation: TypeScript clean; 72 Node tests passed; iOS bundle export passed; Expo autolinking finds FungoPhotoFilter; Xcode archive compiled successfully. Apple Vision macOS diagnostic found the mushroom class and selected 5/5 existing atlas images (scores 0.59–0.96). This small positive-only test does not establish iPhone accuracy, false-positive rates, species identity or edibility. Real-device mixed-photo and pause/relaunch testing is still required with the owner.

Fresh final review identified five issues, all addressed: strip Expo ph:// identifier before PhotoKit lookup; replace getUri previews with native local-only 160-point previews; persist immutable metadata-only manifest before processing; expose archived batches for editing/confirmation; create stable per-photo observations so incremental confirmation never truncates/drops selected images.

The first EAS build (4) omitted module Swift files because unanchored ios/ gitignore rules excluded nested module folders. Fixed by anchoring /ios/ and /android/ to generated root projects. Packaging regression verifies native module upload eligibility and generated-project exclusions. Replacement build (5) compiled and uploaded successfully.

Regression tests for immutable traversal and full/incremental confirmation failed before implementation and pass after it. Batch limit, sequential operation, pause/resume, disk failure, classification error, missing fungal class, corrupt checkpoint and packaging covered.

Ruling: use one observation per confirmed photo — existing 3+1 grouping truncates at eight and merge preserves existing IDs; individual stable IDs avoid loss. Cost: related images need association in a later workflow.

Ruling: macOS classification smoke is diagnostic only — it exercises Apple Vision, while the owner's iPhone must validate PhotoKit permissions, real photographs and device behavior. Cost if treated as device accuracy: missed images or false positives could be overlooked.

Backup branch backup/main-pre-beta-publish-20261009 remains unchanged at 277466878a64f6c49eecb691ecd9c6fb595ef41a. No cloud classifier or photo/GPS upload added. Build and diagnostic workflows are manual after their initial runs.
