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

## Risultato del controllo rigoroso di attribuzione fotografica (22/10/2026)

Il conteggio grezzo delle viste presenti nei metadati **non dimostra** che ciascuna vista rappresenti il taxon della scheda. Il confronto esatto di `referenceImages[].subjectTaxon` con `scientificName` per le 128 voci mancanti ha trovato **solo 5 triadi con attribuzione testuale coincidente**: *Agaricus* sez. Xanthodermatei, *Lepiota elaiophylla*, *Lyophyllum decastes* s.l., *Tricholoma saponaceum* s.l., *Tricholoma acerbum* s.l. Di queste, *Lepiota elaiophylla* è priva di categoria alimentare nello schema corrente. Pertanto le restanti 123 voci richiedono riconciliazione dei soggetti fotografici o acquisizione di immagini attribuite; e anche le quattro candidate con categoria non possono essere dichiarate approvate senza verifica delle fonti e dei casi di gruppo.

Non creare casi d'esame per semplici conteggi di foto e non sostituire la risposta con il nome della scheda se le immagini sono attribuite ad altri taxa: la domanda sarebbe fuorviante. Questo controllo è più severo del precedente inventario «120 voci con tre viste registrate», che rimane solo un conteggio materiale.

## Classificazione documentale approfondita delle 128 omissioni

Un nuovo confronto tra *tutte le attribuzioni fotografiche dichiarate* e i nomi/sinonimi già presenti nelle schede ha prodotto cinque gruppi mutuamente esclusivi:

| Esito | Voci | Azione necessaria |
|---|---:|---|
| Nome esatto su tutte e tre le viste | 5 | Verificare diritti fotografici e correttezza scientifica |
| Sinonimo esplicitamente presente in scheda | 21 | Verificare corrispondenza del sinonimo, diritti e classificazione Guida |
| Un solo taxon illustrativo diverso dal nome della scheda | 67 | Documentare rappresentatività del taxon per l'intero gruppo |
| Più taxa diversi nelle viste | 27 | Creare quesito di gruppo non ambiguo o sostituire immagini |
| Triade incompleta | 8 | Recuperare fotografie attendibili e riutilizzabili |

Il dettaglio con nomi, soggetti, immagini e attribuzioni è in `docs/data/photo-exam-image-reconciliation.json`. **Nessuna voce è stata dichiarata completata dal solo confronto testuale**: per l'app in distribuzione sono necessarie la valutazione delle immagini, il relativo diritto di riutilizzo e la coerenza delle risposte della Guida ragionata. Non interpretare automaticamente il nome della cartella o il suffisso del file come conferma della specie fotografata.

Per fotografie reperite su iNaturalist, la licenza delle singole fotografie va controllata separatamente dalla licenza dell'osservazione: il sito avverte che la licenza predefinita dei media è CC BY-NC, non necessariamente compatibile con un'app che vende abbonamenti. Fonte: https://help.inaturalist.org/en/support/solutions/articles/151000169918
