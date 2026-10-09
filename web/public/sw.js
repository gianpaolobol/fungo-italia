const PREFIX='fungo-italia-pwa:'+self.registration.scope+':';
const CACHE=PREFIX+'__BUILD_VERSION__';
const FILES=['./','./index.html','./admin-photos.html','./admin-photos-entry.js','./app.js','./exam-core.js','./exam-ui.js','./app.css','./gallery-cleanup.css','./importa-foto.html','./importa-foto.js','./importa-foto.css','./photo-core.js','./admin-photo-core.js','./admin-photos.js','./admin-photos.css','./data.json','./manifest.webmanifest','./icon.png','./vendor/leaflet.js','./vendor/leaflet.css','./vendor/images/layers.png','./vendor/images/layers-2x.png','./vendor/images/marker-icon.png','./vendor/images/marker-icon-2x.png','./vendor/images/marker-shadow.png'];
// Keep large reference photographs out of the atomic install: iOS quota or one
// unavailable photo must not leave an old service worker active indefinitely.
const CORE_FILES=FILES.filter(file=>! /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file)||file==='./icon.png'||file.startsWith('./vendor/'));
function pageFor(url,scope){
 const path=url.pathname;
 if(path===new URL('./admin-photos.html',scope).pathname)return './admin-photos.html';
 if(path===new URL('./importa-foto.html',scope).pathname)return './importa-foto.html';
 return './index.html';
}
async function fetchFreshHtml(request,cache,pageUrl){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3500);
 try{
  const response=await fetch(request,{signal:controller.signal,cache:'no-store'});
  if(response.status>=500)throw Error('Hosting temporarily unavailable');
  if(response.ok&&(response.headers.get('content-type')||'').includes('text/html')){
   const text=await response.clone().text();
   if(text.includes('name="application-name" content="Fungo Italia"'))await cache.put(pageUrl,response.clone());
  }
  return response;
 }finally{clearTimeout(timer);}
}
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(CACHE);await cache.addAll(CORE_FILES);await self.skipWaiting();}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();if(event.data?.type==='CACHE_STATUS'&&event.ports[0])event.waitUntil((async()=>{const cache=await caches.open(CACHE);const available=await Promise.all(CORE_FILES.map(file=>cache.match(new URL(file,self.registration.scope).href)));event.ports[0].postMessage({ready:available.every(Boolean)});})());});
// Explicit, bounded download for one exam; failure never blocks app updates.
self.addEventListener('message',event=>{
 if(event.data?.type!=='CACHE_EXAM_PHOTOS'||!event.ports[0])return;
 const paths=event.data.paths;
 if(!Array.isArray(paths)||paths.length<1||paths.length>45||new Set(paths).size!==paths.length||!paths.every(p=>typeof p==='string'&&p.startsWith('./images/')&&FILES.includes(p))){event.ports[0].postMessage({ready:false});return;}
 event.waitUntil((async()=>{
  let ready=true;
  try{const cache=await caches.open(CACHE);for(const path of paths){const url=new URL(path,self.registration.scope).href;if(!await cache.match(url)){try{const response=await fetch(url);if(!response.ok)throw Error('Photo unavailable');await cache.put(url,response);}catch{ready=false;}}}if(ready)ready=(await Promise.all(paths.map(p=>cache.match(new URL(p,self.registration.scope).href)))).every(Boolean);}
  catch{ready=false;}
  event.ports[0].postMessage({ready});
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const cacheUrl=new URL(pageFor(url,scope),scope).href;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);try{return await fetchFreshHtml(event.request,cache,cacheUrl);}catch{const cached=await cache.match(cacheUrl);return cached||new Response('Prima apertura con connessione necessaria.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}})());return;
 }
 const allowed=FILES.map(path=>new URL(path,scope).href);
 if(!allowed.includes(url.href))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(event.request);if(cached)return cached;const response=await fetch(event.request);if(response.ok){try{await cache.put(event.request,response.clone());}catch{/* A photo cache failure must not block viewing. */}}return response;})());
});
