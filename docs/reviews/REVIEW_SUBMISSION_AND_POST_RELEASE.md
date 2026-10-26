# Revisione micologica — processo riservato all'amministratore

## Regola vincolante

**Solo il titolare amministratore di Fungo Italia può scegliere i micologi accreditati, inviare fascicoli di revisione, ricevere decisioni e autorizzare l'acquisizione delle attestazioni.** Nessuna funzione di invio o richiesta di revisione compare nell'app pubblica, nella navigazione degli abbonati o nei test utente. Nessuna auto-registrazione di revisori e nessuna approvazione automatica.

Il precedente template pubblico GitHub `.github/ISSUE_TEMPLATE/revisione-micologica.yml` è stato ritirato. GitHub Issues pubbliche non sono il canale di raccolta dei fascicoli e dei dati professionali.

## Procedura admin riservata

1. Autenticazione **server-side** dell'amministratore, con autorizzazione per ruolo verificata a ogni endpoint e per ogni documento. Nascondere pulsanti nel client non è una misura di sicurezza sufficiente.
2. Selezione esplicita da parte dell'admin del revisore con qualifica/accreditamento verificabili, ambito tassonomico e recapito. Inviare il fascicolo **solo a seguito del comando dell'admin**, su canale privato.
3. Produrre un pacchetto con SHA sorgente, elenco esatto degli ID, revisione delle fonti S1/S2 e delle immagini, registro delle questioni aperte, termine e modulo di risposta.
4. Acquisire risposta firmata o attribuibile al revisore in archivio privato con timestamp, digest, decisione distinta per taxon e campo, riferimenti ed eventuali rilievi. L'admin verifica provenienza, competenza e integrità.
5. Se emergono discordanze: aprire pratica correttiva **privata**, modificare i dati canonici, rigenerare atlante/esami, ripetere i test e sottoporre al revisore il cambiamento sostanziale.
6. Convalidare sul nuovo SHA soltanto gli elementi effettivamente riesaminati. Le attestazioni di vecchi SHA restano consultabili in cronologia e non autorizzano automaticamente nuove versioni.
7. Dopo TestFlight/App Store la stessa procedura resta disponibile all'admin; eventuali rischi tossicologici critici sono gestiti con correzione prioritaria e nuova distribuzione secondo policy.

## Architettura richiesta prima dell'attivazione

- Backend privato con sessione admin e controllo ruoli ad ogni operazione; endpoint revisore autenticati o inviti a scadenza con token monouso e ambito limitato.
- Archivio delle evidenze protetto, non presente nel bundle mobile, nel repository GitHub pubblico o negli artefatti Actions.
- Registro append-only con revisore, credenziali verificate, SHA, ID, decisioni, hash degli allegati, cronologia e revoche; accesso admin riservato.
- Nessun accesso a questa funzionalità per utenti normali, anche via deep link o richieste HTTP dirette; test di autorizzazione negativi e test di non esposizione nel bundle mobile obbligatori.
- Le attestazioni professionali non possono essere create da un tool o dall'admin fingendo di essere il revisore.

## Stato

La procedura di governance è definita. **Interfaccia admin protetta, backend e invio effettivo non sono implementati né verificati con questa modifica.** Zero attestazioni indipendenti acquisite. I gate S1/S2, tossicologia, fotografie, StoreKit e release non sono modificati.
