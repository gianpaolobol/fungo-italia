# Selezione dei branch — 21 ottobre 2026

Base immutable: `6aa68489c7b29582be6bcddae56f2a46fb29d10e`. Inventario completo: [JSON dei 168 branch](branch-inventory-2026-10-21.json). 120 tip già antenati di main; 48 tip confrontati per patch, blob, percorsi spostati in legacy e contenuto utile.

## Scelte per il consolidamento

| Origine | Decisione |
|---|---|
| PR112 | Annuale unico19,99€, download gratuito, tutte le schede Agaricus e test4casi ripetibile; mantenere verifica StoreKit reale. |
| PR107 | Dashboard a fungo, progressi/storico/ripasso adattivo,86casi fotografici e336domande teoriche. Adattamento a annuale/demo, senza Base/quote. |
| PR106 | Icona approvata dal titolare, nuovo binario richiesto. |
| PR111 | Audit storico con note di correzione: vecchi prezzi, diritti non verificati indipendentemente, ipotesi StoreKit, ricerca prefisso. |
| Altri branch | Nessun merge cieco: parti equivalenti/superate lasciate fuori, prototipi e candidati fotografici conservati nei rispettivi branch. Nessuna cancellazione. |

## Distribuzione

Main contiene il nuovo prodotto; TestFlight deve essere costruito dallo stesso SHA e canale `consolidated-beta`. Il candidato è diagnostico: riporta gli esiti effettivi delle nuove prove native/UI, non seleziona una versione App Store e non attesta preparazione scientifica. Richiede demo UI riuscita e prove native/UI completate sullo stesso SHA; una loro eventuale failure rimane esplicita. Le pipeline verificate di produzione restano separate. Disattivati gli automatismi main→produzione OTA, upload/sele­zione App Store e doppio deploy Pages; controlli automatici conservati.

La generazione del dataset deve essere ripetibile. Il commit di export canonico resta quello documentato se i checksum delle fonti non cambiano; un nuovo run CI non deve inventare una diversa origine dei medesimi byte.

## Limiti da preservare

Revisione micologica indipendente pendente, diritti delle immagini da verificare puntualmente; nessuna classificazione scientifica cambiata per inferenza. Le immagini candidate nei branch research non sono contenuto approvato da importare in blocco. Dashboard stima didattica, non garanzia di superamento dell’esame.

---

# Remaining branch audit — 2026-10-21

Read-only review of all 48 nonancestor tips in branch-inventory-2026-10-21.json against immutable main 6aa68489c7b29582be6bcddae56f2a46fb29d10e. No repository edits, merges, pushes, workflow dispatches, or Apple writes performed.

Method: git cherry patch-ID comparison; merge-base changed-path inventory; exact blob comparison against main paths and legacy/web relocated paths; targeted source/workflow diffs; media blob matching across the entire main tree. Except schede-summary (2), no unmatched branch has an equivalent commit patch-ID on main. This does not prove missing functionality: relocation, squashes, and evolved implementations change patch IDs. Counts below describe branch payload relative to its merge base, not files proposed for addition.

The Expo migration aca2af5 relocated the earlier app into legacy/web. The handoff explicitly retains that directory in the generated-data provenance chain. Therefore old feature branches must be checked against legacy paths, not classified solely by absent root paths.

Research photos remain pending visual review in acquisition indexes. Exact media blob reuse proves selected bytes reached main; it does not validate every unselected candidate or all licensing/taxon assertions. Preserve branches as research archives. No bulk candidate/media merge is recommended.

## audit/claude-full-review-20261021

- Tip: `88c3597725f193e5d42316b6a76a643f95ebf776`; 6 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **KEEP AUDIT, RECONCILE**.
- Rationale: Six unique audit documents. Preserve as dated audit evidence; reconcile prices/release status against recovery and actual test results, rather than treating past claims as current proof.

## beta-primary-preview

- Tip: `4265e58156b73bfd2c805a689cb2c65201eede88`; 3 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/3.
- Classification: **QUARANTINE DEPLOYMENT**.
- Rationale: Unique publisher deploys to the same repository GitHub Pages destination despite an isolated branch/concurrency name; its own deployment-status document records collision risk. Keep artifact-only preview from release/beta-primary-review instead.

## chore/testflight-group-audit

- Tip: `0a3ece03440b37d365e34cc0c6293ec8336348c1`; 10 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/8.
- Classification: **SELECT GUARD PATTERN / ARCHIVE REPLAY**.
- Rationale: Single existing account-holder audience check is useful. Assignment and inspector pin build11, old Apple build/group IDs; status workflow performs writes. Do not replay. Adapt exact new signed receipt and verified owner group. Preserve dated diagnostic docs.

## design/study-dashboard-v1-1

- Tip: `2c893c60db17f492b926be316321445bcb28040b`; 108 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/36.
- Classification: **SELECT PRODUCT CODE**.
- Rationale: Dashboard/study engine is genuinely unique and reviewed separately by product audit. Keep annual19.99/free Agaricus8+4 policy from recovery; omit Base product and Base configure/upload workflows. Keep isolated exact-source candidate template with truthful UI flags; quarantine pinned build13 replay and temporary simulator probes.

## docs/handoff

- Tip: `a0b45c36886921119ba2c030a222af6264f37b22`; 2 changed paths; exact current-path blobs 2; exact relocated legacy blobs 0; equivalent commit patches 0/2.
- Classification: **CONTENT EQUIVALENT**.
- Rationale: Both AGENTS.md and docs/HANDOFF.md have exactly the same blob IDs in main, despite two unmerged commits. No content to merge; refreshed consolidated handoff must replace stale release assumptions.

## feat/cloudflare-production

- Tip: `4f982fa187cd23f8f4070a77c2dbe6780b7656af`; 22 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/24.
- Classification: **ARCHIVE ALTERNATIVE PLATFORM**.
- Rationale: Cloudflare authentication/D1 deployment variant predates Expo migration. Fifteen paths have no current/legacy counterpart, including login/password/session routes and wrangler config. Real unique alternative backend code, but unrelated to current native release and incompatible root package/runtime. Preserve branch; do not reintroduce deployment or auth via merge.

## feat/complete-minimum-3plus1-web-evidence-v1

- Tip: `322be116e5c72ab5f3aed558d4616e17e16e153d`; 28 changed paths; exact current-path blobs 0; exact relocated legacy blobs 12; equivalent commit patches 0/35.
- Classification: **PRESERVED IN LEGACY / SUPERSEDED**.
- Rationale: All28 changed paths exist under legacy/web; twelve exact blobs. Later library/publication gates differ. Expo migration aca2af5 moved this platform. Current generated mobile content uses the preserved baseline; do not revive root Next/Vinext paths or earlier attestations.

## feat/evidence-claims-v1

- Tip: `0d156d5d9a599126028a134f9f5395b61097bb9b`; 12 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/17.
- Classification: **ARCHIVE UNIQUE HISTORICAL MODEL**.
- Rationale: Nine changed files have later legacy counterparts. Unique page-index/checker/old CI paths are historical claim-provenance tooling, not current generated schema. Keep for reference; future scientific work may port page-level evidence deliberately. Do not overwrite current catalog or package.json.

## feat/floot-migration

- Tip: `52ef692f647608d2151b3cfd5e9987fc2d29b8ff`; 3 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/6.
- Classification: **ARCHIVE DEPLOYMENT DOCUMENTS**.
- Rationale: Only three unique historical Floot design/plan/report documents; no application source payload. Report describes an external production and old scope; preserve dated reference, not current release state.

## feat/foraging-symbols-v1

- Tip: `ddf695d385659f06691b17ef7bd37b8362c7de54`; 1 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **DEFER UNIQUE UNWIRED FEATURE**.
- Rationale: One unique TypeScript data module defines12 study symbols and /symbols/*.svg asset references. No consuming integration/assets in this branch payload; old platform, not required by current native release. Preserve rather than pretending already integrated.

## feat/iphone-shortcut-export

- Tip: `098ecf3c13fb0fd9d69aa20d9f0588315e2b0eec`; 7 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/3.
- Classification: **DEFER UNIQUE BLOCKED PROTOTYPE**.
- Rationale: Seven unique workflow/source/security-test files. README explicitly says unsigned, non-installable; Apple signing failed because iCloud session missing. Existing PWA photo picker is the functional alternative. Preserve prototype; do not claim delivered installer.

## feat/minimum-edibility-v1

- Tip: `739e41426b7337d94ce9b587453694741e134c69`; 19 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/28.
- Classification: **ARCHIVE / FUTURE SCIENTIFIC RECONCILIATION**.
- Rationale: Same exact tip as minimum-profiles-v1. Unique earlier S2 structured model:148 assessments+160 evidence claims, including treatment and heterogeneous NOT_ASSESSED groups. Nine legacy counterparts evolved, ten paths absent. Valuable source-level reference, but port only after mapping into current edibility-guide/study-profile provenance; whole merge would revive old runtime.

## feat/minimum-profiles-v1

- Tip: `739e41426b7337d94ce9b587453694741e134c69`; 19 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/28.
- Classification: **DUPLICATE TIP OF MINIMUM-EDIBILITY**.
- Rationale: SHA739e4142 equals feat/minimum-edibility-v1 exactly. Same assessment/evidence model, no second independent implementation to integrate.

## feat/release-readiness-gate-oct08

- Tip: `91c4da2f397bd615250cfececf2a079cfd73808f`; 4 changed paths; exact current-path blobs 1; exact relocated legacy blobs 0; equivalent commit patches 0/4.
- Classification: **SUPERSEDED BY STRONGER MAIN**.
- Rationale: Readiness doc exact blob. Current scripts/tests retain gate and additionally require pointwise odor/sporePrint/edibility evidence and report field coverage; package scripts evolved. Old branch would weaken checks.

## feat/research-forecast-v2

- Tip: `5e4ea8ac05a344f83ea6fd241f1e18b32c1ec2c2`; 17 changed paths; exact current-path blobs 0; exact relocated legacy blobs 4; equivalent commit patches 0/17.
- Classification: **PRESERVED IN LEGACY / EVOLVED**.
- Rationale: All17 paths have legacy/web counterparts, four exact blobs. Forecast/map/weather implementation evolved after this v2 snapshot. Preserve historical model doc; do not restore old root app or score logic during subscription release.

## feat/schede-summary-design

- Tip: `ee9630f9b37f9d9817eeac50cb7e0081de29afad`; 26 changed paths; exact current-path blobs 0; exact relocated legacy blobs 20; equivalent commit patches 2/42.
- Classification: **PRESERVED IN LEGACY / EVOLVED**.
- Rationale: All26 paths exist in legacy/web, twenty exact blobs including imagery/design assets. Remaining summary-shell/model/explore/smoke differences are older platform versions. git cherry finds2 equivalent commits,40 unmatched patches; unmatched does not mean lost feature because migration changed paths.

## feat/scientific-review-workbench-v1

- Tip: `4326e4f8cd98337defd44d46b1b01b21929fab50`; 7 changed paths; exact current-path blobs 0; exact relocated legacy blobs 6; equivalent commit patches 0/8.
- Classification: **PRESERVED IN LEGACY**.
- Rationale: Six of seven changed files exactly match legacy/web, including review decisions/packets/tests/exporter; only old workflow differs. No unique review engine to add.

## feat/source-enrichment-2026-09-29

- Tip: `ca35c675402ca2c7b6d80bec3cc9c7402e1791ad`; 6 changed paths; exact current-path blobs 0; exact relocated legacy blobs 5; equivalent commit patches 0/6.
- Classification: **PRESERVED / CLARIFIED IN LEGACY**.
- Rationale: Five of six files exactly match legacy/web. Remaining field-evidence file differs only in stronger wording limiting claim scope and independent-review assertions. Old branch would restore overbroad provenance phrasing.

## feat/territorial-forecast-v3

- Tip: `a85daec8463320bd25eb699289421b944b0d432f`; 8 changed paths; exact current-path blobs 0; exact relocated legacy blobs 2; equivalent commit patches 0/16.
- Classification: **PRESERVED IN LEGACY / EVOLVED**.
- Rationale: All8 paths have legacy/web counterparts; two exact blobs including v3 model document. Six implementation/test paths changed later. No wholesale platform merge; territorial model remains archival baseline.

## fix/app-review-20261021

- Tip: `d065840811e78434b0b65eb26ac9025c0edf9582`; 26 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/7.
- Classification: **KEEP RECOVERY POLICY**.
- Rationale: Current authorized annual19.99/free Agaricus8profiles+4questions policy and Apple corrections, with native/fullUI blocker honestly documented. Preserve verification; replace pinned failed recovery-build gate with new exact-source candidate route.

## fix/approved-iphone-icon

- Tip: `5b415422edb8df820d61a4f019f330621b539384`; 1 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **KEEP UNIQUE ASSET**.
- Rationale: Single owner-approved readable icon PNG; visually checked. Include in new native build; existing installed binaries cannot acquire native icon through content-only OTA.

## fix/safari-admin-cache-images-oct08

- Tip: `500238079cd99b80301cb9f60295f588ec629594`; 4 changed paths; exact current-path blobs 1; exact relocated legacy blobs 0; equivalent commit patches 0/5.
- Classification: **SUPERSEDED**.
- Rationale: admin-photos-entry.js exact main blob. Current HTML retains entry loader plus gallery CSS/module loading; current SW retains admin cache fixes plus generated build version, privacy/support routing, bounded exam-photo cache and separate core install. Do not regress whole HTML/SW.

## fix/storekit-cold-start-diagnostics

- Tip: `899602520a14296260343a1702b2e680f1e48207`; 6 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/3.
- Classification: **SELECT LOGGING / QUARANTINE EXPERIMENT**.
- Rationale: Useful verifier logging/cold-start diagnostics; observer-disabled simulator variant is not production fix. Whole branch old UI test asserts9.99 and inspector pins build11; recovery annual19.99 policy wins. Do not lower receipt checks.

## photo-library

- Tip: `4b8090c729342bcceabae6eea40d5869fa236c58`; 1 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **DO NOT MERGE MUTABLE USER STATE**.
- Rationale: Unique metadata.json contains only version1/photos[]. Empty initialization for personal photo import, no implementation. Merging historical empty state is unnecessary and may replace populated photo-library branch state; retain branch as data channel.

## release/beta-primary-review-20261008

- Tip: `8f54dd2f3f5fd9fe718fa5304175eeaee5f03eb8`; 1 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **OPTIONAL KEEP ARTIFACT PREVIEW**.
- Rationale: Single workflow builds/validates beta and uploads artifact only. No production deploy. Can keep manually dispatched version; stale source branch trigger need not be revived.

## research/course-photo-extraction

- Tip: `2aac83840a189c78f4f397cd60a3ca1e4704164d`; 299 changed paths; exact current-path blobs 1; exact relocated legacy blobs 0; equivalent commit patches 0/10.
- Classification: **ARCHIVE RESEARCH / SELECT ONLY REVIEWED ASSETS**.
- Rationale: Unique extraction/rendering tools/workflows and292 review-media files;24 media blobs already occur in main. Permission document exact main blob and explicitly requires taxon/view visual review. Preserve unselected contact sheets/crops as research, not catalog additions.

## research/external-reference-photos

- Tip: `c6672138e3b2dd3ed66a3e101a9663bc137fc6f2`; 187 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/25.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Initial external publisher/PDF acquisition. 184 candidate/contact-sheet/metadata files; 52 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/focused-reference-v11

- Tip: `0edb0d77ce66c7e49018a58acbcba24bb2457977`; 1152 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/37.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Broader licensed collection search; targeted tool is not present here, so do not assume this tip contains every divergent tool. 1146 candidate/contact-sheet/metadata files; 147 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/large-course-archives

- Tip: `06f4b96832b7a613c92abbd8e7085eb2526a8111`; 2 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **SUPERSEDED**.
- Rationale: Current inspector adds four-attempt download retries, attemptsUsed evidence and nonzero failure exit; current workflow also permits main. No unique tool code missing.

## research/primary-reference-photos

- Tip: `bdd59dfea2008b5f37b703dda364b2a766e93ae6`; 188 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/27.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Adds primary iNaturalist metadata validation and primary-observation review tool. 184 candidate/contact-sheet/metadata files; 52 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/primary-reference-v2

- Tip: `00c9fa88812d0359b7a116f9a8b3f8a4a2c14116`; 242 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/29.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Adds isolated provider queue and Entoloma primary occurrence evidence. 238 candidate/contact-sheet/metadata files; 57 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/primary-reference-v3

- Tip: `2b7575fa4c972b4f97f6b38333a71dff656d5379`; 565 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/31.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Adds specialist-collection search and voucher-figure acquisition. 560 candidate/contact-sheet/metadata files; 118 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/primary-reference-v4

- Tip: `bd6298720dd9598b2b0bea0565918049292bc4f5`; 861 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/33.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Three documented collections per unresolved taxon. 856 candidate/contact-sheet/metadata files; 140 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/primary-reference-v5

- Tip: `2935e43310897716275828e4b0c366a34ea59e42`; 629 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/33.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Additional primary observations and individually licensed scientific figures. 624 candidate/contact-sheet/metadata files; 126 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/primary-reference-v6

- Tip: `d0cc219bc2ef9b4db696550d1c3175a3242bb9a3`; 615 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/33.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Named-specialist alternative-name search for unresolved zero-image cards. 610 candidate/contact-sheet/metadata files; 124 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/primary-reference-v7

- Tip: `008cdbdfe859f4db8869430b958a78c157b9ced6`; 621 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/35.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Adds community consensus evidence/search, four matching identifications in targeted work. 615 candidate/contact-sheet/metadata files; 125 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/primary-reference-v8

- Tip: `89a7e5a436a4bf83d4ab136b8fb0ee0be5850499`; 862 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/34.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: European research-grade final-view review. 856 candidate/contact-sheet/metadata files; 140 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/primary-reference-v9

- Tip: `4a4ae7c10a313e9729b43c79feba4b6187d2c81d`; 862 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/35.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Recovery of acquisition queue on immutable branch; same media count asv8. 856 candidate/contact-sheet/metadata files; 140 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/reviewed-community-4ee8a77301d6

- Tip: `4ee8a77301d63852a2a23f3c4f5ecae4020d26ef`; 1410 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/38.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Largest inspected review-media set, retaining latest community acquisition records. 1404 candidate/contact-sheet/metadata files; 151 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/reviewed-community-5403b5a64602

- Tip: `5403b5a646025f1502a8ec06bb924420ef229984`; 1152 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/36.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Earlier community acquisition snapshot before focused-v11 search refinements. 1146 candidate/contact-sheet/metadata files; 147 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/reviewed-community-721fa6349343

- Tip: `721fa6349343450e54128598f9845e9d129b3319`; 931 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/37.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Targeted acquisition snapshot preserving search-targeted-reference-photos.py. 924 candidate/contact-sheet/metadata files; 142 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## research/targeted-reference-v10

- Tip: `b40163815b601d0f4d0cc52d8c2fc39800707837`; 863 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/36.
- Classification: **ARCHIVE RESEARCH / PORT TOOLS ON DEMAND**.
- Rationale: Adds targeted Norwegian/institutional macrophotograph search tool. 856 candidate/contact-sheet/metadata files; 140 exact media blobs already present somewhere in main. Acquisition tools and pending indexes are unique research infrastructure, not missing reviewed catalog content. Preserve branch and use per-image review to select any future additions; never replace current curated source/selection manifests wholesale.

## review/annual-free-preview

- Tip: `49659d26f28e125a78b202b36f1c94dae263486d`; 1 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **ARCHIVE DIAGNOSTIC**.
- Rationale: One original temporary preview screenshot, no application code. Historical visual evidence does not prove current consolidated free demo.

## review/annual-native-screens-20261016

- Tip: `f74a432861cb20f17b5602fdb8d9fde507fb3c72`; 12 changed paths; exact current-path blobs 6; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **ASSETS ALREADY EXACT / ARCHIVE CHUNKS**.
- Rationale: Six annual iPhone/iPad screenshot PNG blobs exactly match main. Only six encoded review-text chunks absent. No new screenshots to merge; recapture current policy if screenshots no longer describe app.

## review/ipad-original-screenshot

- Tip: `eef1f2dce093fc0ac0499e9d6997e49f7b10a856`; 3 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **ARCHIVE ENCODED EVIDENCE**.
- Rationale: Three temporary screenshot-review text chunks only; no runtime or independent new release proof.

## review/isolated-storekit-failures-20261016

- Tip: `6967b72210737d940853449459898a2b6862e671`; 2 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **ARCHIVE FAILURE EVIDENCE**.
- Rationale: Two original iPhone/iPad failure PNGs only. Preserve historical diagnosis; cannot count as passing current native/UI evidence.

## review/pwa-exam-click-20261016

- Tip: `74e648ee51429ae69f9a2dbe657fdb49e2cb0da5`; 1 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **ARCHIVE FAILURE EVIDENCE**.
- Rationale: One actual compact-iPhone failure screenshot only. Fixes are in later main ancestors; image is historical diagnosis.

## review/storekit-third-failure

- Tip: `bfd54ddbc6d27068703b693e230a84c12835fb8e`; 2 changed paths; exact current-path blobs 0; exact relocated legacy blobs 0; equivalent commit patches 0/1.
- Classification: **ARCHIVE FAILURE EVIDENCE**.
- Rationale: Two actual local StoreKit purchase failure PNGs only. No application patch or passing proof.

## Release implications

Before consolidated main push, remove automatic production OTA and automatic App Store selection paths. Use one explicit exact-source TestFlight producer with isolated channel, signed IPA hash, source/run IDs, actual native/UI outcomes, and testFlightOnly=true. A demo-only success does not substitute for native billing or full purchase UI proof. Pin new evidence to consolidated source; old builds11/13 and failed pinned recovery evidence are historical. Retain verified receipt enforcement.
