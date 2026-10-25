#!/usr/bin/env node
// Read-only, deterministic coverage audit of the published recognition bank.
import {readFileSync} from 'node:fs';
const atlas=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const bank=JSON.parse(readFileSync('src/data/exam-bank.json','utf8'));
if(!Array.isArray(atlas)||!Array.isArray(bank))throw Error('Expected arrays');
const unique=(items)=>[...new Set(items)];
const ids=(items)=>items.map(x=>x.id);
const atlasIds=new Set(ids(atlas)),bankIds=new Set(ids(bank));
const duplicates=(items)=>unique(items.filter((id,i)=>items.indexOf(id)!==i));
const missing=atlas.filter(x=>!bankIds.has(x.id)).map(x=>({id:x.id,name:x.scientificName,rank:x.rank??null,images:x.referenceImages?.length??0,foodCategory:x.studyProfile?.edibility?.category??null}));
const orphaned=bank.filter(x=>!atlasIds.has(x.id)).map(x=>({id:x.id,name:x.name}));
const eligible=atlas.filter(x=>x.rank==='species'&&/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(x.scientificName||''));
const coveredEligible=eligible.filter(x=>bankIds.has(x.id));
const photosInvalid=bank.filter(x=>!Array.isArray(x.photos)||x.photos.length<3||x.photos.some(p=>!p.src||!p.subjectTaxon||!p.credit)).map(x=>x.id);
const output={generatedAt:null,atlasCount:atlas.length,bankCount:bank.length,eligibleSpeciesCount:eligible.length,eligibleSpeciesCovered:coveredEligible.length,atlasUncoveredCount:missing.length,atlasUncovered:missing,orphanedCases:orphaned,duplicateAtlasIds:duplicates(ids(atlas)),duplicateBankIds:duplicates(ids(bank)),photoMetadataProblems:photosInvalid,selectionPoolCategoryCounts:Object.fromEntries(unique(bank.map(x=>x.category)).map(k=>[k,bank.filter(x=>x.category===k).length])),limitations:['Coverage of all atlas taxa is NOT proven by species-only bank: groups and taxa without three certified views may be absent.','This checks generated output, not execution of selectCases, scientific validity, file existence, or independently reviewed image identification.']};
console.log(JSON.stringify(output,null,2));
if(output.duplicateAtlasIds.length||output.duplicateBankIds.length||orphaned.length||photosInvalid.length)process.exitCode=1;
