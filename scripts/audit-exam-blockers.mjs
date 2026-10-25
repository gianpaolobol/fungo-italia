#!/usr/bin/env node
// Read-only blocker inventory using the shared, conservative eligibility rules.
import {readFileSync} from 'node:fs';
import {recognitionEligibility} from './recognition-eligibility.mjs';
const atlas=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const bank=JSON.parse(readFileSync('src/data/exam-bank.json','utf8'));
if(!Array.isArray(atlas)||!Array.isArray(bank))throw Error('Expected atlas and bank arrays');
const present=new Set(bank.map(x=>x.id));
const rows=atlas.filter(x=>!present.has(x.id)).map(x=>{
 const result=recognitionEligibility(x);
 return {id:x.id,name:x.scientificName,rank:x.rank,category:x.studyProfile?.edibility?.category??null,photos:x.referenceImages?.length??0,eligibleByPrecheck:result.eligible,issues:result.reasons};
});
const categories=[...new Set(rows.flatMap(r=>r.issues))].sort();
const result={atlasTotal:atlas.length,recognitionBankTotal:bank.length,uncovered:rows.length,precheckEligibleUncovered:rows.filter(x=>x.eligibleByPrecheck).length,precheckBlockedUncovered:rows.filter(x=>!x.eligibleByPrecheck).length,blockerCounts:Object.fromEntries(categories.map(k=>[k,rows.filter(r=>r.issues.includes(k)).length])),rows,notes:['Eligibility is a preliminary gate, not a determination of species identity or an approval to publish.','Reference-image metadata must still be independently verified and images must actually exist.','100% coverage requires generated-bank and runtime selection tests; no missing evidence is inferred.']};
console.log(JSON.stringify(result,null,2));
