// Audit conservativo: nessuna riclassificazione automatica né approvazione scientifica implicita.
// Fonte primaria: Sitta, Davoli, Floriani, Suriano (2021), Regione Piemonte.
import {readFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('src/data/catalog.json','utf8'));
const groups=JSON.parse(await readFile('src/data/groups.json','utf8'));
const exam=JSON.parse(await readFile('src/data/exam-bank.json','utf8'));
const categories=new Set(['free','conditional','discouraged','no-food-value','inedible','toxic','deadly']);
const reviewedExamples=new Map([
 ['Amanita caesarea','free'],
 ['Amanita rubescens','conditional'],
 ['Tricholoma equestre','discouraged'],
 ['Tricholoma sejunctum','discouraged'],
 ['Clitocybe nebularis','discouraged'],
 ['Amanita citrina','inedible'],
 ['Entoloma sinuatum','toxic'],
 ['Amanita phalloides','deadly'],
]);
const all=[...catalog,...groups];
const byId=new Map(all.map(t=>[t.id,t]));
const issues=[];
const rows=all.map(t=>{
 const food=t.studyProfile?.edibility,category=food?.category||null;
 const guideReferences=(t.sources||[]).filter(s=>/guida.ragionata|Sitta.*Davoli|S2-guida-ragionata/i.test([s.title,s.sourceId,s.authors?.join(' ')].join(' ')));
 const explicitGuideEdibility=guideReferences.filter(s=>s.fields?.includes('edibility'));
 const warnings=[];
 if(!category||(!categories.has(category)&&category!=='mixed'))warnings.push('missing-or-nonstandard-category');
 if(category==='mixed')warnings.push('mixed-group-requires-species-level-review');
 if(category==='conditional'&&!food?.precautions?.length)warnings.push('conditional-without-mandatory-preparation');
 if(category==='conditional'&&food?.precautions?.some(v=>/nessuna precauzione/i.test(v)))warnings.push('conditional-contradictory-preparation');
 if(['free','conditional'].includes(category)&&food?.precautions?.some(v=>/non destinare al consumo/i.test(v)))warnings.push('edible-category-with-no-consumption-instruction');
 if(!explicitGuideEdibility.length)warnings.push('guide-edibility-claim-not-pointwise-attributed');
 const example=reviewedExamples.get(t.scientificName);
 if(example&&example!==category)warnings.push('guide-table-example-category-conflict');
 if(warnings.length)issues.push({id:t.id,name:t.scientificName,warnings});
 return {id:t.id,name:t.scientificName,rank:t.rank,category,preparation:food?.precautions||[],guideReferences:guideReferences.map(s=>({sourceId:s.sourceId,location:s.location,fields:s.fields})),warnings};
});
const examConflicts=[];
for(const item of exam){
 const t=byId.get(item.id),f=t?.studyProfile?.edibility;
 if(!t||f?.category!==item.category||JSON.stringify(f?.precautions||[])!==JSON.stringify(item.preparation||[]))
  examConflicts.push({id:item.id,name:item.name,examCategory:item.category,atlasCategory:f?.category||null});
}
const counts=Object.fromEntries([...categories,'mixed','missing'].map(c=>[c,rows.filter(r=>(r.category||'missing')===c).length]));
const report={source:'Sitta et al. (2021), Guida ragionata alla commestibilità dei funghi, Regione Piemonte',sourceUrl:'https://www.regione.piemonte.it/web/sites/default/files/media/documenti/2021-09/guida_commestibilita_funghi_isbn_979-12-200-9297-5.pdf',scope:{catalog:catalog.length,groups:groups.length,exam:exam.length},counts,guideExampleChecks:reviewedExamples.size,examConflicts,recordsNeedingReview:issues.length,issues,rows};
await import('node:fs').then(fs=>fs.mkdirSync('artifacts',{recursive:true}));
await import('node:fs/promises').then(fs=>fs.writeFile('artifacts/guida-ragionata-audit.json',JSON.stringify(report,null,2)+'\n'));
console.log(JSON.stringify({scope:report.scope,counts,examConflicts:examConflicts.length,recordsNeedingReview:issues.length,guideExampleChecks:reviewedExamples.size}));
if(examConflicts.length||issues.some(r=>r.warnings.includes('guide-table-example-category-conflict')))process.exitCode=1;
