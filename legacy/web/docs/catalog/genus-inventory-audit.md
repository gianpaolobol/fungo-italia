# Audit inventario dei generi — Lotto 6 / Task 6.1

## Scopo

Determinare in modo riproducibile il perimetro delle schede di genere a partire dal corpus Minimo gia verificato, senza forzare il precedente target progettuale di 67.

## Risultati riproducibili

Checkpoint nomenclaturale:

- unita didattiche Minimo: **148**
- nomi correnti unici collegati alle unita: **134**
- generi nominali ricavati direttamente dalle etichette delle 148 unita: **61**
- generi correnti unici ricavati dai 134 nomi correnti verificati: **73**
- incremento dovuto a riallocazioni e separazioni nomenclaturali: **+12**

Il conteggio di 73 e prodotto dal mapping `minimumNomenclatureMappings` gia verificato in CI; non deriva da una lista manuale.

## Confronto con il planning storico

Il planning precedente riportava:

- 55 generi nominali;
- 67 generi correnti.

La nuova pipeline source-led non riproduce quei numeri:

- il corpus delle 148 unita contiene 61 generi nominali;
- la riconciliazione corrente produce 73 generi formali.

La differenza e di **+6** in entrambi i livelli, mentre l'espansione nomenclaturale resta **+12**. Questo suggerisce che il planning storico applicava implicitamente un perimetro piu stretto di sei generi, ma quel criterio non era stato registrato in forma riproducibile.

## Regola

Il numero 67 **non deve essere ottenuto eliminando sei generi arbitrariamente**.

Prima di congelare l'inventario delle schede di genere occorre classificare ogni genere in una delle categorie seguenti:

1. `directMinimumGenus` — il riconoscimento del genere e esplicitamente obiettivo Minimo S1;
2. `currentTransferGenus` — genere corrente necessario per una o piu unita Minimo trasferite da un nome storico;
3. `memberOfDefinedSet` — genere corrente necessario per una unita S1 che oggi comprende piu taxa distinti;
4. `familyObjectiveMember` — genere nominato solo all'interno di un obiettivo di famiglia o gruppo superiore;
5. `historicalAliasOnly` — nome di genere utile alla ricerca ma non meritevole di una scheda autonoma corrente;
6. `reviewNeeded` — perimetro da decidere con revisione scientifica.

Solo dopo questa classificazione si stabilisce il numero finale di schede di genere.

## Riproducibilita

- `scripts/verify-index-fungorum.mjs` riporta anche il numero di generi correnti unici;
- `scripts/report-minimum-genera.mjs` produce le liste sorgente/correnti e le differenze;
- la CI esegue entrambi gli audit.

## Stato Task 6.1

**IN CORSO — cardinalita auditata, classificazione del perimetro da completare.**

Non e consentito proseguire alla generazione massiva delle schede di genere finche il perimetro non e congelato e testato.
