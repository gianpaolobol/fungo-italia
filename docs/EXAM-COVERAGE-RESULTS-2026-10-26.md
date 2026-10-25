# Audit quantitativo effettivo — 26 ottobre 2026

Fonte: lettura integrale in questa sessione di `src/data/catalog.json` e `src/data/exam-bank.json` su main; confronto per ID canonico. Questo audit non esegue l'app né convalida la scienza delle schede.

| Metrica | Risultato |
|---|---:|
| Schede canoniche | 148 |
| Casi riconoscimento | 86 |
| Schede senza caso | 62 |
| Copertura | 58,1081% |
| ID duplicati nella banca | 0 |
| Casi orfani rispetto al catalogo | 0 |

Ranghi delle 62 schede escluse: 13 species; 37 speciesGroup; 8 section; 1 subgenus; 2 subsection; 1 genus.

Classificazione alimentare delle escluse: toxic 9, deadly 3, free 25, inedible 7, conditional 8, discouraged 5, mixed 4, nessuna 1. Le categorie `mixed` e `none` non devono essere convertite arbitrariamente in un giudizio univoco.

Esempi critici: `Amanita verna / Amanita vidua`, `Cortinarius rubellus`, `Galerina marginata group`, `Clitocybe dealbata / Collybia rivulosa`. Diverse schede escluse hanno tre immagini di riferimento: l'esclusione non è quindi spiegabile solo con assenza di fotografie.

## Diagnosi del codice
`web/public/exam-core.js`, funzione `buildExamBank`, esclude esplicitamente ogni `rank !== 'species'` e ogni nome che non corrisponda a un binomio semplice. Richiede inoltre categoria alimentare documentata, almeno tre foto con subjectTaxon coerente, evidenze alimentari, e per i casi pertinenti dati di preparazione/sindrome. `selectCases` campiona solo il banco così filtrato.

## Intervento proposto (non ancora applicato)
1. Mantenere il riconoscimento al rango richiesto da S1 (specie, gruppo, sezione, genere), con rubriche specifiche e nomi accettati verificati; nessuna forzatura di nomi binomiali.
2. Distinguere casi fotografici sufficientemente documentati da unità senza supporto fotografico; rendere visibile la copertura e il debito di validazione, non falsare il 100%.
3. Conservare status `mixed` come quesiti differenziati e non dedurre commestibilità senza evidenza S2.
4. Aggiungere test automatici per 148 ID canonici, 86 casi attuali e regressioni di sicurezza prima di estendere la selezione.
5. Integrare separatamente esame teorico e normativa verificata, dopo demo approvata.

## Limiti
Non sono state verificate in questa lettura le 70 schede/gruppi aggiuntivi menzionati dall'handoff; il conteggio è riferito esclusivamente ai 148 record del catalogo canonico letto. Non è stato eseguito il runner Node o l'export nativo. Nessuna modifica al generatore o alla release.
