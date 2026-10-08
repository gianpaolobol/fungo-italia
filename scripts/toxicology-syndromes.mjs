const text=v=>typeof v==='string'&&v.trim().length>0;
export function applyToxicologySyndromes(records,dataset){
 if(dataset?.version!==1||!Array.isArray(dataset.records))throw Error('Invalid toxicology dataset');
 const seen=new Set();
 for(const entry of dataset.records){
  const {scientificName,syndrome,evidence}=entry;
  if(!text(scientificName)||seen.has(scientificName)||!syndrome||!text(syndrome.label)||!text(syndrome.latency)||!text(syndrome.severity)||!evidence||evidence.field!=='syndrome'||!text(evidence.location)||!text(evidence.url)||!/^https:\/\//.test(evidence.url)||evidence.reviewStatus!=='source-mapped-not-independently-reviewed')throw Error('Invalid syndrome evidence: '+scientificName);
  seen.add(scientificName);
  const taxon=records.find(t=>t.scientificName===scientificName);
  if(!taxon?.studyProfile?.edibility||!/tossic|velenos|mortale|nefrotoss|sconsigliat|non commestibile/i.test(taxon.studyProfile.edibility.label))throw Error('Syndrome requires documented toxic edibility: '+scientificName);
  taxon.studyProfile.edibility.syndrome={...syndrome};
  taxon.sources??=[];
  taxon.sources.push({sourceId:'TOX-'+scientificName.toLowerCase().replace(/[^a-z0-9]+/g,'-'),title:'Fonte tossicologica istituzionale',url:evidence.url,location:evidence.location,fields:['syndrome'],supportedClaim:syndrome.label,reviewScope:'toxicology-literature',reviewStatus:evidence.reviewStatus});
 }
 return records;
}
