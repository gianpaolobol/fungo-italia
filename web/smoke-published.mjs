import {chromium,webkit,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const url='https://gianpaolobol.github.io/fungo-italia/';
await mkdir('published-evidence',{recursive:true});
const metadata=await (await fetch(url+'build.json?verify='+Date.now())).json();
if(metadata.sourceCommit!==process.env.GITHUB_SHA)throw Error('Published revision mismatch: '+metadata.sourceCommit);
const results=[];
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch();const context=await browser.newContext({viewport:{width:320,height:740}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto(url);await expect(page.getByRole('heading',{name:'Studio e atlante'})).toBeVisible();
 await expect(page.locator('#catalog-count')).toContainText('148 schede');
 await page.waitForFunction(()=>document.querySelector('#network').textContent.includes('Catalogo offline'));
 await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill('Amanita');
 await page.getByRole('button',{name:/^Apri Amanita/}).first().click();
 await expect(page.getByRole('heading',{name:'Carattere differenziante (+1)',exact:true})).toBeVisible();
 const favorite=page.locator('#detail-body .taxon-title .mushroom-toggle');await expect(favorite).toHaveAttribute('aria-pressed','false');await favorite.click();await expect(favorite).toHaveAttribute('aria-pressed','true');await favorite.click();await expect(favorite).toHaveAttribute('aria-pressed','false');
 await page.getByRole('button',{name:'Successiva →',exact:true}).click();await expect(page.locator('#position')).toContainText('2 /');
 await page.getByRole('button',{name:'Torna',exact:true}).click();
 if(name==='chromium'){
 await page.evaluate(()=>window.__oldDocument=true);await context.setOffline(true);
 const response=await page.goto(url+'?offline='+Date.now());expect(response.fromServiceWorker()).toBe(true);
 expect(await page.evaluate(()=>window.__oldDocument)).toBeUndefined();
 await expect(page.locator('#catalog-count')).toContainText('148 schede');
 }
 await page.getByRole('button',{name:'Ripasso attivo',exact:true}).click();
 await expect(page.locator('#review-answer')).toHaveCount(0);
 await page.getByRole('button',{name:'Mostra risposta',exact:true}).click();
 await expect(page.locator('#review-answer')).toBeVisible();
 await page.getByRole('button',{name:'Torna',exact:true}).click();
 await page.getByRole('button',{name:'Aree',exact:true}).click();
 await page.getByRole('button',{name:'Monte Amiata',exact:true}).click();
 await expect(page.locator('#area-count')).toHaveText('1 area corrispondente');
 await page.getByRole('button',{name:'Mappa',exact:true}).click();
 await expect(page.locator('.leaflet-interactive')).toHaveCount(1);
 await page.screenshot({path:'published-evidence/'+name+'-amiata.png',fullPage:true});
 await page.goto(url+'importa-foto.html');
 await expect(page.getByRole('heading',{name:'Carica immagini'})).toBeVisible();
 await page.waitForFunction(()=>typeof document.getElementById('photos').onchange==='function');
 await expect(page.getByRole('button',{name:'Carica immagini selezionate'})).toBeEnabled();
 await expect(page.getByRole('button')).toHaveCount(1);
 await expect(page.locator('.notice')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'published-evidence/'+name+'-importa-foto.png',fullPage:true});
 expect(errors).toEqual([]);results.push({browser:name,status:'passed',offline:name==='chromium'});
 }finally{await browser.close();}
}
await writeFile('published-evidence/results.json',JSON.stringify({url,metadata,results},null,2));
