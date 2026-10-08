# Fungo Italia — Beta a revisione primaria

Stato: **CANDIDATA, NON PUBBLICATA**.

Il proprietario del progetto assume il ruolo di revisore primario e si impegna a controllare e correggere le schede durante la beta. Questo NON equivale a revisione micologica indipendente o approvazione scientifica delle 148 schede.

## Condizioni di esposizione pubblica
- Etichetta visibile: «Beta in revisione — contenuti micologici non certificati».
- Nessuna scheda con dati mancanti può dichiararsi completa; mostrare «Non documentato».
- Le categorie di commestibilità sono bibliografiche, non determinazioni di esemplari.
- Non usare l'app per decidere se consumare un fungo; rivolgersi a ispettorati micologici per il riconoscimento.
- Il revisore primario deve poter correggere contenuti e immagini; tutte le revisioni restano tracciate con commit.

## Gate tecnico ancora aperto
Run 37772727369: provenienza tecnica PASS, browser 60 PASS/1 FAIL (esposizione documenti fondanti nel payload pubblico), scientific gate FAIL come previsto per 148 schede incomplete. Generatore produce file non ancora committati. Non unire questa release a main finché il test di protezione documenti e il packaging dei dati non sono risolti e verificati.

## Rollback
Conservare main precedente, usare PR reversibile e non forzare aggiornamenti distruttivi.
