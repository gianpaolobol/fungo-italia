#!/usr/bin/env node
// Fails closed when recognition coverage is not 100%. Does not alter generator.
import {readFileSync} from 'node:fs';
const atlas=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const bank=JSON.parse(readFileSync('src/data/exam-bank.json','utf8'));
const atlasIds=new Set(atlas.map(x=>x.id)),bankIds=new Set(bank.map(x=>x.id));
const missing=atlas.filter(x=>!bankIds.has(x.id)).map(x=>({id:x.id,name:x.scientificName,rank:x.rank}));
const extra=bank.filter(x=>!atlasIds.has(x.id)).map(x=>x.id);
const duplicates=bank.length-bankIds.size;
const report={expected:atlas.length,covered:atlas.length-missing.length,percent:atlas.length?Number(((atlas.length-missing.length)/atlas.length*100).toFixed(2)):0,missing,extra,duplicates};
console.log(JSON.stringify(report,null,2));
if(!atlas.length||missing.length||extra.length||duplicates)process.exitCode=1;
