/* global document, localStorage, window */
(() => {
 const PACKAGE="fungo-public-study-package-v1", FAVORITES="fungo-study-favorites-v1", RESUME="fungo-study-resume-v1";
 const el=id=>document.getElementById(id);
 const status=message=>{el("status").textContent=message;};
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||"null")??fallback;}catch{return fallback;}};
 const favorites=()=>{const ids=read(FAVORITES,[]);return Array.isArray(ids)?ids.filter(id=>typeof id==="string"):[];};
 let pack=read(PACKAGE,null);
 const validCard=card=>card&&typeof card==="object"&&["id","name","scientificName","rank","safety","edibility","status","basis","evidenceScope"].every(key=>typeof card[key]==="string")&&Array.isArray(card.characters)&&card.characters.every(x=>typeof x==="string")&&["differentiating","habitat","season"].every(key=>card[key]===null||typeof card[key]==="string")&&Array.isArray(card.sources)&&card.sources.every(source=>source&&typeof source.title==="string"&&Number.isInteger(source.page)&&typeof source.kind==="string")&&card.image===null;
 if(!pack||pack.schema!==1||typeof pack.version!=="string"||typeof pack.savedAt!=="string"||!Number.isFinite(Date.parse(pack.savedAt))||!Array.isArray(pack.cards)||pack.cards.length>1000||!pack.cards.every(validCard)||!Array.isArray(pack.cachedImages))pack=null;
 if(!pack){el("metadata").textContent="Nessun pacchetto valido sul dispositivo.";el("empty").hidden=false;return;}
 el("metadata").textContent=pack.cards.length+" schede · "+pack.version+" · salvato "+new Date(pack.savedAt).toLocaleString("it-IT");
 el("controls").hidden=false;
 let cards=[],current=null,resumeId=null;
 try{resumeId=localStorage.getItem(RESUME);}catch{status("Il browser impedisce il salvataggio locale.");}
 const add=(tag,text,parent=el("card"))=>{const node=document.createElement(tag);node.textContent=text??"";parent.append(node);return node;};
 function show(id,focus=false){
  current=cards.find(card=>card.id===id)||cards[0]||null;
  el("card").replaceChildren();el("card").hidden=!current;el("navigation").hidden=!current;
  if(!current)return;
  el("selection").value=current.id;add("h2",current.name);add("p",current.scientificName);
  add("p","Unità di studio · rango: "+current.rank);
  const button=add("button",favorites().includes(current.id)?"Rimuovi dai preferiti":"Salva nei preferiti");button.type="button";
  button.addEventListener("click",()=>{try{const ids=favorites();localStorage.setItem(FAVORITES,JSON.stringify(ids.includes(current.id)?ids.filter(id=>id!==current.id):[...ids,current.id]));filter(current.id);}catch{status("Impossibile salvare i preferiti su questo dispositivo.");}});
  add("h3","Sicurezza");add("p",current.edibility==="non-valutato"?"Commestibilità non valutata":"Categoria riportata nel pacchetto: "+current.edibility);
  add("p",current.safety).className="safety";
  add("p","Immagine non disponibile nel pacchetto: documentazione fotografica da completare.");
  add("h3","Caratteri di studio");const list=add("ol","");
  current.characters.forEach(character=>add("li",character,list));
  if(current.differentiating)add("p","Confronto: "+current.differentiating);
  if(current.habitat)add("p","Habitat: "+current.habitat);
  if(current.season)add("p","Stagione: "+current.season);
  add("p",current.evidenceScope);add("h3","Fonti");
  current.sources.forEach(source=>add("p",source.title+" · pagina "+source.page+" · "+source.kind));
  const index=cards.findIndex(card=>card.id===current.id);el("position").textContent=(index+1)+" di "+cards.length;
  el("previous").disabled=index===0;el("next").disabled=index===cards.length-1;
  try{localStorage.setItem(RESUME,current.id);}catch{status("Impossibile salvare la ripresa.");}
  if(focus){el("card").focus();el("card").scrollIntoView({block:"start"});}
 }
 function filter(preferred){
  const query=el("query").value.trim().toLocaleLowerCase("it");
  const ids=favorites();
  cards=pack.cards.filter(card=>(!el("favorites").checked||ids.includes(card.id))&&[card.name,card.scientificName].some(name=>name.toLocaleLowerCase("it").includes(query)));
  el("selection").replaceChildren();
  cards.forEach(card=>{const option=document.createElement("option");option.value=card.id;option.textContent=card.name+" · "+card.scientificName;el("selection").append(option);});
  status(cards.length?"Schede disponibili: "+cards.length:"Nessuna scheda corrisponde ai filtri.");
  show(preferred);
 }
 el("query").addEventListener("input",()=>filter(current?.id));
 el("favorites").addEventListener("change",()=>filter(current?.id));
 el("selection").addEventListener("change",()=>show(el("selection").value,true));
 for(const [id,delta] of [["previous",-1],["next",1]])el(id).addEventListener("click",()=>{const index=cards.findIndex(card=>card.id===current?.id);const next=cards[index+delta];if(next)show(next.id,true);});
 el("resume").disabled=!pack.cards.some(card=>card.id===resumeId);
 el("resume").addEventListener("click",()=>{el("query").value="";el("favorites").checked=false;filter(resumeId);});
 window.addEventListener("storage",event=>{if(event.key===PACKAGE)status("Il pacchetto è cambiato: ricarica questa pagina.");if(event.key===FAVORITES)filter(current?.id);});
 filter(resumeId);
})();