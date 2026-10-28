import {test} from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync} from 'node:crypto';import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createGoogleApi} from '../server/play-billing/google.mjs';
const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
async function withApi(run,{canaryToken='license-test-token',status=200,ack='ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',testPurchase={}}={}){
 const dir=mkdtempSync(join(tmpdir(),'play-test-')),path=join(dir,'synthetic-key.json');let playReads=0;
 writeFileSync(path,JSON.stringify({type:'service_account',client_email:'synthetic@example.invalid',private_key:privateKey.export({type:'pkcs8',format:'pem'})}));
 const fetchImpl=async(url)=>{
  if(url==='https://oauth2.googleapis.com/token')return new Response(JSON.stringify({access_token:'synthetic',expires_in:3600}));
  assert.match(url,/androidpublisher.googleapis.com\/androidpublisher\/v3\/applications\/it.fungoitalia.app\/purchases\/subscriptionsv2\/tokens\/license-test-token$/);playReads++;
  return new Response(JSON.stringify({acknowledgementState:ack,testPurchase,lineItems:[{productId:'it.fungoitalia.premium.annual',offerDetails:{basePlanId:'annual'}}]}),{status});
 };
 try{await run(createGoogleApi({credentialPath:path,canaryToken,fetchImpl}),()=>playReads);}finally{rmSync(dir,{recursive:true});}
}
test('readiness proves Play read permission using an acknowledged license-test canary',()=>withApi(async(api,reads)=>{await api.ready();assert.equal(reads(),1);}));
test('OAuth success with missing Play rights cannot enable checkout',()=>withApi(async api=>assert.rejects(()=>api.ready()),{status:403}));
test('missing readiness purchase, unacknowledged purchase or non-test canary cannot enable checkout',async()=>{
 await withApi(async api=>assert.rejects(()=>api.ready()),{canaryToken:''});
 await withApi(async api=>assert.rejects(()=>api.ready()),{ack:'ACKNOWLEDGEMENT_STATE_PENDING'});
 await withApi(async api=>assert.rejects(()=>api.ready()),{testPurchase:null});
});
