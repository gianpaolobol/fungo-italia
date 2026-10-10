# Fungo Italia — pubblicazione App Store e Google Play

## Obiettivo

Pubblicare la versione nativa di Fungo Italia su App Store e Google Play, mantenendo il nome, gli ID `it.fungoitalia.app` e la matrice alimentare con Guida prevalente. La beta web resta operativa. Il backup `backup/main-pre-beta-publish-20261009` non va modificato.

## Verifiche del 9 ottobre 2026

- Progetto Expo esistente: `gianpaolobol/fungo-italia-`, ID `b65af584-739f-4ef0-8fe5-6c0ba692c088`. Collegamento GitHub–Expo funzionante nel workflow iPhone.
- La produzione EAS prevede iOS e Android App Bundle. Non sono ancora state inviate build agli store nell’ambito di questa preparazione.
- Ultimo tentativo iPhone: workflow 37970339369, job 113955036110. Validazione del codice riuscita; nessun team Apple trovato nel contesto Expo e nessuna credenziale ad-hoc utilizzabile. Questo non dimostra che l’iscrizione Apple Developer sia assente o inattiva. La distribuzione store richiede proprie credenziali di firma e un record App Store Connect.
- Autenticazione Expo non presente nella sessione CLI locale; non copiare segreti da GitHub né inserire chiavi nei file del repository.
- Account Google Play Console: da verificare con il proprietario.
- La versione nativa include ora i badge alimentari, le sindromi documentate e una sezione Esame con 15 casi fotografici estratti dalla matrice aggiornata. Usa lo stesso motore di selezione e valutazione della PWA; le spiegazioni restano soggette a revisione del docente. Il controllo su dispositivi reali della build firmata resta da eseguire. La sezione 3+1 mantiene le osservazioni personali. Non dichiarare una completa equivalenza di tutte le funzioni con la PWA.
- Il controllo di certificazione scientifica non attesta una revisione micologica indipendente. Non dichiarare l’app certificata o adatta a decidere il consumo; le informazioni alimentari sono attribuite alla Guida, senza certificazioni inventate.

## Scheda store proposta — bozza

**Nome:** Fungo Italia

**Sottotitolo Apple:** Atlante e studio micologico

**Descrizione breve Google:** Atlante micologico italiano: schede, fotografie e strumenti di studio.

**Descrizione estesa:**

Fungo Italia è un atlante e uno strumento di studio dedicato alla micologia. Consulta le schede per nome scientifico, nome comune o sinonimo, confronta fotografie e caratteri diagnostici e organizza il ripasso con i preferiti.

Le schede riportano, quando documentati, odore, sporata, habitat, confronti e indicazioni alimentari. Per la commestibilità il riferimento prevalente è la Guida ragionata alla commestibilità dei funghi. Generi e gruppi non ricevono automaticamente il giudizio di una singola specie.

Conserva sul dispositivo note e osservazioni personali. Le fotografie e i testi mantengono i riferimenti alle fonti disponibili nell’app.

Fungo Italia è uno strumento didattico: le immagini e i caratteri di studio non attestano l’identificazione di un esemplare e non autorizzano il consumo. Per il controllo dei funghi destinati all’alimentazione rivolgersi a un ispettorato micologico.

**Categoria proposta:** Istruzione / Education.

**Esame fotografico:** aggiungere alla descrizione soltanto dopo l’effettivo allineamento della versione nativa e la verifica della build. Non usare screenshot PWA come prova di una funzione assente nella build inviata.

## Materiali da completare prima dell’invio

1. Parità delle funzioni native sopra indicate, build firmate iOS/Android e controllo su dispositivi reali.
2. Record App Store Connect e Play Console, contatti di supporto e URL di privacy funzionanti.
3. Informativa ricavata dai flussi reali: libreria Foto e note locali, eventuali esportazioni o condivisioni, mappe e relativi servizi di rete. Le dichiarazioni App Privacy e Data safety devono corrispondere alla build effettiva; non dichiarare automaticamente assenza di raccolta dati.
4. Screenshot ricavati dalla build nativa, icona e grafica Google Play, questionari di età e contenuti, diritti su testi e immagini, dichiarazioni del titolare.
5. Prima distribuzione TestFlight e canale di test Google Play. Per gli account personali Google soggetti al requisito, almeno 12 tester iscritti continuativamente per 14 giorni prima della richiesta di accesso alla produzione; verificarne l’applicabilità nell’account.
6. Invio alla revisione dei due store. La pubblicazione dipende dall’approvazione dello store; la build o l’upload non equivalgono alla pubblicazione.

## Verifica tecnica della preparazione

Il 9 ottobre 2026: 62 test superati, controllo TypeScript superato e generazione dei bundle Hermes iOS/Android riuscita. Questi controlli non equivalgono a una compilazione nativa firmata né a una prova fisica sul dispositivo.

Il workflow manuale `Store production build` (`.github/workflows/store-build.yml`) permette di avviare una build `production` per Android, iOS o entrambi dopo aver configurato la firma in Expo. Non invia automaticamente la build agli store. Prezzo, territori e pubblicazione finale restano da definire dal titolare.

## Configurazione di invio

Il profilo EAS `production` serve per build destinate agli store. La prima configurazione Apple richiede il collegamento del team del proprietario e delle credenziali di distribuzione. EAS Submit per Android richiede il collegamento a Play Console e credenziali del servizio di invio, con l’eventuale prima operazione manuale richiesta dal flusso corrente. Non salvare chiavi Apple o JSON di account di servizio nel repository.

Riferimenti ufficiali:

- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/deploy/submit-to-app-stores/
- https://docs.expo.dev/submit/android/
- https://developer.apple.com/app-store/review/guidelines/
- https://support.google.com/googleplay/android-developer/answer/14151465

Questa scheda è preparatoria; nessuna domanda di revisione degli store è stata inviata.

## Collegamento Apple completato il 10 ottobre 2026

Accesso diretto a Expo verificato. App Store Connect: app `6821140326`, bundle `it.fungoitalia.app`, team `BX9MDXAHKG`. Scheda italiana creata, descrizione e parole chiave salvate; rilascio manuale selezionato. Nessun invio alla revisione.

Certificato Apple Distribution `DXLA5NHSKQ` e profilo App Store `NATQT6SSTB` generati e salvati in Expo; entrambi risultano validi, con scadenza 9 ottobre 2027. Nessun segreto o file di firma va inserito nel repository.

Prima build production iOS completata con successo da main, commit `45ad46bb47b315fabf05b7b042da2bc44e2bf19e`, versione 1.0.0 (2): https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/builds/1fdc27d4-cec2-4b9d-bddd-511f1407a5dc.

La chiave App Store Connect `fungoitalia` (`35MS8YN74G`) è stata salvata in Expo con autorizzazione esplicita del titolare; nessun contenuto segreto è nel repository.

Upload ad App Store Connect completato con successo secondo Expo e GitHub Actions: https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/submissions/750f529c-72db-41ec-8794-7c1e2b8c6e1a e https://github.com/gianpaolobol/fungo-italia/actions/runs/37999504066. I log confermano il caricamento IPA all'app 6821140326 e specificano che l'attesa dell'elaborazione Apple è saltata. App Store Connect ha completato l'elaborazione della versione 1.0.0, build 2: stato Ready to Submit verificato. Gruppo interno Proprietario — prova iPhone creato, distribuzione automatica disabilitata, build 1.0.0 (2) associata con stato Ready to Test. Il solo proprietario dell'account è stato invitato con autorizzazione esplicita: stato Invited verificato. Istruzioni What to Test salvate. Non è stata verificata l'installazione su iPhone e non è stata inviata la revisione App Store.

Il workflow `store-submit-ios.yml` conserva soltanto il trigger manuale per evitare ulteriori upload automatici. Non rieseguirlo dopo l'accettazione della build 2: per una nuova submission serve una nuova build con numero incrementato. Restano da completare metadati, privacy, screenshot nativi, dichiarazioni del titolare e revisione App Store; Google Play è ancora da configurare. Il backup resta a `277466878a64f6c49eecb691ecd9c6fb595ef41a`.

## Arresto nativo all'avvio — 10 ottobre 2026

La prova fisica della build 2 ha rilevato un arresto immediato su iPhone 13 mini con iOS 18.6.2. Il rapporto TestFlight riporta `Termination Reason: DYLD 4 Symbol missing`: `ExpoMediaLibrary` richiede il simbolo Swift `AppContext.permissions` non disponibile in `ExpoModulesCore`. Il processo termina prima dell'esecuzione JavaScript.

Correzione su main `f2484da38a344b390b24e0148f7824a20c7b8818`: Expo Autolinking iOS `buildFromSource: [".*"]` per compilare insieme i moduli invece di collegare framework Expo precompilati incompatibili. La libreria Foto resta inclusa. Riferimento: https://docs.expo.dev/guides/prebuilt-expo-modules/.

Verifica locale: test della risoluzione Autolinking fallito prima della modifica e superato dopo; 63 test superati e TypeScript superato. Queste verifiche non dimostrano il corretto avvio sul dispositivo.

Ricompilazione pulita e auto-submit TestFlight completati con successo: https://github.com/gianpaolobol/fungo-italia/actions/runs/38003287826. Build 1.0.0 (3): https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/builds/bd31650a-6974-4cd8-8350-f27bbd3af28f. I log nativi confermano compilazione e packaging da sorgente di ExpoModulesCore ed ExpoMediaLibrary. Upload Apple riuscito: https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/submissions/fe5ee8f9-4b42-4df7-b3df-927adcd94f9e. I controlli GitHub (TypeScript e 63 test) sono superati.

Aggiornamento 10 ottobre 2026, ore 03:24 Europe/Rome: Apple ha completato l'elaborazione della build 3. Build aggiunta al gruppo interno Proprietario — prova iPhone; stato Testing verificato nella tabella del gruppo (1 tester, 2 build). Il tester risulta ancora con build 2 installata: deve aggiornare alla 1.0.0 (3) in TestFlight e verificare l'avvio sul dispositivo prima di dichiarare il problema risolto. Nessun log privato del tester è inserito nel repository. Backup verificato invariato a 277466878a64f6c49eecb691ecd9c6fb595ef41a.


## Adattamento iPhone — 10 ottobre 2026

Correzione a57239c2bdb5cd07ea7e3e5282f28e49d636773b: provider delle aree sicure alla radice dei modali Studio (dettaglio e filtri) e del visualizzatore fotografico; commestibilità su una riga propria senza colonna fissa di 98 punti; miniature con cover, visualizzazione ingrandita completa mantenuta con contain. Lo screenshot del tester documentava sovrapposizione alla barra di stato, etichetta spezzata e bande nelle miniature.

TypeScript e 63 test superati localmente e in GitHub Actions. Runtime iOS verificato identico alla build 3: 29a60ac4b6192d029d49078ef7ccd2c3f35415db. Aggiornamento OTA iOS pubblicato su production con workflow completato: https://github.com/gianpaolobol/fungo-italia/actions/runs/38016332192. Gruppo aggiornamento: https://expo.dev/accounts/gianpaolobol/projects/fungo-italia-/updates/7348c518-f10b-4fb5-8296-d71b4bde130d; Expo mostra collegamento al canale production e a una build compatibile. Per scaricarlo, aprire online e riaprire completamente l'app dopo il download. La resa finale su iPhone deve ancora essere confermata dal tester. Nessuna modifica al backup.
