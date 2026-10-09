# Matrice integrata nella beta

La beta usa la matrice `FI-REV-20261009-v3-GUIDA-PREVALENTE`, autorizzata dal proprietario per l’importazione. Il suo SHA-256 è fissato in `scripts/reviewed-matrix.mjs`: una modifica successiva richiede una nuova integrazione autorizzata e non viene pubblicata automaticamente.

La pipeline mobile e quella PWA applicano la matrice dopo gli altri arricchimenti, usando gli ID stabili delle 214 schede. Importano odore, sporata, caratteri 3+1, habitat e giudizio alimentare. I riferimenti ISPRA mantengono pagina, ambito e divergenze; le note di conflitto della sporata di Gyromitra restano visibili come limite diagnostico. Le firme e le qualifiche dei revisori non vengono inventate né usate come evidenza.

Ogni categoria e giudizio alimentare devono coincidere con il profilo attribuito puntualmente alla Guida ragionata 2021. Una fonte alternativa non può sostituirli, nemmeno in presenza di più riscontri. I generi/gruppi e Lepiota elaiophylla non ricevono una categoria inferita. I campi strutturati di preparazione di Macrolepiota precisano gli accorgimenti: la prescrizione svizzera citata non diventa una condizione generale della Guida. La tossicologia clinica preesistente resta distinta dai confronti ISPRA.

Il banco dell’esame viene ricostruito sui dati finali della PWA. `data.json` contiene `matrixIntegration` con versione, hash e autorità alimentare per rendere verificabile l’origine dei dati pubblicati.

Controlli: test del rifiuto di giudizi difformi e categorie inferite, suite dei dati, build PWA, suite WebKit su viewport iPhone e confronto della versione realmente raggiungibile su Pages. Il backup `backup/main-pre-beta-publish-20261009` è escluso da questa integrazione.
