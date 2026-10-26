import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const builder=await readFile(new URL('../web/build.mjs',import.meta.url),'utf8');
const template=builder.match(/const runtime=(`[^]*?`);\n/)?.[1];assert(template,'Actual generated PWA runtime template required');
const runtime=vm.runInNewContext('('+template+')',{sourceCommit:'a'.repeat(40)});
async function load({registrationFails=false,updateFails=false}={}){
 const controller={},listeners=[],state={registrations:0,updates:0,unregistered:0};let onLoad;
 const registration={waiting:null,addEventListener:event=>listeners.push(event),unregister(){state.unregistered++;},update(){state.updates++;return updateFails?Promise.reject(new TypeError('Network unavailable during automatic worker update')):Promise.resolve();}};
 const serviceWorker={controller,register(){state.registrations++;return registrationFails?Promise.reject(new TypeError('Offline registration unavailable')):Promise.resolve(registration);}};
 vm.runInNewContext(runtime,{navigator:{serviceWorker},window:{addEventListener:(event,fn)=>{assert.equal(event,'load');onLoad=fn;}},setTimeout,clearTimeout});
 onLoad();await new Promise(setImmediate);
 assert.equal(serviceWorker.controller,controller,'Existing offline controller must be preserved');
 assert.equal(state.unregistered,0,'Update failure must never remove the offline app');
 return {state,listeners};
}
test('automatic offline update rejection does not escape the actual generated PWA bootstrap',async()=>{
 const r=await load({updateFails:true});assert.equal(r.state.registrations,1);assert.equal(r.state.updates,1);assert.deepEqual(r.listeners,['updatefound']);
});
test('registration failure preserves the currently running offline controller',async()=>{
 const r=await load({registrationFails:true});assert.equal(r.state.registrations,1);assert.equal(r.state.updates,0);
});
test('successful automatic checks retain detection of future installed workers',async()=>{
 const r=await load();assert.equal(r.state.updates,1);assert.deepEqual(r.listeners,['updatefound']);
});
