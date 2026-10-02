# Preparazione del rilascio Fungo Italia — 2 ottobre 2026

Obiettivo: app usabile per studio e consultazione sul campo, con priorità Amiata, consultazione smartphone e ripasso dopo il 20 ottobre.

## Due implementazioni, una provenienza

Il repository contiene Next/vinext e API /api; il progetto Floot contiene React Router e API /_api. Non è corretto promettere che un push GitHub aggiorni automaticamente Floot. I cambiamenti vengono preparati e verificati qui; il trasferimento e la pubblicazione Floot sono differiti.

La CI genera artifacts/floot-readiness con inventario canonico, aree, baseline interna, evidenze e registro fonti, oltre a un manifest di hash e limitazioni. Non contiene segreti, fotografie private, osservazioni o coordinate personali.

## Accettazione tecnica

- test unitari, TypeScript, lint e build verdi sul commit finale;
- prove browser a 320, 375, 768 e 1440 pixel, consultazione consecutiva e ritorno ai filtri;
- mappa ed elenco usabili quando rete/base cartografica/GPS non sono disponibili;
- lettore offline riapribile, senza cache di risposte autenticate o coordinate private;
- contributi pubblicabili soltanto quando materializzabili, con permessi e revisioni indipendenti per campi critici.

## Accettazione scientifica separata

La baseline 3+1 è un audit interno, non una revisione micologica indipendente. Non inventare citazioni, pagine, determinazioni fotografiche o dati specifici da un genere. La completezza strutturale non dimostra correttezza di ogni affermazione.

Le 148 unità del Minimo sono riconciliate. L'inventario storico esteso del parser non costituisce un inventario di specie interamente verificato. Gli stati S1, sensu lato e definedSet devono conservare il proprio significato.

Prima di chiamare il prodotto scientificamente definitivo occorre chiudere la coda di revisione competente, legando il claim, la versione mostrata e le pubblicazioni realmente consultate.

## Trasferimento successivo a Floot

1. Confrontare la versione corrente Floot e i suoi contenuti approvati con il manifest GitHub.
2. Portare i componenti usando la UI kit Floot e i suoi wrapper; non copiare import next/* o l'autenticazione ChatGPT.
3. Aggiornare loader/cataloghi con identità stabili e validazione di forma/unicità, preservando le API delle versioni native precedenti.
4. Portare i workflow di pubblicazione con transazioni, quorum e materializzazione effettiva; il registro release da solo non aggiorna le schede.
5. Eseguire typecheck, test e percorsi reali in Floot, quindi pubblicare soltanto quando autorizzato e verificato.

Il pacchetto statico non è un backup delle modifiche database pubblicate; queste richiedono migrazione separata e controllata.
