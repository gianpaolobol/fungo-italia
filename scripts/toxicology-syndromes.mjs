const text=v=>typeof v==='string'&&v.trim().length>0;
export function applyToxicologySyndromes(records,dataset){
 if(dataset?.version!==1||!Array.isArray(dataset.records))throw Error('Invalid toxicology dataset');
 const seen=new Set();
 for(const entry of dataset.records){
  const {scientificName,syndrome,evidence}=entry;
  if(!text(scientificName)||seen.has(scientificName)||!syndrome||!text(syndrome.label)||!text(syndrome.latency)||!text(syndrome.severity)||!evidence||evidence.field!=='syndrome'||!text(evidence.location)||!text(evidence.url)||!/^https:\/\//.test(evidence.url)||evidence.reviewStatus!=='source-mapped-not-independently-reviewed')throw Error('Invalid syndrome evidence: '+scientificName);
  if(syndrome.references!==undefined&&(!Array.isArray(syndrome.references)||!syndrome.references.every(r=>text(r.location)&&/^https:\/\//.test(r.url))))throw Error('Invalid syndrome reference: '+scientificName);
  seen.add(scientificName);
  const taxon=records.find(t=>t.scientificName===scientificName);
  if(!taxon?.studyProfile?.edibility||!/tossic|velenos|mortale|nefrotoss|sconsigliat|non commestibile/i.test(taxon.studyProfile.edibility.label))throw Error('Syndrome requires documented toxic edibility: '+scientificName);
  taxon.studyProfile.edibility.syndrome={...syndrome};
  taxon.sources??=[];
  for(const [index,reference] of (syndrome.references||[]).entries())taxon.sources.push({sourceId:'TOX-CLINICAL-'+scientificName.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+index,title:'Fonte del quadro clinico',...reference,fields:['syndrome'],supportedClaim:syndrome.latency+' '+syndrome.severity,reviewScope:'toxicology-literature',reviewStatus:evidence.reviewStatus});
  taxon.sources.push({sourceId:'TOX-'+scientificName.toLowerCase().replace(/[^a-z0-9]+/g,'-'),title:'Fonte tossicologica istituzionale',url:evidence.url,location:evidence.location,fields:['syndrome'],supportedClaim:syndrome.label,reviewScope:'toxicology-literature',reviewStatus:evidence.reviewStatus});
 }
 return records;
}
