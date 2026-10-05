'use strict';
const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').trim();
const studyKey='fungo-italia:pwa:study:v1',notesKey='fungo-italia:pwa:notes:v1';
const ranks={species:'Specie',genus:'Genere',section:'Sezione',group:'Gruppo',speciesGroup:'Gruppo di specie',aggregate:'Aggregato',operationalGroup:'Gruppo operativo',family:'Famiglia',subgenus:'Sottogenere',subsection:'Sottosezione',subspecies:'Sottospecie',variety:'Varietà'};
let data,taxa=[],byId=new Map(),favoriteIds=[],resumeId=null,studyWritable=true,notesWritable=true,drafts=[],selectedDraft=null;
let tab='studio',query='',layer='minimum',onlyFavorites=false,feed=false,limit=24,areaQuery='',areaRegion='Tutte',currentTaxon=null,map=null,mapOn=false,registration=null,installPrompt=null,toastTimer,observer=null,offlineReady=false;
const notice='<p class="notice">Studio: revisione scientifica indipendente pendente. Le schede non autorizzano il consumo.</p>';
const button=(label,action,id='',className='')=>'<button class="'+escape(className)+'" data-action="'+action+'"'+(id?' data-id="'+escape(id)+'"':'')+'>'+escape(label)+'</button>';
function status(message){$('#status').textContent=message;$('#status').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#status').hidden=true,4500);}
function storageGet(key){try{return localStorage.getItem(key);}catch{throw Error('Memoria locale non disponibile');}}
function restore(){
 const validIds=new Set(taxa.map(t=>t.id));
 try{const raw=storageGet(studyKey);if(raw){const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.favoriteIds)||!value.favoriteIds.every(id=>typeof id==='string')||(value.resumeId!==null&&typeof value.resumeId!=='string'))throw Error('Formato');favoriteIds=[...new Set(value.favoriteIds)].filter(id=>validIds.has(id));resumeId=validIds.has(value.resumeId)?value.resumeId:null;}}
 catch{studyWritable=false;status('Preferiti non leggibili: i dati esistenti non saranno sovrascritti.');}
 try{const raw=storageGet(notesKey);if(raw){const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.drafts)||!value.drafts.every(d=>d&&typeof d.id==='string'&&typeof d.updatedAt==='string'&&fields.every(field=>typeof d[field]==='string'))||new Set(value.drafts.map(d=>d.id)).size!==value.drafts.length)throw Error('Formato');drafts=value.drafts;selectedDraft=drafts[0]?.id??null;}}
 catch{notesWritable=false;}
}
function persistStudy(){if(!studyWritable)return;try{localStorage.setItem(studyKey,JSON.stringify({version:1,favoriteIds,resumeId}));}catch{status('Preferiti non salvati: memoria locale non disponibile.');}}
function persistDrafts(){if(!notesWritable)return false;try{localStorage.setItem(notesKey,JSON.stringify({version:1,drafts}));const saved=$('#saved');if(saved)saved.textContent='Salvato su questo dispositivo.';return true;}catch{const saved=$('#saved');if(saved)saved.textContent='Salvataggio non riuscito. Esporta la bozza prima di chiudere.';status('Salvataggio della bozza non riuscito.');return false;}}
function filtered(){return taxa.filter(t=>(layer==='all'||(layer==='groups')===(t.kind==='teaching-group'))&&(!onlyFavorites||favoriteIds.includes(t.id))&&norm([t.scientificName,...t.commonNames,...(t.aliases||[]),...(t.currentGenera||[])].join(' ')).includes(norm(query)));}
function favoriteButton(t){return button(favoriteIds.includes(t.id)?'Rimuovi preferito':'Salva preferito','favorite',t.id);}
function safeLink(url,label){return typeof url==='string'&&/^https:\/\//i.test(url)?'<a href="'+escape(url)+'" target="_blank" rel="noopener noreferrer">'+escape(label||url)+'</a>':escape(label||url);}
function content(t){
 return '<h2>'+escape(t.scientificName)+'</h2>'+(t.commonNames.length?'<p>'+escape(t.commonNames.join(' · '))+'</p>':'')+'<p class="small">Rango: '+escape(ranks[t.rank]||t.rank||'da documentare')+'</p>'+
 (t.authorship?'<p class="small">Autore nomenclaturale: '+escape(t.authorship)+'</p>':'')+(t.family?'<p class="small">Famiglia: '+escape(t.family)+'</p>':'')+
 (t.rank!=='species'&&t.currentAcceptedNames?.length?'<p class="small">Nomi compresi nel concetto didattico: '+escape(t.currentAcceptedNames.join(' · '))+'</p>':'')+
 (t.deepMorphologyRequired?'<p class="notice">L’obiettivo richiede morfologia approfondita: questi caratteri di campo possono essere insufficienti per la determinazione.</p>':'')+
 '<p>'+escape(t.summary)+'</p><h3>Caratteri di studio</h3>'+
 (t.characters.length?'<ol>'+t.characters.map(c=>'<li>'+escape(c)+'</li>').join('')+'</ol>':'<p>Caratteri del gruppo da documentare e verificare. Non trasferire a tutti i membri indicazioni relative a una singola specie.</p>')+
 '<h3>Confronti e habitat</h3><p>'+escape(t.lookalikes.length?t.lookalikes.join(' · '):'Confusioni specifiche non documentate in questa versione: non significa che siano assenti.')+'</p><p>'+escape(t.habitat.join(' · ')||'Habitat da documentare.')+'</p>'+
 (t.currentGenera?.length?'<p class="small">Generi correnti dei taxa collegati: '+escape(t.currentGenera.join(' · '))+'</p>':'')+
 '<h3>Fonti e limiti</h3>'+(t.sources.length?t.sources.map(source=>'<div class="source"><p>'+escape(source.title)+(source.location?' · '+escape(source.location):'')+'</p>'+(source.supportedClaim?'<p class="small">'+escape(source.supportedClaim)+'</p>':'')+(source.notes?'<p class="small">'+escape(source.notes)+'</p>':'')+(source.url?'<p class="small">'+safeLink(source.url)+'</p>':'')+'</div>').join(''):'<p>Riferimenti puntuali non disponibili.</p>')+
 (t.relatedIds?.length?'<h3>Unità minime collegate</h3><div class="drafts">'+t.relatedIds.filter(id=>byId.has(id)).map(id=>button('Studia '+byId.get(id).scientificName,'related',id)).join('')+'</div>':'');
}
function renderStudio(){
 $('#main').innerHTML='<section><h1>Studio e atlante</h1>'+notice+
 (!studyWritable?'<p class="error">Preferiti non leggibili. La consultazione resta disponibile; il salvataggio è sospeso per conservare i dati esistenti.</p>':'')+
 '<input type="search" id="taxon-search" aria-label="Cerca nome scientifico, comune o sinonimo" placeholder="Nome scientifico, comune o sinonimo" value="'+escape(query)+'">'+
 '<div class="controls"><select id="layer" aria-label="Catalogo"><option value="minimum">Minimo · 148</option><option value="groups">Generi e gruppi · 66</option><option value="all">Tutte · 214</option></select>'+
 '<button id="feed" aria-pressed="'+feed+'">'+(feed?'Scorri':'Tap')+'</button><button id="favorites" aria-pressed="'+onlyFavorites+'">Preferiti</button></div>'+
 '<div id="resume">'+(resumeId?button('Riprendi '+byId.get(resumeId).scientificName,'open',resumeId,'full'):'')+'</div><p id="catalog-count" class="counter"></p><div id="cards"></div><div id="sentinel"></div><button id="more" class="full">Altre schede</button></section>';
 $('#layer').value=layer;
 $('#taxon-search').addEventListener('input',event=>{query=event.target.value;limit=24;renderCards();});
 $('#layer').addEventListener('change',event=>{layer=event.target.value;limit=24;renderCards();});
 $('#feed').onclick=()=>{feed=!feed;$('#feed').textContent=feed?'Scorri':'Tap';$('#feed').setAttribute('aria-pressed',String(feed));$('#main').classList.toggle('feed',feed);limit=24;renderCards();};
 $('#favorites').onclick=()=>{onlyFavorites=!onlyFavorites;$('#favorites').setAttribute('aria-pressed',String(onlyFavorites));limit=24;renderCards();};
 $('#more').onclick=()=>{limit+=24;renderCards();};
 $('#main').classList.toggle('feed',feed);renderCards();
}
function renderCards(){
 const rows=filtered();
 $('#catalog-count').textContent=rows.length+' '+(rows.length===1?'scheda':'schede')+' · '+favoriteIds.length+' '+(favoriteIds.length===1?'preferito':'preferiti');
 $('#cards').innerHTML=rows.slice(0,limit).map(t=>'<article class="card"><button class="heading" data-action="open" data-id="'+escape(t.id)+'" aria-label="Apri '+escape(t.scientificName)+'"><strong>'+escape(t.scientificName)+'</strong><span>'+escape(t.commonNames.join(' · ')||(ranks[t.rank]||t.rank||'Unità didattica'))+'</span></button>'+(feed?notice+favoriteButton(t)+content(t):'<p class="small">Fonti e caratteri nella scheda. Revisione indipendente pendente.</p>')+'</article>').join('')||'<p class="empty">Nessuna scheda corrisponde ai filtri.</p>';
 $('#more').hidden=rows.length<=limit;
 if(observer)observer.disconnect();
 if('IntersectionObserver'in window&&rows.length>limit){observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){limit+=24;renderCards();}},{root:$('#main'),rootMargin:'100px'});observer.observe($('#sentinel'));}
}
function showDialog(title,body,paged=false){
 $('#detail-title').textContent=title;$('#detail-body').innerHTML=body;$('#pager').hidden=!paged;
 if(!$('#detail').open)$('#detail').showModal();$('#detail-body').scrollTop=0;
}
function openTaxon(id){
 const t=byId.get(id);if(!t)return;currentTaxon=id;resumeId=id;persistStudy();
 const rows=filtered(),index=rows.findIndex(t=>t.id===id);
 $('#position').textContent=index<0?'Fuori filtri':(index+1)+' / '+rows.length;
 $('#previous').disabled=index<=0;$('#next').disabled=index<0||index===rows.length-1;
 showDialog('Scheda di studio',notice+'<div class="row">'+favoriteButton(t)+'</div>'+content(t),true);
}
function toggleFavorite(id){
 if(!studyWritable){status('Salvataggio sospeso: i dati esistenti non sono leggibili.');return;}
 favoriteIds=favoriteIds.includes(id)?favoriteIds.filter(value=>value!==id):[...favoriteIds,id];persistStudy();
 if(tab==='studio')renderCards();
 if($('#detail').open&&currentTaxon===id){const savedScroll=$('#detail-body').scrollTop;openTaxon(id);$('#detail-body').scrollTop=savedScroll;}
}
function visibleAreas(){return data.areas.filter(a=>(areaRegion==='Tutte'||a.region===areaRegion)&&norm([a.name,a.region,...a.habitat].join(' ')).includes(norm(areaQuery)));}
function renderAreas(){
 $('#main').classList.remove('feed');
 $('#main').innerHTML='<section><h1>Aree e habitat</h1><p class="small">71 macroaree in 20 regioni. Centri territoriali rappresentativi: non sono fungaie o percorsi di accesso verificati.</p><input type="search" id="area-search" aria-label="Cerca area o habitat" placeholder="Area, regione o habitat" value="'+escape(areaQuery)+'"><div class="controls"><select id="region" aria-label="Regione">'+['Tutte',...new Set(data.areas.map(a=>a.region).sort())].map(region=>'<option>'+escape(region)+'</option>').join('')+'</select>'+button('Monte Amiata','amiata')+button(mapOn?'Chiudi mappa':'Mappa','map')+'</div><p id="map-status" class="map-status"></p><div id="map" class="map" hidden></div><p id="area-count" class="counter"></p><div id="area-cards"></div></section>';
 $('#region').value=areaRegion;
 $('#area-search').oninput=event=>{areaQuery=event.target.value;renderAreaCards();};
 $('#region').onchange=event=>{areaRegion=event.target.value;renderAreaCards();};
 renderAreaCards();
}
function renderAreaCards(){
 const rows=visibleAreas();$('#area-count').textContent=rows.length+' '+(rows.length===1?'area corrispondente':'aree corrispondenti');
 $('#area-cards').innerHTML=rows.map(a=>'<article class="card"><button class="heading" data-action="area" data-id="'+escape(a.id)+'" aria-label="Consulta '+escape(a.name)+'"><strong>'+escape(a.name)+'</strong><span>'+escape(a.region)+'</span></button><p class="small">'+escape(a.habitat.join(' · '))+'</p></article>').join('')||'<p class="empty">Nessuna area corrisponde ai filtri.</p>';
 if(mapOn)renderMap(rows);
}
function destroyMap(){if(map){map.remove();map=null;}}
function renderMap(rows){
 destroyMap();$('#map').hidden=false;
 $('#map-status').textContent=navigator.onLine?'Sfondo cartografico online OpenStreetMap. I punti rappresentano macroaree, non ritrovamenti.':'Senza rete: i punti delle macroaree restano disponibili; lo sfondo cartografico richiede connessione.';
 if(!window.L){$('#map-status').textContent='Mappa non caricata. L’elenco delle aree resta consultabile.';return;}
 map=L.map('map',{scrollWheelZoom:false}).setView([42.4,12.5],5);
 if(navigator.onLine)L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:16,attribution:'© OpenStreetMap contributors'}).addTo(map).on('tileerror',()=>{if($('#map-status'))$('#map-status').textContent='Sfondo cartografico non disponibile. I punti e l’elenco delle macroaree restano consultabili.';});
 rows.forEach(a=>{const label=document.createElement('span');label.textContent=a.name+' · '+a.region;L.circleMarker(a.center,{radius:8,color:'#174f2b',fillOpacity:.7}).addTo(map).bindTooltip(label).on('click',()=>openArea(a.id));});
 if(rows.length===1)map.setView(rows[0].center,9);else if(rows.length)map.fitBounds(L.latLngBounds(rows.map(a=>a.center)),{padding:[18,18],maxZoom:8});
 requestAnimationFrame(()=>map?.invalidateSize());
}
function openArea(id){
 const area=data.areas.find(a=>a.id===id);if(!area)return;currentTaxon=null;
 const url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(area.center.join(','));
 showDialog('Macroarea', '<h2>'+escape(area.name)+'</h2><p>'+escape(area.region)+'</p><p class="notice">Centro rappresentativo: non indica una fungaia, un accesso autorizzato o un percorso verificato.</p><p>'+escape(area.habitat.join(' · '))+'</p><p class="small">Centro macroarea: '+escape(area.center.join(', '))+' (latitudine, longitudine).</p><p>'+safeLink(url,'Apri il centro nelle mappe')+'</p><h3>Fonti territoriali</h3>'+(area.evidenceSources?.length?area.evidenceSources.map(source=>'<p>'+safeLink(source.url,source.label)+'</p>').join(''):'<p>Fonti territoriali specifiche da integrare.</p>'));
}
const fields=['date','taxon','habitat','characters','evidence','sources','notes','latitude','longitude'];
const labels={date:'Data (AAAA-MM-GG)',taxon:'Ipotesi tassonomica',habitat:'Habitat e substrato',characters:'Caratteri osservati',evidence:'Evidenze, foto di riferimento e limiti',sources:'Fonti: autore, titolo, pagina, DOI o URL',notes:'Note',latitude:'Latitudine facoltativa',longitude:'Longitudine facoltativa'};
function freshDraft(){return {id:typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),date:new Date().toISOString().slice(0,10),taxon:'',habitat:'',characters:'',evidence:'',sources:'',notes:'',latitude:'',longitude:'',updatedAt:new Date().toISOString()};}
function renderNotes(){
 $('#main').classList.remove('feed');const draft=drafts.find(d=>d.id===selectedDraft);
 $('#main').innerHTML='<section><h1>Osservazioni offline</h1><p>Bozze personali su questo dispositivo, senza invio o pubblicazione. Il taxon è un’ipotesi: documenta caratteri mancanti e fonti prima della revisione.</p><p class="notice">Le bozze non autorizzano il consumo. Il salvataggio locale non è cifrato né un backup. Safari può rimuovere i dati: esporta le note e proteggi il dispositivo.</p>'+
 (!notesWritable?'<p class="error">Bozze non leggibili. I dati esistenti non saranno sovrascritti.</p>':button('Nuova bozza','new-draft','', 'full'))+
 '<div class="drafts">'+drafts.map(d=>button((d.id===selectedDraft?'✓ ':'')+(d.taxon||'Taxon non determinato')+' · '+d.date,'select-draft',d.id)).join('')+'</div>'+
 (draft?'<form id="draft-form">'+fields.map(field=>'<label for="draft-'+field+'">'+labels[field]+'</label>'+(['date','taxon','latitude','longitude'].includes(field)?'<input type="text" '+(['latitude','longitude'].includes(field)?'inputmode="decimal" ':'')+'id="draft-'+field+'" name="'+field+'" value="'+escape(draft[field])+'">':'<textarea id="draft-'+field+'" name="'+field+'">'+escape(draft[field])+'</textarea>')).join('')+'</form><p id="saved" class="saved" role="status"></p><label class="check"><input type="checkbox" id="include-coordinates">Includi le coordinate strutturate nell’esportazione. Sono escluse per impostazione predefinita; eventuali coordinate scritte nelle note non vengono rimosse.</label><div class="row">'+button('Scarica JSON','download-draft')+button('Condividi JSON','share-draft')+'</div><p id="draft-error" class="error" role="alert" hidden></p><div class="controls">'+button('Salva di nuovo','save-draft')+button('Elimina bozza','delete-draft','','danger')+'</div><p class="small">Le fotografie non sono allegate: indica riferimenti e caratteri visibili. Nessun accesso GPS richiesto.</p>':'<p>Nessuna bozza. Registra il prossimo ritrovamento.</p>')+
 '<h3>Backup personale</h3><p class="small">Il backup completo contiene anche eventuali coordinate private. Conservalo in un luogo protetto.</p>'+button('Scarica backup locale','backup','', 'full')+'</section>';
 const form=$('#draft-form');if(form)form.addEventListener('input',event=>{const field=event.target.name;if(!fields.includes(field))return;const current=drafts.find(d=>d.id===selectedDraft);if(current){current[field]=event.target.value;current.updatedAt=new Date().toISOString();persistDrafts();}});
}
function draftPayload(){
 const draft=drafts.find(d=>d.id===selectedDraft);if(!draft)return null;
 const parsed=new Date(draft.date+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==draft.date||draft.date>new Date().toISOString().slice(0,10))throw Error('Usa una data reale nel formato AAAA-MM-GG, non futura.');
 const hasLat=!!draft.latitude.trim(),hasLng=!!draft.longitude.trim(),lat=Number(draft.latitude.replace(',','.')),lng=Number(draft.longitude.replace(',','.'));
 if(hasLat!==hasLng||(hasLat&&(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)))throw Error('Inserisci entrambe le coordinate valide oppure lasciale vuote.');
 const {latitude,longitude,...observation}=draft;
 return {format:'fungo-italia-observation-draft',version:1,status:'local-unreviewed-draft',notice:'Ipotesi non verificata. Nessuna validazione scientifica. Non autorizza il consumo.',observation,...($('#include-coordinates')?.checked&&hasLat?{privateCoordinates:{latitude:lat,longitude:lng}}:{})};
}
function download(filename,content,type='application/json'){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function exportDraft(share){
 const error=$('#draft-error');try{
 const payload=draftPayload();if(!payload)return;error.hidden=true;const text=JSON.stringify(payload,null,2),name='fungo-italia-bozza-'+payload.observation.date+'.json';
 if(share){const file=new File([text],name,{type:'application/json'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({title:'Bozza Fungo Italia',files:[file]});return;}catch(e){if(e.name==='AbortError')return;}}status('Condivisione file non disponibile: scarico il JSON.');}
 download(name,text);
 }catch(e){error.textContent=e.message||'Esportazione non riuscita. La bozza resta sul dispositivo.';error.hidden=false;error.scrollIntoView({block:'nearest'});}
}
function renderCommunity(){
 $('#main').classList.remove('feed');$('#main').innerHTML='<section><h1>Contributi scientifici</h1><p>Le bozze di questa app restano sul dispositivo. Per proporre modifiche, inviare osservazioni con fotografie o accedere alla revisione, apri il servizio web autenticato.</p><div class="link-list">'+[
 ['/catalog/proposals/new','Proponi una modifica','Documenta diagnosi, fonti e limiti della proposta.'],
 ['/observations/new','Invia un’osservazione','Aggiungi fotografie e caratteri osservati nel servizio web.'],
 ['/admin/catalog','Revisione del catalogo','Disponibile ai ruoli autorizzati dal servizio.']
 ].map(([path,title,description])=>'<a href="https://fungo-italia-beta.gianpaolo-franceschi.chatgpt.site'+path+'" target="_blank" rel="noopener noreferrer"><strong>'+title+'</strong>'+description+'</a>').join('')+'</div><p class="notice">Le proposte non sono approvazioni scientifiche. La revisione indipendente del catalogo è pendente.</p><p class="small">Gli account e i contributi pubblicati restano nel servizio precedente. Il pacchetto offline non include automaticamente le successive modifiche del database.</p></section>';
}
function renderTab(){
 destroyMap();if(observer)observer.disconnect();currentTaxon=null;
 document.querySelectorAll('[data-tab]').forEach(b=>b.getAttribute('data-tab')===tab?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));
 if(tab==='studio')renderStudio();else if(tab==='areas')renderAreas();else if(tab==='notes')renderNotes();else renderCommunity();$('#main').scrollTop=0;
}
document.addEventListener('click',event=>{
 const target=event.target.closest('button[data-action]');if(!target)return;const action=target.dataset.action,id=target.dataset.id;
 if(action==='open')openTaxon(id);
 else if(action==='favorite')toggleFavorite(id);
 else if(action==='related'){layer='minimum';query='';onlyFavorites=false;if(tab==='studio')renderStudio();openTaxon(id);}
 else if(action==='area')openArea(id);
 else if(action==='amiata'){areaQuery='Amiata';areaRegion='Tutte';renderAreas();}
 else if(action==='map'){mapOn=!mapOn;renderAreas();}
 else if(action==='new-draft'){if(!notesWritable)return;const d=freshDraft();drafts.unshift(d);selectedDraft=d.id;persistDrafts();renderNotes();}
 else if(action==='select-draft'){selectedDraft=id;renderNotes();}
 else if(action==='save-draft')persistDrafts();
 else if(action==='delete-draft'){if(confirm('Eliminare questa bozza dal dispositivo?')){drafts=drafts.filter(d=>d.id!==selectedDraft);selectedDraft=drafts[0]?.id??null;persistDrafts();renderNotes();}}
 else if(action==='download-draft')void exportDraft(false);
 else if(action==='share-draft')void exportDraft(true);
 else if(action==='backup'){try{download('fungo-italia-backup-privato.json',JSON.stringify({format:'fungo-italia-private-backup',createdAt:new Date().toISOString(),notice:'Contiene dati personali e possibili coordinate precise. Non pubblicare.',studyRaw:storageGet(studyKey),notesRaw:storageGet(notesKey)},null,2));}catch{status('Backup non disponibile: accesso alla memoria locale negato.');}}
});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(!data)return;tab=b.dataset.tab;renderTab();});
$('#close').onclick=()=>$('#detail').close();
$('#detail').addEventListener('close',()=>currentTaxon=null);
$('#previous').onclick=()=>{const rows=filtered(),index=rows.findIndex(t=>t.id===currentTaxon);if(index>0)openTaxon(rows[index-1].id);};
$('#next').onclick=()=>{const rows=filtered(),index=rows.findIndex(t=>t.id===currentTaxon);if(index>=0&&index<rows.length-1)openTaxon(rows[index+1].id);};
function networkStatus(){const installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone;$('#network').textContent=(installed?'App sulla Home · ':'')+(navigator.onLine?'Rete disponibile':'Senza rete')+(offlineReady?' · Catalogo offline':'');if(tab==='areas'&&mapOn&&data)renderMap(visibleAreas());}
window.addEventListener('online',networkStatus);window.addEventListener('offline',networkStatus);networkStatus();
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
$('#install').onclick=async()=>{
 if(installPrompt){await installPrompt.prompt();installPrompt=null;return;}
 currentTaxon=null;showDialog('Installa su iPhone','<h2>Fungo Italia sulla Home</h2><ol><li>Apri questa pagina in Safari.</li><li>Tocca Condividi, poi Aggiungi alla schermata Home. Su alcune versioni di iOS Condividi è nel menu della barra.</li><li>Conferma Aggiungi e apri Fungo Italia dalla nuova icona.</li></ol><p>Non occorre un account Apple Developer o Expo. L’accesso iniziale può richiedere l’autenticazione dell’hosting.</p><p class="notice">Prima di partire senza rete, attendi “Catalogo pronto offline”, riapri l’app in modalità aereo e verifica il catalogo. Lo sfondo della mappa e i contributi web richiedono connessione.</p><p>Preferiti e note sono locali a questo browser o app sulla Home. Non si sincronizzano automaticamente: usa l’esportazione per conservare le note.</p>');
};
async function setupOffline(){
 if(!('serviceWorker'in navigator)){status('Modalità offline non disponibile in questo browser.');return;}
 try{registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});await navigator.serviceWorker.ready;
 if(navigator.serviceWorker.controller){offlineReady=true;networkStatus();status('Catalogo pronto offline.');}
 else navigator.serviceWorker.addEventListener('controllerchange',()=>{offlineReady=true;networkStatus();status('Catalogo pronto offline.');},{once:true});
 const offer=()=>{$('#update').hidden=false;};
 if(registration.waiting)offer();
 registration.addEventListener('updatefound',()=>{const installing=registration.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='installed'&&navigator.serviceWorker.controller)offer();});});
 }catch{status('Cache offline non completata. Riapri con connessione e riprova.');}
}
$('#reload').onclick=()=>{if(!registration?.waiting)return;navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});};
async function start(){
 try{const response=await fetch('./data.json');if(!response.ok)throw Error('Catalogo non disponibile');data=await response.json();if(data.version!==1||data.catalog.length!==148||data.groups.length!==66||data.areas.length!==71)throw Error('Catalogo incompleto');taxa=[...data.catalog,...data.groups];byId=new Map(taxa.map(t=>[t.id,t]));restore();renderTab();void setupOffline();}
 catch{$('#main').innerHTML='<section><h1>Catalogo non disponibile</h1><p>La prima apertura richiede connessione. Riprova; i dati personali già salvati non vengono cancellati.</p><button id="retry-load">Riprova caricamento</button></section>';$('#retry-load').onclick=()=>void start();}
}
void start();
