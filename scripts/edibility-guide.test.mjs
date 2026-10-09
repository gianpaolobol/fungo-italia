import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {applyStudyProfiles} from './study-profiles.mjs';
const dataset=JSON.parse(readFileSync(new URL('../src/data/study-profiles.json',import.meta.url)));
const catalog=JSON.parse(readFileSync(new URL('../src/data/catalog.json',import.meta.url)));
const food=name=>dataset.records.find(r=>r.scientificName===name)?.profile.edibility;
test('guide distinguishes deaths, toxicity, discouragement and inedibility',()=>{
 for(const [name,category] of [['Amanita proxima','deadly'],['Caloboletus radicans','toxic'],['Caloboletus calopus','discouraged'],['Hygrophoropsis aurantiaca','discouraged'],['Russula Compactae Nigricantinae','inedible'],['Tylopilus felleus','inedible'],['Tricholoma equestre','discouraged']])assert.equal(food(name).category,category,name);
});
test('ordinary cooking recommendations do not become compulsory detoxification',()=>{
 for(const name of ['Macrolepiota procera s.l.','Cortinarius praestans','Infundibulicybe geotropa','Marasmius oreades'])assert.equal(food(name).category,'free',name);
 for(const name of ['Cyclocybe cylindracea','Amanita rubescens','Lactarius tesquorum','Laetiporus sulphureus s.l.','Suillellus luridus']){assert.equal(food(name).category,'conditional',name);assert(food(name).precautions.length>0,name);}
});
test('heterogeneous groups and unmentioned species never inherit a green badge',()=>{
 for(const name of ['Boletus sez. Luridi','Lyophyllum specie annerenti','Tricholoma sez. Genuina (= gruppo Albobrunnei)','Pleurotus cornucopiae / Pleurotus citrinopileatus'])assert.equal(food(name).category,'mixed',name);
 assert.equal(food('Lepiota elaiophylla'),undefined);
});
test('every reviewed category retains a pointwise founding guide reference',()=>{
 const supported=dataset.records.filter(r=>r.profile.edibility);
 assert.equal(supported.length,147);
 for(const r of supported){assert(r.profile.edibility.category,r.scientificName);assert(r.evidence.some(e=>e.sourceId==='S2-guida-ragionata-commestibilita-2021'&&e.fields.includes('edibility')&&Number.isInteger(e.page)&&e.supportedClaim),r.scientificName);}
 assert.equal(catalog.length,148);
 for(const t of catalog)assert.deepEqual(t.studyProfile?.edibility?.category,food(t.scientificName)?.category,t.scientificName);
});
test('schema rejects unsupported structured categories',()=>{
 const d={version:1,records:[structuredClone(dataset.records.find(r=>r.scientificName==='Amanita proxima'))]};
 d.records[0].profile.edibility.category='probably-edible';
 assert.throws(()=>applyStudyProfiles([{scientificName:'Amanita proxima'}],d,{documents:[]}));
});
test('public badge uses the reviewed category, not words in descriptions',()=>{
 const s=readFileSync(new URL('../web/public/app.js',import.meta.url),'utf8');
 const ctx=vm.createContext({});
 vm.runInContext(s.slice(s.indexOf('const escape='),s.indexOf('const norm='))+s.slice(s.indexOf('const edibilityCategories='),s.indexOf('function studyFacts('))+';globalThis.badge=edibilityBadge;',ctx);
 assert.match(ctx.badge({category:'free',label:'Commestibile previa normale cottura'}),/edibility-free.*libera/);
 assert.match(ctx.badge({category:'inedible',label:'Non commestibile'}),/edibility-inedible.*non commestibile/);
 assert.match(ctx.badge({category:'no-food-value',label:'Privo di valore'}),/edibility-no-food-value.*privo di valore/);
 assert.match(ctx.badge(undefined),/edibility-unknown.*non documentata/);
 assert.doesNotMatch(ctx.badge({label:'Commestibile'}),/edibility-free/);
 assert.match(ctx.badge(food('Amanita proxima')),/edibility-deadly.*tossico mortale/);
});
