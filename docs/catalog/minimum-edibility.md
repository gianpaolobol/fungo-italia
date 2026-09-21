# Valutazioni alimentari S2 — Lotto 4

## Perimetro

Il Lotto 4 normalizza la valutazione alimentare di tutte le **148 unità didattiche Minimo** usando esclusivamente S2:

*Sitta N., Davoli P., Floriani M. & Suriano E. (2021), Guida ragionata alla commestibilità dei funghi*, Regione Piemonte, ISBN 979-12-200-9297-5.

S1 continua a determinare esclusivamente il perimetro didattico e la risoluzione richiesta. Le indicazioni alimentari contenute in S1 non vengono usate come autorità per questo lotto.

## Risultato dell'estrazione

Le 148 unità hanno esattamente una valutazione strutturata:

| Categoria | Record |
|---|---:|
| `EDIBLE` | 64 |
| `EDIBLE_AFTER_TREATMENT` | 12 |
| `DISCOURAGED` | 13 |
| `NOT_EDIBLE` | 18 |
| `POISONOUS` | 39 |
| `NOT_ASSESSED` | 2 |
| **Totale** | **148** |

Sono inoltre presenti **160 evidenze S2**: 148 claim di commestibilità e 12 claim separati di trattamento obbligatorio.

File principali:

- `data/catalog/edibility-assessments.json`
- `data/catalog/edibility-evidence.json`
- `lib/minimum-edibility.ts`
- `lib/minimum-edibility.test.ts`
- `scripts/check-minimum-edibility.mjs`

## Regole di modellazione

### Nessuna propagazione dal gruppo alla specie

Una valutazione di gruppo non viene trasferita automaticamente a specie figlie e viceversa.

Due unità volutamente restano `NOT_ASSESSED` come contenitori didattici eterogenei:

- **Boletus sez. Luridi**: contiene sia taxa velenosi sia taxa commestibili soltanto dopo cottura completa;
- **Lyophyllum specie annerenti**: S2 distingue entità commestibili da entità prive di valore alimentare.

Le sottounità nominate da S1 possiedono le proprie valutazioni specifiche.

### Trattamenti

`EDIBLE_AFTER_TREATMENT` è usato soltanto quando S2 subordina la sicurezza alimentare a un trattamento. Nel perimetro Minimo attuale i 12 assessment condizionati sono collegati a un claim `treatment` separato e includono `completeCooking`.

Una semplice raccomandazione prudenziale di cuocere bene un fungo classificato `EDIBLE` non viene trasformata automaticamente in commestibilità condizionata.

### Stadio dell'esemplare

Quando S2 riferisce la commestibilità ai soli esemplari giovani, l'informazione è memorizzata in `specimenStage = youngOnly`, separatamente dalla categoria alimentare.

## Correzioni rispetto a scorciatoie precedenti

Il confronto diretto con S2 ha corretto alcuni casi che non possono essere derivati dal testo S1 o dal seed storico. Fra i test sentinella:

- `Lyophyllum connatum` -> `DISCOURAGED`;
- `Gyroporus castaneus s.l.` -> `EDIBLE_AFTER_TREATMENT`;
- `Clitocybe gibba s.l.` -> `EDIBLE_AFTER_TREATMENT`;
- `Hygrophoropsis aurantiaca` -> `DISCOURAGED`.

Questi casi sono coperti da test per impedire regressioni verso classificazioni derivate dalla fonte sbagliata.

## Evidenza e revisione

Ogni assessment punta a:

1. source unit S1 che definisce l'unità didattica;
2. fonte S2;
3. pagina S2 dell'intestazione corrispondente;
4. almeno una `Evidence` di tipo `edibility`;
5. una `Evidence` aggiuntiva di tipo `treatment` quando esiste un trattamento obbligatorio.

Lo stato del Lotto 4 è **normalized**, non **approved**.

Questo è intenzionale: la revisione micologica indipendente appartiene al lotto successivo previsto dal piano. Fino ad allora `guardTaxonSensitiveFields()` continua a mostrare pubblicamente `non-valutato`, quindi l'estrazione massiva non può bypassare il gate scientifico.

## Gate del Lotto 4

Il lotto è chiudibile solo se:

1. 148/148 unità hanno un assessment S2;
2. non esistono assessment duplicati o orfani;
3. ogni pagina coincide con l'indice S1->S2;
4. ogni claim alimentare usa la fonte con ruolo `edibility`;
5. ogni `EDIBLE_AFTER_TREATMENT` ha trattamento e condizioni espliciti;
6. ogni trattamento ha una Evidence dedicata;
7. gli insiemi eterogenei non ricevono una categoria uniforme inventata;
8. il gate di pubblicazione resta chiuso finché gli assessment non sono `approved`;
9. test, lint e build sono verdi.

Comandi:

```sh
pnpm catalog:evidence:check
pnpm catalog:edibility:check
node --experimental-strip-types scripts/verify-index-fungorum.mjs
pnpm test
pnpm lint
pnpm build
```
