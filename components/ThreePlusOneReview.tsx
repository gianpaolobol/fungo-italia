import React,{useEffect,useRef,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {visualReviewStore} from '../src/reviewStorage';
import {VisualReviewItem,isThreePlusOneComplete,decodeVisualReviewQueue,retryPendingVisualReviews} from '../src/visualReviewQueue';
import {suggestionsFromAtlas} from '../src/threePlusOneSuggestions';
import catalog from '../src/data/catalog.json';
import groups from '../src/data/groups.json';
import {StudyTaxon} from './Studio';
import ObservationPhotos from './ObservationPhotos';
const taxa=[...catalog,...groups] as unknown as StudyTaxon[];
const clean=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').replace(/[^a-z0-9]+/g,' ').trim();
const testable=(t:StudyTaxon)=>t.kind!=='teaching-group';
function findTaxon(value:string){const q=clean(value);if(q.length<2)return null;return taxa.find(t=>testable(t)&&[t.scientificName,...(t.commonNames||[]),...(t.aliases||[]),...(t.currentAcceptedNames||[])].some(name=>clean(name)===q))??null;}
function validate(item:VisualReviewItem){
 if(item.assetIds.length!==1)return {ok:false,text:'Usa uno scatto per volta: se vedi specie diverse, rimuovi gli scatti non pertinenti prima di verificare.'};
 const name=(item.taxonCandidate||'').trim();
 const taxon=findTaxon(name);
 if(!taxon)return {ok:false,text:'Nome non riconosciuto. Seleziona una specie dai suggerimenti mentre scrivi.'};
 if(!isThreePlusOneComplete(item))return {ok:false,text:'Test non superato: completa tre caratteri osservabili e il +1 prima di proseguire.'};
 return {ok:true,text:'Test superato: nome riconosciuto e schema 3+1 completo. Puoi passare alla specie successiva.'};
}

export default function ThreePlusOneReview({active=true}:{active?:boolean}){
 const [queue,setQueue]=useState<VisualReviewItem[]>([]),[index,setIndex]=useState(0),[message,setMessage]=useState(''),[unsaved,setUnsaved]=useState(0),[result,setResult]=useState<{ok:boolean;text:string}|null>(null);
 const canWrite=useRef(false),pending=useRef(new Map<string,VisualReviewItem>());
 useEffect(()=>{if(!active)return;let alive=true;
  if(pending.current.size){setMessage('Bozze non salvate conservate in memoria. Riprova il salvataggio prima di chiudere l’app.');return;}
  canWrite.current=false;void visualReviewStore.read().then(value=>{if(!alive)return;setQueue(value.queue);setIndex(i=>Math.max(0,Math.min(i,value.queue.length-1)));setMessage('');setResult(null);canWrite.current=true;}).catch(()=>{if(alive)setMessage('Coda non leggibile: i dati esistenti non verranno sovrascritti.');});
  return()=>{alive=false;};
 },[active]);
 async function persist(snapshot:VisualReviewItem){
  try{await visualReviewStore.save(snapshot);if(pending.current.get(snapshot.observationId)===snapshot)pending.current.delete(snapshot.observationId);setUnsaved(pending.current.size);if(!pending.current.size)setMessage('');}
  catch{setMessage('Salvataggio non riuscito. Le bozze restano in memoria: riprova prima di chiudere l’app.');}
 }
 async function retry(){await retryPendingVisualReviews(pending.current,persist);}
 const item=queue[index];
 const suggestions=item?suggestionsFromAtlas(taxa,item.taxonCandidate||'',10).filter(x=>findTaxon(x.scientificName)):[];
 function patch(p:Partial<VisualReviewItem>){if(!canWrite.current||!item)return;const snapshot={...item,...p,confidence:'unknown' as const,status:p.status??'reviewing' as const};const next=queue.map((x,i)=>i===index?snapshot:x);setQueue(next);setResult(null);pending.current.set(snapshot.observationId,snapshot);setUnsaved(pending.current.size);void persist(snapshot);}
 function check(){if(!item)return;const outcome=validate(item);setResult(outcome);patch({status:outcome.ok?'done':'needs-more-evidence',confidence:outcome.ok?'medium':'low'});}
 function go(next:number){setIndex(Math.max(0,Math.min(queue.length-1,next)));setResult(null);}
 if(!item)return <View style={s.page}><Text style={s.title}>Test 3+1</Text><Text style={s.body}>{message||'Nessuna osservazione in coda. Preparala dalla sezione Foto.'}</Text></View>;
 const done=item.status==='done';
 const blockNext=!done;
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>Test 3+1</Text><Text style={s.body}>Inserisci il nome della specie, compila tre caratteri osservabili e il +1. Il passaggio successivo si sblocca solo dopo verifica.</Text>{!!message&&<Text accessibilityRole="alert" style={s.body}>{message}</Text>}{unsaved>0&&<Pressable accessibilityRole="button" style={s.nav} onPress={()=>void retry()}><Text>Riprova salvataggio delle bozze</Text></Pressable>}<Text style={s.body}>Osservazione {index+1} di {queue.length} · {item.assetIds.length} scatti selezionati</Text><ObservationPhotos item={item} onRemove={id=>patch({assetIds:item.assetIds.filter(x=>x!==id)})}/>
  {item.assetIds.length!==1&&<Text accessibilityRole="alert" style={s.warning}>Questo test deve riferirsi a una sola specie: conserva uno scatto e rimuovi gli altri.</Text>}
  <Text style={s.label}>Nome specie o taxon</Text><TextInput accessibilityLabel="Nome specie o taxon" value={item.taxonCandidate||''} onChangeText={taxonCandidate=>patch({taxonCandidate})} style={s.input} placeholder="inizia a scrivere il nome" autoCapitalize="none"/>{suggestions.map(x=><Pressable key={x.taxonId} style={s.suggestion} onPress={()=>patch({taxonCandidate:x.scientificName,notes:[...item.notes.filter(Boolean),'Nome selezionato dai suggerimenti: '+x.taxonId]})}><Text style={s.suggestionTitle}>{x.scientificName}</Text><Text style={s.body}>Usa questo nome nel test</Text></Pressable>)}
  {item.characters.map((v,i)=><View key={i}><Text style={s.label}>Carattere diagnostico {i+1}</Text><TextInput accessibilityLabel={'Carattere diagnostico '+(i+1)} value={v||''} onChangeText={value=>{const chars=[...item.characters] as [string|null,string|null,string|null];chars[i]=value;patch({characters:chars});}} style={s.input}/></View>)}
  <Text style={s.label}>+1 · carattere di conferma</Text><TextInput accessibilityLabel="Carattere di conferma" value={item.confirmation||''} onChangeText={confirmation=>patch({confirmation})} style={s.input}/>
  <Pressable style={s.button} onPress={check}><Text style={s.buttonText}>Verifica test</Text></Pressable>
  {result&&<View style={[s.card,result.ok?s.pass:s.fail]}><Text style={s.status}>{result.ok?'Superato':'Da ripassare'}</Text><Text style={s.body}>{result.text}</Text></View>}
  <View style={s.card}><Text style={s.status}>{done?'Test superato':'Test non superato'}</Text><Text style={s.body}>Il superamento non certifica commestibilità né determinazione scientifica: serve sempre revisione competente.</Text></View>
  <View style={s.row}><Pressable style={s.nav} disabled={index===0} onPress={()=>go(index-1)}><Text>← Precedente</Text></Pressable><Pressable style={[s.nav,blockNext&&s.disabled]} disabled={blockNext||index>=queue.length-1} onPress={()=>go(index+1)}><Text>Successiva →</Text></Pressable></View>
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:16,gap:10},title:{fontSize:22,fontWeight:'800',color:'#174f2b'},body:{fontSize:14,lineHeight:20,color:'#405649'},label:{fontWeight:'800',color:'#174f2b',marginTop:6},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ccd8cb',borderRadius:10,padding:12,minHeight:46},card:{padding:12,borderRadius:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#d5dfd3'},pass:{borderColor:'#174f2b',backgroundColor:'#eef7ee'},fail:{borderColor:'#9a3a2f',backgroundColor:'#fff0eb'},warning:{fontSize:14,lineHeight:20,color:'#8a2f26',fontWeight:'700'},status:{fontWeight:'800',color:'#174f2b'},button:{padding:14,borderRadius:12,backgroundColor:'#174f2b',alignItems:'center'},disabled:{opacity:.35},buttonText:{color:'#fff',fontWeight:'800'},row:{flexDirection:'row',gap:8},nav:{flex:1,padding:13,borderRadius:10,borderWidth:1,borderColor:'#ccd8cb',alignItems:'center'},suggestion:{padding:10,borderRadius:10,backgroundColor:'#eef4ed',borderWidth:1,borderColor:'#ccd8cb'},suggestionTitle:{fontWeight:'800',color:'#174f2b'}});