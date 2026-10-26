import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createAppleUploadPlan,redactAppleLog} from './upload-owner-testflight.mjs';
const original=JSON.parse(await readFile(new URL('../docs/evidence/native-banner-20261026/consolidated-testflight.json',import.meta.url)));
const bytes=Buffer.from('synthetic signed IPA bytes used only for transport policy tests');
const sha=createHash('sha256').update(bytes).digest('hex');
const receipt={...original,ipaSha256:sha};
const config={ascAppId:'6821140326',appleTeamId:'BX9MDXAHKG',ascApiKeyId:'A1B2C3D4E5',ascApiKeyIssuerId:'11111111-2222-3333-4444-555555555555',ascApiKeyPath:'/tmp/owner key.p8'};
const input=()=>({receipt:structuredClone(receipt),sourceCommit:receipt.sourceCommit,producerRunId:receipt.producerRunId,ipaPath:'/tmp/signed owner.ipa',ipaBytes:bytes,submitConfig:{...config}});
test('Apple upload preserves exact signed payload and argument boundaries without a shell',()=>{
 const p=createAppleUploadPlan(input());
 assert.equal(p.command,'xcrun');
 assert.deepEqual(p.args,['altool','--upload-package','/tmp/signed owner.ipa','--api-key','A1B2C3D4E5','--api-issuer',config.ascApiKeyIssuerId,'--p8-file-path','/tmp/owner key.p8']);
 assert.equal(p.ipaSha256,sha);
});
test('changed signed bytes and cross-source or cross-producer receipts cannot upload',()=>{
 for(const change of [i=>i.ipaBytes=Buffer.from('changed'),i=>i.sourceCommit='f'.repeat(40),i=>i.producerRunId='1',i=>i.receipt.ipaSha256='f'.repeat(64)]){const i=input();change(i);assert.throws(()=>createAppleUploadPlan(i));}
});
test('all mandatory exact-source proofs and owner scientific scope remain required',()=>{
 for(const key of ['native','ui','demo'])for(const patch of [{verified:false},{conclusion:'failure'},{sourceCommit:'f'.repeat(40)},{id:0}]){const i=input();Object.assign(i.receipt.evidence[key],patch);assert.throws(()=>createAppleUploadPlan(i));}
 for(const change of [i=>i.receipt.scientificReview.publicWebAllowed=true,i=>i.receipt.appStoreReady=true,i=>i.receipt.testFlightOnly=false,i=>i.receipt.nativeStorekitVerified=false,i=>i.receipt.storekitUIVerified=false]){const i=input();change(i);assert.throws(()=>createAppleUploadPlan(i));}
});
test('wrong Apple app/team or malformed credential identity is rejected before uploader execution',()=>{
 for(const patch of [{ascAppId:'other'},{appleTeamId:'other'},{ascApiKeyId:'--unsafe'},{ascApiKeyIssuerId:'invalid'},{ascApiKeyPath:'relative.p8'}]){const i=input();Object.assign(i.submitConfig,patch);assert.throws(()=>createAppleUploadPlan(i));}
});
test('retained uploader diagnostics redact JWTs and private key material',()=>{
 const text='Accepted upload\neyJheader.eyJpayload.signature\n-----BEGIN PRIVATE KEY-----\nprivate material\n-----END PRIVATE KEY-----\nDone';
 const safe=redactAppleLog(text);assert.match(safe,/Accepted upload/);assert.match(safe,/Done/);assert.doesNotMatch(safe,/eyJheader|private material|BEGIN PRIVATE KEY/);
});
