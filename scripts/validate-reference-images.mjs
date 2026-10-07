import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {applyReferenceImages} from './study-profiles.mjs';
const read=async name=>JSON.parse(await readFile('src/data/'+name+'.json','utf8'));
const [catalog,groups,manifest,evidence,registry]=await Promise.all(['catalog','groups','reference-images','reference-image-evidence','course-sources'].map(read));
function check(ok,message){if(!ok)throw Error(message);}
applyReferenceImages([...catalog,...groups],manifest);
const sources=new Map(registry.documents.map(s=>[s.sourceId,s])),proofs=new Map(evidence.images.map(p=>[p.src,p]));
check(proofs.size===evidence.images.length&&proofs.size===manifest.images.length,'Image evidence count mismatch');
const permission=await readFile('docs/reference-image-permission.md','utf8');
check(permission.includes('OWNER-COURSE-PHOTOS-2026-10-07'),'Missing owner permission evidence');
const coverage=await read('reference-image-coverage');
const taxa=[...catalog,...groups],required=['lateral','top','underside'];
check(JSON.stringify(coverage.requiredViews)===JSON.stringify(required)&&coverage.cards.length===taxa.length,'Coverage targets mismatch');
check(new Set(coverage.cards.map(c=>c.scientificName)).size===taxa.length,'Duplicate coverage rows');
for(const taxon of taxa){
 const row=coverage.cards.find(r=>r.scientificName===taxon.scientificName);
 const available=required.filter(v=>manifest.images.some(i=>i.scientificName===taxon.scientificName&&i.view===v));
 check(row&&JSON.stringify(row.availableViews)===JSON.stringify(available)&&JSON.stringify(row.missingViews)===JSON.stringify(required.filter(v=>!available.includes(v))),'Coverage does not match released images');
}
check(coverage.summary.images===manifest.images.length&&coverage.summary.cards===taxa.length,'Coverage count mismatch');
check(coverage.summary.completeTriplets===coverage.cards.filter(c=>c.missingViews.length===0).length&&coverage.summary.missingViews===coverage.cards.reduce((n,c)=>n+c.missingViews.length,0),'Coverage completeness mismatch');
const hashes=new Map();
for(const image of manifest.images){
 const source=sources.get(image.sourceId),proof=proofs.get(image.src);
 check(source&&proof&&proof.sourceId===image.sourceId&&proof.sourcePage===image.page,'Image source mismatch');
 check(source.pageCount===null||image.page<=source.pageCount,'Image page outside source');
 check(proof.visualReview==='verified'&&proof.subjectTaxon===image.subjectTaxon&&/^[a-f0-9]{64}$/.test(proof.sourceSha256),'Image visual review missing');
 check(image.rights.permissionEvidenceId==='OWNER-COURSE-PHOTOS-2026-10-07','Unexpected image permission');
 const bytes=await readFile('web/public/'+image.src);
 check(createHash('sha256').update(bytes).digest('hex')===proof.sha256,'Image bytes changed: '+image.src);
 check(bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217,'Invalid JPEG');
 let width=0,height=0;
 for(let p=2;p<bytes.length;){
  check(bytes[p]===255,'Invalid JPEG marker');
  const marker=bytes[p+1];
  if(marker===218||marker===217)break;
  const size=bytes.readUInt16BE(p+2);
  check(size>=2&&p+2+size<=bytes.length,'Invalid JPEG segment');
  check(![225,237,254].includes(marker),'Personal image metadata retained: '+image.src);
  if([192,193,194].includes(marker)){height=bytes.readUInt16BE(p+5);width=bytes.readUInt16BE(p+7);}
  p+=size+2;
 }
 check(width===proof.width&&height===proof.height&&Math.min(width,height)>=100&&Math.max(width,height)<=1600,'Image dimensions mismatch');
 const repeated=hashes.get(proof.sha256);
 check(!repeated||(repeated.view===image.view&&repeated.subjectTaxon===image.subjectTaxon),'Identical image relabeled as a different view or taxon');
 hashes.set(proof.sha256,{view:image.view,subjectTaxon:image.subjectTaxon});
}
console.log(JSON.stringify({verifiedImages:manifest.images.length,cards:new Set(manifest.images.map(i=>i.scientificName)).size,personalMetadataRemoved:true}));
