# Libreria fotografica personale di Fungo Italia

Apri [Importa foto dal telefono](https://gianpaolobol.github.io/fungo-italia/importa-foto.html) in Safari. Seleziona fino a 20 fotografie per lotto da Foto/iCloud o File, collega GitHub seguendo la guida nella pagina, indica il credito e autorizza la pubblicazione delle copie selezionate. Non serve Google Drive né eseguire comandi.

Il browser accede solo alle immagini selezionate; la chat non può leggere autonomamente tutta la libreria del telefono. Non inviare password Apple o token GitHub nella chat. L’autorizzazione fine-grained, limitata al repository e a Contents read/write, resta nella memoria della pagina ed è eliminata dopo il caricamento.

## Destinazione e integrità

Ramo `photo-library`, cartella `photo-library/images`, indice `photo-library/metadata.json` conforme a [schema.json](schema.json). Le copie JPEG arrivano a 1600 pixel, senza GPS/EXIF o nomi originali. Il contenuto visibile nei pixel rimane. Gli originali non vengono cancellati. Repository pubblico: le copie sono visibili a tutti. Nessuna licenza Creative Commons è assegnata automaticamente.

L’hash SHA-256 evita copie identiche duplicate. Immagini e indice sono pubblicati insieme in un commit; aggiornamenti concorrenti vengono riletti senza sovrascrivere le annotazioni del curatore. Le copie in attesa sono locali alla pagina: se Safari viene chiuso vanno selezionate nuovamente.

## Identificazione

Il caricamento assegna lo stato `unresolved`: non implementa un riconoscimento automatico. Una successiva analisi delle immagini accessibili può registrare genere/specie proposti, caratteri visibili, caratteri mancanti, alternative e riferimenti. Le foto insufficienti restano non determinate. Non si inventano microscopia, odore o caratteri nascosti.

Una proposta del modello non equivale a revisione micologica indipendente. Lo stato `reviewed` richiede documentazione del revisore; lo schema non ne certifica da solo competenza o identità. La libreria non autorizza il consumo.

Al momento della creazione dell’importer nessuna fotografia personale è stata acquisita o identificata: occorre la selezione sul dispositivo.
