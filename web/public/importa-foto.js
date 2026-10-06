import {MAX_BATCH,MAX_BYTES,BRANCH,REPOSITORY,digest,sanitizeJpeg,jpegDimensions,makeRecord,createGitHubClient} from './photo-core.js';
const $=id=>document.getElementById(id);
let queue=[],busy=false,client=null,connected=false,active=null,sequence=0;
const allowed=['image/jpeg','image/png','image/webp','image/heic','image/heif','image/avif','image/gif'];
function say(text){$('status').textContent=text;}
function fail(error){$('error').textContent=error?.name==='AbortError'?'Operazione interrotta. Le copie locali restano disponibili.':error?.message||'Operazione non riuscita.';$('error').hidden=false;}
function clearError(){$('error').textContent='';$('error').hidden=true;}
function controls(){
 $('choose').disabled=busy;$('camera').disabled=busy;$('connect').disabled=busy;$('forget').disabled=busy;
 $('clear').disabled=busy||!queue.length;$('cancel').disabled=!busy;
 $('upload').disabled=busy||!connected||!queue.some(item=>item.state==='ready')||!$('consent').checked||!$('credit').value.trim();
 $('credit').disabled=busy;$('consent').disabled=busy;$('token').disabled=busy;
}
function render(){
 $('queue').replaceChildren();
 queue.forEach(item=>{
  const card=document.createElement('article'),title=document.createElement('p'),state=document.createElement('p');
  title.textContent='Foto '+item.number+' · '+item.localName;card.append(title);
  if(item.preview){const image=document.createElement('img');image.src=item.preview;image.alt='Anteprima locale foto '+item.number+'; identificazione non eseguita';image.loading='lazy';card.append(image);}
  state.textContent=item.state==='ready'?'Pronta · '+item.width+' × '+item.height+' · '+Math.ceil(item.bytes.length/1024)+' KB · non determinata':item.state==='uploaded'?'Registrata su GitHub · identificazione pendente':item.message;card.append(state);
  const remove=document.createElement('button');remove.textContent='Rimuovi foto '+item.number+' dalla coda';remove.disabled=busy;remove.onclick=()=>{if(item.preview)URL.revokeObjectURL(item.preview);queue=queue.filter(photo=>photo!==item);render();};card.append(remove);$('queue').append(card);
 });
 const ready=queue.filter(item=>item.state==='ready').length,sent=queue.filter(item=>item.state==='uploaded').length;
 $('queue-count').textContent=queue.length?ready+' copie pronte · '+sent+' registrate · '+queue.filter(item=>item.state==='error').length+' non leggibili':'Nessuna fotografia selezionata.';
 controls();
}
function canvasBlob(canvas,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob&&blob.type==='image/jpeg'?resolve(blob):reject(Error('Conversione JPEG non disponibile su questo browser.')),'image/jpeg',quality));}
async function prepare(file,signal){
 if(!allowed.includes(file.type))throw Error('Formato non supportato. Seleziona una fotografia JPEG, PNG o un formato leggibile da Safari.');
 if(file.size>25*1024*1024)throw Error('Originale oltre 25 MB: esporta una copia più piccola dal telefono.');
 const url=URL.createObjectURL(file),image=new Image(),canvas=document.createElement('canvas'),small=document.createElement('canvas');
 try{
  image.src=url;await image.decode();
  if(signal.aborted)throw new DOMException('Annullato','AbortError');
  if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>60000000)throw Error('Foto troppo grande per una conversione sicura in Safari. Usa una copia più piccola.');
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d');if(!context)throw Error('Conversione locale non disponibile.');
  context.drawImage(image,0,0,canvas.width,canvas.height);
  let blob=await canvasBlob(canvas,.84);if(blob.size>MAX_BYTES)blob=await canvasBlob(canvas,.65);
  const bytes=sanitizeJpeg(new Uint8Array(await blob.arrayBuffer()));
  if(bytes.length>MAX_BYTES)throw Error('Copia oltre 2 MB: seleziona una versione meno grande.');
  const dimensions=jpegDimensions(bytes),sha=await digest(bytes);
  const factor=Math.min(1,320/Math.max(canvas.width,canvas.height));small.width=Math.max(1,Math.round(canvas.width*factor));small.height=Math.max(1,Math.round(canvas.height*factor));
  small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);
  const thumbnail=await canvasBlob(small,.7);
  return {bytes,sha,...dimensions,preview:URL.createObjectURL(thumbnail)};
 }catch(error){if(error.name==='AbortError'||/Formato|Originale|troppo grande|oltre 2 MB|Conversione|conversione/.test(error.message))throw error;throw Error('Foto non leggibile da questo browser, oppure copia iCloud non scaricata. Prova a riaprirla in Foto o a selezionare una copia JPEG.');}
 finally{URL.revokeObjectURL(url);image.src='';canvas.width=canvas.height=small.width=small.height=1;}
}
async function choose(files){
 clearError();if(busy)return;
 const remaining=MAX_BATCH-queue.filter(item=>item.state!=='uploaded').length;
 if(remaining<=0){say('La coda contiene già 20 fotografie. Caricale o rimuovile prima di continuare.');return;}
 const selected=Array.from(files).slice(0,remaining);if(!selected.length)return;
 for(const item of queue)if(item.state==='uploaded'&&item.preview)URL.revokeObjectURL(item.preview);queue=queue.filter(item=>item.state!=='uploaded');$('consent').checked=false;
 busy=true;active=new AbortController();render();let processed=0;
 try{
  for(const file of selected){
   if(active.signal.aborted)break;
   const item={number:++sequence,localName:file.name,state:'error',message:'Conversione in corso…'};queue.push(item);
   say('Preparazione locale '+(++processed)+' di '+selected.length+'…');render();
   try{const data=await prepare(file,active.signal);if(active.signal.aborted){URL.revokeObjectURL(data.preview);queue=queue.filter(p=>p!==item);break;}Object.assign(item,data,{state:'ready'});}
   catch(error){if(error.name==='AbortError'){queue=queue.filter(p=>p!==item);break;}item.message=error.message;}
   render();await new Promise(resolve=>requestAnimationFrame(resolve));
  }
  say(Array.from(files).length>selected.length?'Preparato il primo lotto: sono state selezionate più foto del limite disponibile. Carica questo lotto e seleziona le successive.':'Preparazione conclusa. Controlla le anteprime prima del caricamento.');
 }finally{busy=false;active=null;render();$('photos').value='';$('capture').value='';}
}
$('choose').onclick=()=>$('photos').click();$('camera').onclick=()=>$('capture').click();
$('photos').onchange=event=>choose(event.target.files);$('capture').onchange=event=>choose(event.target.files);
$('clear').onclick=()=>{for(const item of queue)if(item.preview)URL.revokeObjectURL(item.preview);queue=[];render();say('Coda locale svuotata. Le fotografie su GitHub non sono state eliminate.');};
$('connect').onclick=async()=>{
 clearError();connected=false;client=null;busy=true;active=new AbortController();controls();
 try{client=createGitHubClient($('token').value.trim());const repo=await client.repository(active.signal);const state=await client.snapshot(active.signal);connected=true;$('connection').textContent='Collegato a '+REPOSITORY+' · repository '+(repo.private?'privato':'pubblico')+' · '+state.metadata.photos.length+' foto nella libreria.';$('token').value='';say('GitHub collegato. Controlla le fotografie e autorizza la pubblicazione delle copie.');}
 catch(error){client=null;fail(error);$('connection').textContent='GitHub non collegato.';}
 finally{busy=false;active=null;controls();}
};
function forget(){connected=false;client=null;$('token').value='';$('connection').textContent='Autorizzazione dimenticata. Le copie locali restano disponibili.';controls();}
$('forget').onclick=forget;$('consent').onchange=controls;$('credit').oninput=controls;
$('cancel').onclick=()=>{active?.abort();say('Interruzione richiesta. Eventuali copie già registrate su GitHub restano nella libreria.');};
$('upload').onclick=async()=>{
 if(busy||!connected||!client||!$('consent').checked||!$('credit').value.trim())return;
 clearError();const ready=queue.filter(item=>item.state==='ready');if(!ready.length)return;
 busy=true;active=new AbortController();const authorizedAt=new Date().toISOString(),attribution=$('credit').value.trim();render();
 try{
  const items=ready.map(item=>({bytes:item.bytes,record:makeRecord({sha:item.sha,width:item.width,height:item.height,attribution,authorizedAt})}));
  const result=await client.publishBatch(items,{signal:active.signal,onStage:say});
  for(const item of ready){item.state='uploaded';item.bytes=null;}
  say('Lotto registrato: '+result.added+' nuove fotografie · '+result.alreadyPresent+' già presenti. Genere e specie non sono ancora determinati.');
  $('result').replaceChildren();const link=document.createElement('a');link.href=result.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Apri la cartella fotografica su GitHub';$('result').append(link);$('result').hidden=false;
  $('consent').checked=false;
 }catch(error){fail(error);say('Caricamento non confermato. Le copie restano nella coda; puoi riprovare. Le immagini già registrate non saranno duplicate.');}
 finally{busy=false;active=null;forget();render();}
};
window.addEventListener('pagehide',()=>{active?.abort();forget();});
window.addEventListener('pageshow',()=>controls());
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
