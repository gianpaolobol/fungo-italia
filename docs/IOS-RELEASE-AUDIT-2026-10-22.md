# Verifica operativa iOS — 22 ottobre 2026

## Esito e identità

**NON PRONTA PER PUBBLICAZIONE.** Le prove acquisti sul commit main sono riuscite; non sostituiscono il gate editoriale, una build production di quello SHA e la disponibilità Apple del relativo binario.

Sorgente controllato: [`d2c8b650f3c3e4e5c6e8c6254d8f836c60d83d34`](https://github.com/gianpaolobol/fungo-italia/commit/d2c8b650f3c3e4e5c6e8c6254d8f836c60d83d34), main. PR115 già integrata prima di questa sessione. Questo audit documentale non modifica codice, prodotti, prezzi o gate e non deve essere integrato mentre una distribuzione dello SHA precedente è in corso: il workflow rifiuta correttamente un candidato divenuto obsoleto.

## Esecuzioni effettivamente recuperate

Tutti i run main sotto riportati appartengono a d2c8b650. La ricerca iniziale obbligatoria è stata eseguita nel browser GitHub, poi i job e i log sono stati letti tramite il connettore.

| Workflow | Run ID | Evento | Job ed esito osservato |
|---|---:|---|---|
| Paired web and diagnostic TestFlight #11 | [39809526311](https://github.com/gianpaolobol/fungo-italia/actions/runs/39809526311) | workflow_dispatch, main | WAITING dietro #9; non ancora una prova |
| Paired web and diagnostic TestFlight #10 | [39808749400](https://github.com/gianpaolobol/fungo-italia/actions/runs/39808749400) | workflow_dispatch, main | CANCELLED prima di questa sessione |
| Paired web and diagnostic TestFlight #9 | [39807794183](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794183) | push, main | source119925567793 IN_PROGRESS; beta/promote-public-web/published-smoke non ancora avviati |
| Verify native StoreKit subscriptions | [39807794256](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794256) | push, main | verify119925575226 SUCCESS |
| Verify StoreKit purchase interface | [39807794269](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794269) | push, main | iPad119925567705, iPhone119925568449, evidence119937305143 SUCCESS |
| Verify free Agaricus demo interface | [39807794237](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794237) | push, main | iPhone119925568188 e iPad119925568535 SUCCESS |
| Validate shared web candidate | [39807794321](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794321) | push, main | SUCCESS osservato nel browser |
| Expo Android and iOS | [39807794178](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794178) | push, main | SUCCESS osservato nel browser |
| Diagnose StoreKit entitlement startup | [39807794369](https://github.com/gianpaolobol/fungo-italia/actions/runs/39807794369) | push, main | without-updates119925568793 SUCCESS; baseline119925569149 ancora IN_PROGRESS all'ultima lettura |
| App Store Connect status #19 | [39811751393](https://github.com/gianpaolobol/fungo-italia/actions/runs/39811751393) | workflow_dispatch, main | inspect119939578200 SUCCESS; avviato in questa sessione |

Il log di #9 mostra download delle dipendenze Playwright da azure.archive.ubuntu.com molto lenti, ancora in avanzamento alle16:24UTC. Non è stato dichiarato superato lo step browser e non è stata attribuita questa lentezza a un errore StoreKit.

Il test nativo `testVerifiedPurchaseRefundAndExpiry` è riuscito in2,443s, zero errori. I test UI `testAnnualPurchaseRestoreAccessRefundAndExpiry` sono riusciti su iPhone117,121s e iPad113,517s. Coprono acquisto verificato, riapertura, ripristino, rimborso, nuovo acquisto, annullamento del rinnovo senza perdita del periodo pagato e scadenza. Nei log UI la diagnostica separata `testEntitlementStartupProbe` è saltata per selezione del relativo flusso; non sono saltate le asserzioni del ciclo acquisti. Il probe dedicato ha il proprio run, sopra distinto.

Non riusare come prove pushmain gli esiti PR ba9a01cce752: native39800492714, UI39800492760, demo39800492659 e scientific generator39800492754. Non è stata trovata una nuova esecuzione scientific-generator su main in questa lettura; verificare i trigger e non inventarne una.

## Verifiche locali ripetute sul sorgente candidato

- `npm ci --ignore-scripts --no-audit --no-fund`: riuscito; nessun segreto necessario.
- `npm run typecheck`: exit0.
- `node --test scripts/*.test.mjs`:188test,188pass,0fail,0skip.
- `npm run prepare:data` e `git diff --exit-code`: riusciti, nessun drift dei file versionati.
- `npx expo export --platform ios --output-dir /tmp/fungo-final-ios-export`: exit0. È un export, non una compilazione firmata.
- `node scripts/release-readiness.mjs --strict`: exit1 intenzionale;148record bloccati,0pronti,0revisioni indipendenti,143triadi fotografiche complete,146sporate e147commestibilità presenti.

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

Per il filtro Foto serve una PR dedicata, una collocazione raggiungibile nel flusso corrente, test di accesso limitato/ripresa20foto e nuove prove native sul nuovo SHA. Questo audit sceglie di segnalare il blocco, come previsto dal mandato, senza inserire una funzione non verificata nel candidato già in validazione.

## EAS e Apple: stato realmente letto

EAS accessibile nel browser. Ultima build cloud elencata: [8ae1b83c-d956-4ea7-bdc1-c3873248f1a3](https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/builds/8ae1b83c-d956-4ea7-bdc1-c3873248f1a3),1.1.0(15),production,canaleproduction,SUCCEEDED,commit3662a3accc3845194e7a0fdb5e99948fe8024b75. Non è il candidato d2c8b650. La build16 è stata prodotta localmente con EAS dalla pipeline diagnostica precedente e non è una nuova build cloud production del candidato.

Lettura API Apple autenticata22ottobre16:11:01UTC, artefatto App-Store-status12439443737 del run39811751393:

- Ultimo build Apple:1.1.0(16),IDc72ecb8f-7267-4ca0-93ad-14689db4dfda,VALID,non scaduto,export compliancefalse.
- Browser TestFlight conferma gruppo interno **Proprietario — prova iPhone**,IDf642807c-e4b2-43d4-a32a-d9fd087fdfe3,1invito,1installazione,4sessioni. Queste metriche riguardano il build16 precedente, non il candidato corrente.
- Versione App Store1.0 **REJECTED**, ancora associata a1.0.0(9). Motivi mostrati:2.1.0 App Completeness e2.3.7 Accurate Metadata. Nessuna risottomissione effettuata.
- Prodotto it.fungoitalia.premium.annual e gruppo sono aggiunti alla bozza e il portale li mostra **Ready for Review**, non approvati.
- Il portale **Current Pricing for New Subscribers**, filtroEurope, rigaItaly(EUR), conferma **€19.99**. Lo script app-store-connect.mjs legge il primo prezzoITA dalla prima pagina senza valutarne efficacia temporale: il suo9.99 non prova il prezzo corrente. Nessun prezzo modificato.
- CategorieEDUCATION/REFERENCE,localizzazioneitaliana,URLprivacy/supporto e contatti review presenti; screenshotpubblici2perfamiglia. Manifest nel repository ancora riferito a719727b6: non aggiornato per attestare falsamente il candidato.
- Acquisti TestFlight usano il sandbox Apple; i test simulatore utilizzano SKTestSession locale. Non sono acquisti di produzione e non è stato effettuato alcun acquisto reale.

La pipeline corrente genera `consolidated-beta`, con ricevuta `testFlightOnly:true`, `diagnosticOnly:true`, `appStoreReady:false`. Questi flag sono stati preservati. Nessuna buildproduction nuova avviata con gate scientifico fallito. Un'esecuzione locale EAS non necessariamente produce un nuovo Build ID cloud: registrare IPAhash,producerRunId,buildnumber e submission effettivi dalle ricevute.

## Privacy, accordi e DSA

Il portale App Privacy inizialmente mostrava9tipi raccolti e trackingpubblicitario per contatti,pagamenti,posizione. Il codice non contiene flussi GPS/contatti/SDKpubblicitari; StoreKit non trasmette ricevute a server sviluppatore. Le dipendenze Expo58 verificate inviano EAS-Client-ID e, dopo un errore fatale,Expo-Fatal-Error. Le mappe richiedono risorseOSM/unpkg e il controllo versione contattaGitHubPages.

È stata preparata nel portale una selezione di4tipitecnici(DeviceID,CrashData,OtherDiagnosticData,OtherDataTypes), ancora da completare. **Non è stata pubblicata.** Il preview continua a mostrare le dichiarazioni precedenti. L'editorDeviceID è stato annullato dopo il blocco della revisione automatica sul passaggio«collegatoall'identità»: la motivazione è che l'evidenza sui token casuali d'installazione non basta a sostanziare quella specifica classificazione. Non sostituire con«noncollegato» per aggirare il blocco. Occorrono riscontro puntuale sul collegamento dei dati e approvazione esplicita o compilazione verificata dal titolare. Se la pagina viene lasciata,Apple avverte che i nuovi tipi non completati non saranno aggiunti al productpage.

Riferimenti consultati22ottobre: [definizioniApple](https://developer.apple.com/app-store/app-privacy-details/),[policyExpo](https://expo.dev/privacy),[flussiend-userExpo](https://expo.dev/privacy-explained). Apple include il collegamento tramite dispositivo, ma non va inventata una garanzia di anonimizzazione o una relazione non dimostrata. Non dichiarare«nessundatoraccolto» omettendoExpo.

BusinessApple letto nel browser: accordi **FreeApps e PaidApps Active**,informazionifiscali/bancarieActive. Nessun dettaglio personale/bancario viene riportato qui. **DigitalServicesAct:Rejected**,per27territori. L'editor richiede una dichiarazionetrader/non-trader; non è stata selezionata né inviata alcuna nuova dichiarazione. Il titolare deve confermare lo stato giuridico e completare l'eventuale verificaApple.

## Errori e attività della sessione

- Recuperato il RunID manuale attraverso il browser, superando il limite del connettore che elenca solo i runPR.
- Eseguito auditApple readonly con credenzialiCI esistenti; accessi browserGitHub,Apple edExpo verificati,nessun segreto nei report.
- Stage native screenshot evidence39811145712 era fallito per **HTTP500 nella creazioneGitHubblob** dopo il primo PNG; rieseguiti solo i job falliti,secondo fallimento. L'artefatto originaleNative-App-Store-screenshots12440790791 è stato scaricato e verificato separatamente(source-commit.txt=d2c8b650). Il guasto di staging non annulla i testUI riusciti e non è stato usato per aggirarli.
- Ispezionati screenshotStudio,Aree,paywalliPhone eStudio/AreeiPad.03-esame.png è intenzionalmente il paywall privato di review; il manifest esclude le immagini prezzo dal gallerypubblico. Le nuove catture mostrano ancora il banner di differenza conTestFlight16: non promuoverle automaticamente come assetsAppStoredefinitivi.
- Nessuna nuova correzioneStoreKit necessaria sulla base dei cicliacquisti riusciti. Nessuna asserzione rimossa,nessun entitlement artificiale,nessuna approvazionescientifica inventata.

## Passi obbligatori rimasti

1. Leggere l'esito finale #9 e #11; conservare receipt,IPAhash,ApplebuildID,gruppo e disponibilità effettiva per ogni nuovo build diagnostico.
2. Completare revisione micologica indipendente,fonti puntuali e licenze. Il software non può attestare autonomamente il lavoro di un revisore indipendente.
3. Risolvere accesso al filtroFoto con PR e prove dedicate; consolidare nuovoSHA con tutti i controlli obbligatori.
4. Completare privacy con classificazioni comprovate e risolvereDSARejected con dichiarazione del titolare.
5. Implementare/qualificare un processo production distinto che richieda gateeditoriale e proveSUCCESS dello stessoSHA; non utilizzare indiscriminatamente store-build.yml(auto-submit) né il vecchio store-submit-ios.yml con IDhardcoded.
6. Solo dopo: EASproductionfirmata,verifica del codice incorporato,upload,processingApple,gruppo tester previsto e lettura disponibilitàTestFlight. Poi metadati/screenshot autentici e nuova bozzaAppReview; invio pubblico ancora vietato finché non idonea.
