# Copertura delle fonti del catalogo beta

## Stato del perimetro S1

- **124** intestazioni tassonomiche estratte dal documento *Obiettivi tassonomici nella formazione dei micologi* V4 del 09.06.2026.
- **148** unità didattiche specifiche del livello Minimo ricostruite e conservate al rango richiesto dalla fonte.
- **148/148** unità con mapping nomenclaturale esplicito.
- Mapping: **96 accepted**, **49 sourceConcept**, **3 definedSet**, **0 conflict**, **0 unresolved**.
- **134** nomi correnti unici risultano dalle asserzioni nomenclaturali verificabili; questo numero è una metrica, non un obiettivo da forzare.
- Il precedente valore progettuale 141 è conservato soltanto per tracciabilità storica.

## Evidenze e provenienza

Il Lotto 3 introduce un registro strutturato di fonti ed evidenze.

- **148/148** unità Minimo hanno una evidenza didattica S1 con pagina e intestazione.
- Le evidenze nomenclaturali sono normalizzate dalla riconciliazione e mantengono il collegamento al record sorgente.
- **124/124** intestazioni hanno un indice di raccordo fra pagina S1 e pagina S2.
- S1 è autorità per perimetro e risoluzione didattica.
- S2 (*Guida ragionata alla commestibilità dei funghi*, Regione Piemonte, 2021) è l'unica autorità primaria del catalogo per categoria alimentare e trattamenti.
- Index Fungorum e le fonti peer-reviewed registrate sono autorità complementari per la nomenclatura.

I file principali sono:

- `data/catalog/sources.json`
- `data/catalog/evidence.json`
- `data/catalog/source-page-index.json`
- `lib/catalog-evidence.ts`
- `lib/minimum-learning-source.ts`
- `lib/minimum-nomenclature.ts`

## Stato S2

Il raccordo di pagina verso S2 è completo per le 124 intestazioni, ma l'estrazione strutturata delle singole valutazioni alimentari e dei trattamenti appartiene al lotto successivo.

Fino a quando una scheda non possiede una evidenza S2 `edibility` approvata:

- la categoria pubblicabile è forzata a `non-valutato`;
- le vecchie categorie provenienti dal seed o dal parser storico non sono mostrate come valutazioni autorevoli;
- le istruzioni alimentari storiche non sbloccano il gate di pubblicazione.

## Regola di modellazione

La precisione della fonte è vincolante. Generi, sezioni, sottogeneri, gruppi e concetti `s.l.` non vengono trasformati artificialmente in specie.

Quando una singola formulazione S1 comprende oggi più taxa correnti distinti, viene usato `definedSet`. Questo conserva il contratto didattico senza creare sinonimie false.

## Riproducibilità

I controlli bloccanti sono eseguibili con:

```sh
pnpm catalog:evidence:check
node --experimental-strip-types scripts/verify-index-fungorum.mjs
pnpm test
pnpm lint
pnpm build
```

Una release non può essere dichiarata scientificamente completa se presenta unità S1 mancanti, mapping irrisolti, evidenze senza fonte, claim alimentari non riconducibili a S2 o claim sensibili non approvati.
