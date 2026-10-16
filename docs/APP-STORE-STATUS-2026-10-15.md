# Fungo Italia — stato App Store, 15 ottobre 2026

> Documento storico: il 16 ottobre il titolare ha sostituito la vendita una tantum con un abbonamento annuale. Vedi [configurazione aggiornata](APP-STORE-SUBSCRIPTION-2026-10-16.md).

Verificato direttamente con App Store Connect tramite la credenziale esistente di Expo. App `6821140326`, bundle `it.fungoitalia.app`.

- Versione 1.0 in `PREPARE_FOR_SUBMISSION`: non pubblicata e non in revisione.
- Build 1.0.0 (7), ID `2a369ae5-da4f-40ff-bdeb-d61859ac9436`, elaborata `VALID` e associata alla versione.
- Prezzo italiano **9,99 EUR**, mercato base Italia: creato e riletto dal listino Apple. Negli altri mercati Apple calcola gli equivalenti locali.
- **175 territori su 175** selezionati, con disponibilità nei nuovi territori attiva, secondo la scelta esplicita del titolare.
- Descrizione, sottotitolo, parole chiave e testo promozionale italiani aggiornati alle funzioni native Studio/Aree/Esame; nessuna promessa di riconoscimento automatico o di strumenti presenti soltanto sul web.
- URL assistenza e privacy corretti. Email pubblica autorizzata dal titolare: `gianpaolo.franceschini@gmail.com`.
- Contatti privati del revisore già presenti: preservati e non riportati qui. Account demo non richiesto; istruzioni del revisore salvate.
- Categorie Apple configurate e rilette: `EDUCATION` e `REFERENCE`.
- **Sei screenshot nativi caricati e accettati da Apple (`COMPLETE`)**: Studio, Aree ed Esame per iPhone 16 Pro Max (1320×2868) e iPad Pro 13-inch M4 (2064×2752). Tutti controllati visivamente; PNG RGB opachi, con provenienza e hash nel [manifest](../store/screenshots/manifest.json). Nessuno screenshot PWA o mockup generato.
- Test di navigazione nativa superati sui due simulatori: avvio Release, ricerca, apertura della scheda, passaggio ad Aree ed Esame.
- Versione web pubblicata su GitHub Pages: 50 test WebKit superati, inclusa apertura offline di privacy/assistenza. Verifiche dati mobili e TypeScript superate.
- Preparazione nativa corretta: il generatore icona sovrascriveva un PNG valido con Base64 troncato. Ora conserva e convalida il file originale; due test di regressione passano.
- Il titolare conferma che il questionario Privacy dell'app **non è ancora compilato**. L'API pubblica interrogata risponde `404 PATH_ERROR` per questa funzione: completarlo nel portale seguendo [la scheda tecnica](APP-STORE-PRIVACY-WORKSHEET.md).
- Contratti per le app a pagamento e dati fiscali/bancari non sono esposti dall'API pubblica usata. Il loro completamento non è attestato da questo audit.

## Passaggio ancora aperto

Il questionario [Privacy dell'app](https://appstoreconnect.apple.com/apps/6821140326/appPrivacy) resta da compilare e pubblicare nel portale, secondo la conferma del titolare. La disponibilità della build e dei materiali non equivale all'invio in revisione. Nessun invio finale è stato eseguito con questo requisito ancora aperto.

## Privacy tecnica

Il client Expo Updates invia `EAS-Client-ID`, piattaforma, runtime e identificativi degli aggiornamenti; può inviare `Expo-Fatal-Error` dopo un errore di avvio. Non compilare automaticamente “Dati non raccolti”. La dichiarazione deve corrispondere alla build e al trattamento dei fornitori. Riferimento verificato: https://github.com/expo/expo/blob/main/packages/expo-updates/ios/EXUpdates/AppLoader/FileDownloader.swift .

## Evidenze

- Listino italiano e metadati riletti dal job `116386170707` del workflow https://github.com/gianpaolobol/fungo-italia/actions/runs/38724021430 .
- Distribuzione mondiale confermata dal job `116390503065` del workflow https://github.com/gianpaolobol/fungo-italia/actions/runs/38725587249 .

- Acquisizione nativa: https://github.com/gianpaolobol/fungo-italia/actions/runs/38729164821 .
- Rilettura finale Apple del 15 ottobre 2026 alle 12:10 UTC: screenshot 3+3, categorie Istruzione/Consultazione, versione ancora `PREPARE_FOR_SUBMISSION`, build associata (7), nessun account demo richiesto. Job `116413766122`: https://github.com/gianpaolobol/fungo-italia/actions/runs/38729164716 .
- Tutte le sei immagini confermate `COMPLETE` dal job `116413295764`: https://github.com/gianpaolobol/fungo-italia/actions/runs/38732450123 .
- Verifica web e pubblicazione delle pagine legali: https://github.com/gianpaolobol/fungo-italia/actions/runs/38729636903 .

Nessun segreto, contatto privato dei revisori o dato fiscale è conservato in questi file. Il prezzo configurato non equivale alla pubblicazione o all'approvazione Apple.
