import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createNetworkGate} from './paired-demo-network.mjs';
import {demoStudyKey} from '../lib/study-store.mjs';
import {assertBrowserProgress,progressFixture} from './public-demo21-progress.mjs';
const runtimeRoot=process.env.PAIRED_BROWSER_ROOT;if(runtimeRoot)assert(process.env.RUNNER_TEMP?.startsWith('/')&&resolve(runtimeRoot)===join(process.env.RUNNER_TEMP,'paired-browser-runtime'),'Unexpected QA runtime path');
const runtimeRequire=createRequire(runtimeRoot?join(runtimeRoot,'package.json'):new URL('../web/package.json',import.meta.url));const runtimeVersion=runtimeRequire('@playwright/test/package.json').version;if(runtimeRoot)assert.equal(runtimeVersion,'1.62.0');
const {chromium,webkit,expect}=runtimeRequire('@playwright/test');
const [mode,directory]=process.argv.slice(2);
assert(['capture','upgrade'].includes(mode)&&directory,'Usage: paired-demo-browser.mjs capture|upgrade profile-directory');
const SOURCE=process.env.PAIRED_SOURCE;
assert(/^[a-f0-9]{40}$/.test(SOURCE||''),'Exact paired source required');
const build=JSON.parse(await readFile('dist-ios/build.json','utf8'));assert.equal(build.sourceCommit,SOURCE);
const prior=mode==='upgrade'?JSON.parse(await readFile(join(directory,'capture-report.json'),'utf8')):null;
const base=process.env.PAIRED_BROWSER_BASE_URL||'https://gianpaolobol.github.io/fungo-italia/';
const replayControl=process.env.PAIRED_REPLAY_CONTROL;
const replay=base!=='https://gianpaolobol.github.io/fungo-italia/';
if(replay){const u=new URL(base),c=new URL(replayControl);assert(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.pathname==='/fungo-italia/'&&c.protocol==='http:'&&c.hostname==='127.0.0.1','Replay must stay on private loopback origins');}else assert(!replayControl,'Public verification cannot use replay control');
const expectedHtml=await readFile('dist-ios/index.html','utf8'),expectedScript=expectedHtml.match(/<script src="([^" ]*\/_expo\/static\/js\/web\/index-[^" ]+)"/)?.[1];assert(expectedScript,'Verified app script missing');
const scriptOf=page=>page.locator('script[src*="/_expo/static/js/web/index-"]').getAttribute('src');
async function approvedWorkerReady(page){return page.evaluate(async source=>{
 const reg=await navigator.serviceWorker.getRegistration();const worker=reg?.waiting??navigator.serviceWorker.controller;if(!worker)return false;
 return new Promise(resolve=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(false);},1500);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.sourceCommit===source);};worker.postMessage({type:'SOURCE_ID'},[channel.port2]);});
},SOURCE);}

const favorite=progressFixture.favorite;
const probe='public-demo21-preserve-notes';
await mkdir(directory,{recursive:true});
async function controllerSource(page){return page.evaluate(async()=>{
 const worker=navigator.serviceWorker?.controller;if(!worker)return null;
 return new Promise(resolve=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(null);},1500);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.sourceCommit||null);};worker.postMessage({type:'SOURCE_ID'},[channel.port2]);});
}).catch(()=>null);}
async function cacheSummary(page){return page.evaluate(async()=>{const rows=[];for(const name of await caches.keys()){if(!name.startsWith('fungo-'))continue;const cache=await caches.open(name),requests=await cache.keys(),shell=await cache.match(new URL('/fungo-italia/index.html',location.href).href);rows.push({name,entries:requests.length,shellListed:requests.some(r=>new URL(r.url).pathname==='/fungo-italia/index.html'),shellReadable:!!shell,shellStatus:shell?.status??null,appScripts:requests.filter(r=>r.url.includes('/_expo/static/js/web/index-')).map(r=>new URL(r.url).pathname)});}return rows;}).catch(()=>null);}
const reports=[];
for(const[name,browser]of [['chromium',chromium],['webkit',webkit]]){
 const gate=await createNetworkGate({localOrigin:replay?new URL(base).origin:undefined});
 let context,page;const errors=[],cacheObservations={};
 try{
 context=await browser.launchPersistentContext(join(directory,name),{proxy:{server:gate.url,bypass:'127.0.0.1,localhost'},headless:true,viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'allow'});
  if(mode==='capture')await context.addInitScript(({favorite,probe,notes})=>{
   if(window.top!==window)return;
   if(!localStorage.getItem(probe)){const state=JSON.stringify({version:1,favoriteIds:[favorite],resumeId:favorite});localStorage.setItem('fungo-italia:study:v1',state);localStorage.setItem('fungo-italia:pwa:study:v1',state);localStorage.setItem('fungo-italia:pwa:notes:v1',JSON.stringify(notes));localStorage.setItem(probe,'keep-existing-notes');}
  },{favorite,probe,notes:progressFixture.notes});
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const navigation=await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});assert(navigation?.ok(),'Application navigation HTTP '+navigation?.status());await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree'],{timeout:60000});
  await expect.poll(()=>controllerSource(page),{timeout:120000}).not.toBeNull();
  const scriptBefore=await scriptOf(page);
  cacheObservations.afterNavigation=await cacheSummary(page);const before=await controllerSource(page);assert(/^[a-f0-9]{40}$/.test(before||''),'Live worker source unavailable');
  if(mode==='upgrade'){const captured=prior.reports.find(r=>r.browser===name);assert([SOURCE,captured?.sourceAfter].includes(before),'Worker differs from captured source');assert([expectedScript,captured?.documentScript].includes(scriptBefore),'Document differs from captured or verified app');}
  if(mode==='capture'){
   await page.getByRole('tab',{name:'Esame',exact:true}).click();
   await page.getByRole('button',{name:'Inizia 4 casi',exact:true}).click();
   await page.getByRole('textbox',{name:'Nome scientifico della risposta'}).fill('Agaricus');
   await page.getByRole('radio').first().click();
   await page.getByRole('button',{name:'Invia risposta',exact:true}).click();
   await expect(page.getByRole('button',{name:'Continua',exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Continua',exact:true}).click();
   await page.getByRole('textbox',{name:'Nome scientifico della risposta'}).fill('Agaricus');
   await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null')?.exam?.session?.draft?.name,demoStudyKey)).toBe('Agaricus');
   await page.getByRole('tab',{name:'Percorso',exact:true}).click();
  }
  const examSnapshot=await page.evaluate(key=>localStorage.getItem(key),demoStudyKey);
  assert(examSnapshot&&JSON.parse(examSnapshot).exam.history.length>0,'Real exam checkpoint and history required');
  if(mode==='upgrade')assert.equal(examSnapshot,prior.reports.find(r=>r.browser===name)?.examSnapshot,'Exam storage changed before upgrade');
  let method='already-current';
  if(mode==='upgrade'&&scriptBefore!==expectedScript){
   await page.getByTestId('subscription-access').click();
   const refresh=page.getByRole('button',{name:'Verifica versione',exact:true});if(await refresh.count())await refresh.click();
   await expect(page.getByRole('button',{name:'Aggiorna anteprima',exact:true}).first()).toBeVisible({timeout:90000});
   await expect.poll(()=>approvedWorkerReady(page),{timeout:120000}).toBe(true);
   await page.evaluate(()=>{window.__pairedPreviousDocument=true;});
   await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:120000}),page.getByRole('button',{name:'Aggiorna anteprima',exact:true}).first().click()]);method='manual-update';
   assert.equal(await page.evaluate(()=>window.__pairedPreviousDocument),undefined,'Update must replace the actual document');
   await expect.poll(()=>scriptOf(page),{timeout:60000}).toBe(expectedScript);

   await expect.poll(()=>controllerSource(page),{timeout:120000}).toBe(SOURCE);
   await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree'],{timeout:60000});
  }
  if(mode==='upgrade')await expect.poll(()=>controllerSource(page),{timeout:120000}).toBe(SOURCE);
  const readProgress=()=>page.evaluate(probe=>({note:localStorage.getItem(probe),study:JSON.parse(localStorage.getItem('fungo-italia:study:v1')||'null'),notes:JSON.parse(localStorage.getItem('fungo-italia:pwa:notes:v1')||'null')}),probe);
  async function verifyOffline(){
   cacheObservations.beforeCut=await cacheSummary(page);await page.evaluate(()=>{window.__preOfflineDocument=true;});if(replay){const r=await fetch(replayControl+'/stop');assert(r.ok,'Replay origin cut failed');}gate.block();
   try{
    const probeBrowser=await browser.launch({headless:true,proxy:{server:gate.url,bypass:'127.0.0.1,localhost'}});try{const probe=await probeBrowser.newContext();await expect((await probe.newPage()).goto(base,{timeout:15000})).rejects.toThrow();}finally{await probeBrowser.close();}cacheObservations.afterIndependentProbe=await cacheSummary(page);
    const response=await page.reload({waitUntil:'domcontentloaded'});assert.equal(response.status(),200);assert(response.fromServiceWorker(),'Offline document must come from actual installed worker');
    assert.equal(await page.evaluate(()=>window.__preOfflineDocument),undefined,'Offline navigation must create a new document');
    await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree'],{timeout:30000});
    cacheObservations.afterOfflineReload=await cacheSummary(page);assertBrowserProgress(await readProgress());assert.equal(await page.evaluate(key=>localStorage.getItem(key),demoStudyKey),examSnapshot,'Exam state changed offline');
   }finally{gate.allow();if(replay){const r=await fetch(replayControl+'/start');assert(r.ok,'Replay origin restart failed');}}
  }
  assertBrowserProgress(await readProgress());
  if(mode==='upgrade'){
   assert.equal(await controllerSource(page),SOURCE);
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),demoStudyKey),examSnapshot,'Exam checkpoint/history changed during upgrade');
   await page.getByRole('tab',{name:'Esame',exact:true}).click();await page.getByRole('button',{name:'Riprendi sessione',exact:true}).click();await expect(page.getByRole('textbox',{name:'Nome scientifico della risposta'})).toHaveValue('Agaricus');
   assert.equal(await scriptOf(page),expectedScript,'Running page still contains previous app code');
   const icon=await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');assert.equal(icon,'/fungo-italia/icon-'+build.iconSha256.slice(0,16)+'.png');
   const response=await page.request.get(new URL(icon,base).href);assert(response.ok());assert.equal(createHash('sha256').update(await response.body()).digest('hex'),build.iconSha256);
   await page.getByTestId('subscription-access').click();
   await expect(page.getByText('Questa versione corrisponde alla versione TestFlight verificata.',{exact:true})).toBeVisible({timeout:30000});
   await expect(page.getByText('È disponibile una versione diversa, verificata su TestFlight.',{exact:true})).toHaveCount(0);
   await page.getByRole('tab',{name:'Studio',exact:true}).click();await expect(page.getByText('Demo gratuita · Agaricus',{exact:true})).toBeVisible();await expect(page.getByText(/1 preferito/)).toBeVisible();
   await page.getByRole('tab',{name:'Aree',exact:true}).click();await expect(page.getByText('Aree e habitat',{exact:true})).toBeVisible();await expect(page.getByText(/^71 macroaree in /)).toBeVisible();await expect(page.getByRole('heading',{name:'Fungo Italia completo'})).toHaveCount(0);
   await verifyOffline();
   await page.screenshot({path:join(directory,name+'-verified.png'),fullPage:true});
  }
  assert.deepEqual(errors,[]);
  cacheObservations.beforeClose=await cacheSummary(page);reports.push({browser:name,browserRuntime:runtimeVersion,browserVersion:context.browser().version(),executable:browser.executablePath(),mode,cacheObservations,origin:new URL(base).origin,scope:replay?'archived-loopback-migration':'live-public-origin',sourceBefore:before,capturedSource:prior?.reports.find(r=>r.browser===name)?.sourceAfter??null,sourceAfter:await controllerSource(page),documentScriptBefore:scriptBefore,documentScript:await scriptOf(page),documentReplaced:method==='manual-update',method,examSnapshot,examCheckpointPreserved:true,examHistoryPreserved:true,notesPreserved:true,favoritesPreserved:true,offlineVerified:mode==='upgrade'});
 }catch(error){
  if(page){await page.screenshot({path:join(directory,name+'-'+mode+'-failure.png'),fullPage:true}).catch(()=>{});await writeFile(join(directory,name+'-'+mode+'-failure.json'),JSON.stringify({scope:replay?'archived-loopback-migration':'live-public-origin',error:error.message,controller:await controllerSource(page),documentScript:await scriptOf(page).catch(()=>null),pageErrors:errors,cacheObservations,cacheAtFailure:await cacheSummary(page),reports},null,2)+'\n');}
  throw error;
 }finally{await context?.close();await gate.close();}
}
await writeFile(join(directory,mode+'-report.json'),JSON.stringify({checkedAt:new Date().toISOString(),status:'complete',scope:replay?'archived-loopback-migration':'live-public-origin',reports},null,2)+'\n');
console.log('PAIRED_DEMO_BROWSER '+JSON.stringify(reports));
