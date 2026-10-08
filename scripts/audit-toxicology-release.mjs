import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const study=JSON.parse(readFileSync('src/data/study-profiles.json','utf8'));
const toxic=JSON.parse(readFileSync('src/data/toxicology-syndromes.json','utf8'));
const byName=new Map(catalog.map(t=>[t.scientificName,t]));
const food=new Map(study.records.filter(r=>r.profile?.edibility).map(r=>[r.scientificName,r]));
const errors=[],warnings=[],seen=new Set();
for(const r of toxic.records){
 const name=r.scientificName;
 if(seen.has(name))errors.push(name+': duplicate syndrome mapping');
 seen.add(name);
 if(!byName.has(name))errors.push(name+': missing canonical taxon');
 if(!food.has(name))errors.push(name+': missing sourced edibility profile (build blocker)');
 if(!r.evidence?.url?.startsWith('https://')||!r.evidence?.location||!r.syndrome?.label)errors.push(name+': incomplete syndrome evidence');
 if(r.evidence?.reviewStatus!=='independently-reviewed')warnings.push(name+': toxicology evidence not independently reviewed');
}
const giConstant=['Entoloma sinuatum','Tricholoma pardinum','Omphalotus olearius','Hypholoma fasciculare','Chlorophyllum molybdites'];
const giVariable=['Agaricus sez. Xanthodermatei','Rubroboletus satanas','Ramaria formosa'];
for(const name of giConstant){const r=toxic.records.find(r=>r.scientificName===name);if(!r||!/gastrointestinale/i.test(r.syndrome.label))errors.push(name+': constant GI mapping absent');}
for(const name of giVariable){const r=toxic.records.find(r=>r.scientificName===name);if(!r)warnings.push(name+': GI non-universal mapping pending sourced edibility');}
const result={catalog:catalog.length,syndromeMappings:toxic.records.length,errors,warnings,releaseBlocked:errors.length>0||warnings.length>0};
console.log(JSON.stringify(result,null,2));
if(process.argv.includes('--strict')&&result.releaseBlocked)process.exitCode=1;
