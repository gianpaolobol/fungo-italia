# Scientific evidence candidates — 26 October 2026

Status: **source-checked, not approved for publication**. These are proposed field-level additions to the 148-taxon catalog, **not independent professional review**. Do not change `independentReviewStatus`, the authoritative S2 edibility entries, or the strict release gate.

## Suillellus luridus

- Current generated catalog: `habitat: []`, `lookalikes: []` (checked against main on 26 October 2026).
- Candidate habitat: ectomycorrhizal, especially under beech on calcareous soil; also oak, rarely lime.
- Source: https://www.first-nature.com/fungi/suillellus-luridus.php — sections **Habitat & Ecological role** and **Distribution**.
- Candidate comparisons: `Rubroboletus satanas` (pale/whitish cap, swollen stem with red reticulum); `Neoboletus luridiformis` (red stem dots, not reticulum).
- Source: same page, section **Similar species**.
- Caution: confirm current taxonomic names, scope, and applicability to the exact S1 curriculum unit before publishing.

## Caloboletus radicans

- Current generated catalog: `habitat: []`, `lookalikes: []` (checked against main on 26 October 2026).
- Candidate habitat: ectomycorrhizal on neutral to alkaline soils, mainly with oak, sometimes beech; reported also with rockrose.
- Source: https://www.first-nature.com/fungi/caloboletus-radicans.php — sections **Habitat & Ecological role** and **Identification guide**.
- Candidate comparisons: `Suillellus luridus` (darker cap and orange stem-base flesh); `Rubroboletus satanas` (pale cap and orange/red mature pores); `Caloboletus calopus` (red reticulate stem base).
- Source: same page, section **Similar species**.
- Caution: independently check taxonomy and diagnostic character contrasts before publishing.

## Approval and integration steps

1. Compare each candidate with at least one independent scientific reference and the course materials; distinguish source concordance from professional review.
2. Confirm correct S1 taxonomic scope. Do not create any new catalog units for comparison species absent from S1.
3. Register source URLs with section locators and supported fields `habitat` and `lookalikes`; preserve evidence through `npm run prepare:data` using the approved integration mechanism rather than editing generated catalog records.
4. Require a qualified reviewer to attest field accuracy and limitations before setting any independent review flag.
5. Re-run strict readiness on the actual release SHA. No food-use claim is supported by this candidate note.

Track under issue #121.
