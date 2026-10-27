import assert from 'node:assert/strict';
import {mkdir,readdir,writeFile} from 'node:fs/promises';import {join,dirname,resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
import {validateCandidate} from '../scripts/release-parity.mjs';
import {publicURL} from './paired-demo-policy.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export async function capturePreviousWeb({dir,fetcher=fetch}){
 await mkdir(dir,{recursive:true});assert.equal((await readdir(dir)).length,0,'Previous snapshot directory must be empty');
 const safe=p=>typeof p==='string'&&p&&!/[\\:%?#\x00-\x1f]/.test(p)&&p.split('/').every(s=>s&&s!=='.'&&s!=='..');
 async function get(path){assert(safe(path),'Unsafe previous manifest path');const url=new URL(path,publicURL);url.searchParams.set('previousSnapshot',String(Date.now()));const r=await fetcher(url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(45000)});assert(r.ok&&r.redirected===false&&r.url===url.href,'Previous public response unavailable or redirected: '+path+' HTTP '+String(r.status??'unknown')+' redirected='+String(r.redirected)+' received='+String(r.url));return Buffer.from(await r.arrayBuffer());}
 const metadata=await Promise.all(['build.json','file-manifest.json','release.json'].map(async p=>[p,await get(p)]));
 const map=Object.fromEntries(metadata),build=JSON.parse(map['build.json']),manifest=JSON.parse(map['file-manifest.json']),receipt=JSON.parse(map['release.json']);
 assert(/^[a-f0-9]{40}$/.test(build.sourceCommit??'')&&Array.isArray(manifest.files)&&manifest.files.length>0,'Previous manifest unavailable');
 for(const k of ['sourceCommit','version','webContentHash','iconSha256'])assert.equal(receipt[k],build[k],'Previous release/build identity differs: '+k);
 assert.equal(manifest.sourceCommit,build.sourceCommit);
 assert(manifest.files.every(f=>safe(f.path)&&!['build.json','file-manifest.json','release.json'].includes(f.path)),'Unsafe previous manifest path');
 for(const [p,b]of metadata)await writeFile(join(dir,p),b);
 let cursor=0,failure;
 await Promise.all(Array.from({length:Math.min(8,manifest.files.length)},async()=>{
  while(!failure&&cursor<manifest.files.length){const file=manifest.files[cursor++];try{const bytes=await get(file.path);assert(bytes.length===file.bytes&&hash(bytes)===file.sha256,'Previous public bytes differ: '+file.path);const path=join(dir,file.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes);}catch(e){failure??=e;}}
 }));
 if(failure)throw failure;
 await validateCandidate({dir,expectedSha:build.sourceCommit,iconPath:join(dir,'icon.png')});
 return {sourceCommit:build.sourceCommit,version:build.version,buildNumber:receipt.buildNumber,webContentHash:build.webContentHash,iconSha256:build.iconSha256,files:manifest.files.length,receiptSha256:hash(map['release.json']),archivedAt:new Date().toISOString(),rollbackRequiresNewPairedBuild:true};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const dir=process.argv[2];assert(dir,'Previous snapshot directory required');const r=await capturePreviousWeb({dir});await writeFile(join(process.env.RUNNER_TEMP,'paired-previous-web-proof.json'),JSON.stringify(r,null,2)+'\n');console.log('PREVIOUS_PUBLIC_BYTES_ARCHIVED '+JSON.stringify(r));}
