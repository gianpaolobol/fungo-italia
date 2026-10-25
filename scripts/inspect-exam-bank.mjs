#!/usr/bin/env node
// Non-mutating inspection: identify the actual exam-bank schema before asserting coverage.
import {readFileSync} from 'node:fs';
const atlas=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const bank=JSON.parse(readFileSync('src/data/exam-bank.json','utf8'));
if(!Array.isArray(atlas)||!Array.isArray(bank))throw Error('Expected arrays');
const atlasIds=new Set(atlas.map(x=>x.id));
const fields=['taxonId','catalogId','cardId','speciesId','atlasId','sourceId'];
const counts=Object.fromEntries(fields.map(k=>[k,bank.filter(x=>typeof x?.[k]==='string').length]));
const direct=fields.filter(k=>counts[k]===bank.length&&bank.length>0);
const mapping=direct.map(field=>({field,matched:bank.filter(x=>atlasIds.has(x[field])).length,unknown:[...new Set(bank.map(x=>x[field]).filter(id=>!atlasIds.has(id)))].slice(0,30)}));
const output={atlasEntries:atlas.length,examCases:bank.length,caseKeys:bank[0]&&typeof bank[0]==='object'?Object.keys(bank[0]):[],fieldCounts:counts,candidateMappings:mapping,coverageVerified:false,reason:'A mapping must be confirmed against buildExamBank and the exam selection logic before coverage can be certified.'};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
