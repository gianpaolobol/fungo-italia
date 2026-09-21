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

### Lotto 6 — 67 schede di genere correnti
Stato: **IN AVVIO**

Task:
- [ ] 6.1 derivare e congelare l'inventario dei 67 generi correnti dal mapping delle 148 unita;
- [ ] 6.2 conservare alias e nomi storici provenienti dai generi nominali S1;
- [ ] 6.3 definire contratto della scheda di genere con profondita progressiva;
- [ ] 6.4 generare 67 schede senza segnaposto;
- [ ] 6.5 collegare specie/gruppi Minimo alle schede di genere;
- [ ] 6.6 test di cardinalita, unicita, alias e copertura;
- [ ] 6.7 CI verde.

### Lotto 7 — Filtri server e ricerca
Stato: **NON AVVIATO**
- filtri tassonomici e didattici server-side;
- ricerca per nome corrente, storico, sinonimo e regionale;
- test di query e prestazioni di base.

### Lotto 8 — Navigazione Genere -> specie/gruppi
Stato: **NON AVVIATO**
- gerarchia navigabile;
- profondita informativa progressiva;
- ritorno stabile alla lista e mantenimento filtri.

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

**6.1 — Inventario riproducibile dei 67 generi correnti.**

Il task deve derivare i generi dal mapping nomenclaturale gia verificato, non da una lista manuale non tracciabile. Se il conteggio derivato non coincide con 67, il task deve fermarsi e produrre un audit delle differenze invece di forzare il numero.
