# Catalogo micologico — Matrice esatta dei campi

**Convenzioni:** `R` obbligatorio; `C` obbligatorio quando si verifica la condizione indicata; `O` facoltativo. Gli identificatori sono stringhe stabili in formato UUID o prefisso leggibile + UUID; non dipendono dai nomi scientifici.

## Taxon

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `taxonId` | string | R | univoco, immutabile | sistema |
| `acceptedScientificName` | string | R | nome senza autore | fonte nomenclaturale |
| `authorship` | string/null | O | autore tassonomico | fonte nomenclaturale |
| `rank` | enum | R | `family`, `genus`, `subgenus`, `section`, `subsection`, `speciesGroup`, `aggregate`, `species`, `subspecies`, `variety`, `operationalGroup` | S1/S2 + revisione |
| `parentTaxonId` | string/null | C | richiesto salvo radice o gruppo operativo indipendente | tassonomia |
| `sourceTaxonLabel` | string[] | R | almeno una forma letterale delle fonti | S1/S2 |
| `nomenclaturalStatus` | enum | R | `accepted`, `unresolved` | fonte nomenclaturale |
| `taxonConceptNote` | string/null | C | richiesto per `s.l.`, aggregati e gruppi | revisore |
| `publicationTier` | enum | R | `core`, `expansion`, `internalOnly` | perimetro |
| `reviewStatus` | enum | R | stato di revisione | workflow |
| `createdAt` | ISO datetime | R | automatico | sistema |
| `updatedAt` | ISO datetime | R | automatico | sistema |

## TaxonName

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `nameId` | string | R | univoco | sistema |
| `taxonId` | string | R | FK Taxon | catalogo |
| `name` | string | R | non vuoto | fonte |
| `nameType` | enum | R | `scientificSynonym`, `formerCombination`, `sourceLiteral`, `italianCommon`, `regionalCommon`, `localCommon` | fonte |
| `language` | string | R | ISO 639-1; default `it` | fonte |
| `regions` | string[] | C | obbligatorio per regionale/locale; codici ISO 3166-2:IT | fonte |
| `localityNote` | string/null | O | provincia, valle o area culturale | fonte |
| `isPreferred` | boolean | R | uno solo per coppia taxon/territorio/tipo | curatore |
| `ambiguityStatus` | enum | R | `unique`, `ambiguous`, `deprecated` | revisore |
| `evidenceIds` | string[] | R | almeno una evidenza | fonte |

## TrainingObjective

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `objectiveId` | string | R | univoco | sistema |
| `taxonId` | string | R | FK Taxon | catalogo |
| `level` | enum | R | `minimum`, `desirable`, `optional` | S1 |
| `requiredResolution` | enum | R | stessi valori di `Taxon.rank` ammessi dal contesto | S1 |
| `deepMorphologyRequired` | boolean | R | vero solo se indicato o definito da S1 | S1 |
| `criticality` | enum | R | `ordinary`, `importantEdible`, `importantToxic`, `deadlyRisk` | S1 + revisore |
| `territorialScope` | string[] | R | una o più zone; default `italyGeneral` | S1 |
| `sourceId` | string | R | deve puntare a S1 | S1 |
| `sourceLocation` | string | R | pagina + sezione/tabella | S1 |
| `sourceSummary` | string | R | sintesi originale | curatore |
| `reviewStatus` | enum | R | workflow | workflow |

## EdibilityAssessment

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `assessmentId` | string | R | univoco | sistema |
| `taxonId` | string | R | FK Taxon | catalogo |
| `category` | enum | R | `EDIBLE`, `EDIBLE_AFTER_TREATMENT`, `DISCOURAGED`, `NO_FOOD_VALUE`, `NOT_EDIBLE`, `POISONOUS`, `NOT_ASSESSED` | S2 |
| `assessmentScope` | enum | R | `exactTaxon`, `section`, `group`, `aggregate`, `definedSet` | S2 |
| `scopeDefinition` | string/null | C | obbligatorio salvo `exactTaxon` | S2 |
| `conditionsSummary` | string/null | C | obbligatorio se vi sono condizioni | S2 |
| `treatmentCodes` | enum[] | R | insieme eventualmente vuoto dei codici trattamento | S2 |
| `partsAllowed` | string[] | O | parti ammesse dalla fonte | S2 |
| `partsExcluded` | string[] | O | parti escluse dalla fonte | S2 |
| `specimenStage` | enum | R | `anySuitable`, `youngOnly`, `notSpecified` | S2 |
| `specialWarnings` | string[] | O | sintesi originali | S2 |
| `sourceId` | string | C | richiesto salvo `NOT_ASSESSED`; deve puntare a S2 | S2 |
| `sourceLocation` | string/null | C | pagina/tabella per categorie S2 | S2 |
| `reviewStatus` | enum | R | `approved` necessario alla pubblicazione | workflow |

## EcologyProfile

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `ecologyId` | string | R | univoco | sistema |
| `taxonId` | string | R | FK Taxon | catalogo |
| `trophicModes` | enum[] | R | vocabolario §8.1; almeno uno | fonti ecologiche |
| `habitatCodes` | string[] | R | vocabolario habitat versionato; almeno uno | fonti ecologiche |
| `soilPreferences` | enum[] | O | `acidic`, `neutral`, `calcareous`, `sandy`, `clayey`, `richOrganic`, `unknown` | fonti ecologiche |
| `moisturePreferences` | enum[] | O | `xeric`, `mesic`, `humid`, `waterlogged`, `variable`, `unknown` | fonti ecologiche |
| `substrateText` | string/null | O | sintesi per saprotrofi/parassiti | fonti ecologiche |
| `ecologySummary` | string | R | testo originale sintetico | curatore |
| `confidence` | enum | R | vocabolario attendibilità | revisore |
| `evidenceIds` | string[] | R | almeno una evidenza | fonti |
| `reviewStatus` | enum | R | workflow | workflow |

## OrganismAssociation

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `associationId` | string | R | univoco | sistema |
| `subjectTaxonId` | string | R | fungo di partenza | catalogo |
| `objectType` | enum | R | `fungusTaxon`, `plantTaxon`, `habitat`, `substrate` | catalogo |
| `objectId` | string | R | FK al relativo registro | catalogo |
| `relationType` | enum | R | vocabolario §8.3 | fonte |
| `directionality` | enum | R | `directed`, `symmetric` | curatore |
| `geographicScope` | string[] | R | almeno una zona | fonte |
| `altitudeMinM` | integer/null | O | 0–4.800 | fonte |
| `altitudeMaxM` | integer/null | O | >= minimo e <=4.800 | fonte |
| `confidence` | enum | R | vocabolario attendibilità | revisore |
| `publicSummary` | string | R | vietate formulazioni deterministiche per indicatori | curatore |
| `evidenceIds` | string[] | R | almeno una evidenza | fonte |
| `reviewStatus` | enum | R | workflow | workflow |

## PhenologyProfile

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `phenologyId` | string | R | univoco | sistema |
| `taxonId` | string | R | FK Taxon | catalogo |
| `zoneCode` | enum | R | vocabolario §9.1 | fonte |
| `regionCodes` | string[] | O | ISO 3166-2:IT | fonte |
| `altitudeMinM` | integer/null | O | 0–4.800 | fonte |
| `altitudeMaxM` | integer/null | O | >= minimo e <=4.800 | fonte |
| `altitudeOptimalMinM` | integer/null | O | entro minimo/massimo | fonte |
| `altitudeOptimalMaxM` | integer/null | O | entro minimo/massimo | fonte |
| `typicalMonths` | integer[] | R | valori unici 1–12; almeno uno | fonte |
| `possibleMonths` | integer[] | O | valori unici 1–12; non duplicare `typicalMonths` | fonte |
| `triggers` | enum[] | O | `rainfall`, `soilTemperature`, `snowmelt`, `firstFrost`, `thermalDrop`, `droughtBreak`, `other` | fonte |
| `conditionsSummary` | string/null | O | testo originale | curatore |
| `confidence` | enum | R | vocabolario attendibilità | revisore |
| `evidenceIds` | string[] | R | almeno una evidenza | fonte |
| `reviewStatus` | enum | R | workflow | workflow |

## GeographicProfile

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `geographyId` | string | R | univoco | sistema |
| `taxonId` | string | R | FK Taxon | catalogo |
| `zoneCodes` | enum[] | R | vocabolario §9.1 | fonte |
| `regionCodes` | string[] | O | ISO 3166-2:IT | fonte |
| `mountainSystems` | enum[] | O | `alps`, `prealps`, `northernApennines`, `centralApennines`, `southernApennines`, `sicilianRanges`, `sardinianRanges`, `none` | fonte |
| `presenceStatus` | enum | R | `widespread`, `common`, `localized`, `rare`, `historical`, `uncertain`, `notDocumented` | fonte |
| `distributionSummary` | string | R | testo originale | curatore |
| `evidenceIds` | string[] | R | almeno una evidenza | fonte |
| `reviewStatus` | enum | R | workflow | workflow |

## ConfusionRelation

| Campo | Tipo | Req. | Vincolo / vocabolario | Fonte primaria |
|---|---|---:|---|---|
| `confusionId` | string | R | univoco | sistema |
| `subjectTaxonId` | string | R | taxon della scheda | catalogo |
| `confusedWithTaxonId` | string | R | diverso dal soggetto | catalogo |
| `confusionContext` | string | R | perché possono essere confusi | fonte |
| `discriminatingCharacters` | string[] | R | almeno uno | fonte |
| `riskLevel` | enum | R | `low`, `moderate`, `high`, `deadly` | revisore |
| `priorityWarning` | boolean | R | obbligatoriamente vero per `deadly` | sistema/revisore |
| `evidenceIds` | string[] | R | almeno una evidenza | fonte |
| `reviewStatus` | enum | R | `approved` per rischio alto/mortale | workflow |

## Source

| Campo | Tipo | Req. | Vincolo / vocabolario |
|---|---|---:|---|
| `sourceId` | string | R | univoco e stabile |
| `sourceType` | enum | R | `courseDocument`, `book`, `article`, `database`, `institutionalWeb`, `expertReview` |
| `title` | string | R | titolo completo |
| `authors` | string[] | O | ordine editoriale |
| `publisher` | string/null | O | ente/editore |
| `publicationYear` | integer/null | O | quattro cifre |
| `version` | string/null | O | edizione/revisione |
| `url` | string/null | O | URL canonico |
| `isbnOrDoi` | string/null | O | identificatore |
| `accessedAt` | ISO date/null | C | obbligatorio per risorse web |
| `licenseNote` | string | R | uso consentito e limiti di riproduzione |
| `fileHashSha256` | string/null | C | obbligatorio per PDF acquisiti |

## Evidence

| Campo | Tipo | Req. | Vincolo / vocabolario |
|---|---|---:|---|
| `evidenceId` | string | R | univoco |
| `sourceId` | string | R | FK Source |
| `sourceLocation` | string | R | pagina, tabella, voce o sezione |
| `claimType` | enum | R | `taxonomy`, `training`, `morphology`, `edibility`, `treatment`, `ecology`, `association`, `phenology`, `geography`, `confusion`, `vernacularName` |
| `claimSummary` | string | R | sintesi originale dell'affermazione |
| `evidenceStrength` | enum | R | `primaryExplicit`, `primaryInferred`, `secondaryCorroborated`, `expertAssessment`, `traditional`, `uncertain` |
| `extractedBy` | string | R | curatore o processo |
| `extractedAt` | ISO datetime | R | automatico |
| `reviewedBy` | string/null | C | richiesto per `reviewed/approved` |
| `reviewedAt` | ISO datetime/null | C | richiesto per `reviewed/approved` |
| `reviewStatus` | enum | R | workflow completo |
| `notes` | string/null | O | conflitti o limiti |

## CatalogRelease

| Campo | Tipo | Req. | Vincolo / vocabolario |
|---|---|---:|---|
| `releaseId` | string | R | univoco |
| `version` | semver | R | es. `0.2.0` |
| `releasedAt` | ISO datetime | R | automatico |
| `sourceDataSha256` | string | R | hash del catalogo normalizzato |
| `s1MinimumTotal` | integer | R | totale inventario S1 minimo |
| `s1MinimumResolved` | integer | R | deve coincidere col totale per rilascio completo |
| `s2Total` | integer | R | totale inventario S2 |
| `s2Resolved` | integer | R | deve coincidere col totale per rilascio completo |
| `approvedTaxa` | integer | R | conteggio |
| `recordsNeedingReview` | integer | R | conteggio |
| `blockingConflictIds` | string[] | R | vuoto per rilascio pubblico |
| `reviewerIds` | string[] | R | almeno uno |
| `releaseNotes` | string | R | modifiche e limiti |

## Vocabolari trasversali

### `reviewStatus`

`extracted`, `normalized`, `reviewNeeded`, `reviewed`, `approved`, `superseded`, `rejected`.

### `confidence`

`documented`, `strong`, `moderate`, `indicative`, `traditional`, `uncertain`.

### `treatmentCodes`

`completeCooking`, `boilingAndDiscardWater`, `removeParts`, `youngSpecimensOnly`, `avoidAfterFreezing`, `avoidAlcohol`, `quantityLimit`, `otherSpecified`.

### Zone geografiche

`italyGeneral`, `alpsWest`, `alpsCentral`, `alpsEast`, `prealps`, `poPlain`, `northernApennines`, `centralApennines`, `southernApennines`, `tyrrhenian`, `adriatic`, `mediterranean`, `sicily`, `sardinia`.

## Regole di pubblicazione minime

1. Ogni taxon `core` deve avere almeno un nome scientifico sorgente, un rango, una fonte di inclusione e uno stato di revisione.
2. Ogni valutazione diversa da `NOT_ASSESSED` deve riferirsi a S2 con pagina o tabella.
3. Ogni nome regionale deve avere almeno una regione o località.
4. Ogni profilo fenologico deve avere zona, mesi tipici, evidenza e confidenza.
5. Ogni associazione deve distinguere relazione scientifica, co-occorrenza e indicatore tradizionale.
6. Ogni confusione `high` o `deadly` deve essere approvata e avere almeno un carattere discriminante.
7. Nessun record di gruppo può essere presentato come determinazione di specie.
8. Il rilascio “completo rispetto alle fonti” richiede `s1MinimumResolved = s1MinimumTotal`, `s2Resolved = s2Total` e nessun conflitto bloccante.

