# Fungo Italia
Apri l'app: https://gianpaolobol.github.io/fungo-italia/
GitHub Pages è il percorso pubblico operativo per smartphone e computer. Su iPhone: Safari → Condividi → Aggiungi alla schermata Home. Istruzioni: [docs/IPHONE.md](docs/IPHONE.md).

## Funzioni disponibili
148 unità minime e 66 schede di generi/gruppi; consultazione con tap e scrolling, ricerca per nome scientifico/comune/sinonimo, preferiti e ripresa dello studio. 71 macroaree in 20 regioni, filtro Amiata e mappa vettoriale nella PWA. Lo sfondo cartografico richiede rete; le macroaree sono centri indicativi, non fungaie o autorizzazioni.
La PWA conserva sul dispositivo note e bozze, con backup e ripristino con anteprima. Dopo la preparazione della cache, catalogo e punti vettoriali sono consultabili offline. I dati locali possono essere rimossi dal browser: esportare il backup prima del viaggio.
I contributori possono aprire il [modulo di proposta scientifica](https://github.com/gianpaolobol/fungo-italia/issues/new?template=scientific-contribution.yml), indicando taxon, correzione e fonte precisa. Richiede account GitHub gratuito; le proposte sono pubbliche e non vengono approvate automaticamente. Nessuna bozza locale viene inviata senza azione dell'utente.

## Copertura scientifica
Nomi comuni documentati: 23/148 unità; habitat strutturati: 3/148; confronti bibliografici: 14/148. Solo 7/148 profili riportano riscontri esterni puntuali sui caratteri di campo. I riferimenti supplementari attestano il campo citato, non l'intero profilo.
Mancano fotografie tassonomiche di riferimento validate e revisione micologica indipendente. Il catalogo non certifica determinazioni o commestibilità. Dettaglio: [audit del 6 ottobre](docs/AUDIT-2026-10-06.md).

## Android e sorgenti Expo
[APK di anteprima verificato](https://github.com/gianpaolobol/fungo-italia/releases/download/native-preview/Fungo-Italia.apk). React Native/Expo per Android e iOS. La funzione Foto nativa indicizza i metadati autorizzati, raggruppa le immagini per data e conserva separatamente quelle senza data; permette la rimozione dalla bozza, senza cancellare originali. Non riconosce automaticamente specie o anatomia.
La pipeline verifica catalogo, TypeScript, bozze e bundle iOS/Android; compila l'APK con Gradle e lo aggiorna solo dopo i test su emulatore. La firma è quella debug del template Expo, non una chiave privata di produzione. [Limiti della preview](docs/ANDROID-PREVIEW.md).

## Verifiche e distribuzione
19 test web Chromium/WebKit, interfaccia a 320 punti, backup, navigazione, mappe e consultazione offline. Dopo il deploy, un controllo apre il vero sito Pages e verifica la revisione pubblicata. Questi test non attestano una prova su iPhone fisico.
Il repository è pubblico e Pages è configurato. Actions ed EAS possono applicare quote; nessuna gratuità illimitata è promessa. EAS Update richiede progetto/token Expo e compatibilità del runtime. Snack anonimo è solo una prova manuale opzionale, non un percorso verificato: il servizio ha risposto con un errore di quota.
La distribuzione nativa iOS è bloccata dalle credenziali/team Apple; la PWA funziona senza account sviluppatore. Nessun QR Expo Go funzionante viene attestato.

## Conservazione del progetto precedente
Il progetto precedente era Next/React, non Flutter. È conservato in legacy/web e nei branch backup/pre-migration-flutter e backup/verified-web-readiness. Il servizio storico rimane facoltativo per gli account esistenti: https://fungo-italia-beta.gianpaolo-franceschi.chatgpt.site .
La matrice ufficiale Expo58.0.2 abbina React19.3.0 e ReactNative0.88.0-rc.3; il pin override rende esplicito l'abbinamento per i peer delle librerie che escludono versioni prerelease.
