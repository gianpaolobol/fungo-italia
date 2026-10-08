# Lotto 1 — gate editoriale (2026-10-08)

Baseline: main at b89e4b175fad718ed35557dd3662f35c8f6a89af.
Branch: feat/beta-content-gate-oct08.

Il validatore ora richiede studyProfile.odor, studyProfile.sporePrint.label e studyProfile.edibility.label e una fonte puntuale per ciascun campo valorizzato. I campi assenti rimangono blocker: nessun placeholder è stato aggiunto.

Audit documentato nell'handoff (da ricontare sul dataset attuale): 6/148 odori, 8/148 sporate, 31/148 commestibilità, 143/148 triadi fotografiche. Questi numeri non attestano validazione scientifica.

Test aggiunti per assenza dei tre campi e assenza di fonte puntuale. Esecuzione CI/runtime ancora da verificare; nessun PASS dichiarato.

Prossimi lotti: ricontare dati e confrontare branch fotografici; correggere editor e focal point end-to-end; importare solo immagini con licenze verificabili; compilare campi con citazioni scientifiche specifiche; eseguire test su Safari iPhone e desktop. Non unire su main prima dei test.
