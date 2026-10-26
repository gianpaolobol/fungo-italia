# Fascicolo per attestazione micologica indipendente — 26 ottobre 2026

**Aggiornamento:** usare il [fascicolo corrente congelato](independent-review-20261026-current/README.md), preparato sullo SHA6dfb92656ec94485d94aecba72543930c2759d17, con inventario218 unità e dati scientifici identici alla beta20. Non inviato, non attestato. Il testo seguente è il precedente fascicolo storico: i suoi conteggi/SHA e la sporata di Scutiger non descrivono lo stato corrente.

Stato: **NON ATTESTATO — NON UTILIZZABILE COME CERTIFICAZIONE**.

Baseline esaminabile: `c36c90488787be7f2205b2b578695549ea1293f3`. Ogni attestazione successiva deve citare il proprio SHA effettivamente esaminato, non questa baseline se il catalogo viene modificato.

## Prerequisiti
S1 Obiettivi tassonomici V4 determina le unità; S2 Guida ragionata 2021 prevale per commestibilità. Ogni revisore deve avere accesso alle fonti e al materiale effettivamente esaminato. L'approvazione amministrativa del proprietario non sostituisce la revisione professionale.

## Lacune rilevate dall'ultimo registro disponibile
- 148/148 unità senza attestazione indipendente
- 40 evidenze a perimetro tassonomico parziale
- Due sporate non documentate nel vecchio registro (la correzione sorgente di Scutiger è successiva, non ancora confermata dalla rigenerazione)
- Un giudizio alimentare S2 non documentato
- Cinque schede con triadi fotografiche incomplete

### Unità con lacune specifiche
| Scheda | Campi ancora da verificare |
|---|---|
| Phlegmacium variiforme | missing-reference-views:lateral,top,underside |
| Entoloma saundersii | missing-reference-views:lateral,top,underside |
| Lepiota elaiophylla | missing-edibility |
| Scutiger pes-caprae | missing-spore-print |
| Ramaria formosa | missing-reference-views:underside |
| Ramaria pallida | missing-spore-print, missing-reference-views:underside |
| Ramaria botrytis s.l. | missing-reference-views:underside |

## Checklist obbligatoria per ogni unità
- Verificare rango, identità e pagina S1, incluse tutte le componenti esplicitamente in programma.
- Confrontare i tre caratteri osservabili, il carattere differenziale, habitat, confronti, odore e sporata con fonti citate a livello di pagina e taxon.
- Verificare commestibilità e sindromi sulla fonte S2, senza importare un giudizio da altre fonti.
- Controllare determinazione, tre viste, crediti, licenza e diritti delle immagini.
- Motivare incongruenze, sinonimie e limiti dei raggruppamenti. I 40 campi parziali sono in `revisione/partial-scope-verification-queue-20261026.json`.
- Registrare nome, qualifica verificabile, contatto professionale, data, SHA, ID delle sole unità esaminate, decisione per unità, fonti e motivazione, con dichiarazione del revisore.

## Registro delle attestazioni
Nessuna attestazione acquisita. **Non impostare mai** `independentReviewStatus=reviewed` o `attested` a seguito della sola redazione di questo documento. Le decisioni documentate vanno caricate separatamente e confrontate con lo SHA del catalogo esaminato. Un rifiuto o richiesta di integrazione non vale come approvazione.

## Gate
Mantenere `npm run validate:release` e tutti i controlli tossicologici e Apple obbligatori. La disponibilità TestFlight non è attestata.
