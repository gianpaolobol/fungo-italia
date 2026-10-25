#!/usr/bin/env node
// Read-only provenance consistency: correspondence must never silently rewrite
// a photo's scientific subject, source path or attribution.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const atlas=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const bank=JSON.parse(readFileSync('src/data/exam-bank.json','utf8'));
const register=JSON.parse(readFileSync('src/data/recognition-photo-reconciliation.json','utf8'));
const indexed=new Map(atlas.map(u=>[u.id,u])),covered=new Set(bank.map(x=>x.id));
assert.equal(register.schemaVersion,1);
assert.equal(register.records.length,atlas.filter(x=>!covered.has(x.id)).length);
const validRelations=new Set(['explicit-label','name-in-curriculum-label','curriculum-explicit-member','course-representative-candidate','needs-course-review']);
for(const row of register.records){
 assert(!covered.has(row.id),'Reconciliation includes an already covered record');
 const u=indexed.get(row.id);assert(u,'Missing catalog record '+row.id);
 assert.equal(row.taxon,u.scientificName);
 assert.equal(row.rank,u.rank);
 assert.equal(row.photos.length,(u.referenceImages||[]).length);
 for(let i=0;i<row.photos.length;i++){
  const photo=row.photos[i],original=u.referenceImages[i];
  assert(validRelations.has(photo.relation),'Unknown relationship status');
  for(const k of ['src','subjectTaxon','credit'])assert.equal(photo[k],original[k],'Provenance drift '+row.id+' '+k);
  if(['curriculum-explicit-member','course-representative-candidate'].includes(photo.relation))assert(typeof photo.relationEvidence==='string'&&photo.relationEvidence.length>20,'Missing course relationship explanation');
  if(photo.relation==='needs-course-review')continue;
  assert(photo.credit&&photo.src&&photo.subjectTaxon,'Incomplete provenance');
 }
}
const unresolved=register.records.flatMap(x=>x.photos.filter(p=>p.relation==='needs-course-review').map(p=>({id:x.id,photo:p.src})));
const missing=register.records.filter(r=>!r.photos.length).map(r=>r.taxon);
const counted=register.records.flatMap(r=>r.photos);
assert.equal(register.stats.reviewRequiredPhotoLinks,unresolved.length,'Unresolved count mismatch');
assert.equal(register.stats.documentaryReconciledLinks,counted.length-unresolved.length,'Reconciliation count mismatch');
assert.equal(register.stats.courseRepresentativeCandidateLinks,counted.filter(p=>p.relation==='course-representative-candidate').length,'Representative candidate count mismatch');
console.log(JSON.stringify({catalog:atlas.length,covered:covered.size,uncovered:register.records.length,unresolvedRelationships:unresolved.length,noReferencePhotos:missing,scientificApproval:false},null,2));
