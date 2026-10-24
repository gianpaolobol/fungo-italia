import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as content from './atlas-content.mjs';
const foundations=JSON.parse(readFileSync('src/data/internal-foundations.json','utf8'));
test('web foundation guard accepts additional course sources while retaining both original authorities',()=>{
 assert.equal(typeof content.hasRequiredInternalFoundations,'function');
 assert.equal(content.hasRequiredInternalFoundations(foundations),true);
 const original=structuredClone(foundations);
 original.documents=original.documents.slice(0,2);
 assert.equal(content.hasRequiredInternalFoundations(original),true);
});
test('web foundation guard rejects lost or substituted authorities, duplicates and public internal sources',()=>{
 assert.equal(typeof content.hasRequiredInternalFoundations,'function');
 for(const change of [
  f=>{f.documents=f.documents.filter(d=>!d.sourceId.startsWith('S1-'));},
  f=>{f.documents[1].sourceId='substitute-guide';},
  f=>{f.documents.push({...f.documents[0]});},
  f=>{f.documents[2].visibility='public';},
  f=>{f.rules.foodClaimsRequirePointwiseGuideEvidence=false;},
  f=>{f.documents[0].role='toxicology-reference';}
 ]){
  const invalid=structuredClone(foundations);change(invalid);
  assert.equal(content.hasRequiredInternalFoundations(invalid),false);
 }
 assert.equal(content.hasRequiredInternalFoundations(null),false);
});
