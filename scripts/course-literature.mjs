import assert from 'node:assert/strict';
const allowed=new Set(['characters','differentiatingCharacter','diagnosticNote','habitat','lookalikes']);
export function applyCourseLiterature(records,integration,registry){
 assert.equal(integration.version,1); assert.equal(registry.version,1);
 const refs=new Map([...registry.documents,...(registry.externalReferences??[])].map(d=>[d.sourceId,d]));
 assert.equal(refs.size,registry.documents.length+(registry.externalReferences?.length??0));
 assert.equal(new Set(integration.records.map(e=>e.scientificName)).size,integration.records.length);
 const all=new Map(records.map(t=>[t.scientificName,t]));
 for(const entry of integration.records){
  const taxon=all.get(entry.scientificName);assert(taxon,'Unknown course unit '+entry.scientificName);
  const changed=[...Object.keys(entry.additions),...Object.keys(entry.replacements)];
  assert(changed.length>0&&changed.every(f=>allowed.has(f)),'Unapproved course field');
  assert(entry.evidence.length>0);
  for(const field of changed)assert(entry.evidence.some(e=>e.fields.includes(field)),'Unreferenced course field '+field);
  for(const [field,values] of Object.entries(entry.additions)){
   assert(['habitat','lookalikes'].includes(field)&&Array.isArray(values)&&values.every(v=>typeof v==='string'&&v.trim()));
   taxon[field]=[...new Set([...(taxon[field]??[]),...values])];
  }
  for(const [field,value] of Object.entries(entry.replacements)){
   if(field==='characters')assert(Array.isArray(value)&&(taxon.kind==='teaching-group'?value.length>0&&value.length<=3:value.length===3)&&value.every(v=>typeof v==='string'&&v.trim()));
   else assert(typeof value==='string'&&value.trim());
   taxon[field]=structuredClone(value);
  }
  for(const evidence of entry.evidence){
   const source=refs.get(evidence.sourceId);assert(source,'Unregistered course source');
   assert(/^https:\/\//.test(source.url)&&evidence.locator&&evidence.supportedClaim);
   assert(evidence.fields.length>0&&evidence.fields.every(f=>changed.includes(f)));
   if(evidence.page!==null)assert(Number.isInteger(evidence.page)&&evidence.page>0&&Number.isInteger(source.pageCount)&&evidence.page<=source.pageCount,'Invalid source page');
   if(evidence.characterIndices)assert(evidence.fields.includes('characters')&&Array.isArray(evidence.characterIndices)&&evidence.characterIndices.length>0&&evidence.characterIndices.every(i=>Number.isInteger(i)&&i>=0&&i<3),'Invalid character scope');
   if(source.driveFileId)assert(source.analysisStatus==='extracted-text-reviewed','Unread source cannot support a claim');
   taxon.sources.push({sourceId:source.sourceId,reviewScope:'course-material',title:source.title,authors:source.authors,url:source.url,location:evidence.locator,supportedClaim:evidence.supportedClaim,fields:evidence.fields,...(evidence.characterIndices?{characterIndices:evidence.characterIndices}:{}),...(evidence.page!==null?{sourcePage:evidence.page}:{})});
  }
 }
 return records;
}
