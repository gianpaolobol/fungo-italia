import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
test('research ledger retains all179 original field gaps and exact S1 identities',()=>{
 const report=read('revisione/habitat-comparison-completion-20261026.json'),scope=read('src/data/curriculum-scope.json');
 assert.equal(report.baselineCommit,'c89d0a231106f3828b66da8125c73f6015edba50');assert.equal(report.items.length,179);
 assert.equal(report.items.filter(x=>x.field==='habitat').length,96);assert.equal(report.items.filter(x=>x.field==='lookalikes').length,83);
 assert.equal(new Set(report.items.map(x=>x.id+':'+x.field)).size,179);
 for(const row of report.items){const unit=scope.units.find(x=>x.id===row.id);assert.ok(unit);assert.equal(row.scientificName,unit.scientificName);assert.equal(row.rank,unit.rank);assert.equal(row.curriculumPage,unit.sourcePage);assert.ok(['internal-supported','external-supported','partial-scope','unresolved'].includes(row.status));assert.equal(row.independentReviewStatus,'not-attested');}
});
test('every claimed completion has field evidence and partial or absent evidence cannot become complete',()=>{
 const report=read('revisione/habitat-comparison-completion-20261026.json'),catalog=read('src/data/catalog.json');
 const course=read('src/data/course-sources.json'),sources=new Map([...course.documents,...course.externalReferences].map(x=>[x.sourceId,x]));
 for(const row of report.items){
  const card=catalog.find(x=>x.id===row.id);assert.ok(card);
  if(['internal-supported','external-supported','partial-scope'].includes(row.status)){
   assert.ok(row.evidence.length>0);assert.ok(card[row.field].length>0);
   for(const e of row.evidence){assert.ok(e.sourceId&&e.locator);assert.ok(card.sources.some(s=>s.sourceId===e.sourceId&&s.fields?.includes(row.field)));if(e.kind==='internal'&&e.page!==null){const source=sources.get(e.sourceId);assert.ok(source);assert.ok(Number.isInteger(e.page)&&e.page>0&&e.page<=source.pageCount);}}
  }
  if(row.status.endsWith('-supported'))assert.equal(row.scopeComplete,true);
  if(row.status==='partial-scope')assert.equal(row.scopeComplete,false);
  if(row.status==='unresolved')assert.equal(row.evidence.length,0);
 }
});
test('new supplementary evidence retains explicit mycological authority and pointwise claims',()=>{
 const report=read('revisione/habitat-comparison-completion-20261026.json'),supp=read('src/data/supplementary-literature.json');
 for(const row of report.items)for(const e of row.evidence.filter(x=>x.kind==='external')){
  const record=supp.records.find(x=>x.scientificName===row.scientificName);
  const source=record.sources.find(x=>x.sourceId===e.sourceId&&x.fields.includes(row.field));
  assert.ok(source.supportedClaim&&source.location);
  assert.ok(source.authority?.entity&&source.authority?.basis&&source.authority?.type);
  assert.match(source.authority.evidenceUrl,/^https:\/\//);
  assert.equal(source.reviewStatus,'source-consulted-pending-independent-review');
 }
});
test('follow-up accounts for each of the49 previously partial or unresolved fields and requires new evidence for closure',()=>{
 const followup=read('revisione/habitat-comparison-followup-20261026.json');
 const ledger=read('revisione/habitat-comparison-completion-20261026.json');
 assert.equal(followup.baselineCommit,'e5a4612f286010f8af26338316d47bbe749d4359');
 assert.equal(followup.items.length,49);assert.equal(new Set(followup.items.map(x=>x.id+':'+x.field)).size,49);
 for(const item of followup.items){
  assert.ok(['partial-scope','unresolved'].includes(item.previousStatus));
  const current=ledger.items.find(x=>x.id===item.id&&x.field===item.field);assert.ok(current);assert.equal(item.status,current.status);
  assert.ok(item.internalSearch.length>0);assert.ok(item.reason);
  if(item.status.endsWith('-supported')){assert.ok(item.newEvidence.length>0);assert.ok(item.scopeBasis);}
  for(const e of item.newEvidence)assert.ok(current.evidence.some(x=>x.sourceId===e.sourceId&&x.locator===e.locator));
 }
});
