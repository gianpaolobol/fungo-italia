import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Pressable,StyleSheet,Text,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'expo-status-bar';
import Studio,{StudyTaxon} from './components/Studio';
import Areas,{Area} from './components/Areas';
import Drafts from './components/Drafts';
import Community from './components/Community';
import catalog from './src/data/catalog.json';
import areas from './src/data/areas.json';
type State={version:1;favoriteIds:string[];resumeId:string|null};
const key='fungo-italia:study:v1';
export default function App(){
 const [tab,setTab]=useState('Studio'),[state,setState]=useState<State>({version:1,favoriteIds:[],resumeId:null}),[ready,setReady]=useState(false),[error,setError]=useState('');
 const queue=useRef<Promise<void>>(Promise.resolve());
 useEffect(()=>{let active=true;AsyncStorage.getItem(key).then(raw=>{if(!active)return;if(raw){const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.favoriteIds)||!value.favoriteIds.every((id:unknown)=>typeof id==='string')||(value.resumeId!==null&&typeof value.resumeId!=='string'))throw Error('Formato');setState(value);}setReady(true);}).catch(()=>{if(active){setError('Preferiti non leggibili. La consultazione resta disponibile; i dati memorizzati non verranno sovrascritti.');setReady(true);}});return()=>{active=false;};},[]);
 function update(patch:Partial<State>){setState(previous=>{const next={...previous,...patch};if(!error){const payload=JSON.stringify(next);queue.current=queue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(key,payload)).catch(()=>setError('Salvataggio dei preferiti non riuscito. I dati di questa sessione restano visibili.'));}return next;});}
 return <SafeAreaProvider><SafeAreaView style={s.page}><StatusBar style="dark"/><View style={s.brand}><Text style={s.title}>Fungo Italia</Text><Text style={s.subtitle}>Studio · territorio · osservazioni</Text></View>{!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}<View style={s.body}>{!ready?<ActivityIndicator accessibilityLabel="Caricamento"/>:tab==='Studio'?<Studio taxa={catalog as unknown as StudyTaxon[]} favoriteIds={state.favoriteIds} onFavoriteIdsChange={favoriteIds=>update({favoriteIds})} resumeId={state.resumeId} onResumeChange={resumeId=>update({resumeId})} catalogVersion="baseline verificata 2 ottobre 2026"/>:tab==='Aree'?<Areas areas={areas as unknown as Area[]}/>:tab==='Note'?<Drafts/>:<Community/>}</View><View accessibilityRole="tablist" style={s.tabs}>{['Studio','Aree','Note','Contributi'].map(name=><Pressable key={name} accessibilityRole="tab" accessibilityState={{selected:tab===name}} onPress={()=>setTab(name)} style={[s.tab,tab===name&&s.active]}><Text style={tab===name?s.selected:s.label}>{name}</Text></Pressable>)}</View></SafeAreaView></SafeAreaProvider>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#f4f7f2'},brand:{padding:12,borderBottomWidth:1,borderBottomColor:'#d5dfd3'},title:{fontSize:23,fontWeight:'800',color:'#174f2b'},subtitle:{fontSize:13,color:'#506757'},body:{flex:1},tabs:{flexDirection:'row',padding:8,gap:6,borderTopWidth:1,borderTopColor:'#d5dfd3'},tab:{flex:1,minHeight:52,alignItems:'center',justifyContent:'center',borderRadius:12},active:{backgroundColor:'#174f2b'},selected:{color:'white',fontWeight:'700'},label:{color:'#174f2b',fontWeight:'700'},error:{padding:10,color:'#842d26'}});
