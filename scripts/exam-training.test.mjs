import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../web/public/exam-core.js';
const sample={id:'a',name:'Amanita rubescens',acceptedNames:['Amanita rubescens'],category:'conditional',detailKind:'preparation',preparation:['Cottura completa','Eliminare le parti indicate'],syndrome:null};
const bank=Array.from({length:15},(_,i)=>({...sample,id:String(i),name:'Specie '+i,acceptedNames:['Specie '+i]}));
test('autocomplete begins at three letters and searches every accepted name',()=>{
 assert.equal(typeof core.suggestNames,'function');
 assert.deepEqual(core.suggestNames([sample],'Am'),[]);
 assert.ok(core.suggestNames([sample],'ama').includes('Amanita rubescens'));
});
test('multiple precautions require all correct options and reject extra selections',()=>{
 assert.equal(typeof core.detailQuestions,'function');
 const [q]=core.detailQuestions(sample,[sample]);
 assert.equal(core.gradeResponse(sample,{name:sample.name,category:'conditional',choices:{[q.id]:q.correct}},[sample]).passed,true);
 assert.equal(core.gradeResponse(sample,{name:sample.name,category:'conditional',choices:{[q.id]:q.correct.slice(0,1)}},[sample]).passed,false);
 const extra=q.options.find(o=>!q.correct.includes(o.id));
 assert.ok(extra);
 assert.equal(core.gradeResponse(sample,{name:sample.name,category:'conditional',choices:{[q.id]:[...q.correct,extra.id]}},[sample]).passed,false);
});
test('all errors are queued again and first attempts survive successful retries and reload',()=>{
 assert.equal(typeof core.startTraining,'function');
 let s=core.startTraining(bank,()=>.5);
 for(let i=0;i<15;i++){
  const c=bank.find(c=>c.id===s.queue[0]);
  s=core.submitTraining(s,{name:'errata',category:'free',choices:{}},bank);
  s=core.advanceTraining(s);
 }
 assert.equal(s.phase,'retry');assert.equal(s.queue.length,15);
 const initial=JSON.stringify(s.first);
 const c=bank.find(c=>c.id===s.queue[0]),q=core.detailQuestions(c,bank)[0];
 s=core.submitTraining(s,{name:c.name,category:c.category,choices:{[q.id]:q.correct}},bank);
 assert.equal(JSON.stringify(s.first),initial);
 s=core.advanceTraining(s);
 assert.equal(s.queue.length,14);
 assert.equal(core.restoreTraining(JSON.stringify(s),bank)?.queue.length,14);
 assert.equal(core.trainingSummary(s).correct,0);
 assert.equal(core.trainingSummary(s).danger,15);
});
test('submission is immutable, duplicate submits do not add attempts, invalid checkpoints are rejected',()=>{
 assert.equal(typeof core.startTraining,'function');
 const s=core.startTraining(bank,()=>.5),snapshot=JSON.stringify(s);
 const next=core.submitTraining(s,{name:'x',category:'',choices:{}},bank);
 assert.equal(JSON.stringify(s),snapshot);
 assert.equal(core.submitTraining(next,{name:'y'},bank).attempts.length,1);
 assert.equal(core.restoreTraining('{bad',bank),null);
 assert.equal(core.restoreTraining(JSON.stringify({...next,queue:['unknown']}),bank),null);
});
const realBank=JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../src/data/exam-bank.json',import.meta.url)));
test('equivalent gastrointestinal syndromes and overlapping long latencies are not distractors',()=>{
 const gyro=realBank.find(c=>c.name==='Gyromitra esculenta');
 const latency=core.detailQuestions(gyro,realBank).find(q=>q.id==='latency');
 assert.ok(!latency.options.some(o=>!latency.correct.includes(o.id)&&/Lunga:/.test(o.label)));
 const hyph=realBank.find(c=>c.name==='Hypholoma fasciculare');
 const syndrome=core.detailQuestions(hyph,realBank).find(q=>q.id==='label');
 assert.ok(!syndrome.options.some(o=>!syndrome.correct.includes(o.id)&&/gastrointestinale|morganica/i.test(o.label)));
});
test('variable or explicitly not exclusively short latency has no overlapping distractors',()=>{
 const c=realBank.find(c=>c.name==='Hypholoma fasciculare');
 const q=core.detailQuestions(c,realBank).find(q=>q.id==='latency');
 assert.equal(q.options.length,2);
});
