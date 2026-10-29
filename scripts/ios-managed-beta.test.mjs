import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import React from 'react';
import {create,act} from 'react-test-renderer';
import * as policy from '../lib/beta-access.mjs';
import * as controller from '../lib/beta-controller.mjs';
import {createBetaStore} from '../server/beta/store.mjs';
import {createBetaHandler} from '../server/beta/server.mjs';
import {testDb} from '../server/beta/test-db.mjs';

globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const origin='https://beta.example.test';
test('iOS managed configuration grants access only with an explicitly configured verified beta',()=>{
 assert.deepEqual(policy.resolveAccess('ios',false,true,true),{full:true,kind:'beta'});
 assert.deepEqual(policy.resolveAccess('ios',false,true,false),{full:false,kind:'demo'});
 assert.deepEqual(policy.resolveAccess('ios',false,false,true),{full:false,kind:'demo'});
 assert.deepEqual(policy.resolveAccess('ios',true,false,true),{full:true,kind:'subscription'});
 assert.deepEqual(policy.resolveAccess('web',false,true,true),{full:false,kind:'demo'});
});
test('iOS endpoint is opt-in and rejects credentials, query strings and unsupported platforms',()=>{
 assert.equal(typeof policy.betaEndpoint,'function');
 assert.equal(policy.betaEndpoint('ios',{betaServiceUrl:origin}),null);
 assert.equal(policy.betaEndpoint('ios',{betaServiceUrl:origin,betaIOS:true}),origin);
 assert.equal(policy.betaEndpoint('android',{betaServiceUrl:origin}),origin);
 assert.equal(policy.betaEndpoint('web',{betaServiceUrl:origin,betaIOS:true}),null);
 for(const url of ['http://localhost','https://secret@beta.example.test','https://beta.example.test/?secret=1','https://beta.example.test/path'])assert.equal(policy.betaEndpoint('ios',{betaServiceUrl:url,betaIOS:true}),null);
});
function config(endpoint,ios){return JSON.parse(execFileSync(process.execPath,['-e','process.stdout.write(JSON.stringify(require("./app.config.js")()))'],{env:{...process.env,FUNGO_BETA_SERVICE_URL:endpoint,FUNGO_IOS_MANAGED_BETA:ios},encoding:'utf8',stdio:['ignore','pipe','pipe']}));}
test('iOS build config is explicit, requires endpoint, and keeps the ordinary profile unchanged',()=>{
 assert.equal(config('','').extra.betaIOS,undefined);
 assert.equal(config(origin,'').extra.betaIOS,undefined);
 const beta=config(origin,'1');assert.equal(beta.extra.betaIOS,true);assert.equal(beta.extra.betaServiceUrl,origin+'/');assert.ok(beta.plugins.includes('expo-secure-store'));
 assert.throws(()=>config('','1'));assert.throws(()=>config(origin,'true'));
 const profiles=JSON.parse(readFileSync(new URL('../eas.json',import.meta.url),'utf8')).build;
 assert.equal(profiles['ios-managed-beta'].extends,'production');assert.equal(profiles['ios-managed-beta'].env.FUNGO_IOS_MANAGED_BETA,'1');
 assert.equal(profiles.production.env.FUNGO_IOS_MANAGED_BETA,undefined);assert.equal(profiles['android-managed-beta'].env.FUNGO_IOS_MANAGED_BETA,undefined);
});
test('mounted iOS hook redeems a real server grant, restores it and applies owner revocation',async t=>{
 const db=testDb();t.after(()=>db.close());const store=createBetaStore({db});const handler=createBetaHandler({store,origin,ownerId:'owner'});
 const invitation=await store.invite({email:'ios-fixture@example.test'}),values=new Map(),originalFetch=globalThis.fetch;let latest,view;
 globalThis.fetch=async(url,init)=>handler(new Request(url,init),{ip:'ios-fixture'});
 const modules={react:React,'react-native':{Platform:{OS:'ios'},AppState:{addEventListener:()=>({remove(){}})}},'expo-constants':{expoConfig:{extra:{betaServiceUrl:origin,betaIOS:true}}},'expo-secure-store':{getItemAsync:async key=>values.get(key)??null,setItemAsync:async(key,value)=>{values.set(key,value);},deleteItemAsync:async key=>{values.delete(key);}},'../lib/beta-controller.mjs':controller,'../lib/beta-access.mjs':policy};
 const js=ts.transpileModule(readFileSync(new URL('../hooks/useBetaAccess.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 const output={exports:{}};new Function('require','module','exports',js)(name=>{assert.ok(name in modules,'Unexpected import '+name);return modules[name];},output,output.exports);
 function Fixture(){latest=output.exports.default();return null;}
 t.after(async()=>{if(view)await act(async()=>view.unmount());globalThis.fetch=originalFetch;});
 await act(async()=>{view=create(React.createElement(Fixture));});assert.equal(latest.configured,true);assert.equal(latest.active,false);
 await act(async()=>latest.redeem(invitation.inviteToken));assert.equal(latest.active,true);assert.equal(values.size,1);
 const grant=(await store.list({})).items[0];assert.equal(Date.parse(grant.expiresAt)-Date.parse(grant.activatedAt),90*86400000);
 await act(async()=>view.unmount());await act(async()=>{view=create(React.createElement(Fixture));});
 // The effect starts an asynchronous WebCrypto/server verification. Wait for
 // the observable state, not an arbitrary sleep or an extra manual refresh.
 const deadline=performance.now()+3000;
 while(!latest.active&&performance.now()<deadline)await act(async()=>{await new Promise(resolve=>setImmediate(resolve));});
 assert.equal(latest.active,true,'cold-start credential is verified with the server');
 await store.revoke({grantId:grant.id,expectedVersion:grant.version});await act(async()=>latest.refresh());assert.equal(latest.active,false);assert.equal(values.size,1,'revocation does not erase stored study data or session recovery state');
});
