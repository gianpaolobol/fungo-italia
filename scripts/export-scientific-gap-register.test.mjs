import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('gap export binds every checked unit to the exact founding page and retains strict blockers',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'fungo-gaps-'));
 try{
  const run=spawnSync(process.execPath,['scripts/export-scientific-gap-register.mjs',dir,'--strict'],{encoding:'utf8'});
  assert.equal(run.status,1,run.stderr);
  const report=JSON.parse(await readFile(join(dir,'scientific-gap-register.json'),'utf8'));
  const scope=JSON.parse(await readFile('src/data/curriculum-scope.json','utf8'));
  const catalog=JSON.parse(await readFile('src/data/catalog.json','utf8'));
  assert.equal(report.checked,catalog.length);assert.equal(report.ready,0);assert.equal(report.blocked,catalog.length);
  assert.equal(report.unmatchedCurriculum,0);
  assert.deepEqual(report.items.map(x=>x.id),catalog.map(x=>x.id));
  for(const item of report.items){const unit=scope.units.find(x=>x.id===item.id);assert.ok(unit);assert.equal(item.rank,unit.rank);assert.equal(item.curriculumLevel,unit.level);assert.equal(item.curriculumPage,unit.sourcePage);assert.equal(item.curriculumMatched,true);assert.ok(item.gaps.includes('independent-review-not-attested'));}
  const csv=await readFile(join(dir,'scientific-gap-register.csv'),'utf8');
  assert.ok(csv.split('\n')[0].includes('"curriculumLevel","curriculumPage","curriculumMatched"'));
 }finally{await rm(dir,{recursive:true,force:true});}
});
