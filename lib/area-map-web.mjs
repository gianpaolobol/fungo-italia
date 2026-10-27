// Leaflet is already locked at1.9.4 and copied into the same-origin release manifest.
// No third-party script runs in the application document; browser image requests
// retain the real page's Referer without relaxing an opaque iframe sandbox.
export const OSM_TILES='https://tile.openstreetmap.org/{z}/{x}/{y}.png';
let pending;
async function localLeaflet(){
 if(pending)return pending;
 const created=[];
 const asset=(tag,path,integrity)=>new Promise((ok,bad)=>{
  const node=document.createElement(tag);created.push(node);node.integrity=integrity;node.crossOrigin='anonymous';
  if(tag==='script')node.src=path;else{node.rel='stylesheet';node.href=path;}
  const timer=setTimeout(()=>{node.remove();bad(Error('Local map asset timeout'));},15000);
  node.onload=()=>{clearTimeout(timer);ok();};node.onerror=()=>{clearTimeout(timer);bad(Error('Local map asset unavailable'));};document.head.append(node);
 });
 pending=Promise.all([
  asset('link','/fungo-italia/vendor/leaflet.css','sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H'),
  asset('script','/fungo-italia/vendor/leaflet.js','sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH')
 ]).then(()=>{if(window.L?.version!=='1.9.4')throw Error('Unexpected local map library');return window.L;}).catch(error=>{for(const node of created)node.remove();pending=undefined;throw error;});
 return pending;
}
export async function mountWebAreaMap(container,areas,post,{tileUrl=OSM_TILES,signal}={}){
 const L=await localLeaflet();signal?.throwIfAborted();let map;
 try{
  map=L.map(container);
  if(areas.length===1)map.setView(areas[0].center,9);else if(areas.length)map.fitBounds(L.latLngBounds(areas.map(area=>area.center)),{padding:[18,18],maxZoom:8});else map.setView([42.4,12.5],5);
  container.setAttribute('aria-busy','true');
  L.tileLayer(tileUrl,{maxZoom:16,attribution:'© OpenStreetMap contributors'}).on('loading',()=>container.setAttribute('aria-busy','true')).on('load',()=>container.setAttribute('aria-busy','false')).on('tileerror',()=>post({error:true})).addTo(map);
  for(const area of areas){const label=document.createElement('span');label.textContent=area.name+' · '+area.region;L.circleMarker(area.center,{radius:8,color:'#174f2b'}).addTo(map).bindTooltip(label).on('click',()=>post({id:area.id}));}
  post({ready:true});return()=>map.remove();
 }catch(error){map?.remove();throw error;}
}
