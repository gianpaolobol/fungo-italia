import {test,expect} from '@playwright/test';
test('published support and privacy remain their own pages under an offline service worker',async({page,request})=>{
 await page.goto('./');await expect(page.getByRole('heading',{name:'Studio e atlante'})).toBeVisible();
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 await page.waitForFunction(()=>document.querySelector('#network').textContent.includes('Catalogo offline'));
 await page.evaluate(()=>localStorage.setItem('fungo-legal-test','preserve'));
 await request.get('http://127.0.0.1:4174/?state=stop');
 try{
  const privacy=await page.goto('./privacy.html');expect(privacy.fromServiceWorker()).toBe(true);
  await expect(page.getByRole('heading',{name:'Informativa sulla privacy – Fungo Italia',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'gianpaolo.franceschini@gmail.com',exact:true})).toHaveAttribute('href','mailto:gianpaolo.franceschini@gmail.com');
  await expect(page.getByRole('heading',{name:'Studio e atlante'})).toHaveCount(0);
  const support=await page.goto('./support.html');expect(support.fromServiceWorker()).toBe(true);
  await expect(page.getByRole('heading',{name:'Assistenza Fungo Italia',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'gianpaolo.franceschini@gmail.com',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('fungo-legal-test'))).toBe('preserve');
 }finally{await request.get('http://127.0.0.1:4174/?state=start');}
});
