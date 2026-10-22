import test from 'node:test';
import assert from 'node:assert/strict';
import {auditPhotoCoverage} from './audit-photo-exam-coverage.mjs';
const images=['lateral','top','underside'].map(view=>({src:'images/example-'+view+'.jpg',view,subjectTaxon:'Amanita testensis'}));
const taxon={id:'t1',scientificName:'Amanita testensis',rank:'species',referenceImages:images,studyProfile:{edibility:{category:'toxic',precautions:[]}}};
const exam={id:'t1',name:taxon.scientificName,category:'toxic',preparation:[],photos:images};
test('every atlas entry must have a photographic case',()=>{
 const r=auditPhotoCoverage([taxon],[{...taxon,id:'group'}],[exam]);
 assert.equal(r.totalRequired,2);
 assert.equal(r.missing,1);
 assert.ok(r.rows.find(x=>x.id==='group').reasons.includes('missing-photo-case'));
});
test('exam food class and treatment must match atlas',()=>{
 const r=auditPhotoCoverage([taxon],[],[{...exam,category:'free',preparation:['wrong']}]);
 assert.equal(r.covered,0);
 assert.ok(r.rows[0].reasons.includes('food-category-mismatch'));
 assert.ok(r.rows[0].reasons.includes('preparation-mismatch'));
});
test('valid triad and exact entry provide complete coverage',()=>{
 const r=auditPhotoCoverage([taxon],[],[exam]);
 assert.equal(r.covered,1);assert.equal(r.missing,0);assert.deepEqual(r.errors,[]);
});
