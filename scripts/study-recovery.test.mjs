import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCurriculumBank} from '../lib/study-curriculum-bank.mjs';
import {gradeResponse,trainingSummary,startTraining,submitTraining} from '../web/public/exam-core.js';
import {historyEvidence,examUnits} from '../lib/study-exam.mjs';
import {coverageInventory} from '../lib/study-coverage.mjs';
const read=name=>JSON.parse(readFileSync((process.env.FUNGO_RECOVERED_DATA||new URL('../src/data/',import.meta.url).pathname)+'/'+name+'.json'));
const catalog=read('catalog'),groups=read('groups');
const photos=JSON.parse(readFileSync(new URL('../src/data/exam-bank.json',import.meta.url)));
const theory=buildCurriculumBank(catalog,groups,photos),bank=[...photos,...theory];
test('recovered curriculum has 218 cases and 421 canonical theory questions',()=>{
 assert.equal(bank.length,218);assert.equal(photos.length,86);assert.equal(theory.length,132);
 const questions=theory.flatMap(c=>c.questions);assert.equal(questions.length,421);
 for(const [id,count] of [['edibility',61],['preparation',8],['syndrome',12]])assert.equal(questions.filter(q=>q.id===id).length,count);
 assert.equal(questions.filter(q=>q.id==='curriculumObjective').length,4);
 assert.ok(theory.every(c=>c.category===''));
});
test('theoretical food questions require actual S2 page evidence',()=>{
 for(const c of theory){const t=[...catalog,...groups].find(t=>t.id===c.id);for(const q of c.questions.filter(q=>['edibility','preparation','syndrome'].includes(q.id))){assert.deepEqual(q.provenance.sourceIds,['S2-guida-ragionata-commestibilita-2021']);assert.ok(q.provenance.guidePages.every(p=>t.edibilityEvidence.some(e=>e.sourceId===q.provenance.sourceIds[0]&&e.page===p)));if(q.id==='syndrome')assert.ok(['toxic','deadly'].includes(t.studyProfile.edibility.category));}}
 const noEvidence=catalog.map(t=>({...t,edibilityEvidence:[]})),without=buildCurriculumBank(noEvidence,groups.map(t=>({...t,edibilityEvidence:[]})),photos);
 assert.equal(without.flatMap(c=>c.questions).filter(q=>['edibility','preparation','syndrome'].includes(q.id)).length,0);
});
test('minimum classification follows curriculum metadata including groups',async()=>{
 const {curriculumItemsForLevel}=await import('../lib/curriculum-levels.mjs');
 const a={id:'a',scientificName:'A',kind:'teaching-group',curriculum:{level:'minimum'}},b={id:'b',scientificName:'B',curriculum:{level:'advanced'}};
 assert.deepEqual(curriculumItemsForLevel([a,b]),[a]);assert.deepEqual(curriculumItemsForLevel([a,b],'deep'),[a,b]);
 const coverage=coverageInventory([b],[a],[]);assert.equal(coverage.minimum.total,1);assert.equal(coverage.missing.find(t=>t.id==='a').scope,'minimum');assert.equal(examUnits([], [a,b])[0].scope,'minimum');
});
const profile=(category,preparation=false)=>({id:'food',name:'Test documentato',acceptedNames:[],category:'',questionKind:'profile',detailKind:'curriculum',photos:[],questions:[{id:'edibility',title:'Commestibilità',multiple:false,options:[],correct:[category]},...(preparation?[{id:'preparation',title:'Preparazione',multiple:false,options:[],correct:['documented']}]:[])]});
test('dangerous theory food choices and missed preparation enter critical history',()=>{
 for(const [expected,chosen] of [['toxic','free'],['deadly','conditional'],['conditional','free']]){const c=profile(expected),answer={choices:{edibility:[chosen]},assisted:false};assert.equal(gradeResponse(c,answer,[c]).danger,true);let s=startTraining([c],()=>0,1);s=submitTraining(s,answer,[c]);assert.equal(historyEvidence([trainingSummary(s)])[0].critical,true);}
 const c=profile('conditional',true),answer={choices:{edibility:['conditional'],preparation:['absent']},assisted:false};assert.equal(gradeResponse(c,answer,[c]).danger,false);let s=submitTraining(startTraining([c],()=>0,1),answer,[c]);assert.equal(historyEvidence([trainingSummary(s)]).find(e=>e.unitId.endsWith(':preparation')).critical,true);
 assert.equal(gradeResponse(profile('toxic'),{choices:{edibility:['deadly']}},[]).danger,false);
});
test('legacy complete revision retains only competencies actually attempted',()=>{
 const c=theory.find(c=>c.questions.some(q=>q.id==='edibility')&&c.questions.some(q=>q.id==='characters'));
 const h={id:'old',signature:'2885761559',completedAt:'2026-10-22',attempts:[{caseId:c.id,round:0,at:'2026-10-22',answer:{assisted:false},grade:{profile:true,name:true,category:true,danger:false,details:[{id:'characters',correct:true}]}}]};
 const evidence=historyEvidence([h],{bankRevision:'current',compatibleRevisions:['2885761559'],bank});assert.deepEqual(evidence.map(e=>e.unitId),[c.id+':characters']);assert.equal(evidence[0].bankRevision,'current');
});
