import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const normalize = v => String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
export function auditPhotoCoverage(catalog,groups,bank) {
 const records=[...catalog,...groups], ids=new Set(), listed=new Map(), errors=[];
 for(const t of records) {
  if(!t?.id||ids.has(t.id)) errors.push({id:t?.id||null,reason:'missing-or-duplicate-atlas-id'});
  ids.add(t.id);
 }
 const rows=records.map(t=>{
  const cases=bank.filter(c=>c.id===t.id && c.questionKind!=='profile');
  const media=(t.referenceImages||[]).filter(p=>p?.src&&p.subjectTaxon&&normalize(p.subjectTaxon)===normalize(t.scientificName));
  const distinctViews=[...new Set(media.map(p=>p.view))];
  const reasons=[];
  if(cases.length!==1) reasons.push(cases.length?'duplicate-photo-case':'missing-photo-case');
  if(!['lateral','top','underside'].every(v=>distinctViews.includes(v))) reasons.push('incomplete-validated-photo-views');
  if(!['free','conditional','discouraged','no-food-value','inedible','toxic','deadly'].includes(t.studyProfile?.edibility?.category)) reasons.push('missing-or-group-mixed-edibility');
  if(cases.length===1){
   const c=cases[0],food=t.studyProfile?.edibility;
   if(c.category!==food?.category) reasons.push('food-category-mismatch');
   if(JSON.stringify(c.preparation||[])!==JSON.stringify(food?.precautions||[])) reasons.push('preparation-mismatch');
   if(!Array.isArray(c.photos)||c.photos.length<3||!['lateral','top','underside'].every(v=>c.photos.some(p=>p.view===v&&normalize(p.subjectTaxon)===normalize(t.scientificName)))) reasons.push('invalid-photographic-question');
  }
  return {id:t.id,name:t.scientificName,rank:t.rank,caseCount:cases.length,photoCount:media.length,reasons};
 });
 for(const item of bank){
  if(listed.has(item.id)) errors.push({id:item.id,reason:'duplicate-bank-id'});
  listed.set(item.id,true);
  if(!ids.has(item.id)) errors.push({id:item.id,reason:'exam-case-not-in-atlas'});
 }
 return {totalAtlas:catalog.length,totalGroups:groups.length,totalRequired:records.length,totalPhotoCases:bank.length,covered:rows.filter(r=>r.reasons.length===0).length,missing:rows.filter(r=>r.reasons.length),rows,errors};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
 const data=await Promise.all(['src/data/catalog.json','src/data/groups.json','src/data/exam-bank.json'].map(f=>readFile(f,'utf8').then(JSON.parse)));
 const result=auditPhotoCoverage(...data);
 const out='artifacts/photo-exam-coverage.json';await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({totalRequired:result.totalRequired,totalPhotoCases:result.totalPhotoCases,covered:result.covered,missing:result.missing,errors:result.errors.length,report:out}));
 if(process.argv.includes('--strict')&&(result.missing||result.errors.length))process.exitCode=1;
}
