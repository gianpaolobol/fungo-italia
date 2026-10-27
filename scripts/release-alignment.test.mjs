import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateRelease,compareRelease,checkRelease,prepareWebUpdate} from '../lib/release-alignment.mjs';
const local={sourceCommit:'a'.repeat(40),version:'1.1.0',dirty:false};
const report={schemaVersion:1,sourceCommit:local.sourceCommit,version:'1.1.0',buildNumber:'15',iconSha256:'b'.repeat(64),webContentHash:'c'.repeat(64),appleBuildId:'a8152729-e1a2-47a9-9884-ef577d0436a2',processingState:'VALID',internalBuildState:'IN_BETA_TESTING',testFlightOnly:true,diagnosticOnly:true};
test('confirmed same clean source is aligned; changed source offers update',()=>{
 assert.equal(compareRelease(local,report).status,'aligned');
 assert.equal(compareRelease(local,{...report,sourceCommit:'d'.repeat(40)}).status,'update-available');
 assert.equal(compareRelease(local,{...report,internalBuildState:'READY_FOR_BETA_TESTING'}).status,'aligned');
});
test('dirty or unstamped source cannot claim alignment or an upgrade path',()=>{
 for(const value of [{...local,dirty:true},{...local,dirty:undefined},{version:'1.1.0'},null])assert.equal(compareRelease(value,report).status,'unknown');
});
test('malformed or unconfirmed release cannot claim alignment or offer update',()=>{
 const malformed=[null,[],{},...Object.keys(report).map(key=>({...report,[key]:undefined})),{...report,schemaVersion:2},{...report,sourceCommit:'a'.repeat(39)},{...report,iconSha256:'z'.repeat(64)},{...report,webContentHash:'bad'},{...report,buildNumber:15},{...report,buildNumber:'0'},{...report,version:''},{...report,appleBuildId:'unverified'},{...report,processingState:'PROCESSING'},{...report,internalBuildState:'FAILED'},{...report,testFlightOnly:false},{...report,diagnosticOnly:'true'}];
 for(const value of malformed){assert.equal(validateRelease(value),null);assert.equal(compareRelease(local,value).status,'unknown');}
});
test('offline and HTTP or JSON failure replace stale aligned state with unknown',async()=>{
 for(const fetcher of [async()=>{throw Error('offline');},async()=>({ok:false}),async()=>({ok:true,json:async()=>{throw Error('invalid JSON');}})])assert.equal((await checkRelease(local,{fetcher})).status,'unknown');
});
test('online check bypasses caches and validates body before alignment',async()=>{
 let options;
 const result=await checkRelease(local,{fetcher:async(url,init)=>{assert.equal(url,'https://gianpaolobol.github.io/fungo-italia/release.json');options=init;return {ok:true,json:async()=>report};}});
 assert.equal(result.status,'aligned');assert.equal(options.cache,'no-store');assert.ok(options.signal);
});
test('a stuck network or JSON body is bounded even if transport ignores abort',async()=>{
 for(const fetcher of [()=>new Promise(()=>{}),async()=>({ok:true,json:()=>new Promise(()=>{})})])assert.equal((await checkRelease(local,{fetcher,timeoutMs:10})).status,'unknown');
});
test('manual web update waits for worker activation before allowing reload',async()=>{
 const worker=new EventTarget();worker.state='installed';worker.postMessage=message=>{assert.deepEqual(message,{type:'ACTIVATE_UPDATE'});};
 const registration={update:async()=>{},waiting:worker};
 let done=false;const pending=prepareWebUpdate({getRegistration:async()=>registration},100).then(()=>{done=true;});
 await new Promise(resolve=>setTimeout(resolve,5));assert.equal(done,false);
 worker.state='activated';worker.dispatchEvent(new Event('statechange'));await pending;assert.equal(done,true);
});
test('manual web update rejects absent or stalled worker without reloading',async()=>{
 await assert.rejects(prepareWebUpdate({getRegistration:async()=>undefined},10));
 await assert.rejects(prepareWebUpdate({getRegistration:()=>new Promise(()=>{})},10));
});
test('release hashes must be scalar strings and inconsistent same-source version stays unknown',()=>{
 for(const key of ['sourceCommit','iconSha256','webContentHash','appleBuildId'])assert.equal(validateRelease({...report,[key]:[report[key]]}),null);
 assert.equal(compareRelease({...local,version:'1.0.0'},report).status,'unknown');
});

test('a web-only receipt never asserts new TestFlight alignment',()=>{
 const web={schemaVersion:2,distribution:'web-only',sourceCommit:local.sourceCommit,version:local.version,iconSha256:report.iconSha256,webContentHash:report.webContentHash,iosUpdatePendingOwnerConfirmation:true,independentReleaseReady:true,appStoreReady:false};
 assert.equal(compareRelease(local,web).status,'web-current');
 assert.equal(compareRelease({...local,sourceCommit:'d'.repeat(40)},web).status,'update-available');
 for(const patch of [{iosUpdatePendingOwnerConfirmation:false},{independentReleaseReady:false},{appleBuildId:report.appleBuildId},{buildNumber:'24'},{appStoreReady:true}])assert.equal(validateRelease({...web,...patch}),null);
});

test('explicitly owner-approved web beta remains unpaired and never claims independent review',()=>{
 const web={schemaVersion:2,distribution:'web-only',sourceCommit:local.sourceCommit,version:local.version,iconSha256:report.iconSha256,webContentHash:report.webContentHash,iosUpdatePendingOwnerConfirmation:true,independentReleaseReady:false,appStoreReady:false,certified:false,webDistribution:{scope:'owner-approved-public-web-beta',reviewType:'owner-review',certified:false,independentReviewComplete:false,authorizationSha256:'2f0a6d04f66f72da2ab812be2075045507853da1d861037458f69b041180790c',scientificContentDigest:'85efde0ea64d6f3896637d3e1002c3c2586effbcef918f6fa375d1e8d0cae8df',approvedOn:'2026-10-27'}};
 assert.equal(compareRelease(local,web).status,'web-current');
 for(const patch of [{independentReleaseReady:true},{certified:true},{appStoreReady:true},{appleBuildId:report.appleBuildId},{webDistribution:{...web.webDistribution,authorizationSha256:'f'.repeat(64)}},{webDistribution:{...web.webDistribution,independentReviewComplete:true}}])assert.equal(validateRelease({...web,...patch}),null);
});
