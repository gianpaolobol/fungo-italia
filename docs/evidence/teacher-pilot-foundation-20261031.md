# Pilota gratuito: evidenze primo incremento — 31 ottobre 2026

Ramo dedicato `feat/teacher-student-pilot-free-20261031`, base upstream
`83fe69483c344905765ed75ed456aad4c1b72918`. Nessun merge, deploy o messaggio reale.

## Implementato

Monitor/Worker esterno con lettura vera della sentinella DB, timeout e avvisi
limitati, watchdog separato, endpoint privato senza cache; gate per evidenze
operative; schema PostgreSQL/RLS corsi e materiali; adattatore di lettura v1 senza
dipendenze dall'app corrente. Nessun flusso di invito/upload/test ancora disponibile.

## Test eseguiti

- Cicli RED→GREEN dei moduli nuovi Node: inizialmente moduli assenti, poi 24 test
  positivi. Revisione indipendente ha individuato due difetti riprodotti con test
  che fallivano per mancato rifiuto; corretti, suite locale finale 26/26 PASS.
- PostgreSQL 17 reale in GitHub Actions: run
  https://github.com/gianpaolobol/fungo-italia/actions/runs/41223810495
  su `97fd43c1be52fddc4e7ad4ec0b3bdd96d2f7ba40` SUCCESS. Log conferma
  `PASS: pilot RLS, dynamic library, revocation and least-privilege probe`.
- La prima run 41223571340 era volutamente incompleta (migrazione non ancora
  presente). La successiva 41223663925 ha rilevato un errore nel test: la verifica
  per nome del privilegio tabella richiedeva accesso allo schema che era
  correttamente negato. Il test ora verifica il diniego di USAGE sullo schema;
  nessun privilegio è stato ampliato per farlo passare.
- I test coprono studenti estranei, docente di altro corso, gruppi sovrapposti,
  quarantena, ritiro, revoca e nuova iscrizione con ID distinto, lettura anon della
  sola sentinella, logout mentre arrivano header o corpo e replay di cron dopo
  errore email. Non attestano compatibilità nativa, browser o invii veri.

## Revisione e decisioni

Revisore distinto: due problemi importanti corretti con RED→GREEN:
1. Controllo sessione anche dopo lettura del corpo, con ID iniziali catturati per
   valore: non vengono restituiti dati dell'account precedente dopo un cambio.
2. Il replay del medesimo evento cron conserva il fallimento dell'avviso, senza
   ripetere l'invio o riportare un falso stato sano.

Minore rinviato: mancano prove SQL delle soglie quota/concorrenza. I trigger
esistono, ma il limite storage oggetti e l'intera filiera upload sono ancora da
verificare nell'incremento successivo. Non si dichiara collaudata la quota completa.

Decisioni operative: checkout locale parziale per indisponibilità trasporto git;
albero remoto completo preservato tramite API Git. Nessuna verifica dell'app
invariata desunta dai test del solo pilot. Isolamento confermato confrontando gli
SHA dei file upstream e il delta remoto prima della consegna.

## Bloccanti reali

Task P0 aperto: https://github.com/gianpaolobol/fungo-italia/issues/145 .
Account/progetti gratuiti, credenziali, scansione e backup non configurati; nessun
monitor attivo, nessun avviso ricevuto, nessuna osservazione di otto giorni.
Il gate resta rosso. Nessuna garanzia di assenza sospensione sul piano Free.
Il ramo deve essere aggiornato allo SHA dell'app corretta prima di integrare UI
o distribuire: non copiare indietro App.tsx, billing, esami o storico.
