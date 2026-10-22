# Copertura obbligatoria degli esami fotografici

**Requisito:** ogni voce visualizzata nell'Atlante Fungo Italia deve essere candidata a un caso di riconoscimento fotografico. È vietato considerare il solo ripasso teorico come copertura fotografica.

Inventario verificato sulla base del branch di revisione:
- Atlante minimo: 148 schede, di cui 86 già incluse nella banca fotografica e 62 ancora escluse.
- Approfondimenti/gruppi: 66 voci, nessuna attualmente inclusa nella banca fotografica.
- Totale: **214 voci**, **86 casi fotografici**, **128 casi mancanti**.

Per gruppi, sezioni e aggregati tassonomici, una fotografia di una singola specie non deve essere presentata come identificazione non ambigua dell'intero gruppo: il quesito deve spiegare il livello di riconoscimento e usare immagini correttamente attribuite. Se manca una triade fotografica affidabile o una categoria commestibilità univoca, il caso resta *bloccato editorialmente*, non viene inventato un corretto risultato alimentare.

Il controllo in `scripts/audit-photo-exam-coverage.mjs` genera `artifacts/photo-exam-coverage.json` e con `--strict` fallisce finché non esiste un caso valido per ogni voce, con tre viste attribuite, categoria valida e preparazione identica a quella approvata nella Guida ragionata. I test unitari sono in `scripts/audit-photo-exam-coverage.test.mjs`.

Comandi:
```bash
node --test scripts/audit-photo-exam-coverage.test.mjs
node scripts/audit-photo-exam-coverage.mjs
node scripts/audit-photo-exam-coverage.mjs --strict
```

Le sessioni rimangono composte da 15 quesiti: **copertura della banca** non significa mostrare 214 casi in una singola sessione. La selezione tra sessioni dovrà consentire nel tempo di incontrare ogni voce, verificando bilanciamento e rotazione senza ripetere soltanto le specie più comuni.

Non integrare su `main` un banco ampliato finché la documentazione fotografica, le fonti di commestibilità e le condizioni di preparazione non risultano controllate, inclusa la revisione indipendente richiesta dal gate scientifico.
