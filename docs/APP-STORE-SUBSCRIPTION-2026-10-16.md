# Fungo Italia — abbonamento annuale, 16 ottobre 2026

La nuova richiesta del titolare sostituisce la vendita una tantum a 9,99 € documentata il 15 ottobre.

## Configurazione Apple verificata
- App: 6821140326; download **gratuito**, prezzo Apple riletto 0.0.
- Gruppo: 22483824, Fungo Italia Premium.
- Prodotto: `it.fungoitalia.premium.annual`; subscription ID 6823502997.
- Durata Apple: **ONE_YEAR**, con rinnovo automatico; nessuna offerta introduttiva o prova gratuita.
- Italia: **9,99 EUR / anno**; 175 prezzi territoriali equivalenti configurati.
- Disponibilità: 175 territori, nuovi territori abilitati.
- Localizzazione italiana di gruppo e prodotto salvata.
- Evidenza: https://github.com/gianpaolobol/fungo-italia/actions/runs/38861832409 .
- La descrizione della scheda include prezzo annuale, rinnovo, annullamento, ripristino, privacy e EULA.

## Implementazione
StoreKit 2 tramite modulo Expo locale, senza SDK di billing esterni. Acquisto e ripristino interrogano Apple; accesso completo solo con transazione verificata, non revocata e non scaduta. Stato ricontrollato al ritorno in primo piano, su aggiornamenti delle transazioni e alla scadenza. Nessun flag premium persistito, nessun identificativo di transazione esposto a JavaScript, nessun server dello sviluppatore che riceve ricevute.

Anteprima gratuita: cinque schede e Aree. L’abbonamento sblocca Studio completo ed Esame; nella pagina Abbonamento restano disponibili ripristino, gestione e condizioni.

## Verifiche e pubblicazione
- TypeScript e test della policy superati nel workflow mobile.
- Compilazione Release e test UI su iPhone/iPad in corso: https://github.com/gianpaolobol/fungo-italia/actions/runs/38862121517 .
- Test integrati Apple SKTestSession per acquisto, rimborso e scadenza predisposti; la fixture resta confinata al target XCTest.
- Nuovo binario iOS necessario: la build (7) **non contiene gli acquisti** e non va inviata per questa offerta.
- Screenshot aggiornati e screenshot del paywall per la revisione dell’abbonamento da acquisire e verificare.
- Questionario Privacy dell’app: il titolare ha dichiarato che è vuoto. La compilazione nel portale resta necessaria e non disponibile nell’API autorizzata. Vedi [scheda tecnica](APP-STORE-PRIVACY-WORKSHEET.md).
- Contratti per app a pagamento, dati fiscali e bancari non verificati dall’API disponibile.
- Nessun invio in revisione o pubblicazione viene attestato da questo documento.
