# Test fotografico: allenamento e storico

Impostazione confermata dall'utente il 12 ottobre 2026.

## Flusso

- Ogni sessione parte con 15 specie documentate, mantenendo la distribuzione della banca esistente.
- Dopo tre caratteri vengono proposti nomi scientifici e sinonimi accettati. Il tocco completa il nome; il ricorso ai suggerimenti è registrato.
- La commestibilità usa i colori dell'atlante.
- La preparazione richiede tutte le precauzioni documentate; nessuna omissione è considerata corretta.
- Tossicologia: risposte multiple su sindrome, latenza e manifestazioni/gravità. Le descrizioni equivalenti non sono distrattori. I casi con latenza variabile o non precisata non ricevono intervalli alternativi arbitrari.
- Ogni invio restituisce l'esito distinto per nome, categoria e dettagli, e la soluzione documentata.
- Al termine dei primi 15 casi tutte le schede errate vengono ripetute in nuovi giri finché sono risolte. Un doppio invio non aggiunge tentativi.

## Registrazione

Il primo tentativo rimane immutabile. Lo storico riporta data, risultati iniziali, suggerimenti usati, errori alimentari pericolosi, errori per specie/dimensione e tentativi di ripasso. I denominatori di preparazione e tossicologia includono soltanto i casi pertinenti.

Sessione corrente, risposte non ancora inviate e storico sono conservati insieme nella chiave locale `fungo-italia:photo-training:v2` (AsyncStorage su iPhone, localStorage sul web). Il salvataggio fallito impedisce l'avanzamento. Il vecchio salvataggio v1 non viene cancellato; il nuovo flusso non importa risposte aperte non valutabili automaticamente.

Lo storico contiene risposte e valutazioni, senza fotografie né coordinate. Non c'è sincronizzazione fra dispositivi. Una firma della banca e della revisione delle domande invalida checkpoint incompatibili mantenendo i risultati storici; il confronto delle prime/ultime prestazioni usa solo la banca attuale.

## Verifica

- Test unitari: soglia dei suggerimenti, selezioni complete, ripetizione degli errori, immutabilità dei primi risultati, checkpoint e doppio invio.
- Regressioni scientifiche: latenze lunghe equivalenti e varianti gastrointestinali non diventano risposte errate; la latenza variabile di Hypholoma fasciculare non è trattata come breve.
- WebKit 320 punti: completamento, colori, ripresa, correzione immediata, sessione con errore/ripasso, storico plurimo e foto offline.
- Controllo TypeScript ed esportazione bundle iOS.

I test automatici non certificano il riconoscimento micologico tramite immagini né equivalgono alla prova sul dispositivo dell'utente. La commestibilità e la preparazione seguono il catalogo fondato sulla Guida ragionata.

## Pubblicazione

La produzione iOS usa `ios-main-update.yml` sul canale `production`, compatibile con TestFlight 1.0.0 (5), runtime `9d5f0a507eaa68f99fc6794a7f063631362c38f8`. Pages pubblica la stessa revisione web. Il backup `backup/main-pre-beta-publish-20261009` non deve essere modificato.
