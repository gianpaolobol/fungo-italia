const foundationIds=new Set(['S1-obiettivi-tassonomici-v4-2026-06-09','S2-guida-ragionata-commestibilita-2021']);
export function internalSource(source){return foundationIds.has(source.sourceId)||/^(AUDIT-|EDITORIAL-)/.test(source.sourceId??'');}
export function cleanAtlasRecord(record){
 const t=structuredClone(record),objective=t.sources.find(s=>s.sourceId==='S1-obiettivi-tassonomici-v4-2026-06-09');
 if(objective)t.curriculum={documentId:objective.sourceId,sourcePage:Number(objective.location.match(/\d+/)?.[0]),...(t.learningUnitId?{learningUnitId:t.learningUnitId}:{})};
 t.sources=t.sources.filter(s=>!internalSource(s));
 if(t.summary?.startsWith('Unità didattica al rango ')||t.summary?.startsWith('Obiettivo didattico di genere o gruppo.'))delete t.summary;
 for(const key of ['reviewStatus','reviewScope','independentReviewStatus','edibility','publishedDatabaseChangesIncluded','lookalikesStatus','learningUnitId'])delete t[key];
 if(t.safetyNote==='Valutazione alimentare non pubblicata: in attesa di approvazione micologica indipendente.')delete t.safetyNote;
 if(t.acceptedName===t.scientificName)delete t.acceptedName;
 if(t.sourceLabel===t.sourceName||t.sourceLabel===t.scientificName)delete t.sourceLabel;
 if(t.sourceName===t.scientificName)delete t.sourceName;
 if(JSON.stringify(t.sourceGenera)===JSON.stringify(t.currentGenera))delete t.sourceGenera;
 for(const key of Object.keys(t))if(t[key]===null||t[key]==='Non documentata'||t[key]==='Non documentato')delete t[key];
 if(t.externalIds&&Object.values(t.externalIds).every(v=>v===null))delete t.externalIds;
 return t;
}
export function cleanBibliography(sources){
 return sources.filter(s=>!internalSource(s)&&s.sourceId!=='S4-veneto-guida-parte1-copy');
}
export function internalFoundations(sources){
 const documents=[...foundationIds].map(id=>{const source=sources.find(s=>s.sourceId===id);if(!source)throw Error('Missing founding document '+id);return {...source,role:id.startsWith('S1-')?'curriculum':'edibility-reference',visibility:'internal'};});
 return {schemaVersion:1,documents,curriculum:{requiredMinimumUnits:148,requiredTeachingGroups:66,objectiveSourceId:documents[0].sourceId},scientificStatus:{independentReviewComplete:false,edibilityAssessment:'not-published'},rules:{foodClaimsRequirePointwiseGuideEvidence:true,internalAuditIsNotExternalEvidence:true}};
}
