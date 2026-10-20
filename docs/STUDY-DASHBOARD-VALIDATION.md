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
