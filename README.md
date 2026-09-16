# Fungo Italia

Beta web nazionale per orientare la ricerca micologica senza pubblicare fungaie personali o coordinate precise.

## Funzioni disponibili

- mappa OpenStreetMap con aree aggregate H3 e indicazione sintetica `Vai ora`, `Possibile` o `Attendi`;
- motivazioni leggibili basate su habitat, fenologia, meteo disponibile e pressione di visita anonima e ritardata;
- catalogo con nome volgare, nome scientifico e nomi regionali separati;
- segnalazioni degli utenti con foto, descrizione e coordinate private;
- proposte di nuovi taxa o modifiche alle schede;
- revisione per competenza regionale e tassonomica;
- doppia verifica indipendente per tassonomia, commestibilità, tossicità e confusioni ad alto rischio;
- pubblicazione versionata delle revisioni approvate.

La beta è gratuita e richiede la registrazione. Le previsioni indicano condizioni favorevoli: non attestano la presenza di una specie e non autorizzano mai il consumo.

## Sviluppo locale

Richiede Node.js `>=22.13.0` e pnpm.

```sh
pnpm install
pnpm test
pnpm lint
pnpm build
```

Il progetto è basato su Next.js/Vinext, Cloudflare D1, MapLibre GL JS, OpenStreetMap e H3. Le migrazioni sono in `drizzle/` e lo schema applicativo in `db/schema.ts`.

## Configurazione

- `CATALOG_CURATOR_EMAILS`: elenco separato da virgole degli indirizzi dei curatori scientifici iniziali;
- `NEXT_PUBLIC_OSM_TILE_URL`: endpoint opzionale per i tile raster compatibili con OpenStreetMap.

## Limiti dichiarati della beta

La copertura tassonomica e territoriale viene estesa solo attraverso fonti citate e revisioni tracciabili. Se una fonte lavora a livello di genere, sezione o gruppo, il catalogo conserva quel livello e non inventa una precisione di specie. I dati meteorologici mancanti o obsoleti sono dichiarati come non disponibili e riducono la confidenza del risultato.
