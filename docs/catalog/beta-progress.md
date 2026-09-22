# Beta completa — registro di avanzamento operativo

Questo file e il punto di ripresa persistente del lavoro. Ogni task viene chiuso con commit separato e CI verde prima di passare al successivo.

## Regola operativa

Per evitare perdite di lavoro o messaggi troppo lunghi:

1. ogni task deve essere piccolo e autonomo;
2. ogni task produce uno o piu file verificabili;
3. ogni checkpoint viene committato subito sul branch di lavoro;
4. dopo ogni modifica strutturale si attende la CI;
5. nessun lotto viene dichiarato chiuso senza gate verde;
6. questo file viene aggiornato quando cambia lo stato dei lotti.

Branch di lavoro: `feat/stable-learning-taxonomy-v1`.

## Lotti completati

### Lotto 2A — Inventario didattico Minimo
Stato: **CHIUSO**
- 148/148 unita didattiche S1.
- rango didattico conservato.
- zero artefatti del parser storico.

### Lotto 2B — Riconciliazione nomenclaturale
Stato: **CHIUSO**
- 148/148 mapping.
- accepted: 96.
- sourceConcept: 49.
- definedSet: 3.
- conflict: 0.
- unresolved: 0.
- verifica automatica Index Fungorum attiva in CI.

### Lotto 3 — Source / Evidence / Claim
Stato: **CHIUSO**
- registro fonti canoniche.
- 148 claim `training.minimum`.
- 148 evidenze S1.
- catena `learningUnit -> claim -> evidence -> source`.
- validatori di provenienza attivi.

### Lotto 4 — 148 schede progressive Minimo
Stato: **CORPUS ASSEMBLATO; REVISIONE SCIENTIFICA ANCORA APERTA**
- 148/148 schede generate.
- nomenclatura collegata.
- morfologia ed ecologia editoriali collegate a claim/evidence.
- crosswalk S2 provvisorio collegato a claim/evidence.
- confusioni prioritarie ad alto rischio presenti.
- contenuti editoriali marcati `reviewNeeded`, non falsamente approvati.

### Lotto 5 — Immagini e licenze
Stato: **INFRASTRUTTURA CHIUSA**
- resolver Wikimedia Commons con controllo licenza.
- ammesse CC0, pubblico dominio, CC BY, CC BY-SA.
- esclusi NC, ND e metadati incompleti.
- match tassonomico obbligatorio.
- distinzione exactTaxon / definedSetMember / representativeGenus.
- fonte, autore e licenza esposte nella UI.
- assenza di una foto verificata non blocca la scheda: viene mostrato lo stato galleria in preparazione.

Checkpoint precedente verificato: `7033a3849b886c0052905504cffc9b7a3e4d0620`.

## Lotti ancora da completare

### Lotto 6 — Schede di genere/gruppo e indice dei generi correnti
Stato: **CHIUSO**

Audit riproducibile:
- 66 obiettivi S1-Minimo di rango `genus` o `operationalGroup` (46 + 20);
- 61 generi nominali presenti direttamente nelle 148 unita specifiche;
- 73 generi correnti distinti nei 134 nomi correnti verificati;
- il vecchio target 55 -> 67 non e riproducibile e non viene forzato.

Task:
- [x] 6.1A auditare la cardinalita storica 67 contro il mapping verificato;
- [x] 6.1B congelare le 66 unita didattiche S1 di genere/gruppo;
- [x] 6.2 costruire il mapping unita didattica -> generi correnti dei taxa figli, mantenendo separati i generi sorgente;
- [x] 6.3 definire contratto della scheda di genere con profondita progressiva;
- [x] 6.4A assemblare le 66 schede didattiche;
- [x] 6.4B collegare claim/evidence ai tre livelli;
- [x] 6.4C gate completo senza segnaposto e con 66/66 schede;
- [x] 6.5 collegare specie/gruppi Minimo e indice dei generi correnti;
- [x] 6.6 test di cardinalita, unicita, alias e copertura;
- [x] 6.7 CI verde.

### Lotto 7 — Filtri server e ricerca
Stato: **CHIUSO**
- [x] 7.1 motore puro server-side di ricerca e filtri;
- [x] 7.2 integrazione API paginata mantenendo compatibilita con il catalogo esistente;
- [x] 7.3 collegamento UI ai filtri server-side con fallback legacy;
- [x] 7.4 test integrazione e gate CI.

Il motore 7.1 indicizza 214 documenti: 66 schede genere/gruppo + 148 schede Minimo. Cerca nomi sorgente e correnti, supporta abbreviazioni, filtri per tipo, rango, genere, commestibilita e stato di revisione.

### Lotto 8 — Navigazione Genere -> specie/gruppi
Stato: **CHIUSO**
- [x] 8.1 contratto di navigazione e stato URL;
- [x] 8.2 vista scheda genere/gruppo con livelli progressivi;
- [x] 8.3 navigazione ai taxa Minimo figli;
- [x] 8.4 ritorno stabile a ricerca/filtri;
- [x] 8.5 integrazione UI reale + test integrazione e gate CI.

Gate finale Lotto 8:
- Atlante strutturato come superficie primaria anche senza filtri;
- 214/214 documenti di ricerca aprono una scheda reale;
- navigazione gruppo -> figlio -> gruppo -> risultati preserva query, filtri e profondita;
- apertura diretta di un taxon Minimo funziona senza parent artificiale;
- stato URL riproducibile;
- CI: 168 test, 168 pass, 0 fail; Index Fungorum 134/134; lint 0 errori; build riuscita.

### Lotto 9 — QA mobile, mappa e accessibilita
Stato: **GATE AUTOMATIZZATO CHIUSO; SMOKE VISUALE LIVE DEFERITO AL LOTTO 12**
- [x] overflow orizzontale bloccato a livello globale;
- [x] touch target principali >=44 px;
- [x] safe-area per drawer e CTA mobile;
- [x] focus visibile globale;
- [x] preferenza reduced-motion rispettata anche dalla mappa;
- [x] stato selezione esposto con aria-pressed;
- [x] mappa con regione accessibile, loading annunciato e fallback selezionabile;
- [x] stati loading/error/empty/forbidden coperti;
- [x] contratti responsive mobile/tablet/desktop testati;
- [x] regressioni worker e geometria mappa testate;
- [ ] smoke visuale reale a 320, 375, 768 e 1440 px sul deployment finale.

Gate automatizzato: 184 test, 184 pass, 0 fail; lint 0 errori; build riuscita.

### Lotto 10 — Revisione micologica
Stato: **CODA SCIENTIFICA APERTA; BETA PRIVATA RESA SICURA**
- coda: 616 claim `reviewNeeded`, deduplicati in 295 batch;
- 98 batch critici, 137 high, 60 normal;
- nessuna promozione automatica ad `approved`;
- commestibilita, confusioni e descrizioni non revisionate sono escluse dalla proiezione pubblica;
- anche le sintesi genere/gruppo `reviewNeeded` sono ora nascoste;
- l'indice di ricerca pubblico non usa piu morfologia/ecologia non revisionata;
- il campo interno `searchText` non viene piu restituito dall'API.

La revisione indipendente resta necessaria per rendere pubblici i contenuti scientifici nascosti, ma non blocca una beta privata che non li espone.

### Lotto 11 — Gate indipendente finale
Stato: **CHIUSO PER BETA PRIVATA**
- [x] copertura 148 + 66 + 214;
- [x] nomenclatura: 0 conflict, 0 unresolved;
- [x] policy pubblica: 0 leak scientifici non revisionati;
- [x] gate beta privata separato dal gate di completamento scientifico;
- [x] comandi `pnpm beta:check` e `pnpm science:check`;
- [x] smoke reale Chromium sui 4 viewport;
- [x] gate beta privata verde sul release candidate.

La revisione micologica indipendente resta un percorso separato: blocca la pubblicazione dei claim scientifici nascosti, non la disponibilita della beta privata sicura.

### Lotto 12 — Beta privata completa
Stato: **COMPLETATO E MERGIATO SU MAIN**
- [x] PR #1 aperta e verificata;
- [x] CI completa verde;
- [x] Visual Smoke verde a 320x568, 375x812, 768x1024 e 1440x900;
- [x] merge su `main`;
- [x] commit di merge: `d32884f0a964c2f27eb0cacac118eaf296937504`;
- [x] CI e Visual Smoke configurati anche su `main`.

Il catalogo scientificamente completo resta intenzionalmente distinto dalla beta privata: 616 claim `reviewNeeded` restano nel workflow editoriale e non sono esposti come fatti pubblici.

## Prossimo task eseguibile

**Track scientifico post-beta — revisione indipendente dei 295 batch deduplicati.**

La beta privata non richiede ulteriori implementazioni strutturali. Il lavoro successivo riguarda la promozione controllata dei claim nascosti da `reviewNeeded` a `reviewed/approved` dopo verifica micologica indipendente.

Checkpoint Lotto 7:
- indice ricerca: 214 documenti (66 + 148);
- ricerca nome sorgente/corrente e abbreviazioni;
- filtri server per tipo, rango, genere, commestibilita, revisione;
- API retrocompatibile;
- UI con fallback locale in caso di errore;
- CI finale: 145 test, 145 pass, 0 fail; lint 0 errori; build riuscita.

Il Lotto 8 deve rendere apribili le schede senza perdere query e filtri quando l'utente torna all'elenco.


### Checkpoint 8.2
- view model progressivo separato per Essenziale / Approfondimento / Specialistico;
- identita e lista figli preservate durante il cambio di profondita;
- livelli disponibili derivati dagli obiettivi S1 realmente presenti;
- lookup stabile tramite cardId URL;
- CI: 157 test, 157 pass, 0 fail; lint 0 errori; build riuscita.


### Checkpoint 8.3
- validazione che un taxon figlio appartenga realmente al gruppo aperto;
- apertura del figlio come `minimumTaxon` a profondita Essenziale;
- query e filtri invariati durante la transizione;
- lookup delle schede figlie dal corpus persistito;
- errori sicuri per gruppo o figlio sconosciuti;
- CI verde.


### Checkpoint 8.4
- contesto di ritorno parent salvato nello stato URL;
- apertura figlio conserva gruppo padre e profondita precedente;
- ritorno al gruppo ripristina la profondita;
- in assenza di parent il ritorno chiude la scheda senza perdere i filtri;
- CI verde.


### Chiusura Lotto 8
Checkpoint finale: `95c9d5339ca3f6dec3230f52af30ab557f43030a`.
Il catalogo legacy resta soltanto come fallback degradato se l'API strutturata non e disponibile.


### Checkpoint Lotto 9 automatizzato
- commit QA: `ef614acdc0244fa72ef754d9f66d2c712acda751`;
- 184 test / 184 pass / 0 fail;
- Index Fungorum 134/134;
- build verde.
La verifica visuale reale dei quattro viewport resta bloccante prima della pubblicazione, non viene considerata implicitamente eseguita.


### Checkpoint sicurezza scientifica beta privata
- claim ancora in revisione: mantenuti nel repository ma non pubblicati come fatti;
- schede Minimo: morfologia/ecologia visibili solo da `reviewed`, sicurezza solo da `approved`;
- schede genere/gruppo: contenuto editoriale nascosto finche non `reviewed`;
- API search: nessun `searchText` interno esposto;
- ricerca pubblica: non indicizza descrizioni scientifiche `reviewNeeded`;
- gate finale distingue `ready` (beta privata sicura) da `scientificReady` (catalogo scientificamente revisionato).

### Smoke visuale automatizzato
Workflow `.github/workflows/visual-smoke.yml` usa Chromium reale con autenticazione QA ai viewport:
`320x568`, `375x812`, `768x1024`, `1440x900`.
Controlla overflow orizzontale, apertura Atlante e apertura scheda e produce screenshot artifact.


### Release privata completata
- PR: #1
- merge commit: `d32884f0a964c2f27eb0cacac118eaf296937504`
- ultimo release candidate verificato prima del merge: `54be658bd610420c7854778526626d75eed3ddc0`
- gate privato: READY
- completamento scientifico indipendente: ancora aperto e separato
