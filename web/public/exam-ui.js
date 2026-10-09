import {selectCases,gradeAnswer,restoreSession,foodLabels} from './exam-core.js';
const key='fungo-italia:photo-exam:v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const control=(label,action,id='',extra='')=>'<button type="button" data-exam-action="'+action+'" data-exam-id="'+esc(id)+'" '+extra+'>'+esc(label)+'</button>';
const views={lateral:'Laterale',top:'Cappello',underside:'Superficie fertile e gambo'};
export function questionPhotos(c){
 return '<div class="exam-photos">'+c.photos.map((p,i)=>'<figure><button type="button" class="exam-photo" data-exam-action="zoom" aria-label="Ingrandisci immagine '+(i+1)+'"><img src="'+esc(p.src)+'" alt="Esemplare da identificare, immagine '+(i+1)+'" loading="lazy"></button><figcaption>'+esc(views[p.view]||'Vista disponibile')+'</figcaption></figure>').join('')+'</div><p class="small">Tocca una foto per ingrandirla. Alcune viste sono ritagli della stessa fotografia; non rappresentano necessariamente esemplari diversi.</p>';
}
export function initExam({bank,showDialog,badge}){
 const byId=new Map(bank.map(c=>[c.id,c]));
 // Invalidate saved answers when reviewed solutions or photo subjects change.
 let hash=2166136261;for(const ch of JSON.stringify(bank))hash=Math.imul(hash^ch.charCodeAt(0),16777619);
 const signature=String(hash>>>0);
 let session=null,reviewIndex=null,storageMessage='',photoMessage='';
 try{const raw=localStorage.getItem(key);if(raw){const restored=restoreSession(raw,bank);if(restored&&restored.signature===signature)session=restored;else storageMessage='La sessione salvata non è compatibile con i contenuti attuali. Avvia una nuova sessione.';}}catch{storageMessage='Memoria locale non disponibile: la sessione resta aperta finché non chiudi o ricarichi l’app.';}
 function save(){try{session.signature=signature;localStorage.setItem(key,JSON.stringify(session));storageMessage='';}catch{storageMessage='Sessione non salvata sul dispositivo. Mantieni aperta questa pagina per conservare le risposte.';}}
 const notice=()=>(storageMessage?'<p class="notice" role="status">'+esc(storageMessage)+'</p>':'')+(photoMessage?'<p class="notice" role="status">'+esc(photoMessage)+'</p>':'');
 const caseAt=i=>byId.get(session.ids[i]);
 function open(){
  reviewIndex=null;
  const counts=Object.keys(foodLabels).map(cat=>foodLabels[cat]+': '+bank.filter(c=>c.category===cat).length).join(' · ');
  showDialog('Test fotografico','<h2>15 funghi da riconoscere</h2><p>Nome scientifico, commestibilità e spiegazione della preparazione o della tossicologia. Le categorie alimentari seguono la valutazione del catalogo fondata sulla Guida ragionata.</p><p>'+bank.length+' casi con fotografie attribuite al taxon e soluzione documentata. I gruppi e i casi incompleti restano nell’atlante e sono esclusi da questo test.</p><p class="small">'+esc(counts)+'</p>'+notice()+(session?control(session.complete?'Rivedi ultima correzione':'Riprendi sessione ('+(session.index+1)+'/15)','resume'):'')+'<p class="small">Per studiare senza rete: avvia una sessione con connessione e scarica le sue foto prima di uscire.</p><div class="exam-modes">'+control('Allenamento · correzione immediata','start','training')+control('Simulazione · correzione dopo 15','start','exam')+'</div><p class="notice">Esercizio fotografico per lo studio: non riproduce la valutazione ufficiale né sostituisce l’esame di esemplari reali. “Libera” non significa che qualsiasi consumo a crudo sia sicuro.</p><p class="small">Nome e categoria hanno una correzione automatica. Le spiegazioni aperte si confrontano con una griglia e si autovalutano separatamente. La sessione viene conservata solo su questo dispositivo, quando il salvataggio è disponibile.</p>');
 }
 function begin(mode){
  photoMessage='';
  if(bank.length<15){showDialog('Test fotografico','<p>Il pacchetto di test non è disponibile. Aggiorna l’app con connessione attiva.</p>');return;}
  session={version:1,mode,ids:selectCases(bank).map(c=>c.id),answers:[],index:0,complete:false,signature};reviewIndex=null;save();question();
 }
 function capture(){
  const name=document.querySelector('#exam-name');if(!name)return;
  const old=session.answers[session.index]||{};
  session.answers[session.index]={...old,name:name.value.slice(0,200),category:document.querySelector('#exam-category').value,detail:document.querySelector('#exam-detail').value.slice(0,5000)};
  save();
 }
 function question(){
  reviewIndex=null;const c=caseAt(session.index),a=session.answers[session.index]||{};
  if(session.mode==='training'&&a.revealed){showTraining();return;}
  showDialog(session.mode==='exam'?'Simulazione d’esame':'Allenamento fotografico','<h2>Esemplare '+(session.index+1)+' di 15</h2><progress value="'+(session.index+1)+'" max="15" aria-label="Avanzamento"></progress>'+notice()+control('Scarica foto della sessione','offline')+questionPhotos(c)+'<div class="exam-form"><label for="exam-name">Nome scientifico</label><input id="exam-name" maxlength="200" autocomplete="off" autocapitalize="none" spellcheck="false" value="'+esc(a.name)+'" placeholder="Genere e specie"><label for="exam-category">Commestibilità</label><select id="exam-category"><option value="">Non so / non risposto</option>'+Object.entries(foodLabels).map(([v,l])=>'<option value="'+v+'"'+(a.category===v?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select><label for="exam-detail">Preparazione o tossicologia</label><textarea id="exam-detail" maxlength="5000" rows="5" placeholder="Se condizionata: trattamento e condizioni. Se tossica o mortale: sindrome, latenza, manifestazioni e organi coinvolti.">'+esc(a.detail)+'</textarea></div><p class="small">Se non riconosci il fungo puoi lasciare la risposta vuota. La spiegazione non viene valutata automaticamente.</p><div class="exam-controls">'+(session.index>0?control('Precedente','previous'):'')+control(session.mode==='training'?'Confronta la risposta':session.index===14?'Concludi e correggi':'Salva e continua','answer')+'</div>');
 }
 function clinicalRubric(c,a,index){
  if(!c.detailKind)return c.preparation.length?'<h3>Accorgimenti di studio</h3><ul>'+c.preparation.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>':'';
  const kind=c.detailKind==='preparation'?'Preparazione':'Tossicologia';
  const solution=c.detailKind==='preparation'?'<ul>'+c.preparation.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul><p class="small">Verifica ogni condizione indicata: non applicare tempi o bolliture generiche a tutte le specie.</p>':'<dl><dt>Sindrome</dt><dd>'+esc(c.syndrome.label)+'</dd><dt>Latenza</dt><dd>'+esc(c.syndrome.latency)+'</dd><dt>Manifestazioni, organi e gravità</dt><dd>'+esc(c.syndrome.severity)+'</dd></dl>';
  return '<h3>'+kind+' · confronto con la soluzione</h3><p class="exam-written"><strong>La tua spiegazione:</strong> '+esc(a.detail||'Non risposto')+'</p>'+solution+'<p>Confronta tutti i punti della griglia. Segna separatamente la completezza della tua spiegazione.</p><div class="exam-rating">'+[['correct','Completa'],['partial','Parziale'],['wrong','Da ripassare']].map(([v,l])=>control(l,'rate',index+':'+v,'aria-pressed="'+(a.selfRating===v)+'"')).join('')+'</div><p class="small">Autovalutazione: '+esc({correct:'completa',partial:'parziale',wrong:'da ripassare'}[a.selfRating]||'da confermare')+'. Non è un giudizio automatico né una valutazione docente.</p>';
 }
 function solution(index){
  const c=caseAt(index),a=session.answers[index]||{},g=gradeAnswer(c,a);
  const sources=[...new Map(c.sources.filter(s=>/^https:\/\//.test(s.url||'')).map(s=>[s.url+'|'+s.location,s])).values()];
  return '<h2>'+esc(c.name)+'</h2>'+badge({category:c.category})+'<p><strong>Nome:</strong> '+esc(a.name||'Non risposto')+' · '+(g.name?'corretto':'da ripassare')+'</p><p><strong>Categoria:</strong> '+esc(foodLabels[a.category]||'Non risposto')+' · '+(g.category?'corretta':'da ripassare')+'</p>'+(g.danger?'<p class="error"><strong>Errore alimentare pericoloso:</strong> hai indicato un consumo consentito o senza condizioni per una categoria che non lo consente.</p>':'')+clinicalRubric(c,a,index)+'<h3>Caratteri da verificare</h3><ul>'+c.characters.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul><p>'+esc(c.differentiatingCharacter)+'</p>'+(c.diagnosticNote?'<p class="notice">'+esc(c.diagnosticNote)+'</p>':'')+questionPhotos(c)+'<details><summary>Crediti fotografici e fonti della correzione</summary>'+c.photos.map(p=>'<p class="small">'+esc(p.subjectTaxon)+' · '+esc(p.credit)+(p.sourceUrl&&/^https:\/\//.test(p.sourceUrl)?' · <a href="'+esc(p.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Fotografia originale</a>':'')+(p.licenseUrl&&/^https:\/\//.test(p.licenseUrl)?' · <a href="'+esc(p.licenseUrl)+'" target="_blank" rel="noopener noreferrer">Licenza</a>':'')+'</p>').join('')+sources.map(s=>'<p class="small"><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||'Fonte')+'</a> · '+esc(s.location||'')+'</p>').join('')+'</details>';
 }
 function showTraining(){showDialog('Allenamento · correzione',notice()+solution(session.index)+control(session.index===14?'Concludi sessione':'Prossimo esemplare','next'));}
 function results(){
  reviewIndex=null;const rows=session.ids.map((_,i)=>{const c=caseAt(i),a=session.answers[i]||{};return {c,a,g:gradeAnswer(c,a),i};});
  const wrongName=rows.filter(r=>!r.g.name),wrongCategory=rows.filter(r=>!r.g.category),danger=rows.filter(r=>r.g.danger);
  const details=kind=>{const relevant=rows.filter(r=>r.c.detailKind===kind);return relevant.filter(r=>['partial','wrong'].includes(r.a.selfRating)).length+' da ripassare · '+relevant.filter(r=>!r.a.selfRating).length+' da autovalutare / '+relevant.length;};
  showDialog('Risultati · 15 funghi','<h2>Sessione conclusa</h2>'+notice()+'<ul><li>Identificazione: '+(15-wrongName.length)+'/15 corrette</li><li>Commestibilità: '+(15-wrongCategory.length)+'/15 corrette</li><li>Preparazione: '+details('preparation')+'</li><li>Tossicologia: '+details('toxicology')+'</li></ul>'+(danger.length?'<p class="error"><strong>'+danger.length+' errori alimentari pericolosi da rivedere.</strong></p>':'<p>Nessun errore alimentare pericoloso nella scelta della categoria. Le preparazioni restano da verificare nella griglia.</p>')+'<p class="small">Nessuna soglia di promozione ufficiale viene attribuita a questi risultati.</p><div class="exam-results">'+rows.map(r=>control((r.i+1)+'. '+r.c.name+' · '+(!r.g.name||!r.g.category?'errori da rivedere':r.c.detailKind&&!r.a.selfRating?'spiegazione da valutare':'rivedi soluzione'),'review',r.i)).join('')+'</div>'+control('Nuova sessione / modalità','home'));
 }
 function showReview(index){reviewIndex=index;showDialog('Correzione · esemplare '+(index+1),solution(index)+control('Torna ai risultati','results'));}
 document.addEventListener('input',event=>{if(event.target.matches('#exam-name,#exam-category,#exam-detail'))capture();});
 document.addEventListener('change',event=>{if(event.target.matches('#exam-category'))capture();});
 document.addEventListener('click',event=>{
  const b=event.target.closest('[data-exam-action]');if(!b)return;
  const action=b.dataset.examAction,id=b.dataset.examId;
  if(action==='start'){begin(id);return;}if(action==='home'){open();return;}if(action==='resume'){session.complete?results():question();return;}
  if(!session)return;
  if(action==='offline'){void prepareOffline();return;}
  if(action==='zoom'){b.classList.toggle('exam-photo-large');b.setAttribute('aria-expanded',String(b.classList.contains('exam-photo-large')));}
  else if(action==='previous'){capture();session.index--;save();question();}
  else if(action==='answer'){
   capture();session.answers[session.index]??={name:'',category:'',detail:''};
   if(session.mode==='training'){session.answers[session.index].revealed=true;save();showTraining();}
   else advance();
  }else if(action==='next')advance();
  else if(action==='review'){const i=Number(id);if(session.complete&&Number.isInteger(i)&&i>=0&&i<15)showReview(i);}
  else if(action==='results')results();
  else if(action==='rate'){
   const [i,rating]=id.split(':'),index=Number(i);if(!session.answers[index]||!['correct','partial','wrong'].includes(rating))return;
   session.answers[index].selfRating=rating;save();reviewIndex!==null?showReview(reviewIndex):showTraining();
  }
 });
 async function prepareOffline(){
  const worker=navigator.serviceWorker?.controller;
  if(!worker){photoMessage='Attendi che il catalogo sia pronto offline, poi riprova.';question();return;}
  const requested=session,channel=new MessageChannel();photoMessage='Download delle foto della sessione in corso…';question();
  const result=await new Promise(resolve=>{
   const timer=setTimeout(()=>{channel.port1.close();resolve({ready:false});},60000);
   channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};
   worker.postMessage({type:'CACHE_EXAM_PHOTOS',paths:[...new Set(requested.ids.flatMap(id=>byId.get(id).photos.map(p=>'./'+p.src)))]},[channel.port2]);
  });
  if(session!==requested)return;
  photoMessage=result.ready?'Foto della sessione pronte offline. Puoi riprendere queste 15 domande senza rete.':'Foto non tutte disponibili offline. Mantieni la connessione e riprova il download prima di uscire.';
  if(document.querySelector('#exam-name'))question();
 }
 function advance(){if(session.index===14){session.complete=true;save();results();}else{session.index++;save();question();}}
 return {open};
}
