# Verifica per profili d'uso — Fungo Italia

Queste sono osservazioni simulate durante la revisione del codice, non interviste a utenti reali. Le prove automatiche e browser sono registrate separatamente nella CI del commit finale.

| Profilo | Osservazione / problema rilevato | Criterio di accettazione |
| --- | --- | --- |
| Cercatore novizio | In bosco la rete manca; un punteggio o una foto non dimostrano che un fungo sia commestibile. | Lettore pubblico riapribile offline; valutazioni non approvate esplicitamente sospese; niente diagnosi automatica o consenso alla raccolta. |
| Cercatore esperto | La base cartografica può fallire; le zone devono restare cercabili e selezionabili; segnali simulati non sono osservazioni. | Mappa con recupero ed elenco indipendente; macroaree e fonti territoriali; modello euristico chiaramente distinto da dati osservati. |
| Studente principiante | Una lista di nomi non insegna i caratteri; serve capire i termini e ricevere spiegazioni agli errori. | Percorso di studio, glossario, esercizi con feedback e progressi locali; nessuna certificazione inventata. |
| Studente avanzato | Aprire e chiudere ogni scheda interrompe il ripasso; filtri e posizione si perdono. | Schede consecutive con tap e scorrimento; URL e ritorno ai filtri; identità canoniche, gruppi e aggregati conservati. |
| Micologo contributore | Una proposta pubblicata deve modificare davvero la versione consultata; l'autore non può approvarsi i campi critici. | Pubblicazione limitata a campi materializzabili; revisioni indipendenti; cronologia delle proprie osservazioni e permessi verificati. |
| Revisore scientifico | Caratteri del genere, riferimenti generici e nomi ambigui non dimostrano un'identificazione di specie. | Fonti legate alla scheda; niente inferenze non documentate; audit interno distinto da revisione indipendente; sicurezza approvata separatamente. |

## Scenario personale

- Durante lo studio sull'Amiata: consultare le unità e il glossario, annotare i caratteri osservati e confrontare le ipotesi con un docente.
- Durante il viaggio fino al 20 ottobre: ripasso con pacchetto pubblico offline e preferiti; la copertura territoriale italiana non costituisce una guida alla raccolta a Tenerife.
- Dopo il rientro: una settimana di ripasso sui caratteri distintivi, sui gruppi ambigui e sulle osservazioni ancora da discutere.

## Limiti della dichiarazione di completezza

La CI verde dimostra le proprietà effettivamente testate del software. Non dimostra una revisione indipendente di tutte le affermazioni micologiche. La coda scientifica e le attestazioni conservano lo stato reale; non vengono chiuse da una simulazione di agenti.

Il rilascio Floot è differito. La PR GitHub e il pacchetto di trasferimento documentano il risultato preparato e le differenze fra i due ambienti.
