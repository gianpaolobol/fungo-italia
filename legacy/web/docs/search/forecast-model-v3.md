# Modello Ricerca territoriale v3 — 29 settembre 2026

## Scopo

Il punteggio stima la **compatibilità ambientale e meteorologica con la fruttificazione** su macroaree. Non indica una fungaia, non pubblica coordinate di raccolta e non garantisce la presenza di sporocarpi.

## Copertura territoriale

La ricerca nazionale usa **71 macroaree aggregate** distribuite in tutte le 20 regioni italiane. Le nuove aree vengono ammesse con un livello di evidenza esplicito:

1. presenza fungina o attività di raccolta documentata da Parco/Regione;
2. regolamentazione territoriale ufficiale della raccolta;
3. habitat forestale documentato da fonti regionali/di Parco;
4. associazioni micologiche riconosciute, con peso inferiore rispetto alle fonti istituzionali.

Le fonti social pubbliche possono suggerire dove cercare ulteriori evidenze, ma non vengono usate da sole per aumentare il punteggio o pubblicare localizzazioni.

## Meteo

La API usa Open-Meteo e, per ogni centro rappresentativo della macroarea, acquisisce:

- temperatura e umidità correnti;
- precipitazione osservata negli ultimi 7, 14 e 26 giorni;
- temperatura media osservata nei 20 giorni precedenti;
- ET0 e bilancio idrico semplificato a 14 giorni;
- quota del punto meteorologico;
- probabilità di precipitazione odierna.

Le precipitazioni future non vengono sommate alla pioggia già osservata.

## Algoritmo v3

Il punteggio combina:

- idoneità ecologica dell'area;
- fenologia mensile dei taxa attesi;
- compatibilità quota/stagione;
- qualità dell'evidenza territoriale;
- meteo corrente;
- **andamento distribuito delle piogge a 7/14/26 giorni**;
- segnale pioggia/temperatura di fruttificazione;
- pressione di ricerca aggregata e ritardata.

L'andamento della pioggia è separato dal totale: il modello premia una disponibilità idrica costruita su più settimane e non una singola precipitazione intensa.

## Fondamento scientifico e limiti

Andrew et al. (2018, Ecology, DOI 10.1002/ecy.2237) mostra che temperatura, precipitazione, quota e geografia contribuiscono alla fenologia fungina europea, con risposte diverse fra gruppi e specie.

Per *Boletus edulis*, il modello usa il caso specifico meglio supportato disponibile: il monitoraggio decennale 2015–2024 pubblicato come preprint da Lamartiniere & Hoffman associa il massimo di fruttificazione a circa 13 °C medi nei 20 giorni precedenti e a precipitazione crescente accumulata su circa 26 giorni. Questi valori non vengono generalizzati come soglie rigide agli altri taxa.

Per gli altri taxa le finestre stagionali restano volutamente larghe. Il modello non assume che la stessa quantità di pioggia o temperatura abbia lo stesso effetto su tutti i suoli, habitat o specie.

## Fonti territoriali aggiunte nel lotto v3

Oltre al lotto v2, sono state aggiunte macroaree documentate in Veneto, Friuli-Venezia Giulia, Toscana, Campania, Puglia, Calabria, Sardegna e Sicilia. Fra le fonti ad alta utilità:

- Regione FVG: aree amministrative e permessi specifici per Canal del Ferro-Val Canale e Dolomiti Friulane/Cavallo/Cansiglio;
- Regione Veneto: enti competenti alla raccolta e foreste demaniali;
- Regione Toscana: disciplina e limitazioni territoriali aggiornate della raccolta;
- Parco nazionale della Sila: presenza diffusa di *Boletus edulis* e *Lactarius deliciosus*;
- Parco nazionale dell'Aspromonte: regolamento per la raccolta e habitat forestali;
- Regione Puglia: PPTR e habitat forestali dei Monti Dauni;
- Regione Campania: ambiti montani e tradizioni micologiche del Matese e dell'Irpinia;
- Forestas Sardegna: Foresta dei Sette Fratelli;
- Regione Siciliana: querceti e sistemi forestali dei Monti Sicani.

## Interpretazione

- **Vai ora** = combinazione favorevole dei segnali disponibili, non certezza di ritrovamento.
- **Possibile** = condizioni parzialmente favorevoli o evidenza/meteo non abbastanza forte.
- **Attendi** = condizioni deboli o incompatibili con stagione/meteo attuali.
- La confidenza è distinta dal punteggio: un'area può avere un buon punteggio con confidenza media se l'evidenza territoriale è meno robusta.
