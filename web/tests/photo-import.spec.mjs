import {test,expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import {jpegDimensions,sanitizeJpeg,mergeMetadata,validateMetadata} from '../public/photo-core.js';
const TOKEN='github_pat_'+ 'T'.repeat(40);
const REPO='https://api.github.com/repos/gianpaolobol/fungo-italia';
const sha=n=>n.toString(16).padStart(40,'0');
function record(hash='1'.repeat(64)){return {id:'photo-'+hash,file:'images/'+hash+'.jpg',sha256:hash,dimensions:{width:100,height:50},importedAt:'2026-10-06T08:00:00.000Z',source:{kind:'user-provided',publicName:'Foto_'+hash.slice(0,12)+'.jpg'},rights:{attribution:'Autore precedente',license:'rights-reserved',publicationScope:'fungo-italia-authorized',authorization:{method:'uploader-declaration',recordedAt:'2026-10-06T08:00:00.000Z'}},metadataPolicy:'gps-and-exif-removed',identification:{status:'proposed',proposedGenus:'Amanita',proposedSpecies:'Ipotesi precedente',visibleCharacters:[],missingCharacters:[],alternatives:[],references:[{title:'Fonte già presente',location:'p.1'}]}};}
async function fakeGitHub(page,{deny=0,existing=[],conflict=false,blobFailures=0}={}){
 const state={head:sha(1),tree:sha(2),exists:true,metadata:{version:1,photos:structuredClone(existing)},requests:[],trees:[],commits:[],blobs:[],moves:0,conflicts:0};
 let serial=10,pending=new Map(),failures=blobFailures;
 await page.route('https://api.github.com/**',async route=>{
  const request=route.request(),method=request.method(),url=new URL(request.url());
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PATCH,OPTIONS'};
  const send=(json,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(json)});
  if(method==='OPTIONS')return send({});
  expect(request.url().startsWith(REPO)).toBe(true);
  expect(request.headers().authorization).toBe('Bearer '+TOKEN);
  const body=request.postDataJSON();state.requests.push({method,path:url.pathname,body});
  if(deny)return send({message:'Denied'},deny);
  const path=url.pathname.slice(new URL(REPO).pathname.length);
  if(path==='')return send({full_name:'gianpaolobol/fungo-italia',private:false,permissions:{push:true}});
  if(path==='/git/ref/heads/photo-library')return send({object:{sha:state.head}});
  if(path.startsWith('/git/commits/')&&method==='GET')return send({tree:{sha:state.tree}});
  if(path==='/contents/photo-library/metadata.json'){expect(url.searchParams.get('ref')).toBe(state.head);return send({encoding:'base64',size:100,content:Buffer.from(JSON.stringify(state.metadata)).toString('base64')});}
  if(path==='/git/blobs'&&method==='POST'){
   if(failures-->0)return send({message:'Temporary failure'},503);
   state.blobs.push(Buffer.from(body.content,'base64'));return send({sha:sha(++serial)},201);
  }
  if(path==='/git/trees'&&method==='POST'){const treeSha=sha(++serial);state.trees.push(body);pending.set(treeSha,JSON.parse(body.tree.find(t=>t.path==='photo-library/metadata.json').content));return send({sha:treeSha},201);}
  if(path==='/git/commits'&&method==='POST'){const commitSha=sha(++serial);state.commits.push(body);pending.set(commitSha,{tree:body.tree,metadata:pending.get(body.tree)});return send({sha:commitSha},201);}
  if(path==='/git/refs/heads/photo-library'&&method==='PATCH'){
   state.moves++;expect(body.force).toBe(false);
   if(conflict&&state.conflicts++===0){state.head=sha(90);state.tree=sha(91);state.metadata.photos[0].identification={status:'reviewed',proposedGenus:'Amanita',proposedSpecies:'Revisione concorrente',visibleCharacters:[],missingCharacters:[],alternatives:[],references:[{title:'Riferimento preservato',location:'p.2'}],review:{reviewer:'Curatore test',date:'2026-10-06',method:'Revisione di prova',evidence:'Fixture tecnica'}};return send({message:'Conflict'},409);}
   const committed=pending.get(body.sha);state.head=body.sha;state.tree=committed.tree;state.metadata=committed.metadata;return send({object:{sha:state.head}});
  }
  throw Error('Unexpected mocked API request '+method+' '+path);
 });
 return state;
}
async function fixture(page,width=2400,height=1200,color='#357c46'){
 return Buffer.from(await page.evaluate(({width,height,color})=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,width,height);return canvas.toDataURL('image/png').split(',')[1];},{width,height,color}),'base64');
}
async function choose(page,buffer,name='private-original-location.png'){
 await page.waitForFunction(()=>typeof document.getElementById('photos').onchange==='function');
 await page.locator('#photos').setInputFiles({name,mimeType:'image/png',buffer});
 await expect(page.locator('#queue-count')).toContainText('1 copie pronte');
 await expect(page.locator('#choose')).toBeEnabled();
}
async function connect(page){
 await page.locator('#token').fill(TOKEN);await page.locator('#connect').click();
 await expect(page.locator('#connection')).toContainText('Collegato a');
 await expect(page.locator('#token')).toHaveValue('');
}
async function publish(page){
 await page.locator('#credit').fill('Raccolta personale');
 await page.locator('#consent').check();await page.locator('#upload').click();
 await expect(page.locator('#status')).toContainText('Lotto registrato',{timeout:15000});
}
async function tokenAbsent(page){
 const storage=await page.evaluate(async()=>({local:Object.entries(localStorage),session:Object.entries(sessionStorage),databases:typeof indexedDB.databases==='function'?await indexedDB.databases():[],html:document.documentElement.outerHTML}));
 expect(JSON.stringify(storage)).not.toContain(TOKEN);
 expect(await page.locator('#token').inputValue()).toBe('');
}
function jpegMetadataMarkers(bytes){
 const markers=[];let at=2;
 while(at<bytes.length){expect(bytes[at++]).toBe(255);while(bytes[at]===255)at++;const marker=bytes[at++];if(marker===218||marker===217)break;const length=bytes.readUInt16BE(at);markers.push(marker);at+=length;}
 return markers;
}
test('photo picker converts locally; one atomic unresolved batch deduplicates repeated imports',async({page})=>{
 const git=await fakeGitHub(page);await page.goto('./importa-foto.html');
 await expect(page.locator('#photos')).toHaveAttribute('multiple','');
 await expect(page.locator('#capture')).toHaveAttribute('capture','environment');
 const png=await fixture(page);await choose(page,png);
 expect(git.requests).toHaveLength(0);
 await expect(page.locator('#queue')).toContainText('1600 × 800');
 await connect(page);await tokenAbsent(page);await publish(page);
 expect(git.blobs).toHaveLength(1);expect(git.trees).toHaveLength(1);expect(git.commits).toHaveLength(1);expect(git.moves).toBe(1);
 const bytes=git.blobs[0];expect(bytes.subarray(0,2)).toEqual(Buffer.from([255,216]));expect(bytes.length).toBeLessThanOrEqual(2*1024*1024);
 expect(jpegMetadataMarkers(bytes).some(m=>(m>=225&&m<=239)||m===254)).toBe(false);
 const photo=git.metadata.photos[0];expect(photo.sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
 expect(photo.dimensions).toEqual({width:1600,height:800});expect(photo.identification).toEqual({status:'unresolved',proposedGenus:null,proposedSpecies:null,visibleCharacters:[],missingCharacters:[],alternatives:[],references:[]});
 expect(photo.rights.license).toBe('rights-reserved');expect(JSON.stringify(git.metadata)).not.toContain('private-original-location');
 expect(git.trees[0].base_tree).toBe(sha(2));expect(git.commits[0].parents).toEqual([sha(1)]);
 expect(git.trees[0].tree.map(t=>t.path)).toEqual(['photo-library/'+photo.file,'photo-library/metadata.json']);
 await tokenAbsent(page);await choose(page,png);await connect(page);await publish(page);
 await expect(page.locator('#status')).toContainText('0 nuove fotografie · 1 già presenti');
 expect(git.blobs).toHaveLength(1);expect(git.moves).toBe(1);expect(git.metadata.photos).toHaveLength(1);await tokenAbsent(page);
});
for(const status of [401,403])test('GitHub '+status+' leaves prepared photos local and publishes nothing',async({page})=>{
 const git=await fakeGitHub(page,{deny:status});await page.goto('./importa-foto.html');await choose(page,await fixture(page));
 await page.locator('#token').fill(TOKEN);await page.locator('#connect').click();
 await expect(page.locator('#error')).toContainText(status===401?'scaduta o non valida':'Contents read/write');
 await expect(page.locator('#upload')).toBeDisabled();await expect(page.locator('#queue-count')).toContainText('1 copie pronte');
 expect(git.blobs).toHaveLength(0);expect(git.moves).toBe(0);
 await page.locator('#forget').click();await tokenAbsent(page);
});
test('branch conflict rebases the import and preserves a concurrent scientific review',async({page})=>{
 const git=await fakeGitHub(page,{existing:[record()],conflict:true});await page.goto('./importa-foto.html');
 await choose(page,await fixture(page));await connect(page);await publish(page);
 expect(git.blobs).toHaveLength(1);expect(git.trees).toHaveLength(2);expect(git.commits).toHaveLength(2);expect(git.moves).toBe(2);
 expect(git.trees[1].base_tree).toBe(sha(91));expect(git.commits[1].parents).toEqual([sha(90)]);
 expect(git.metadata.photos).toHaveLength(2);expect(git.metadata.photos[0].identification.proposedSpecies).toBe('Revisione concorrente');
 expect(git.metadata.photos[0].identification.references).toEqual([{title:'Riferimento preservato',location:'p.2'}]);
 expect(git.metadata.photos[0].identification.review.reviewer).toBe('Curatore test');
 expect(git.metadata.photos[1].identification.status).toBe('unresolved');await tokenAbsent(page);
});
test('temporary blob failures retry without extra commits or duplicate records',async({page})=>{
 const git=await fakeGitHub(page,{blobFailures:2});await page.goto('./importa-foto.html');
 await choose(page,await fixture(page));await connect(page);await publish(page);
 expect(git.requests.filter(r=>r.path.endsWith('/git/blobs'))).toHaveLength(3);
 expect(git.moves).toBe(1);expect(git.metadata.photos).toHaveLength(1);await tokenAbsent(page);
});
test('warm service worker opens the importer without the origin and prepares images offline',async({page,request})=>{
 await page.goto('./');await page.waitForFunction(()=>document.querySelector('#network').textContent.includes('Catalogo offline'));
 await page.evaluate(()=>{window.__oldDocument=true;});await request.get('http://127.0.0.1:4174/?state=stop');
 try{
  const response=await page.goto('./importa-foto.html');expect(response.status()).toBe(200);expect(response.fromServiceWorker()).toBe(true);
  expect(await page.evaluate(()=>window.__oldDocument)).toBeUndefined();
  await expect(page.getByRole('heading',{name:'Foto dal telefono a GitHub'})).toBeVisible();
  await choose(page,await fixture(page,200,100));await expect(page.locator('#queue')).toContainText('200 × 100');
  await expect(page.locator('#upload')).toBeDisabled();await tokenAbsent(page);
 }finally{await request.get('http://127.0.0.1:4174/?state=start');}
});

test('malformed JPEG frame and missing scans cannot pass integrity checks',()=>{
 expect(()=>jpegDimensions(Uint8Array.from([255,216,255,192,0,2,255,217]))).toThrow();
 expect(()=>sanitizeJpeg(Uint8Array.from([255,216,255,217]))).toThrow();
});
test('a damaged or over-capacity manifest is rejected before publication',()=>{
 const r=record();delete r.dimensions;
 expect(()=>validateMetadata({version:1,photos:[r]})).toThrow();
 const photos=Array.from({length:10000},(_,n)=>record(n.toString(16).padStart(64,'0')));
 expect(()=>mergeMetadata({version:1,photos},[record('f'.repeat(64))])).toThrow();
 const large=record();large.identification.visibleCharacters=['è'.repeat(5*1024*1024)];
 expect(()=>mergeMetadata({version:1,photos:[]},[large])).toThrow();
});
