import React,{useEffect,useRef,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {visualReviewStore} from '../src/reviewStorage';
import {VisualReviewItem,isThreePlusOneComplete,decodeVisualReviewQueue} from '../src/visualReviewQueue';
import {suggestionsFromAtlas} from '../src/threePlusOneSuggestions';
import catalog from '../src/data/catalog.json';
import groups from '../src/data/groups.json';
import {StudyTaxon} from './Studio';
import ObservationPhotos from './ObservationPhotos';
const taxa=[...catalog,...groups] as unknown as StudyTaxon[];

export default function ThreePlusOneReview({active=true}:{active?:boolean}){
 const [queue,setQueue]=useState<VisualReviewItem[]>([]),[index,setIndex]=useState(0),[message,setMessage]=useState(''),[unsaved,setUnsaved]=useState(0);
 const canWrite=useRef(false),pending=useRef(new Map<string,VisualReviewItem>());
 useEffect(()=>{if(!active)return;let alive=true;
  if(pending.current.size){setMessage('Bozze non salvate conservate in memoria. Riprova il salvataggio prima di chiudere l’app.');return;}
  canWrite.current=false;void visualReviewStore.read().then(value=>{if(!alive)return;setQueue(value.queue);setIndex(i=>Math.max(0,Math.min(i,value.queue.length-1)));setMessage('');canWrite.current=true;}).catch(()=>{if(alive)setMessage('Coda non leggibile: i dati esistenti non verranno sovrascritti.');});
  return()=>{alive=false;};
 },[active]);
 async function persist(snapshot:VisualReviewItem){
  try{await visualReviewStore.save(snapshot);if(pending.current.get(snapshot.observationId)===snapshot)pending.current.delete(snapshot.observationId);setUnsaved(pending.current.size);if(!pending.current.size)setMessage('');}
  catch{setMessage('Salvataggio non riuscito. Le bozze restano in memoria: riprova prima di chiudere l’app.');}
 }
 async function retry(){for(const snapshot of [...pending.current.values()])await persist(snapshot);}
 const item=queue[index];
 const suggestions=item?suggestionsFromAtlas(taxa,item.taxonCandidate||''):[];
 function patch(p:Partial<VisualReviewItem>){if(!canWrite.current||!item)return;const snapshot={...item,...p,confidence:'unknown' as const};const next=queue.map((x,i)=>i===index?snapshot:x);setQueue(next);pending.current.set(snapshot.observationId,snapshot);setUnsaved(pending.current.size);void persist(snapshot);}
 if(!item)return <View style={s.page}><Text style={s.title}>Bozza 3+1</Text><Text style={s.body}>{message||'Nessuna osservazione in coda. Preparala dalla sezione Foto.'}</Text></View>;
 const done=isThreePlusOneComplete(item);
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>Bozza 3+1</Text><Text style={s.body}>Compilazione personale senza validazione scientifica. I caratteri copiati dall’Atlante devono essere osservati sull’esemplare. Non autorizza il consumo.</Text>{!!message&&<Text accessibilityRole="alert" style={s.body}>{message}</Text>}{unsaved>0&&<Pressable accessibilityRole="button" style={s.nav} onPress={()=>void retry()}><Text>Riprova salvataggio delle bozze</Text></Pressable>}<Text style={s.body}>Osservazione {index+1} di {queue.length} · {item.assetIds.length} scatti selezionati</Text><ObservationPhotos item={item} onRemove={id=>patch({assetIds:item.assetIds.filter(x=>x!==id)})}/>
  <Text style={s.label}>Taxon candidato</Text><TextInput value={item.taxonCandidate||''} onChangeText={taxonCandidate=>patch({taxonCandidate})} style={s.input} placeholder="es. Boletus edulis"/>{suggestions.map(x=><Pressable key={x.taxonId} style={s.suggestion} onPress={()=>patch({taxonCandidate:x.scientificName,characters:x.characters,confirmation:x.confirmation,notes:[...item.notes,'3+1 proposto dalla scheda canonica '+x.taxonId]})}><Text style={s.suggestionTitle}>{x.scientificName}</Text><Text style={s.body}>Copia il modello didattico da verificare</Text></Pressable>)}
  {item.characters.map((v,i)=><View key={i}><Text style={s.label}>Carattere diagnostico {i+1}</Text><TextInput value={v||''} onChangeText={value=>{const chars=[...item.characters] as [string|null,string|null,string|null];chars[i]=value;patch({characters:chars});}} style={s.input}/></View>)}
  <Text style={s.label}>+1 · carattere di conferma</Text><TextInput value={item.confirmation||''} onChangeText={confirmation=>patch({confirmation})} style={s.input}/>
  <View style={s.card}><Text style={s.status}>{done?'3+1 completo':'Da completare'}</Text><Text style={s.body}>La completezza dei campi non attesta il riconoscimento, una revisione scientifica o l’idoneità al consumo.</Text></View>
  <Pressable style={[s.button,!done&&s.disabled]} disabled={!done} onPress={()=>patch({status:'done',confidence:'unknown'})}><Text style={s.buttonText}>Salva bozza compilata</Text></Pressable>
  <View style={s.row}><Pressable style={s.nav} disabled={index===0} onPress={()=>setIndex(i=>Math.max(0,i-1))}><Text>← Precedente</Text></Pressable><Pressable style={s.nav} disabled={index>=queue.length-1} onPress={()=>setIndex(i=>Math.min(queue.length-1,i+1))}><Text>Successiva →</Text></Pressable></View>
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:16,gap:10},title:{fontSize:22,fontWeight:'800',color:'#174f2b'},body:{fontSize:14,lineHeight:20,color:'#405649'},label:{fontWeight:'800',color:'#174f2b',marginTop:6},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ccd8cb',borderRadius:10,padding:12,minHeight:46},card:{padding:12,borderRadius:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#d5dfd3'},status:{fontWeight:'800',color:'#174f2b'},button:{padding:14,borderRadius:12,backgroundColor:'#174f2b',alignItems:'center'},disabled:{opacity:.35},buttonText:{color:'#fff',fontWeight:'800'},row:{flexDirection:'row',gap:8},nav:{flex:1,padding:13,borderRadius:10,borderWidth:1,borderColor:'#ccd8cb',alignItems:'center'},suggestion:{padding:10,borderRadius:10,backgroundColor:'#eef4ed',borderWidth:1,borderColor:'#ccd8cb'},suggestionTitle:{fontWeight:'800',color:'#174f2b'}});
