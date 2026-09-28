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


## Scientific Baseline 1.0 — 28.09.2026

L'audit trasversale dei **148/148 profili Minimo** e concluso e materializzato in
`lib/minimum-field-profiles.ts`.

Per ogni unita S1 la baseline espone:

- **3 caratteri principali di campo**, obbligatoriamente osservabili senza reagenti;
- **+1 carattere differenziante/supportivo** di campo;
- stato diagnostico esplicito, evitando il generico `macro_limit`;
- eventuale nota di conferma specialistica separata dal 3+1;
- eventuale `safetyCheck`, indipendente dalla confidenza tassonomica.

Regole automatiche della baseline:

- 148 profili per 148 unita S1, senza mancanti o orfani;
- esattamente 3 caratteri primari + 1 per ogni profilo;
- zero `source_gap`, zero `pending`, zero `macro_limit` generici;
- nessun KOH/Schaffer/reagente, microscopia, DNA o assaggio nel livello base 3+1;
- 3 safety check espliciti: `Kuehneromyces mutabilis`,
  `Leucoagaricus leucothites s.l.`, `Volvariella volvacea`.

La baseline e marcata **reviewed** come audit scientifico interno cross-source, ma non
viene confusa con la revisione micologica indipendente: quest'ultima resta un gate
separato per l'approvazione finale dei claim di sicurezza e commestibilita.

### UI

Ogni scheda Minimo mostra prima del contenuto esteso una **Scheda rapida scientifica**
con:

1. carattere principale 1;
2. carattere principale 2;
3. carattere principale 3;
4. +1 differenziante;
5. stato diagnostico;
6. eventuale limite di risoluzione;
7. eventuale safety check.

Il contenuto editoriale generico preesistente resta soggetto alle precedenti policy
`reviewNeeded`; la nuova scheda 3+1 usa invece la baseline auditata e revisionata.

### Gate

I test di completezza sono in `lib/minimum-field-profiles.test.ts`.
Il release gate verifica inoltre:

- 148 profili;
- 0 errori di validazione;
- 148 claim 3+1;
- 148 evidenze 3+1;
- esattamente 3 safety check.
