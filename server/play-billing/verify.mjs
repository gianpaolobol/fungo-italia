export const PACKAGE='it.fungoitalia.app';
export const PRODUCT='it.fungoitalia.premium.annual';
export const PLAN='annual';
const entitled=new Set(['SUBSCRIPTION_STATE_ACTIVE','SUBSCRIPTION_STATE_CANCELED','SUBSCRIPTION_STATE_IN_GRACE_PERIOD']);
function expiry(data,now){
 if(!entitled.has(data?.subscriptionState)||!Array.isArray(data.lineItems))return null;
 const dates=data.lineItems.filter(x=>x.productId===PRODUCT&&x.offerDetails?.basePlanId===PLAN&&typeof x.expiryTime==='string'&&Number.isFinite(Date.parse(x.expiryTime))&&Date.parse(x.expiryTime)>now).map(x=>x.expiryTime);
 const selected=dates.sort((a,b)=>Date.parse(b)-Date.parse(a))[0];
 return selected?new Date(selected).toISOString():null;
}
export async function verifyPurchase(input,{get,acknowledge,now=Date.now}){
 if(typeof input?.purchaseToken!=='string'||!input.purchaseToken||input.purchaseToken.length>8192||typeof input.nonce!=='string'||input.nonce.length<8||input.nonce.length>128)throw Error('Invalid request');
 let data=await get(input.purchaseToken);
 if(expiry(data,now())&&data.acknowledgementState==='ACKNOWLEDGEMENT_STATE_PENDING'){
  await acknowledge(input.purchaseToken);
  data=await get(input.purchaseToken);
 }
 const expiresAt=data?.acknowledgementState==='ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED'?expiry(data,now()):null;
 return {active:expiresAt!==null,productId:PRODUCT,expiresAt,checkedAt:new Date(now()).toISOString(),nonce:input.nonce};
}
