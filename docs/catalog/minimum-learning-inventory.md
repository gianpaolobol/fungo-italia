# Inventario didattico minimo — checkpoint Lotto 2

## Stato

L'inventario sorgente del livello **Minimo** e ora modellato separatamente dal catalogo nomenclaturale.

- Unita didattiche minime: **148**
- Intestazioni sorgente coinvolte: **47**
- Etichette sorgente duplicate: **0**
- Target di riferimenti nomenclaturali correnti: **141**
- Stato mapping nomenclaturale: **in revisione**
- Pubblicazione: **bloccata** finche il mapping e la revisione non sono completi

Il file sorgente eseguibile e `lib/minimum-learning-source.ts`. Le invarianti e il gate sono in `lib/learning-taxonomy.ts`.

## Regola di inclusione

Le 148 unita sono i target tassonomici specifici richiesti nel testo del livello Minimo: specie, concetti *sensu lato*, gruppi, sezioni, sottosezioni, sottogeneri e gli altri target esplicitamente richiesti a risoluzione inferiore alla semplice intestazione generale.

Le intestazioni per le quali il requisito minimo e soltanto la determinazione del genere non vengono duplicate come schede-specie. Alimentano il lotto dedicato alle schede di genere.

Non diventano unita autonome:
- esempi citati solo per spiegare un rischio o una proprieta;
- frammenti di prosa catturati dal vecchio parser;
- nomi presenti soltanto come chiarimento non richiesto come target di determinazione;
- sinonimi o combinazioni precedenti quando servono solo a documentare la stessa unita didattica.

## Rango didattico

Il rango richiesto dalla fonte e vincolante. In particolare:
- `s.l.` non viene pubblicato come specie stretta;
- `sez.` resta `section`;
- `sottogenere` resta `subgenus`;
- i gruppi collettivi restano `speciesGroup` o altro rango collettivo appropriato.

La fonte del corso specifica che il livello minimo puo richiedere specie singole o collettive, sezioni e gruppi: il modello dati deve quindi poter rappresentare tutte queste risoluzioni senza forzare una determinazione a specie.

## Separazione 148 -> 141

Le **148 unita didattiche** sono il contratto didattico e non possono essere eliminate per far coincidere il catalogo con la nomenclatura corrente.

Il target dei **141 riferimenti correnti** appartiene invece al livello nomenclaturale. Ogni unita deve essere collegata a un riferimento corrente verificato oppure mantenuta esplicitamente come concetto di gruppo/sezione non riducibile a una singola specie. Il mapping viene pubblicato solo dopo controllo delle sinonimie, dei trasferimenti di genere e delle ambiguita.

## Difetti del generatore storico

`scripts/generate-atlas-taxa.mjs` non e una fonte autorevole per il Lotto 2: il suo regex storico estrae binomi e li forza a `species`.

Sono gia documentati:
- frammenti spurii come `Armillaria come`, `Boletus sez`, `Ramaria colorate`;
- omissioni quando il genere moderno e fra parentesi, per esempio `Boletus (Rubroboletus) satanas`, `Boletus (Neoboletus) erythropus s.l.`, `Boletus (Suillellus) luridus`;
- perdita della risoluzione di sezioni, gruppi e concetti *sensu lato*.

L'elenco strutturato delle anomalie e in `data/minimum-learning-audit.json`.

## Gate di completamento

Per chiudere il Lotto 2 devono essere vere contemporaneamente tutte le condizioni seguenti:

1. 148/148 unita sorgente presenti.
2. Nessun artefatto di parsing.
3. Rango didattico conservato per ogni unita.
4. Mapping nomenclaturale completato e verificato.
5. Cardinalita corrente coerente con il target approvato di 141 riferimenti.
6. Nessuna unita in stato `reviewNeeded`.
7. Test di inventario verdi.
8. Nessuna release pubblica generata dal catalogo incompleto.

Solo dopo questo gate si passa in modo massivo alla compilazione delle schede Minimo.
