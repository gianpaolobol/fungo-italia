# iOS Managed Beta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Integrare su iOS l'invito verificato di 90 giorni e documentare senza falsi successi il blocco della sincronizzazione Play.

**Architecture:** Riutilizzare i moduli PR131 e il servizio esistente. Attivazione iOS esplicita nel solo profilo dedicato. StoreKit resta indipendente e prevalente.

**Tech Stack:** Expo 58, React 19.3, React Native 0.88, SecureStore, TypeScript e test Node/React esistenti.

**Spec:** `docs/superpowers/specs/2026-10-29-ios-managed-beta-design.md`

## Global Constraints

- Nessun flag locale premium, nessuna modifica ai contenuti scientifici.
- Accesso completo90giorni dal primo riscatto; nessun rinnovo o addebito automatico.
- Revoca verificata entro60secondi; senza verifica online resta la demo.
- Nessuna modifica/distribuzione iOS ordinaria, web, App Store o OTA.
- Non intervenire su stampa3dbologna.com.

## Review Focus

- Endpoint configurato per Android non deve abilitare iOS senza opzione esplicita.
- Risposta tardiva dopo logout/background non deve ripristinare accesso.
- Token errati, rete assente e scadenza non devono sbloccare la teoria.
- Revocare la beta non deve revocare StoreKit valido.
- Il pulsante teoria in demo deve spiegare il blocco senza aprire contenuti completi.

### Task 1: Configurazione e accesso beta iOS

**Files:** `lib/beta-access.mjs`, dichiarazione associata, `hooks/useBetaAccess.ts`, `App.tsx`, `app.config.js`, `eas.json`, test beta. Asset multipiattaforma in `server/beta/admin-assets.mjs` e `server/beta/admin-ui.test.mjs`.

**Interfaces:** `betaEndpoint(platform,extra)` restituisce origin HTTPS valida o null; `resolveAccess(platform,subscriptionActive,betaActive)` conserva la precedenza StoreKit. Il controller esistente resta responsabile della verifica remota.

- [x] Scrivere test iOS con piattaforma/configurazione e hook reale, osservare FAIL per iOS non supportato.
- [x] Implementare opzione esplicita `FUNGO_IOS_MANAGED_BETA=1`, profilo EAS dedicato e integrazione UI/deep link.
- [x] Verificare test controller/server/SecureStore, iOS ordinario escluso, Android invariato e TypeScript.
- [x] Committare il delta senza merge né distribuzione.

### Task 2: Apertura esame e messaggio demo

**Files:** `components/ExamHub.tsx`, `App.tsx`, `scripts/beta-mounted-transitions.test.mjs`.

**Interfaces:** `ExamHub` accetta `onAccess?:()=>void`; in demo il tasto teoria richiede accesso, in full apre `TheoryExam`.

- [x] Test montato demo: tocco segnala requisito senza mostrare quesiti; full: teoria avvia una sessione.
- [x] Implementare messaggio e callback; preservare bozza/storico nelle transizioni.
- [x] Suite completa, TypeScript e controllo indipendente del delta.
- [x] Documentare implementato/testato/pubblicato e dipendenza Android, aggiornando master e handoff.

## Addendum del titolare: nessun pulsante demo nativo

Rimuovere in iOS e Android i pulsanti demo gratuita/anteprima gratuita da Studio e Accesso. Conservare apertura atlante per accesso completo verificato e comportamento web. Implementato con cinque test montati RED→GREEN; suite finale 373 PASS, TypeScript PASS. Revisione indipendente completata; corretto lo spazio JSX non valido nel footer nativo. Nessuna build distribuita.
