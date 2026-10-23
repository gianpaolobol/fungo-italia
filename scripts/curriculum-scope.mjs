const sourceId='S1-obiettivi-tassonomici-v4-2026-06-09';
function validatedUnits(scope,objectives){
 if(scope?.schemaVersion!==1||scope.sourceId!==sourceId||!Array.isArray(scope.units)||!Array.isArray(objectives))throw Error('Invalid curriculum scope');
 const objectiveMap=new Map(objectives.map(o=>[o.id,o]));
 if(objectiveMap.size!==objectives.length)throw Error('Duplicate curriculum objective');
 const units=new Map();
 for(const u of scope.units){
  if(!u.id||!u.scientificName||!u.rank||units.has(u.id))throw Error('Invalid or duplicate curriculum unit '+u.id);
  if(u.level!=='minimum')throw Error('Invalid curriculum level '+u.id);
  const o=objectiveMap.get(u.objectiveId);
  if(!o||!o.objectives?.minimum?.trim())throw Error('Missing curriculum objective '+u.objectiveId);
  if(!Number.isInteger(u.sourcePage)||u.sourcePage<1||u.sourcePage!==o.sources?.minimumObjectives?.page)throw Error('Curriculum source page mismatch '+u.id);
  if(u.completionCard&&(u.scientificName!==o.scientificName||!u.curriculumObjective?.trim()))throw Error('Curriculum completion objective mismatch '+u.id);
  units.set(u.id,u);
 }
 return units;
}
function curriculumFor(u){return {documentId:sourceId,sourcePage:u.sourcePage,level:u.level,objectiveId:u.objectiveId,...(u.learningUnitId?{learningUnitId:u.learningUnitId}:{})};}
export function applyCurriculumScope(records,scope,objectives){
 const units=validatedUnits(scope,objectives),seen=new Set();
 // Validate the entire input before assigning any curriculum metadata.
 for(const r of records){
  const u=units.get(r.id);
  if(!u||seen.has(r.id))throw Error('Unknown or duplicate curriculum unit '+r.id);
  if(r.scientificName!==u.scientificName||r.rank!==u.rank)throw Error('Curriculum name/rank mismatch '+r.id);
  if(r.curriculum?.level&&r.curriculum.level!==u.level)throw Error('Curriculum level mismatch '+r.id);
  if(r.curriculum&&JSON.stringify(r.curriculum)!==JSON.stringify(curriculumFor(u))){
   for(const k of ['documentId','sourcePage','objectiveId','learningUnitId'])if(r.curriculum[k]!==undefined&&r.curriculum[k]!==curriculumFor(u)[k])throw Error('Curriculum '+k+' mismatch '+r.id);
  }
  seen.add(r.id);
 }
 for(const id of units.keys())if(!seen.has(id))throw Error('Missing curriculum unit '+id);
 for(const r of records){const u=units.get(r.id);r.curriculum=curriculumFor(u);if(u.deepMorphologyRequired!==undefined)r.deepMorphologyRequired=u.deepMorphologyRequired;}
 return records;
}
export function curriculumCompletionCards(scope,objectives){
 return [...validatedUnits(scope,objectives).values()].filter(u=>u.completionCard).map(u=>({id:u.id,scientificName:u.scientificName,rank:u.rank,kind:'teaching-group',commonNames:[],characters:[],habitat:[],lookalikes:[],aliases:[],currentAcceptedNames:[],currentGenera:[],relatedIds:[],curriculumObjective:u.curriculumObjective,sources:[],curriculum:curriculumFor(u)}));
}
