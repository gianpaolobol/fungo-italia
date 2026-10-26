import {chromium,webkit,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const base=process.env.UNIFIED_BASE_URL||'http://127.0.0.1:4173/fungo-italia/';
let server;
if(!process.env.UNIFIED_BASE_URL){server=spawn(process.execPath,['serve.mjs'],{cwd:fileURLToPath(new URL('.',import.meta.url)),stdio:'inherit'});for(let i=0;i<60;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,200));}}
const engine=process.env.UNIFIED_BROWSER||'chromium';
if(!['chromium','webkit'].includes(engine))throw Error('Unknown browser');
const browser=await ({chromium,webkit})[engine].launch();
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Existing tool data survives the shared-app launch and navigation.
 const catalog=JSON.parse(await readFile(new URL('../src/data/catalog.json',import.meta.url),'utf8'));const agaricus=catalog.find(t=>t.scientificName.startsWith('Agaricus '));
 await page.addInitScript(id=>{if(window!==window.top)return;if(!localStorage.getItem('fungo-italia:study:v1'))localStorage.setItem('fungo-italia:pwa:study:v1',JSON.stringify({version:1,favoriteIds:[id],resumeId:id}))},agaricus.id);
 await page.goto(base);
 await page.evaluate(()=>localStorage.setItem('parity-preserve-existing-notes','kept'));
 await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree']);
 await expect(page.getByTestId('subscription-access')).toBeVisible();
 await page.getByTestId('subscription-access').click();await expect(page.getByRole('heading',{name:'Fungo Italia completo'})).toBeVisible();
 await expect(page.getByText('19,99 € / anno',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Apri l’app installata',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Ripristina acquisti',exact:true})).toHaveCount(0);
 await page.getByRole('tab',{name:'Studio',exact:true}).click();await expect(page.getByText('Demo gratuita · Agaricus',{exact:true})).toBeVisible();await expect(page.getByText(/1 preferito/)).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>{const previous=JSON.parse(localStorage.getItem('fungo-italia:pwa:study:v1'));const next=JSON.parse(localStorage.getItem('fungo-italia:study:v1'));return JSON.stringify(previous)===JSON.stringify(next);})).toBe(true);
 await page.getByRole('tab',{name:'Esame',exact:true}).click();await expect(page.getByText(/Test Agaricus/).first()).toBeVisible();
 await page.getByRole('tab',{name:'Aree',exact:true}).click();
 await expect(page.getByText('Aree e habitat',{exact:true})).toBeVisible();
 await expect(page.getByText(/^71 macroaree in /)).toBeVisible();
 await expect(page.getByRole('heading',{name:'Fungo Italia completo'})).toHaveCount(0);
 await expect(page.getByText('71 aree corrispondenti',{exact:true})).toBeVisible();
 const search=page.getByRole('textbox',{name:'Cerca area o habitat'});
 await search.fill('Amiata');await expect(page.getByText('1 area corrispondente',{exact:true})).toBeVisible();
 const area=JSON.parse(await readFile(new URL('../src/data/areas.json',import.meta.url),'utf8')).find(a=>a.name.includes('Amiata'));
 await page.getByRole('button',{name:'Consulta '+area.name,exact:true}).click();
 await expect(page.getByText(area.habitat.join(' · '),{exact:true}).last()).toBeVisible();
 await page.getByRole('button',{name:'Chiudi dettaglio',exact:true}).click();
 await search.fill('');await page.getByRole('button',{name:'Toscana',exact:true}).click();
 const tuscany=JSON.parse(await readFile(new URL('../src/data/areas.json',import.meta.url),'utf8')).filter(a=>a.region==='Toscana');
 await expect(page.getByText(tuscany.length+' aree corrispondenti',{exact:true})).toBeVisible();
 await expect(page.getByText('71 aree corrispondenti',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Tutte',exact:true}).click();
 await expect(page.getByText('71 aree corrispondenti',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Mappa online',exact:true}).click();
 await expect(page.locator('iframe[title="Mappa delle aree"]')).toBeVisible();
 const frame=page.frameLocator('iframe[title="Mappa delle aree"]');
 await expect(frame.locator('#map')).toBeVisible();
 // Require the real OSM layer (not a simulated map or an iframe placeholder).
 await expect(frame.locator('img.leaflet-tile').first()).toBeVisible({timeout:30000});
 await expect.poll(()=>frame.locator('img.leaflet-tile').first().evaluate(img=>img.complete&&img.naturalWidth>0),{timeout:30000}).toBe(true);
 await expect(frame.locator('.leaflet-control-attribution')).toContainText('© OpenStreetMap contributors');
 await page.getByRole('button',{name:'Elenco offline',exact:true}).click();
 await page.getByRole('tab',{name:'Percorso',exact:true}).click();
 await page.waitForFunction(()=>navigator.serviceWorker?.controller!==null);
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('parity-preserve-existing-notes'))).toBe('kept');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const icon=await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');expect(icon).toMatch(/icon-[a-f0-9]{16}\.png$/);
 if(!process.env.UNIFIED_BASE_URL){await context.setOffline(true);await page.reload();await expect(page.getByRole('tab')).toHaveText(['Percorso','Studio','Esame','Aree']);await page.getByTestId('subscription-access').click();await expect(page.getByRole('heading',{name:'Fungo Italia completo'})).toBeVisible();await expect.poll(()=>page.evaluate(()=>localStorage.getItem('parity-preserve-existing-notes'))).toBe('kept');await context.setOffline(false);}
 expect(errors).toEqual([]);
 await page.screenshot({path:fileURLToPath(new URL('./unified-phone.png',import.meta.url)),fullPage:true});
 console.log(JSON.stringify({unifiedSmoke:'passed',browser:engine,url:base,tabs:['Percorso','Studio','Esame','Aree'],offline:!process.env.UNIFIED_BASE_URL}));
}finally{await browser.close();server?.kill();}
