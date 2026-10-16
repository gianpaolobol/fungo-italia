import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createAppleApi} from './app-store-connect.mjs';
const receipt=JSON.parse(await readFile('store-evidence/subscription-build.json','utf8'));
const APP='6821140326',VERSION='f3a1168b-ada0-4e69-abc9-e66ee9718d81';
if(receipt.appId!==APP||receipt.bundleId!=='it.fungoitalia.app'||receipt.productId!=='it.fungoitalia.premium.annual'||receipt.version!=='1.0.0'||!/^\d+$/.test(receipt.buildNumber)||Number(receipt.buildNumber)<=7||!/^\d+$/.test(receipt.storekitRunId)||receipt.producerRunId!==process.env.PRODUCER_RUN_ID||!/^[a-f0-9]{40}$/.test(receipt.sourceCommit)||!/^[a-f0-9]{64}$/.test(receipt.ipaSha256)||!Number.isFinite(Date.parse(receipt.createdAt)))throw Error('Invalid signed build receipt');
const source=await fetch('https://api.github.com/repos/gianpaolobol/fungo-italia/actions/runs/'+receipt.storekitRunId,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
if(!source.ok)throw Error('StoreKit evidence unavailable');
const run=await source.json();
if(run.name!=='Verify StoreKit purchase interface'||run.head_branch!=='main'||run.conclusion!=='success'||run.head_sha!==receipt.sourceCommit)throw Error('Signed source does not match successful StoreKit UI evidence');
const api=await createAppleApi();
const must=(r,op)=>{if(!r.ok)throw Error(op+' HTTP '+r.status+' '+(r.codes||[]).join(',')+' '+(r.details||[]).join(';'));return r;};
const app=must(await api('/v1/apps/'+APP),'Read app').data;
if(app.attributes.bundleId!==receipt.bundleId)throw Error('Unexpected app bundle');
const product=must(await api('/v1/subscriptions/6823502997'),'Read annual subscription').data;
if(product.attributes.productId!==receipt.productId||product.attributes.subscriptionPeriod!=='ONE_YEAR')throw Error('Annual product mismatch');
let build;
for(let attempt=0;attempt<30;attempt++){
 const result=must(await api('/v1/builds?filter[app]='+APP+'&filter[version]='+encodeURIComponent(receipt.buildNumber)+'&include=preReleaseVersion&limit=50'),'Read uploaded build');
 const matching=result.data.filter(b=>b.attributes.version===receipt.buildNumber&&result.included?.some(i=>i.type==='preReleaseVersions'&&i.id===b.relationships.preReleaseVersion?.data?.id&&i.attributes.version===receipt.version));
 if(matching.length>1)throw Error('Ambiguous Apple build');
 const candidate=matching[0];
 if(candidate){
  if(candidate.attributes.expired||!Number.isFinite(Date.parse(candidate.attributes.uploadedDate))||Date.parse(candidate.attributes.uploadedDate)<Date.parse(receipt.createdAt)-600000)throw Error('Unexpected or outdated Apple build');
  if(candidate.attributes.processingState==='INVALID')throw Error('Apple rejected build processing');
  if(candidate.attributes.processingState==='VALID'){build=candidate;break;}
 }
 if(attempt===29)throw Error('Apple processing still pending; rerun only this selection workflow after processing');
 console.log('Waiting for Apple build '+receipt.buildNumber+' processing');
 await new Promise(resolve=>setTimeout(resolve,20000));
}
const versions=must(await api('/v1/apps/'+APP+'/appStoreVersions?filter[platform]=IOS'),'Read app versions').data;
const version=versions.find(v=>v.id===VERSION&&v.attributes.versionString==='1.0'&&v.attributes.appStoreState==='PREPARE_FOR_SUBMISSION');
if(!version)throw Error('Initial App Store version is no longer editable; no selection changed');
must(await api('/v1/appStoreVersions/'+VERSION+'/relationships/build',{method:'PATCH',body:{data:{type:'builds',id:build.id}}}),'Associate verified subscription binary');
const selected=must(await api('/v1/appStoreVersions/'+VERSION+'/build'),'Verify selected build').data;
if(selected.id!==build.id||selected.attributes.version!==receipt.buildNumber||selected.attributes.processingState!=='VALID')throw Error('Apple selected build verification failed');
const result={appId:APP,appStoreVersionId:VERSION,buildId:build.id,buildNumber:receipt.buildNumber,processingState:selected.attributes.processingState,sourceCommit:receipt.sourceCommit,storekitRunId:receipt.storekitRunId,producerRunId:receipt.producerRunId,ipaSha256:receipt.ipaSha256,reviewSubmitted:false,checkedAt:new Date().toISOString()};
await mkdir('store-evidence',{recursive:true});
await writeFile('store-evidence/selected-subscription-build.json',JSON.stringify(result,null,2)+'\n');
console.log('APPLE_SUBSCRIPTION_BUILD_SELECTED '+JSON.stringify(result));
