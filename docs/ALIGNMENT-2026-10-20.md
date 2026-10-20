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
Lo stato READY_TO_SUBMIT dell'annuale non attesta che il prodotto sia incluso nella submission dell'app. L'audit corrente non legge gli elementi della review submission: inclusione da verificare separatamente prima di dichiarare che il prodotto sarà approvato con l'app.
Il rilascio attuale è manuale: l'approvazione non comporterà automaticamente la pubblicazione senza il successivo comando di rilascio.
Non sostituire automaticamente il binario durante la revisione e non trasferire sullo Store la build diagnostica senza i controlli StoreKit.

## Evidenze
- https://github.com/gianpaolobol/fungo-italia/actions/runs/38897130747 (ultima esecuzione: 20 ottobre; job 118492701606).
- https://github.com/gianpaolobol/fungo-italia/actions/runs/39026690376 (ultima esecuzione: 20 ottobre; job 118493080765).

## Limiti
Lo stato pubblico dello Store non è stato dedotto dalla sola ricerca web. Stato privacy e risposte DAC7 non sono leggibili dall'API usata. Nessun dato fiscale o credenziale è stato modificato.

