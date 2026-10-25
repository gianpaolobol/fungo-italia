# Fungo Italia

[Apri l’app web](https://gianpaolobol.github.io/fungo-italia/) · [Assistenza](https://gianpaolobol.github.io/fungo-italia/support.html) · [Privacy](https://gianpaolobol.github.io/fungo-italia/privacy.html)

L’anteprima corrente usa lo stesso `App.tsx` della versione iPhone/iPad. La pubblicazione web avviene dopo la conferma su TestFlight dello stesso sorgente e della stessa icona; dal fungo in alto a destra puoi verificare la versione. Acquisto e ripristino Apple richiedono l’app installata da TestFlight/App Store. Vecchi Snack Expo Go e il servizio storico Floot non sono la versione di test corrente. Note e strumenti web precedenti sono conservati nella sezione [strumenti personali](https://gianpaolobol.github.io/fungo-italia/strumenti/).

Atlante didattico di micologia per consultazione e ripasso: 148 unità minime e 66 schede di generi/gruppi, con 71 macroaree in 20 regioni.

## Studio e consultazione

Ricerca per nome scientifico, nome comune e sinonimo; navigazione tra schede con tap e scrolling; fotografie disponibili di fianco, sopra e sotto con ingrandimento. Caratteri distintivi, confronti, habitat e fonti accompagnano le informazioni documentate su odore, sporata, classificazione alimentare e preparazione. Per Russula è previsto il riferimento alla scala della sporata I–IV.

L’esame fotografico propone sessioni di 15 casi, correzioni e ripasso degli errori. Preferiti, ripresa dello studio e storico restano sul dispositivo. Le aree rappresentano territori e habitat indicativi: non sono fungaie garantite né autorizzazioni alla raccolta.

Le immagini e la copertura delle singole viste dipendono dalle evidenze conservate per ogni scheda. La revisione micologica indipendente resta pendente nelle attestazioni: i test software non la sostituiscono. Il catalogo ha finalità didattiche e non certifica esemplari per il consumo. I documenti di provenienza e i controlli scientifici restano conservati nel progetto.

## Smartphone e distribuzione

- **Web/PWA:** GitHub Pages è il percorso pubblico operativo. Su iPhone: Safari → Condividi → Aggiungi alla schermata Home. Dopo la preparazione della cache, schede, immagini incluse ed esercizi sono disponibili offline. Mappe online e fonti esterne richiedono connessione. Note e bozze web prevedono backup e ripristino; il browser può eliminare i dati locali.
- **Android:** la versione nativa corrente consente la demo Agaricus; acquisti non implementati su questa piattaforma. [scarica l’APK di anteprima verificato](https://github.com/gianpaolobol/fungo-italia/releases/download/native-preview/Fungo-Italia.apk). La pipeline aggiorna l’APK dopo compilazione e prova nell’emulatore. La firma dell’anteprima è quella debug del template Expo; non è una distribuzione Google Play.
- **iPhone/iPad nativi:** download gratuito, demo con tutte le schede Agaricus e test dedicato ripetibile di4casi. Unico abbonamento completo a **19,99€/anno in Italia**, con prezzo locale Apple negli altri Paesi. Dashboard a fungo, storico, lacune e ripasso adattivo; preparazione stimata, non garanzia di superamento. Nessun acquisto Base. App Store non ancora pubblicata; nuovo candidato TestFlight diagnostico da verificare sullo SHA consolidato. [Selezione branch e stato](docs/audit/BRANCH-SELECTION-2026-10-21.md).

L’accesso iOS dipende da transazioni Apple verificate, non revocate e non scadute. Non esiste un flag premium locale che sostituisca la verifica. Per decisione del titolare del22 ottobre2026, il caricamento e l’analisi locale delle foto restano disattivati e non accessibili dall’app. Il codice viene conservato per versioni future: [stato e condizioni di riattivazione](docs/PHOTO-LIBRARY-DEFERRED.md). Le fotografie incluse non richiedono accesso alla libreria Foto; la selezione e pubblicazione amministrativa delle immagini sono disponibili nella versione web. Non viene attestato un riconoscimento automatico delle fotografie.

## Contributi e immagini

I contributori possono aprire il [modulo scientifico GitHub](https://github.com/gianpaolobol/fungo-italia/issues/new?template=scientific-contribution.yml), indicando taxon, correzione e fonte puntuale. Le proposte sono pubbliche e richiedono revisione.

La modalità amministrativa web permette di sostituire separatamente le viste fotografiche autorizzate. Le copie pubblicate entrano nel repository pubblico e negli asset dell’atlante. Gli aggiornamenti nativi richiedono validazione della pipeline e un runtime compatibile.

## Verifiche tecniche

La suite web comprende **65 test**, con navigazione a 320 punti, esame, fotografie offline, preferiti, note, importazione e pagine legali. Il controllo dopo la pubblicazione apre il sito Pages effettivo. Queste prove non attestano un test su iPhone fisico.

La pipeline nativa controlla dati, TypeScript e bundle, compila Android e lo prova nell’emulatore. I test StoreKit separano integrazione nativa e acquisto dall’interfaccia su iPhone/iPad; il percorso di produzione richiede entrambe le evidenze sul codice corrispondente. Il candidato diagnostico consolidato richiede demo UI riuscita e prove native/acquisto UI completate sullo stesso SHA; registra gli eventuali fallimenti senza dichiarare prontezza App Store. Non seleziona un binario per App Store. Il registro di distribuzione distingue prove riuscite, fallite e ancora in corso.

Le precedenti automazioni OTA/submit iOS sono archiviate in `docs/release-workflow-archive` in attesa di riesame delle nuove prove. Le modifiche ai contenuti e alle immagini possono essere distribuite via EAS Update quando compatibili; nuove funzioni native richiedono un nuovo binario. Actions ed EAS possono applicare quote.

## Sorgenti

Node >=24.3.0; `npm ci`, `npm run prepare:data`, `npm run typecheck`. I workflow GitHub gestiscono compilazione e distribuzione. Expo 58.0.2 usa React 19.3.0 e React Native 0.88.0-rc.3, con override esplicito dei peer prerelease.

Il progetto precedente Next/React è conservato in `legacy/web` e nei branch `backup/pre-migration-flutter` e `backup/verified-web-readiness`. Il percorso pubblico attuale è GitHub Pages.

Il [percorso production iOS](docs/PRODUCTION-IOS-PROMOTION.md) distingue le prove di sorgente, la build firmata e le verifiche Apple ancora necessarie.
