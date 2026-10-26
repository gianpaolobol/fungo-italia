import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {validateAppleUpload,appleUploadArguments} from './upload-consolidated-apple.mjs';
const source='a'.repeat(40),sha=b=>createHash('sha256').update(b).digest('hex');
const evidence=Object.fromEntries(['native','ui','demo'].map(k=>[k,{sourceCommit:source,conclusion:'success',verified:true}]));
const receipt={sourceCommit:source,appId:'6821140326',bundleId:'it.fungoitalia.app',version:'1.1.0',buildNumber:'22',producerRunId:'123',testFlightOnly:true,diagnosticOnly:true,appStoreReady:false,nativeStorekitVerified:true,storekitUIVerified:true,ipaSha256:sha('ipa'),evidence};
test('new direct upload validates exact signed bytes/source and does not use EAS Submit',()=>{
 assert.doesNotThrow(()=>validateAppleUpload({receipt,source,main:source,runId:'123',ipaBytes:Buffer.from('ipa')}));
 const args=appleUploadArguments({ipa:'/runner/app.ipa',keyPath:'/runner/key.p8',keyId:'KEYID',issuer:'issuer'});
 assert.deepEqual(args,['altool','--upload-package','/runner/app.ipa','--api-key','KEYID','--api-issuer','issuer','--p8-file-path','/runner/key.p8']);
 for(const patch of [{source:'b'.repeat(40)},{main:'b'.repeat(40)},{runId:'124'},{ipaBytes:Buffer.from('mutated')},{receipt:{...receipt,appStoreReady:true}},{receipt:{...receipt,nativeStorekitVerified:false}},{receipt:{...receipt,evidence:{...evidence,ui:{...evidence.ui,conclusion:'failure'}}}}])assert.throws(()=>validateAppleUpload({receipt,source,main:source,runId:'123',ipaBytes:Buffer.from('ipa'),...patch}));
});
