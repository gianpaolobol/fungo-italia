import {test} from 'node:test';
import assert from 'node:assert/strict';
const api=await import('../server/play-billing/verify.mjs').catch(()=>({}));
const productId='it.fungoitalia.premium.annual',now=Date.parse('2026-10-27T00:00:00Z');
const valid=()=>({subscriptionState:'SUBSCRIPTION_STATE_ACTIVE',acknowledgementState:'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',lineItems:[{productId,expiryTime:'2027-10-27T00:00:00Z',offerDetails:{basePlanId:'annual'}}]});
test('Google verifier exists',()=>assert.equal(typeof api.verifyPurchase,'function'));
test('active, canceled and grace periods use authoritative unexpired annual line',async()=>{
 for(const state of ['ACTIVE','CANCELED','IN_GRACE_PERIOD']){
 const data=valid();data.subscriptionState='SUBSCRIPTION_STATE_'+state;
 const r=await api.verifyPurchase({purchaseToken:'token',nonce:'challenge'}, {get:async()=>data,acknowledge:async()=>assert.fail('already acknowledged'),now:()=>now});
 assert.equal(r.active,true);assert.equal(r.expiresAt,new Date(data.lineItems[0].expiryTime).toISOString());assert.equal(r.nonce,'challenge');
 }
});
test('Google timestamp offsets and fractional precision are normalized for Android API24',async()=>{
 const data=valid();data.lineItems[0].expiryTime='2027-10-27T02:00:00.123456+02:00';
 const r=await api.verifyPurchase({purchaseToken:'token',nonce:'challenge'}, {get:async()=>data,now:()=>now});
 assert.equal(r.expiresAt,'2027-10-27T00:00:00.123Z');
});
test('pending, hold, paused, revoked and expired never unlock',async()=>{
 for(const state of ['PENDING','ON_HOLD','PAUSED','EXPIRED','PENDING_PURCHASE_CANCELED','UNSPECIFIED']){
 const data=valid();data.subscriptionState='SUBSCRIPTION_STATE_'+state;
 const r=await api.verifyPurchase({purchaseToken:'token',nonce:'challenge'}, {get:async()=>data,acknowledge:async()=>assert.fail('inactive'),now:()=>now});assert.equal(r.active,false);assert.equal(r.expiresAt,null);
 }
});
test('wrong product, wrong plan, empty or malformed expiry fail closed',async()=>{
 for(const patch of [{productId:'other'},{offerDetails:{basePlanId:'monthly'}},{expiryTime:'bad'},{expiryTime:new Date(now).toISOString()}]){
 const data=valid();Object.assign(data.lineItems[0],patch);
 assert.equal((await api.verifyPurchase({purchaseToken:'token',nonce:'challenge'}, {get:async()=>data,acknowledge:async()=>assert.fail('invalid'),now:()=>now})).active,false);
 }
});
test('acknowledgment is followed by a fresh Google read that can revoke access',async()=>{
 const data=valid();data.acknowledgementState='ACKNOWLEDGEMENT_STATE_PENDING';let reads=0,acks=0;
 const r=await api.verifyPurchase({purchaseToken:'token',nonce:'challenge'}, {get:async()=>{reads++;return reads===1?data:{...valid(),subscriptionState:'SUBSCRIPTION_STATE_EXPIRED'};},acknowledge:async()=>{acks++;},now:()=>now});
 assert.equal(reads,2);assert.equal(acks,1);assert.equal(r.active,false);
});
test('Google failure never creates fallback access and client entitlement fields are ignored',async()=>{
 await assert.rejects(()=>api.verifyPurchase({purchaseToken:'token',nonce:'challenge'}, {get:async()=>{throw Error('unavailable');},now:()=>now}));
 const data={...valid(),subscriptionState:'SUBSCRIPTION_STATE_EXPIRED'};
 assert.equal((await api.verifyPurchase({purchaseToken:'token',nonce:'challenge',active:true,expiresAt:'2099-01-01'}, {get:async()=>data,now:()=>now})).active,false);
});
