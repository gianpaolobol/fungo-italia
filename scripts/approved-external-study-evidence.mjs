import {readFile} from 'node:fs/promises';
const text=v=>typeof v==='string'&&v.trim().length>0;
export function applyApprovedExternalStudyEvidence(records,dataset){
 if(dataset?.version!==1||!Array.isArray(dataset.records))throw Error('Invalid external evidence');
 const seen=new Set(),applied=[];
 for(const row of dataset.records){
  if(!text(row.scientificName)||seen.has(row.scientificName))throw Error('Duplicate or invalid external candidate');
  seen.add(row.scientificName);
  if(row.administratorReview?.status!=='approved')continue;
  const taxon=records.find(t=>t.scientificName===row.scientificName);
  if(!taxon||!Array.isArray(row.sources)||!row.sources.length)throw Error('Approved external evidence lacks taxon or sources: '+row.scientificName);
  const fields=[...(text(row.odor)?['odor']:[]),...(text(row.sporePrint?.label)?['sporePrint']:[])];
  if(!fields.length)throw Error('Approved external evidence has no usable fields: '+row.scientificName);
  for(const field of fields){
   if(!row.sources.some(source=>source.fields?.includes(field)&&text(source.url)&&source.url.startsWith('https://')&&text(source.locator)))throw Error('Approved field lacks source locator: '+row.scientificName+' '+field);
  }
  taxon.studyProfile??={};
  if(text(row.odor))taxon.studyProfile.odor=row.odor;
  if(text(row.sporePrint?.label))taxon.studyProfile.sporePrint={label:row.sporePrint.label};
  taxon.sources??=[];
  for(const source of row.sources){
   if(!Array.isArray(source.fields)||!source.fields.some(f=>fields.includes(f)))continue;
   const citation={sourceId:'EXT-ADMIN-'+row.scientificName.toLowerCase().replace(/[^a-z0-9]+/g,'-'),reviewScope:'administrator-approved-external-literature',reviewStatus:'administrator-approved-not-independently-reviewed',title:'External mycological source',url:source.url,location:source.locator,fields:source.fields.filter(f=>fields.includes(f)),supportedClaim:fields.map(f=>f==='odor'?row.odor:row.sporePrint?.label).filter(Boolean).join('; ')};
   if(!taxon.sources.some(s=>s.url===citation.url&&s.location===citation.location))taxon.sources.push(citation);
  }
  applied.push(row.scientificName);
 }
 return applied;
}
