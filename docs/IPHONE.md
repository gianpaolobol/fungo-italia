# Fungo Italia su iPhone
## Due percorsi
La PWA usa lo stesso catalogo dell'app Expo: 148 unità minime, 66 schede di generi/gruppi e 71 macroaree. Preferiti e bozze sono locali; i contributi pubblicati restano nel servizio web autenticato. Nessun account Apple Developer o Expo è richiesto per una PWA.
L'anteprima nativa usa Expo Snack solo se supporta il runtime dell'Expo Go iOS corrente. Il workflow verifica la compatibilità e le dipendenze prima di pubblicare anonimamente; salva URL e QR nell'artefatto Fungo-Italia-iPhone-Expo-Go. Non è una build App Store/TestFlight. Il riavvio offline di Expo Go e una prova fisica su iPhone restano verifiche separate.
## Installazione della PWA
Dopo la pubblicazione HTTPS: aprire l'URL in Safari, scegliere Condividi > Aggiungi alla schermata Home, poi aprire l'icona. Attendendo Catalogo pronto offline l'app verifica il pacchetto in cache, non soltanto la registrazione del service worker. Prima di partire senza rete, verificare riapertura in modalità aereo. I marker delle macroaree restano disponibili; lo sfondo OpenStreetMap e i contributi web richiedono connessione.
Safari può rimuovere i dati locali: esportare note e backup privato. Il backup comprende sia la memoria persistita sia le modifiche in RAM, con indicazione dei salvataggi falliti. Le coordinate strutturate sono escluse dal JSON della singola osservazione salvo scelta esplicita; il backup completo le conserva.
## Hosting
Il tentativo di attivare Pages è stato rifiutato con Resource not accessible by integration. Il workflow non modifica la visibilità del repository e pubblica soltanto dopo i test, quando Pages risulta configurato. Un repository privato non garantisce Pages gratuito: dipende dal piano GitHub. Account, ruoli o configurazioni amministrative non vengono simulati.
## Verifiche
La pipeline usa WebKit a 320×568 sotto /fungo-italia/, con ricerca, schede in sequenza, cache offline, preferiti dopo riavvio, marker Amiata, bozze, coordinate opt-in, dati malformati, backup in caso di quota esaurita e fallback su errore server. L'esecuzione automatica non equivale a un test sull'iPhone fisico.
La revisione micologica indipendente rimane pendente; il catalogo non certifica determinazioni, raccolta o commestibilità.
