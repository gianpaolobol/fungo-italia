/* global self, caches, fetch, URL, Response */
const SHELL_CACHE="fungo-public-reader-v3";
const IMAGE_CACHE="fungo-study-images-v1";
const SHELL=["/offline-reader.html","/offline-reader","/offline-reader.js","/offline-reader.css"];
const INSTALL=["/offline-reader.html","/offline-reader.js","/offline-reader.css"];
const imagePath=path=>/^\/schede\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g)$/.test(path);
function publicShellResponse(response,path){
 if(!response.ok)return false;
 const target=new URL(response.url);
 const expected=path==="/offline-reader.html"?["/offline-reader.html","/offline-reader"]:[path];
 if(target.origin!==self.location.origin||target.search||!expected.includes(target.pathname))return false;
 const type=response.headers.get("content-type")||"";
 return path.endsWith(".js")?/javascript/.test(type):path.endsWith(".css")?/text\/css/.test(type):/text\/html/.test(type);
}
function readerResponse(response){return new Response(response.body,{status:response.status,statusText:response.statusText,headers:response.headers});}
async function saveShell(cache,path,response){
 await cache.put(path,response.clone());
 if(path==="/offline-reader.html"||path==="/offline-reader"){
  await cache.put("/offline-reader.html",response.clone());
  await cache.put("/offline-reader",response.clone());
 }
}
self.addEventListener("install",event=>{event.waitUntil((async()=>{
 const cache=await caches.open(SHELL_CACHE);
 for(const path of INSTALL){
  const response=await fetch(path,{credentials:"omit",cache:"reload"});
  if(!publicShellResponse(response,path))throw new Error("Public offline reader unavailable");
  await saveShell(cache,path,readerResponse(response));
 }
})());});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith("fungo-public-reader-")&&name!==SHELL_CACHE)await caches.delete(name);
 await self.clients.claim();
})());});
self.addEventListener("message",event=>{
 if(event.data?.type!=="CACHE_STUDY_IMAGES"||!event.ports[0])return;
 const port=event.ports[0];
 event.waitUntil((async()=>{try{
 const incoming=event.data.images;
 if(!Array.isArray(incoming)||incoming.length>1000||incoming.some(path=>typeof path!=="string"||!imagePath(path)))throw new Error("Invalid public image list");
 const cache=await caches.open(IMAGE_CACHE),cached=[];
 for(const path of [...new Set(incoming)])try{
  const response=await fetch(path,{credentials:"omit"});
  if(response.ok&&!response.redirected&&response.headers.get("content-type")?.startsWith("image/")){await cache.put(path,response);cached.push(path);}
 }catch{/* Missing images do not discard the text package. */}
 port.postMessage({ok:true,cached});
 }catch{port.postMessage({ok:false});}})());
});
self.addEventListener("fetch",event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==self.location.origin||url.search)return;
 if(SHELL.includes(url.pathname)){
  event.respondWith((async()=>{
   try{const response=await fetch(request.url,{credentials:"omit"});
    if(publicShellResponse(response,url.pathname)){const clean=readerResponse(response);const cache=await caches.open(SHELL_CACHE);await saveShell(cache,url.pathname,clean);return clean;}
   }catch{/* Public shell only; authenticated redirects are refused. */}
   return(await caches.match(url.pathname))||new Response("Lettore offline non ancora scaricato.",{status:503});
  })());return;
 }
 if(imagePath(url.pathname)){event.respondWith((async()=>(await caches.match(url.pathname))||fetch(request.url,{credentials:"omit"}))());return;}
 if(request.mode==="navigate"&&(url.pathname==="/"||url.pathname==="/offline")){
  event.respondWith(fetch(request).catch(async()=>(await caches.match("/offline-reader.html"))||new Response("Collegati per scaricare il lettore offline.",{status:503})));
 }
});
