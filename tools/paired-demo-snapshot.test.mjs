import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {contentHash} from '../scripts/release-parity.mjs';
import {capturePreviousWeb} from './paired-demo-snapshot.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),source='a'.repeat(40);
async function fixture(fn){
 const dir=await mkdtemp(join(tmpdir(),'paired-previous-'));const data={'icon.png':'icon','index.html':'app','sw.js':'worker'};
 const files=Object.entries(data).map(([path,b])=>({path,bytes:Buffer.byteLength(b),sha256:hash(b)})).sort((a,b)=>a.path.localeCompare(b.path));
 const build={schemaVersion:1,sourceCommit:source,version:'1.1.0',iconSha256:hash('icon'),webContentHash:contentHash(files)};
 Object.assign(data,{'build.json':JSON.stringify(build),'file-manifest.json':JSON.stringify({schemaVersion:1,sourceCommit:source,webContentHash:build.webContentHash,files}),'release.json':JSON.stringify({...build,buildNumber:'19'})});
 const fetcher=async(url,options)=>{assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');return {ok:true,redirected:false,url:String(url),arrayBuffer:async()=>Buffer.from(data[new URL(url).pathname.split('/').pop()])};};
 try{await fn({dir,data,fetcher});}finally{await rm(dir,{force:true,recursive:true});}
}
test('previous public bytes and original receipt are preserved as a verified immutable snapshot',()=>fixture(async({dir,fetcher})=>{
 const r=await capturePreviousWeb({dir,fetcher});assert.equal(r.sourceCommit,source);assert.equal(r.files,3);assert.equal(await readFile(join(dir,'index.html'),'utf8'),'app');
}));
test('corrupt previous assets, source mismatch and unsafe manifest paths block archival',async()=>{
 for(const mode of ['asset','source','path'])await fixture(async({dir,data,fetcher})=>{
  if(mode==='asset')data['icon.png']='corrupted';
  if(mode==='source'){const r=JSON.parse(data['release.json']);r.sourceCommit='b'.repeat(40);data['release.json']=JSON.stringify(r);}
  if(mode==='path'){const m=JSON.parse(data['file-manifest.json']);m.files[0].path='../escape';data['file-manifest.json']=JSON.stringify(m);}
  await assert.rejects(capturePreviousWeb({dir,fetcher}));
 });
});
