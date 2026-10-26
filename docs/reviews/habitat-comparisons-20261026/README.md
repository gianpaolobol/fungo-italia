# Completamento habitat e confronti — 26 ottobre 2026

Baseline precedente: `c89d0a231106f3828b66da8125c73f6015edba50`. Responsabile: ChatGPT Work. Ricerca interna prima di integrazioni esterne; nessuna revisione professionale indipendente attestata.

| Ambito originario | Copertura interna | Copertura esterna | Parziale | Irrisolto |
|---|---:|---:|---:|---:|
|96 habitat |10 |62 |23 |1 |
|83 confronti |9 |49 |21 |4 |
|179 campi |19 |111 |44 |5 |

174 campi hanno ora almeno un contenuto supportato. Soltanto130 hanno copertura bibliografica dell’unità nel registro;44 restano parziali. Non attestare il completamento di tutti179. Presenti147 habitat e144 confronti su148 schede;148 schede ancora bloccate,0 pronte per produzione.

Il [registro completo](../../../revisione/habitat-comparison-completion-20261026.json) conserva identità S1, pagina/rango, stato, citazioni e motivi delle lacune. L’[audit interno](../../../revisione/internal-habitat-source-audit-20261026.json) registra39 PDF; la trascrizione MicoLab è citata con locatori puntuali senza redistribuzione dell’originale. Il nuovo download della guida S2 ha restituito HTTP503; i giudizi alimentari precedenti sono invariati. I [controlli esterni](../../../revisione/external-habitat-source-checks-20261026.json) e le citazioni nei registri sorgente documentano autore, qualificazione e limiti; non attestano accreditamento formale o approvazione indipendente.

## Campi senza contenuto adottabile

- Boletus sez. Luridi: habitat e confronto. Fonti trovate per componenti; nessuna generalizzazione alla sezione eterogenea.
- Gymnopus fusipes: confronto. Testo trovato soltanto su mirror editoriale non verificato; escluso.
- Hericium spp.: confronto. Confronti interni fra specie non dimostrano una diagnosi esterna per tutto il genere.
- Scutiger pes-caprae: confronto. La sola frase «inconfondibile» non documenta comparatore e differenza.

Le44 coperture parziali sono elencate nel registro; i limiti sono conservati anche nei testi visibili dell’app. Per completarle servono fonti che coprano le componenti effettive delle unità curricolari e revisione micologica.

## Verifiche

Rigenerazione dati,240 test Node,TypeScript,build web condivisa/legacy,65 WebKit,65 Chromium e smoke test offline: superati. Preservate tutte425 risposte teoriche corrette precedenti;475 quesiti correnti derivati dal catalogo. Nessuna modifica a identità/ranghi,S1,S2,foto,entitlement o revisione professionale. La revisione separata dell’integrazione ha corretto due classificazioni erroneamente complete (confronti L.nuda s.l. e C.prunulus s.l.); il controllo era mirato,non validazione scientifica esaustiva delle179 evidenze.

[Prova di preservazione](../../evidence/habitat-comparison-integrity-20261026.json). I comandi strict scientifico e tossicologico restituiscono exit1 e restano bloccanti; non disabilitati. Il [JSON](scientific-gap-register.json) e il [CSV](scientific-gap-register.csv) misurano i blocchi automatici di presenza/evidenza; affiancare sempre il registro179 per i limiti di ambito. Nessuna nuova build EAS,distribuzione TestFlight,release App Store o verifica StoreKit su dispositivo è attribuita a questo commit.
