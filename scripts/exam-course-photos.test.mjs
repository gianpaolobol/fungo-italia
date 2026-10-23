import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildExamBank,normalizeName} from '../web/public/exam-core.js';
const catalog=JSON.parse(readFileSync(process.env.FUNGO_RECOVERED_DATA?process.env.FUNGO_RECOVERED_DATA+'/catalog.json':new URL('../src/data/catalog.json',import.meta.url)));
const profiles=JSON.parse(readFileSync(new URL('../src/data/study-profiles.json',import.meta.url)));
const bank=buildExamBank(catalog,profiles);
test('photographic bank retains documented eligible course photos separately from diagnostic triads',()=>{
 assert.equal(bank.length,86);assert.equal(bank.filter(c=>c.coursePhotos?.length).length,27);
 for(const c of bank){const t=catalog.find(t=>t.id===c.id),expected=(t.courseImages||[]).filter(p=>p.identificationEligible===true&&c.acceptedNames.some(n=>normalizeName(n)===normalizeName(p.subjectTaxon))).map(({src,view,credit,subjectTaxon,sourceId,caseId})=>({src,view,credit,subjectTaxon,sourceId,caseId}));assert.deepEqual(c.coursePhotos||[],expected);assert.equal(c.photos.length,3);assert.ok(c.photos.every(p=>!p.src.startsWith('images/course-chat/')));}
});
test('course photo eligibility and exact accepted identity are both required',()=>{
 const original=catalog.find(t=>bank.find(c=>c.id===t.id)?.coursePhotos?.length)||catalog.find(t=>t.courseImages?.some(p=>p.identificationEligible));
 const image=original.courseImages.find(p=>p.identificationEligible),changed={...original,courseImages:[{...image,identificationEligible:false},{...image,subjectTaxon:'Unresolved course specimen'}]};
 const result=buildExamBank([changed],profiles);assert.equal(result.length,1);assert.equal(result[0].coursePhotos,undefined);
});
