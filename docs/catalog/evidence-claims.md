# Lotto 3 — Provenienza, Evidence e Claim

## Scopo

Questo lotto rende eseguibile la regola: **nessun dato scientifico sensibile senza provenienza**.

La provenienza e separata in tre livelli:

1. `Source`: registra la fonte bibliografica, documentale o database.
2. `Evidence`: registra il punto preciso della fonte e la sintesi originale dell'affermazione sostenuta.
3. `Claim`: registra il dato strutturato usato dal catalogo e punta a una o piu `Evidence`.

Il dato applicativo non deve dipendere da una citazione libera inserita in un campo testo.

## Artefatti

- `data/catalog/sources.json`: registro fonti canoniche.
- `data/catalog/evidence.json`: evidenze strutturate.
- `data/catalog/claims.json`: claim strutturati e relativi `evidenceIds`.
- `lib/catalog-evidence.ts`: tipi e validatori bloccanti.
- `lib/catalog-evidence.test.ts`: test di integrita e copertura.

## Copertura del checkpoint

Per il perimetro S1-Minimo:

- unita didattiche: **148**
- claim `training.minimum`: **148**
- evidenze S1: **148**
- unita senza claim: **0**
- claim senza evidenza: **0**
- evidenze senza fonte registrata: **0**

Ogni evidenza usa una sintesi originale breve e conserva pagina e intestazione sorgente. Non viene copiato il testo esteso della fonte.

La riconciliazione nomenclaturale del Lotto 2B conserva inoltre almeno una evidenza per ciascuna delle 148 unita e continua a essere verificata dal servizio Index Fungorum in CI.

## Stati editoriali

La presenza di una evidenza non equivale ad approvazione scientifica.

- `normalized`: estratta e normalizzata, pronta per revisione.
- `reviewed`: controllata da un revisore identificato.
- `approved`: utilizzabile per contenuti per i quali la specifica richiede approvazione.
- `reviewNeeded`: non pubblicabile come fatto consolidato.
- `superseded` / `rejected`: non utilizzabili come evidenza attiva.

Un claim `approved` non puo puntare a una evidenza con stato inferiore ad `approved`.

## Regole bloccanti

Il gate fallisce se:

1. una fonte ha ID duplicato o metadati obbligatori mancanti;
2. una evidenza punta a una fonte inesistente;
3. una evidenza non ha `sourceLocation` o `claimSummary`;
4. un claim non contiene almeno un `evidenceId`;
5. il tipo del claim e incompatibile con il tipo dell'evidenza;
6. un claim approvato usa evidenze non approvate;
7. una delle 148 unita Minimo non ha esattamente un claim didattico nel checkpoint S1;
8. pagina, rango, etichetta sorgente o flag di morfologia approfondita divergono dall'inventario S1.

## Uso nei lotti successivi

Le schede Minimo non devono inserire direttamente commestibilita, trattamenti, ecologia, fenologia, distribuzione o confusioni.

Ogni campo viene prima modellato come claim e collegato a evidenze idonee:

- commestibilita -> S2, claim type `edibility`;
- trattamenti -> S2, claim type `treatment`;
- tassonomia -> fonte nomenclaturale, claim type `taxonomy`;
- ecologia/habitat -> fonte complementare, claim type `ecology`;
- associazioni -> claim type `association`;
- fenologia -> claim type `phenology`;
- distribuzione -> claim type `geography`;
- confusioni -> claim type `confusion`.

Questo consente di costruire le 148 schede senza perdere la catena di audit.
