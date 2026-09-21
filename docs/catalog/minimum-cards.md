# Lotto 4 — Schede progressive Minimo

## Stato del corpus

Il corpus Minimo e composto da **148 schede**, una per ciascuna unita didattica S1.

Ogni scheda contiene:

- identita didattica e rango corretto;
- nome visualizzato secondo il mapping nomenclaturale del Lotto 2B;
- terminologia essenziale;
- caratteri macroscopici minimi;
- sintesi ecologica;
- confusioni prioritarie quando previste dal profilo;
- stato alimentare provvisorio con collegamento alla pagina S2;
- trattamenti espliciti quando la categoria provvisoria e condizionata;
- lista dei claim che sostengono la scheda;
- stato editoriale.

## Profondita informativa progressiva

Questo lotto implementa il primo livello della profondita informativa progressiva.

La scheda `minimum` deve essere leggibile da uno studente e fornire i caratteri da osservare prima di accedere ai livelli successivi. Non deve tentare di condensare nella vista base tutti i caratteri microscopici, molecolari e specialistici.

I livelli Auspicabile e Approfondimento restano record distinti e verranno collegati alla stessa identita tassonomica senza sovraccaricare la vista Minimo.

## Provenienza

I dati documentati da S1, S2 e fonti nomenclaturali restano separati dalle sintesi editoriali.

Le sintesi di morfologia/ecologia introdotte in questo lotto hanno:

- fonte `EDITORIAL-minimum-card-synthesis-v1`;
- `evidenceStrength = uncertain`;
- `reviewStatus = reviewNeeded`.

Non vengono quindi presentate come contenuto micologico gia approvato. Il lotto di revisione scientifica potra approvare o correggere singoli claim.

## Commestibilita

La categoria presente nelle schede del checkpoint e un **crosswalk provvisorio** fra l'inventario S1 e la pagina S2 associata.

Ogni claim alimentare:

- punta alla fonte S2;
- conserva la pagina collegata alla voce;
- usa `primaryInferred`;
- rimane `reviewNeeded`;
- mostra un avviso che la scheda non autorizza il consumo.

Solo la revisione puntuale del testo S2 potra trasformare il claim in `reviewed/approved`.

## Sicurezza e confusioni

Sono state introdotte confusioni prioritarie per i nuclei ad alto rischio, tra cui:

- Amanita del gruppo falloideo;
- Amanita pantherina/muscaria;
- Galerina marginata group;
- piccole Lepiota a rischio falloideo;
- Cortinarius orellanus/orellanoides;
- Omphalotus vs Cantharellus;
- Hygrophoropsis vs Cantharellus;
- boleti tossici del gruppo Luridi;
- Gyromitra esculenta vs ascomiceti primaverili.

Le confusioni `deadly` devono avere almeno due caratteri discriminanti e un claim dedicato.

## Gate automatico

Il Lotto 4 fallisce se:

1. il numero di schede e diverso da 148;
2. due schede puntano alla stessa unita didattica;
3. terminologia, morfologia, ecologia o sicurezza contengono segnaposto;
4. manca la catena claim/evidence;
5. una commestibilita condizionata non dichiara trattamenti;
6. una confusione non ha caratteri discriminanti o provenance;
7. una confusione mortale ha meno di due caratteri discriminanti;
8. un contenuto editoriale viene marcato come approvato senza revisione.

## File principali

- `lib/minimum-card.ts` — contratto e validatore;
- `lib/minimum-card-content.ts` — profili descrittivi Minimo;
- `lib/minimum-card-safety.ts` — crosswalk alimentare provvisorio;
- `lib/minimum-card-editorial.ts` — evidence e claim delle sintesi;
- `lib/minimum-cards.ts` — assemblaggio delle 148 schede;
- `lib/minimum-card.test.ts` — gate completo sul corpus.
