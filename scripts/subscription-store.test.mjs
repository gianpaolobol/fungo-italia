import {test} from 'node:test';import assert from 'node:assert/strict';
const api=await import('../lib/subscriptionStore.ts').catch(()=>({}));
test('Android directs management to Google Play and never Apple EULA',()=>{
 const copy=api.subscriptionStore('android');assert.match(copy.manage,/play.google.com/);assert.match(copy.payment,/Google Play/);assert.doesNotMatch(copy.terms,/apple/);assert.doesNotMatch(copy.payment,/24 ore/);
});
test('iOS retains its exact Apple terms and management destinations',()=>{
 const copy=api.subscriptionStore('ios');assert.equal(copy.manage,'https://apps.apple.com/account/subscriptions');assert.equal(copy.terms,'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');assert.match(copy.payment,/24 ore/);
});
