# Allineamento demo GitHub alla build21 — verifica preliminare

Il sito pubblico è realmente abbinato alla19, non alla21. Il pacchetto web della21 esiste già ed è stato verificato sullo SHA6dfb92656ec94485d94aecba72543930c2759d17 nel run40380720179. Nessuna nuova compilazione iOS è necessaria per pubblicare gli stessi byte.

L'icona pubblica, il manifest e apple-touch-icon puntano già alla stessa immagine della21, SHA-25677274660b0a1a450d19c4c4d895ac49274663696e8cb6d40ffef6488131e35f9. La vecchia icona riferita dal titolare riguarda l'app web installata sulla Home: il server non offre una vecchia immagine a quell'URL. Non cancellare il collegamento o i dati di studio per tentare un ripristino senza aver conservato i progressi.

Blocco riprodotto: createRelease della ricevuta21 rifiuta la promozione con `Owner-reviewed internal beta cannot promote public web`. La dichiarazione vigente è limitata al gruppo interno del titolare; publicWebAllowed=false e independentReleaseReady=false. Il blocco non è stato disattivato.

Decisione necessaria del titolare prima della promozione: mantenere la limitazione attuale e acquisire prima le revisioni indipendenti, oppure autorizzare esplicitamente una distinta demo web pubblica in beta non certificata, vincolata agli stessi byte/dati della21. Una nuova autorizzazione di distribuzione non attesta revisione indipendente e non può rimuovere i controlli tecnici, tossicologici strutturali, di integrità/parità e StoreKit né il blocco App Store. Qualsiasi cambio di policy deve essere esplicito, versionato e verificato; non è sufficiente far scattare il vecchio deploy.

Dopo l'autorizzazione e i controlli: promuovere il candidato immutabile abbinato alla21, verificare HTML/JS/manifests/icone e receipt sul sito effettivo, provare l'aggiornamento PWA senza cancellazione dei progressi. La verifica dell'icona già salvata sulla Home richiede riscontro sul dispositivo del titolare.

Esito di questa verifica: diagnosi completata, nessuna pubblicazione eseguita e nessuna attestazione inventata.
