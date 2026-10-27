import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,rm,mkdir} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createReplayOrigin,validateReplayArtifact} from './paired-demo-replay.mjs';
test('archived replay changes actual bytes on one loopback origin and genuinely cuts/restores that origin',async()=>{
 const root=await mkdtemp(join(tmpdir(),'paired-replay-'));const old=join(root,'old'),next=join(root,'next');await mkdir(old);await mkdir(next);await writeFile(join(old,'index.html'),'original old document');await writeFile(join(next,'index.html'),'verified new document');
 const r=await createReplayOrigin({oldDir:old,newDir:next});try{
  assert.equal(await(await fetch(r.url)).text(),'original old document');await r.promote();assert.equal(await(await fetch(r.url)).text(),'verified new document');
  assert.equal((await fetch(new URL('/outside',r.url))).status,404);assert.equal((await fetch(r.control+'/stop')).status,200);await assert.rejects(fetch(r.url));assert.equal((await fetch(r.control+'/start')).status,200);assert.equal(await(await fetch(r.url)).text(),'verified new document');
 }finally{await r.close();await rm(root,{recursive:true,force:true});}
});
test('replay accepts only the pinned original previous-public archive metadata',()=>{
 const sha='a'.repeat(64),meta={id:12,name:'Paired-previous-web-rollback-snapshot',expired:false,digest:'sha256:'+sha,size_in_bytes:123,workflow_run:{id:34,head_branch:'main'}};
 assert.doesNotThrow(()=>validateReplayArtifact(meta,12,sha));for(const patch of [{id:13},{expired:true},{name:'other'},{digest:'sha256:'+'b'.repeat(64)},{workflow_run:{id:34,head_branch:'branch'}},{size_in_bytes:0}])assert.throws(()=>validateReplayArtifact({...meta,...patch},12,sha));
});
