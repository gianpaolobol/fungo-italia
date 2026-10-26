import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {demoStudyKey} from '../lib/study-store.mjs';
const {chromium,webkit,expect}=createRequire(new URL('../web/package.json',import.meta.url))('@playwright/test');
const directory=process.argv[2],reports=[];
for(const[name,browser]of [['chromium',chromium],['webkit',webkit]]){
 let context;
 try{
  context=await browser.launchPersistentContext(join(directory,name),{headless:true,viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://gianpaolobol.github.io/fungo-italia/',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree']);
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller);
  const before=await page.evaluate(key=>localStorage.getItem(key),demoStudyKey);assert(before&&JSON.parse(before).exam.history.length>0);
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree']);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),demoStudyKey),before);
  assert.deepEqual(errors,[]);
  reports.push({browser:name,passed:true,offlineFlag:true,newDocument:true,examCheckpointPreserved:true,scope:'previous public PWA diagnostic only; no upgrade or delivery'});
 }catch(error){reports.push({browser:name,passed:false,error:error.message,scope:'diagnostic only'});}
 finally{await context?.close();}
}
await writeFile(join(directory,'offline-probe.json'),JSON.stringify(reports,null,2)+'\n');console.log(JSON.stringify(reports));
assert(reports.every(r=>r.passed),'Offline diagnostic failed');
