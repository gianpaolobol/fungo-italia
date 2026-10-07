# Modifica delle immagini da iPhone
Apri Fungo Italia e tocca **Modifica immagini**. GitHub Pages è statico: l’accesso usa una chiave personale GitHub, inserita nel campo password e verificata per il proprietario `gianpaolobol`. Non viene salvata in chiaro nel browser e non va inviata in chat.

Crea una chiave fine-grained con scadenza breve, limitata al repository **fungo-italia**, con **Contents: Read and write**. Il collegamento nella finestra di accesso apre la pagina di GitHub con proprietario, permesso e scadenza compilati: scegli **Only select repositories**, poi **fungo-italia**, prima di generare la chiave. Revocare la chiave su GitHub interrompe l’autorizzazione.

Per gli accessi successivi sullo stesso iPhone puoi scegliere **Usa una password su questo dispositivo** e impostare una password personale di almeno 12 caratteri. Solo la chiave cifrata con AES-GCM e PBKDF2 viene conservata nel browser; password e chiave in chiaro restano soltanto nella sessione. Ogni sblocco richiede anche la verifica dei permessi su GitHub. Su un altro dispositivo, dopo la cancellazione dei dati di Safari oppure se dimentichi la password, collega nuovamente GitHub. Nessuna password universale è pubblicata nel sito.

Dopo l’accesso, apri una scheda e scegli la vista **Fianco**, **Sopra** o **Sotto**. Seleziona una sola foto dalla libreria, controlla anteprima, soggetto e autore; conferma il diritto di pubblicarla nel repository pubblico e tocca **Salva immagine**. L’immagine viene convertita localmente in JPEG senza EXIF/GPS. Controlla eventuali dati personali visibili nella fotografia.

Il salvataggio modifica soltanto quella vista in `src/data/admin-reference-images.json` e la relativa immagine. Le foto del corso e delle fonti esterne restano recuperabili. La schermata mostra l’anteprima del salvataggio; la nuova foto diventa disponibile a tutti dopo il completamento dei controlli e della pubblicazione Pages.

Le fotografie personali riportano l’attribuzione dell’amministratore e non vengono considerate automaticamente determinate o verificate da un micologo indipendente.

**Esci da modifica** rimuove i comandi, interrompe le operazioni ancora in attesa e dimentica l’autorizzazione. Anche chiudere o abbandonare la pagina richiede un nuovo accesso. Un salvataggio già registrato su GitHub resta nella cronologia e può essere sostituito successivamente. Il browser accede solo alla fotografia che selezioni; non legge l’intera libreria in background.
