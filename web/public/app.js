'use strict';
const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').trim();
const studyKey='fungo-italia:pwa:study:v1',notesKey='fungo-italia:pwa:notes:v1';
const ranks={species:'Specie',genus:'Genere',section:'Sezione',group:'Gruppo',speciesGroup:'Gruppo di specie',aggregate:'Aggregato',operationalGroup:'Gruppo operativo',family:'Famiglia',subgenus:'Sottogenere',subsection:'Sottosezione',subspecies:'Sottospecie',variety:'Varietà'};
const diagnosticLimits={field_high_confidence:'Caratteri di campo; determinazione da verificare',field_high_confidence_when_typical:'Condizione: esemplari tipici',field_high_confidence_when_host_known:'Ospite ed ecologia devono essere noti',field_high_confidence_when_young:'Condizione: esemplari giovani',field_high_confidence_at_source_rank:'Risoluzione limitata al rango didattico S1',field_confirmatory:'Conferma specialistica nei casi dubbi',defined_morphogroup_s1:'Morfogruppo didattico S1',defined_set_s1:'Insieme didattico definito S1',microscopy_required_for_fine_id:'Microscopia necessaria per la specie fine',dna_confirmatory:'Conferma molecolare per la risoluzione fine'};
let data,taxa=[],byId=new Map(),favoriteIds=[],resumeId=null,studyWritable=true,notesWritable=true,drafts=[],selectedDraft=null;
let tab='studio',query='',layer='minimum',onlyFavorites=false,feed=false,limit=24,areaQuery='',areaRegion='Tutte',currentTaxon=null,map=null,mapTimer=null,mapOn=false,registration=null,installPrompt=null,toastTimer,reviewSession=null,observer=null,readingTimer=null,offlineReady=false,renderedCount=0;
const scrollPositions={studio:0,areas:0,notes:0,community:0};
let notesSaveError='',studySaveError='';
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
function persistStudy(){if(!studyWritable)return;try{localStorage.setItem(studyKey,JSON.stringify({version:1,favoriteIds,resumeId}));studySaveError='';}catch{studySaveError='Preferiti non salvati: memoria locale non disponibile.';status(studySaveError);}}
function persistDrafts(){if(!notesWritable)return false;try{localStorage.setItem(notesKey,JSON.stringify({version:1,drafts}));notesSaveError='';const saved=$('#saved');if(saved)saved.textContent='Salvato su questo dispositivo.';const warning=$('#save-warning');if(warning)warning.hidden=true;return true;}catch{notesSaveError='Salvataggio non riuscito. Le modifiche restano in memoria: esporta la bozza o il backup prima di chiudere.';const saved=$('#saved');if(saved)saved.textContent=notesSaveError;const warning=$('#save-warning');if(warning){warning.textContent=notesSaveError;warning.hidden=false;}status('Salvataggio della bozza non riuscito.');return false;}}
function matchesQuery(t){return norm([t.scientificName,...t.commonNames,...(t.aliases||[]),...(t.currentAcceptedNames||[]),...(t.currentGenera||[])].join(' ')).includes(norm(query));}
function filtered(){return taxa.filter(t=>(layer==='all'||(layer==='groups')===(t.kind==='teaching-group'))&&(!onlyFavorites||favoriteIds.includes(t.id))&&matchesQuery(t));}
function favoriteButton(t){return button(favoriteIds.includes(t.id)?'Rimuovi preferito':'Salva preferito','favorite',t.id);}
function safeLink(url,label){return typeof url==='string'&&/^https:\/\//i.test(url)?'<a href="'+escape(url)+'" target="_blank" rel="noopener noreferrer">'+escape(label||url)+'</a>':escape(label||url);}
function content(t){
 return '<h2>'+escape(t.scientificName)+'</h2>'+(t.commonNames.length?'<p>'+escape(t.commonNames.join(' · '))+'</p>':'')+'<p class="small">Rango: '+escape(ranks[t.rank]||t.rank||'da documentare')+'</p>'+
 (t.diagnosticStatus?'<p class="notice">Ambito didattico dei caratteri: '+escape(diagnosticLimits[t.diagnosticStatus]||'Condizioni da documentare')+'. Audit interno; revisione indipendente pendente.</p>':'')+(t.diagnosticNote?'<p class="small">'+escape(t.diagnosticNote)+'</p>':'')+
 (t.authorship?'<p class="small">Autore nomenclaturale: '+escape(t.authorship)+'</p>':'')+(t.family?'<p class="small">Famiglia: '+escape(t.family)+'</p>':'')+
 (t.rank!=='species'&&t.currentAcceptedNames?.length?'<p class="small">Nomi compresi nel concetto didattico: '+escape(t.currentAcceptedNames.join(' · '))+'</p>':'')+
 (t.deepMorphologyRequired?'<p class="notice">L’obiettivo richiede morfologia approfondita: questi caratteri di campo possono essere insufficienti per la determinazione.</p>':'')+
 '<p>'+escape(t.summary)+'</p><h3>Caratteri di studio</h3>'+
 (t.characters.length?'<ol>'+t.characters.map(c=>'<li>'+escape(c)+'</li>').join('')+'</ol>':'<p>Caratteri del gruppo da documentare e verificare. Non trasferire a tutti i membri indicazioni relative a una singola specie.</p>')+
 (t.differentiatingCharacter?'<h3>Carattere differenziante (+1)</h3><p>'+escape(t.differentiatingCharacter)+'</p>':'')+
 '<h3>Confronti e habitat</h3><p>'+escape(t.lookalikes.length?t.lookalikes.join(' · '):'Confusioni specifiche non documentate in questa versione: non significa che siano assenti.')+'</p><p>'+escape(t.habitat.join(' · ')||'Habitat da documentare.')+'</p>'+
 (t.currentGenera?.length?'<p class="small">Generi correnti dei taxa collegati: '+escape(t.currentGenera.join(' · '))+'</p>':'')+
 '<h3>Fonti e limiti</h3>'+(t.sources.length?t.sources.map(source=>'<div class="source"><p>'+escape(source.title)+(source.location?' · '+escape(source.location):'')+'</p>'+(source.supportedClaim?'<p class="small">'+escape(source.supportedClaim)+'</p>':'')+(source.notes?'<p class="small">'+escape(source.notes)+'</p>':'')+(source.url?'<p class="small">'+safeLink(source.url)+'</p>':'')+'</div>').join(''):'<p>Riferimenti puntuali non disponibili.</p>')+
 (t.relatedIds?.length?'<h3>Unità minime collegate</h3><div class="drafts">'+t.relatedIds.filter(id=>byId.has(id)).map(id=>button('Studia '+byId.get(id).scientificName,'related',id)).join('')+'</div>':'');
}

function beginReview(retry=false){
 const rows=retry&&reviewSession?reviewSession.missed.map(id=>byId.get(id)).filter(Boolean):filtered().filter(t=>t.characters.length&&t.differentiatingCharacter);
 if(!rows.length){status('Nessuna scheda 3+1 nei filtri: scegli Minimo o Tutte, oppure modifica ricerca e Preferiti.');return;}
 const shuffled=[...rows];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 reviewSession={ids:shuffled.slice(0,10).map(t=>t.id),index:0,revealed:false,remembered:0,missed:[]};
 currentTaxon=null;renderReview();
}
function renderReview(){
 const session=reviewSession;if(!session)return;
 const total=session.ids.length;
 if(session.index>=total){
  showDialog('Ripasso attivo','<h2>Sessione conclusa</h2><p>'+session.remembered+' schede ricordate · '+session.missed.length+' da ripassare.</p><p class="small">Autovalutazione della memoria sui contenuti del catalogo, senza attestazione di competenza o determinazione sul campo. La sessione non viene salvata.</p>'+(session.missed.length?button('Ripassa le schede da rivedere','review-retry','','full'):'')+button('Nuova sessione dai filtri','review-start','','full'));
  return;
 }
 const t=byId.get(session.ids[session.index]);
 const question='<p class="counter">Scheda '+(session.index+1)+' di '+total+'</p><h2>Quale unità tassonomica?</h2><p class="small">Può essere una specie, una sezione o un gruppo di specie. Il ripasso usa profili didattici: revisione indipendente pendente.</p><h3>Tre caratteri di studio</h3><ol>'+t.characters.map(c=>'<li>'+escape(c)+'</li>').join('')+'</ol><h3>Carattere differenziante (+1)</h3><p>'+escape(t.differentiatingCharacter)+'</p>';
 const answer=session.revealed?'<section id="review-answer"><h2>'+escape(t.scientificName)+'</h2><p class="small">Rango: '+escape(ranks[t.rank]||t.rank)+'</p><div class="row">'+button('Da ripassare','review-rate','again')+button('Ricordata','review-rate','remembered')+'</div><details><summary>Confronta la scheda e le fonti</summary>'+notice+content(t)+'</details></section>':button('Mostra risposta','review-reveal','','full');
 showDialog('Ripasso attivo',question+answer);
}
function rateReview(rating){
 if(!reviewSession?.revealed||!['again','remembered'].includes(rating))return;
 const id=reviewSession.ids[reviewSession.index];
 if(rating==='remembered')reviewSession.remembered++;else reviewSession.missed.push(id);
 reviewSession.index++;reviewSession.revealed=false;renderReview();
}
function validCatalog(value){
 if(!value||value.version!==1||!Array.isArray(value.catalog)||!value.catalog.length||!Array.isArray(value.groups)||!Array.isArray(value.areas)||!value.areas.length||!Array.isArray(value.bibliography))return false;
 const rows=[...value.catalog,...value.groups];
 const textList=items=>Array.isArray(items)&&items.every(item=>typeof item==='string');
 return new Set(rows.map(t=>t?.id)).size===rows.length&&rows.every(t=>t&&typeof t.id==='string'&&t.id.length&&typeof t.scientificName==='string'&&typeof t.summary==='string'&&['commonNames','characters','lookalikes','habitat'].every(key=>textList(t[key]))&&['aliases','currentAcceptedNames','currentGenera','relatedIds'].every(key=>t[key]===undefined||textList(t[key]))&&(t.differentiatingCharacter===undefined||typeof t.differentiatingCharacter==='string')&&Array.isArray(t.sources)&&t.sources.every(source=>source&&typeof source.title==='string'))&&
 value.bibliography.every(source=>source&&typeof source.title==='string'&&(source.authors===undefined||textList(source.authors)))&&new Set(value.areas.map(a=>a?.id)).size===value.areas.length&&value.areas.every(a=>a&&typeof a.id==='string'&&typeof a.name==='string'&&typeof a.region==='string'&&textList(a.habitat)&&Array.isArray(a.center)&&a.center.length===2&&a.center.every(Number.isFinite)&&Math.abs(a.center[0])<=90&&Math.abs(a.center[1])<=180&&(!a.elevationRangeM||(Array.isArray(a.elevationRangeM)&&a.elevationRangeM.length===2&&a.elevationRangeM.every(Number.isFinite))));
}

function renderStudio(){
 renderedCount=0;
 $('#main').innerHTML='<section><h1>Studio e atlante</h1>'+notice+scientificCoverage()+
 (!studyWritable?'<p class="error">Preferiti non leggibili. La consultazione resta disponibile; il salvataggio è sospeso per conservare i dati esistenti.</p>':'')+
 '<input type="search" id="taxon-search" aria-label="Cerca nome scientifico, comune o sinonimo" placeholder="Nome scientifico, comune o sinonimo" value="'+escape(query)+'">'+
 '<div class="controls"><select id="layer" aria-label="Catalogo"><option value="minimum">Minimo · '+data.catalog.length+'</option><option value="groups">Generi e gruppi · '+data.groups.length+'</option><option value="all">Tutte · '+taxa.length+'</option></select>'+
 '<button id="feed" aria-pressed="'+feed+'">'+(feed?'Lettura continua':'Elenco')+'</button><button id="favorites" aria-pressed="'+onlyFavorites+'">Preferiti</button></div>'+
 '<p class="small">Tocca una scheda oppure attiva la lettura continua. Nel dettaglio usa Precedente e Successiva.</p>'+button('Ripasso attivo','review-start','','full')+'<p class="small">Ricorda il nome dai caratteri, poi confronta la risposta. Usa ricerca e Preferiti per scegliere il gruppo da ripassare.</p><div id="resume">'+(resumeId?button('Riprendi '+byId.get(resumeId).scientificName,'resume',resumeId,'full'):'')+'</div><p id="catalog-count" class="counter"></p><div id="cards"></div><div id="sentinel"></div><button id="more" class="full">Altre schede</button></section>';
 $('#layer').value=layer;
 $('#taxon-search').addEventListener('input',event=>{query=event.target.value;limit=24;renderCards();$('#main').scrollTop=0;});
 $('#layer').addEventListener('change',event=>{layer=event.target.value;limit=24;renderCards();$('#main').scrollTop=0;});
 $('#feed').onclick=()=>{feed=!feed;$('#feed').textContent=feed?'Lettura continua':'Elenco';$('#feed').setAttribute('aria-pressed',String(feed));$('#main').classList.toggle('feed',feed);limit=24;renderCards();};
 $('#favorites').onclick=()=>{onlyFavorites=!onlyFavorites;$('#favorites').setAttribute('aria-pressed',String(onlyFavorites));limit=24;renderCards();$('#main').scrollTop=0;};
 $('#more').onclick=()=>{limit+=24;renderCards(false);};
 $('#main').classList.toggle('feed',feed);renderCards();
}
function cardHTML(t){return '<article class="card"><button class="heading" data-action="open" data-id="'+escape(t.id)+'" aria-label="Apri '+escape(t.scientificName)+'"><strong>'+escape(t.scientificName)+'</strong><span>'+escape(t.commonNames.join(' · ')||(ranks[t.rank]||t.rank||'Unità didattica'))+'</span></button>'+(feed?notice+favoriteButton(t)+content(t):'<p class="small">Fonti e caratteri nella scheda. Revisione indipendente pendente.</p>')+'</article>';}
function updateCatalogCount(rows=filtered()){if($('#catalog-count'))$('#catalog-count').textContent=rows.length+' '+(rows.length===1?'scheda':'schede')+' · '+favoriteIds.length+' '+(favoriteIds.length===1?'preferito':'preferiti');}
function updateResume(){const element=$('#resume');if(element&&resumeId)element.innerHTML=button('Riprendi '+byId.get(resumeId).scientificName,'resume',resumeId,'full');}
function renderCards(reset=true){
 const rows=filtered(),savedScroll=$('#main').scrollTop;updateCatalogCount(rows);
 if(reset){const alternatives=rows.length===0&&(layer!=='all'||onlyFavorites)?taxa.filter(matchesQuery).length:0;const empty='<p class="empty">Nessuna scheda corrisponde ai filtri.</p>'+(alternatives?'<p class="small">'+alternatives+' schede corrispondono nel catalogo completo. La ricerca resta invariata; vengono rimossi i filtri di catalogo e preferiti.</p>'+button('Cerca in tutto il catalogo','search-all','','full'):'');$('#cards').innerHTML=rows.slice(0,limit).map(cardHTML).join('')||empty;}
 else $('#cards').insertAdjacentHTML('beforeend',rows.slice(renderedCount,limit).map(cardHTML).join(''));
 renderedCount=Math.min(rows.length,limit);$('#more').hidden=rows.length<=limit;$('#main').scrollTop=savedScroll;
 if(observer)observer.disconnect();
 if('IntersectionObserver'in window&&rows.length>limit){observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){limit+=24;renderCards(false);}},{root:$('#main'),rootMargin:'100px'});observer.observe($('#sentinel'));}
}
function showDialog(title,body,paged=false){
 $('#detail-title').textContent=title;$('#detail-body').innerHTML=body;$('#pager').hidden=!paged;
 if(!$('#detail').open)$('#detail').showModal();$('#detail-body').scrollTop=0;
}
function openTaxon(id){
 const t=byId.get(id);if(!t)return;currentTaxon=id;resumeId=id;persistStudy();updateResume();
 const rows=filtered(),index=rows.findIndex(t=>t.id===id);
 $('#position').textContent=index<0?'Fuori filtri':(index+1)+' / '+rows.length;
 $('#previous').disabled=index<=0;$('#next').disabled=index<0||index===rows.length-1;
 showDialog('Scheda di studio',notice+'<div class="row">'+favoriteButton(t)+'</div>'+content(t),true);
}
function toggleFavorite(id){
 if(!studyWritable){status('Salvataggio sospeso: i dati esistenti non sono leggibili.');return;}
 const removing=favoriteIds.includes(id),moveDetail=removing&&onlyFavorites&&$('#detail').open&&currentTaxon===id;
 const oldIndex=moveDetail?filtered().findIndex(t=>t.id===id):-1;
 favoriteIds=removing?favoriteIds.filter(value=>value!==id):[...favoriteIds,id];persistStudy();
 if(tab==='studio'){if(onlyFavorites)renderCards();else{updateCatalogCount();document.querySelectorAll('#cards button[data-action="favorite"]').forEach(b=>{if(b.dataset.id===id)b.textContent=favoriteIds.includes(id)?'Rimuovi preferito':'Salva preferito';});}}
 if(moveDetail){const rows=filtered(),next=rows[Math.min(Math.max(oldIndex,0),rows.length-1)];if(next){openTaxon(next.id);status('Preferito rimosso. Aperta la scheda disponibile successiva.');}else{currentTaxon=null;$('#detail').close();status('Nessuna scheda corrisponde ai filtri: modifica la ricerca o disattiva Preferiti.');}return;}
 if($('#detail').open&&currentTaxon===id){const savedScroll=$('#detail-body').scrollTop;openTaxon(id);$('#detail-body').scrollTop=savedScroll;}
}
function visibleAreas(){return data.areas.filter(a=>(areaRegion==='Tutte'||a.region===areaRegion)&&norm([a.name,a.region,...a.habitat].join(' ')).includes(norm(areaQuery)));}
function renderAreas(){
 destroyMap();
 $('#main').classList.remove('feed');
 $('#main').innerHTML='<section><h1>Aree e habitat</h1><p class="small">'+data.areas.length+' macroaree in '+new Set(data.areas.map(a=>a.region)).size+' regioni. Centri territoriali rappresentativi: non sono fungaie o percorsi di accesso verificati.</p><input type="search" id="area-search" aria-label="Cerca area o habitat" placeholder="Area, regione o habitat" value="'+escape(areaQuery)+'"><div class="controls"><select id="region" aria-label="Regione">'+['Tutte',...new Set(data.areas.map(a=>a.region).sort())].map(region=>'<option>'+escape(region)+'</option>').join('')+'</select>'+button('Monte Amiata','amiata')+button('Tenerife · preparazione','tenerife')+button(mapOn?'Chiudi mappa':'Mappa','map')+'</div><p id="map-status" class="map-status"></p><div id="map" class="map" hidden></div><p id="area-count" class="counter"></p><div id="area-cards"></div></section>';
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
function destroyMap(){if(mapTimer){clearTimeout(mapTimer);mapTimer=null;}if(map){map.remove();map=null;}}
function renderMap(rows){
 destroyMap();$('#map').hidden=false;
 $('#map-status').textContent=navigator.onLine?'Caricamento dello sfondo OpenStreetMap. I punti rappresentano macroaree, non ritrovamenti.':'Senza rete: i punti delle macroaree restano disponibili; lo sfondo cartografico richiede connessione.';
 if(!window.L){$('#map-status').textContent='Mappa non caricata. L’elenco delle aree resta consultabile.';return;}
 map=L.map('map',{scrollWheelZoom:false}).setView([42.4,12.5],5);
 if(navigator.onLine){const instance=map;let loaded=false,failed=false;const fallback=()=>{if(map===instance&&$('#map-status'))$('#map-status').textContent='Sfondo cartografico non disponibile. I punti e l’elenco delle macroaree restano consultabili.';};L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:16,attribution:'© OpenStreetMap contributors'}).on('tileerror',()=>{failed=true;fallback();}).on('tileload',()=>{loaded=true;if(!failed&&map===instance&&$('#map-status'))$('#map-status').textContent='Sfondo cartografico online OpenStreetMap. I punti rappresentano macroaree, non ritrovamenti.';}).addTo(map);mapTimer=setTimeout(()=>{if(!loaded)fallback();},4000);}
 rows.forEach(a=>{const label=document.createElement('span');label.textContent=a.name+' · '+a.region;L.circleMarker(a.center,{radius:8,color:'#174f2b',fillOpacity:.7}).addTo(map).bindTooltip(label).on('click',()=>openArea(a.id));});
 if(rows.length===1)map.setView(rows[0].center,9);else if(rows.length)map.fitBounds(L.latLngBounds(rows.map(a=>a.center)),{padding:[18,18],maxZoom:8});
 requestAnimationFrame(()=>map?.invalidateSize());
}

function openTenerife(){
 currentTaxon=null;
 showDialog('Tenerife · preparazione','<h2>Studio e osservazioni a Tenerife</h2><p>Le macroaree dell’atlante riguardano l’Italia. Per Tenerife verifica accessi e restrizioni con le autorità dell’isola; le regole italiane non si applicano.</p><h3>Prima dell’uscita</h3><p>'+safeLink('https://www.tenerife.es/senderos-de-tenerife','Cabildo de Tenerife — sentieri e avvisi')+'</p><p>'+safeLink('https://www.tenerifeon.es/','Tenerife ON — percorsi, restrizioni e autorizzazioni')+'</p><p class="small">Riferimenti ufficiali consultati il 6 ottobre 2026. I contenuti dei siti richiedono rete e possono cambiare. Un permesso per un sentiero non equivale a un permesso di raccolta.</p><h3>Documenta il ritrovamento</h3><ol><li>Fotografa l’esemplare nel suo ambiente e il substrato.</li><li>Documenta cappello, superficie fertile, gambo e base con una scala dimensionale, senza danneggiare esemplari o habitat dove non consentito.</li><li>Annota data, località generale, substrato e vegetazione; scrivi “non osservato” per i caratteri mancanti.</li></ol><p>Conserva le coordinate precise nelle note private. L’atlante italiano può aiutare lo studio dei caratteri, ma non certifica la presenza né la determinazione delle specie locali.</p>'+button('Crea osservazione per Tenerife','tenerife-note','','full'));
}

function openArea(id){
 const area=data.areas.find(a=>a.id===id);if(!area)return;currentTaxon=null;
 const url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(area.center.join(','));
 showDialog('Macroarea', '<h2>'+escape(area.name)+'</h2><p>'+escape(area.region)+'</p><p class="notice">Centro rappresentativo: non indica una fungaia, un accesso autorizzato o un percorso verificato.</p><p>'+escape(area.habitat.join(' · '))+'</p><p class="small">Centro macroarea: '+escape(area.center.join(', '))+' (latitudine, longitudine).</p><p>'+safeLink(url,'Apri il centro nelle mappe')+'</p>'+(area.elevationRangeM?'<p class="small">Fascia altimetrica indicativa: '+escape(area.elevationRangeM.join('–'))+' m. Non è un profilo del percorso.</p>':'')+'<h3>Prima dell’uscita</h3><ul><li>Verifica titolo di raccolta, limiti e divieti aggiornati presso le autorità locali.</li><li>Controlla regole del parco, accesso ai terreni, chiusure e condizioni del percorso.</li><li>Prepara le mappe del percorso e verifica il pacchetto offline prima di partire.</li></ul><h3>Fonti territoriali</h3>'+(area.evidenceSources?.length?area.evidenceSources.map(source=>'<p>'+safeLink(source.url,source.label)+'</p>').join(''):'<p>Fonti territoriali specifiche da integrare.</p>'));
}
const fields=['date','taxon','habitat','characters','evidence','sources','notes','latitude','longitude'];
const labels={date:'Data (AAAA-MM-GG)',taxon:'Ipotesi tassonomica',habitat:'Habitat e substrato',characters:'Caratteri osservati',evidence:'Evidenze, foto di riferimento e limiti',sources:'Fonti: autore, titolo, pagina, DOI o URL',notes:'Note',latitude:'Latitudine facoltativa',longitude:'Longitudine facoltativa'};
function freshDraft(){return {id:typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),date:new Date().toISOString().slice(0,10),taxon:'',habitat:'',characters:'',evidence:'',sources:'',notes:'',latitude:'',longitude:'',updatedAt:new Date().toISOString()};}
function renderNotes(){
 $('#main').classList.remove('feed');const draft=drafts.find(d=>d.id===selectedDraft);
 $('#main').innerHTML='<section><h1>Osservazioni offline</h1><p><a class="button photo-import-link" href="./importa-foto.html">Importa foto dal telefono a GitHub</a></p><p>Bozze personali su questo dispositivo, senza invio o pubblicazione. Il taxon è un’ipotesi: documenta caratteri mancanti e fonti prima della revisione.</p><p class="notice">Le bozze non autorizzano il consumo. Il salvataggio locale non è cifrato né un backup. Safari può rimuovere i dati: esporta le note e proteggi il dispositivo.</p>'+
 (!notesWritable?'<p class="error">Bozze non leggibili. I dati esistenti non saranno sovrascritti.</p>':button('Nuova bozza','new-draft','', 'full'))+
 '<p id="save-warning" class="error" role="alert"'+(notesSaveError?'':' hidden')+'>'+escape(notesSaveError)+'</p><div class="drafts">'+drafts.map(d=>button((d.id===selectedDraft?'✓ ':'')+(d.taxon||'Taxon non determinato')+' · '+d.date,'select-draft',d.id)).join('')+'</div>'+
 (draft?'<form id="draft-form">'+fields.map(field=>'<label for="draft-'+field+'">'+labels[field]+'</label>'+(['date','taxon','latitude','longitude'].includes(field)?'<input type="text" '+(['latitude','longitude'].includes(field)?'inputmode="decimal" ':'')+'id="draft-'+field+'" name="'+field+'" value="'+escape(draft[field])+'">':'<textarea id="draft-'+field+'" name="'+field+'">'+escape(draft[field])+'</textarea>')).join('')+'</form><p id="saved" class="saved" role="status"></p><label class="check"><input type="checkbox" id="include-coordinates">Includi le coordinate strutturate nell’esportazione. Sono escluse per impostazione predefinita; eventuali coordinate scritte nelle note non vengono rimosse.</label><div class="row">'+button('Scarica JSON','download-draft')+button('Condividi JSON','share-draft')+'</div><p id="draft-error" class="error" role="alert" hidden></p><div class="controls">'+button('Salva di nuovo','save-draft')+button('Elimina bozza','delete-draft','','danger')+'</div><p class="small">Le fotografie non sono allegate: indica riferimenti e caratteri visibili. Nessun accesso GPS richiesto.</p>':'<p>Nessuna bozza. Registra il prossimo ritrovamento.</p>')+
 '<h3>Backup personale</h3><p class="small">Il backup completo contiene anche eventuali coordinate private. Conservalo in un luogo protetto.</p>'+button('Scarica backup locale','backup','', 'full')+'<label for="restore-backup">Ripristina backup JSON</label><input id="restore-backup" type="file" accept="application/json,.json"><p class="small">Unisce preferiti e bozze senza cancellare i dati attuali. Le coordinate private vengono conservate.</p></section>';
 const form=$('#draft-form');if(form)form.addEventListener('input',event=>{const field=event.target.name;if(!fields.includes(field))return;const current=drafts.find(d=>d.id===selectedDraft);if(current){current[field]=event.target.value;current.updatedAt=new Date().toISOString();persistDrafts();}});
 const restoreInput=$('#restore-backup');if(restoreInput)restoreInput.onchange=event=>{const file=event.target.files?.[0];event.target.value='';void restoreBackup(file);};
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
function backupSnapshots(value){
 if(!value||typeof value!=='object'||value.format!=='fungo-italia-private-backup'||(value.version!==undefined&&value.version!==1))throw Error('Formato o versione del backup non supportati.');
 const decode=(snapshot,raw)=>snapshot??(typeof raw==='string'&&raw?JSON.parse(raw):null);
 const study=decode(value.studySnapshot,value.studyRaw),notes=decode(value.notesSnapshot,value.notesRaw);
 if(!study&&!notes)throw Error('Il backup non contiene dati ripristinabili.');
 if(study!==null&&(study.version!==1||!Array.isArray(study.favoriteIds)||!study.favoriteIds.every(id=>typeof id==='string'&&byId.has(id))||(study.resumeId!==null&&(typeof study.resumeId!=='string'||!byId.has(study.resumeId)))))throw Error('Preferiti o scheda di ripresa non validi per questo catalogo.');
 if(notes!==null&&(notes.version!==1||!Array.isArray(notes.drafts)||!notes.drafts.every(d=>d&&typeof d.id==='string'&&d.id.length>0&&typeof d.updatedAt==='string'&&fields.every(field=>typeof d[field]==='string'))||new Set(notes.drafts.map(d=>d.id)).size!==notes.drafts.length))throw Error('Bozze del backup non valide.');
 return {study,notes};
}
function backupMerge({study,notes}){
 const nextDrafts=drafts.map(d=>({...d})),used=new Set(nextDrafts.map(d=>d.id));let added=0,renamed=0;
 for(const source of notes?.drafts||[]){const identical=nextDrafts.find(d=>(d.id===source.id||d.importedFromId===source.id)&&fields.every(field=>d[field]===source[field]));if(identical)continue;const existing=nextDrafts.find(d=>d.id===source.id);const incoming={...source};if(existing){incoming.importedFromId=source.id;do{incoming.id=freshDraft().id;}while(used.has(incoming.id));renamed++;}used.add(incoming.id);nextDrafts.push(incoming);added++;}
 const nextFavorites=[...new Set([...favoriteIds,...(study?.favoriteIds||[])])];
 return {drafts:nextDrafts,favoriteIds:nextFavorites,resumeId:resumeId||study?.resumeId||null,added,renamed,favoritesAdded:nextFavorites.length-favoriteIds.length};
}
async function restoreBackup(file){
 if(!file)return;
 try{
  if(!notesWritable||!studyWritable)throw Error('Ripristino sospeso: i dati locali non sono leggibili. Esporta il backup originale; non saranno sovrascritti.');
  if(file.size>5*1024*1024)throw Error('Backup troppo grande: limite 5 MB.');
  const snapshots=backupSnapshots(JSON.parse(await file.text()));
  if(!notesWritable||!studyWritable)throw Error('Ripristino sospeso: dati locali non leggibili.');
  const merged=backupMerge(snapshots);
  if(!confirm('Ripristina backup: '+merged.favoritesAdded+' nuovi preferiti e '+merged.added+' nuove bozze. '+merged.renamed+' bozze con ID coincidente saranno conservate con un nuovo ID. Nessun dato attuale verrà eliminato. Il backup può contenere coordinate private. Confermi?'))return;
  drafts=merged.drafts;favoriteIds=merged.favoriteIds;resumeId=merged.resumeId;selectedDraft=selectedDraft||drafts[0]?.id||null;
  persistStudy();const saved=persistDrafts();if(tab==='notes')renderNotes();status(saved&&!studySaveError?'Backup unito ai dati locali.':'Backup unito in memoria: salvataggio incompleto. Esporta prima di chiudere.');
 }catch(error){status(error.message||'Backup non leggibile. Nessun dato importato.');}
}
function scientificCoverage(){
 const internal=new Set(['S1-obiettivi-tassonomici-v4-2026-06-09','AUDIT-minimum-3plus1-baseline-1.0','EDITORIAL-minimum-card-synthesis-v1']);
 const external=data.catalog.filter(t=>(t.sources||[]).some(s=>s.sourceId&&!internal.has(s.sourceId)&&s.reviewScope!=='supplementary-literature'&&typeof s.supportedClaim==='string'&&s.supportedClaim.trim())).length;
 const habitats=data.catalog.filter(t=>t.habitat?.length).length,comparisons=data.catalog.filter(t=>t.lookalikes?.length).length;
 return '<details id="scientific-coverage"><summary>Copertura dei contenuti e biblioteca scientifica</summary><p>'+external+'/'+data.catalog.length+' schede Minimo con riscontri bibliografici esterni puntuali sui caratteri di campo. Habitat strutturati: '+habitats+'/'+data.catalog.length+'. Confronti strutturati: '+comparisons+'/'+data.catalog.length+'.</p><p>La revisione micologica indipendente non è attestata. La bibliografia generale non valida automaticamente i caratteri delle singole schede.</p><h2>Biblioteca generale</h2>'+(data.bibliography||[]).map(s=>'<div class="source"><p>'+escape(s.title)+'</p><p class="small">'+escape([...(s.authors||[]),s.publisher,s.publicationYear].filter(Boolean).join(' · '))+'</p>'+(s.url?'<p>'+safeLink(s.url,'Apri riferimento esterno')+'</p>':'')+(s.licenseNote?'<p class="small">'+escape(s.licenseNote)+'</p>':'')+'</div>').join('')+'</details>';
}
function renderCommunity(){
 $('#main').classList.remove('feed');$('#main').innerHTML='<section><h1>Contributi scientifici</h1><p><a class="button photo-import-link" href="./importa-foto.html">Importa foto · proprietario e manutentori</a></p><p>Le bozze personali restano sul dispositivo. Puoi proporre una correzione documentata nel repository pubblico di Fungo Italia usando un account GitHub gratuito.</p><div class="link-list"><a href="https://github.com/gianpaolobol/fungo-italia/issues/new?template=scientific-contribution.yml" target="_blank" rel="noopener noreferrer"><strong>Proponi una correzione scientifica su GitHub</strong>Indica il taxon, la modifica proposta e le fonti con pagina, DOI o URL.</a></div><p class="notice">La proposta sarà pubblica. Non inserire coordinate precise o dati personali; usa solo immagini pubblicabili, senza GPS nei metadati. Una proposta non è un’approvazione scientifica e non aggiorna automaticamente il catalogo.</p><details><summary>Servizio storico e account esistenti</summary><p>I contributi già pubblicati e i ruoli del servizio precedente restano disponibili. Questi flussi richiedono autenticazione e connessione.</p><div class="link-list">'+[
 ['/catalog/proposals/new','Proposta nel servizio storico','Per gli account già presenti.'],
 ['/observations/new','Osservazione nel servizio storico','Fotografie e caratteri osservati con il proprio account.'],
 ['/admin/catalog','Revisione nel servizio storico','Disponibile ai ruoli autorizzati dal servizio.']
 ].map(([path,title,description])=>'<a href="https://fungo-italia-beta.gianpaolo-franceschi.chatgpt.site'+path+'" target="_blank" rel="noopener noreferrer"><strong>'+title+'</strong>'+description+'</a>').join('')+'</div></details><p class="small">La revisione indipendente del catalogo è pendente. Gli aggiornamenti dei servizi esterni non modificano automaticamente il pacchetto offline.</p></section>';
}
function renderTab(){
 destroyMap();if(observer)observer.disconnect();currentTaxon=null;

document.querySelectorAll('[data-tab]').forEach(b=>b.getAttribute('data-tab')===tab?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));
 if(tab==='studio')renderStudio();else if(tab==='areas')renderAreas();else if(tab==='notes')renderNotes();else renderCommunity();$('#main').scrollTop=scrollPositions[tab]||0;
}
document.addEventListener('click',event=>{
 const target=event.target.closest('button[data-action]');if(!target)return;const action=target.dataset.action,id=target.dataset.id;
 if(action==='review-start')beginReview();
 else if(action==='review-retry')beginReview(true);
 else if(action==='review-reveal'){if(reviewSession){reviewSession.revealed=true;renderReview();}}
 else if(action==='review-rate')rateReview(id);
 else if(action==='open')openTaxon(id);
 else if(action==='search-all'){layer='all';onlyFavorites=false;limit=24;renderStudio();$('#main').scrollTop=0;}
 else if(action==='resume'){const taxon=byId.get(id);if(taxon){layer=taxon.kind==='teaching-group'?'groups':'minimum';query='';onlyFavorites=false;limit=24;renderStudio();$('#main').scrollTop=0;openTaxon(id);}}
 else if(action==='favorite')toggleFavorite(id);
 else if(action==='related'){layer='minimum';query='';onlyFavorites=false;if(tab==='studio')renderStudio();openTaxon(id);}
 else if(action==='tenerife')openTenerife();
 else if(action==='tenerife-note'){if(!notesWritable){status('Note non leggibili: salvataggio sospeso.');return;}const draft=freshDraft();draft.notes='Tenerife — località generale: ';drafts.unshift(draft);selectedDraft=draft.id;persistDrafts();$('#detail').close();scrollPositions[tab]=$('#main').scrollTop;tab='notes';renderTab();}
 else if(action==='area')openArea(id);
 else if(action==='amiata'){areaQuery='Amiata';areaRegion='Tutte';renderAreas();}
 else if(action==='map'){mapOn=!mapOn;renderAreas();}
 else if(action==='new-draft'){if(!notesWritable)return;const d=freshDraft();drafts.unshift(d);selectedDraft=d.id;persistDrafts();renderNotes();}
 else if(action==='select-draft'){selectedDraft=id;renderNotes();}
 else if(action==='save-draft')persistDrafts();
 else if(action==='delete-draft'){if(confirm('Eliminare questa bozza dal dispositivo?')){drafts=drafts.filter(d=>d.id!==selectedDraft);selectedDraft=drafts[0]?.id??null;persistDrafts();renderNotes();}}
 else if(action==='download-draft')void exportDraft(false);
 else if(action==='share-draft')void exportDraft(true);
 else if(action==='backup'){
 const storageErrors=[];const read=key=>{try{return storageGet(key);}catch{storageErrors.push('Accesso memoria locale negato: '+key);return null;}};
 download('fungo-italia-backup-privato.json',JSON.stringify({format:'fungo-italia-private-backup',version:1,createdAt:new Date().toISOString(),notice:'Contiene dati personali e possibili coordinate precise. Non pubblicare.',studySnapshot:studyWritable?{version:1,favoriteIds,resumeId}:null,notesSnapshot:notesWritable?{version:1,drafts}:null,studyRaw:read(studyKey),notesRaw:read(notesKey),unsavedChanges:{study:!!studySaveError,notes:!!notesSaveError},storageErrors},null,2));
}
});
$('#main').addEventListener('scroll',()=>{clearTimeout(readingTimer);if(tab!=='studio'||!feed)return;readingTimer=setTimeout(()=>{if(tab!=='studio'||!feed||$('#detail').open)return;const root=$('#main').getBoundingClientRect(),line=root.top+Math.min(120,root.height*.3);const card=[...document.querySelectorAll('#cards article')].find(element=>{const box=element.getBoundingClientRect();return box.top<=line&&box.bottom>line;});const id=card?.querySelector('[data-action="open"]')?.dataset.id;if(id&&byId.has(id)&&id!==resumeId){resumeId=id;persistStudy();updateResume();}},350);});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(!data||tab===b.dataset.tab)return;scrollPositions[tab]=$('#main').scrollTop;tab=b.dataset.tab;renderTab();});
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
 try{registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});await navigator.serviceWorker.ready;
 const checkCache=async()=>{const controller=navigator.serviceWorker.controller;if(!controller)return;const channel=new MessageChannel();const ready=await new Promise(resolve=>{const timer=setTimeout(()=>resolve(false),4000);channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data?.ready===true);};controller.postMessage({type:'CACHE_STATUS'},[channel.port2]);});offlineReady=ready;networkStatus();status(ready?'Catalogo pronto offline.':'Pacchetto offline non verificato: riapri con connessione o aggiorna l’app.');};
 if(navigator.serviceWorker.controller)void checkCache();
 else navigator.serviceWorker.addEventListener('controllerchange',()=>void checkCache(),{once:true});
 const offer=()=>{$('#update').hidden=false;};
 if(registration.waiting)offer();
 registration.addEventListener('updatefound',()=>{const installing=registration.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='installed'&&navigator.serviceWorker.controller)offer();});});
 }catch{status('Cache offline non completata. Riapri con connessione e riprova.');}
}
$('#reload').onclick=()=>{if(!registration?.waiting)return;navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});};
async function start(){
 try{const response=await fetch('./data.json');if(!response.ok)throw Error('Catalogo non disponibile');data=await response.json();if(!validCatalog(data))throw Error('Catalogo incompleto');taxa=[...data.catalog,...data.groups];byId=new Map(taxa.map(t=>[t.id,t]));restore();renderTab();void setupOffline();}
 catch{$('#main').innerHTML='<section><h1>Catalogo non disponibile</h1><p>La prima apertura richiede connessione. Riprova; i dati personali già salvati non vengono cancellati.</p><button id="retry-load">Riprova caricamento</button></section>';$('#retry-load').onclick=()=>void start();}
}
void start();
