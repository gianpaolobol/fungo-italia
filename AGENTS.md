# Fungo Italia — Istruzioni per agenti AI (Codex, Claude)

## Progetto
App di studio dei funghi per la preparazione all'attestato di micologo.
Target: iOS (App Store) e Android (Google Play). Lingua dell'app: italiano.
Autore: Gian Paolo Franceschini.

## Stack
- Expo SDK 58, React Native 0.88 (release candidate)
- Linguaggio: [DA COMPLETARE: TypeScript/JavaScript]
- Navigazione: [DA COMPLETARE: expo-router / react-navigation]
- Dati micologici: [DA COMPLETARE: percorso file/DB]
- Immagini: [DA COMPLETARE: percorso e fonte]

## Comandi
- Avvio sviluppo: `npx expo start`
- Build: [DA COMPLETARE: es. `eas build -p ios` / `eas build -p android`]
- Test/lint: [DA COMPLETARE]

## Regole di lavoro
- Ogni attività su un branch dedicato (`feat/...`, `fix/...`, `audit/...`) con PR verso `main`. Mai commit diretti su `main`.
- Non lavorare su un branch aperto da un altro agente senza istruzioni esplicite.
- Niente nuove dipendenze senza motivarlo nella PR; devono essere compatibili con Expo SDK 58.
- Ogni modifica va pensata per iOS e Android.
- A fine sessione aggiorna `docs/HANDOFF.md`.

## Regole micologiche (non negoziabili)
- L'app è uno strumento di STUDIO: non deve mai suggerire che un fungo sia commestibile sulla base dell'app. Il controllo spetta agli Ispettorati micologici ASL.
- I dati su specie tossiche e mortali, sindromi e latenze devono essere corretti. In caso di dubbio NON modificare: segnalalo nella PR per la revisione dell'autore.
- Nomi scientifici aggiornati, con sinonimi.
- Ogni immagine deve avere fonte e licenza compatibili con la pubblicazione commerciale.
