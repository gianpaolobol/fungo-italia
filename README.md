# Fungo Italia — Expo
React Native/Expo per Android e iOS, con catalogo didattico locale e macroaree nazionali.
Il progetto precedente era Next/React, non Flutter. È conservato integralmente in legacy/web e nei branch backup/pre-migration-flutter e backup/verified-web-readiness.

## Stato e limiti verificabili
Il catalogo conserva 148 unità minime, gruppi didattici e riferimenti della baseline. La revisione scientifica indipendente è ancora pendente: le schede non autorizzano consumo o raccolta.
Studio con tap/scrolling, ricerca, preferiti e ripresa; aree offline e mappa online OpenStreetMap; bozze private locali esportabili. Le bozze non sono contributi pubblicati e non si collegano automaticamente agli account del precedente servizio.

## Compilazione
La pipeline installa le dipendenze, genera i dati dal catalogo conservato, verifica TypeScript, esporta i bundle iOS/Android e genera un APK Android locale con Gradle. L'APK di anteprima usa la firma debug del template; la distribuzione definitiva richiede una chiave privata gestita come secret.
Il servizio Sites precedente risulta attivo: https://fungo-italia-beta.gianpaolo-franceschi.chatgpt.site (versioni6). Questa migrazione non chiama alcun deploy Sites e non cancella database D1, bucket R2 o il servizio Floot. Il codice web resta in legacy/web per la manutenzione separata.

## iOS / Expo
Expo Go richiede una versione compatibile con il SDK usato. EAS Update richiede account/progetto Expo e token; i permessi GitHub non conferiscono questi accessi. Il workflow pubblica soltanto se EXPO_TOKEN e EXPO_PROJECT_ID sono realmente configurati. EAS Update in Expo Go non prova il comportamento degli aggiornamenti di una build nativa dedicata.
Compilare/distribuire una app iOS firmata richiede macOS e le credenziali Apple appropriate; Expo Go permette anteprima senza acquistare un account sviluppatore.
GitHub Actions privato ed EAS hanno quote: nessuna gratuità illimitata è garantita.

La matrice ufficiale Expo58.0.2 abbina React19.3.0 e ReactNative0.88.0-rc.3. Il pin override ReactNative rende esplicito questo abbinamento anche per i peer delle librerie che escludono semanticamente versioni prerelease. Non vengono disabilitati globalmente i controlli peer.
