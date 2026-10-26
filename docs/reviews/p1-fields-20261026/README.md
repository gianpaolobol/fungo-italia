# P1 — sei completamenti bibliografici circoscritti

Data:26 ottobre 2026. Baseline precedente:2eaa0c7f1a3de69a142b0753a97d4c04d56bc90f.

Le tre proposte residue della PR123 sono state rilette sulle fonti originali. Recuperati i soli campi mancanti, senza importare il branch completo; aggiunti tre habitat su unità già ammesse. Il normale percorso `supplementary-literature.json` → generatore → catalogo conserva checksum e provenienza, senza modifiche al generatore o ai gate.

| Unità S1 | Pagina S1 | Campo | Fonte e sezione |
|---|---:|---|---|
|Cortinarius orellanus |6 |Confronti |[First Nature](https://www.first-nature.com/fungi/cortinarius-orellanus.php), Identification guide — Stem |
|Galerina marginata group |7 |Habitat del taxon nominale |[First Nature](https://www.first-nature.com/fungi/galerina-marginata.php), Habitat & Ecological role |
|Gyromitra esculenta |21 |Confronti |[First Nature](https://www.first-nature.com/fungi/gyromitra-esculenta.php), Description; Similar species |
|Amanita pantherina |4 |Habitat |[First Nature](https://www.first-nature.com/fungi/amanita-pantherina.php), Habitat & Ecological role |
|Amanita gemmata |4 |Habitat |[First Nature](https://www.first-nature.com/fungi/amanita-gemmata.php), Habitat & Ecological role |
|Lepiota brunneoincarnata |9 |Habitat |[First Nature](https://www.first-nature.com/fungi/lepiota-brunneoincarnata.php), Habitat & Ecological role |

Ogni integrazione conserva identificativo sorgente, campo, URL, sezione, portata della proposizione e data di consultazione. Solo consultazione bibliografica: `source-consulted-pending-independent-review`. Non sono state consultate o certificate per rinvio le opere elencate nella bibliografia delle pagine.

Limiti conservati: il dato nominale di Galerina non viene esteso all'intero gruppo; per A.gemmata resta l'incertezza tassonomica delle segnalazioni sotto sole latifoglie. La formulazione del confronto con Helvella indica cavità longitudinali, senza aggiungere un carattere non documentato dalla sezione letta. Il confronto Cortinarius riguarda il gambo, senza importare affermazioni tossicologiche della pagina.

Non importati testo medico, giudizi alimentari, fotografie o licenze da queste fonti. La Guida S2 conserva tutti i giudizi alimentari. Nessun taxon, caso fotografico o diritto di accesso aggiunto.

Il [confronto di integrità](../../evidence/scientific-priority-fields-integrity-20261026.json) attesta invariati tutti gli altri campi e tutte le precedenti fonti. Identità e ordine delle148 schede,70 gruppi e86 casi fotografici preservati. Tutte le424 precedenti risposte teoriche corrette preservate; un quesito habitat aggiuntivo porta il totale425. Questi numeri non certificano la completezza dei due esami.

Risultato editoriale: habitat52/148 (prima48), confronti 65/148 (prima63). Nel [registro CSV](scientific-gap-register.csv) restano96 habitat e83 confronti mancanti;94 schede senza evidenza habitat puntuale secondo il gate. Revisione indipendente0/148;release-ready0/148. La presenza di un campo non implica determinazione certa o completezza professionale.

Regressioni: i due test del lotto falliscono prima delle integrazioni e passano dopo la rigenerazione. Suite Node237/237 e TypeScript superati; rigenerazione ripetuta identica. I gate scientifico e tossicologico strict restano entrambi exit1. Il master registra separatamente l'esito delle prove browser e lo stato delle pipeline native, senza ricavare una nuova distribuzione da test locali.

La revisione separata ha controllato coerenza software, citazioni e portata dei dati. Non costituisce attestazione micologica professionale indipendente.
