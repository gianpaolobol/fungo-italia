## Stato attuale: beta completa pubblicata nel test interno — 28 ottobre 2026

Questo checkpoint sostituisce gli stati pendenti nelle sezioni storiche sottostanti.

Google Play Console conferma **Disponibile per i tester interni** per **Beta completa su invito - 90 giorni (5)**, versione **1.1.0 (5)**, package `it.fungoitalia.app`, canale `4700709243566842351`. La release precedente 3 è esclusa. Pubblicazione limitata al test interno; nessuna pubblicazione di produzione, merge main, modifica iOS/web o OTA. Google può richiedere fino a un'ora o più per mostrare l'aggiornamento; il nome temporaneo resta `it.fungoitalia.app (unreviewed)`.

Build EAS `f3e89c75-98b0-4414-89a7-87965b257e55` **Succeeded**, profilo/canale `android-managed-beta`, sorgente app immutato `2e0cb6479e589bcab83d1b60d1ae636a6c8c5c64`, runtime `7d37bc0911df1feb07c4c42129ee6eff052212ac`. AAB reale SHA256 `ca1a77d6713356a6d0ae47fde9fa7fd3dbc4e8fce4063574251086a70023f774`. Bundletool ufficiale 1.18.3 validate PASS; manifest nativo conferma versionCode 5, versionName 1.1.0, minSDK24, targetSDK36, debuggable=false. Ricevuta incorporata sorgente corretto/dirty=false e endpoint beta reale verificati. Verificati crittograficamente tutti i 2067 elementi payload; certificato upload uguale alla release3: `B5B8BD7E2E5CAD794FB4EEF6E1E56782D04577872ECA6D333880A0392FFED17A`. Verificatore controllato anche con bundle alterato, correttamente respinto.

Qualifica app run40680183722 PASS (361 test Node, TypeScript, compilazione Android e smoke demo). Prova beta nativa completa run40704867745 tentativo2/job122902482623 PASS: riscatto reale, esame foto completo, demo offline, recupero bozza foto online, bozza teoria dopo cold start, revoca owner e ritorno demo. Artefatto12827810899 SHA256 `2ebfaf5ba1e5a3b6dd035d2ce730828ff86131c94d57a11eb15cc4eb5beec4a0`, scaricato e controllato, screenshot ispezionati. Il tester tecnico resta revocato. Resta documentata l'intermittenza di riconnessione dell'emulatore in tentativi precedenti, senza attribuzione certa della causa; il successo corrente non prova una correzione generale della rete.

Cyrus confermato nella lista Play selezionata. Creato il suo invito personale reale e verificato stato **Invitato**, attivazione e scadenza ancora assenti. Email completa inviata e riletta tramite Gmail: messaggio `1a183464736ea930`, etichetta SENT, 28 ottobre 2026 16:09:43 UTC. Invito monouso valido7giorni; accesso completo90giorni dalla prima attivazione, nessun rinnovo/addebito automatico. Non dichiarare consegna, lettura o attivazione avvenute. Codice/link personale non memorizzati nel repository. L'email sostituisce il precedente invito demo.

Gestione: https://fungo-italia-accessi.gianpaolo-franceschi.chatgpt.site/admin . Il titolare può revocare, modificare scadenze e creare nuovi inviti; per ogni nuovo tester aggiungere anche lo stesso account alla lista Play. Revoca immediata sul servizio, applicata dal client alla verifica online entro60secondi dall'ultima verifica valida; assenza di verifica online, scadenza e revoca riportano alla demo Agaricus conservando dati locali. Acquisti disabilitati in questa build. Revisione scientifica indipendente ancora pendente; beta didattica, non autorizza il consumo di funghi.

Il ramo ready resta fermo a `c65b3bbaa90c3bd6cacd6b5d6fb52c4b59e24194`: non muoverlo né rilanciare con il codice tecnico consumato. Questo aggiornamento è solo documentazione sul ramo prepared.

## Beta Android: collaudo completo PASS, build firmata in coda —28 ottobre2026

App candidata immutata2e0cb6479e589bcab83d1b60d1ae636a6c8c5c64. Run40704867745tentativo2, workflow esternoc65b3bbaa90c3bd6cacd6b5d6fb52c4b59e24194, jobbeta-proof122902482623SUCCESS. Riscatto reale, foto15casi, demo offline, bozza foto recuperata online, bozza teoria dopo coldstart, revoca owner del solo tester tecnico e ritorno demo PASS. Artifact12827810899 SHA2562ebfaf5ba1e5a3b6dd035d2ce730828ff86131c94d57a11eb15cc4eb5beec4a0 scaricato/verificato; result.jsonPASS e screenshot prima/dopo ispezionati. Tester tecnico revocato: non riusare il codice consumato.

Secret corretto usando sessione GitHub già autenticata TinyFish e copia/incolla nativo da readonly#code, senza trascrizione. Guard CI43caratteri realmentePASS. Dichiarazioni precedenti del browser sul formato si erano rivelate inaffidabili; non basarsi soltanto sul suo esito. Originale CUA admin funziona; GitHub richiede ancora sudo, non bypassato. Revoca possibile con getJsDialog().accept e lista aggiornata dopo riscatto; evitare409versione. Riconnessione intermittente osservata su emulatore in tentativi precedenti: rete dichiarataVALIDATED ma nessun check al Worker nel fallimento14:12; causa non attribuita con certezza, non dichiarare risoluzione generale di un problema di rete. Il collaudo corrente completo è passato senza modifiche all'app o esclusioni.

Jobsigned-qualified-app122906689539SUCCESS significa richiestaEAS, non build terminata. Buildf3e89c75-98b0-4414-89a7-87965b257e55, profilo/canaleandroid-managed-beta, app1.1.0versionCode5, receipt sorgente2e0, fingerprint7d37bc0911df1feb07c4c42129ee6eff052212ac. Artifactrichiesta12827821624 SHA256818a7a5b85fa0cdfcb6a30e43f033e0119a96e3df9eea5d9877b1f5d9cf5aa4b verificato. Expo mostraQueued, FreeTier circa25minuti. Non richiedere duplicati, non attivare piani a pagamento.

Play interno: bozza salvata Beta completa su invito - 90 giorni (5), note italiane salvate, nessun bundle nuovo caricato. Release attiva resta1.1.0(3)demo. Attendere EAS, scaricare AAB e verificare firma/digest, certificato uploadB5B8BD7E2E5CAD794FB4EEF6E1E56782D04577872ECA6D333880A0392FFED17A, manifest protobufversionCode5, packageit.fungoitalia.app, ricevuta2e0 eURLbeta. Solo dopo caricare AAB nella bozza esistente, rollout solo interno, creare invito realeCyrus e inviare email autorizzata. Nessun invito completo/email aCyrus ancora creato, nessunmain/iOS/web/OTA.

## Diagnostica del ritorno online —28 ottobre2026

Run40700232760tentativo1: attivazione, demo offline/recupero bozza online, teoria cold-start PASS. Marker13:56:23Z, revoca non osservata entro14:00:27Z; pannello revocato effettivamente dopo finestra, firma SKIPPED. Browser CUA originale ora operativo, getJsDialog().accept funzionante; lista va ricaricata dopo riscatto per evitare409versione. Tentativo2 stesso sorgente: attivazione PASS, recupero online fallito anche90secondi; rete CELLULAR VALIDATED nei dati, causa precisa non provata. Non rilanciare alla cieca: aggiunta diagnostica UI dell'errore beta in Abbonamento dopo il fallimento originale, conservando fallimento e screenshot. Nessuna modifica app/APK2e0. Beta completa ancora non pubblicata.

## Controllo formato invito prima dell'emulatore —28 ottobre2026

Run40699257946: guard app/APK e5regressioni navigatore PASS; test nativo rifiuta invito mancante/malformato prima dell'installazione, nessun riscatto o revoca, firma SKIPPED. La conferma browser del salvataggio non bastava a provare formato corretto. Aggiunto controllo43caratteri URLsafe prima dell'avvio emulatore, senza mostrare codice; ricalibrare il salvataggio verificando valore reale della textarea. Nessuna modifica app/APK2e0.

## Navigazione del collaudo resa indipendente dalla lunghezza delle domande —28 ottobre2026

Run40697310064: beta nativa attivata PASS; test fermo cercando Nome scientifico della risposta, visibile nello screenshot finale dopo ultimo swipe. Nessun segnale di revoca, firma SKIPPED. Tre prove mostrano fragilità del navigatore UI, non app qualificata diversa. Correzione sistematica del solo script: ricerca condizionale entro120secondi, swipe all'interno del vero ScrollView sotto le schede fisse, inversione a fine contenuto per controlli sopra l'offset. Cinque regressioni Python: vecchio helper4FAIL/1PASS, nuovo5PASS; incluse domanda oltre7schermate, gesti confinati e controllo assente ancora bloccante. Workflow esegue questi test e vincola hash di script e test. APK/app2e0 immutati; conferma nativa completa ancora pendente.

Segreto tecnico aggiornato con successo nel run TinyFish92c1d7eb, poi consumato da40697310064. Prima di riavviare serve invito tecnico nuovo e salvataggio confermato. Accessi GitHub/admin funzionanti: nessun consenso o nuovo login genericamente mancante. Play resta demo1.1.0(3), nessun invito completo a Cyrus, nessun main/iOS/web/OTA.

## Seconda prova nativa40694685991 —28 ottobre2026

Riscatto monouso nativo PASS; fallimento al ritorno online prima del percorso teorico, nessuna revoca. Lo script attendeva45secondi ma il controller inattivo ritenta dopo60secondi e la richiesta ha timeout10secondi: possibile gara con il ripristino rete Android. Attesa condizionale90secondi per includere il retry previsto, senza cambiare client/APK/entitlement; aggiunta dumpsys connectivity solo in caso di errore. Non attestare ancora causa rete certa o superamento del test. Firma SKIPPED, beta completa non pubblicata.

## Android beta — prova nativa parziale e correzione del percorso di test —28 ottobre2026

Candidato app immutato2e0cb647, qualifica40680183722 SUCCESS. Run completo40692864204: riscatto reale e beta attiva sul dispositivo PASS; demo offline e recupero bozza fotografica online PASS. Fallimento nello script: ricerca di Torna al menu del test limitata a7scorrimenti, insufficiente per una domanda lunga. Screenshot/XML confermano scheda Esame teorico fissa e visibile; passaggio diretto senza cambiare app. Teoria/cold-start e revoca ancora NON provati; firma SKIPPED. Artefatto12818024048 SHA2566c5cd2d4da84d931095320fe2d5fe65a7660a2d105224f3306feab622ee1e6de verificato e immagine ispezionata.

Workflow esterno conserva APK e sorgente app2e0 identici, permette solo script di collaudo vincolato aSHA256 e documentazione. GitHub/admin accessibili nel profilo TinyFish dopo intervento reale del titolare; segreto tecnico aggiornato, ora consumato dal test. Occorre nuovo invito tecnico prima del prossimo avvio, scadenza originale26/01/2027 conservata. Nessuna revoca eseguita, nessun accesso reale di Cyrus creato. Play resta1.1.0(3)demo, nessuna nuova email, nessun iOS/web/OTA/main.

# Ripresa del collaudo sul candidato Android immutato

Questo ramo preparatorio non avvia la nuova pipeline. Il trigger è soltanto il ramo distinto `feat/android-beta-proof-ready-20261028`, da creare dopo la verifica della conferma GitHub e del codice tecnico già autorizzato.

App e script del test restano esattamente quelli del candidato `2e0cb6479e589bcab83d1b60d1ae636a6c8c5c64`; questo ramo aggiunge soltanto il workflow e questo documento. Non si riutilizza l'APK precedente al fix SecureStore. Qualifica di riferimento run40680183722, artefatto12812827277, digest ZIP `d6f935021cfc944628e80a5a9dab80868f9c4ce15fdb345081d5dfe1d5ef2104`. Il workflow controlla sorgente, ID/digest del binario, ricevuta Expo nell'APK e successo dei job qualify e smoke. Se quei job non sono verdi o i byte sono diversi, si ferma.

Prima dell'avvio: completare/verificare GitHub Confirm access senza raccogliere credenziali in chat; salvare/verificare il solo segreto tecnico nel repository già autorizzato. Se necessario, reinvitare la stessa utenza tecnica dal pannello conservando la scadenza originaria. Non assumere il successo del precedente salvataggio, andato in timeout insieme alla verifica della nuova scheda.

Poi creare il solo ramo ready dal commit preparatorio verificato. Durante beta-proof seguire i log: dopo READY_FOR_ADMIN_REVOCATION revocare dal pannello soltanto il tester tecnico, entro la finestra di240secondi. Il test deve provare accesso completo, demo offline, recupero bozze, cold start e ritorno alla demo dopo revoca. Senza successo reale non firmare.

Il job di firma esegue un checkout pulito del candidato app esatto2e0cb647, distinto dal commit del workflow esterno. La ricevuta e il profilo EAS sono vincolati a quel sorgente realmente compilato/provato; il workflow non si attribuisce quel commit. Usa il medesimo canale isolato e le credenziali Expo esistenti. Il successo del job firma indica solo richiesta EAS, non build terminata, invio Play o disponibilità ai tester.

Dopo EAS verificare AAB, versioneCode>3, sorgente2e0cb647, endpoint reale e medesima chiave upload Android. Solo dopo aggiornare il canale Play interno e inviare il nuovo invito personale a Cyrus già autorizzato. Nessun merge main, iOS, web, OTA o pubblicazione Google Play pubblica.
