#!/usr/bin/env node
// Read-only blocker inventory for 100% atlas recognition coverage.
// Use after npm run prepare:data; never auto-promote unreviewed images or food status.
import {readFileSync} from 'node:fs';
const atlas=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const bank=JSON.parse(readFileSync('src/data/exam-bank.json','utf8'));
const present=new Set(bank.map(x=>x.id));
const rows=atlas.filter(x=>!present.has(x.id)).map(x=>{
 const food=x.studyProfile?.edibility??{};
 const photos=x.referenceImages??[];
 const issues=[];
 if(x.rank!=='species')issues.push('non-species-rank');
 if(!/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(x.scientificName??''))issues.push('non-binomial-label');
 if(photos.length<3)issues.push('fewer-than-three-reference-images');
 if(!['free','conditional','discouraged','no-food-value','inedible','toxic','deadly'].includes(food.category))issues.push('food-category-not-single-valued');
 if(!(x.edibilityEvidence??[]).length)issues.push('missing-explicit-edibility-evidence');
 if(food.category==='conditional'&&!(food.precautions??[]).length)issues.push('missing-preparation');
 if(['toxic','deadly'].includes(food.category)&&(!food.syndrome?.label||!food.syndrome?.latency||!food.syndrome?.severity))issues.push('incomplete-toxicology');
 return {id:x.id,name:x.scientificName,rank:x.rank,category:food.category??null,photos:photos.length,issues};
});
const categories=[...new Set(rows.flatMap(r=>r.issues))].sort();
const result={atlasTotal:atlas.length,recognitionBankTotal:bank.length,uncovered:rows.length,blockerCounts:Object.fromEntries(categories.map(k=>[k,rows.filter(r=>r.issues.includes(k)).length])),rows,notes:['Issues are potential blockers, not a complete proof of the buildExamBank exclusion reason.','An image count does not certify the images, their identities, or source permissions.','100% coverage must not be declared until the generated exam and runtime selector both pass coverage tests.']};
console.log(JSON.stringify(result,null,2));
