# Fungo Italia su iPhone
## Installazione
Aprire https://gianpaolobol.github.io/fungo-italia/ in Safari. Scegliere Condividi → Aggiungi alla schermata Home, poi aprire l'icona. GitHub Pages è già attivo: non occorre modificare permessi o impostazioni del repository.
Attendere “Catalogo pronto offline”, che verifica il pacchetto in cache. Prima di partire senza rete, provare la riapertura in modalità aereo. Il catalogo e i marker delle macroaree restano disponibili dopo la preparazione; lo sfondo OpenStreetMap e il modulo dei contributi richiedono rete.
Per una versione già installata, usare il comando di aggiornamento nell'app quando disponibile e riaprirla. Prima di cancellare dati del sito o reinstallare, esportare il backup.

## Dati e contributi
La PWA include 148 unità minime, 66 schede di generi/gruppi e 71 macroaree. Preferiti, note e bozze sono locali. Il backup completo conserva anche coordinate eventualmente inserite: tenerlo privato. L'importazione propone un'anteprima e unisce i dati senza cancellare le bozze esistenti. Safari può rimuovere dati locali; esportare il backup prima del viaggio.
La sezione Comunità apre il modulo pubblico GitHub per proposte scientifiche con taxon, correzione e fonte. Serve un account GitHub gratuito. Le bozze locali non vengono inviate automaticamente. Una proposta non costituisce approvazione scientifica. Il servizio storico è facoltativo per gli account esistenti.

## Verifiche
Il 6 ottobre 2026 la versione pubblicata ha superato 19 test web: ricerca, schede consecutive, preferiti, ripresa, marker Amiata, bozze, backup, tastiera, dati malformati, fonti e contributi. Il deploy e il controllo sul sito pubblico sono riusciti: https://github.com/gianpaolobol/fungo-italia/actions/runs/37426632130 .
Chromium verifica la reale navigazione offline con il flag di rete disabilitata. Per WebKit, i test offline arrestano il server origin e aprono un documento nuovo dalla cache; il difetto noto del flag offline Playwright/WebKit non viene considerato una prova riuscita. I controlli automatici non equivalgono a un test fisico in modalità aereo su iPhone.

## Expo Go e iOS nativo
La PWA non richiede account Apple Developer o Expo. Una build iOS firmata richiede credenziali e team Apple appropriati: il tentativo attuale segnala “No Apple teams found” e non fornisce un'app nativa installabile.
Snack è una prova manuale opzionale. Il manifest della precedente preview ha risposto HTTP429 per quota gratuita esaurita; il QR precedente non è attestato funzionante. EAS Update richiede account, progetto, token e runtime compatibile: non garantisce automaticamente l'apertura in Expo Go.

## Limiti del catalogo
23/148 unità con nomi comuni documentati, 3/148 con habitat e 14/148 con confronti bibliografici; solo 7/148 profili con riscontri esterni sui caratteri di campo. Mancano fotografie tassonomiche di riferimento validate e revisione micologica indipendente. Non certifica identificazione o commestibilità. [Audit dettagliato](AUDIT-2026-10-06.md).
