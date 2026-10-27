# PWA verification recovery Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan.

**Goal:** Avviare una nuova verifica della coppia già pubblicata senza dipendere dal riavvio Actions fallito.
**Architecture:** Un solo trigger push sul file di richiesta dei profili originali, nel workflow esistente già ammesso da assertPublisherDiff. Su push solo verifica; su workflow_dispatch comportamento precedente preservato.
**Tech Stack:** GitHub Actions, Node24.3.0, Playwright1.62.0, Python/PyYAML per verifica locale del workflow.

## Global Constraints
Nessun cambio applicativo, scientifico, Apple, diritti o ricevute. Nessun deploy da push, OTA o build iOS. Guard Apple/scientifici/source esistenti obbligatori. Profili originali12739667356 con ZIPe7cff7a0133764ec0daa8400d19b13f9114bdc8cdcefb1244f4a86dbc109f4d3. Nessun nuovo conteggio di prove superate senza esecuzione.

## Review Focus
- Push non deve eseguire alcuno step di pubblicazione.
- Modalità manuale deve conservare input e condizioni precedenti.
- Profilo originale e hash devono restare fissati, senza ricattura.
- Concorrenza/main guard e verifica SHA corrente invariati.
- Il nuovo controllo può fallire: conservare log/negativi senza indebolire assert.

## Task 1
- [x] Leggere workflow, policy, producer e prove startup_failure.
- [x] Test locale fallisce sul trigger push assente.
- [x] Modificare solo promote-paired-demo.yml: trigger mirato, default solo push, tutte le pubblicazioni richiedono workflow_dispatch.
- [x] Parsing YAML e test condizioni/profili/guard.
- [x] PR/revisione, integrazione e nuova esecuzione reale.
- [x] Ispezionare prove finali o descrivere il blocco concreto.

Esito: PR129 integrata, run40576277750 SUCCESS, artifact12767414065 ZIPf7813b4c4e0c7c9790d22e1e05034d303a8ee9947810237ea711d93c4eb74083 verificato, rapporti e4screenshot ispezionati. Nessuna pubblicazione o nuovo binario.
