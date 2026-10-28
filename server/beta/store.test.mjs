import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {testDb} from './test-db.mjs';

let createBetaStore;
try{({createBetaStore}=await import('./store.mjs'));}catch{}
const DAY=86400000;
async function fixture(t,path){assert.equal(typeof createBetaStore,'function','beta store not implemented');const db=testDb(path);t.after(()=>db.close());let now=Date.parse('2026-10-28T12:00:00Z');const store=createBetaStore({db,clock:()=>now});return{db,store,now:()=>now,advance:ms=>{now+=ms;}};}
test('invitation redeems once and expires exactly 90 days from first activation',async t=>{
 const f=await fixture(t),i=await f.store.invite({email:' Tester@example.test '});f.advance(DAY);
 const r=await f.store.redeem({inviteToken:i.inviteToken});assert.equal(r.active,true);assert.equal(Date.parse(r.expiresAt),f.now()+90*DAY);
 await assert.rejects(f.store.redeem({inviteToken:i.inviteToken}),/invito/i);
 const c=await f.store.check({sessionToken:r.sessionToken});assert.equal(c.maxAgeSeconds,60);assert.equal('email' in c,false);
 f.advance(90*DAY);assert.equal((await f.store.check({sessionToken:r.sessionToken})).active,false);
});
test('unredeemed invitation expires at seven days without starting beta',async t=>{
 const f=await fixture(t),i=await f.store.invite({email:'tester@example.test'});f.advance(7*DAY);await assert.rejects(f.store.redeem({inviteToken:i.inviteToken}),/invito/i);
 assert.equal((await f.store.list({})).items[0].activatedAt,null);
});
test('two concurrent redemptions produce exactly one session',async t=>{
 const {store}=await fixture(t),i=await store.invite({email:'tester@example.test'}),r=await Promise.allSettled([store.redeem({inviteToken:i.inviteToken}),store.redeem({inviteToken:i.inviteToken})]);
 assert.equal(r.filter(x=>x.status==='fulfilled').length,1);
});
test('revocation immediately rejects session, pending invitation and stale admin updates',async t=>{
 const {store}=await fixture(t),i=await store.invite({email:'tester@example.test'}),r=await store.redeem({inviteToken:i.inviteToken}),g=(await store.list({})).items[0];
 await assert.rejects(store.revoke({grantId:g.id,expectedVersion:g.version-1}),/conflitto/i);
 await store.revoke({grantId:g.id,expectedVersion:g.version});assert.equal((await store.check({sessionToken:r.sessionToken})).active,false);
 const j=await store.invite({email:'pending@example.test'});await store.revoke({grantId:j.id,expectedVersion:j.version});await assert.rejects(store.redeem({inviteToken:j.inviteToken}),/invito/i);
});
test('resend replaces tokens while retaining original expiry across reinstalls',async t=>{
 const f=await fixture(t),i=await f.store.invite({email:'tester@example.test'}),a=await f.store.redeem({inviteToken:i.inviteToken});f.advance(30*DAY);
 const j=await f.store.invite({email:'tester@example.test'});assert.equal((await f.store.check({sessionToken:a.sessionToken})).active,false);
 const b=await f.store.redeem({inviteToken:j.inviteToken});assert.equal(b.expiresAt,a.expiresAt);
 const g=(await f.store.list({})).items[0];await f.store.extend({grantId:g.id,expectedVersion:g.version,expiresAt:new Date(f.now()+90*DAY).toISOString()});assert.notEqual((await f.store.check({sessionToken:b.sessionToken})).expiresAt,b.expiresAt);
});
test('expired grants cannot restart through resend or logout',async t=>{
 const f=await fixture(t),i=await f.store.invite({email:'tester@example.test'}),a=await f.store.redeem({inviteToken:i.inviteToken});await f.store.logout({sessionToken:a.sessionToken});assert.equal((await f.store.check({sessionToken:a.sessionToken})).active,false);
 f.advance(90*DAY);await assert.rejects(f.store.invite({email:'tester@example.test'}),/scadut/i);
});
test('global revocation preserves records and blocks all current access',async t=>{
 const {store}=await fixture(t);const sessions=[];for(const email of ['a@example.test','b@example.test']){const i=await store.invite({email});sessions.push(await store.redeem({inviteToken:i.inviteToken}));}
 await store.revokeAll();for(const s of sessions)assert.equal((await store.check({sessionToken:s.sessionToken})).active,false);assert.equal((await store.list({})).items.length,2);
});
test('database persists expiry but contains no plaintext invitation or session token',async t=>{
 const dir=mkdtempSync(join(tmpdir(),'beta-db-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));const path=join(dir,'beta.sqlite');const f=await fixture(t,path),i=await f.store.invite({email:'tester@example.test'}),s=await f.store.redeem({inviteToken:i.inviteToken});
 const db2=testDb(path);t.after(()=>db2.close());assert.equal((await createBetaStore({db:db2,clock:f.now}).check({sessionToken:s.sessionToken})).expiresAt,s.expiresAt);
 const raw=readFileSync(path).toString('utf8');assert.equal(raw.includes(i.inviteToken),false);assert.equal(raw.includes(s.sessionToken),false);
});
test('invalid identities and token formats never create or reveal grants',async t=>{
 const {store}=await fixture(t);await assert.rejects(store.invite({email:'x\nInjected@example.test'}));assert.equal((await store.check({sessionToken:'not-a-token'})).active,false);await assert.rejects(store.redeem({inviteToken:'bad'}),/invito/i);
});
test('rate buckets enforce limits and recover in the next window',async t=>{
 const f=await fixture(t);assert.equal(await f.store.takeRate('synthetic-ip',2),true);assert.equal(await f.store.takeRate('synthetic-ip',2),true);assert.equal(await f.store.takeRate('synthetic-ip',2),false);f.advance(60000);assert.equal(await f.store.takeRate('synthetic-ip',2),true);
});
