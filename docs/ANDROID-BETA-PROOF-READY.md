# Ripresa del collaudo sul candidato Android immutato

Questo ramo preparatorio non avvia la nuova pipeline. Il trigger è soltanto il ramo distinto `feat/android-beta-proof-ready-20261028`, da creare dopo la verifica della conferma GitHub e del codice tecnico già autorizzato.

App e script del test restano esattamente quelli del candidato `2e0cb6479e589bcab83d1b60d1ae636a6c8c5c64`; questo ramo aggiunge soltanto il workflow e questo documento. Non si riutilizza l'APK precedente al fix SecureStore. Qualifica di riferimento run40680183722, artefatto12812827277, digest ZIP `d6f935021cfc944628e80a5a9dab80868f9c4ce15fdb345081d5dfe1d5ef2104`. Il workflow controlla sorgente, ID/digest del binario, ricevuta Expo nell'APK e successo dei job qualify e smoke. Se quei job non sono verdi o i byte sono diversi, si ferma.

Prima dell'avvio: completare/verificare GitHub Confirm access senza raccogliere credenziali in chat; salvare/verificare il solo segreto tecnico nel repository già autorizzato. Se necessario, reinvitare la stessa utenza tecnica dal pannello conservando la scadenza originaria. Non assumere il successo del precedente salvataggio, andato in timeout insieme alla verifica della nuova scheda.

Poi creare il solo ramo ready dal commit preparatorio verificato. Durante beta-proof seguire i log: dopo READY_FOR_ADMIN_REVOCATION revocare dal pannello soltanto il tester tecnico, entro la finestra di240secondi. Il test deve provare accesso completo, demo offline, recupero bozze, cold start e ritorno alla demo dopo revoca. Senza successo reale non firmare.

Il job di firma esegue un checkout pulito del candidato app esatto2e0cb647, distinto dal commit del workflow esterno. La ricevuta e il profilo EAS sono vincolati a quel sorgente realmente compilato/provato; il workflow non si attribuisce quel commit. Usa il medesimo canale isolato e le credenziali Expo esistenti. Il successo del job firma indica solo richiesta EAS, non build terminata, invio Play o disponibilità ai tester.

Dopo EAS verificare AAB, versioneCode>3, sorgente2e0cb647, endpoint reale e medesima chiave upload Android. Solo dopo aggiornare il canale Play interno e inviare il nuovo invito personale a Cyrus già autorizzato. Nessun merge main, iOS, web, OTA o pubblicazione Google Play pubblica.
