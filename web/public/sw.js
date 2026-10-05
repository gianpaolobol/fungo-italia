const PREFIX='fungo-italia-pwa:'+self.registration.scope+':';
const CACHE=PREFIX+'__BUILD_VERSION__';
const FILES=['./','./index.html','./app.js','./app.css','./data.json','./manifest.webmanifest','./icon.png','./vendor/leaflet.js','./vendor/leaflet.css','./vendor/images/layers.png','./vendor/images/layers-2x.png','./vendor/images/marker-icon.png','./vendor/images/marker-icon-2x.png','./vendor/images/marker-shadow.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(CACHE);await cache.addAll(FILES);}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();if(event.data?.type==='CACHE_STATUS'&&event.ports[0])event.waitUntil((async()=>{const cache=await caches.open(CACHE);const available=await Promise.all(FILES.map(file=>cache.match(new URL(file,self.registration.scope).href)));event.ports[0].postMessage({ready:available.every(Boolean)});})());});
self.addEventListener('activate',event=>event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(event.request.mode==='navigate'){event.respondWith((async()=>{const existing=await (await caches.open(CACHE)).match(new URL('./index.html',scope).href);if(existing)return existing;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3500);try{const response=await fetch(event.request,{signal:controller.signal});if(response.status>=500)throw Error('Hosting temporarily unavailable');if(response.ok&&(response.headers.get('content-type')||'').includes('text/html')){const text=await response.clone().text();if(text.includes('name="application-name" content="Fungo Italia"'))await (await caches.open(CACHE)).put(new URL('./index.html',scope).href,response.clone());}return response;}catch{const cached=await (await caches.open(CACHE)).match(new URL('./index.html',scope).href);return cached||new Response('Prima apertura con connessione necessaria.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}finally{clearTimeout(timer);}})());return;}
 const allowed=FILES.map(path=>new URL(path,scope).href);
 if(!allowed.includes(url.href))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(event.request);return cached||fetch(event.request);})());
});
