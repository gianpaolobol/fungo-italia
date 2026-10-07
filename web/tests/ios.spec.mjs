import {test,expect,chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const studyKey='fungo-italia:pwa:study:v1',notesKey='fungo-italia:pwa:notes:v1';
async function ready(page){await page.goto('./');await expect(page.getByRole('heading',{name:'Studio e atlante'})).toBeVisible();await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);}
test('iPhone 320: fresh navigation with unreachable origin preserves search, favorites and Amiata vector map',async({page,context,browser,request},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await ready(page);await expect(page.locator('#catalog-count')).toContainText('148 schede');
 await expect(page.locator('body')).toHaveJSProperty('scrollWidth',320);
 await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill('Amanita');
 await page.getByRole('button',{name:/^Apri Amanita/}).first().click();
 await expect(page.getByRole('heading',{name:'Caratteri di studio'})).toBeVisible();
 await page.locator('#detail').getByRole('button',{name:'Salva preferito',exact:true}).click();
 await expect(page.locator('#detail').getByRole('button',{name:'Rimuovi preferito',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Successiva →',exact:true}).click();await expect(page.locator('#position')).toContainText('2 /');
 await page.getByRole('button',{name:'← Precedente',exact:true}).click();
 await page.getByRole('button',{name:'Torna',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#network').textContent.includes('Catalogo offline'));
 await page.evaluate(()=>{window.__oldDocument=true;});
 await request.get('http://127.0.0.1:4174/?state=stop');
 try{
 // Playwright WebKit offline emulation breaks service workers (#42775). Stop the real origin instead; do not ignore navigation errors.
 const response=await page.goto('./?cold='+Date.now());
 expect(response.status()).toBe(200);expect(response.fromServiceWorker()).toBe(true);
 expect(await page.evaluate(()=>window.__oldDocument)).toBeUndefined();
 const clean=await browser.newContext();try{const probe=await clean.newPage();await expect(probe.goto('http://127.0.0.1:4173/fungo-italia/')).rejects.toThrow();}finally{await clean.close();}
 await expect(page.locator('#catalog-count')).toContainText('148 schede · 1 preferito');
 await page.getByRole('button',{name:'Preferiti',exact:true}).click();await expect(page.locator('#catalog-count')).toContainText('1 scheda');
 await page.getByRole('button',{name:'Aree',exact:true}).click();
 await expect(page.getByText('71 macroaree in 20 regioni.',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'Monte Amiata',exact:true}).click();await expect(page.locator('#area-count')).toHaveText('1 area corrispondente');
 await page.getByRole('button',{name:'Mappa',exact:true}).click();
 await page.locator('#map').scrollIntoViewIfNeeded();await expect(page.locator('#map')).toBeVisible();await expect(page.locator('.leaflet-interactive')).toHaveCount(1);
 await expect(page.locator('#map-status')).toContainText('I punti');
 await page.getByRole('button',{name:/^Consulta .*Amiata/}).click();
 await expect(page.locator('#detail-body')).toContainText('42.89');await expect(page.locator('#detail-body')).toContainText('11.63');
 await page.getByRole('button',{name:'Torna',exact:true}).click();
 await page.screenshot({path:testInfo.outputPath('iphone-320-offline-amiata.png'),fullPage:true});
 expect(errors).toEqual([]);
 }finally{await request.get('http://127.0.0.1:4174/?state=start');}
});
test('private draft survives reload; JSON excludes coordinates unless opted in; invalid date is rejected',async({page},testInfo)=>{
 await ready(page);await page.getByRole('button',{name:'Note',exact:true}).click();await page.getByRole('button',{name:'Nuova bozza',exact:true}).click();
 await page.getByLabel('Ipotesi tassonomica',{exact:true}).fill('Ipotesi Amanita');
 await page.getByLabel('Caratteri osservati',{exact:true}).fill('Gambo intero osservato. Determinazione da verificare.');
 await page.getByLabel('Latitudine facoltativa',{exact:true}).fill('42,89');await page.getByLabel('Longitudine facoltativa',{exact:true}).fill('11,63');
 await page.reload();await page.getByRole('button',{name:'Note',exact:true}).click();
 await expect(page.getByLabel('Ipotesi tassonomica',{exact:true})).toHaveValue('Ipotesi Amanita');
 let downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Scarica JSON',exact:true}).click();
 let download=await downloadPromise,payload=JSON.parse(await readFile(await download.path(),'utf8'));
 expect(payload.status).toBe('local-unreviewed-draft');expect(payload.privateCoordinates).toBeUndefined();expect(payload.observation.latitude).toBeUndefined();expect(payload.observation.characters).toContain('Gambo intero');
 await page.locator('#include-coordinates').check();
 downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Scarica JSON',exact:true}).click();download=await downloadPromise;payload=JSON.parse(await readFile(await download.path(),'utf8'));
 expect(payload.privateCoordinates).toEqual({latitude:42.89,longitude:11.63});
 await page.getByLabel('Data (AAAA-MM-GG)',{exact:true}).fill('2026-02-31');await page.getByRole('button',{name:'Scarica JSON',exact:true}).click();
 await expect(page.locator('#draft-error')).toContainText('data reale');
 await page.screenshot({path:testInfo.outputPath('iphone-320-draft-validation.png'),fullPage:true});
});
test('malformed storage is preserved; scrolling catalog and group sources remain reachable',async({page})=>{
 await page.addInitScript(({studyKey,notesKey})=>{localStorage.setItem(studyKey,'{broken-study');localStorage.setItem(notesKey,'{broken-notes');},{studyKey,notesKey});
 await ready(page);await page.locator('#layer').selectOption('groups');await expect(page.locator('#catalog-count')).toContainText('66 schede');
 await page.getByRole('button',{name:'Elenco',exact:true}).click();await expect(page.getByRole('button',{name:'Lettura continua',exact:true})).toBeVisible();
 await page.getByRole('heading',{name:'Schede collegate'}).first().scrollIntoViewIfNeeded();await expect(page.getByRole('heading',{name:'Schede collegate'}).first()).toBeInViewport();
 await page.locator('#cards').getByRole('button',{name:'Salva preferito',exact:true}).first().click();
 expect(await page.evaluate(key=>localStorage.getItem(key),studyKey)).toBe('{broken-study');
 await page.getByRole('button',{name:'Note',exact:true}).click();await expect(page.getByText('Bozze non leggibili.',{exact:false})).toBeVisible();
 expect(await page.evaluate(key=>localStorage.getItem(key),notesKey)).toBe('{broken-notes');
});

test('current concept names find canonical learning units and diagnostic conditions are preserved',async({page})=>{
 await ready(page);
 for(const name of ['Coprinopsis atramentaria','Infundibulicybe gibba','Leucocoprinus leucothites']){
  await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill(name);
  await expect(page.locator('#cards .heading')).not.toHaveCount(0);
 }
 const catalog=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8'));
 const hostKnown=catalog.find(t=>t.diagnosticStatus==='field_high_confidence_when_host_known');
 await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill(hostKnown.scientificName);
 await page.getByRole('button',{name:'Apri '+hostKnown.scientificName,exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('Ospite ed ecologia devono essere noti');
 await page.getByRole('button',{name:'Torna',exact:true}).click();
 await expect(page.getByRole('button',{name:'Riprendi '+hostKnown.scientificName,exact:true})).toBeVisible();
 await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill('');await page.locator('#layer').selectOption('groups');
 await page.getByRole('button',{name:'Apri Agaricus',exact:true}).click();await page.getByRole('button',{name:'Torna',exact:true}).click();
 await page.reload();await expect(page.locator('#catalog-count')).toContainText('148 schede');
 await page.getByRole('button',{name:'Riprendi Agaricus',exact:true}).click();
 await expect(page.locator('#position')).toContainText('1 / 66');
 await expect(page.getByRole('button',{name:'Successiva →',exact:true})).toBeEnabled();
});
test('failed storage keeps unsaved draft visible and private backup includes in-memory changes',async({page})=>{
 await ready(page);
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Quota full','QuotaExceededError');};});
 await page.getByRole('button',{name:'Note',exact:true}).click();await page.getByRole('button',{name:'Nuova bozza',exact:true}).click();
 await page.getByLabel('Ipotesi tassonomica',{exact:true}).fill('Bozza non salvata');
 await page.getByRole('button',{name:'Studio',exact:true}).click();await page.getByRole('button',{name:'Note',exact:true}).click();
 await expect(page.locator('#save-warning')).toContainText('modifiche restano in memoria');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Scarica backup locale',exact:true}).click();
 const download=await downloadPromise,payload=JSON.parse(await readFile(await download.path(),'utf8'));
 expect(payload.notesSnapshot.drafts[0].taxon).toBe('Bozza non salvata');expect(payload.unsavedChanges.notes).toBe(true);expect(payload.notesRaw).toBeNull();
});
test('server 503 falls back to installed offline package',async({page,request})=>{
 await ready(page);await page.waitForFunction(()=>document.querySelector('#network').textContent.includes('Catalogo offline'));
 try{await request.get('http://127.0.0.1:4173/fungo-italia/__test/fault?status=503');await page.reload();await expect(page.getByRole('heading',{name:'Studio e atlante'})).toBeVisible();await expect(page.locator('#catalog-count')).toContainText('148 schede');}
 finally{await request.get('http://127.0.0.1:4173/fungo-italia/__test/fault?status=0');}
});

test('Chromium: true offline flag and new document restore the installed catalog',async()=>{
 const browser=await chromium.launch();try{const context=await browser.newContext({viewport:{width:320,height:568}});const page=await context.newPage();await page.goto('http://127.0.0.1:4173/fungo-italia/');await page.waitForFunction(()=>document.querySelector('#network').textContent.includes('Catalogo offline'));await page.evaluate(()=>{window.__oldDocument=true;});await context.setOffline(true);const response=await page.reload();expect(response.fromServiceWorker()).toBe(true);expect(await page.evaluate(()=>window.__oldDocument)).toBeUndefined();await expect(page.locator('#catalog-count')).toContainText('148 schede');await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill('Amanita');await page.getByRole('button',{name:/^Apri Amanita/}).first().click();await expect(page.getByRole('heading',{name:'Caratteri di studio'})).toBeVisible();await page.getByRole('button',{name:'Torna',exact:true}).click();await page.getByRole('button',{name:'Aree',exact:true}).click();await page.getByRole('button',{name:'Monte Amiata',exact:true}).click();await page.getByRole('button',{name:'Mappa',exact:true}).click();await expect(page.locator('.leaflet-interactive')).toHaveCount(1);await expect(page.locator('#map-status')).toContainText('Senza rete');}finally{await browser.close();}
});

test('restricted search expands the catalog without losing its query',async({page})=>{
 const catalog=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8')),name=catalog[0].scientificName;
 await ready(page);await page.locator('#layer').selectOption('groups');await page.getByRole('button',{name:'Preferiti',exact:true}).click();await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill(name);
 await expect(page.locator('#catalog-count')).toContainText('0 schede');await page.getByRole('button',{name:'Cerca in tutto il catalogo',exact:true}).click();
 await expect(page.locator('#layer')).toHaveValue('all');await expect(page.getByRole('button',{name:'Preferiti',exact:true})).toHaveAttribute('aria-pressed','false');await expect(page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'})).toHaveValue(name);await expect(page.getByRole('button',{name:'Apri '+name,exact:true})).toBeVisible();
});
test('removing the current favorite keeps remaining details reachable',async({page})=>{
 const items=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8')).slice(0,3);
 await page.addInitScript(({studyKey,ids})=>localStorage.setItem(studyKey,JSON.stringify({version:1,favoriteIds:ids,resumeId:null})),{studyKey,ids:items.map(t=>t.id)});
 await ready(page);await page.getByRole('button',{name:'Preferiti',exact:true}).click();await page.getByRole('button',{name:'Apri '+items[1].scientificName,exact:true}).click();await expect(page.locator('#position')).toHaveText('2 / 3');await page.locator('#detail').getByRole('button',{name:'Rimuovi preferito',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText(items[2].scientificName);await expect(page.locator('#position')).toHaveText('2 / 2');await page.getByRole('button',{name:'← Precedente',exact:true}).click();await expect(page.locator('#detail-body')).toContainText(items[0].scientificName);await page.getByRole('button',{name:'Successiva →',exact:true}).click();
 await page.locator('#detail').getByRole('button',{name:'Rimuovi preferito',exact:true}).click();await expect(page.locator('#detail-body')).toContainText(items[0].scientificName);await expect(page.locator('#position')).toHaveText('1 / 1');await page.locator('#detail').getByRole('button',{name:'Rimuovi preferito',exact:true}).click();await expect(page.locator('#detail')).not.toBeVisible();await expect(page.locator('#catalog-count')).toContainText('0 schede');
});
function backupUpload(payload){return {name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))};}
function importDraft(id='import-test',taxon='Bozza importata'){return {id,updatedAt:'2026-10-06T10:00:00.000Z',date:'2026-10-06',taxon,habitat:'',characters:'Lamelle osservate',evidence:'',sources:'',notes:'',latitude:'',longitude:''};}
test('backup preview requires confirmation and merges existing drafts',async({page})=>{
 const catalog=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8'));await ready(page);await page.getByRole('button',{name:'Note',exact:true}).click();await page.getByRole('button',{name:'Nuova bozza',exact:true}).click();await page.getByLabel('Ipotesi tassonomica',{exact:true}).fill('Bozza già presente');
 const before=await page.evaluate(({studyKey,notesKey})=>({study:localStorage.getItem(studyKey),notes:localStorage.getItem(notesKey)}),{studyKey,notesKey});
 const payload={format:'fungo-italia-private-backup',version:1,studySnapshot:{version:1,favoriteIds:[catalog[0].id],resumeId:null},notesSnapshot:{version:1,drafts:[importDraft()]}};
 let pending=page.waitForEvent('dialog'),importing=page.locator('#restore-backup').setInputFiles(backupUpload(payload)),dialog=await pending;expect(dialog.type()).toBe('confirm');expect(dialog.message()).toContain('1 nuovi preferiti e 1 nuove bozze');await dialog.dismiss();await importing;
 expect(await page.evaluate(key=>localStorage.getItem(key),notesKey)).toBe(before.notes);expect(await page.evaluate(key=>localStorage.getItem(key),studyKey)).toBe(before.study);
 pending=page.waitForEvent('dialog');importing=page.locator('#restore-backup').setInputFiles(backupUpload(payload));dialog=await pending;await dialog.accept();await importing;await expect(page.locator('#status')).toContainText('Backup unito ai dati locali.');
 const stored=await page.evaluate(({studyKey,notesKey})=>({study:JSON.parse(localStorage.getItem(studyKey)),notes:JSON.parse(localStorage.getItem(notesKey))}),{studyKey,notesKey});expect(stored.study.favoriteIds).toContain(catalog[0].id);expect(stored.notes.drafts.map(d=>d.taxon).sort()).toEqual(['Bozza già presente','Bozza importata'].sort());
});
test('backup ID collision preserves both drafts and repeated import is idempotent',async({page})=>{
 await page.addInitScript(({notesKey,draft})=>localStorage.setItem(notesKey,JSON.stringify({version:1,drafts:[draft]})),{notesKey,draft:importDraft('same-id','Originale')});await ready(page);await page.getByRole('button',{name:'Note',exact:true}).click();
 const payload={format:'fungo-italia-private-backup',version:1,studySnapshot:null,notesSnapshot:{version:1,drafts:[importDraft('same-id','Importata diversa')]}};
 for(let i=0;i<2;i++){const pending=page.waitForEvent('dialog'),importing=page.locator('#restore-backup').setInputFiles(backupUpload(payload)),dialog=await pending;await dialog.accept();await importing;await expect(page.locator('#status')).toContainText('Backup unito ai dati locali.');}
 const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).drafts,notesKey);expect(saved).toHaveLength(2);expect(new Set(saved.map(d=>d.id)).size).toBe(2);expect(saved.map(d=>d.taxon).sort()).toEqual(['Originale','Importata diversa'].sort());
});
test('backup import preserves corrupted local storage',async({page})=>{
 await page.addInitScript(({studyKey,notesKey})=>{localStorage.setItem(studyKey,'{broken-study');localStorage.setItem(notesKey,'{broken-notes');},{studyKey,notesKey});await ready(page);await page.getByRole('button',{name:'Note',exact:true}).click();let dialogs=0;page.on('dialog',async d=>{dialogs++;await d.dismiss();});
 await page.locator('#restore-backup').setInputFiles(backupUpload({format:'fungo-italia-private-backup',version:1,notesSnapshot:{version:1,drafts:[importDraft()]}}));await expect(page.locator('#status')).toContainText('Ripristino sospeso');expect(dialogs).toBe(0);expect(await page.evaluate(key=>localStorage.getItem(key),studyKey)).toBe('{broken-study');expect(await page.evaluate(key=>localStorage.getItem(key),notesKey)).toBe('{broken-notes');
});
test('backup import rejects unknown catalog IDs without modifying storage',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Note',exact:true}).click();const before=await page.evaluate(key=>localStorage.getItem(key),studyKey);let dialogs=0;page.on('dialog',async d=>{dialogs++;await d.dismiss();});
 await page.locator('#restore-backup').setInputFiles(backupUpload({format:'fungo-italia-private-backup',version:1,studySnapshot:{version:1,favoriteIds:['invalid-taxon'],resumeId:null},notesSnapshot:{version:1,drafts:[]}}));await expect(page.locator('#status')).toContainText('Preferiti o scheda di ripresa non validi');expect(dialogs).toBe(0);expect(await page.evaluate(key=>localStorage.getItem(key),studyKey)).toBe(before);
});
test('scrolling study saves the visible learning unit for resume',async({page})=>{
 const catalog=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8'));await ready(page);await page.getByRole('button',{name:'Elenco',exact:true}).click();
 await page.evaluate(()=>{const root=document.querySelector('#main'),card=document.querySelectorAll('#cards article')[1];root.scrollTop+=card.getBoundingClientRect().top-root.getBoundingClientRect().top+20;});
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}').resumeId,studyKey)).toBe(catalog[1].id);await page.reload();await expect(page.getByRole('button',{name:'Riprendi '+catalog[1].scientificName,exact:true})).toBeVisible();
});
test('keyboard detail navigation restores focus to the opener',async({page})=>{
 await ready(page);const opener=page.getByRole('button',{name:/^Apri /}).first();await opener.focus();await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'Torna',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(page.locator('#detail')).not.toBeVisible();await expect(opener).toBeFocused();
});
test('study library shows bibliography without audit coverage statistics',async({page})=>{
 await ready(page);await page.locator('#scientific-coverage summary').click();const exported=JSON.parse(await readFile('../dist-ios/data.json','utf8'));
 const expectedUrls=[...new Set(exported.bibliography.filter(s=>s.url&&!/^(S1-|S2-|AUDIT-|EDITORIAL-)/.test(s.sourceId||'')&&!/^Scientific Baseline\b/.test(s.title)).map(s=>s.url))];
 await expect(page.locator('#scientific-coverage a')).toHaveCount(expectedUrls.length);
 const actualUrls=await page.locator('#scientific-coverage a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
 expect([...actualUrls].sort()).toEqual([...expectedUrls].sort());await expect(page.locator('#scientific-coverage')).not.toContainText('Scientific Baseline');await expect(page.locator('#scientific-coverage')).not.toContainText('Sintesi editoriale');await expect(page.locator('#scientific-coverage')).not.toContainText('7/148');
});

test('common-name search reaches porcini and preserves the non-unique prugnolo mapping',async({page})=>{
 await ready(page);const search=page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'});
 await search.fill('porcini');await expect(page.getByRole('button',{name:'Apri Boletus edulis s.l.',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Apri Boletus edulis s.l.',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('Regione del Veneto');await expect(page.locator('#detail-body a')).not.toHaveCount(0);
 await page.getByRole('button',{name:'Torna',exact:true}).click();await search.fill('prugnolo');
 await expect(page.getByRole('button',{name:'Apri Calocybe gambosa',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Apri Clitopilus prunulus s.l.',exact:true})).toBeVisible();
});
test('supplementary habitat and comparisons keep their field-specific sources visible',async({page})=>{
 await ready(page);await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill('Amanita caesarea');
 await page.getByRole('button',{name:'Apri Amanita caesarea',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('Boschi luminosi di latifoglie');
 await expect(page.locator('#detail-body')).toContainText('Amanita phalloides');
 await expect(page.locator('#detail-body')).toContainText('Provincia di Cuneo');
 await expect(page.locator('#detail-body')).not.toContainText('Non valida i tre caratteri di campo');
});

test('scientific contribution opens the real public repository form without sending local drafts',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Contributi',exact:true}).click();
 const link=page.getByRole('link',{name:/Proponi una correzione scientifica su GitHub/});
 await expect(link).toHaveAttribute('href','https://github.com/gianpaolobol/fungo-italia/issues/new?template=scientific-contribution.yml');
 await expect(link).toHaveAttribute('rel','noopener noreferrer');
 await expect(page.locator('#main')).toContainText('La proposta sarà pubblica');
 await expect(page.locator('#main')).toContainText('Sarà verificata prima di aggiornare l’atlante');
 await expect(page.locator('#main details')).not.toHaveAttribute('open');
});

test('complete 3+1 appears in detail and continuous reading',async({page})=>{
 const catalog=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8')),taxon=catalog[0];
 await ready(page);await page.getByRole('button',{name:'Apri '+taxon.scientificName,exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText(taxon.differentiatingCharacter);
 await expect(page.getByRole('heading',{name:'Carattere differenziante (+1)',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Torna',exact:true}).click();await page.locator('#feed').click();
 await expect(page.locator('#cards article').first()).toContainText(taxon.differentiatingCharacter);
});
test('active recall hides answer, respects favorite filters and retries missed cards',async({page})=>{
 const catalog=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8')),taxon=catalog[0];
 await page.addInitScript(({studyKey,id})=>localStorage.setItem(studyKey,JSON.stringify({version:1,favoriteIds:[id],resumeId:null})),{studyKey,id:taxon.id});
 await ready(page);await page.getByRole('button',{name:'Preferiti',exact:true}).click();await page.getByRole('button',{name:'Ripasso attivo',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('Scheda 1 di 1');
 await expect(page.locator('#detail-body')).toContainText(taxon.differentiatingCharacter);
 await expect(page.locator('#review-answer')).toHaveCount(0);
 await page.getByRole('button',{name:'Mostra risposta',exact:true}).click();
 await expect(page.locator('#review-answer')).toContainText(taxon.scientificName);
 await page.getByRole('button',{name:'Da ripassare',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('0 schede ricordate · 1 da ripassare');
 await page.getByRole('button',{name:'Ripassa le schede da rivedere',exact:true}).click();
 await expect(page.locator('#review-answer')).toHaveCount(0);await page.getByRole('button',{name:'Mostra risposta',exact:true}).click();
 await page.getByRole('button',{name:'Ricordata',exact:true}).click();await expect(page.locator('#detail-body')).toContainText('1 schede ricordate · 0 da ripassare');
 await expect(page.getByRole('button',{name:'Ripassa le schede da rivedere',exact:true})).toHaveCount(0);
});
test('teaching groups with absent or partial profiles do not fabricate recall questions',async({page})=>{
 await ready(page);await page.locator('#layer').selectOption('groups');
 const search=page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'});
 for(const name of ['Agaricus','Suillus']){
  await search.fill(name);await page.getByRole('button',{name:'Ripasso attivo',exact:true}).click();
  await expect(page.locator('#status')).toContainText('Nessuna scheda 3+1');
  await expect(page.locator('#detail')).not.toBeVisible();
 }
});
test('a sourced complete Boletus teaching profile is available for recall',async({page})=>{
 await ready(page);await page.locator('#layer').selectOption('groups');
 await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill('Boletus s. str.');
 await page.getByRole('button',{name:'Ripasso attivo',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('Scheda 1 di 1');
 await expect(page.locator('#detail-body')).toContainText('patina bianca');
 await expect(page.locator('#review-answer')).toHaveCount(0);
 await page.getByRole('button',{name:'Mostra risposta',exact:true}).click();
 await expect(page.locator('#review-answer')).toContainText('Boletus s. str.');
});
test('Amiata shows regional source and Tenerife creates a private observation',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Aree',exact:true}).click();await page.getByRole('button',{name:'Monte Amiata',exact:true}).click();
 await page.getByRole('button',{name:'Consulta Monte Amiata',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('Prima dell’uscita');await expect(page.locator('#detail-body a[href*="regione.toscana"]')).toHaveCount(1);
 await expect(page.locator('#detail-body')).toContainText('fonte normativa regionale, non verifica della macroarea');
 await page.getByRole('button',{name:'Torna',exact:true}).click();await page.getByRole('button',{name:'Tenerife · preparazione',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('Un permesso per un sentiero non equivale a un permesso di raccolta.');
 await expect(page.locator('#detail-body a[href="https://www.tenerifeon.es/"]')).toHaveCount(1);
 await page.getByRole('button',{name:'Crea osservazione per Tenerife',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Osservazioni offline',exact:true})).toBeVisible();await expect(page.getByLabel('Note',{exact:true})).toHaveValue('Tenerife — località generale: ');
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).drafts.length,notesKey)).toBe(1);
});
test('catalog growth loads with dynamic counts',async({page,context})=>{
 await page.route('**/data.json',async route=>{
  const response=await route.fetch(),data=await response.json();
  data.catalog.push({...data.catalog[0],id:'future-learning-unit',scientificName:'Future learning unit'});
  await route.fulfill({response,json:data});
 });
 await ready(page);await expect(page.locator('#catalog-count')).toContainText('149 schede');await expect(page.locator('#layer option[value="all"]')).toHaveText('Tutte · 215');
});

test('malformed optional taxon fields fail without erasing local notes',async({page})=>{
 await page.addInitScript(({notesKey,draft})=>localStorage.setItem(notesKey,JSON.stringify({version:1,drafts:[draft]})),{notesKey,draft:importDraft('keep-this','Conserva bozza')});
 await page.route('**/data.json',async route=>{const response=await route.fetch(),data=await response.json();data.catalog[0].aliases={broken:true};await route.fulfill({response,json:data});});
 await page.goto('./');await expect(page.getByRole('heading',{name:'Catalogo non disponibile',exact:true})).toBeVisible();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).drafts[0].taxon,notesKey)).toBe('Conserva bozza');
});

test('keyboard recall keeps focus on each new question, answer and summary',async({page})=>{
 const catalog=JSON.parse(await readFile(new URL('../../src/data/catalog.json',import.meta.url),'utf8'));
 await page.addInitScript(({studyKey,id})=>localStorage.setItem(studyKey,JSON.stringify({version:1,favoriteIds:[id],resumeId:null})),{studyKey,id:catalog[0].id});
 await ready(page);await page.getByRole('button',{name:'Preferiti',exact:true}).click();
 const start=page.getByRole('button',{name:'Ripasso attivo',exact:true});await start.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'Quale unità tassonomica?',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Mostra risposta',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('#review-answer > h2')).toBeFocused();
 await page.getByRole('button',{name:'Ricordata',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Sessione conclusa',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.locator('#detail')).not.toBeVisible();await expect(start).toBeFocused();
});

test('Xanthodermatei detail and continuous reading hide internal metadata and repeated identity',async({page})=>{
 await ready(page);const name='Agaricus sez. Xanthodermatei';
 await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill(name);
 await page.getByRole('button',{name:'Apri '+name,exact:true}).click();
 const body=page.locator('#detail-body');await expect(body.locator('h2')).toHaveCount(1);await expect(body.locator('.notice')).toHaveCount(0);
 for(const text of ['Scientific Baseline','Audit interno','revisione','objective-agaricus','Rango:','Unità didattica al rango','Valutazione alimentare non pubblicata'])await expect(body).not.toContainText(text);
 await expect(body).toContainText('Odore fenolico');await expect(body).toContainText('Carattere differenziante (+1)');await expect(body).not.toContainText('Obiettivi tassonomici nella formazione');
 await page.getByRole('button',{name:'Torna',exact:true}).click();await page.getByRole('button',{name:'Elenco',exact:true}).click();
 const card=page.locator('#cards article').first();await expect(card.locator('h2')).toHaveCount(0);await expect(card.locator('.heading strong')).toHaveText(name);await expect(card.locator('.heading span')).toHaveText('Sezione');await expect(card.locator('.notice')).toHaveCount(0);await expect(card).not.toContainText('Scientific Baseline');
});

test('public atlas excludes founding documents while field safety checks stay available',async({page,request})=>{
 const response=await request.get('./data.json'),payload=await response.json();
 const raw=JSON.stringify(payload);
 for(const text of ['S1-obiettivi-tassonomici','S2-guida-ragionata','Scientific Baseline','EDITORIAL-minimum','Obiettivi tassonomici nella formazione','Guida ragionata alla commestibilità'])expect(raw).not.toContain(text);
 expect(payload.catalog).toHaveLength(148);expect(payload.groups).toHaveLength(66);
 await ready(page);await page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'}).fill('Kuehneromyces mutabilis');
 await page.getByRole('button',{name:'Apri Kuehneromyces mutabilis',exact:true}).click();
 await expect(page.locator('#detail-body')).toContainText('Escludere Galerina marginata group');
 await expect(page.locator('#detail-body .notice')).toHaveCount(0);
});

test('mushroom favorites beside names switch white to green, synchronize and survive reload',async({page})=>{
 await ready(page);const card=page.locator('#cards article').first(),toggle=card.locator('.mushroom-toggle');
 await expect(toggle).toHaveAttribute('aria-pressed','false');await expect(toggle).toHaveText('');
 await expect(toggle.locator('svg')).toHaveCSS('fill','rgb(255, 255, 255)');
 await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toHaveAttribute('aria-pressed','true');await expect(toggle).toBeFocused();
 await expect(toggle.locator('svg')).toHaveCSS('fill','rgb(35, 132, 67)');
 await expect(page.locator('#detail')).not.toBeVisible();await expect(page.locator('#catalog-count')).toContainText('1 preferito');
 await card.locator('.heading').click();const detail=page.locator('#detail-body .taxon-title .mushroom-toggle');
 await expect(detail).toHaveAttribute('aria-pressed','true');await detail.click();await expect(detail).toHaveAttribute('aria-pressed','false');
 await detail.click();await page.getByRole('button',{name:'Torna',exact:true}).click();await page.reload();
 await expect(page.locator('#cards article').first().locator('.mushroom-toggle')).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('notes and contributions show concise useful instructions without yellow audit boxes',async({page})=>{
 await ready(page);for(const tab of ['Note','Contributi']){
 await page.getByRole('button',{name:tab,exact:true}).click();await expect(page.locator('#main .notice')).toHaveCount(0);
 for(const text of ['baseline','audit interno','revisione indipendente pendente','non autorizzano il consumo','non è cifrato'])await expect(page.locator('#main')).not.toContainText(text);
 }
 await expect(page.getByRole('link',{name:/Proponi una correzione scientifica su GitHub/})).toBeVisible();
});

test('course corrections and pointwise source pages appear without duplicate document entries',async({page})=>{
 await ready(page);
 const search=page.getByRole('searchbox',{name:'Cerca nome scientifico, comune o sinonimo'});
 await search.fill('Agaricus bresadolanus');
 await page.getByRole('button',{name:'Apri Agaricus bresadolanus',exact:true}).click();
 const detail=page.locator('#detail-body');
 await expect(detail).toContainText('Viraggi deboli e variabili');
 await expect(detail).toContainText('ingiallimento localizzato alla base');
 await expect(detail).toContainText('Ambienti ruderali, parchi e giardini');
 await expect(detail.locator('a[href="https://drive.google.com/file/d/1cK7djdD5tRVpnK46zrsA0ltWl2Hzb_eT/view"]')).toHaveCount(1);
 await expect(detail).toContainText('p. 15');
 await expect(detail).toContainText('p. stampata 114');
 await page.getByRole('button',{name:'Torna',exact:true}).click();
 await search.fill('Foetentinae');
 await page.getByRole('button',{name:'Apri Russula Foetentinae',exact:true}).click();
 await expect(detail).toContainText('mandorle amare o marzapane');
 await expect(detail).not.toContainText('Scientific Baseline');
});
