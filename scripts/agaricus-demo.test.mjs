import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {startTraining,restoreTraining,submitTraining,advanceTraining,detailQuestions} from '../web/public/exam-core.js';
const bank=JSON.parse(readFileSync(new URL('../src/data/exam-bank.json',import.meta.url)));
const demo=bank.filter(c=>/^Agaricus(?:\s|$)/.test(c.name));
test('four distinct Agaricus cases can start and restore without fifteen-case padding',()=>{
 const s=startTraining(demo,()=>0.5,demo.length);
 assert.equal(s.ids.length,4);assert.equal(new Set(s.ids).size,4);
 assert.deepEqual(restoreTraining(JSON.stringify(s),demo,4)?.ids,s.ids);
 assert.equal(restoreTraining(JSON.stringify(s),bank),null);
});
test('short demo corrects errors, repeats them, and completes with correct totals',()=>{
 let s=startTraining(demo,()=>0.5,4);
 s=advanceTraining(submitTraining(s,{name:'wrong',category:'',choices:{}},demo));
 for(let i=0;i<4;i++){
  const c=demo.find(c=>c.id===s.queue[0]);
  const choices=Object.fromEntries(detailQuestions(c,demo).map(q=>[q.id,q.correct]));
  s=advanceTraining(submitTraining(s,{name:c.acceptedNames[0],category:c.category,choices},demo));
 }
 assert.equal(s.phase,'complete');assert.equal(s.first.length,4);assert.equal(s.attempts.length,5);
 assert.equal(restoreTraining(JSON.stringify(s),demo,4)?.phase,'complete');
});
test('paid exam still requires fifteen cases and count parameters fail closed',()=>{
 assert.equal(startTraining(bank,()=>0.5).ids.length,15);
 for(const n of [0,-1,1.5,16,NaN])assert.throws(()=>startTraining(bank,()=>0.5,n));
});
test('demo selects all catalog Agaricus and genus only, never unrelated aliases',async()=>{
 const {agaricusOnly}=await import('../lib/demo-policy.mjs');
 const catalog=JSON.parse(readFileSync(new URL('../src/data/catalog.json',import.meta.url)));
 const groups=JSON.parse(readFileSync(new URL('../src/data/groups.json',import.meta.url)));
 assert.equal(agaricusOnly([...catalog,...groups]).length,8);
 assert.deepEqual(agaricusOnly([{id:'real',scientificName:'Agaricus campestris'},{id:'wrong',scientificName:'Amanita phalloides',aliases:['Agaricus campestris']},{id:'prefix',name:'AgaricusFake'}]).map(t=>t.id),['real']);
 assert.equal(agaricusOnly(bank).length,4);
});
test('commercial listing has one annual offer and separates public from private screenshots',()=>{
 const config=JSON.parse(readFileSync(new URL('../store/it-IT.json',import.meta.url)));
 assert.equal(config.price.customerPrice,'0.00');assert.equal(config.subscription.customerPrice,'19.99');
 assert.equal(config.subscription.period,'ONE_YEAR');assert.match(config.description,/Agaricus/);assert.doesNotMatch(config.description,/(?<![0-9])9,99 €|Base permanente|anteprima di 5 schede/);
 const manifest=JSON.parse(readFileSync(new URL('../store/screenshots/manifest.json',import.meta.url)));
 const publicImages=manifest.images.filter(i=>i.publicStoreImage===true);
 assert.equal(publicImages.length,4);assert.ok(publicImages.every(i=>!i.path.endsWith('03-esame.png')));
 assert.equal(manifest.subscriptionReviewImage,'store/screenshots/iphone/03-esame.png');
 assert.equal(manifest.images.find(i=>i.path===manifest.subscriptionReviewImage).publicStoreImage,false);
});
