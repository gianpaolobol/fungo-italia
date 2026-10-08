# Lotto fotografico — 2026-10-08

Branch: feat/beta-content-gate-oct08; main non modificato.

## Modifiche
- web/public/gallery-cleanup.css: thumbnails in contenitori quadrati, object-fit cover e object-position con variabile CSS --fungo-photo-position; nessuno stretching.
- web/public/admin-photos.css: preview amministrativa quadrata con cover, coerente con la miniatura pubblica.
- Visualizzatore full image esistente non modificato.

## Limitazioni e verifiche necessarie
- La variabile CSS non è ancora collegata a metadati di focal point persistenti; zoom/crop amministrativo e salvataggio non sono implementati da questo lotto.
- I bordi bianchi incorporati nei file non sono necessariamente rimossi da cover.
- Nessun test browser/CI eseguito in questa sessione; verificare CSS cascade, rendering Safari iPhone 320pt, immagini portrait/landscape/panoramiche, aggiornamento cache e test di regressione.
- La pubblicazione è sospesa fino a esito test e revisione del crop diagnostico.
- Non sono state sostituite fotografie né modificate attestazioni scientifiche.

## Prossimo intervento
Ispezionare admin-photo-core.js e generazione markup in app.js; definire metadati di focal point, controlli accessibili, round-trip GitHub, versionamento/cache e test end-to-end prima del merge.
