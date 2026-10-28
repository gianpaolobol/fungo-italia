import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {betaAssets} from './admin-assets.mjs';import {testDb} from './test-db.mjs';import {createBetaStore} from './store.mjs';import {createBetaHandler} from './server.mjs';
class Element{constructor(){this.children=[];this.listeners={};this.textContent='';this.value='';}append(...nodes){this.children.push(...nodes);}replaceChildren(){this.children=[];}addEventListener(event,fn){this.listeners[event]=fn;}scrollIntoView(){}get buttons(){return this.children.flatMap(e=>[e,...e.buttons]);}}
test('owner can change expiry through the actual served administrator script',async t=>{
 const db=testDb();t.after(()=>db.close());const store=createBetaStore({db});await store.invite({email:'tester@example.test'});
 const origin='https://beta.example.test',handler=createBetaHandler({store,origin,ownerId:'owner'}),nodes=new Map();const document={getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);},createElement:()=>new Element()};
 vm.runInNewContext(betaAssets['/admin.js'].body,{document,location:{origin},prompt:()=> '2027-02-01',confirm:()=>true,Date,encodeURIComponent,Error,fetch:(url,init)=>handler(new Request(origin+url,{...init,headers:{...init.headers,Origin:origin}}),{userId:'owner',ip:'synthetic-owner'})});
 for(let n=0;n<5;n++)await new Promise(r=>setImmediate(r));
 const button=document.getElementById('grants').buttons.find(b=>b.textContent==='Modifica scadenza');assert.ok(button,'expiry action visible');await button.listeners.click();
 const grant=(await store.list({})).items[0];assert.equal(grant.expiresAt,'2027-02-01T23:59:59.000Z');
});
