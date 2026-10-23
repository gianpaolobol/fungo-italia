import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {applyCourseChatImages} from './course-chat-images.mjs';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const dataset=await read('src/data/course-chat-images.json'),scope=await read('src/data/curriculum-scope.json'),records=[...await read('src/data/catalog.json'),...await read('src/data/groups.json')],assets=await readFile('src/data/reference-image-assets.ts','utf8');
const expected=new Map(records.map(t=>[t.id,{images:t.courseImages||[],sources:t.sources.filter(s=>s.sourceId===dataset.sourceId)}]));
for(const t of records){delete t.courseImages;t.sources=t.sources.filter(s=>s.sourceId!==dataset.sourceId);}
applyCourseChatImages(records,dataset,scope);
for(const t of records){if(JSON.stringify(t.courseImages||[])!==JSON.stringify(expected.get(t.id).images))throw Error('Course image regeneration drift '+t.id);if(JSON.stringify(t.sources.filter(s=>s.sourceId===dataset.sourceId))!==JSON.stringify(expected.get(t.id).sources))throw Error('Course citation drift '+t.id);}
let bytes=0;for(const i of dataset.images){const b=await readFile('web/public/'+i.src);bytes+=b.length;if(b.length!==i.bytes||createHash('sha256').update(b).digest('hex')!==i.fileSha256)throw Error('Course image integrity '+i.src);if(Boolean(i.links.length)!==assets.includes(JSON.stringify(i.src)))throw Error('Course asset scope '+i.src);}
const counts={sourceImages:dataset.images.length,linkedImages:dataset.images.filter(i=>i.links.length).length,sourceOnlyImages:dataset.images.filter(i=>!i.links.length).length,atlasCardsWithCourseImages:records.filter(t=>t.courseImages?.length).length,bytes,independentReviewComplete:false};
if(counts.sourceImages!==200||counts.linkedImages!==150||counts.sourceOnlyImages!==50||counts.atlasCardsWithCourseImages!==79||bytes!==58444044)throw Error('Course coverage drift');console.log(JSON.stringify(counts));
