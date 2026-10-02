/* global self, caches, fetch, URL, Response */
const SHELL_CACHE="fungo-public-reader-v1";
const IMAGE_CACHE="fungo-study-images-v1";
const SHELL=["/offline-reader.html","/offline-reader.js","/offline-reader.css"];
const imagePath=path=>/^\/schede\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g)$/.test(path);
self.addEventListener("install",event=>{event.waitUntil((async()=>{const cache=await caches.open(SHELL_CACHE);for(const path of SHELL){const response=await fetch(path,{credentials:"omit",cache:"reload"});if(!response.ok||response.redirected)throw new Error("Offline reader unavailable");await cache.put(path,response);}})());});
self.addEventListener("activate",event=>{event.waitUntil(self.clients.claim());});
self.addEventListener("message",event=>{
 if(event.data?.type!=="CACHE_STUDY_IMAGES"||!event.ports[0])return;
 const port=event.ports[0];event.waitUntil((async()=>{try{const incoming=event.data.images;if(!Array.isArray(incoming)||incoming.length>1000||incoming.some(path=>typeof path!=="string"||!imagePath(path)))throw new Error("Invalid public image list");const cache=await caches.open(IMAGE_CACHE);const cached=[];for(const path of [...new Set(incoming)]){try{const response=await fetch(path,{credentials:"omit"});if(response.ok&&!response.redirected&&response.headers.get("content-type")?.startsWith("image/")){await cache.put(path,response);cached.push(path);}}catch{/* Unavailable images do not discard text. */}}port.postMessage({ok:true,cached});}catch{port.postMessage({ok:false});}})());
});
self.addEventListener("fetch",event=>{
 const request=event.request;const url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==self.location.origin||url.search)return;
 if(SHELL.includes(url.pathname)){event.respondWith((async()=>{try{const response=await fetch(request.url,{credentials:"omit"});if(response.ok&&!response.redirected){const cache=await caches.open(SHELL_CACHE);await cache.put(url.pathname,response.clone());return response;}}catch{/* Public offline shell fallback. */}return(await caches.match(url.pathname))||new Response("Lettore offline non ancora scaricato.",{status:503});})());return;}
 if(imagePath(url.pathname)){event.respondWith((async()=>(await caches.match(url.pathname))||fetch(request.url,{credentials:"omit"}))());return;}
 // Authenticated HTML and APIs are never cached.
 if(request.mode==="navigate"&&(url.pathname==="/"||url.pathname==="/offline")){event.respondWith(fetch(request).catch(async()=>(await caches.match("/offline-reader.html"))||new Response("Collegati per scaricare il lettore offline.",{status:503})));}
});
