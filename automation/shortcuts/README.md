# Esportazione iPhone: prototipo verificabile, NON installabile
Questi sorgenti Apple Comandi Rapidi preparano copie JPEG e archivi ZIP locali. Non contengono azioni di rete, cancellazione, caricamento su GitHub o riconoscimento delle specie. Gli originali non sono modificati dalle azioni previste. La verifica automatica controlla il sorgente, NON il comportamento reale su iPhone.

## Stato e blocco Apple
Il tentativo di firma sul runner macOS è fallito: `Error: In order to do this, you must be signed into iCloud.`
Prova: https://github.com/gianpaolobol/fungo-italia/actions/runs/37444592536
Gli artefatti unsigned non sono installer validi per iOS. Non abbiamo accesso al telefono, alla libreria Foto o alla firma Apple. Non inserire credenziali Apple nei secret GitHub e non aggirare la firma.

## Comportamento previsto, da provare su dispositivo
- `probe.shortcut.json`: fino a 10 immagini accessibili, dalla più vecchia.
- `library.shortcut.json`: tutte le immagini accessibili, esclusi i video; comprende anche fotografie personali.
- Copie JPEG con larghezza richiesta di 1200 pixel, qualità 70%, rimozione metadati richiesta; nomi neutri.
- ZIP ogni 20 copie e ultimo lotto residuo. Viene chiesto dove salvare ogni archivio: scegliere **Sul mio iPhone**, non un provider cloud.
- Nessun invio automatico. Occorre prima verificare il contenuto e la dimensione di ciascun ZIP. Per allegarlo in chat deve rientrare nel limite di 32 MiB. La dimensione non è garantita.
- Con Foto iCloud, iOS può scaricare originali. Mantenere l'app in primo piano; grandi librerie possono superare memoria o tempo disponibile.
- La rimozione effettiva di EXIF e GPS deve essere verificata sulle copie. Una fotografia non certifica la specie né la commestibilità.
- Non pubblicare tutta la libreria personale nel repository pubblico. Solo le copie di funghi selezionate e autorizzate potranno entrare nell'atlante, con identificazioni provvisorie e revisione micologica.

## Alternativa disponibile ora senza installare questo prototipo
Aprire https://gianpaolobol.github.io/fungo-italia/importa-foto.html su Safari e usare il selettore Foto di iOS per scegliere fino a 20 foto di funghi in una sola selezione. Richiede una selezione dell'utente; non scandisce tutta la libreria. Le copie pubblicate su GitHub saranno pubbliche.

## Verifica automatica
La CI produce plist unsigned, controlla riferimenti, flusso, assenza di azioni fuori dalla lista consentita e opzioni di metadati/sovrascrittura. I test negativi rifiutano azioni web, conservazione dei metadati e sovrascrittura. Non dimostrano installabilità, compatibilità o esecuzione su iPhone.
