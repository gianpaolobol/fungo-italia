# Copertura delle fonti del catalogo beta

## Stato corrente

Il catalogo distingue ora tre livelli che in precedenza erano mescolati:

1. **intestazioni sorgente S1**: 124 voci di primo livello;
2. **unita didattiche Minimo**: 148 target effettivi ricavati dalle 73 intestazioni che contengono un obiettivo minimo;
3. **nomenclatura corrente**: mapping separato, verificato senza forzare i target didattici a specie.

## Copertura S1 — livello Minimo

- 148/148 unita didattiche presenti.
- 148/148 mapping nomenclaturali presenti.
- 0 mapping `unresolved`.
- 0 mapping `conflict`.
- 3 mapping `definedSet`, necessari quando una formulazione S1 comprende piu taxa correnti distinti.
- 134 asserzioni uniche di nome corrente verificate automaticamente contro Index Fungorum nel checkpoint corrente.
- 148/148 claim didattici `training.minimum`.
- 148/148 evidenze S1 con pagina e voce sorgente.
- 0 claim didattici senza evidenza.

Il precedente numero progettuale di 141 riferimenti correnti non viene piu usato come invariante: non era accompagnato da una riconciliazione riproducibile. Resta nei file di audit soltanto per tracciabilita storica.

## Registro delle fonti

Le fonti canoniche sono registrate in `data/catalog/sources.json`.

Nel checkpoint del Lotto 3 sono presenti:

- S1 — *Obiettivi tassonomici nella formazione dei micologi*, V4 09.06.2026;
- S2 — *Guida ragionata alla commestibilita dei funghi* (Sitta et al., 2021);
- Index Fungorum per la riconciliazione nomenclaturale;
- la revisione peer-reviewed usata per il caso *Amanita verna* / *A. vidua*.

La presenza nel registro non implica che tutti i domini informativi della fonte siano gia importati. S2 e registrata, ma il popolamento sistematico delle valutazioni alimentari appartiene al lotto successivo dedicato alle schede e ai claim di commestibilita/trattamento.

## Regola di modellazione

Il rango richiesto dalla fonte e conservato. Se S1 opera a livello di genere, sezione, sottosezione, gruppo o concetto *sensu lato*, il catalogo non inventa una precisione di specie.

Una formulazione didattica che comprende piu specie correnti puo essere rappresentata come `definedSet`. Questo conserva l'unita didattica senza trasformare taxa distinti in sinonimi.

## Evidence e Claim

La provenienza usa tre entita separate:

- `Source`: descrive la fonte;
- `Evidence`: registra posizione e sintesi originale dell'affermazione;
- `Claim`: registra il valore strutturato usato dal catalogo e punta a una o piu evidenze.

Per il livello Minimo la catena e completa:

`learningUnit -> claim training.minimum -> evidence S1 -> source S1`.

I validatori impediscono claim privi di evidenza, riferimenti a fonti inesistenti, incompatibilita fra tipo del claim e tipo dell'evidenza e l'approvazione di claim sostenuti da evidenze con stato editoriale insufficiente.

## Limiti ancora aperti

- Le evidenze S1 del checkpoint sono in stato `normalized`, non ancora `approved`: la revisione scientifica finale e un gate distinto.
- La copertura strutturata S2 di commestibilita e trattamenti deve essere prodotta nei lotti successivi.
- Habitat, fenologia, quota, distribuzione, associazioni e confusioni richiedono fonti complementari registrate una per una.
- I nomi regionali vengono pubblicati soltanto quando associati a territorio ed evidenza.

## Riproducibilita

- `data/taxonomic-objectives.json` conserva l'estrazione strutturata S1.
- `lib/minimum-learning-source.ts` definisce le 148 unita Minimo.
- `lib/minimum-nomenclature.ts` contiene la riconciliazione nomenclaturale.
- `data/catalog/sources.json`, `evidence.json` e `claims.json` costituiscono il primo nucleo del catalogo provenance-first.
- La CI verifica Index Fungorum, test di integrita, lint e build prima di considerare valido il checkpoint.
