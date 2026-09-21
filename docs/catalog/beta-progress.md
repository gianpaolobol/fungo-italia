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
Stato: **IN CORSO**
- [ ] 8.1 contratto di navigazione e stato URL;
- [x] 8.2 vista scheda genere/gruppo con livelli progressivi;
- [x] 8.3 navigazione ai taxa Minimo figli;
- [ ] 8.4 ritorno stabile a ricerca/filtri;
- [ ] 8.5 test integrazione e gate CI.

### Lotto 9 — QA mobile, mappa e accessibilita
Stato: **NON AVVIATO**
- 320, 375, 768 e desktop;
- overflow, touch target, tastiera, focus, loading/error/empty;
- regressioni mappa.

### Lotto 10 — Revisione micologica
Stato: **NON AVVIATO**
- revisione sistematica dei claim `reviewNeeded`;
- priorita a tossicita, confusioni mortali, commestibilita e morfologia discriminante;
- nessuna promozione automatica ad `approved`.

### Lotto 11 — Gate indipendente finale
Stato: **NON AVVIATO**
- copertura;
- fonti;
- licenze;
- nomenclatura;
- contenuti;
- test/lint/build;
- audit dei conflitti.

### Lotto 12 — Beta completa
Stato: **NON AVVIATO**
- merge soltanto dopo gate finale verde;
- build esatta del commit verificato;
- pubblicazione e controllo finale.

## Prossimo task eseguibile

**8.4 — Ritorno stabile a ricerca/filtri e contesto precedente.**

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
