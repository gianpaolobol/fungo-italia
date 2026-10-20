# Study Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implementare Dashboard, percorso adattivo e Base permanente preservando storico e diritti annuali.
**Architecture:** Motori didattici puri condivisibili, archivio locale versionato, UI React Native e verificatore StoreKit separato dai progressi. Il codice esistente di esame resta la fonte dei risultati; niente server nuovo.
**Tech Stack:** TypeScript, React Native/Expo, AsyncStorage, JavaScript ESM/node:test, Swift StoreKit 2.
**Spec:** docs/superpowers/specs/2026-10-17-study-dashboard-design.md
**Approval:** Il titolare ha approvato il progetto e confermato il 17 ottobre il limite locale della sessione Base. Piano da revisionare prima di eseguire.
**Execution proposal:** esecuzione diretta in questa sessione; nessuna delega necessaria.

## Global Constraints
- Download gratuito; Base permanente 9,99 EUR; Completo ulteriori 9,99 EUR/anno in Italia.
- “Ciao” senza nome; nome facoltativo locale; nessuna autenticazione introdotta per il saluto.
- “Inizia lo studio” prima dell'avvio effettivo; “Riprendi lo studio” successivamente.
- Una sessione Base di 15 casi comprende checkpoint e tutti i giri di correzione.
- Quota locale: nessuna garanzia globale dopo cancellazione dei dati o su dispositivi diversi.
- S = 0,40 A + 0,25 C + 0,20 R + 0,15 E. Parametri e dati versionati.
- Mai cancellare storico/favoriti per scadenza, rimborso o migrazione.
- Annuale attivo preesistente concede Completo senza acquisto Base.
- Nessun nuovo blocco commerciale Android/web; nessun OTA sulla versione in revisione.
- Lavorare in branch isolato. Non modificare prodotti Apple o pubblicare prima delle verifiche del nuovo binario.
- Ogni task logico termina con commit e aggiornamento del registro dei risultati.

## Review Focus
- Storage pieno: avanzamento, risposta e consumo quota devono fallire insieme (Task 1).
- Orologio errato o arretrato: nessun consolidamento prematuro e nessun NaN (Task 2).
- Banca aggiornata: storico leggibile senza attribuire competenze a domande incompatibili (Task 2).
- Annuale valido senza Base: nessun secondo pagamento imposto e nessun blocco improprio (Task 5).
- Testo grande/nome lungo/ripristino: UI leggibile e acquisti indipendenti dal profilo (Task 6 e 7).

## Sequenza e baseline
Prima dell'esecuzione leggere spec, questo piano e istruzioni repository. Creare worktree/checkout isolato dalla release.
Registrare commit sorgente e condizioni iniziali; eseguire npm ci, npm run typecheck e i test esame/policy esistenti.
Separare eventuali fallimenti preesistenti; i fallimenti StoreKit iPhone noti restano blocchi di pubblicazione, non successi impliciti.

### Task 1: archivio atomico e quota locale
**Files:** creare lib/study-store.mjs, lib/study-store.d.mts, scripts/study-store.test.mjs; modificare components/PhotoExam.tsx nel punto di salvataggio esistente.
**Interfaces:** StudyProfile={name:string,startedAt:string|null}; StudyState={schemaVersion:1,profile:StudyProfile,baseSessionId:string|null,sessionData:unknown}; StoragePort={getItem(key):Promise<string|null>,setItem(key,value):Promise<void>}.
Produrre loadStudyState(storage), updateStudyState(storage,transition), startStudy(storage,now) e commitExamAnswer(storage,{sessionId,answer,nextSessionData,consumeBase}).
Usare un solo envelope per dati sessione, quota e profilo; serializzare transizioni concorrenti. Tenere il salvataggio precedente come backup, non rimuoverlo.
- [ ] Scrivere test con storage in memoria: quota assente prima della risposta; prima risposta registra sessionId; ripresa stesso ID non consuma altro; secondo ID Base rifiutato; setItem fallito lascia quota/risposta inalterate; doppio invio non duplica.
- [ ] Eseguire node --test scripts/study-store.test.mjs: devono fallire per modulo/funzioni mancanti.
- [ ] Implementare le firme sopra; importare checkpoint v2 senza inventare risposte; errori di parsing mantengono l'originale e segnalano recupero necessario.
- [ ] Rieseguire test: tutti PASS; verificare che vecchio storico e preferiti non siano cancellati.
- [ ] Commit: feat: add atomic local study state and Base session quota.

### Task 2: motore competenze e percentuali
**Files:** creare lib/study-progress.mjs, lib/study-progress.d.mts, scripts/study-progress.test.mjs.
**Interfaces:** Evidence={unitId,taxonId,bankRevision,sessionId,at,firstAttempt,correct,hinted,mode,critical}; Unit={id,taxonId,scope,dimension,applicable}; computeProgress({units,evidence,bankRevision,now}) → {minimum,extended}, ciascuno con {score,A,C,R,E,confidence,criticalOpen,consolidated}.
Per risultati storici incompleti, preservare riepilogo ma non generare Evidence dettagliata.
- [ ] Scrivere test numerici: A=100,C=100,R=0,E=0 produce score=65; nessuna prova produce stato da valutare; correzioni non mutano A/R; doppia prova a 47 ore non consolida; a 48 sì; dimensioni non pertinenti escluse.
- [ ] Aggiungere test: futura timestamp/ora arretrata non conta per R; revisione incompatibile esclusa dall'indice ma mantenuta nell'archivio; ripetere una sola specie non gonfia la media fra unità; errore critico chiuso solo con due successi autonomi distanziati.
- [ ] Eseguire node --test scripts/study-progress.test.mjs e osservare FAIL.
- [ ] Implementare ultimi cinque primi tentativi per unità, media fra unità, copertura, ultime tre simulazioni, soglie e attendibilità della spec. Timestamp invalido escluso con diagnostica.
- [ ] Rieseguire suite: PASS; score sempre finito fra 0 e 100.
- [ ] Commit: feat: calculate versioned study readiness and learning gaps.

### Task 3: selezione adattiva e agenda
**Files:** creare lib/study-scheduler.mjs, lib/study-scheduler.d.mts, scripts/study-scheduler.test.mjs.
**Interfaces:** selectTraining({units,evidence,bankRevision,now,seed,count:15}) → {taxonIds:string[],reasons:Record<string,string>}; nextReview({successStage,lastAttemptAt,correct,independent}) → {stage,dueAt}.
- [ ] Scrivere test: banca sufficiente produce 8 lacune/4 ripassi/3 nuovi; nessun taxon duplicato; seed uguale produce stesso esito; pool vuoto redistribuisce; banca <15 restituisce casi disponibili con avviso, mai contenuti inventati.
- [ ] Testare intervalli 1,3,7,14,30 giorni e reset dopo errore; successo assistito non avanza; priorità errori critici.
- [ ] Eseguire node --test scripts/study-scheduler.test.mjs: FAIL.
- [ ] Implementare selettore bilanciato per generi con motivazione leggibile; non modificare la distribuzione della simulazione.
- [ ] Rieseguire: PASS.
- [ ] Commit: feat: schedule adaptive mushroom study sessions.

### Task 4: modalità allenamento e simulazione
**Files:** modificare components/PhotoExam.tsx, web/public/exam-core.js ed exam-core.d.ts se condivisi; creare scripts/study-exam-integration.test.mjs.
**Interfaces:** ExamMode='training'|'simulation'; estendere il modello sessione con mode e revisione; collegare salvataggio Task 1 e selezione Task 3 senza duplicare il correttore.
- [ ] Scrivere test: training corregge subito e ripete tutti gli errori; simulation non espone soluzioni fino alla fine e disabilita suggerimenti; prime risposte sempre immutabili; checkpoint conserva mode e ordine.
- [ ] Eseguire node --test scripts/study-exam-integration.test.mjs: FAIL.
- [ ] Implementare discriminante di modalità e ingressi al selettore; simulazione bilanciata, senza affermare equivalenza ufficiale.
- [ ] Eseguire nuova suite e scripts/exam-core.test.mjs, exam-feedback.test.mjs, exam-grading.test.mjs, exam-training.test.mjs: PASS oppure fallimenti preesistenti documentati.
- [ ] Commit: feat: integrate adaptive training and independent exam simulations.

### Task 5: acquisto Base e verifica diritti
**Files:** modificare lib/subscriptionPolicy.ts, hooks/useSubscription.ts, modules/fungo-subscription/index.ts, modules/fungo-subscription/ios/FungoSubscriptionModule.swift, components/SubscriptionGate.tsx; estendere scripts/subscription-policy.test.mjs.
**Interfaces:** AccessState={baseOwned:boolean,annualActive:boolean,annualExpiresAt:string|null,checkedAt:string}; deriveAccess(state) → {minimum:boolean,extended:boolean,unlimitedTests:boolean}; mantenere wrapper annuali compatibili finché tutti i chiamanti sono migrati.
Introdurre native baseProduct(), purchaseBase(), currentAccess(), restoreAccess() e evento accessChanged con validazione JS. ID proposto Base: it.fungoitalia.base.lifetime; verificarne disponibilità Apple prima di creare il prodotto.
- [ ] Scrivere matrice test: nessun acquisto → anteprima; Base → minimo; annuale senza Base → Completo; entrambi → Completo; annuale scaduto con Base → minimo; senza Base → anteprima; revoca Base non annulla annuale attivo.
- [ ] Scrivere test acquisto pendente/annullato/non verificato: nessun diritto nuovo; restore indipendente dal nome; scadenza ricontrollata al ritorno e alla deadline.
- [ ] Eseguire suite: osservare FAIL per nuove capacità.
- [ ] Implementare transazioni StoreKit verificate per ID, revoca e durata. Base non consumabile non richiede expiresAt; annuale richiede scadenza futura. Non usare la quota locale per concedere premium.
- [ ] Aggiornare paywall con prezzo localizzato, distinzione una tantum/annuale, rinnovo e ripristino. Non prezzare testualmente una valuta estera.
- [ ] Eseguire suite e typecheck: PASS; configurare prodotto e fixture solo sul nuovo percorso di release autorizzato, senza toccare submission attuale.
- [ ] Commit: feat: support permanent Base and compatible annual access.

### Task 6: Dashboard, saluto e fungo
**Files:** creare components/StudyDashboard.tsx, components/StudyMushroom.tsx, hooks/useStudy.ts; modificare App.tsx; creare scripts/study-dashboard-model.test.mjs e lib/study-dashboard-model.mjs.
**Interfaces:** useStudy() fornisce {profile,progress,recentSessions,startStudy,setName,nextTraining,storageError}; dashboardModel({profile,progress}) → {greeting,cta,stage,scoreLabel}.
- [ ] Scrivere test esatti: nome vuoto → Ciao; nome presente → Ciao, Nome; startedAt nullo → Inizia lo studio; startedAt valido → Riprendi lo studio; aprire pagina/salvare nome non modifica startedAt.
- [ ] Testare nome trim, limite 60 caratteri Unicode e testo letterale; score non disponibile → Preparazione da valutare; score basso con poca evidenza → Stima iniziale; cinque stadi mappati a 0–19/20–39/40–59/60–79/80–100.
- [ ] Eseguire node --test scripts/study-dashboard-model.test.mjs: FAIL.
- [ ] Implementare modello, hook e UI: percentuale minima principale, estesa separata, errori critici, ultimi risultati, prossimo allenamento. Dashboard essenziale Base e report esteso annuale secondo Task 5.
- [ ] Fungo tramite disegno vettoriale/code-native accessibile, non foto micologica; animazione disattivabile dal sistema. Stato numerico sempre leggibile.
- [ ] Eseguire suite e npm run typecheck: PASS; verificare layout a 320/375 punti e testo grande, senza troncamento del pulsante.
- [ ] Commit: feat: add personal study dashboard and growth indicator.

### Task 7: migrazione e verifiche end-to-end
**Files:** estendere .github/workflows/subscription-storekit-tests.yml e subscription-storekit-ui.yml sul branch solo se necessario; creare docs/STUDY-DASHBOARD-VALIDATION.md.
- [ ] Preparare scenari: utente nuovo, storico v2, Base con prova iniziata, annuale legacy senza Base, entrambi, annuale scaduto, storage pieno, banca aggiornata.
- [ ] Verificare su iPhone e iPad acquisto Base, acquisto annuale, ripristino esplicito, rimborso, scadenza e riavvio; nessun salto del gate per test fallito.
- [ ] Verificare reinstallazione: acquisti recuperabili, storico locale non promesso; consumo quota locale esplicitato.
- [ ] Eseguire suite pertinenti, typecheck, export e regressioni web esistenti. Conservare SHA, output e artifact; distinguere saltato da superato.
- [ ] Verificare VoiceOver, contrasto, testo grande, movimento ridotto e schermate su iPhone 13 mini. Documentare prove manuali non eseguibili, senza attestarle.
- [ ] Commit: test: validate study migration and purchase lifecycle.

### Task 8: preparazione beta e nuova release
**Files:** aggiornare docs/APP-STORE-PRIVACY-WORKSHEET.md, docs/APP-STORE-OWNER-CHECKLIST.md, documentazione commerciale e configurazione versione solo dopo QA.
- [ ] Aggiornare descrizione Base/Completo e privacy coerenti con profilo locale, senza dichiarare sincronizzazione.
- [ ] Produrre screenshot del nuovo binario e verificare che prezzi, Dashboard e contenuti coincidano con acquisti reali.
- [ ] Creare nuova build con numero incrementato e runtime compatibile con nuovo modulo nativo; nessun OTA alla release in verifica.
- [ ] Caricare beta TestFlight e registrare stato Apple; richiedere verifica utente del percorso sul telefono.
- [ ] Dopo tutti i gate superati, preparare nuova submission con prodotto Base e note di revisione; rispettare eventuali passaggi Apple riservati al titolare. Non dichiarare pubblicazione prima dello stato effettivo.
- [ ] Commit finale documentale e revisione del diff, poi integrazione concordata nel ramo di rilascio.

## Autoverifica del piano
Copertura: ogni sezione della spec mappata ai Task 1–8; nomi opzionali, quota locale, diritti legacy, errori critici e finestre temporali espliciti.
Interfacce: calcolo e selezione dipendono da Evidence/Unit Task 2; UI consuma hook e modello; accessi indipendenti dallo studio.
Rischi: non chiudere il task StoreKit con il solo PASS unitario; non inventare risultati storici; non introdurre server o login come soluzione implicita alla quota.
