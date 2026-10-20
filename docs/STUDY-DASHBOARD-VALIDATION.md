# Dashboard — registro di implementazione e validazione
20 ottobre 2026. Branch design/study-dashboard-v1-1, nuova release separata da main.

## Implementato
Archivio locale serializzato, migrazione non distruttiva e conservazione del checkpoint Base anche dopo altre sessioni annuali.
Indice per competenze con pesi 40/25/20/15, errori critici, evidenza indipendente e revisioni della banca.
Allenamento adattivo e simulazione senza suggerimenti né feedback durante la prova.
Dashboard con nome facoltativo locale, saluto, crescita del fungo, archivio completo in sola lettura e dettaglio degli errori.
Supporto al prodotto Base non consumabile e annuale esistente, verifica StoreKit, ripristino e scadenza; nuovi annuali proposti solo a chi possiede Base. Gli annuali legacy validi restano riconosciuti senza Base.

## Verificato
- Baseline precedente: 15/15 test pertinenti e TypeScript.
- Nuove regressioni: test scritti prima del fix per archivio/quota, preparazione, scheduler, simulazione, diritti e modello Dashboard.
- Suite completa locale: vedere ultimo risultato nel PR; non confondere test Node con prova acquisti sul dispositivo.
- Esportazione iOS Expo riuscita sul primo commit implementativo.
- Workflow Validate study dashboard riuscito sul commit 9f5a1d6.

## Revisione indipendente
Corrette le criticità: stadio ripasso incrementato per ogni dimensione invece che per sessione; perdita checkpoint Base; cambio annuale/Base con componente esame non rimontato; acquisto annuale nuovo senza Base; archivio oltre cinque sessioni non accessibile dopo scadenza.
Decisione: mantenere prudente il denominatore del programma. La banca ha 89 specie interrogabili; ulteriori unità senza domanda restano da valutare e la Dashboard indica esplicitamente che la stima è parziale. Il 100% non è raggiungibile finché la banca non copre tutto il programma. Non inventare domande scientifiche per riempire il conteggio.
Minori differiti: snapshot storico separato dell'indice e record personale massimo; nomi delle specie nelle tre lacune sintetiche (i nomi restano nel dettaglio degli errori della sessione).

## Gate ancora aperti
- Compilazione Swift e integrazione StoreKit su macOS, incluse nuova fixture Base e prove UI iPhone/iPad.
- Prova visiva screenshot, testo grande, VoiceOver e dispositivo iPhone 13 mini.
- Creazione/configurazione Apple del prodotto it.fungoitalia.base.lifetime, prezzo Italia 9,99 EUR, localizzazioni e screenshot di revisione. Il codice riconosce questo ID ma non attesta che il prodotto esista già.
- Nuovo binario firmato, upload TestFlight, verifica fisica e nuova submission. Nessun caricamento o pubblicazione attesta queste funzioni finché questi passaggi non sono conclusi.
- Scientific readiness mantiene i propri gate indipendenti.

## Privacy e distribuzione
Nome e progressi restano sul dispositivo; nessun nuovo account o servizio di sincronizzazione. La quota Base è locale, con il limite confermato dal titolare per reinstallazione/cancellazione dati/dispositivi diversi.
Nessun prodotto Apple esistente, risposta fiscale o questionario privacy è stato modificato durante lo sviluppo.
La versione App Store 1.0 è WAITING_FOR_REVIEW con build 9; TestFlight interno usa build 11. Vedere ALIGNMENT-2026-10-20.md.

## Completamento approvato il 20 ottobre
Il piano integrativo è `docs/superpowers/plans/2026-10-20-dashboard-completion.md` e supera le precedenti note sui minori differiti per nomi nelle lacune e confronto dei risultati.
- Anteprima gratuita: cinque schede e tre casi guidati, senza salvataggio di quota o progressi.
- Preparazione dimostrata distinta dalla copertura; il fungo mantiene l'indice complessivo prudente. Algoritmo derivato versione 2, senza riscrivere lo storico.
- Nomi nelle lacune, ultima valutazione, miglior risultato e confronto separato fra allenamenti e simulazioni autonome concluse sulla banca corrente.
- “Simulazione didattica” esplicita nell'interfaccia.
- Inventario riproducibile `node scripts/study-coverage.mjs --write`, risultato in `docs/STUDY-COVERAGE.md`: 59 minimi esclusi (52 gruppi/denominazioni composite e 7 specie), 66 unità aggiuntive senza caso. La copertura scientifica completa resta aperta.
- Verifiche locali: 124/124 test Node, TypeScript PASS, export iOS PASS (bundle caae3d2cd880b09e13c28f4181b346d3).
- StoreKit nativo PASS: run 39383665613 sul precedente codice acquisti invariato. UI iPhone/iPad run39383665654 fallita durante compilazione del test (API iOS17); aggiunta disponibilità iOS17 alla sola classe di test e ripristinate acquisizioni richieste. Nuova verifica UI ancora necessaria.
- Nessuna verifica fisica iPhone13mini o attestazione VoiceOver. Nessun nuovo binario distribuito e prodotto Base Apple ancora da configurare.

### Revisione del completamento
Revisione indipendente senza criticità nuove nella dimostrazione o negli indicatori. Individuato e corretto un difetto preesistente: la sessione Base ripresa sotto annuale aggiornava solo il checkpoint corrente; ora aggiorna anche quello Base prima di iniziare altre sessioni. Regressione osservata RED→GREEN; suite completa 125/125 e TypeScript PASS.
Minori aperti: prova della dimostrazione intera su interfaccia/dispositivo; verifica iPhone mini/testo ingrandito/VoiceOver; ampliare filtri di attivazione dei test nativi alle future modifiche Dashboard; test specifici demo condizionati/mortali (la correzione usa già il motore comune).
- Export finale dopo il fix checkpoint: PASS, bundle d6e81dd260322949ffe2864079ea0be1.
- Materiali commerciali del prossimo aggiornamento preparati separatamente in store/next-release; descrizione2700 caratteri e descrizione Base entro45. Nessun metadato Apple modificato.
- Audit aggiornato ore17:22 Europe/Rome: versione1.0 ancora WAITING_FOR_REVIEW; per l'Italia Apple segnala TRADER_STATUS_VERIFICATION_FAILED. Dettagli in ALIGNMENT-2026-10-20.md.
