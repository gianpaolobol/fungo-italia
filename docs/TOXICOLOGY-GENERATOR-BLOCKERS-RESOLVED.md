# Risoluzione dei due blocchi del generatore — 2026-10-08

## Fonte primaria
Sitta N., Davoli P., Floriani M., Suriano E. (2021), *Guida ragionata alla commestibilità dei funghi*, Regione Piemonte.
https://www.regione.piemonte.it/web/sites/default/files/media/documenti/2021-09/guida_commestibilita_funghi_isbn_979-12-200-9297-5.pdf

## Correzioni nel dataset sorgente
- Tricholoma pardinum: studyProfile.edibility = 'Tossico gastrointestinale (tossicità costante)', pagina PDF 85 (testo a pagina stampata 86 circa).
- Chlorophyllum molybdites: studyProfile.edibility = 'Tossico (sindrome morganica gastrointestinale)', pagina PDF 39 (testo a pagina stampata 40 circa).
- In src/data/toxicology-syndromes.json sono stati precisati sindrome morganica, latenza breve, possibili complicazioni neurologiche e citazioni puntuali per le due specie.

## Verifica effettuata
Rilettura diretta via GitHub di catalog.json, study-profiles.json e toxicology-syndromes.json: 20 associazioni, zero taxa mancanti, zero associazioni senza profilo edibility sorgente. Nessun valore fittizio o attestazione di revisione indipendente aggiunti.

## Limiti e gate ancora aperti
La verifica è statica: non equivale all'esecuzione di npm run prepare:data, node scripts/audit-toxicology-release.mjs --strict, test e build. Il gate scientifico resta bloccato perché tutte le associazioni richiedono revisione indipendente e le altre schede presentano lacune. Non unire la PR #34 fino a test e revisione.
