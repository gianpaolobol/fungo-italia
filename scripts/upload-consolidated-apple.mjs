import assert from 'node:assert/strict';import {readFile,writeFile,mkdir,copyFile,chmod} from 'node:fs/promises';import {join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {execFileSync,spawnSync} from 'node:child_process';
import {verifyOwnerBetaScience,assertOwnerScienceReceipt} from './internal-beta-science.mjs';
import {createAppleApi} from './app-store-connect.mjs';import {preflightAudience} from './consolidated-beta-audience.mjs';
export function validateAppleUpload({receipt:r,source,main,runId,ipaBytes}){
 assert(/^[a-f0-9]{40}$/.test(source??'')&&main===source&&r?.sourceCommit===source,'Exact current source required');
 for(const [k,v]of Object.entries({appId:'6821140326',bundleId:'it.fungoitalia.app',version:'1.1.0',testFlightOnly:true,diagnosticOnly:true,appStoreReady:false,nativeStorekitVerified:true,storekitUIVerified:true,producerRunId:String(runId)}))assert.equal(r[k],v,'Unexpected signed receipt '+k);
 assert(/^[1-9]\d*$/.test(r.buildNumber??''),'Signed build number required');
 assert.equal(createHash('sha256').update(ipaBytes).digest('hex'),r.ipaSha256,'Signed IPA bytes changed');
 for(const k of ['native','ui','demo'])assert(r.evidence?.[k]?.sourceCommit===source&&r.evidence[k].verified===true&&r.evidence[k].conclusion==='success','Successful exact-source proof required: '+k);
}
export function appleUploadArguments({ipa,keyPath,keyId,issuer}){assert([ipa,keyPath,keyId,issuer].every(v=>typeof v==='string'&&v.length));return ['altool','--upload-package',ipa,'--api-key',keyId,'--api-issuer',issuer,'--p8-file-path',keyPath];}
async function main(){
 const temp=process.env.RUNNER_TEMP;assert(temp?.startsWith('/'),'Runner isolation required');
 const source=process.env.GITHUB_SHA,receipt=JSON.parse(await readFile(join(temp,'consolidated-build.json'),'utf8')),ipa=join(temp,'fungo-consolidated.ipa');
 const bytes=await readFile(ipa);
 assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),source,'Checked-out source differs');
 async function currentMain(){const r=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/git/ref/heads/main',{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(45000)});assert(r.ok,'Current main unavailable');return (await r.json()).object.sha;}
 validateAppleUpload({receipt,source,main:await currentMain(),runId:process.env.GITHUB_RUN_ID,ipaBytes:bytes});
 const science=await verifyOwnerBetaScience(source);assertOwnerScienceReceipt(receipt,science);assert.deepEqual(receipt.scientificReview,science,'Science changed before direct upload');
 const api=await createAppleApi();await preflightAudience(api);
 const found=await api('/v1/builds?filter[app]=6821140326&filter[version]='+receipt.buildNumber+'&include=preReleaseVersion&limit=10');assert(found.ok&&!found.links?.next,'Complete Apple build lookup required');
 assert(!found.data.some(b=>found.included?.some(v=>v.type==='preReleaseVersions'&&v.id===b.relationships.preReleaseVersion?.data?.id&&v.attributes.version===receipt.version)),'Apple already has this build; verify original delivery before any retry');
 const c=JSON.parse(await readFile('eas.json','utf8')).submit?.production?.ios;assert(c?.ascAppId===receipt.appId&&c.appleTeamId==='BX9MDXAHKG','Apple app/team differs');
 assert.equal(resolve(c.ascApiKeyPath),join(temp,'fungo-asc-submit.p8'),'Use only prepared runner key');
 const keys=join(temp,'private_keys');await mkdir(keys,{recursive:true,mode:0o700});const keyPath=join(keys,'AuthKey_'+c.ascApiKeyId+'.p8');await copyFile(c.ascApiKeyPath,keyPath);await chmod(keyPath,0o600);
 const help=spawnSync('xcrun',['altool','--help'],{encoding:'utf8',timeout:60000});assert(!help.error&&help.status===0,'Apple uploader unavailable');const supported=(help.stdout||'')+(help.stderr||'');
 const args=appleUploadArguments({ipa,keyPath,keyId:c.ascApiKeyId,issuer:c.ascApiKeyIssuerId});for(const flag of ['--upload-package','--api-key','--api-issuer','--p8-file-path'])assert(supported.includes(flag),'Actual Apple uploader does not support '+flag);
 assert.equal(await currentMain(),source,'Main advanced before Apple upload');
 const result=spawnSync('xcrun',args,{cwd:temp,env:{...process.env,API_PRIVATE_KEYS_DIR:keys},encoding:'utf8',timeout:20*60000,maxBuffer:10*1024*1024});
 const redact=s=>s.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[JWT REDACTED]').replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,'[PRIVATE KEY REDACTED]');
 const log=redact((result.stdout||'')+'\n'+(result.stderr||''));await writeFile(join(temp,'apple-upload.log'),log);console.log(log);
 assert(!result.error&&result.status===0,'Apple upload failed; preserve signed IPA and inspect retained log before retry');
 receipt.uploadTransport={method:'Apple altool --upload-package; original EAS-signed IPA',uploaderRunId:process.env.GITHUB_RUN_ID,sourceCommit:source,ipaSha256:receipt.ipaSha256,uploadedAt:new Date().toISOString(),easSubmissionStarted:false};
 await writeFile(join(temp,'consolidated-build.json'),JSON.stringify(receipt,null,2)+'\n');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await main();
