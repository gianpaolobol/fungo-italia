import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {create,act} from 'react-test-renderer';
import * as controller from '../lib/beta-controller.mjs';
import * as policy from '../lib/beta-access.mjs';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const require=createRequire(import.meta.url);
function compile(file,modules){
 const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const output={exports:{}};new Function('require','module','exports',js)(name=>{assert.ok(name in modules,'Unexpected import '+name);return modules[name];},output,output.exports);return output.exports;
}
test('mounted Android hook uses keys accepted by the installed SecureStore implementation',async t=>{
 const values=new Map(),reads=[];
 const native={getValueWithKeyAsync:async key=>{reads.push(key);return values.get(key)??null;},setValueWithKeyAsync:async(value,key)=>{values.set(key,value);},deleteValueWithKeyAsync:async key=>{values.delete(key);}};
 // Keep Expo's real argument validation; replace only the device keystore bridge.
 const secure=compile(require.resolve('expo-secure-store').replace(/build\/index\.js$/,'src/SecureStore.ts'),{'./ExpoSecureStore':native});
 await assert.rejects(secure.getItemAsync('invalid:legacy'),/Invalid key/);
 const url='https://beta.example.test/',originalFetch=globalThis.fetch;
 globalThis.fetch=async request=>new Response(JSON.stringify(request.endsWith('/beta/logout')?{ok:true}:{active:true,grantId:'synthetic-device',serverNow:new Date().toISOString(),expiresAt:new Date(Date.now()+90*86400000).toISOString(),maxAgeSeconds:60,sessionToken:'s'.repeat(43)}),{headers:{'Content-Type':'application/json'}});
 const useBeta=compile(new URL('../hooks/useBetaAccess.ts',import.meta.url),{react:React,'react-native':{Platform:{OS:'android'},AppState:{addEventListener:()=>({remove(){}})}},'expo-constants':{expoConfig:{extra:{betaServiceUrl:url}}},'expo-secure-store':secure,'../lib/beta-controller.mjs':controller,'../lib/beta-access.mjs':policy}).default;
 let latest,view;function Fixture(){latest=useBeta();return null;}
 t.after(async()=>{if(view)await act(async()=>view.unmount());globalThis.fetch=originalFetch;});
 await act(async()=>{view=create(React.createElement(Fixture));});
 assert.equal(reads.length,1,'native keystore read reached after real Expo key validation');
 assert.equal(latest.error,'');await act(async()=>latest.redeem('i'.repeat(43)));
 assert.equal(latest.active,true);assert.equal(values.size,1,'credential persisted in native keystore bridge');
 assert.equal(values.get(reads[0]),'s'.repeat(43));await act(async()=>latest.logout());assert.equal(latest.active,false);assert.equal(values.size,0);
});
