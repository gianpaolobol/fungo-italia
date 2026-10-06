import React,{useEffect,useRef,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {VisualReviewItem,isThreePlusOneComplete,decodeVisualReviewQueue} from '../src/visualReviewQueue';
import {suggestionsFromAtlas} from '../src/threePlusOneSuggestions';
import catalog from '../src/data/catalog.json';
import groups from '../src/data/groups.json';
import {StudyTaxon} from './Studio';
import ObservationPhotos from './ObservationPhotos';
const taxa=[...catalog,...groups] as unknown as StudyTaxon[];

const reviewKey='fungo-italia:private-3plus1-queue:v1';
export default function ThreePlusOneReview({active=true}:{active?:boolean}){
 const [queue,setQueue]=useState<VisualReviewItem[]>([]),[index,setIndex]=useState(0),[message,setMessage]=useState('');
 const canWrite=useRef(false),saveQueue=useRef<Promise<void>>(Promise.resolve());
 useEffect(()=>{if(!active)return;let alive=true;canWrite.current=false;void saveQueue.current.catch(()=>{}).then(()=>AsyncStorage.getItem(reviewKey)).then(raw=>{if(!alive)return;const value=decodeVisualReviewQueue(raw);setQueue(value.queue);setIndex(i=>Math.max(0,Math.min(i,value.queue.length-1)));setMessage('');canWrite.current=true;}).catch(()=>{if(alive){setMessage('Coda non leggibile: i dati esistenti non verranno sovrascritti.');setQueue([]);}});return()=>{alive=false;};},[active]);
 const item=queue[index];
 const suggestions=item?suggestionsFromAtlas(taxa,item.taxonCandidate||''):[];
 function patch(p:Partial<VisualReviewItem>){if(!canWrite.current)return;const next=queue.map((x,i)=>i===index?{...x,...p,confidence:'unknown' as const}:x);setQueue(next);const payload=JSON.stringify({version:1,queue:next});saveQueue.current=saveQueue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(reviewKey,payload)).catch(()=>setMessage('Salvataggio non riuscito. La bozza resta in memoria: riprova prima di uscire.'));}
 if(!item)return <View style={s.page}><Text style={s.title}>Bozza 3+1</Text><Text style={s.body}>{message||'Nessuna osservazione in coda. Preparala dalla sezione Foto.'}</Text></View>;
 const done=isThreePlusOneComplete(item);
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>Bozza 3+1</Text><Text style={s.body}>Compilazione personale senza validazione scientifica. I caratteri copiati dall’Atlante devono essere osservati sull’esemplare. Non autorizza il consumo.</Text>{!!message&&<Text accessibilityRole="alert" style={s.body}>{message}</Text>}<Text style={s.body}>Osservazione {index+1} di {queue.length} · {item.assetIds.length} scatti selezionati</Text><ObservationPhotos item={item}/>
  <Text style={s.label}>Taxon candidato</Text><TextInput value={item.taxonCandidate||''} onChangeText={taxonCandidate=>patch({taxonCandidate})} style={s.input} placeholder="es. Boletus edulis"/>{suggestions.map(x=><Pressable key={x.taxonId} style={s.suggestion} onPress={()=>patch({taxonCandidate:x.scientificName,characters:x.characters,confirmation:x.confirmation,notes:[...item.notes,'3+1 proposto dalla scheda canonica '+x.taxonId]})}><Text style={s.suggestionTitle}>{x.scientificName}</Text><Text style={s.body}>Copia il modello didattico da verificare</Text></Pressable>)}
  {item.characters.map((v,i)=><View key={i}><Text style={s.label}>Carattere diagnostico {i+1}</Text><TextInput value={v||''} onChangeText={value=>{const chars=[...item.characters] as [string|null,string|null,string|null];chars[i]=value;patch({characters:chars});}} style={s.input}/></View>)}
  <Text style={s.label}>+1 · carattere di conferma</Text><TextInput value={item.confirmation||''} onChangeText={confirmation=>patch({confirmation})} style={s.input}/>
  <View style={s.card}><Text style={s.status}>{done?'3+1 completo':'Da completare'}</Text><Text style={s.body}>La completezza dei campi non attesta il riconoscimento, una revisione scientifica o l’idoneità al consumo.</Text></View>
  <Pressable style={[s.button,!done&&s.disabled]} disabled={!done} onPress={()=>patch({status:'done',confidence:'unknown'})}><Text style={s.buttonText}>Salva bozza compilata</Text></Pressable>
  <View style={s.row}><Pressable style={s.nav} disabled={index===0} onPress={()=>setIndex(i=>Math.max(0,i-1))}><Text>← Precedente</Text></Pressable><Pressable style={s.nav} disabled={index>=queue.length-1} onPress={()=>setIndex(i=>Math.min(queue.length-1,i+1))}><Text>Successiva →</Text></Pressable></View>
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:16,gap:10},title:{fontSize:22,fontWeight:'800',color:'#174f2b'},body:{fontSize:14,lineHeight:20,color:'#405649'},label:{fontWeight:'800',color:'#174f2b',marginTop:6},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ccd8cb',borderRadius:10,padding:12,minHeight:46},card:{padding:12,borderRadius:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#d5dfd3'},status:{fontWeight:'800',color:'#174f2b'},button:{padding:14,borderRadius:12,backgroundColor:'#174f2b',alignItems:'center'},disabled:{opacity:.35},buttonText:{color:'#fff',fontWeight:'800'},row:{flexDirection:'row',gap:8},nav:{flex:1,padding:13,borderRadius:10,borderWidth:1,borderColor:'#ccd8cb',alignItems:'center'},suggestion:{padding:10,borderRadius:10,backgroundColor:'#eef4ed',borderWidth:1,borderColor:'#ccd8cb'},suggestionTitle:{fontWeight:'800',color:'#174f2b'}});
