# iOS1.1.0(25) — TestFlight interno disponibile

La build25 è stata inviata senza ricompilazione dal binario EAS `5e4a1bf3-cb88-44af-a642-f9982532e619`, sorgente `c524b695d51c5e21eb488c564089c0206dd5caad`, SHA256 IPA `a4bcc701bd2d0dafff0ed0d175a7792cf0696326090075e7f103a3a31de053dc`.

- [Invio e assegnazione40960080895](https://github.com/gianpaolobol/fungo-italia/actions/runs/40960080895): SUCCESS. Apple build `1ce58bd7-0065-40f5-b7a1-3ec88df48be2`, processingState VALID.
- [Verifica disponibilità effettiva40960584066](https://github.com/gianpaolobol/fungo-italia/actions/runs/40960584066): SUCCESS, internalBuildState IN_BETA_TESTING, verificato `2026-10-29T21:48:51.436Z`.
- Solo gruppo interno del titolare `f642807c-e4b2-43d4-a32a-d9fd087fdfe3`, nessun tester individuale e nessuna nuova platea esterna. App Store Review non avviata; appStoreReady=false, diagnosticOnly=true.

Il binario include l’attivazione iOS della beta personale di90giorni e la rimozione dei pulsanti demo nativi. Il completo richiede il riscatto dell’invito personale del portale. L’invito TestFlight da solo non assegna il completo. Contenuti scientifici e distinta di revisione invariati; nessuna certificazione indipendente dedotta.

Limitazione conservata: il run demo separato40943327699 è fallito su iPhone prima sulla mappa online e poi, nella ripetizione, su Aree dopo riavvio. Non viene marcato PASS. La stessa funzione testAFreeAgaricusDemoWithoutPurchase è passata nella suite completa UI40943327845 su iPhone/iPad, insieme al ciclo acquisti; StoreKit40943327350 PASS. Dopo la comunicazione del fallimento, il titolare ha richiesto di procedere alla pubblicazione della25. Applicato al solo collaudo diagnostico interno, senza cambiare gate ordinari main/web o attestazioni scientifiche.

Il browser ha avuto timeout; audit40958642676 ha escluso invii duplicati. Il primo percorso40959815079 si è fermato prima dell’upload per una guardia evento errata, corretta RED→GREEN; 3 test PASS, sintassi Node/YAML/shell PASS. Procedura revisionata tecnicamente e salvata nella [PR136](https://github.com/gianpaolobol/fungo-italia/pull/136). Credenziale Apple preesistente, temporanea e mascherata; pulizia riuscita. Nessuna chiave negli artefatti.

[Ricevuta verificata](release-receipts/ios25-testflight-20261029.json). Android6 resta compilata privatamente; nessuna pubblicazione Play in questa operazione. Sincronizzazione email→Play non attivata; dominio rinviato dal titolare.
