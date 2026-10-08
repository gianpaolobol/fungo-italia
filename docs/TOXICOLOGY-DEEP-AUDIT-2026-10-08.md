# Audit approfondito tossicologico — 2026-10-08

## Fonti
- Benjamin & Sitta (2023), Fungi 16(1), 40–46, https://fungimag.com/spring-2023-articles/V16I1-Gastro.pdf
- Sitta, Davoli, Floriani, Suriano (2021), tabella di raccordo Guida ragionata, https://www.regione.piemonte.it/web/sites/default/files/media/documenti/2022-08/guida_ragionata_-_tabella_di_raccordo_sintetica.pdf
- BMJ (2024), Bon appetit. Diarrhoea after eating mushrooms, https://pmc.ncbi.nlm.nih.gov/articles/PMC10910438/

## Esito
- 20 associazioni nel dataset src/data/toxicology-syndromes.json.
- 2 blocchi di generazione: Tricholoma pardinum e Chlorophyllum molybdites non hanno studyProfile.edibility nel dataset src/data/study-profiles.json. Il join di scripts/toxicology-syndromes.mjs rifiuta i taxa privi di tale profilo.
- 20 associazioni senza attestazione di revisione indipendente.
- Gruppo GI costante: Entoloma sinuatum, Tricholoma pardinum, Omphalotus olearius, Hypholoma fasciculare, Chlorophyllum molybdites (Benjamin & Sitta 2023, gruppo 1).
- Gruppo GI frequente ma non universale: Agaricus xanthodermus s.l., Rubroboletus satanas, Ramaria formosa (gruppo 2).
- Gruppo GI da preparazione insufficiente: Armillaria spp. (gruppo 3), non da confondere con gruppo 2.
- Chlorophyllum brunneum e Rubroboletus satanas hanno anche riscontri clinici in BMJ 2024.
- Non attribuire la sindrome a tutte le Russula, Lactarius, Ramaria, Armillaria o Inocybe indistintamente.

## Gate
Aggiunto scripts/audit-toxicology-release.mjs: controlla duplicati, corrispondenza tassonomica, profili edibility, evidenza minima, copertura GI e stato di revisione. Eseguire node scripts/audit-toxicology-release.mjs --strict dopo npm run prepare:data. Strict deve fallire fino alla chiusura di tutti i blocker. Non aggirare.

## Stato di esecuzione
Audit statico eseguito attraverso lettura diretta dei tre JSON GitHub; non sono stati eseguiti test Node, browser, CI o deploy in questa sessione. Non pubblicare ancora la PR #34.
