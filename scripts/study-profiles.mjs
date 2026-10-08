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
   check(keys(food,['label','precautions','syndrome'])&&text(food.label)&&Array.isArray(food.precautions)&&food.precautions.every(text)&&(food.syndrome===undefined||(keys(food.syndrome,['label','severity','latency'])&&text(food.syndrome.label))),'Invalid food assessment');
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
export function isPublicHttps(value){
 if(typeof value!=='string')return false;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&!!url.hostname;}catch{return false;}
}
export function validateExternalReference(asset,source,proof){
 check(source&&source.sourceId===asset.sourceId&&/^EXT-[a-zA-Z0-9._-]+$/.test(source.sourceId),'Unknown external image source');
 check(['CC BY 1.0','CC BY 2.0','CC BY 2.5','CC BY 3.0','CC BY 4.0','CC BY-SA 1.0','CC BY-SA 2.0','CC BY-SA 2.5','CC BY-SA 3.0','CC BY-SA 4.0','CC0','CC0 1.0','Public domain','CC BY'].includes(source.licenseName),'Unsupported external image license');
 check(text(source.author)&&isPublicHttps(source.sourceUrl)&&isPublicHttps(source.licenseUrl)&&isPublicHttps(source.licenseEvidenceUrl)&&isPublicHttps(source.assetUrl)&&isPublicHttps(source.taxonomicEvidence)&&text(source.verificationBasis),'Incomplete external image provenance');
 check(/^[a-f0-9]{64}$/.test(source.sourceSha256),'Invalid external source digest');
 const subjects=source.allowedSubjectTaxa||[source.subjectTaxon];
 check(Array.isArray(subjects)&&subjects.length>0&&subjects.every(text)&&subjects.includes(asset.subjectTaxon),'External photographed taxon mismatch');
 check(asset.sourceUrl===source.sourceUrl&&asset.licenseUrl===source.licenseUrl,'External public citation mismatch');
 check(asset.rights.permissionEvidenceId==='EXTERNAL-LICENSE:'+source.sourceId,'External permission evidence mismatch');
 if(proof){
  check(proof.sourceSha256===source.sourceSha256&&/^[a-f0-9]{64}$/.test(proof.candidateSha256)&&typeof proof.sourcePath==='string'&&/^source-photo-assets\/external\/[a-zA-Z0-9._-]+\.jpg$/.test(proof.sourcePath)&&!proof.sourcePath.includes('..'),'Invalid external extraction evidence');
 }
 return true;
}
export function applyReferenceImages(records,manifest){
 check(manifest?.version===1&&Array.isArray(manifest.images),'Invalid reference image manifest');
 const files=new Set(),views=new Set();
 for(const asset of manifest.images){
  check(keys(asset,['scientificName','src','view','alt','credit','sourceId','page','taxonStatus','rights','subjectTaxon','sourceUrl','licenseUrl']),'Invalid image metadata');
  const taxon=records.find(t=>t.scientificName===asset.scientificName);
  check(taxon&&imagePath.test(asset.src)&&!files.has(asset.src),'Unknown taxon or invalid image path');
  check(['lateral','top','underside'].includes(asset.view)&&!views.has(taxon.id+':'+asset.view),'Invalid or duplicate reference view');
  const external=typeof asset.sourceId==='string'&&asset.sourceId.startsWith('EXT-');
  check(text(asset.alt)&&text(asset.credit)&&text(asset.sourceId)&&(external?asset.page===null||(Number.isInteger(asset.page)&&asset.page>0):Number.isInteger(asset.page)&&asset.page>0)&&asset.taxonStatus==='identified','Unverified reference image');
  for(const field of ['sourceUrl','licenseUrl'])if(field in asset)check(isPublicHttps(asset[field]),'Invalid public image citation');
  if(external)check(text(asset.subjectTaxon)&&isPublicHttps(asset.sourceUrl)&&isPublicHttps(asset.licenseUrl),'Missing external public provenance');
  if('subjectTaxon' in asset)check(text(asset.subjectTaxon),'Invalid photographed taxon');
  const rights=asset.rights;
  check(keys(rights,['status','publicRepository','pages','permissionEvidenceId'])&&rights.status==='verified'&&rights.publicRepository===true&&rights.pages===true&&text(rights.permissionEvidenceId),'Reference image publication rights not established');
  if(external)check(rights.permissionEvidenceId==='EXTERNAL-LICENSE:'+asset.sourceId,'External permission evidence mismatch');
  files.add(asset.src);views.add(taxon.id+':'+asset.view);
  taxon.referenceImages??=[];
  const publicAsset={src:asset.src,view:asset.view,alt:asset.alt,credit:asset.credit,...(asset.subjectTaxon?{subjectTaxon:asset.subjectTaxon}:{}),...(asset.sourceUrl?{sourceUrl:asset.sourceUrl}:{}),...(asset.licenseUrl?{licenseUrl:asset.licenseUrl}:{})};
  const previous=taxon.referenceImages.find(image=>image.view===asset.view);
  if(previous)check(JSON.stringify(previous)===JSON.stringify(publicAsset),'Reference image conflicts with canonical data');
  else taxon.referenceImages.push(publicAsset);
 }
 return records;
}
