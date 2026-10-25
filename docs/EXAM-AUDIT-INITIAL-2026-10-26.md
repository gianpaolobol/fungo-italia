# Audit iniziale esami — 26 ottobre 2026

## Riscontri diretti
- `src/data/catalog.json` su main è leggibile e contiene almeno i campi `id`, `scientificName`, `characters`, `lookalikes`, `sources`; un campione è `minimum-card-objective-agaricus--01--agaricus-sez-xanthodermatei`.
- `package.json`: versione 1.1.0, script `prepare:data`, `typecheck`, `validate:release`.
- `docs/RECOVERY-2026-10-23.md` descrive 148 schede minime, 70 gruppi, 86 casi fotografici, 132 casi teorici, 421 quesiti, 200 fotografie (150 collegate). Sono valori del rapporto, **non** un ricalcolo indipendente.
- Tentativi diretti su `src/data/theory-questions.json`, `src/data/theoryQuestions.json`, `src/data/exam-questions.json`: file non trovati. Non dedurre che la banca non esista; la sua posizione resta da accertare.

## Blocchi verificabili
1. Mappare i file del generatore e dell'esame tramite albero repository / checkout prima di scrivere componenti.
2. Conteggio indipendente dei taxa dell'atlante e dei casi effettivamente selezionabili; riportare differenze con ID.
3. Identificare struttura, provenienza e stato di revisione delle 421 domande; nessuna importazione cieca.
4. Verificare fonti legislative aggiornate (D.M. 686/1996, L. 352/1993, D.P.R. 376/1995, elenchi specie commercializzabili e disposizioni regionali pertinenti), distinguendo commestibilità da autorizzazione al commercio.
5. Controllare Guida ragionata S2 e fonti del corso per tutte le nuove domande; quarantena per ambiguità e divergenze.
6. Non modificare UI di riconoscimento, acquisti o pipeline Apple senza test di regressione.

## Condizioni per avanzare
Un inventario macchina leggibile con contatori, ID scoperti, taxa senza casi, casi senza taxon, quesiti senza fonte, foto senza validazione e riepilogo dei gate. Solo dopo si implementa demo teorica e si chiede approvazione prima di merge/deploy.
