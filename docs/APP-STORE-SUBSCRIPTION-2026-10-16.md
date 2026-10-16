# Fungo Italia — abbonamento annuale, 16 ottobre 2026

La richiesta del titolare sostituisce la vendita una tantum a 9,99 € documentata il 15 ottobre.

## Configurazione Apple verificata
- App 6821140326, bundle `it.fungoitalia.app`; download gratuito, prezzo Apple riletto 0.0.
- Gruppo 22483824, Fungo Italia Premium.
- Prodotto `it.fungoitalia.premium.annual`, subscription ID 6823502997.
- Durata **ONE_YEAR**, rinnovo automatico; nessuna prova gratuita o offerta introduttiva.
- Italia **9,99 EUR / anno**; 175 prezzi territoriali equivalenti e 175 territori disponibili, nuovi territori abilitati.
- Localizzazioni italiane di gruppo e prodotto salvate.
- Sei screenshot nativi (tre iPhone, tre iPad) verificati visivamente e acquisiti dal codice annuale; elaborazione Apple **COMPLETE**.
- Screenshot del paywall per App Review: **COMPLETE**. Stato del prodotto riletto **READY_TO_SUBMIT** il 16 ottobre alle 08:11 UTC.
- Evidenza immagini e stato: https://github.com/gianpaolobol/fungo-italia/actions/runs/38871890407 .
- Il simulatore della prima acquisizione usa lo storefront USA e mostra il relativo prezzo Apple di $8.99; il prezzo italiano verificato resta €9.99. Nessun prezzo è stato sovrascritto nelle immagini.

## App e abbonamento
Su iOS/iPadOS: cinque schede e Aree disponibili nell’anteprima; accesso a tutte le schede ed Esame con abbonamento attivo. Preferiti e progressi restano sul dispositivo anche quando le schede escono dall’anteprima. Android e web mantengono l’accesso preesistente.

StoreKit 2 tramite modulo Expo locale. Acquisto e ripristino interrogano Apple. L’accesso usa transazioni verificate, non revocate e con scadenza futura; viene ricontrollato al ritorno in primo piano, su aggiornamenti StoreKit e alla scadenza. Nessun flag premium persistito, nessun identificativo di transazione esposto a JavaScript e nessun server dello sviluppatore che riceve ricevute.

Prezzo localizzato Apple, durata, rinnovo, ripristino, gestione dell’abbonamento, privacy e EULA sono presenti nel paywall e nella scheda App Store. Assistenza e privacy usano il recapito approvato dal titolare.

## Verifica tecnica
- Compilazione Release iOS e navigazione/acquisizione nativa su iPhone e iPad superate: https://github.com/gianpaolobol/fungo-italia/actions/runs/38866436691 .
- TypeScript e test della policy di accesso superati nelle preparazioni native.
- Test integrato StoreKit della funzione di accesso superato due volte: acquisto verificato, rimborso e scadenza; un test reale, zero errori. Primo passaggio in 206 secondi: https://github.com/gianpaolobol/fungo-italia/actions/runs/38874957310 . Dopo la pulizia del provider Expo duplicato nel solo target unitario, nuova prova superata in 270,923 secondi: https://github.com/gianpaolobol/fungo-italia/actions/runs/38882138907 .
- Un'esecuzione UI iPhone ha superato il ciclo completo in 254,654 secondi, compresi acquisto dall'interfaccia, riapertura, esame premium, rimborso, secondo acquisto, disdetta del rinnovo senza perdita anticipata di accesso e scadenza. Lo stesso run non è complessivamente riuscito perché la prova iPad è fallita: https://github.com/gianpaolobol/fungo-italia/actions/runs/38878214557 . Non viene attestata una prova UI del tasto esplicito Ripristina acquisti.
- Nella successiva esecuzione isolata, iPad ha completato l'acquisto verificato ma non l'accesso all'esame dopo la riapertura; iPhone è rimasto in attesa di purchase. Entrambe le prove sono fallite: https://github.com/gianpaolobol/fungo-italia/actions/runs/38882754510 .
- Corretto un difetto concreto: il timeout UI scartava definitivamente risposte StoreKit tardive. Ora una risposta verificata viene applicata anche dopo il timeout se appartiene ancora alla generazione corrente; revoche, nuove verifiche e smontaggio invalidano le risposte precedenti, e la scadenza viene ricontrollata al momento dell'applicazione. La causa specifica del precedente fallimento iPad non viene ancora attribuita a questo difetto.
- Nuove prove su runner separati iPhone e iPad con identificatori stabili dei tab, diagnostica del risultato di accesso e firma ad hoc del solo simulatore: https://github.com/gianpaolobol/fungo-italia/actions/runs/38888893682 . Nuova integrazione nativa sul medesimo codice: https://github.com/gianpaolobol/fungo-italia/actions/runs/38888893431 . Stato al momento dell'aggiornamento: in corso; nessun successo viene anticipato.
- Il runtime 26.5 presenta un difetto di StoreKit Test. Il download 26.6 non è disponibile nel catalogo del runner; è stato installato il runtime Apple **18.6 (22G86)**. Le prove confermano il prezzo locale italiano della fixture. La fixture resta confinata ai target XCTest e non entra nell'app distribuita.
- La correzione web che impedisce ai messaggi di stato di intercettare i tap è stata verificata. Tutti i **65 test PWA** sono passati anche sulla revisione c14bff45: https://github.com/gianpaolobol/fungo-italia/actions/runs/38888893564 .
- Pipeline Android, APK e prova nell'emulatore superate sulla revisione 8f35c9af: https://github.com/gianpaolobol/fungo-italia/actions/runs/38882754465 .
- La build Apple (7) non contiene gli acquisti. Nessun nuovo binario annuale è ancora attestato. Compilazione firmata e caricamento TestFlight richiedono il successo UI di entrambi i dispositivi e il più recente test nativo corrispondente agli stessi input di billing, dipendenze e configurazione Expo.
- L'associazione automatica alla versione 1.0 controlla numero reale del binario firmato, hash, sorgente e prova StoreKit; attende lo stato Apple VALID.
- Aggiornamenti iOS di produzione subordinati alla pipeline nativa, al confronto delle sorgenti di billing con l'ultima prova StoreKit UI riuscita e al runtime fingerprint. Una conclusione verde con pubblicazione saltata non attesta un aggiornamento OTA.

## Passaggi di pubblicazione ancora aperti
L’app resta PREPARE_FOR_SUBMISSION. Il titolare ha confermato vuoto il questionario Privacy: con gli strumenti disponibili richiede il portale Apple. Vedi [risposte tecniche preparate](APP-STORE-PRIVACY-WORKSHEET.md).

Apple richiede che il primo abbonamento e il relativo gruppo siano sottoposti insieme a una nuova versione dell’app attraverso il portale. Il riferimento API ufficiale riletto il 16 ottobre alle 08:16 UTC precisa: “Submit your first subscription together with an app binary submission through appstoreconnect.apple.com.” Le API descritte si applicano agli abbonamenti successivi. Riferimenti: https://developer.apple.com/documentation/appstoreconnectapi/submitting-subscriptions-and-subscription-groups-for-app-review e https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/ . Nessun invio alla revisione viene attestato da questo documento.

La lettura Apple del 16 ottobre alle 08:16 UTC segnala `TRADER_STATUS_NOT_PROVIDED` nei territori UE, Italia compresa: manca la dichiarazione DSA. In **Business → Agreements → Compliance → Digital Services Act**, Account Holder o Admin devono dichiarare lo stato effettivo e completare le verifiche richieste. Non si deve scegliere “non trader” per evitare la verifica. Guida: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements .

In **Business → Agreements** controllare inoltre che Paid Apps sia **Active**, con dati fiscali e bancari richiesti completati. L’eventuale accettazione legale richiede l’Account Holder. Contratti e dati fiscali/bancari restano non verificati dall’API usata: lo stato generico `CANNOT_SELL` di un’app non ancora pubblicata non prova, da solo, accordi mancanti.

Il gate di completezza scientifica rimane distinto dai test software. La revisione micologica indipendente è ancora pendente nelle attestazioni. Il report usa anche il catalogo pubblico, privo di alcuni metadati interni: i conteggi vanno letti insieme alla provenienza e alle evidenze conservate. Non sono state inventate attestazioni o rimosso il gate. La presentazione dell’app resta didattica e non certifica esemplari per il consumo.
