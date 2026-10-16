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
- La prova UI con diagnostica conferma ingresso nativo, prodotto già disponibile e controller di conferma visibile; l’attesa si trova nella chiamata Apple purchase. Nuova esecuzione con attese di stato fino a 120 secondi, senza modificare le condizioni di accesso: https://github.com/gianpaolobol/fungo-italia/actions/runs/38878214557 .
- Test integrato della funzione di accesso StoreKit **superato**: acquisto verificato, rimborso e scadenza; un test reale, zero errori, 206 secondi. Evidenza: https://github.com/gianpaolobol/fungo-italia/actions/runs/38874957310 . La compatibilità minima dell’app resta invariata.
- Il runtime 26.5 presenta un difetto di StoreKit Test. Il download 26.6 non è disponibile nel catalogo del runner; è stato installato il runtime Apple **18.6 (22G86)**. I test confermano il prezzo locale italiano della fixture.
- La fixture StoreKit resta confinata ai target XCTest; non entra nell’app distribuita.
- La build (7) non contiene gli acquisti. La nuova compilazione firmata e il caricamento TestFlight sono subordinati al successo delle prove UI.
- L’associazione automatica alla versione 1.0 controlla numero reale del binario firmato, hash, sorgente e prova StoreKit; attende lo stato Apple VALID.
- Aggiornamenti iOS di produzione configurati dopo la pipeline nativa, confronto delle sorgenti di billing con l’ultima prova StoreKit riuscita e controllo del runtime fingerprint.

## Passaggi di pubblicazione ancora aperti
L’app resta PREPARE_FOR_SUBMISSION. Il titolare ha confermato vuoto il questionario Privacy: con gli strumenti disponibili richiede il portale Apple. Vedi [risposte tecniche preparate](APP-STORE-PRIVACY-WORKSHEET.md).

Apple richiede che il primo abbonamento e il relativo gruppo siano sottoposti insieme a una nuova versione dell’app attraverso il portale. Il riferimento API ufficiale riletto il 16 ottobre alle 08:16 UTC precisa: “Submit your first subscription together with an app binary submission through appstoreconnect.apple.com.” Le API descritte si applicano agli abbonamenti successivi. Riferimenti: https://developer.apple.com/documentation/appstoreconnectapi/submitting-subscriptions-and-subscription-groups-for-app-review e https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/ . Nessun invio alla revisione viene attestato da questo documento.

La lettura Apple del 16 ottobre alle 08:16 UTC segnala `TRADER_STATUS_NOT_PROVIDED` nei territori UE, Italia compresa: manca la dichiarazione DSA. In **Business → Agreements → Compliance → Digital Services Act**, Account Holder o Admin devono dichiarare lo stato effettivo e completare le verifiche richieste. Non si deve scegliere “non trader” per evitare la verifica. Guida: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements .

In **Business → Agreements** controllare inoltre che Paid Apps sia **Active**, con dati fiscali e bancari richiesti completati. L’eventuale accettazione legale richiede l’Account Holder. Contratti e dati fiscali/bancari restano non verificati dall’API usata: lo stato generico `CANNOT_SELL` di un’app non ancora pubblicata non prova, da solo, accordi mancanti.

Il gate di completezza scientifica rimane distinto dai test software. La revisione micologica indipendente è ancora pendente nelle attestazioni. Il report usa anche il catalogo pubblico, privo di alcuni metadati interni: i conteggi vanno letti insieme alla provenienza e alle evidenze conservate. Non sono state inventate attestazioni o rimosso il gate. La presentazione dell’app resta didattica e non certifica esemplari per il consumo.
