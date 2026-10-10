# Filtro fotografico locale iPhone

Obiettivo approvato: individuare possibili immagini di funghi nella libreria autorizzata senza inviare fotografie o coordinate fuori dal dispositivo, con lotti di massimo 20 e ripresa dopo interruzioni.

Il motore iOS è VNClassifyImageRequest di Apple Vision, alimentato con thumbnail PhotoKit di massimo 512 punti. Non determina specie o commestibilità. Le classi fungine disponibili vengono interrogate sul dispositivo; se assenti, il risultato è incerto, mai non pertinente. Le soglie preliminari devono essere verificate con fotografie positive e negative reali. Foto solo iCloud non scaricate automaticamente: restano incerte.

Ogni pressione Avvia/Continua elabora un lotto di massimo 20, sequenzialmente. Pausa/annulla e passaggio in background fermano dopo la foto corrente. Salvataggio privato dopo ogni immagine; checkpoint offset aggiornato solo dopo il salvataggio. Un elenco immutabile di identificativi e date viene salvato prima dell’analisi: nessuna immagine viene decodificata in questa fase. Cambiamenti alla libreria non spostano la ripresa. Nessun ciclo automatico su tutta la libreria. Ripresa al riavvio. Dati delle vecchie osservazioni e revisioni non cancellati.

Anteprime native di 160 punti, senza chiamare getUri che scaricherebbe gli originali iCloud. Mostrare 20 risultati del lotto corrente, con decisione modificabile dall'utente. Solo foto confermate come pertinenti passano alla coda 3+1, senza deduzioni di specie, coordinate o fiducia diagnostica. Ogni foto confermata genera una bozza distinta per non perdere scatti quando la coda limita ogni gruppo a otto. Lotto archiviato prima di avanzare, consultabile e modificabile con i pulsanti Lotto precedente/successivo; conservazione per lotto senza rileggere tutti gli originali.

Fuori scope: motore Android, riconoscimento micologico fine, upload cloud. Sulle vecchie build o su Android il motore assente è dichiarato e l'analisi non parte. Occorre nuova build TestFlight. Verifiche: limite 20, sequenzialità, pausa, timeout, ripresa, storage corrotto/fallito, filtro assente e incertezza; autolinking; build Apple; prova utente su iPhone prima di dichiarare accuratezza.
