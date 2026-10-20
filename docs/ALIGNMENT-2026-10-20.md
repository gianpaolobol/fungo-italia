# Allineamento GitHub, TestFlight e App Store — 20 ottobre 2026

Verifica Apple: 2026-10-20T06:42:16.421Z. Lettura tramite workflow autorizzato, senza login interattivo.

| Canale | Stato verificato |
|---|---|
| GitHub main | 2c077e74e43f398f25d2430ed8e202e5197d6111 |
| App Store versione 1.0 | WAITING_FOR_REVIEW; build selezionata 9 (abed149c-5df8-4291-b752-c080548f8fa6) |
| TestFlight interno | build 11, VALID, IN_BETA_TESTING; gruppo Proprietario — prova iPhone |
| TestFlight esterno build 11 | READY_FOR_BETA_SUBMISSION |
| Abbonamento annuale | READY_TO_SUBMIT; prezzo Italia 9,99 EUR |
| Rilascio App Store | MANUAL, nessuna data minima |
| Dashboard / Base permanente | Nuovo sviluppo sul branch design/study-dashboard-v1-1; non incluso nelle build 9/11 |

## Esito
I canali non sono completamente allineati: il candidato interno più recente è la build 11, ma la revisione App Store riguarda la build 9. La versione non è pubblicata: è WAITING_FOR_REVIEW.
La lettura esplicita degli elementi della submission del 20 ottobre alle 07:04 UTC conferma un solo elemento: appStoreVersion f3a1168b-ada0-4e69-abc9-e66ee9718d81. Nessuna subscriptionVersion o subscriptionGroupVersion risulta inclusa. L'annuale è ancora READY_TO_SUBMIT: non è incluso nell'invio corrente. La submission 126bebb5-1470-4347-9e04-5f95e0391cab è stata inviata il 17 ottobre alle 14:01:03 UTC ed è WAITING_FOR_REVIEW. Prima di attestare la disponibilità commerciale dell'annuale va completato il suo invio insieme all'app nel portale Apple. Nessuna cancellazione della submission è stata eseguita.
Il rilascio attuale è manuale: l'approvazione non comporterà automaticamente la pubblicazione senza il successivo comando di rilascio.
Non sostituire automaticamente il binario durante la revisione e non trasferire sullo Store la build diagnostica senza i controlli StoreKit.

## Provenienza dei binari
La build 9 proviene dalla revisione 1bacf13c049554e2f6a42660ce8b0516adb5929b (workflow 38904049950). La build 11 proviene dalla revisione main 2c077e74e43f398f25d2430ed8e202e5197d6111 (workflow 38982998646). La revisione più recente del verificatore StoreKit su main non è quindi nel binario 9 in coda.

## Evidenze
- https://github.com/gianpaolobol/fungo-italia/actions/runs/38897130747 (ultima esecuzione: 20 ottobre; job 118492701606).
- https://github.com/gianpaolobol/fungo-italia/actions/runs/39026690376 (ultima esecuzione: 20 ottobre; job 118493080765).

- https://github.com/gianpaolobol/fungo-italia/actions/runs/39384118049 (include esplicito delle risorse app/subscription/subscriptionGroup: presente soltanto appStoreVersion).

## Limiti
Lo stato pubblico dello Store non è stato dedotto dalla sola ricerca web. Stato privacy e risposte DAC7 non sono leggibili dall'API usata. Nessun dato fiscale o credenziale è stato modificato.

## Aggiornamento ore 17:22 Europe/Rome
Nuovo controllo API in sola lettura, `checkedAt=2026-10-20T15:22:58.137Z`, job 118714356083 del workflow 38897130747.
- Versione 1.0 ancora WAITING_FOR_REVIEW, build selezionata 9; nessuna pubblicazione avvenuta.
- Build 11 ancora VALID. Nessun binario contenente Dashboard caricato.
- Annuale `it.fungoitalia.premium.annual` ancora READY_TO_SUBMIT.
- Per l'Italia l'API riporta `TRADER_STATUS_VERIFICATION_FAILED`, `CANNOT_SELL`, `AVAILABLE_FOR_SALE_UNRELEASED_APP`. La causa del fallimento della verifica dell'operatore non è esposta in questo report; occorre verificarla nella sezione Azienda di App Store Connect. Non attestare che DAC7 o privacy risolvano questo stato.
- Ramo Dashboard aggiornato al commit f622962b95122900896d71a8562c630ba93d47f3; non integrato in main. Validazione Dashboard GitHub riuscita. Test nativi e UI in corso.
