# Pubblicazione TestFlight del percorso di studio

La versione 1.1.0 usa il profilo EAS `study-beta` e il canale `study-dashboard`. Il workflow `study-testflight.yml` carica soltanto su TestFlight e non seleziona una versione App Store. La ricevuta registra SHA sorgente, hash IPA, esito UI e prove native.

Il caricamento richiede verifiche native StoreKit e Dashboard riuscite sullo stesso SHA. Una prova UI fallita permette solo una beta diagnostica esplicitamente marcata `testFlightOnly`; non apre la pubblicazione App Store. Un esito annullato o incompleto non è una verifica.

Per rilanciare su un commit che modifica solo documentazione o automazioni, avviare prima i workflow **Verify native StoreKit subscriptions**, **Verify StoreKit purchase interface** e **Validate study dashboard** sullo stesso commit, poi **Publish study dashboard to TestFlight**. Il gate accetta prove avviate da push o manualmente e rifiuta prove di un altro SHA. Non è sufficiente rilanciare vecchi job su uno SHA precedente.

Prima di dichiarare la beta disponibile, verificare nello stato Apple: build `VALID`, versione e numero corretti, gruppi interni effettivamente assegnati. L’assenza di gruppi non equivale a disponibilità per tester. Registrare anche lo stato della versione App Store 1.0 senza modificarla.

Il prodotto Base permanente è `it.fungoitalia.base.lifetime` (Apple ID 6825025102), prezzo italiano 9,99 €. La configurazione dei metadati non invia l’acquisto in revisione; uno screenshot autentico dell’acquisto resta necessario per la preparazione alla revisione.
