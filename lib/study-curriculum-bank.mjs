const fields=[['characters','Caratteri della scheda','characters'],['habitat','Habitat riportato','habitat'],['sporePrint','Sporata riportata','studyProfile.sporePrint.label'],['odor','Odore riportato','studyProfile.odor']];
const value=(taxon,field)=>field==='characters'?taxon.characters?.join('\n'):field==='habitat'?taxon.habitat?.join('\n'):field==='sporePrint'?taxon.studyProfile?.sporePrint?.label:taxon.studyProfile?.odor;
const hash=text=>{let h=2166136261;for(const ch of text)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
export function buildCurriculumBank(minimum,extended,photo){
 const taxa=[...minimum,...extended],makePool=taxa=>new Map(fields.map(([field])=>[field,[...new Set(taxa.map(t=>value(t,field)).filter(v=>typeof v==='string'&&v.trim()))].map(label=>({label,id:String(hash(field+label))}))])),minimumPool=makePool(minimum),extendedPool=makePool(taxa),photographic=new Set(photo.map(t=>t.id)),minimumIds=new Set(minimum.map(t=>t.id));
 return taxa.filter(t=>!photographic.has(t.id)).map(t=>{
  const pool=minimumIds.has(t.id)?minimumPool:extendedPool;
  const questions=fields.flatMap(([field,title,canonicalField])=>{
   const answer=value(t,field);if(typeof answer!=='string'||!answer.trim())return [];
   const alternatives=pool.get(field).filter(o=>o.label!==answer).map(o=>({...o,order:hash(t.id+field+o.id)})).sort((a,b)=>a.order-b.order).slice(0,3);
   if(alternatives.length<2)return [];
   const options=[{id:String(hash(field+answer)),label:answer},...alternatives.map(({id,label})=>({id,label}))].sort((a,b)=>hash(t.id+a.id)-hash(t.id+b.id));
   return [{id:field,title:title+' — secondo la scheda «'+t.scientificName+'»',multiple:false,options,correct:options.filter(o=>o.label===answer).map(o=>o.id),provenance:{taxonId:t.id,canonicalField,contentHash:String(hash(answer)),sourceIds:[...new Set((t.sources||[]).filter(s=>s.fields?.includes(field)).map(s=>s.sourceId))],reviewScope:'canonical-study-material'}}];
  });
  if(!questions.length)throw Error('Nessuna domanda documentabile per '+t.id);
  return {id:t.id,name:t.scientificName,acceptedNames:[t.scientificName],category:'',detailKind:'curriculum',questionKind:'profile',scope:minimumIds.has(t.id)?'minimum':'extended',preparation:[],syndrome:null,photos:[],questions};
 });
}
