# Preparazione doppio esame — 26 ottobre 2026

Stato: specifica di implementazione, **non** attestazione di integrazione o validazione scientifica.

## Invarianti
- L'esame di riconoscimento esistente resta funzionante: 15 casi per sessione, nomenclatura e giudizio alimentare valutati separatamente, autocompletamento dopo 3 caratteri, feedback e ripasso errori.
- Ogni taxon pubblicato nell'atlante, entro il perimetro tassonomico S1, deve essere raggiungibile dall'esame di riconoscimento. Non equivalere automaticamente gruppi didattici, taxa, casi fotografici e immagini: registrare la copertura con chiavi canoniche e distinguere foto disponibile / non disponibile.
- Non mostrare una foto generica come se identificasse un taxon certificato; mantenere provenienza, hash, fonte e stato di revisione. Le foto personali/analisi restano non accessibili.
- La Guida ragionata alla commestibilità S2 prevale per lo status alimentare. La presenza nell'atlante non autorizza automaticamente il consumo o la commercializzazione.
- Nessun cambiamento a StoreKit, paywall, entitlement o controlli obbligatori Apple.

## Esame teorico
- Seconda modalità nella schermata Esame, distinta dal riconoscimento, 15 domande per sessione.
- Argomenti: normativa sulla figura del micologo (D.M. 686/1996 e altre disposizioni pertinenti), commercializzazione dei funghi, tossicità e sindromi, taxa mortali e tossici gastrointestinali costanti, nomenclatura, diagnosi differenziale e sosia.
- Mix iniziale suggerito: 3 normativa, 2 commercio, 4 sindromi/tossicologia, 3 mortali/GI costanti, 3 diagnostica. Bilanciamento adattivo successivo senza eliminare aree.
- Risposte singole, multiple e vero/falso. Le opzioni devono essere univoche; nessuna domanda senza fonte e risposta verificata può essere pubblicata.
- Ogni item: id stabile, categoria, livello, testo, opzioni, insieme risposte corrette, spiegazione per ciascuna opzione, fonte precisa (documento/versione/pagina o articolo normativo), data verifica, eventuale incertezza, taxa S1 associati, stato revisione.
- Per la normativa, verificare testo vigente e ambito territoriale; distinguere norme nazionali da regionali. Per il commercio, verificare elenchi nazionali e integrazioni regionali vigenti, non dedurre la vendibilità dalla commestibilità S2.
- Errore di classificazione di taxon mortale come commestibile: marcatore critico distinto dal punteggio. Non dichiarare certificazione ispettiva tramite un quiz.

## Persistenza e feedback
- Storici distinti per riconoscimento e teoria; risultati su 15, argomenti, errori critici, suggerimenti usati, ripassi, copertura cumulativa.
- Nessuna soluzione visibile prima della conferma. Feedback motivato dopo la risposta; ripasso esclusivamente degli errori, preservando la valutazione indipendente di specie e commestibilità.
- Nessuna ripetizione non intenzionale nella stessa sessione; distribuzione progressiva su tutto il perimetro verificato.

## Verifiche prima di una PR
1. Inventariare il catalogo corrente e il generatore dei casi: confrontare ID canonici, duplicati, taxa senza casi e casi senza taxon.
2. Verificare la reale presenza e provenienza delle immagini, senza inventare asset mancanti.
3. Inventariare i quesiti teorici esistenti (handoff 25/10: 421 documentati) e deduplicare per significato, non solo per testo.
4. Eseguire audit scientifico per ogni risposta; quarantena per elementi incerti.
5. Implementare la demo in branch con test di regressione, typecheck, generazione dati, test UI e controlli release.
6. Richiedere approvazione esplicita della demo prima di merge su main o deploy.

## Stato iniziale verificato
- package.json su main: versione 1.1.0, Expo 58.0.2, React Native 0.88.0-rc.3.
- docs/HANDOFF.md del 25/10 riporta 218 unità minime, 218 casi, 421 domande teoriche e 200 immagini (150 collegate, 50 solo fonte), ma segnala gate scientifico strict ancora bloccato.
- Tali numeri sono dichiarazioni dell'handoff e **non** costituiscono una verifica indipendente del contenuto o della copertura.

## Vincoli di consegna
Nessun merge, push su main, pubblicazione web/TestFlight/App Store senza revisione della demo e superamento delle verifiche pertinenti.
