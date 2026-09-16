# Copertura delle fonti del catalogo beta

## Risultato dell'importazione

- 124 voci tassonomiche di primo livello estratte dal documento “Obiettivi tassonomici nella formazione dei micologi”.
- 73 voci con obiettivo minimo, 78 con livello auspicabile e 51 con approfondimenti; una voce può appartenere a più livelli.
- 124 voci collegate alla pagina pertinente della “Guida ragionata alla commestibilità dei funghi”.
- 28 schede divulgative iniziali, con nome volgare, nome scientifico, nomi regionali già documentati nel progetto e riferimenti alle due fonti.

## Regola di modellazione

Le voci restano al rango usato dalla fonte: genere, famiglia, sezione o gruppo operativo. Una voce che comprende taxa con status alimentari diversi usa lo stato `mixed` e riporta nel dettaglio le singole indicazioni presenti nella fonte. Non viene attribuita una categoria unica a un intero genere eterogeneo.

## Limiti espliciti della beta

- Le 124 schede corrispondono alle intestazioni tassonomiche del documento degli obiettivi; le specie elencate nei relativi testi sono ricercabili anche con il binomio esteso, ma non sono ancora tutte trasformate in schede specie autonome.
- Habitat, fenologia, quota, distribuzione e associazioni micorriziche non vengono derivati dalle due fonti quando queste non li documentano. Le schede divulgative che già contengono tali campi restano separate dal nucleo normativo/editoriale.
- I nomi regionali sono pubblicati solo quando associati a un territorio; le proposte degli utenti restano soggette a revisione micologica.

## Riproducibilità

Il file `data/taxonomic-objectives.json` è rigenerabile tramite `scripts/generate-taxonomic-objectives.mjs`, fornendo le estrazioni testuali dei due PDF. I test bloccano una release con meno di 100 intestazioni, pagine mancanti nella fonte degli obiettivi o assenza dei taxa sentinella Agaricus, Russula, Morchella e Verpa.
