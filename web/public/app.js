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
const notice='';
const button=(label,action,id='',className='')=>'<button class="'+escape(className)+'" data-action="'+action+'"'+(id?' data-id="'+escape(id)+'"':'')+'>'+escape(label)+'</button>';
function status(message,{background=false}={}){if(background&&!$('#status').hidden)return;$('#status').textContent=message;$('#status').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#status').hidden=true,4500);}
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
function favoriteButton(t){
 const selected=favoriteIds.includes(t.id);
 return '<button class="mushroom-toggle" data-action="favorite" data-id="'+escape(t.id)+'" aria-pressed="'+selected+'" aria-label="'+(selected?'Rimuovi preferito':'Salva preferito')+'" title="'+(selected?'Rimuovi dai preferiti':'Aggiungi ai preferiti')+'"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 12C3 6.5 7 3 12 3s9 3.5 9 9c0 1-1 2-2 2H5c-1 0-2-1-2-2Z"/><path d="M9 14h6l1 6c0 1-1 1-4 1s-4 0-4-1l1-6Z"/></svg></button>';
}
function safeLink(url,label){return typeof url==='string'&&/^https:\/\//i.test(url)?'<a href="'+escape(url)+'" target="_blank" rel="noopener noreferrer">'+escape(label||url)+'</a>':escape(label||url);}
function studyText(value){
 return value.replace(/ richiesto da S1/g,'').replace(/Nel defined set S1,/g,'In questo gruppo,').replace(/ectomicorrizico S1:/g,'ectomicorrizico:').replace(/Morfogruppo S1 dei/g,'Gruppo dei').replace(/; gruppo didattico S1\./g,'.').replace(/; profilo volutamente al rango Hydnum spp\.\/gruppo S1\./g,'.').replace(/S1 include A\. vidua; /g,'Il gruppo include A. vidua; ').replace(/Denominazione S1 mantenuta; /g,'');
}
function studySummary(t){
 if(t.summary?.startsWith('Unità didattica al rango ')||t.summary?.startsWith('Obiettivo didattico di genere o gruppo.'))return '';
 return t.summary||'';
}
function studySources(t){
 const grouped=new Map();
 for(const source of t.sources.filter(s=>! /^(S1-|S2-|AUDIT-|EDITORIAL-)/.test(s.sourceId||'')&&!/^Scientific Baseline\b/.test(s.title))){
  const key=source.url||source.sourceId||source.title;
  if(!grouped.has(key))grouped.set(key,{source,locations:new Set()});
  if(source.location)grouped.get(key).locations.add(source.location);
 }
 return [...grouped.values()].map(({source,locations})=>({...source,location:[...locations].join('; ')}));
}

const referenceViews=[['lateral','Laterale'],['top','Sopra'],['underside','Sotto']];
const referenceLabel=(photo,fallback)=>photo?.alt?.endsWith(' — base esterna')?'Base esterna':fallback;
const referencePath=/^images\/reference\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(jpg|jpeg|png|webp)$/;
function studyFacts(t){
 const p=t.studyProfile||{},print=p.sporePrint,food=p.edibility;
 const color=print?.color&&/^#[0-9a-f]{6}$/i.test(print.color)?'<span class="spore-swatch" style="background:'+print.color+'" aria-hidden="true"></span>':'';
 return '<dl class="study-facts"><dt>Odore</dt><dd>'+escape(p.odor||'Non documentato')+'</dd><dt>Sporata</dt><dd>'+color+escape(print?.label||'Non documentata')+(print?.scale?' · '+escape(print.scale):'')+'</dd><dt>Commestibilità</dt><dd>'+escape(t.kind==='teaching-group'?'Consulta le singole specie':food?.label||'Non documentata')+'</dd></dl>'+
 (food?.precautions?.length?'<div class="food-precautions"><strong>Accorgimenti</strong><ul>'+food.precautions.map(value=>'<li>'+escape(value)+'</li>').join('')+'</ul></div>':'')+
 (/^Russula\b/.test(t.scientificName)?'<details class="compact-details russula-scale"><summary>Scala della sporata I–IV</summary><div class="spore-legend">'+[['I','Bianca','#fffdf4'],['II','Crema','#f0e3bf'],['III','Ocra','#d5b16c'],['IV','Gialla','#e5bc41']].map(([code,label,color])=>'<span><i class="spore-swatch" style="background:'+color+'" aria-hidden="true"></i>'+code+' · '+label+'</span>').join('')+'</div><p class="small">Colori indicativi, non calibrati. La classe precisa va verificata sul deposito sporale, non sulle lamelle.</p>'+safeLink('https://s2hnh.org/wp-content/uploads/2016/10/La-couleur-des-spore%CC%81es-2016-7reduit.pdf','Scala Romagnesi · approfondimento')+'</details>':'');
}
const publicPhotoHttps=value=>{try{const url=new URL(value);return typeof value==='string'&&url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}};
function referenceGallery(t){
 const images=t.referenceImages||[];
 const subjects=[...new Set(images.map(p=>p.subjectTaxon).filter(Boolean))];
 if(!images.length)return '<p class="small photo-pending">Immagini di riferimento non ancora disponibili.</p>';
 return (subjects.length===1&&subjects[0]!==t.scientificName?'<p class="photo-subject-label">Specie raffigurata: '+escape(subjects[0])+'</p>':'')+'<div class="photo-triptych">'+referenceViews.map(([view,label])=>{
  const photo=images.find(p=>p.view===view&&referencePath.test(p.src));
  const caption=referenceLabel(photo,label);
  return '<figure>'+(photo?'<button class="photo-thumb" data-action="photo-zoom" data-id="'+escape(t.id)+'" data-view="'+view+'" aria-label="Ingrandisci vista '+caption.toLowerCase()+' di '+escape(photo.subjectTaxon||t.scientificName)+'"><img src="'+escape(photo.src)+'" alt="'+escape(photo.alt)+'" loading="lazy" decoding="async"></button>':'<div class="photo-missing">Vista non disponibile</div>')+'<figcaption>'+caption+(subjects.length>1&&photo?.subjectTaxon&&photo.subjectTaxon!==t.scientificName?'<small class="photo-subject">'+escape(photo.subjectTaxon)+'</small>':'')+'</figcaption></figure>';
 }).join('')+'</div>';
}
let photoOpener=null,photoScale=1,detailIds=null;
function detailRows(){return detailIds?detailIds.map(id=>byId.get(id)).filter(Boolean):filtered();}
function zoomReference(id,view,opener){
 const taxon=byId.get(id),photo=taxon?.referenceImages?.find(p=>p.view===view&&referencePath.test(p.src));
 if(!photo)return;
 let viewer=$('#photo-viewer');
 if(!viewer){
  viewer=document.createElement('dialog');viewer.id='photo-viewer';viewer.setAttribute('aria-labelledby','photo-title');
  viewer.innerHTML='<div class="dialog-top"><button id="photo-close">Chiudi immagine</button><strong id="photo-title"></strong></div><div class="photo-controls"><button id="photo-minus">Riduci</button><span id="photo-scale"></span><button id="photo-plus">Ingrandisci</button></div><div class="photo-stage"><img id="photo-full" alt=""></div><p id="photo-credit" class="small"></p><p id="photo-links" class="small"></p>';
  document.body.append(viewer);
  $('#photo-close').onclick=()=>viewer.close();
  viewer.addEventListener('close',()=>{photoOpener?.focus({preventScroll:true});photoOpener=null;});
  $('#photo-minus').onclick=()=>resizeReference(-.5);$('#photo-plus').onclick=()=>resizeReference(.5);
 }
 photoOpener=opener;photoScale=1;
 $('#photo-title').textContent=(photo.subjectTaxon||taxon.scientificName)+' · '+referenceLabel(photo,referenceViews.find(v=>v[0]===view)?.[1]||'');
 $('#photo-full').src=photo.src;$('#photo-full').alt=photo.alt;$('#photo-credit').textContent=photo.credit;
 const links=$('#photo-links');links.replaceChildren();
 for(const [field,label] of [['sourceUrl','Fonte'],['licenseUrl','Licenza']])if(publicPhotoHttps(photo[field])){const link=document.createElement('a');link.href=photo[field];link.textContent=label;link.target='_blank';link.rel='noopener noreferrer';links.append(link);}
 resizeReference(0);viewer.showModal();$('#photo-close').focus();
}
function resizeReference(delta){
 photoScale=Math.max(1,Math.min(4,photoScale+delta));
 $('#photo-full').style.width=(photoScale*100)+'%';$('#photo-scale').textContent=Math.round(photoScale*100)+'%';
 $('#photo-minus').disabled=photoScale===1;$('#photo-plus').disabled=photoScale===4;
}
function genusRevision(t){
 if(t.kind!=='teaching-group')return '';
 const units=(t.relatedIds||[]).map(id=>byId.get(id)).filter(row=>row&&row.kind!=='teaching-group');
 return '<section class="genus-revision"><h3>Ripasso del genere</h3><ol class="revision-prompts"><li>Forma complessiva e strutture dell’imenoforo.</li><li>Consistenza, veli e reazioni alle lesioni.</li><li>Odore, sporata, substrato e ospite.</li><li>Differenze fra specie e limiti dei caratteri.</li></ol>'+
 (units.length?button('Ripassa specie collegate','genus-review',t.id,'full')+'<details class="compact-details"><summary>Confronta '+units.length+' schede</summary>'+units.map(row=>'<details class="compact-details"><summary>'+escape(row.scientificName)+'</summary><ol>'+row.characters.map(value=>'<li>'+escape(studyText(value))+'</li>').join('')+'</ol>'+(row.differentiatingCharacter?'<p><strong>+1</strong> '+escape(studyText(row.differentiatingCharacter))+'</p>':'')+button('Apri '+row.scientificName,'related',row.id)+'</details>').join('')+'</details>':'<p class="small">Le specie di questo genere non sono ancora incluse nel catalogo.</p>')+'</section>';
}
function validCommercialFields(t){
 const c=t.commercialization;if(c===undefined)return true;
 const text=v=>typeof v==='string'&&!!v.trim();
 if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).some(k=>!['product','wholeCard','reviewedAt','context','conditions','members'].includes(k))||c.product!=='fresh'||typeof c.wholeCard!=='boolean'||!/^\d{4}-\d{2}-\d{2}$/.test(c.reviewedAt)||!text(c.context)||!text(c.conditions)||!Array.isArray(c.members)||!c.members.length||new Set(c.members.map(m=>m?.scientificName)).size!==c.members.length)return false;
 if(c.wholeCard&&(t.rank!=='species'||t.kind==='teaching-group'||c.members.length!==1||c.members[0]?.scientificName!==t.scientificName))return false;
 return c.members.every(m=>{
  if(!m||Object.keys(m).some(k=>!['scientificName','status','label','regions','sources'].includes(k))||!text(m.scientificName)||!['national','regional','banned'].includes(m.status)||!Array.isArray(m.regions)||!m.regions.every(text)||new Set(m.regions).size!==m.regions.length||!Array.isArray(m.sources)||!m.sources.length||!m.sources.every(s=>s&&text(s.id)&&text(s.title)&&publicPhotoHttps(s.url)&&['national','regional','taxonomy'].includes(s.scope)&&(s.scope!=='regional'||m.regions.includes(s.region))))return false;
  if(m.status==='banned')return m.scientificName==='Tricholoma equestre'&&m.label==='Commercializzazione vietata in Italia'&&!m.regions.length&&m.sources.some(s=>s.id==='OM2002-EQUESTRE'&&s.scope==='national');
  if(m.scientificName==='Tricholoma equestre')return false;
  if(m.status==='national')return m.label==='Specie commerciabile in Italia'&&!m.regions.length&&m.sources.some(s=>s.id==='DPR376-ANNEX-I'&&s.scope==='national');
  return m.regions.length>0&&m.label==='Specie commerciabile in '+m.regions.join(', ')&&m.regions.every(region=>m.sources.some(s=>s.scope==='regional'&&s.region===region));
 });
}
function commercializationHTML(t){
 const c=t.commercialization;if(!c||!validCommercialFields(t))return '';
 const entries=c.members.map(m=>'<li>'+(!c.wholeCard?'<strong>'+escape(m.scientificName)+'</strong> · ':'')+'<span class="commerce-badge '+(m.status==='banned'?'commerce-ban':m.status==='regional'?'commerce-regional':'')+'">'+escape(m.label)+'</span><span class="commerce-sources">'+m.sources.map(s=>safeLink(s.url,s.title)).join(' · ')+'</span></li>').join('');
 return (c.wholeCard?'<p class="commerce-inline"><span class="commerce-badge '+(c.members[0].status==='banned'?'commerce-ban':c.members[0].status==='regional'?'commerce-regional':'')+'">'+escape(c.members[0].label)+'</span></p>':'')+'<details class="compact-details commerce-details"><summary>'+(c.wholeCard?'Commercializzazione · riferimenti':'Specie commerciabili comprese nella scheda')+'</summary>'+(c.wholeCard?'':'<p class="small">Le indicazioni riguardano solo le specie elencate.</p>')+'<ul class="commerce-members">'+entries+'</ul><p class="small">'+escape(c.context)+'</p><p class="small">'+escape(c.conditions)+'</p><p class="small">La commerciabilità è distinta dalla commestibilità e non certifica gli esemplari raccolti. Le integrazioni regionali indicate sono quelle verificate per questa scheda.</p></details>';
}

function validStudyFields(t){
 if(!validCommercialFields(t))return false;
 const text=value=>typeof value==='string'&&value.trim().length>0;
 const p=t.studyProfile;
 if(p!==undefined){
  if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(key=>!['odor','sporePrint','edibility'].includes(key)))return false;
  if(p.odor!==undefined&&!text(p.odor))return false;
  if(p.sporePrint!==undefined){const print=p.sporePrint;if(!print||!text(print.label)||(print.color!==undefined&&!/^#[0-9a-f]{6}$/i.test(print.color))||(print.scale!==undefined&&!['I','II','III','IV','I–II','I–III','I–IV','II–III','II–IV','III–IV'].includes(print.scale)))return false;}
  if(p.edibility!==undefined&&(!p.edibility||!text(p.edibility.label)||!Array.isArray(p.edibility.precautions)||!p.edibility.precautions.every(text)))return false;
 }
 if(t.referenceImages!==undefined&&(!Array.isArray(t.referenceImages)||new Set(t.referenceImages.map(p=>p?.view)).size!==t.referenceImages.length||!t.referenceImages.every(p=>p&&referencePath.test(p.src)&&referenceViews.some(([view])=>view===p.view)&&text(p.alt)&&text(p.credit)&&(p.subjectTaxon===undefined||text(p.subjectTaxon))&&(p.sourceUrl===undefined||publicPhotoHttps(p.sourceUrl))&&(p.licenseUrl===undefined||publicPhotoHttps(p.licenseUrl)))))return false;
 return true;
}

function content(t,showIdentity=true){
 const sources=studySources(t),summary=studySummary(t);
 const diagnostic=['field_high_confidence_when_typical','field_high_confidence_when_host_known','field_high_confidence_when_young','microscopy_required_for_fine_id','dna_confirmatory'].includes(t.diagnosticStatus)?diagnosticLimits[t.diagnosticStatus]:'';
 return (showIdentity?'<div class="taxon-title"><h2>'+escape(t.scientificName)+'</h2>'+favoriteButton(t)+'</div><p class="small">'+escape(ranks[t.rank]||t.rank||'')+'</p>'+(t.commonNames.length?'<p>'+escape(t.commonNames.join(' · '))+'</p>':''):'')+
 referenceGallery(t)+studyFacts(t)+commercializationHTML(t)+
 (t.authorship?'<p class="small">Autore nomenclaturale: '+escape(t.authorship)+'</p>':'')+(t.family?'<p class="small">Famiglia: '+escape(t.family)+'</p>':'')+
 (t.rank!=='species'&&t.currentAcceptedNames?.length?'<p class="small">Nomi compresi: '+escape(t.currentAcceptedNames.join(' · '))+'</p>':'')+
 (t.safetyCheck?'<h3>Controlli sul campo</h3><p>'+escape(t.safetyCheck)+'</p>':'')+(diagnostic?'<p class="small">'+escape(diagnostic)+'</p>':'')+(t.diagnosticNote?'<p class="small">'+escape(studyText(t.diagnosticNote))+'</p>':'')+
 (summary?'<p>'+escape(summary)+'</p>':'')+
 (t.characters.length?'<h3>Caratteri di studio</h3><ol>'+t.characters.map(c=>'<li>'+escape(studyText(c))+'</li>').join('')+'</ol>':'<p>Per studiare i caratteri, apri le schede collegate.</p>')+
 (t.differentiatingCharacter?'<h3>Carattere differenziante (+1)</h3><p>'+escape(studyText(t.differentiatingCharacter))+'</p>':'')+
 (t.lookalikes.length?'<details class="compact-details"><summary>Specie simili</summary><p>'+escape(t.lookalikes.join(' · '))+'</p></details>':'')+
 (t.habitat.length?'<details class="compact-details"><summary>Habitat</summary><p>'+escape(t.habitat.join(' · '))+'</p></details>':'')+
 (sources.length?'<details class="compact-details"><summary>Fonti</summary>'+sources.map(source=>'<div class="source"><p>'+escape(source.title)+(source.location?' · '+escape(source.location):'')+'</p>'+(source.url?'<p class="small">'+safeLink(source.url,'Consulta la fonte')+'</p>':'')+'</div>').join('')+'</details>':'')+
 genusRevision(t)+
 (t.relatedIds?.length?'<h3>Schede collegate</h3><div class="drafts">'+t.relatedIds.filter(id=>byId.has(id)).map(id=>button('Studia '+byId.get(id).scientificName,'related',id)).join('')+'</div>':'');
}

function beginReview(retry=false,ids=null){
 const rows=ids?ids.map(id=>byId.get(id)).filter(t=>t?.characters.length===3&&t.differentiatingCharacter):retry&&reviewSession?reviewSession.missed.map(id=>byId.get(id)).filter(Boolean):filtered().filter(t=>t.characters.length===3&&t.differentiatingCharacter);
 if(!rows.length){status('Nessuna scheda 3+1 nei filtri: scegli Minimo o Tutte, oppure modifica ricerca e Preferiti.');return;}
 const shuffled=[...rows];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 reviewSession={ids:(ids?shuffled:shuffled.slice(0,10)).map(t=>t.id),index:0,revealed:false,remembered:0,missed:[]};
 currentTaxon=null;renderReview();
}
function renderReview(){
 const session=reviewSession;if(!session)return;
 const total=session.ids.length;
 if(session.index>=total){
  showDialog('Ripasso attivo','<h2>Sessione conclusa</h2><p>'+session.remembered+' schede ricordate · '+session.missed.length+' da ripassare.</p><p class="small">Autovalutazione della memoria sui contenuti del catalogo, senza attestazione di competenza o determinazione sul campo. La sessione non viene salvata.</p>'+(session.missed.length?button('Ripassa le schede da rivedere','review-retry','','full'):'')+button('Nuova sessione dai filtri','review-start','','full'));
  focusReviewHeading();return;
 }
 const t=byId.get(session.ids[session.index]);
 const question='<p class="counter">Scheda '+(session.index+1)+' di '+total+'</p><h2>Quale unità tassonomica?</h2><p class="small">Può essere una specie, una sezione o un gruppo di specie. Ricorda il nome a partire dai caratteri.</p><h3>Tre caratteri di studio</h3><ol>'+t.characters.map(c=>'<li>'+escape(studyText(c))+'</li>').join('')+'</ol><h3>Carattere differenziante (+1)</h3><p>'+escape(studyText(t.differentiatingCharacter))+'</p>';
 const answer=session.revealed?'<section id="review-answer"><h2>'+escape(t.scientificName)+'</h2><p class="small">'+escape(ranks[t.rank]||t.rank)+'</p><div class="row">'+button('Da ripassare','review-rate','again')+button('Ricordata','review-rate','remembered')+'</div><details><summary>Confronta la scheda e le fonti</summary>'+content(t,false)+'</details></section>':button('Mostra risposta','review-reveal','','full');
 showDialog('Ripasso attivo',question+answer);focusReviewHeading();
}
function focusReviewHeading(){const heading=$('#review-answer > h2')||$('#detail-body h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});}}

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
 return new Set(rows.map(t=>t?.id)).size===rows.length&&rows.every(t=>t&&validStudyFields(t)&&typeof t.id==='string'&&t.id.length&&typeof t.scientificName==='string'&&(t.summary===undefined||typeof t.summary==='string')&&['commonNames','characters','lookalikes','habitat'].every(key=>textList(t[key]))&&['aliases','currentAcceptedNames','currentGenera','relatedIds'].every(key=>t[key]===undefined||textList(t[key]))&&(t.differentiatingCharacter===undefined||typeof t.differentiatingCharacter==='string')&&Array.isArray(t.sources)&&t.sources.every(source=>source&&typeof source.title==='string'))&&
 value.bibliography.every(source=>source&&typeof source.title==='string'&&(source.authors===undefined||textList(source.authors)))&&new Set(value.areas.map(a=>a?.id)).size===value.areas.length&&value.areas.every(a=>a&&typeof a.id==='string'&&typeof a.name==='string'&&typeof a.region==='string'&&textList(a.habitat)&&Array.isArray(a.center)&&a.center.length===2&&a.center.every(Number.isFinite)&&Math.abs(a.center[0])<=90&&Math.abs(a.center[1])<=180&&(!a.elevationRangeM||(Array.isArray(a.elevationRangeM)&&a.elevationRangeM.length===2&&a.elevationRangeM.every(Number.isFinite))));
}

function renderStudio(){
 renderedCount=0;
 $('#main').innerHTML='<section><h1>Studio e atlante</h1>'+scientificCoverage()+
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
function cardHTML(t){return '<article class="card"><div class="taxon-title"><button class="heading" data-action="open" data-id="'+escape(t.id)+'" aria-label="Apri '+escape(t.scientificName)+'"><strong>'+escape(t.scientificName)+'</strong><span>'+escape([ranks[t.rank]||t.rank,...t.commonNames].filter(Boolean).join(' · '))+'</span></button>'+favoriteButton(t)+'</div>'+(feed?content(t,false):'')+'</article>';}

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
 const rows=detailRows(),index=rows.findIndex(t=>t.id===id);
 $('#position').textContent=index<0?'Fuori filtri':(index+1)+' / '+rows.length;
 $('#previous').disabled=index<=0;$('#next').disabled=index<0||index===rows.length-1;
 showDialog('Scheda di studio',content(t),true);
}
function toggleFavorite(id){
 if(!studyWritable){status('Salvataggio sospeso: i dati esistenti non sono leggibili.');return;}
 const removing=favoriteIds.includes(id),moveDetail=removing&&onlyFavorites&&!detailIds&&$('#detail').open&&currentTaxon===id;
 const oldIndex=moveDetail?filtered().findIndex(t=>t.id===id):-1;
 favoriteIds=removing?favoriteIds.filter(value=>value!==id):[...favoriteIds,id];persistStudy();
 if(tab==='studio'){if(onlyFavorites)renderCards();else updateCatalogCount();}
 document.querySelectorAll('button.mushroom-toggle').forEach(b=>{if(b.dataset.id===id){const selected=favoriteIds.includes(id);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',selected?'Rimuovi preferito':'Salva preferito');b.title=selected?'Rimuovi dai preferiti':'Aggiungi ai preferiti';}});

 if(moveDetail){const rows=filtered(),next=rows[Math.min(Math.max(oldIndex,0),rows.length-1)];if(next){openTaxon(next.id);status('Preferito rimosso. Aperta la scheda disponibile successiva.');}else{currentTaxon=null;$('#detail').close();status('Nessuna scheda corrisponde ai filtri: modifica la ricerca o disattiva Preferiti.');}return;}

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
 showDialog('Macroarea', '<h2>'+escape(area.name)+'</h2><p>'+escape(area.region)+'</p><p class="small">Centro rappresentativo: non indica una fungaia, un accesso autorizzato o un percorso verificato.</p><p>'+escape(area.habitat.join(' · '))+'</p><p class="small">Centro macroarea: '+escape(area.center.join(', '))+' (latitudine, longitudine).</p><p>'+safeLink(url,'Apri il centro nelle mappe')+'</p>'+(area.elevationRangeM?'<p class="small">Fascia altimetrica indicativa: '+escape(area.elevationRangeM.join('–'))+' m. Non è un profilo del percorso.</p>':'')+'<h3>Prima dell’uscita</h3><ul><li>Verifica titolo di raccolta, limiti e divieti aggiornati presso le autorità locali.</li><li>Controlla regole del parco, accesso ai terreni, chiusure e condizioni del percorso.</li><li>Prepara le mappe del percorso e verifica il pacchetto offline prima di partire.</li></ul><h3>Fonti territoriali</h3>'+(area.evidenceSources?.length?area.evidenceSources.map(source=>'<p>'+safeLink(source.url,source.label)+'</p>').join(''):'<p>Fonti territoriali specifiche da integrare.</p>'));
}
const fields=['date','taxon','habitat','characters','evidence','sources','notes','latitude','longitude'];
const labels={date:'Data (AAAA-MM-GG)',taxon:'Ipotesi tassonomica',habitat:'Habitat e substrato',characters:'Caratteri osservati',evidence:'Evidenze, foto di riferimento e limiti',sources:'Fonti: autore, titolo, pagina, DOI o URL',notes:'Note',latitude:'Latitudine facoltativa',longitude:'Longitudine facoltativa'};
function freshDraft(){return {id:typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),date:new Date().toISOString().slice(0,10),taxon:'',habitat:'',characters:'',evidence:'',sources:'',notes:'',latitude:'',longitude:'',updatedAt:new Date().toISOString()};}
function renderNotes(){
 $('#main').classList.remove('feed');const draft=drafts.find(d=>d.id===selectedDraft);
 $('#main').innerHTML='<section><h1>Osservazioni offline</h1><p><a class="button photo-import-link" href="./importa-foto.html">Importa foto dal telefono a GitHub</a></p><p class="small">Annota ritrovamenti e caratteri osservati. Le note restano su questo dispositivo: esportale per conservarle.</p>'+
 (!notesWritable?'<p class="error">Bozze non leggibili. I dati esistenti non saranno sovrascritti.</p>':button('Nuova bozza','new-draft','', 'full'))+
 '<p id="save-warning" class="error" role="alert"'+(notesSaveError?'':' hidden')+'>'+escape(notesSaveError)+'</p><div class="drafts">'+drafts.map(d=>button((d.id===selectedDraft?'✓ ':'')+(d.taxon||'Taxon non determinato')+' · '+d.date,'select-draft',d.id)).join('')+'</div>'+
 (draft?'<form id="draft-form">'+fields.map(field=>'<label for="draft-'+field+'">'+labels[field]+'</label>'+(['date','taxon','latitude','longitude'].includes(field)?'<input type="text" '+(['latitude','longitude'].includes(field)?'inputmode="decimal" ':'')+'id="draft-'+field+'" name="'+field+'" value="'+escape(draft[field])+'">':'<textarea id="draft-'+field+'" name="'+field+'">'+escape(draft[field])+'</textarea>')).join('')+'</form><p id="saved" class="saved" role="status"></p><label class="check"><input type="checkbox" id="include-coordinates">Includi coordinate nell’esportazione. Controlla anche eventuali località scritte nelle note.</label><div class="row">'+button('Scarica JSON','download-draft')+button('Condividi JSON','share-draft')+'</div><p id="draft-error" class="error" role="alert" hidden></p><div class="controls">'+button('Salva di nuovo','save-draft')+button('Elimina bozza','delete-draft','','danger')+'</div><p class="small">Per le fotografie, indica un riferimento nel campo Evidenze.</p>':'<p>Nessuna bozza. Registra il prossimo ritrovamento.</p>')+
 '<h3>Backup personale</h3><p class="small">Salva preferiti e note, incluse le coordinate private.</p>'+button('Scarica backup locale','backup','', 'full')+'<label for="restore-backup">Ripristina backup JSON</label><input id="restore-backup" type="file" accept="application/json,.json"><p class="small">Importa il backup senza cancellare i dati attuali.</p></section>';
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
 return '<details id="scientific-coverage"><summary>Biblioteca di studio</summary>'+studySources({sources:data.bibliography||[]}).map(s=>'<div class="source"><p>'+escape(s.title)+'</p><p class="small">'+escape([...(s.authors||[]),s.publisher,s.publicationYear].filter(Boolean).join(' · '))+'</p>'+(s.url?'<p>'+safeLink(s.url,'Apri riferimento esterno')+'</p>':'')+'</div>').join('')+'</details>';
}

function renderCommunity(){
 $('#main').classList.remove('feed');$('#main').innerHTML='<section><h1>Contributi scientifici</h1><p><a class="button photo-import-link" href="./importa-foto.html">Importa foto · proprietario e manutentori</a></p><p>Aiuta a migliorare l’atlante con una correzione documentata: indica il fungo, la modifica e una fonte verificabile.</p><div class="link-list"><a href="https://github.com/gianpaolobol/fungo-italia/issues/new?template=scientific-contribution.yml" target="_blank" rel="noopener noreferrer"><strong>Proponi una correzione scientifica su GitHub</strong>Indica il taxon, la modifica proposta e le fonti con pagina, DOI o URL.</a></div><p class="small">La proposta sarà pubblica e richiede un account GitHub. Non includere dati personali o coordinate precise; condividi solo foto pubblicabili. Sarà verificata prima di aggiornare l’atlante.</p><details><summary>Servizio storico e account esistenti</summary><p class="small">Accedi con il tuo account per consultare o inviare contributi nel servizio precedente.</p><div class="link-list">'+[
 ['/catalog/proposals/new','Proposta nel servizio storico','Per gli account già presenti.'],
 ['/observations/new','Osservazione nel servizio storico','Fotografie e caratteri osservati con il proprio account.'],
 ['/admin/catalog','Revisione nel servizio storico','Disponibile ai ruoli autorizzati dal servizio.']
 ].map(([path,title,description])=>'<a href="https://fungo-italia-beta.gianpaolo-franceschi.chatgpt.site'+path+'" target="_blank" rel="noopener noreferrer"><strong>'+title+'</strong>'+description+'</a>').join('')+'</div></details></section>';
}
function renderTab(){
 destroyMap();if(observer)observer.disconnect();currentTaxon=null;

document.querySelectorAll('[data-tab]').forEach(b=>b.getAttribute('data-tab')===tab?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'));
 if(tab==='studio')renderStudio();else if(tab==='areas')renderAreas();else if(tab==='notes')renderNotes();else renderCommunity();$('#main').scrollTop=scrollPositions[tab]||0;
}
document.addEventListener('click',event=>{
 const target=event.target.closest('button[data-action]');if(!target)return;const action=target.dataset.action,id=target.dataset.id;
 if(action==='photo-zoom')zoomReference(id,target.dataset.view,target);
 else if(action==='genus-review'){const group=byId.get(id);if(group)beginReview(false,group.relatedIds||[]);}
 else if(action==='review-start')beginReview();
 else if(action==='review-retry')beginReview(true);
 else if(action==='review-reveal'){if(reviewSession){reviewSession.revealed=true;renderReview();}}
 else if(action==='review-rate')rateReview(id);
 else if(action==='open'){detailIds=null;openTaxon(id);}
 else if(action==='search-all'){layer='all';onlyFavorites=false;limit=24;renderStudio();$('#main').scrollTop=0;}
 else if(action==='resume'){const taxon=byId.get(id);if(taxon){layer=taxon.kind==='teaching-group'?'groups':'minimum';query='';onlyFavorites=false;limit=24;renderStudio();$('#main').scrollTop=0;openTaxon(id);}}
 else if(action==='favorite')toggleFavorite(id);
 else if(action==='related'){const parent=byId.get(currentTaxon)||byId.get(target.closest('.card')?.querySelector('[data-action="open"]')?.dataset.id);if(parent?.kind==='teaching-group'){detailIds=(parent.relatedIds||[]).filter(key=>byId.has(key));}else if(!detailIds){layer='minimum';query='';onlyFavorites=false;if(tab==='studio')renderStudio();}openTaxon(id);}
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
$('#detail').addEventListener('close',()=>{currentTaxon=null;detailIds=null;});
$('#previous').onclick=()=>{const rows=detailRows(),index=rows.findIndex(t=>t.id===currentTaxon);if(index>0)openTaxon(rows[index-1].id);};
$('#next').onclick=()=>{const rows=detailRows(),index=rows.findIndex(t=>t.id===currentTaxon);if(index>=0&&index<rows.length-1)openTaxon(rows[index+1].id);};
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
 const checkCache=async()=>{const controller=navigator.serviceWorker.controller;if(!controller)return;const channel=new MessageChannel();const ready=await new Promise(resolve=>{const timer=setTimeout(()=>resolve(false),4000);channel.port1.onmessage=event=>{clearTimeout(timer);resolve(event.data?.ready===true);};controller.postMessage({type:'CACHE_STATUS'},[channel.port2]);});offlineReady=ready;networkStatus();status(ready?'Catalogo pronto offline.':'Pacchetto offline non verificato: riapri con connessione o aggiorna l’app.',{background:true});};
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
