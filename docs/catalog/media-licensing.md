# Lotto 5 — Immagini e licenze

## Principio

L'Atlante non deve mostrare immagini soltanto perche una ricerca testuale le ha restituite.

Ogni immagine candidata deve superare due controlli indipendenti:

1. compatibilita della licenza;
2. coerenza fra metadati Commons e taxon richiesto.

## Licenze ammesse

Il resolver accetta soltanto licenze riutilizzabili compatibili con una futura distribuzione anche commerciale:

- CC0;
- pubblico dominio;
- CC BY;
- CC BY-SA.

Sono escluse in modo esplicito le varianti NC e ND e le immagini senza URL della licenza.

Per ogni immagine mostrata l'interfaccia espone:

- autore;
- nome della licenza;
- link alla licenza;
- pagina sorgente Wikimedia Commons;
- stato `verified`.

## Identita del taxon

Per una ricerca di specie non basta trovare il nome del genere.

La candidatura richiede che titolo, descrizione o categorie Commons contengano:

- il binomio completo, oppure
- contemporaneamente genere ed epiteto specifico.

I risultati che citano soltanto il genere vengono esclusi dalle gallerie di specie.

## Gruppi, sezioni e definedSet

Le 148 schede Minimo non rappresentano tutte specie singole.

Il piano media distingue:

- `exactTaxon`: immagine riferita al taxon corrente univoco;
- `definedSetMember`: immagine di uno dei taxa correnti che compongono una singola unita didattica;
- `representativeGenus`: immagine soltanto rappresentativa del genere quando il concetto sorgente non e riducibile a una specie.

Le immagini `representativeGenus` non devono essere presentate come determinazione del gruppo.

## Copertura

Ogni scheda Minimo dispone di almeno un piano di ricerca media deterministico.

La disponibilita di una foto esterna non e un invariante di release: se Commons non restituisce una immagine che supera i gate, la UI mostra "Galleria in preparazione" invece di utilizzare una fotografia incerta o con licenza incompatibile.

## File

- `lib/commons-media.ts`: normalizzazione licenze, match tassonomico e costruzione candidato;
- `app/api/media/route.ts`: resolver Commons con soli risultati verificati;
- `lib/minimum-card-media.ts`: piano immagini per le 148 schede;
- `lib/commons-media.test.ts`: test licenze e identita;
- `lib/minimum-card-media.test.ts`: copertura del piano media;
- `app/explore-client.tsx`: fonte e licenza navigabili dall'utente.
