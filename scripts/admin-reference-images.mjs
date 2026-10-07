const views=['lateral','top','underside'];
const viewLabels={lateral:'vista laterale',top:'vista superiore',underside:'vista dal basso'};
const keys=['taxonId','scientificName','view','src','sha256','byteLength','width','height','subjectTaxon','attribution','source','rights','editedBy','updatedAt'];
const only=(v,fields)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>fields.includes(k));
const text=v=>typeof v==='string'&&!!v.trim();
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(v)&&Number.isFinite(Date.parse(v));
const check=(ok,message)=>{if(!ok)throw Error('Invalid administrator photograph: '+message);};
export function validateAdminReferenceImages(manifest,records){
 check(only(manifest,['version','images'])&&manifest.version===1&&Array.isArray(manifest.images)&&manifest.images.length<=642,'manifest');
 const seen=new Set(),taxa=records?new Map(records.map(t=>[t.id,t])):null;
 for(const image of manifest.images){
  check(image&&typeof image==='object'&&!Array.isArray(image)&&Object.keys(image).every(k=>keys.includes(k)),'fields');
  const key=image.taxonId+':'+image.view,taxon=taxa?.get(image.taxonId);
  check(text(image.taxonId)&&text(image.scientificName)&&(!taxa||taxon?.scientificName===image.scientificName)&&views.includes(image.view)&&!seen.has(key),'taxon or view');
  check(/^[a-f0-9]{64}$/.test(image.sha256)&&image.src==='images/reference/admin-'+image.sha256+'.jpg','path or hash');
  check([image.width,image.height].every(n=>Number.isInteger(n)&&n>=100&&n<=1600)&&Number.isInteger(image.byteLength)&&image.byteLength>0&&image.byteLength<=512*1024,'dimensions or bytes');
  check(text(image.subjectTaxon)&&image.subjectTaxon.length<=200&&text(image.attribution)&&image.attribution.length<=160,'credit');
  check(only(image.source,['kind'])&&image.source.kind==='user-provided'&&image.editedBy==='gianpaolobol'&&date(image.updatedAt),'administrator provenance');
  const r=image.rights;
  check(only(r,['license','publicationScope','authorization'])&&r.license==='rights-reserved'&&r.publicationScope==='fungo-italia-authorized'&&only(r.authorization,['method','recordedAt'])&&r.authorization.method==='uploader-declaration'&&date(r.authorization.recordedAt),'publication declaration');
  seen.add(key);
 }
 return manifest;
}
export function publicAdminReferenceImage(image){
 return {src:image.src,view:image.view,alt:image.subjectTaxon+' — '+viewLabels[image.view],subjectTaxon:image.subjectTaxon,credit:'Foto: '+image.attribution+'. Libreria personale; nome del taxon indicato dall’amministratore. Diritti riservati.'};
}
export function applyAdminReferenceImages(records,manifest){
 validateAdminReferenceImages(manifest,records);
 for(const image of manifest.images){
  const taxon=records.find(t=>t.id===image.taxonId),replacement=publicAdminReferenceImage(image);
  taxon.referenceImages=(taxon.referenceImages||[]).filter(p=>p.view!==image.view);
  taxon.referenceImages.push(replacement);
  taxon.referenceImages.sort((a,b)=>views.indexOf(a.view)-views.indexOf(b.view));
 }
 return records;
}
