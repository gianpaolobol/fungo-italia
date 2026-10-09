// Deterministic grading is deliberately limited to explicit scientific names and food categories.
export const foodLabels={free:'libera',conditional:'condizionata',discouraged:'sconsigliato','no-food-value':'privo di valore',inedible:'non commestibile',toxic:'tossico',deadly:'tossico mortale'};
export const normalizeName=value=>String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const documentedCompoundSynonyms={
 'Collybia phyllophila':['Clitocybe cerussata','Clitocybe phyllophila'],
 'Cortinarius rubellus':['Cortinarius orellanoides','Cortinarius speciosissimus'],
 'Cortinarius caperatus':['Rozites caperatus'],
 'Lepiota subincarnata':['Lepiota josserandii'],
 'Rubroboletus satanas':['Boletus satanas'],
 'Suillellus luridus':['Boletus luridus']
};
const binomial=value=>typeof value==='string'&&/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(value);
export function buildExamBank(taxa,profiles={records:[]}){
 const genera=new Set([...taxa.flatMap(t=>[t.scientificName,...(t.currentAcceptedNames||[])]).map(n=>n.split(' ')[0]),'Agaricus','Agrocybe','Amanita','Boletus','Clitocybe','Collybia','Cortinarius','Rozites','Lyophyllum','Albatrellus','Polyporus']);
 return taxa.flatMap(t=>{
  const food=t.studyProfile?.edibility;
  if(t.rank!=='species'||!binomial(t.scientificName)||!foodLabels[food?.category])return [];
  const names=[...new Set([t.scientificName,...(t.aliases||[]),...(t.currentAcceptedNames||[]),...((t.aliases||[]).some(a=>a.includes('('))?(documentedCompoundSynonyms[t.scientificName]||[]):[])].filter(n=>binomial(n)&&genera.has(n.split(' ')[0])&&!(t.commonNames||[]).includes(n)))];
  const photos=(t.referenceImages||[]).filter(p=>p.src?.startsWith('images/')&&names.some(n=>normalizeName(n)===normalizeName(p.subjectTaxon)));
  const foodEvidence=profiles.records?.find(r=>r.scientificName===t.scientificName)?.evidence?.some(e=>e.sourceId==='S2-guida-ragionata-commestibilita-2021'&&e.fields?.includes('edibility'));
  if(!photos.length||(!foodEvidence&&!t.sources?.some(s=>s.fields?.includes('edibility'))))return [];
  const detailKind=food.category==='conditional'?'preparation':['toxic','deadly'].includes(food.category)?'toxicology':null;
  if(detailKind==='preparation'&&!food.precautions?.length)return [];
  if(detailKind==='toxicology'&&(!food.syndrome?.label||!food.syndrome?.latency||!food.syndrome?.severity||!t.sources.some(s=>s.fields?.includes('syndrome'))))return [];
  return [{id:t.id,name:t.scientificName,acceptedNames:names,photos:photos.map(p=>({src:p.src,view:p.view,credit:p.credit||'',subjectTaxon:p.subjectTaxon,sourceUrl:p.sourceUrl,licenseUrl:p.licenseUrl})),category:food.category,detailKind,preparation:food.precautions||[],syndrome:food.syndrome||null,characters:t.characters||[],differentiatingCharacter:t.differentiatingCharacter||'',diagnosticNote:t.diagnosticNote||'',sources:t.sources.filter(s=>s.fields?.some(f=>['edibility','precautions','syndrome','characters'].includes(f)))}];
 });
}
function shuffle(values,rng){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(rng()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function selectCases(bank,count=15,rng=Math.random){
 if(new Set(bank.map(c=>c.id)).size!==bank.length||bank.length<count)throw Error('Servono almeno '+count+' casi distinti documentati.');
 const pool=shuffle(bank,rng),selected=[];
 if(count>=15)for(const [category,n] of [['conditional',3],['toxic',3],['deadly',2],['free',3]])selected.push(...pool.filter(c=>c.category===category).slice(0,n));
 selected.push(...pool.filter(c=>!selected.some(s=>s.id===c.id)).slice(0,count-selected.length));
 return shuffle(selected,rng);
}
export function gradeAnswer(c,answer={}){
 const category=answer.category===c.category;
 const edible=['free','conditional'].includes(answer.category);
 return {name:c.acceptedNames.some(n=>normalizeName(n)===normalizeName(answer.name)),category,detail:null,danger:edible&&(!['free','conditional'].includes(c.category)||(c.category==='conditional'&&answer.category==='free'))};
}
export function restoreSession(raw,bank){
 try{
  const s=JSON.parse(raw),ids=new Set(bank.map(c=>c.id));
  if(s?.version!==1||!['exam','training'].includes(s.mode)||!Array.isArray(s.ids)||s.ids.length!==15||new Set(s.ids).size!==15||!s.ids.every(id=>ids.has(id))||!Number.isInteger(s.index)||s.index<0||s.index>=15||typeof s.complete!=='boolean'||!Array.isArray(s.answers)||s.answers.length>15)return null;
  if(!s.answers.every(a=>a===null||(a&&typeof a.name==='string'&&a.name.length<=200&&typeof a.detail==='string'&&a.detail.length<=5000&&(typeof a.category==='string'&&(a.category===''||Object.hasOwn(foodLabels,a.category)))&&(a.revealed===undefined||typeof a.revealed==='boolean')&&[undefined,null,'correct','partial','wrong'].includes(a.selfRating))))return null;
  if(Array.from({length:s.index},(_,i)=>s.answers[i]).some(a=>!a||(s.mode==='training'&&a.revealed!==true)))return null;
  if(s.complete&&(!s.answers.length||s.answers.length!==15||s.answers.some(a=>!a)))return null;
  return s;
 }catch{return null;}
}
