# Release readiness validator

Questo repository non deve dichiarare la beta micologica completa finché le schede non superano un controllo ripetibile sui requisiti minimi di pubblicazione.

Il validatore introdotto in `scripts/release-readiness.mjs` controlla, per ogni record del catalogo:

- identificativo, nome scientifico e rango;
- tre caratteri osservabili del metodo 3+1;
- carattere differenziale `+1`;
- habitat documentato;
- sosia/lookalikes;
- fonti collegate;
- evidenza puntuale per l'habitat;
- triade fotografica `lateral`, `top`, `underside` con metadati minimi;
- stato di revisione indipendente attestato.

## Comandi

```bash
npm run test:release-readiness
npm run validate:release
npm run export:release-readiness
```

`validate:release` usa `--strict`: restituisce exit code non-zero se almeno una scheda è bloccata. Questo è intenzionale e serve a impedire claim prematuri di completezza.

`export:release-readiness` genera/aggiorna `docs/RELEASE-READINESS.md` con la tabella dei blocker correnti.

## Variabili opzionali

```bash
FUNGO_CATALOG_JSON=src/data/catalog.json
FUNGO_GROUPS_JSON=src/data/groups.json
FUNGO_RELEASE_READINESS_REPORT=docs/RELEASE-READINESS.md
```

## Nota scientifica

Il validatore non sostituisce la revisione micologica qualificata. È un gate tecnico/editoriale: segnala assenze, incompletezze e metadati insufficienti. Una scheda può passare il gate tecnico solo quando i dati dichiarano revisione indipendente, ma resta necessaria una verifica effettiva delle fonti e delle fotografie.
