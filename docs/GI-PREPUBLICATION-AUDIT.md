# Audit pre-pubblicazione — sindromi gastrointestinali (2026-10-08)

## Fonti controllate
- Benjamin D.R. & Sitta N. (2023), Mushrooms causing gastro-intestinal distress, Fungi 16(1):40–46: https://www.fungimag.com/spring-2023-articles/V16I1-Gastro.pdf
- Sitta N., Davoli P., Floriani M. & Suriano E. (2021), Guida ragionata alla commestibilità dei funghi; tabella di raccordo Regione Piemonte: https://www.regione.piemonte.it/web/sites/default/files/media/documenti/2022-08/guida_ragionata_-_tabella_di_raccordo_sintetica.pdf
- Associazione Micologica Bresadola, Sindromi a breve latenza: https://www.ambbresadola.it/sindromi-a-breve-latenza/

## Verifica differenziale
- Agaricus sez. Xanthodermatei: studio 2023 gruppo 2 (GI frequente ma non universale); associato nel dataset, profilo edibility già presente.
- Rubroboletus satanas: studio 2023 gruppo 2; NON aggiunto al manifesto sindromi finché il profilo edibility non ha fonte e categoria puntuale.
- Ramaria formosa: studio 2023 gruppo 2; NON aggiunta finché il profilo edibility non ha fonte e categoria puntuale.
- Armillaria spp.: studio 2023 gruppo 3 (preparazione insufficiente), Guida 2021 commestibilità condizionata: non assegnare automaticamente la categoria tossico né una sindrome indistinta.
- Russula/Lactarius: differenziare taxa acri specifici; non classificare interi generi.
- Tricholoma josserandii, Rubroboletus pulchrotinctus, Chlorophyllum brunneum, Scleroderma spp., Ramaria pallida: richiedono confronto puntuale della specie con il gruppo di tossicità, il rango e la categoria Guida prima dell'inserimento.
- Ramaria botrytis s.l.: non includere per inferenza nella classe GI.
- Chlorophyllum molybdites: intossicazioni GI ben documentate; non confondere con Chlorophyllum brunneum.

## Bloccanti per release
Il generatore scripts/toxicology-syndromes.mjs richiede studyProfile.edibility con classe tossica o sconsigliata; l'assenza di classificazione impedisce il join per diversi taxa. La PR contiene inoltre associazioni precedenti con localizzazioni bibliografiche da riesaminare. Nessun merge fino a rigenerazione, npm test, verifiche tassonomiche e fonti, browser mobile e audit scientifico indipendente. Non attestare pubblicazione o CI PASS senza esecuzione.
