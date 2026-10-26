import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {demoStudyKey} from '../lib/study-store.mjs';
import {assertBrowserProgress,progressFixture} from './public-demo21-progress.mjs';
const {chromium,webkit,expect}=createRequire(new URL('../web/package.json',import.meta.url))('@playwright/test');
const [mode,directory]=process.argv.slice(2);
assert(['capture','upgrade'].includes(mode)&&directory,'Usage: paired-demo-browser.mjs capture|upgrade profile-directory');
const SOURCE=process.env.PAIRED_SOURCE;
assert(/^[a-f0-9]{40}$/.test(SOURCE||''),'Exact paired source required');
const build=JSON.parse(await readFile('dist-ios/build.json','utf8'));assert.equal(build.sourceCommit,SOURCE);
const prior=mode==='upgrade'?JSON.parse(await readFile(join(directory,'capture-report.json'),'utf8')):null;
const base='https://gianpaolobol.github.io/fungo-italia/';
const favorite=progressFixture.favorite;
const probe='public-demo21-preserve-notes';
await mkdir(directory,{recursive:true});
async function controllerSource(page){return page.evaluate(async()=>{
 const worker=navigator.serviceWorker?.controller;if(!worker)return null;
 return new Promise(resolve=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(null);},1500);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.sourceCommit||null);};worker.postMessage({type:'SOURCE_ID'},[channel.port2]);});
}).catch(()=>null);}
const reports=[];
for(const[name,browser]of [['chromium',chromium],['webkit',webkit]]){
 const context=await browser.launchPersistentContext(join(directory,name),{headless:true,viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'allow'});
 try{
  if(mode==='capture')await context.addInitScript(({favorite,probe,notes})=>{
   if(window.top!==window)return;
   if(!localStorage.getItem(probe)){const state=JSON.stringify({version:1,favoriteIds:[favorite],resumeId:favorite});localStorage.setItem('fungo-italia:study:v1',state);localStorage.setItem('fungo-italia:pwa:study:v1',state);localStorage.setItem('fungo-italia:pwa:notes:v1',JSON.stringify(notes));localStorage.setItem(probe,'keep-existing-notes');}
  },{favorite,probe,notes:progressFixture.notes});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree'],{timeout:60000});
  await expect.poll(()=>controllerSource(page),{timeout:120000}).not.toBeNull();
  const before=await controllerSource(page);assert(/^[a-f0-9]{40}$/.test(before||''),'Live worker source unavailable');
  if(mode==='upgrade')assert([SOURCE,prior.reports.find(r=>r.browser===name)?.sourceAfter].includes(before),'Worker differs from captured source');
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
  if(mode==='upgrade'&&before!==SOURCE){
   await page.getByTestId('subscription-access').click();
   const refresh=page.getByRole('button',{name:'Verifica versione',exact:true});if(await refresh.count())await refresh.click();
   await expect(page.getByRole('button',{name:'Aggiorna anteprima',exact:true}).first()).toBeVisible({timeout:90000});
   await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting,undefined,{timeout:120000});
   await page.getByRole('button',{name:'Aggiorna anteprima',exact:true}).first().click();method='manual-update';
   await expect.poll(()=>controllerSource(page),{timeout:120000}).toBe(SOURCE);
   await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree'],{timeout:60000});
  }
  const readProgress=()=>page.evaluate(probe=>({note:localStorage.getItem(probe),study:JSON.parse(localStorage.getItem('fungo-italia:study:v1')||'null'),notes:JSON.parse(localStorage.getItem('fungo-italia:pwa:notes:v1')||'null')}),probe);
  assertBrowserProgress(await readProgress());
  if(mode==='upgrade'){
   assert.equal(await controllerSource(page),SOURCE);
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),demoStudyKey),examSnapshot,'Exam checkpoint/history changed during upgrade');
   await page.getByRole('tab',{name:'Esame',exact:true}).click();await page.getByRole('button',{name:'Riprendi sessione',exact:true}).click();await expect(page.getByRole('textbox',{name:'Nome scientifico della risposta'})).toHaveValue('Agaricus');
   const html=await readFile('dist-ios/index.html','utf8'),expected=html.match(/<script src="([^"]*\/_expo\/static\/js\/web\/index-[^"]+)"/)?.[1];assert(expected,'Verified app script missing');
   assert.equal(await page.locator('script[src*="/_expo/static/js/web/index-"]').getAttribute('src'),expected,'Running page still contains previous app code');
   const icon=await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');assert.equal(icon,'/fungo-italia/icon-'+build.iconSha256.slice(0,16)+'.png');
   const response=await page.request.get(new URL(icon,base).href);assert(response.ok());assert.equal(createHash('sha256').update(await response.body()).digest('hex'),build.iconSha256);
   await page.getByTestId('subscription-access').click();
   await expect(page.getByText('Questa versione corrisponde alla versione TestFlight verificata.',{exact:true})).toBeVisible({timeout:30000});
   await expect(page.getByText('È disponibile una versione diversa, verificata su TestFlight.',{exact:true})).toHaveCount(0);
   await page.getByRole('tab',{name:'Studio',exact:true}).click();await expect(page.getByText('Demo gratuita · Agaricus',{exact:true})).toBeVisible();await expect(page.getByText(/1 preferito/)).toBeVisible();
   await page.getByRole('tab',{name:'Aree',exact:true}).click();await expect(page.getByText('Aree e habitat',{exact:true})).toBeVisible();await expect(page.getByText(/^71 macroaree in /)).toBeVisible();await expect(page.getByRole('heading',{name:'Fungo Italia completo'})).toHaveCount(0);
   await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree'],{timeout:30000});
   assertBrowserProgress(await readProgress());assert.equal(await page.evaluate(key=>localStorage.getItem(key),demoStudyKey),examSnapshot,'Exam state changed offline');await context.setOffline(false);
   await page.screenshot({path:join(directory,name+'-verified.png'),fullPage:true});
  }
  assert.deepEqual(errors,[]);
  reports.push({browser:name,mode,sourceBefore:before,sourceAfter:await controllerSource(page),method,examSnapshot,examCheckpointPreserved:true,examHistoryPreserved:true,notesPreserved:true,favoritesPreserved:true,offlineVerified:mode==='upgrade'});
 }finally{await context.close();}
}
await writeFile(join(directory,mode+'-report.json'),JSON.stringify({checkedAt:new Date().toISOString(),reports},null,2)+'\n');
console.log('PAIRED_DEMO_BROWSER '+JSON.stringify(reports));
