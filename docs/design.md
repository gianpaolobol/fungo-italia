# Fungo Italia Beta — Product Design

## Goal

Publish a registration-gated web beta for Italy that immediately helps a mushroom hunter decide where to go, without exposing precise personal routes or collecting spots. The experience must remain useful to beginners while preserving taxonomic rigor for mycologists.

## Primary flow

The first screen is the product: a ranked list of broad search areas beside a readable OpenStreetMap-based map. Each area has one synthetic recommendation (`Vai ora`, `Buona`, `Attendi`) and a short explanation based on habitat, recent conditions, delayed anonymous visit pressure, and verified observations. Opening an area shows why it is recommended, expected fungal groups, host trees, indicator fungi, anonymous delayed pressure, and safety notes.

## Privacy

- Never expose exact outing routes or personal collecting spots.
- Aggregate visits into broad areas and delay recency data.
- Show only count bands (`nessuno`, `pochi`, `alcuni`, `molti`) rather than identities or exact timestamps.
- Keep observation coordinates private; public display uses a displaced/aggregated location.

## Taxonomy and education

- Scientific accepted name, scientific synonyms, national common name, and geographically scoped regional/local names are separate records.
- The 2026 taxonomic-objectives document determines the supported classification resolution: family, genus, section, group/aggregate, or species.
- The app must not force species-level output when evidence only supports a broader taxon.
- The Regione Piemonte reasoned edibility guide is the primary edibility/toxicity reference.
- Every identification is educational and never an authorization to consume.

## Beta capabilities

- Required ChatGPT sign-in before using the application.
- Italy-wide map with representative beta areas and ranked destination cards.
- Search and filters by region, recommendation, habitat, fungal group, and taxon name.
- Area detail with tree habitat, fungal associations, indicator fungi, visit pressure, and reasons.
- Taxon atlas with scientific, common, regional, and historical names.
- Observation form for photographs, description, date, and coordinates; review state is visible to the submitter.
- Verification model designed for administrators assigned by region and taxonomic group.
- Photo identification is represented as a preliminary workflow; the first deploy does not make unsupported AI claims.

## Visual direction

Field notebook clarity with cartographic precision: deep forest green and warm safety amber, crisp white surfaces, compact serif accents for scientific names, generous touch targets, and no user-managed layer stack. Mobile opens with the ranked list and a compact map; desktop shows list and map together.

## Initial data strategy

Seed a small, credible demonstration dataset across Italy. Store durable accounts, observations, names, taxa, areas, and review records in D1; store uploaded photographs in R2. Keep scoring inputs explicit and versionable so real environmental feeds can replace seed values later without changing the interface.

