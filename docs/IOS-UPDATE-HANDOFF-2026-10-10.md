# Fungo Italia — stato aggiornamento iOS

Aggiornato: 2026-10-10, 10:50 UTC
Branch: `main`

## Esito verificato

L'ultima revisione funzionale dell'app è `5e7c214b2d7ff50fefa8bb5af1d2d7cf7e20ee3e`.
È stata distribuita a TestFlight tramite aggiornamento Expo iOS sul canale
`production`, dal commit `e3cf59dc25a70572feeab1e24e45eb08d9e50d2e`.
Le modifiche successive alla revisione funzionale riguardano pipeline e documentazione.

- Workflow: `.github/workflows/ios-main-update.yml`.
- Run: `38046207818`, job `114196149857`: success.
- TypeScript: PASS.
- Test Node: 72 PASS, 0 FAIL.
- Runtime verificato prima della pubblicazione:
  `9d5f0a507eaa68f99fc6794a7f063631362c38f8`.
- Update group: `6fd17872-dd38-4c09-b186-57453c660801`.
- Canale e branch: `production`.
- Expo UI conferma questo aggiornamento come ultimo per il runtime della build 5.

## Installazione e prova

La build nativa rimane TestFlight **1.0.0 (5)**.
L'aggiornamento JS non richiede una nuova IPA né modifica il numero di build.
L'utente deve avere la build 5, aprire l'app con connessione, lasciare completare
il download e riavviare l'app per applicare l'aggiornamento.

Non è stata verificata direttamente l'applicazione dell'update sul telefono,
né l'accuratezza del filtro sulla libreria fotografica dell'utente.

## Modifiche incluse

- Analisi locale iOS in lotti di massimo 20 foto, una per volta, con pausa/ripresa.
- Foto candidate con alta confidenza fungina:
  `fungal >= 0.72` e `fungal >= other + 0.22`.
- Foto non pertinenti nascoste dalla lista principale; immagini incerte da verificare.
- Revisione 3+1 con autocomplete, verifica esplicita e feedback didattico.
- Nessuna identificazione automatica di specie o commestibilità.

## Distinzione dei canali

La build TestFlight usa `production`; un update sul solo `preview`
non la aggiorna. La precedente indicazione di usare preview era riferita
alla distribuzione interna ed è superata per TestFlight.

La build di distribuzione interna `iphone-library` aveva problemi di provisioning;
questi non impediscono l'update OTA della build TestFlight 5 già installabile.
Il run storico `38026711904` è stato cancellato; non va descritto come ancora in corso.

La pipeline Android rimane separata. Il suo smoke test cerca un vecchio pulsante;
l'allineamento iOS qui verificato non certifica il rilascio Android.

## Backup protetto

`backup/main-pre-beta-publish-20261009` resta invariato:
`277466878a64f6c49eecb691ecd9c6fb595ef41a`.

## Aggiornamenti futuri

Eseguire manualmente `ios-main-update.yml` su main per pubblicare modifiche JS
compatibili con il runtime della build 5. Il workflow blocca la pubblicazione
se il runtime nativo cambia: in quel caso serve una nuova build TestFlight.
