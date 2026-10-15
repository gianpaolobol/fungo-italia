# Fungo Italia — stato App Store, 15 ottobre 2026

Verificato direttamente con App Store Connect tramite la credenziale esistente di Expo. App `6821140326`, bundle `it.fungoitalia.app`.

- Versione 1.0 in `PREPARE_FOR_SUBMISSION`: non pubblicata e non in revisione.
- Build 1.0.0 (7), ID `2a369ae5-da4f-40ff-bdeb-d61859ac9436`, elaborata `VALID` e associata alla versione.
- Prezzo italiano **9,99 EUR**, mercato base Italia: creato e riletto dal listino Apple. Negli altri mercati Apple calcola gli equivalenti locali.
- **175 territori su 175** selezionati, con disponibilità nei nuovi territori attiva, secondo la scelta esplicita del titolare.
- Descrizione, sottotitolo, parole chiave e testo promozionale italiani aggiornati alle funzioni native Studio/Aree/Esame; nessuna promessa di riconoscimento automatico o di strumenti presenti soltanto sul web.
- URL assistenza e privacy corretti. Email pubblica autorizzata dal titolare: `gianpaolo.franceschini@gmail.com`.
- Contatti privati del revisore già presenti: preservati e non riportati qui. Account demo non richiesto; istruzioni del revisore salvate.
- Screenshot ancora da caricare. È stata predisposta acquisizione dell'app nativa Release su simulatori iPhone/iPad; non usare screenshot PWA per rappresentare l'app nativa.
- Preparazione nativa corretta: il generatore icona sovrascriveva un PNG valido con Base64 troncato. Ora conserva e convalida il file originale; due test di regressione passano.
- Questionario Privacy dell'app, contratti per le app a pagamento e dati fiscali/bancari non sono esposti dall'API pubblica usata. Il loro completamento non è attestato da questo audit.

## Privacy tecnica

Il client Expo Updates invia `EAS-Client-ID`, piattaforma, runtime e identificativi degli aggiornamenti; può inviare `Expo-Fatal-Error` dopo un errore di avvio. Non compilare automaticamente “Dati non raccolti”. La dichiarazione deve corrispondere alla build e al trattamento dei fornitori. Riferimento verificato: https://github.com/expo/expo/blob/main/packages/expo-updates/ios/EXUpdates/AppLoader/FileDownloader.swift .

## Evidenze

- Listino italiano e metadati riletti dal job `116386170707` del workflow https://github.com/gianpaolobol/fungo-italia/actions/runs/38724021430 .
- Distribuzione mondiale confermata dal job `116390503065` del workflow https://github.com/gianpaolobol/fungo-italia/actions/runs/38725587249 .

Nessun segreto, contatto privato dei revisori o dato fiscale è conservato in questi file. Il prezzo configurato non equivale alla pubblicazione o all'approvazione Apple.
