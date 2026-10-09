import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),catalog=JSON.parse(await readFile(new URL('src/data/catalog.json',root)));
assert.match(catalog.find(t=>t.scientificName==='Hapalopilus rutilans').differentiatingCharacter,/viola.*KOH|KOH.*viola/);
const app=await readFile(new URL('web/public/app.js',root),'utf8');
assert.ok(app.includes("diagnosticLimits[t.diagnosticStatus]||''"));
assert.ok(app.includes('Quadro e gravità:'));
console.log('Diagnostic limitations, clinical detail and Hapalopilus reagent character preserved');
