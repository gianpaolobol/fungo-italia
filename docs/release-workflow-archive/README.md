# Pipeline precedenti archiviate

Queste copie conservano i gate di produzione precedenti, senza eseguirli. Non sono workflow manuali attivi. Il consolidamento modifica modello commerciale, icona e UI: serve una nuova prova completa prima di riabilitare OTA produzione, upload verificato e selezione App Store. Nessuna condizione StoreKit viene resa più permissiva per dichiarare il prodotto pronto.

Workflow attivo del consolidamento: `.github/workflows/consolidated-testflight.yml`, solo beta diagnostica. Esiti nativi/UI reali sullo stesso SHA restano nel receipt, demo UI deve riuscire; App Store resta non pronto finché billing e requisiti editoriali non vengono risolti. Build/upload store manuale già esistente va usato solo quando queste prove siano state riesaminate.
