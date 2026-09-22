# Schede di genere/gruppo — profondita informativa progressiva

## Scopo

Le schede di genere/gruppo costituiscono il livello didattico sopra le 148 schede Minimo specifiche.

La vista non deve mostrare tutto contemporaneamente. Il contenuto e organizzato in tre livelli progressivi:

1. **Essenziale** — cio che lo studente deve riconoscere subito;
2. **Approfondimento** — caratteri discriminanti, note tassonomiche e differenze utili dopo il livello base;
3. **Specialistico** — temi avanzati, microscopia, variabilita e contenuti indicati da S1 come approfondimenti.

## Livello Essenziale

Sempre obbligatorio.

Contiene:
- sintesi dell'obiettivo Minimo S1;
- terminologia fondamentale;
- caratteri macroscopici di base;
- avvisi di sicurezza pertinenti;
- collegamenti alle schede Minimo figlie;
- claim/evidence che sostengono il contenuto.

Una scheda priva di terminologia o caratteri macroscopici non supera il gate.

## Livello Approfondimento

Presente quando S1 contiene un obiettivo Auspicabile o quando esistono caratteri discriminanti utili da sottoporre a revisione.

Contiene:
- sintesi dell'obiettivo Auspicabile;
- caratteri discriminanti;
- note tassonomiche;
- relazione tra nome didattico storico e generi correnti;
- claim/evidence dedicati.

Se il livello e presente, non puo esistere senza provenance.

## Livello Specialistico

Presente quando S1 contiene Approfondimenti oppure quando vengono aggiunti contenuti specialistici revisionati.

Contiene:
- sintesi dell'obiettivo specialistico;
- microscopia;
- variabilita;
- problemi di delimitazione tassonomica;
- eventuali approfondimenti molecolari o nomenclaturali;
- claim/evidence dedicati.

## Separazione tra unita didattica e nomenclatura corrente

La scheda conserva sempre:

- `sourceLabel`: formulazione S1;
- `sourceGenera`: generi storici/didattici espliciti;
- `currentGenera`: generi correnti verificati nei taxa figli;
- `minimumChildCardIds`: collegamenti alle schede specifiche Minimo.

Questi campi non sono intercambiabili.

Una unita come `Clitocybe s.l.` resta una singola unita didattica anche se i taxa figli sono oggi distribuiti fra piu generi.

## Cardinalita

Il layer didattico riproducibile comprende **66 unita di genere/gruppo S1-Minimo**:

- 46 di rango `genus`;
- 20 di rango `operationalGroup`.

Il precedente target 67 non viene usato come gate perche non coincide con gli insiemi derivabili dalla pipeline corrente.

## Gate

Il task fallisce se:

1. il numero di schede didattiche e diverso da 66;
2. due schede usano la stessa `teachingUnitId`;
3. il livello Essenziale e incompleto o contiene segnaposto;
4. un livello Approfondimento/Specialistico presente non ha claim collegati;
5. i generi sorgente sono duplicati;
6. i generi correnti sono duplicati;
7. una scheda collega due volte la stessa scheda Minimo figlia;
8. viene confuso il nome didattico S1 con la nomenclatura corrente.

## File

- `lib/minimum-genus-source.ts` — 66 unita sorgente;
- `lib/minimum-genus-map.ts` — mapping verso generi correnti dei taxa figli;
- `lib/minimum-genus-card.ts` — contratto delle schede progressive;
- `lib/minimum-genus-card.test.ts` — gate del contratto.
