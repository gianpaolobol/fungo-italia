import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,lstat,mkdir,copyFile,chmod,rm} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {assertOwnerScienceReceipt,verifyOwnerBetaScience} from './internal-beta-science.mjs';
import {candidateReceipt} from './consolidated-evidence.mjs';
import {createAppleApi} from './app-store-connect.mjs';
import {preflightAudience} from './consolidated-beta-audience.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function createAppleUploadPlan({receipt,sourceCommit,producerRunId,ipaPath,ipaBytes,submitConfig:c}){
 assert(/^[a-f0-9]{40}$/.test(sourceCommit||'')&&receipt?.sourceCommit===sourceCommit,'Exact signed application source required');
 assert(/^[1-9]\d*$/.test(producerRunId||'')&&receipt.producerRunId===producerRunId,'Exact signed producer required');
 assert(receipt.appId==='6821140326'&&receipt.bundleId==='it.fungoitalia.app'&&receipt.version==='1.1.0'&&/^[1-9]\d*$/.test(receipt.buildNumber||''),'Unexpected signed build identity');
 assert(receipt.testFlightOnly===true&&receipt.diagnosticOnly===true&&receipt.appStoreReady===false&&receipt.nativeStorekitVerified===true&&receipt.storekitUIVerified===true,'Owner-only beta scope and purchase proofs required');
 assertOwnerScienceReceipt(receipt,receipt.scientificReview);
 for(const [key,path]of Object.entries({native:'subscription-storekit-tests.yml',ui:'subscription-storekit-ui.yml',demo:'agaricus-demo-ui.yml'})){
  const p=receipt.evidence?.[key];assert(p?.sourceCommit===sourceCommit&&p.path==='.github/workflows/'+path&&p.verified===true&&p.conclusion==='success'&&Number.isSafeInteger(p.id)&&p.id>0,'Mandatory exact-source proof missing: '+key);
 }
 assert(typeof ipaPath==='string'&&ipaPath.startsWith('/')&&Buffer.isBuffer(ipaBytes)&&/^[a-f0-9]{64}$/.test(receipt.ipaSha256||'')&&hash(ipaBytes)===receipt.ipaSha256,'Signed IPA bytes differ from provenance');
 assert(c?.ascAppId==='6821140326'&&c.appleTeamId==='BX9MDXAHKG'&&/^[A-Z0-9]{10}$/.test(c.ascApiKeyId||'')&&/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(c.ascApiKeyIssuerId||'')&&typeof c.ascApiKeyPath==='string'&&c.ascApiKeyPath.startsWith('/'),'Unexpected Apple upload target or credential identity');
 return {command:'xcrun',args:['altool','--upload-package',ipaPath,'--api-key',c.ascApiKeyId,'--api-issuer',c.ascApiKeyIssuerId,'--p8-file-path',c.ascApiKeyPath],ipaSha256:receipt.ipaSha256};
}
export function redactAppleLog(value){
 return String(value).replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,'[PRIVATE KEY REDACTED]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[JWT REDACTED]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL REDACTED]');
}
async function main(){
 const temp=process.env.RUNNER_TEMP,source=process.env.GITHUB_SHA;
 assert(temp?.startsWith('/')&&process.env.GITHUB_REPOSITORY==='gianpaolobol/fungo-italia','Authorized runner required');
 assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),source,'Runner source changed');
 async function gh(path){const r=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+path,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(45000)});assert(r.ok,'GitHub proof unavailable');return r.json();}
 async function current(){assert.equal((await gh('/git/ref/heads/main')).object.sha,source,'Main advanced; refuse stale upload');}
 await current();
 const path=join(temp,'consolidated-build.json'),receipt=JSON.parse(await readFile(path,'utf8'));
 const science=await verifyOwnerBetaScience(source);assertOwnerScienceReceipt(receipt,science);assert.deepEqual(science,receipt.scientificReview,'Scientific review changed before upload');
 const runs=await Promise.all(['native','ui','demo'].map(k=>gh('/actions/runs/'+receipt.evidence[k].id)));
 assert.deepEqual(receipt.evidence,candidateReceipt({sha:source,native:runs[0],ui:runs[1],demo:runs[2]}).evidence);
 const api=await createAppleApi();await preflightAudience(api);
 const existing=await api('/v1/builds?filter[app]=6821140326&filter[version]='+encodeURIComponent(receipt.buildNumber)+'&include=preReleaseVersion&limit=200');
 assert(existing.ok&&!existing.links?.next&&Array.isArray(existing.data),'Complete Apple duplicate lookup required');
 for(const b of existing.data)assert(b.attributes?.version===receipt.buildNumber&&existing.included?.some(v=>v.type==='preReleaseVersions'&&v.id===b.relationships?.preReleaseVersion?.data?.id&&typeof v.attributes?.version==='string'),'Apple duplicate lookup returned incomplete version identity');
 assert(!existing.data.some(b=>existing.included?.some(v=>v.type==='preReleaseVersions'&&v.id===b.relationships.preReleaseVersion?.data?.id&&v.attributes.version===receipt.version)),'Apple already received this build; audit it before any second upload');
 const c=JSON.parse(await readFile('eas.json','utf8')).submit.production.ios;
 assert.equal(c.ascApiKeyPath,join(temp,'fungo-asc-submit.p8'),'Temporary prepared key required');
 const key=await lstat(c.ascApiKeyPath);assert(key.isFile()&&!key.isSymbolicLink(),'Private key must be a regular temporary file');
 const ipaPath=join(temp,'fungo-consolidated.ipa'),ipa=await lstat(ipaPath);assert(ipa.isFile()&&!ipa.isSymbolicLink(),'Signed IPA must be a regular file');
 const ipaBytes=await readFile(ipaPath);createAppleUploadPlan({receipt,sourceCommit:source,producerRunId:process.env.GITHUB_RUN_ID,ipaPath,ipaBytes,submitConfig:c});
 const keys=join(temp,'private_keys');await mkdir(keys,{recursive:true,mode:0o700});const directory=await lstat(keys);assert(directory.isDirectory()&&!directory.isSymbolicLink(),'Private key directory must be isolated');
 try{
  const target=join(keys,'AuthKey_'+c.ascApiKeyId+'.p8');await copyFile(c.ascApiKeyPath,target);await chmod(target,0o600);
  const plan=createAppleUploadPlan({receipt,sourceCommit:source,producerRunId:process.env.GITHUB_RUN_ID,ipaPath,ipaBytes,submitConfig:{...c,ascApiKeyPath:target}});
  const help=spawnSync('xcrun',['altool','--help'],{encoding:'utf8',timeout:60000});
  assert(!help.error&&help.status===0&&['--upload-package','--api-key','--api-issuer','--p8-file-path'].every(flag=>((help.stdout||'')+(help.stderr||'')).includes(flag)),'Modern Apple uploader unavailable');
  await current();
  const result=spawnSync(plan.command,plan.args,{cwd:temp,env:{...process.env,API_PRIVATE_KEYS_DIR:keys},encoding:'utf8',timeout:20*60000,maxBuffer:10*1024*1024});
  const log=redactAppleLog((result.stdout||'')+'\n'+(result.stderr||''));await writeFile(join(temp,'apple-upload.log'),log,{mode:0o600});console.log(log);
  assert(!result.error&&result.status===0,'Apple uploader failed; inspect retained redacted log');
  receipt.upload={method:'Apple altool --upload-package',ipaSha256:plan.ipaSha256,submittedAt:new Date().toISOString()};
  await writeFile(path,JSON.stringify(receipt,null,2)+'\n');
 }finally{await rm(keys,{recursive:true,force:true});}
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)main().catch(error=>{console.error(redactAppleLog(error.message));process.exitCode=1;});
