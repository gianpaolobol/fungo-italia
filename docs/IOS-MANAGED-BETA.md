# iOS — beta completa su invito, 90 giorni

Aggiornamento: iOS25 e Android6 realmente compilate e configurazione incorporata verificata sullo SHA c524b69. Nessuna consegna ai tester ancora attestata; ricontrollo demo iPhone in corso dopo errore mappa online. [Esiti delle build](MANAGED-BETA-BUILDS-2026-10-29.md).

## Stato precedente alla compilazione del 29 ottobre 2026

Implementazione candidata sul ramo `feat/ios-managed-beta-20261029`, derivato da Android PR131 (`2e0cb64`). Nessun merge main, build firmata, upload TestFlight, distribuzione esterna, App Store o OTA. Il portale ospitato non è stato ripubblicato: gli asset aggiornati in questo ramo sono soltanto sorgenti candidati.

La build iOS 24 (`7398825`) usa soltanto StoreKit per il completo e disabilita intenzionalmente la teoria in demo. Essere in TestFlight non attribuisce un diritto completo nell'app. Il candidato aggiunge lo stesso invito personale, revocabile e verificato dal servizio già usato per Android.

## Configurazione e comportamento

- Profilo EAS `ios-managed-beta`, canale separato; `FUNGO_IOS_MANAGED_BETA=1` e `FUNGO_BETA_SERVICE_URL` HTTPS root obbligatori. Profilo production invariato; un endpoint Android da solo non abilita la beta iOS.
- Nessun codice personale o credenziale nel repository. Invito monouso entro 7 giorni; scadenza server dopo 90 giorni dalla prima attivazione; nessun pagamento/rinnovo automatico.
- Token di sessione nel portachiavi SecureStore, solo hash lato server. Su iOS il portachiavi può sopravvivere alla reinstallazione: la scadenza server non riparte mai.
- Revoca/assenza di verifica online riportano alla demo. Lease massimo 60 secondi, verifica a foreground e scadenza monotona; nessuna proroga cambiando l'orologio del telefono.
- StoreKit valido prevale sulla beta: revocare la concessione beta non annulla l'abbonamento Apple.
- `fungoitalia://beta#<token>` funziona soltanto nelle build configurate. La schermata del fungo permette anche l'inserimento del codice personale.
- Completo: tutte le schede, riconoscimento e teoria. Demo: il tocco su teoria apre le opzioni di accesso e mostra il requisito, senza esporre i quesiti completi.
- Invito applicativo e invito Apple TestFlight sono distinti: il candidato testo email spiega entrambi, senza promettere sincronizzazione Play o invio automatico della mail.

## Nessun pulsante demo nelle app native

Richiesta aggiuntiva del titolare: iOS e Android non mostrano il pulsante «Demo gratuita · Agaricus» nello Studio né «Continua con l’anteprima gratuita» nell’accesso. «Apri l’atlante» resta disponibile con concessione beta o abbonamento verificato. Web invariato; la rimozione dei pulsanti non concede accesso completo senza autorizzazione. Cinque test montati dell’app coprono entrambe le piattaforme, teoria completa, assenza dei pulsanti e navigazione web. Rimossa anche una stringa di spazio JSX fuori da Text nel footer, rilevata dalla revisione indipendente; nessun crash su dispositivo è stato riprodotto.

## Prove realmente eseguite

Baseline: 361 test Node PASS, 0 fail/skip. Candidato: 373 test Node PASS, 0 fail/skip; TypeScript PASS. RED→GREEN osservato per iOS non supportato, opzione build assente, invito multipiattaforma e pulsante teoria disabilitato. Hook React montato contro server beta/SQLite reali di test: riscatto, 90 giorni, cold start e revoca. Componenti esame reali: avvio teoria, ritorno alla demo e recupero bozze/storico. Trasporti nativi e SecureStore iOS sono adattati in Node: non sono prove su dispositivo Apple.

Export Expo iOS, Android e web con opzione beta PASS; bundle Hermes nativi generati. Questo verifica il bundle JavaScript, non la firma o il binario nativo. Le fixture non hanno inviato email né invitato persone reali.

## Prima della consegna ai tester

1. Riconciliare PR131 con il sorgente iOS autorizzato, mantenendo gli snapshot scientifici reali e senza modificare le attestazioni.
2. Qualificare sullo SHA esatto i gate nativi esistenti e StoreKit, quindi il riscatto su iPhone e iPad: atlante completo, entrambi gli esami, background/foreground, rete assente, revoca e scadenza, preservazione dati.
3. Compilare il profilo isolato con incremento remoto del build number. Verificare firma, ricevuta, bundle ID, SHA, endpoint reale e audience prima di inviare TestFlight; non riutilizzare una ricevuta della build24.
4. Pubblicare gli asset candidati del portale soltanto con la build iOS compatibile disponibile; provare il link personale su quel binario. Il pannello owner e gli endpoint admin restano protetti.
5. TestFlight esterno richiede build e revisione beta Apple corrispondenti. Nessuna nuova platea o approvazione scientifica viene dedotta dalle prove software.

## Task Android ancora bloccato

Obiettivo: un solo inserimento email nel portale, autorizzazione al download Play verificata e poi invito completo; nessuna iscrizione aggiuntiva al gruppo da parte del tester. L'API Play non gestisce liste di email individuali. Cloud Identity Free può gestire automaticamente un gruppo aziendale, ma richiede dominio verificato e autorizzazioni; il titolare ha rinviato il dominio Stampa3DBologna. Nessuna sincronizzazione automatica o invio automatico email attivati da questo ramo. La semplice automazione della posta non risolve l'accesso Play.

Riferimenti: https://developers.google.com/android-publisher/api-ref/rest/v3/edits.testers , https://docs.cloud.google.com/identity/docs/groups , https://docs.cloud.google.com/identity/docs/how-to/set-up-cloud-identity-admin .

## Nuove build private — 29 ottobre 2026

Il titolare ha chiesto di procedere con la nuova build. Preparato il ramo `feat/managed-beta-build-20261029`, sopra il sorgente candidato PR132. Il workflow `store-build.yml` su questo solo ramo compila i profili isolati `ios-managed-beta` e `android-managed-beta`, verifica sorgente/dati/test/dichiarazione scientifica e riusa le credenziali EAS esistenti. Non esegue submit, OTA o pubblicazione. Le tre verifiche native iOS e quella Android partono sullo stesso ramo; i test UI verificano ora l’assenza dei pulsanti rimossi. Nessuna nuova build o disponibilità ai tester ancora attestata: consultare gli esiti effettivi prima della consegna.
