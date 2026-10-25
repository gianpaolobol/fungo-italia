#!/usr/bin/env node
// Read-only catalog coverage inventory. No inferred identifications or edibility.
import fs from 'node:fs';
const input=process.argv[2]??'src/data/catalog.json';
const entries=JSON.parse(fs.readFileSync(input,'utf8'));
if(!Array.isArray(entries)) throw new Error('Expected catalog array');
const ids=new Set(),duplicates=[],rows=[];
for(const [i,e] of entries.entries()){
  if(typeof e.id!=='string'||!e.id.trim()) throw new Error('Missing ID at '+i);
  if(ids.has(e.id))duplicates.push(e.id);ids.add(e.id);
  const images=Array.isArray(e.referenceImages)?e.referenceImages:[];
  const validImages=images.filter(x=>typeof x.src==='string'&&x.src.trim()&&typeof x.credit==='string'&&x.credit.trim()&&(!x.subjectTaxon||x.subjectTaxon===e.scientificName));
  const evidence=Array.isArray(e.edibilityEvidence)?e.edibilityEvidence:[];
  rows.push({id:e.id,name:e.scientificName,rank:e.rank??null,hasImages:images.length>0,images:images.length,attributedImages:validImages.length,hasEdibilityEvidence:evidence.length>0,hasDiagnosticCharacters:Array.isArray(e.characters)&&e.characters.length>0,reviewStatus:e.diagnosticStatus??null});
}
const summary={total:rows.length,uniqueIds:ids.size,duplicateIds:duplicates,withImages:rows.filter(x=>x.hasImages).length,withoutImages:rows.filter(x=>!x.hasImages).map(x=>x.id),withUnattributedImages:rows.filter(x=>x.images!==x.attributedImages).map(x=>x.id),withoutEdibilityEvidence:rows.filter(x=>!x.hasEdibilityEvidence).map(x=>x.id),withoutDiagnosticCharacters:rows.filter(x=>!x.hasDiagnosticCharacters).map(x=>x.id),rankCounts:Object.fromEntries([...new Set(rows.map(x=>String(x.rank)))].map(k=>[k,rows.filter(x=>String(x.rank)===k).length]))};
process.stdout.write(JSON.stringify({summary,entries:rows},null,2)+'\n');
if(duplicates.length)process.exitCode=1;
