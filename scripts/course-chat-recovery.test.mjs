import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
test('recovered course assets retain original integrity and only150 audited links',async()=>{
 const d=await read('src/data/course-chat-images.json');
 assert.equal(d.cases.length,148);assert.equal(d.images.length,200);assert.equal(d.images.filter(i=>i.links.length).length,150);
 assert.equal(d.images.reduce((n,i)=>n+i.bytes,0),58444044);
 for(const i of d.images){const b=await readFile('web/public/'+i.src);assert.equal(createHash('sha256').update(b).digest('hex'),i.fileSha256);assert.equal(createHash('md5').update(b).digest('hex'),i.cacheMd5);}
});
test('course source-only assets never become active atlas or test images',async()=>{
 const d=await read('src/data/course-chat-images.json'),rows=[...await read('src/data/catalog.json'),...await read('src/data/groups.json')],asset=await readFile('src/data/reference-image-assets.ts','utf8');
 assert.equal(rows.length,218);assert.equal(new Set(rows.flatMap(t=>(t.courseImages||[]).map(i=>i.src))).size,150);
 const admitted=new Set(rows.map(t=>t.id));for(const i of d.images){for(const link of i.links)assert(admitted.has(link.atlasId));if(!i.links.length)assert(!asset.includes(JSON.stringify(i.src)));}
});
test('pointwise guide evidence survives generation for all147 documented food profiles',async()=>{
 const rows=await read('src/data/catalog.json');assert.equal(rows.filter(t=>t.edibilityEvidence?.length).length,147);
 for(const t of rows.filter(t=>t.edibilityEvidence?.length))for(const e of t.edibilityEvidence){assert.equal(e.sourceId,'S2-guida-ragionata-commestibilita-2021');assert(Number.isInteger(e.page)&&e.page>=1&&e.page<=182);}
});
test('regeneration rejects reintroduced source-only or cross-taxon course links',async()=>{
 const {applyCourseChatImages}=await import('./course-chat-images.mjs');
 const d=await read('src/data/course-chat-images.json'),scope=await read('src/data/curriculum-scope.json'),rows=[...await read('src/data/catalog.json'),...await read('src/data/groups.json')];
 for(const t of rows){delete t.courseImages;t.sources=t.sources.filter(s=>s.sourceId!==d.sourceId);}
 const removed=d.images.find(i=>i.links.length===0);removed.links=[structuredClone(d.images.find(i=>i.links.length).links[0])];removed.links[0].image.src=removed.src;
 assert.throws(()=>applyCourseChatImages(rows,d,scope),/outside reviewed curriculum scope/);
});
