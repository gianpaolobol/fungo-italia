import {createSign} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PACKAGE,PRODUCT,PLAN} from './verify.mjs';
const TOKEN_URL='https://oauth2.googleapis.com/token';
// Keys remain in the server's secret mount, never in the mobile app or repository.
export function createGoogleApi({credentialPath=process.env.GOOGLE_APPLICATION_CREDENTIALS,canaryToken=process.env.FUNGO_PLAY_CANARY_TOKEN,fetchImpl=fetch,now=Date.now}={}){
 if(!credentialPath)throw Error('Google credentials not configured');
 const key=JSON.parse(readFileSync(credentialPath,'utf8'));
 if(key.type!=='service_account'||typeof key.client_email!=='string'||typeof key.private_key!=='string')throw Error('Invalid Google service account');
 let cached=null,pending=null;
 async function token(){
  if(cached&&cached.expires>now()+60000)return cached.value;
  if(pending)return pending;
  pending=(async()=>{
   const iat=Math.floor(now()/1000);
   const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
   const body=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:key.client_email,scope:'https://www.googleapis.com/auth/androidpublisher',aud:TOKEN_URL,iat,exp:iat+3600});
   const signature=createSign('RSA-SHA256').update(body).sign(key.private_key,'base64url');
   const r=await fetchImpl(TOKEN_URL,{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:body+'.'+signature})});
   if(!r.ok)throw Error('Google authentication unavailable');
   const result=await r.json();
   if(typeof result.access_token!=='string'||!Number.isFinite(result.expires_in)||result.expires_in<=0)throw Error('Invalid Google authentication response');
   cached={value:result.access_token,expires:now()+result.expires_in*1000};return cached.value;
  })();
  try{return await pending;}finally{pending=null;}
 }
 async function request(path,method='GET'){
  const r=await fetchImpl('https://androidpublisher.googleapis.com/androidpublisher/v3/applications/'+PACKAGE+path,{method,redirect:'error',signal:AbortSignal.timeout(8000),headers:{Authorization:'Bearer '+await token(),'Content-Type':'application/json'},...(method==='POST'?{body:'{}'}:{})});
  // Never include response bodies or URLs containing purchase tokens in errors/logs.
  if(!r.ok)throw Error('Google purchase verification unavailable');
  return method==='GET'?r.json():undefined;
 }
 const get=purchaseToken=>request('/purchases/subscriptionsv2/tokens/'+encodeURIComponent(purchaseToken));
 return {ready:async()=>{
  if(typeof canaryToken!=='string'||!canaryToken||canaryToken.length>8192)throw Error('License-test readiness not configured');
  const proof=await get(canaryToken);
  if(!proof?.testPurchase||proof.acknowledgementState!=='ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED'||!proof.lineItems?.some(x=>x.productId===PRODUCT&&x.offerDetails?.basePlanId===PLAN))throw Error('License-test verification not qualified');
 },get,acknowledge:purchaseToken=>request('/purchases/subscriptions/'+PRODUCT+'/tokens/'+encodeURIComponent(purchaseToken)+':acknowledge','POST')};
}
