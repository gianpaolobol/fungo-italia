@AGENTS.md

Leggere quindi [docs/HANDOFF.md](docs/HANDOFF.md), iniziando da **Stato operativo e decisioni correnti**, **Beta 19** e **Condizioni ancora da documentare per App Store**. La cronologia è conservata per tracciabilità e non è una lista di attività da ripetere.

- Beta verificata: 1.1.0 (19), SHA `279d50e842a95c6a7d8e3499806b3fd5c42996e7`, run 40122020361; test StoreKit nativo/UI/demo superati, distribuzione TestFlight interno e web attestata. `diagnosticOnly=true`, `appStoreReady=false`: nessuna approvazione App Store o scientifica deducibile. Non riaprire la diagnosi StoreKit già superata senza una nuova regressione documentata.
- Decisione commerciale corrente: demo Agaricus + test 4 casi ripetibile, unico annuale completo **19,99 €**, nessun Base permanente; Android demo-only. Le proposte Base + annuale sono storiche e superate.
- Foto personali: mantenere caricamento/analisi inaccessibili; conservare codice e documentazione. Preservare il lavoro separato della [PR 117](https://github.com/gianpaolobol/fungo-italia/pull/117), ancora in bozza alla verifica del 25 ottobre 2026; non attribuirlo a main né integrarlo implicitamente.
- Ogni futura prova o release deve indicare il proprio SHA: l'aggiornamento dei documenti non crea un nuovo binario e non trasferisce le prove della beta 19 a un altro commit.
