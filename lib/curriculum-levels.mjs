export function curriculumItemsForLevel(taxa, level = 'minimum') {
  var allowed = level === 'minimum' ? ['minimum'] : level === 'desirable' ? ['minimum', 'desirable'] : ['minimum', 'desirable', 'advanced'];
  return taxa.filter(t => allowed.includes(t.curriculum?.level || 'minimum'));
}

// Extra levels are source-bound learning modules about admitted parent units,
// not inferred new species or invented diagnostic/food cards.
export function buildObjectiveModules(taxa,objectives){
 return objectives.flatMap(o=>{
  const parent=taxa.find(t=>t.kind==='teaching-group'&&t.curriculum?.objectiveId===o.id)||taxa.find(t=>t.curriculum?.objectiveId===o.id);
  if(!parent)return [];
  return ['desirable','advanced'].filter(level=>typeof o.objectives?.[level]==='string'&&o.objectives[level].trim()).map(level=>({
   id:'module-'+o.id+'-'+level,scientificName:o.scientificName,commonNames:[],rank:o.rank,kind:'curriculum-module',learningModule:true,parentTaxonId:parent.id,
   characters:[],habitat:[],lookalikes:[],aliases:[],currentAcceptedNames:[],referenceImages:[],
   curriculumObjective:o.objectives[level],curriculum:{documentId:'S1-obiettivi-tassonomici-v4-2026-06-09',objectiveId:o.id,sourcePage:o.sources.minimumObjectives.page,level},
   sources:[{sourceId:'S1-obiettivi-tassonomici-v4-2026-06-09',title:o.sources.minimumObjectives.title,location:'p. '+o.sources.minimumObjectives.page,supportedClaim:'Testo del modulo '+level+'; non aggiunge una specie autonoma all’atlante.'}]
  }));
 });
}
