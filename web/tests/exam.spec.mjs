import {test,expect} from '@playwright/test';
async function openExam(page,mode){await page.goto('./');await page.getByRole('button',{name:'Test fotografico · 15 funghi',exact:true}).click();await page.getByRole('button',{name:mode==='exam'?'Simulazione · correzione dopo 15':'Allenamento · correzione immediata',exact:true}).click();}
test('15-case simulation hides names, resumes locally and separates manual explanations from automatic grading',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await openExam(page,'exam');
 const session=await page.evaluate(()=>JSON.parse(localStorage.getItem('fungo-italia:photo-exam:v1')));
 const data=await (await page.request.get('data.json')).json();
 const cases=session.ids.map(id=>data.examBank.find(c=>c.id===id));
 await expect(page.locator('#detail-body')).not.toContainText(cases[0].name);
 await expect(page.locator('#detail-body img').first()).toHaveAttribute('alt',/Esemplare da identificare/);
 await page.locator('#exam-name').fill(cases[0].name);
 await page.locator('#exam-category').selectOption(cases[0].category);
 await page.locator('#exam-detail').fill('Spiegazione da valutare separatamente.');
 await page.reload();await page.getByRole('button',{name:'Test fotografico · 15 funghi',exact:true}).click();await page.getByRole('button',{name:'Riprendi sessione (1/15)',exact:true}).click();
 await expect(page.locator('#exam-name')).toHaveValue(cases[0].name);
 for(let i=0;i<15;i++){
  await expect(page.locator('#detail-body h2')).toHaveText('Esemplare '+(i+1)+' di 15');
  if(i>0){await page.locator('#exam-name').fill(cases[i].name);await page.locator('#exam-category').selectOption(cases[i].category);}
  await page.getByRole('button',{name:i===14?'Concludi e correggi':'Salva e continua',exact:true}).click();
 }
 await expect(page.locator('#detail-body')).toContainText('Identificazione: 15/15 corrette');
 await expect(page.locator('#detail-body')).toContainText('Commestibilità: 15/15 corrette');
 await expect(page.locator('#detail-body')).toContainText('da autovalutare');
 const i=cases.findIndex(c=>c.detailKind);await page.locator('[data-exam-action="review"][data-exam-id="'+i+'"]').click();
 await expect(page.locator('#detail-body')).toContainText('Autovalutazione: da confermare');
 await page.getByRole('button',{name:'Completa',exact:true}).click();await expect(page.getByRole('button',{name:'Completa',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Torna ai risultati',exact:true}).click();
 expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('training gives immediate correction, flags dangerous category and can enlarge an anonymous photo',async({page})=>{
 await openExam(page,'training');
 await page.locator('#detail-body .exam-photo').first().click();await expect(page.locator('.exam-photo-large')).toHaveCount(1);await page.locator('.exam-photo-large').click();
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('fungo-italia:photo-exam:v1'))),d=await (await page.request.get('data.json')).json();
 const c=d.examBank.find(c=>c.id===s.ids[0]);await page.locator('#exam-category').selectOption('free');await page.getByRole('button',{name:'Confronta la risposta',exact:true}).click();
 await expect(page.locator('#detail-body h2')).toHaveText(c.name);
 if(!['free','conditional'].includes(c.category)||c.category==='conditional')await expect(page.locator('#detail-body')).toContainText('Errore alimentare pericoloso');
 await page.getByRole('button',{name:'Prossimo esemplare',exact:true}).click();await expect(page.locator('#detail-body h2')).toHaveText('Esemplare 2 di 15');
});
test('photo exam resumes all downloaded session photos after offline reload',async({page,context})=>{
 await openExam(page,'exam');await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 await page.getByRole('button',{name:'Scarica foto della sessione',exact:true}).click();await expect(page.locator('#detail-body')).toContainText('Foto della sessione pronte offline');
 await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Test fotografico · 15 funghi',exact:true}).click();await page.getByRole('button',{name:'Riprendi sessione (1/15)',exact:true}).click();
 for(let i=0;i<15;i++){
  await expect(page.locator('#detail-body h2')).toHaveText('Esemplare '+(i+1)+' di 15');for(const image of await page.locator('#detail-body img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);}
  await page.getByRole('button',{name:i===14?'Concludi e correggi':'Salva e continua',exact:true}).click();
 }
 await expect(page.locator('#detail-body')).toContainText('Sessione conclusa');
});
