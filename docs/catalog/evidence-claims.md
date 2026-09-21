# Evidenze, citazioni e claim scientifici — Lotto 3

## Obiettivo

Ogni informazione scientifica pubblicabile deve essere riconducibile a una fonte registrata e a una posizione verificabile nella fonte. Il catalogo non tratta più una semplice stringa di citazione come prova sufficiente.

La catena minima è:

`Source -> Evidence -> subject/claim -> review status -> publication gate`

## Fonti autoritative

Il registro `data/catalog/sources.json` assegna a ogni fonte un ruolo esplicito.

- **S1 — training**: *Obiettivi tassonomici nella formazione dei micologi*, V4 09.06.2026. Controlla perimetro, livello didattico e risoluzione richiesta.
- **S2 — edibility**: Sitta, Davoli, Floriani & Suriano (2021), *Guida ragionata alla commestibilità dei funghi*, Regione Piemonte, ISBN 979-12-200-9297-5. Controlla categoria alimentare e trattamenti.
- **Index Fungorum — nomenclature**: verifica dei nomi correnti e dei trasferimenti nomenclaturali.
- **Alvarado et al. 2022 — nomenclature**: fonte peer-reviewed usata per il caso `Amanita vidua`.

Una fonte non può essere usata fuori dal proprio ruolo autoritativo quando il claim è vincolante. In particolare, un'affermazione `edibility` o `treatment` non può essere validata con S1.

## Inventario delle evidenze

### Evidenze didattiche S1

`data/catalog/evidence.json` contiene una evidenza diretta per ciascuna delle **148 unità Minimo**.

Ogni record conserva:

- identificatore stabile;
- unità didattica soggetto;
- `sourceId`;
- pagina e intestazione;
- tipo claim `training`;
- sintesi originale breve;
- forza dell'evidenza;
- processo di estrazione;
- stato di revisione.

Il testo esteso della fonte non viene replicato nel record.

### Evidenze nomenclaturali

Le evidenze della riconciliazione 148/148 vengono normalizzate a runtime da `lib/minimum-nomenclature.ts` verso lo stesso modello `CatalogEvidence`.

Le fonti S1 usate per conservare un gruppo o una sezione restano evidenze di tipo `training`; Index Fungorum e la letteratura peer-reviewed producono evidenze `taxonomy`.

### Indice S1 -> S2

`data/catalog/source-page-index.json` contiene **124 righe**, una per ogni intestazione tassonomica del documento S1, con:

- pagina S1;
- pagina della Guida S2 corrispondente;
- identificatore della fonte;
- posizione testuale normalizzata.

Questo indice è il punto di partenza vincolante del lotto successivo per estrarre categorie alimentari e trattamenti senza utilizzare il testo S1 come autorità alimentare.

## Gate di autorità

`lib/catalog-evidence.ts` applica queste regole bloccanti:

1. tutti gli ID di fonte ed evidenza devono essere unici;
2. le fonti remote devono avere URL HTTPS e data di accesso;
3. ogni evidenza deve avere fonte, posizione, subject, claim e sintesi;
4. i claim `training` devono usare una fonte con ruolo `training`;
5. i claim `taxonomy` devono usare una fonte con ruolo `nomenclature`;
6. i claim `edibility` e `treatment` devono usare una fonte con ruolo `edibility`;
7. tutti i 148 target Minimo devono avere esattamente una evidenza didattica S1;
8. tutte le evidenze della riconciliazione nomenclaturale devono restare collegate al mapping di origine;
9. le 124 righe dell'indice S1/S2 devono coincidere con i riferimenti di pagina estratti dalle fonti;
10. un claim sensibile non può essere pubblicato finché non è `approved`.

## Blocco preventivo delle vecchie categorie alimentari

Le categorie alimentari presenti nel vecchio seed e nel vecchio parser non sono più considerate pubblicabili per il solo fatto di esistere nel JSON.

`guardTaxonSensitiveFields()` forza temporaneamente:

- `edibility = non-valutato`;
- nota esplicita di evidenza S2 mancante;

finché al `taxonId` non è collegata una evidenza `edibility` S2 in stato `approved`.

Questo impedisce che valori storici derivati da S1 o da seed dimostrativi vengano mostrati come valutazioni alimentari autorevoli.

## Comandi di verifica

```sh
pnpm catalog:evidence:check
node --experimental-strip-types scripts/verify-index-fungorum.mjs
pnpm test
pnpm lint
pnpm build
```

Il Lotto 3 è chiudibile solo con tutti i comandi verdi.

## Passaggio al lotto successivo

Il lotto successivo può popolare le 148 schede Minimo con categorie alimentari, condizioni e trattamenti. Ogni valore dovrà essere estratto da S2, collegato a una evidenza del registro e approvato prima di rimuovere il blocco `non-valutato`.
