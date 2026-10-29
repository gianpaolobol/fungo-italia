import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {betaAssets} from './admin-assets.mjs';import {testDb} from './test-db.mjs';import {createBetaStore} from './store.mjs';import {createBetaHandler} from './server.mjs';
class Element{constructor(onAction){this.onAction=onAction;this.children=[];this.listeners={};this.textContent='';this.value='';}append(...nodes){this.children.push(...nodes);}replaceChildren(){this.children=[];}addEventListener(event,fn){this.listeners[event]=fn;if(event==='click'&&this.textContent==='Modifica scadenza')this.onAction?.();}scrollIntoView(){}get buttons(){return this.children.flatMap(e=>[e,...e.buttons]);}}
test('served invitation email and activation page explain both native platforms without promising Play sync',async()=>{
 const nodes=new Map();const document={getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);},createElement:()=>new Element()};
 document.getElementById('email').value='synthetic-invite@example.test';
 // Use a real success response for the administrative invite; no actual mail.
 const code=betaAssets['/admin.js'].body;
 const context={document,location:{origin:'https://beta.example.test'},Date,encodeURIComponent,Error,fetch:async path=>new Response(JSON.stringify(path.endsWith('/invite')?{email:'synthetic-invite@example.test',inviteToken:'i'.repeat(43)}:{items:[],cursor:null}))};
 vm.runInNewContext(code,context);nodes.get('invite').listeners.submit({preventDefault(){}});
 const deadline=Date.now()+3000;while(!nodes.get('send-email')?.href&&Date.now()<deadline)await new Promise(resolve=>setImmediate(resolve));
 const mail=new URL(nodes.get('send-email').href),body=mail.searchParams.get('body');
 assert.ok(body.includes('Android'));assert.ok(body.includes('iPhone'));assert.ok(body.includes('TestFlight'));assert.ok(body.includes('90 giorni'));
 assert.ok(body.includes('https://beta.example.test/activate#'+'i'.repeat(43)));
 assert.ok(betaAssets['/activate'].body.includes('TestFlight'));
 assert.ok(betaAssets['/admin'].body.includes('Google Play Console'));
});
test('owner can change expiry through the actual served administrator script',{timeout:3000},async t=>{
 const db=testDb();t.after(()=>db.close());const store=createBetaStore({db});await store.invite({email:'tester@example.test'});
 const actionReady=Promise.withResolvers();
 const origin='https://beta.example.test',handler=createBetaHandler({store,origin,ownerId:'owner'}),nodes=new Map();const document={getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);},createElement:()=>new Element(()=>actionReady.resolve())};
 vm.runInNewContext(betaAssets['/admin.js'].body,{document,location:{origin},prompt:()=> '2027-02-01',confirm:()=>true,Date,encodeURIComponent,Error,fetch:async(url,init)=>{await new Promise(r=>setTimeout(r,30));return handler(new Request(origin+url,{...init,headers:{...init.headers,Origin:origin}}),{userId:'owner',ip:'synthetic-owner'});}});
 await actionReady.promise;
 const button=document.getElementById('grants').buttons.find(b=>b.textContent==='Modifica scadenza');assert.ok(button,'expiry action visible');await button.listeners.click();
 const grant=(await store.list({})).items[0];assert.equal(grant.expiresAt,'2027-02-01T23:59:59.000Z');
});
