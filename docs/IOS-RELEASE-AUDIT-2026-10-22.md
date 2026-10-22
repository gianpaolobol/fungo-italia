# Verifica operativa iOS — 22 ottobre 2026

## Esito e identità

**NON PRONTA PER PUBBLICAZIONE.** Le prove acquisti sul commit main sono riuscite; non sostituiscono il gate editoriale, una build production di quello SHA e la disponibilità Apple del relativo binario.

Sorgente controllato: [`d2c8b650f3c3e4e5c6e8c6254d8f836c60d83d34`](https://github.com/gianpaolobol/fungo-italia/commit/d2c8b650f3c3e4e5c6e8c6254d8f836c60d83d34), main. PR #115 già integrata prima di questa sessione. Questo audit documentale non modifica codice, prodotti, prezzi o gate e non deve essere integrato mentre una distribuzione dello SHA precedente è in corso: il workflow rifiuta correttamente un candidato divenuto obsoleto.

## Esecuzioni effettivamente recuperate

Tutti i run main sotto riportati appartengono a d2c8b650. La ricerca iniziale obbligatoria è stata eseguita nel browser GitHub, poi i job e i log sono stati letti tramite il connettore.

| Workflow | Run ID | Evento | Job ed esito osservato |
|---|---:|---|---|
| Paired web and diagnostic TestFlight #11 | [39809526311](https://github.com/gianpaolobol/fungo-italia/actions/runs/39809526311) | workflow_dispatch, main | WAITING dietro #9; non ancora una prova |
| Paired web and diagnostic TestFlight #10 | [39808749400](https://github.com/gianpaolobol/fungo-italia/actions/runs/39808749400) | workflow_dispatch, main | CANCELLED prima di questa sessione |
| Paired web and diagnostic TestFlight #9 | [39807794183](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794183) | push, main | source119925567793: controlli e ricevuta completati nei log; beta119950377248 QUEUED, gli altri job non avviati |
| Verify native StoreKit subscriptions | [39807794256](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794256) | push, main | verify119925575226 SUCCESS |
| Verify StoreKit purchase interface | [39807794269](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794269) | push, main | iPad119925567705, iPhone119925568449, evidence119937305143 SUCCESS |
| Verify free Agaricus demo interface | [39807794237](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794237) | push, main | iPhone119925568188 e iPad119925568535 SUCCESS |
| Validate shared web candidate | [39807794321](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794321) | push, main | SUCCESS osservato nel browser |
| Expo Android and iOS | [39807794178](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794178) | push, main | SUCCESS osservato nel browser |
| Diagnose StoreKit entitlement startup | [39807794369](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794369) | push, main | without-updates119925568793 SUCCESS; baseline119925569149 SUCCESS |
| App Store Connect status #19 | [39811751393](https://github.com/gianpaolobol/fungo-italia/actions/runs/39811751393) | workflow_dispatch, main | inspect119939578200 SUCCESS; avviato in questa sessione |
| Scientific generator verification #167 | [39814751806](https://github.com/gianpaolobol/fungo-italia/actions/runs/39814751806) | workflow_dispatch, main | gate strict del generator fallito, exit 1; altri job da leggere separatamente |

Il log di #9 mostra download lenti delle dipendenze Playwright da azure.archive.ubuntu.com. Sono poi riusciti 65 test WebKit (16:29:49 UTC), 65 Chromium (16:30:54 UTC) e lo smoke unificato con riapertura offline (16:30:56 UTC). Alle 16:31:31 UTC è stata emessa la ricevuta con `nativeStorekitVerified=true`, `storekitUIVerified=true` e demo SUCCESS sullo stesso SHA. La lentezza dell'installazione non era un errore StoreKit. Il job beta 119950377248 è ora in coda/Starting job; firma e upload del nuovo binario non sono ancora attestati.

Il test nativo `testVerifiedPurchaseRefundAndExpiry` è riuscito in 2,443 s, zero errori. I test UI `testAnnualPurchaseRestoreAccessRefundAndExpiry` sono riusciti su iPhone 117,121 s e iPad 113,517 s. Coprono acquisto verificato, riapertura, ripristino, rimborso, nuovo acquisto, annullamento del rinnovo senza perdita del periodo pagato e scadenza. Nei log UI la diagnostica separata `testEntitlementStartupProbe` è saltata per selezione del relativo flusso; non sono saltate le asserzioni del ciclo acquisti. Il probe dedicato ha il proprio run, sopra distinto.

Non riusare come prove push su main gli esiti PR ba9a01cce752: native 39800492714, UI 39800492760, demo 39800492659 e scientific generator 39800492754. Il workflow scientifico non ha trigger push su main: è stato avviato manualmente il run [39814751806](https://github.com/gianpaolobol/fungo-italia/actions/runs/39814751806) sullo stesso SHA. Il log del job generator 119950197965 conferma alle 16:31:47 UTC il gate strict fallito con exit 1: 148 schede bloccate e 0 revisioni indipendenti. Le etichette riepilogative dei job possono aggiornarsi in ritardo; non chiamare SUCCESS l'intero workflow.

## Verifiche locali ripetute sul sorgente candidato

- `npm ci --ignore-scripts --no-audit --no-fund`: riuscito; nessun segreto necessario.
- `npm run typecheck`: exit 0.
- `node --test scripts/*.test.mjs`:188 test,188 pass,0 fail,0 skip.
- `npm run prepare:data` e `git diff --exit-code`: riusciti, nessun drift dei file versionati.
- `npx expo export --platform ios --output-dir /tmp/fungo-final-ios-export`: exit 0. È un export, non una compilazione firmata.
- `node scripts/release-readiness.mjs --strict`: exit 1 intenzionale;148 record bloccati,0 pronti,0 revisioni indipendenti,143 triadi fotografiche complete,146 sporate e147 commestibilità presenti.

Le prove locali non attestano esecuzione nativa nel container Linux né acquisti sandbox sul dispositivo fisico.

## Funzionalità richieste e limiti

| Requisito | Riscontro |
|---|---|
| Percorso, Studio, Esame, Aree | Implementati in App.tsx in quell'ordine; Dashboard è etichettata Percorso |
| Fungo in alto a destra per abbonamento | MushroomAccess e schermata Abbonamento; accesso completo da billing.active |
| Correzione verde/rosso e risposta corretta | PhotoExam.fieldFeedback, colori separati e soluzione; test exam-feedback/exam-grading riusciti |
| Specie distinta dalla commestibilità | gradeResponse e report separati; regressione Marasmius oreades riuscita |
| Autocompletamento dopo tre lettere | suggestNames senza limite artificiale; test exam-training con tutte le corrispondenze e Amanita rubescens riusciti |
| Ripetizione errori e storico | advanceTraining, study-exam e study-store; regressioni riuscite |
| Conservazione preferiti e progressi | ID e chiavi persistenti, letture protette e test di recovery; non ancora verificata la migrazione su iPhone fisico del titolare |
| Controlla e analizza foto selezionate | **BLOCCO:** componente PhotoLibrary.tsx e modulo Vision presenti, ma App.tsx non importa/monta PhotoLibrary e nessun altro componente lo raggiunge. Non attestare disponibilità nella release corrente |

Per il filtro Foto serve una PR dedicata, una collocazione raggiungibile nel flusso corrente, test di accesso limitato/ripresa20 foto e nuove prove native sul nuovo SHA. Questo audit sceglie di segnalare il blocco, come previsto dal mandato, senza inserire una funzione non verificata nel candidato già in validazione.

## EAS e Apple: stato realmente letto

EAS accessibile nel browser. Ultima build cloud elencata: [8ae1b83c-d956-4ea7-bdc1-c3873248f1a3](https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/builds/8ae1b83c-d956-4ea7-bdc1-c3873248f1a3),1.1.0(15),production,canaleproduction,SUCCEEDED,commit3662a3accc3845194e7a0fdb5e99948fe8024b75. Non è il candidato d2c8b650. La build 16 è stata prodotta localmente con EAS dalla pipeline diagnostica precedente e non è una nuova build cloud production del candidato.

Lettura API Apple autenticata22 ottobre 16:11:01 UTC, artefatto App-Store-status 12439443737 del run 39811751393:

- Ultimo build Apple:1.1.0(16),IDc72ecb8f-7267-4ca0-93ad-14689db4dfda,VALID,non scaduto,export compliancefalse.
- Browser TestFlight conferma gruppo interno **Proprietario — prova iPhone**,IDf642807c-e4b2-43d4-a32a-d9fd087fdfe3,1 invito,1 installazione,4 sessioni. Queste metriche riguardano il build 16 precedente, non il candidato corrente.
- Versione App Store1.0 **REJECTED**, ancora associata a1.0.0(9). Motivi mostrati:2.1.0 App Completeness e2.3.7 Accurate Metadata. Nessuna risottomissione effettuata.
- Prodotto it.fungoitalia.premium.annual e gruppo sono aggiunti alla bozza e il portale li mostra **Ready for Review**, non approvati.
- Il portale **Current Pricing for New Subscribers**, filtroEurope, rigaItaly(EUR), conferma **€19.99**. Lo script app-store-connect.mjs legge il primo prezzoITA dalla prima pagina senza valutarne efficacia temporale: il suo9.99 non prova il prezzo corrente. Nessun prezzo modificato.
- CategorieEDUCATION/REFERENCE, localizzazione italiana, URL privacy/supporto e contatti review presenti; screenshot pubblici: 2 per famiglia. Manifest nel repository ancora riferito a719727b6: non aggiornato per attestare falsamente il candidato.
- Acquisti TestFlight usano il sandbox Apple; i test simulatore utilizzano SKTestSession locale. Non sono acquisti di produzione e non è stato effettuato alcun acquisto reale.

La pipeline corrente genera `consolidated-beta`, con ricevuta `testFlightOnly:true`, `diagnosticOnly:true`, `appStoreReady:false`. Questi flag sono stati preservati. Nessuna buildproduction nuova avviata con gate scientifico fallito. Un'esecuzione locale EAS non necessariamente produce un nuovo Build ID cloud: registrare hash IPA,producerRunId,build number e submission effettivi dalle ricevute.

## Privacy, accordi e DSA

Il portale App Privacy inizialmente mostrava9 tipi raccolti e tracking pubblicitario per contatti,pagamenti,posizione. Il codice non contiene flussi GPS/contatti/SDK pubblicitari; StoreKit non trasmette ricevute a server dello sviluppatore. Le dipendenze Expo58 verificate inviano EAS-Client-ID e, dopo un errore fatale,Expo-Fatal-Error. Le mappe richiedono risorseOSM/unpkg e il controllo versione contattaGitHubPages.

È stata preparata nel portale una selezione di4 tipi tecnici (Device ID,Crash Data,Other Diagnostic Data,Other Data Types), ancora da completare. **Non è stata pubblicata.** Il preview continua a mostrare le dichiarazioni precedenti. L'editorDevice ID è stato annullato dopo il blocco della revisione automatica sul passaggio«collegato all'identità»: la motivazione è che l'evidenza sui token casuali d'installazione non basta a sostanziare quella specifica classificazione. Non sostituire con«non collegato» per aggirare il blocco. Occorrono riscontro puntuale sul collegamento dei dati e approvazione esplicita o compilazione verificata dal titolare. Se la pagina viene lasciata,Apple avverte che i nuovi tipi non completati non saranno aggiunti al product page.

Riferimenti consultati22 ottobre: [definizioni Apple](https://developer.apple.com/app-store/app-privacy-details/),[policyExpo](https://expo.dev/privacy),[flussiend-userExpo](https://expo.dev/privacy-explained). Apple include il collegamento tramite dispositivo, ma non va inventata una garanzia di anonimizzazione o una relazione non dimostrata. Non dichiarare«nessun dato raccolto» omettendoExpo.

Business Apple letto nel browser: accordi **Free Apps e Paid Apps Active**,informazioni fiscali e bancarie Active. Nessun dettaglio personale/bancario viene riportato qui. **Digital Services Act:Rejected**,per27 territori. L'editor richiede una dichiarazione trader/non-trader; non è stata selezionata né inviata alcuna nuova dichiarazione. Il titolare deve confermare lo stato giuridico e completare l'eventuale verificaApple.

## Errori e attività della sessione

Documentazione pubblicata nella [PR #117 in bozza](https://github.com/gianpaolobol/fungo-italia/pull/117). Nessuna PR correttiva applicativa nuova è stata integrata. La documentazione è separata dal candidato main per preservare lo SHA richiesto dai gate.

- Recuperato il RunID manuale attraverso il browser, superando il limite del connettore che elenca solo i run PR.
- Eseguito auditApple readonly con credenzialiCI esistenti; accessi browserGitHub,Apple edExpo verificati,nessun segreto nei report.
- Stage native screenshot evidence39811145712 era fallito per **HTTP 500 nella creazioneGitHub blob** dopo il primo PNG; rieseguiti solo i job falliti,secondo fallimento. L'artefatto originaleNative-App-Store-screenshots 12440790791 è stato scaricato e verificato separatamente(source-commit.txt = d2c8b650). Il guasto di staging non annulla i test UI riusciti e non è stato usato per aggirarli.
- Ispezionati screenshotStudio, Aree e paywall iPhone e Studio/Aree iPad.03-esame.png è intenzionalmente il paywall privato di review; il manifest esclude le immagini prezzo dal gallery pubblico. Le nuove catture mostrano ancora il banner di differenza conTestFlight 16: non promuoverle automaticamente come assetsApp Storedefinitivi.
- Nessuna nuova correzione StoreKit necessaria sulla base dei cicli acquisti riusciti. Nessuna asserzione rimossa,nessun entitlement artificiale,nessuna approvazione scientifica inventata.

## Servizio GitHub: limite esterno osservato

Alle 18:40 circa, ora italiana, il job beta resta `Queued / Starting job`. La [pagina ufficiale GitHub Status](https://www.githubstatus.com/incidents/wq8305lppdc2), consultata durante questa verifica, segnala un incidente attivo iniziato alle 15:28 UTC che coinvolge anche Actions; la pagina generale mostra Actions Degraded Performance. Il precedente incidente distinto sugli Actions Results è stato dichiarato risolto alle 15:18 UTC. La coincidenza con coda e ritardi dei riepiloghi è compatibile con un problema di servizio, ma non dimostra la causa del singolo job. Nessun runner alternativo non qualificato è stato scelto e nessun risultato pendente è stato convertito in successo.

## Passi obbligatori rimasti

1. Leggere l'esito finale #9 e #11; conservare receipt,hash IPA,Applebuild ID,gruppo e disponibilità effettiva per ogni nuovo build diagnostico.
2. Completare revisione micologica indipendente,fonti puntuali e licenze. Il software non può attestare autonomamente il lavoro di un revisore indipendente.
3. Risolvere accesso al filtroFoto con PR e prove dedicate; consolidare nuovoSHA con tutti i controlli obbligatori.
4. Completare privacy con classificazioni comprovate e risolvereDSARejected con dichiarazione del titolare.
5. Implementare/qualificare un processo production distinto che richieda gate editoriale e proveSUCCESS dello stesso SHA; non utilizzare indiscriminatamente store-build.yml (auto-submit) né il vecchio store-submit-ios.yml con ID hardcoded.
6. Solo dopo: EAS production firmata,verifica del codice incorporato,upload,processing Apple,gruppo tester previsto e lettura disponibilità TestFlight. Poi metadati/screenshot autentici e nuova bozzaApp Review; invio pubblico ancora vietato finché non idonea.
