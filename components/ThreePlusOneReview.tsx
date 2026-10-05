import React,{useEffect,useState} from 'react';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {VisualReviewItem,isThreePlusOneComplete} from '../src/visualReviewQueue';
import {suggestionsFromAtlas} from '../src/threePlusOneSuggestions';
import catalog from '../src/data/catalog.json';
import groups from '../src/data/groups.json';
import {StudyTaxon} from './Studio';
const taxa=[...catalog,...groups] as unknown as StudyTaxon[];

const reviewKey='fungo-italia:private-3plus1-queue:v1';
export default function ThreePlusOneReview(){
 const [queue,setQueue]=useState<VisualReviewItem[]>([]),[index,setIndex]=useState(0),[message,setMessage]=useState('');
 useEffect(()=>{AsyncStorage.getItem(reviewKey).then(raw=>{if(raw)setQueue((JSON.parse(raw) as {queue:VisualReviewItem[]}).queue||[]);}).catch(()=>setMessage('Coda non leggibile.'));},[]);
 const item=queue[index];
 const suggestions=item?suggestionsFromAtlas(taxa,item.taxonCandidate||''):[];
 async function patch(p:Partial<VisualReviewItem>){const next=queue.map((x,i)=>i===index?{...x,...p}:x);setQueue(next);await AsyncStorage.setItem(reviewKey,JSON.stringify({version:1,queue:next}));}
 if(!item)return <View style={s.page}><Text style={s.title}>Revisione 3+1</Text><Text style={s.body}>{message||'Nessuna osservazione in coda. Preparala dalla sezione Foto.'}</Text></View>;
 const done=isThreePlusOneComplete(item);
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>Revisione 3+1</Text><Text style={s.body}>Osservazione {index+1} di {queue.length} · {item.assetIds.length} scatti selezionati</Text>
  <Text style={s.label}>Taxon candidato</Text><TextInput value={item.taxonCandidate||''} onChangeText={taxonCandidate=>patch({taxonCandidate})} style={s.input} placeholder="es. Boletus edulis"/>{suggestions.map(x=><Pressable key={x.taxonId} style={s.suggestion} onPress={()=>patch({taxonCandidate:x.scientificName,characters:x.characters,confirmation:x.confirmation,notes:[...item.notes,'3+1 proposto dalla scheda canonica '+x.taxonId]})}><Text style={s.suggestionTitle}>{x.scientificName}</Text><Text style={s.body}>Usa il 3+1 della scheda Atlante</Text></Pressable>)}
  {item.characters.map((v,i)=><View key={i}><Text style={s.label}>Carattere diagnostico {i+1}</Text><TextInput value={v||''} onChangeText={value=>{const chars=[...item.characters] as [string|null,string|null,string|null];chars[i]=value;patch({characters:chars});}} style={s.input}/></View>)}
  <Text style={s.label}>+1 · carattere di conferma</Text><TextInput value={item.confirmation||''} onChangeText={confirmation=>patch({confirmation})} style={s.input}/>
  <View style={s.card}><Text style={s.status}>{done?'3+1 completo':'Da completare'}</Text><Text style={s.body}>La scheda non è pubblicabile finché taxon, tre caratteri e conferma non sono tutti presenti.</Text></View>
  <Pressable style={[s.button,!done&&s.disabled]} disabled={!done} onPress={()=>patch({status:'done',confidence:'medium'})}><Text style={s.buttonText}>Approva revisione</Text></Pressable>
  <View style={s.row}><Pressable style={s.nav} disabled={index===0} onPress={()=>setIndex(i=>Math.max(0,i-1))}><Text>← Precedente</Text></Pressable><Pressable style={s.nav} disabled={index>=queue.length-1} onPress={()=>setIndex(i=>Math.min(queue.length-1,i+1))}><Text>Successiva →</Text></Pressable></View>
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:16,gap:10},title:{fontSize:22,fontWeight:'800',color:'#174f2b'},body:{fontSize:14,lineHeight:20,color:'#405649'},label:{fontWeight:'800',color:'#174f2b',marginTop:6},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ccd8cb',borderRadius:10,padding:12,minHeight:46},card:{padding:12,borderRadius:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#d5dfd3'},status:{fontWeight:'800',color:'#174f2b'},button:{padding:14,borderRadius:12,backgroundColor:'#174f2b',alignItems:'center'},disabled:{opacity:.35},buttonText:{color:'#fff',fontWeight:'800'},row:{flexDirection:'row',gap:8},nav:{flex:1,padding:13,borderRadius:10,borderWidth:1,borderColor:'#ccd8cb',alignItems:'center'},suggestion:{padding:10,borderRadius:10,backgroundColor:'#eef4ed',borderWidth:1,borderColor:'#ccd8cb'},suggestionTitle:{fontWeight:'800',color:'#174f2b'}});
