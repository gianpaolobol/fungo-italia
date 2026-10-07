import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('src/data/catalog.json','utf8'));
const groups=JSON.parse(await readFile('src/data/groups.json','utf8'));
assert.equal(groups.length,66);
assert.equal(new Set([...catalog,...groups].map(t=>t.id)).size,214);
const areas=JSON.parse(await readFile('src/data/areas.json','utf8'));
assert.equal(catalog.length,148);
assert.equal(new Set(catalog.map(t=>t.id)).size,148);
assert(catalog.every(t=>t.characters.length===3&&t.differentiatingCharacter&&t.curriculum?.sourcePage>0));
assert.equal(new Set(areas.map(a=>a.region)).size,20);
assert.equal(areas.length,71);
const amiata=areas.find(a=>a.id==='amiata');
assert(amiata&&amiata.center[0]>42&&amiata.center[0]<44&&amiata.center[1]>10&&amiata.center[1]<13,'Amiata coordinate order must be [latitude,longitude]');
assert(areas.every(a=>Math.abs(a.center[0])<=90&&Math.abs(a.center[1])<=180));
console.log('Offline catalog integrity, scientific provenance and all 20 regions verified.');

const supplements=JSON.parse(await readFile('src/data/supplementary-literature.json','utf8'));
for(const extra of supplements.records){
 const taxon=catalog.find(t=>t.scientificName===extra.scientificName);assert(taxon,'Unknown supplementary unit');
 for(const field of ['commonNames','habitat','lookalikes'])assert(extra[field].every(value=>taxon[field].includes(value)),'Supplementary '+field+' lost on regeneration');
 assert(extra.sources.every(source=>taxon.sources.some(s=>s.sourceId===source.sourceId&&s.url===source.url&&s.reviewScope==='supplementary-literature')),'Missing field-specific references');
}
assert(catalog.find(t=>t.scientificName==='Boletus edulis s.l.').commonNames.includes('Porcini'));
console.log('Supplementary names, habitats and comparison pointers survive canonical data regeneration without changing independent review status.');

const foundations=JSON.parse(await readFile('src/data/internal-foundations.json','utf8'));
assert.deepEqual(foundations.documents.map(d=>d.sourceId),['S1-obiettivi-tassonomici-v4-2026-06-09','S2-guida-ragionata-commestibilita-2021']);
assert(foundations.documents.every(d=>d.visibility==='internal'));
assert.equal(foundations.scientificStatus.independentReviewComplete,false);
assert.equal(foundations.scientificStatus.edibilityAssessment,'source-attributed-partial');
assert.equal(foundations.rules.foodClaimsRequirePointwiseGuideEvidence,true);
for(const t of [...catalog,...groups]){
 assert(t.curriculum?.documentId===foundations.curriculum.objectiveSourceId&&Number.isInteger(t.curriculum.sourcePage)&&t.curriculum.sourcePage>0,'Missing curriculum reference');
 assert(!('summary' in t)&&!('reviewStatus' in t)&&!('independentReviewStatus' in t),'Redundant generated metadata returned');
 assert(!t.sources.some(s=>/^(S1-|S2-|AUDIT-|EDITORIAL-)/.test(s.sourceId)),'Internal document in public sources');
}
assert(catalog.filter(t=>t.diagnosticNote).length>=15);
assert.equal(catalog.filter(t=>t.safetyCheck).length,4);
const bibliography=JSON.parse(await readFile('src/data/bibliography.json','utf8'));
assert(!bibliography.some(s=>/^(S1-|S2-|AUDIT-|EDITORIAL-)/.test(s.sourceId)));
console.log('Founding curriculum and edibility documents remain internal; useful diagnostic limits, safety checks and external references preserved.');

const courseRegistry=JSON.parse(await readFile('src/data/course-sources.json','utf8'));
const courseLiterature=JSON.parse(await readFile('src/data/course-literature.json','utf8'));
assert.equal(courseRegistry.course.independentReviewComplete,false);
assert.deepEqual(courseRegistry.foundations,foundations.documents.map(d=>d.sourceId));
const courseRefs=new Map([...courseRegistry.documents,...courseRegistry.externalReferences].map(d=>[d.sourceId,d]));
for(const entry of courseLiterature.records){
 const taxon=[...catalog,...groups].find(t=>t.scientificName===entry.scientificName);assert(taxon);
 for(const [field,values] of Object.entries(entry.additions))assert(values.every(v=>taxon[field].includes(v)),'Course addition lost on regeneration');
 for(const [field,value] of Object.entries(entry.replacements))assert.deepEqual(taxon[field],value,'Course correction lost on regeneration');
 for(const evidence of entry.evidence){
  const ref=courseRefs.get(evidence.sourceId);assert(ref);
  const source=taxon.sources.find(s=>s.sourceId===evidence.sourceId&&s.location===evidence.locator&&JSON.stringify(s.supportedClaim)===JSON.stringify(evidence.supportedClaim));
  assert(source&&source.reviewScope==='course-material','Course citation lost');
  assert.deepEqual(source.fields,evidence.fields);
  assert.deepEqual(source.characterIndices,evidence.characterIndices);
  if(evidence.page!==null)assert(evidence.page>0&&evidence.page<=ref.pageCount&&source.sourcePage===evidence.page);
 }
}
assert(courseRegistry.documents.filter(d=>d.analysisStatus==='content-unread').every(d=>!courseLiterature.records.some(e=>e.evidence.some(s=>s.sourceId===d.sourceId))),'Unread archive used as evidence');
assert(courseRegistry.documents.every(d=>d.rights.originalPublished===false));
console.log('Course integrations, pointwise references and corrections survive regeneration; unread archives excluded and scientific gate preserved.');

const studyProfiles=JSON.parse(await readFile('src/data/study-profiles.json','utf8'));
const referenceImages=JSON.parse(await readFile('src/data/reference-images.json','utf8'));
const {applyStudyProfiles,applyReferenceImages}=await import('./study-profiles.mjs');
const expected=[...catalog,...groups].map(t=>{const copy=structuredClone(t);delete copy.studyProfile;delete copy.referenceImages;return copy;});
applyStudyProfiles(expected,studyProfiles,courseRegistry);
applyReferenceImages(expected,referenceImages);
const {applyAdminReferenceImages}=await import('./admin-reference-images.mjs');
applyAdminReferenceImages(expected,JSON.parse(await readFile('src/data/admin-reference-images.json','utf8')));
for(const t of [...catalog,...groups]){const e=expected.find(row=>row.id===t.id);assert.deepEqual(t.studyProfile,e.studyProfile);assert.deepEqual(t.referenceImages,e.referenceImages);}
console.log('Pointwise study profiles and authorized reference galleries survive canonical regeneration.');

const {applyCommercialization}=await import('./commercialization.mjs');
const commercialization=JSON.parse(await readFile('src/data/commercialization.json','utf8'));
const legalExpected=structuredClone([...catalog,...groups]);
applyCommercialization(legalExpected,commercialization);
for(const t of [...catalog,...groups])assert.deepEqual(t.commercialization,legalExpected.find(e=>e.id===t.id).commercialization,'Commercial status lost on regeneration');
assert.equal(catalog.find(t=>t.scientificName==='Tricholoma equestre').commercialization.members[0].status,'banned');
assert.equal(catalog.find(t=>t.scientificName==='Amanita phalloides').commercialization,undefined);
console.log('Species-scoped fresh commercial status, regional limits and equestre ban survive native regeneration.');
