const foodSource='S2-guida-ragionata-commestibilita-2021';
const scales=new Set(['I','II','III','IV','I–II','I–III','I–IV','II–III','II–IV','III–IV']);
const imagePath=/^images\/reference\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:jpg|jpeg|png|webp)$/;
function check(ok,message){if(!ok)throw Error(message);}
function text(value){return typeof value==='string'&&value.trim().length>0;}
function keys(object,allowed){return object&&typeof object==='object'&&!Array.isArray(object)&&Object.keys(object).every(key=>allowed.includes(key));}
export function applyStudyProfiles(records,integration,registry){
 check(integration?.version===1&&Array.isArray(integration.records),'Invalid study profile dataset');
 const refs=new Map([...(registry.documents||[]),...(registry.externalReferences||[])].map(source=>[source.sourceId,source]));
 const seen=new Set();
 for(const entry of integration.records){
  check(keys(entry,['scientificName','profile','evidence'])&&text(entry.scientificName)&&!seen.has(entry.scientificName),'Invalid or duplicate study unit');
  seen.add(entry.scientificName);
  const taxon=records.find(t=>t.scientificName===entry.scientificName);
  check(taxon,'Unknown study unit '+entry.scientificName);
  const profile=entry.profile;
  check(keys(profile,['odor','sporePrint','edibility'])&&Object.keys(profile).length>0,'Invalid study fields');
  if('odor' in profile)check(text(profile.odor),'Invalid odor');
  if('sporePrint' in profile){
   const print=profile.sporePrint;
   check(keys(print,['label','color','scale'])&&text(print.label),'Invalid spore print');
   if('color' in print)check(typeof print.color==='string'&&/^#[0-9a-fA-F]{6}$/.test(print.color),'Invalid spore color');
   if('scale' in print)check(scales.has(print.scale),'Invalid spore scale');
  }
  if('edibility' in profile){
   const food=profile.edibility;
   check(taxon.kind!=='teaching-group','Food category cannot be inferred for a teaching genus');
   check(keys(food,['label','precautions'])&&text(food.label)&&Array.isArray(food.precautions)&&food.precautions.every(text),'Invalid food assessment');
  }
  check(Array.isArray(entry.evidence)&&entry.evidence.length>0,'Missing study evidence');
  const covered=new Set();
  for(const evidence of entry.evidence){
   check(keys(evidence,['sourceId','page','locator','fields','supportedClaim'])&&text(evidence.supportedClaim)&&Array.isArray(evidence.fields)&&evidence.fields.length>0&&evidence.fields.every(field=>field in profile),'Invalid field evidence');
   if(evidence.sourceId===foodSource){
    check(Number.isInteger(evidence.page)&&evidence.page>0&&evidence.page<=182,'Invalid food reference page');
    check(evidence.fields.every(field=>field==='edibility'),'Food guide cannot support unreviewed morphological fields');
   }else{
    const source=refs.get(evidence.sourceId);
    check(source?.analysisStatus==='extracted-text-reviewed','Unread study source');
    if(evidence.page===null)check(source.pageCount===null&&text(evidence.locator),'Missing precise textual locator');
    else check(Number.isInteger(evidence.page)&&evidence.page>0&&Number.isInteger(source.pageCount)&&evidence.page<=source.pageCount,'Invalid study source page');
    check(!evidence.fields.includes('edibility'),'Food claim needs pointwise founding guide evidence');
   }
   evidence.fields.forEach(field=>covered.add(field));
   if(evidence.sourceId!==foodSource){
    const source=refs.get(evidence.sourceId),location=evidence.page===null?evidence.locator:'p. '+evidence.page;
    taxon.sources??=[];
    const citation={sourceId:source.sourceId,reviewScope:'course-material',title:source.title,authors:source.authors||[],url:source.url,location,supportedClaim:evidence.supportedClaim,fields:evidence.fields,...(evidence.page===null?{}:{sourcePage:evidence.page})};
    if(!taxon.sources.some(s=>s.sourceId===citation.sourceId&&s.location===location&&s.supportedClaim===citation.supportedClaim))taxon.sources.push(citation);
   }
  }
  check(Object.keys(profile).every(field=>covered.has(field)),'Study field not supported');
  taxon.studyProfile=structuredClone(profile);
 }
 return records;
}
export function applyReferenceImages(records,manifest){
 check(manifest?.version===1&&Array.isArray(manifest.images),'Invalid reference image manifest');
 const files=new Set(),views=new Set();
 for(const asset of manifest.images){
  check(keys(asset,['scientificName','src','view','alt','credit','sourceId','page','taxonStatus','rights']),'Invalid image metadata');
  const taxon=records.find(t=>t.scientificName===asset.scientificName);
  check(taxon&&imagePath.test(asset.src)&&!files.has(asset.src),'Unknown taxon or invalid image path');
  check(['lateral','top','underside'].includes(asset.view)&&!views.has(taxon.id+':'+asset.view),'Invalid or duplicate reference view');
  check(text(asset.alt)&&text(asset.credit)&&text(asset.sourceId)&&Number.isInteger(asset.page)&&asset.page>0&&asset.taxonStatus==='identified','Unverified reference image');
  const rights=asset.rights;
  check(keys(rights,['status','publicRepository','pages','permissionEvidenceId'])&&rights.status==='verified'&&rights.publicRepository===true&&rights.pages===true&&text(rights.permissionEvidenceId),'Reference image publication rights not established');
  files.add(asset.src);views.add(taxon.id+':'+asset.view);
  taxon.referenceImages??=[];
  const publicAsset={src:asset.src,view:asset.view,alt:asset.alt,credit:asset.credit};
  const previous=taxon.referenceImages.find(image=>image.view===asset.view);
  if(previous)check(JSON.stringify(previous)===JSON.stringify(publicAsset),'Reference image conflicts with canonical data');
  else taxon.referenceImages.push(publicAsset);
 }
 return records;
}
