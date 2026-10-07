import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const owner='gianpaolobol',token='github_pat_TEST_ONLY_NOT_A_REAL_CREDENTIAL_1234567890',repository='gianpaolobol/fungo-italia';
const fixture=new URL('../public/images/reference/amanita-caesarea-lateral-460.jpg',import.meta.url);
const originalHead='a'.repeat(40),originalTree='b'.repeat(40);
async function fakeGitHub(page,{login=owner,write=true,unreachable=false}={}){
 const catalog=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8'));
 const groups=JSON.parse(await readFile(new URL('../../src/data/groups.json',import.meta.url),'utf8'));
 const state={calls:[],blobs:new Map(),head:originalHead,tree:null,commit:null,manifest:null};
 await page.route('https://api.github.com/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname,method=req.method(),body=req.postDataJSON();
  state.calls.push({method,path,body,authorization:req.headers().authorization});console.log('MOCK GITHUB',method,path);
  if(unreachable){await route.abort('failed');return;}
  const respond=(status,data)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  if(path==='/user')return respond(200,{login});
  if(path==='/repos/'+repository)return respond(200,{full_name:repository,default_branch:'main',permissions:{push:true,admin:true}});
  if(method==='GET'&&/\/git\/refs?\/heads\/main$/.test(path))return respond(200,{ref:'refs/heads/main',object:{type:'commit',sha:state.head}});
  if(method==='GET'&&/\/git\/commits\//.test(path))return respond(200,{sha:state.head,tree:{sha:originalTree}});
  if(method==='GET'&&/\/contents\//.test(path)){
   const file=decodeURIComponent(path.split('/contents/')[1]);
   const data=file==='src/data/catalog.json'?catalog:file==='src/data/groups.json'?groups:file==='src/data/admin-reference-images.json'?{version:1,images:[]}:null;
   if(data===null)return respond(404,{message:'Not Found'});
   return respond(200,{type:'file',encoding:'base64',sha:'c'.repeat(40),content:Buffer.from(JSON.stringify(data)).toString('base64'),path:file});
  }
  if(method==='POST'&&path.endsWith('/git/blobs')){
   if(!write)return respond(403,{message:'Resource not accessible by personal access token'});
   const sha=(state.blobs.size+1).toString(16).padStart(40,'0');
   state.blobs.set(sha,body);return respond(201,{sha});
  }
  if(method==='POST'&&path.endsWith('/git/trees')){state.tree=body;return respond(201,{sha:'d'.repeat(40)});}
  if(method==='POST'&&path.endsWith('/git/commits')){state.commit=body;return respond(201,{sha:'e'.repeat(40)});}
  if(method==='PATCH'&&path.endsWith('/git/refs/heads/main')){
   state.head=body.sha;
   const entry=state.tree.tree.find(x=>x.path==='src/data/admin-reference-images.json');
   const blob=entry.content?{content:entry.content,encoding:'utf-8'}:state.blobs.get(entry.sha);
   state.manifest=JSON.parse(blob.encoding==='base64'?Buffer.from(blob.content,'base64').toString('utf8'):blob.content);
   return respond(200,{ref:'refs/heads/main',object:{type:'commit',sha:state.head}});
  }
  return respond(404,{message:'Mock: unexpected endpoint '+method+' '+path});
 });
 return state;
}
test.beforeEach(async({page})=>{page.on('pageerror',error=>console.log('ADMIN PAGE ERROR',error.message));page.on('console',message=>{if(message.text().startsWith('ADMIN DIAGNOSTIC'))console.log(message.text());});await page.addInitScript(()=>window.addEventListener('fungo:admin-error',event=>console.log('ADMIN DIAGNOSTIC',JSON.stringify(event.detail))));});
test.afterEach(async({page},info)=>{if(info.status!==info.expectedStatus)console.log('ADMIN FAILURE UI',await page.evaluate(()=>document.body.innerText.slice(-5000)).catch(()=>''));});
function publicationCalls(state){return state.calls.filter(x=>x.method==='PATCH'||x.path.endsWith('/git/trees')||x.path.endsWith('/git/commits')&&x.method==='POST');}
async function ready(page){await page.goto('./');await expect(page.locator('#admin-edit')).toBeVisible();await expect(page.locator('#catalog-count')).toContainText('148 schede');await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);}
async function openTaxon(page,name='Amanita caesarea',query=name){
 await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill(query);
 await page.getByRole('button',{name:'Apri '+name,exact:true}).click();
}
async function login(page,password=null){
 await page.locator('#admin-edit').click();
 await page.locator('#admin-login-key').fill(token);
 if(password){await page.locator('#admin-password-save').check();await page.locator('#admin-password-create').fill(password);await page.locator('#admin-password-confirm').fill(password);}
 await page.locator('#admin-login-submit').click();
 await expect(page.locator('#admin-edit')).toHaveText('Esci da modifica');
}
async function choosePhoto(page,view='lateral'){
 await page.locator('#detail [data-action="admin-photo-edit"][data-view="'+view+'"]').click();
 await page.locator('#admin-photo-input').setInputFiles(fixture.pathname);
 await expect(page.locator('#admin-photo-preview')).toBeVisible();
}
async function storedValues(page){return page.evaluate(()=>[...Object.values(localStorage),...Object.values(sessionStorage)]);}
test('public atlas is read-only and owner logout removes every edit control',async({page})=>{
 const api=await fakeGitHub(page);await ready(page);await openTaxon(page);
 await expect(page.locator('[data-action="admin-photo-edit"]')).toHaveCount(0);
 await page.getByRole('button',{name:'Torna',exact:true}).click();await login(page);await openTaxon(page,'Amanita caesarea','Amanita');
 await expect(page.locator('#detail [data-action="admin-photo-edit"]')).toHaveCount(3);
 await page.getByRole('button',{name:'Successiva →',exact:true}).click();
 await expect(page.locator('#detail [data-action="admin-photo-edit"]')).toHaveCount(3);
 await page.getByRole('button',{name:'Torna',exact:true}).click();await page.locator('#admin-edit').click();
 await expect(page.locator('[data-action="admin-photo-edit"]')).toHaveCount(0);expect(publicationCalls(api)).toEqual([]);
 for(const value of await storedValues(page))expect(value).not.toContain(token);
});
test('owner replaces only one view through a non-forced atomic GitHub commit',async({page})=>{
 const api=await fakeGitHub(page);await ready(page);await login(page);await openTaxon(page);
 const before=await page.locator('#detail .photo-thumb img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
 await choosePhoto(page);await page.locator('#admin-photo-rights').check();await page.locator('#admin-photo-save').click();
 await expect.poll(()=>api.manifest).not.toBeNull();
 expect(api.manifest.images).toHaveLength(1);
 const entry=api.manifest.images[0];expect(entry.scientificName).toBe('Amanita caesarea');expect(entry.view).toBe('lateral');
 expect(entry.src).toMatch(/^images\/reference\/admin-/);
 const update=api.calls.find(x=>x.method==='PATCH');expect(update.body.force).toBe(false);expect(api.commit.parents).toEqual([originalHead]);
 expect(api.tree.tree.map(x=>x.path).sort()).toEqual(['web/public/'+entry.src,'src/data/admin-reference-images.json'].sort());
 const jpeg=[...api.blobs.values()].find(b=>b.encoding==='base64');
 expect(Buffer.from(jpeg.content,'base64').subarray(0,3)).toEqual(Buffer.from([255,216,255]));
 await expect(page.locator('.admin-photo-dialog')).not.toBeVisible();
 const after=await page.locator('#detail .photo-thumb img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
 expect(after[0]).toMatch(/^blob:/);expect(after.slice(1)).toEqual(before.slice(1));
 for(const value of await storedValues(page))expect(value).not.toContain(token);
});
test('wrong identity and read-only owner token never unlock editing',async({page})=>{
 let api=await fakeGitHub(page,{login:'another-user'});await ready(page);
 await page.locator('#admin-edit').click();await page.locator('#admin-login-key').fill(token);await page.locator('#admin-login-submit').click();
 await expect(page.locator('#admin-login-error')).toContainText(/Accesso non riuscito|Password o accesso GitHub non validi/);await expect(page.locator('[data-action="admin-photo-edit"]')).toHaveCount(0);expect(publicationCalls(api)).toEqual([]);
 await page.unroute('https://api.github.com/**');api=await fakeGitHub(page,{write:false});
 await page.locator('#admin-login-key').fill(token);await page.locator('#admin-login-submit').click();
 await expect.poll(()=>api.calls.some(x=>x.method==='POST'&&x.path.endsWith('/git/blobs'))).toBe(true);
 await expect(page.locator('#admin-login-error')).not.toBeEmpty();await expect(page.locator('[data-action="admin-photo-edit"]')).toHaveCount(0);expect(publicationCalls(api)).toEqual([]);
});
test('cancelled selection and failed upload do not confirm publication',async({page})=>{
 const api=await fakeGitHub(page);await ready(page);await login(page);await openTaxon(page);await choosePhoto(page);
 await page.locator('#admin-photo-cancel').click();expect(publicationCalls(api)).toEqual([]);
 await choosePhoto(page);await page.locator('#admin-photo-rights').check();
 await page.unroute('https://api.github.com/**');await page.route('https://api.github.com/**',route=>route.abort('failed'));
 await page.locator('#admin-photo-save').click();await expect(page.locator('#admin-photo-error')).toContainText('Salvataggio non riuscito');
 expect(publicationCalls(api)).toEqual([]);await expect(page.locator('#admin-photo-save')).toBeEnabled();
 await expect(page.locator('#admin-photo-publication-status')).toHaveCount(0);
});
test('encrypted device password requires renewed owner validation',async({page})=>{
 let api=await fakeGitHub(page);await ready(page);
 const password='My study password 2026!';await login(page,password);
 await expect.poll(async()=>page.evaluate(()=>localStorage.getItem('fungo-italia:admin-key:v1'))).not.toBeNull();
 for(const value of await storedValues(page)){expect(value).not.toContain(token);expect(value).not.toContain(password);}
 await page.locator('#admin-edit').click();await page.reload();await page.locator('#admin-edit').click();
 await page.locator('#admin-password-unlock').fill('wrong-password');await page.locator('#admin-login-submit').click();
 await expect(page.locator('#admin-login-error')).not.toBeEmpty();await expect(page.locator('[data-action="admin-photo-edit"]')).toHaveCount(0);
 await page.unroute('https://api.github.com/**');api=await fakeGitHub(page,{login:'revoked-owner'});
 await page.locator('#admin-password-unlock').fill(password);await page.locator('#admin-login-submit').click();
 await expect.poll(()=>api.calls.some(x=>x.path==='/user')).toBe(true);
 await expect(page.locator('#admin-login-error')).not.toBeEmpty();await expect(page.locator('[data-action="admin-photo-edit"]')).toHaveCount(0);expect(publicationCalls(api)).toEqual([]);
});
test('cancelled pending preflight cannot publish after logout',async({page})=>{
 const api=await fakeGitHub(page);await ready(page);await login(page);await openTaxon(page);await choosePhoto(page);await page.locator('#admin-photo-rights').check();
 let intercepted=null;
 await page.route('https://api.github.com/repos/'+repository+'/git/ref/heads/main',route=>{intercepted=route;});
 await page.locator('#admin-photo-save').click();await expect.poll(()=>intercepted!==null).toBe(true);
 await expect(page.locator('#admin-photo-cancel')).toBeEnabled();await page.locator('#admin-photo-cancel').click();
 await page.getByRole('button',{name:'Torna',exact:true}).click();await page.locator('#admin-edit').click();
 await intercepted.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ref:'refs/heads/main',object:{type:'commit',sha:originalHead}})}).catch(()=>{});
 await expect(page.locator('[data-action="admin-photo-edit"]')).toHaveCount(0);expect(publicationCalls(api)).toEqual([]);
});
