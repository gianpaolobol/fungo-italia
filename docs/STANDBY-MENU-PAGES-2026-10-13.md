# Fungo Italia — pagine messe in stand-by

Data: 2026-10-13

## Decisione prodotto

Per la prima versione pubblicabile si mantiene una navigazione semplice e pulita. Le seguenti voci vengono rimosse dal menu inferiore dell'app nativa e non vengono caricate/montate nell'app:

- Note
- Contributi
- Foto
- 3+1

## Stato delle pagine

Le funzionalità non vengono eliminate concettualmente. Restano in stand-by per una futura ripresa, dopo la prima versione semplice:

- `components/Drafts.tsx` — Note / bozze
- `components/Community.tsx` — Contributi
- `components/PhotoLibrary.tsx` — Selezione e analisi foto
- `components/ThreePlusOneReview.tsx` — Revisione 3+1

## Versione semplificata attiva

La prima versione dell'app deve privilegiare:

- Studio / atlante
- Aree
- Esame fotografico

## Regola di recupero futuro

Quando verrà richiesto di ripristinare una di queste sezioni, recuperare la relativa voce di menu e rimontare il componente associato, verificando prima che la funzionalità sia coerente con l'esperienza utente e con il flusso di pubblicazione App Store.
