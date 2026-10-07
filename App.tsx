import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Pressable,StyleSheet,Text,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'expo-status-bar';
import Studio,{StudyTaxon} from './components/Studio';
import Areas,{Area} from './components/Areas';
import Drafts from './components/Drafts';
import Community from './components/Community';
import PhotoLibrary from './components/PhotoLibrary';
import ThreePlusOneReview from './components/ThreePlusOneReview';
import catalog from './src/data/catalog.json';
import areas from './src/data/areas.json';
import groups from './src/data/groups.json';
const allTaxa=[...catalog,...groups] as unknown as StudyTaxon[];
type State={version:1;favoriteIds:string[];resumeId:string|null};
const key='fungo-italia:study:v1';
export default function App(){
 const [tab,setTab]=useState('Studio'),[state,setState]=useState<State>({version:1,favoriteIds:[],resumeId:null}),[ready,setReady]=useState(false),[error,setError]=useState('');
 const queue=useRef<Promise<void>>(Promise.resolve()),canSave=useRef(false);
 const allowed=new Set(allTaxa.map(t=>t.id));
 useEffect(()=>{let active=true;AsyncStorage.getItem(key).then(raw=>{if(!active)return;if(raw){const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.favoriteIds)||!value.favoriteIds.every((id:unknown)=>typeof id==='string')||(value.resumeId!==null&&typeof value.resumeId!=='string'))throw Error('Formato');setState({version:1,favoriteIds:[...new Set(value.favoriteIds as string[])].filter(id=>allowed.has(id)),resumeId:allowed.has(value.resumeId)?value.resumeId:null});}canSave.current=true;setReady(true);}).catch(()=>{if(active){setError('Preferiti non leggibili. La consultazione resta disponibile; i dati memorizzati non verranno sovrascritti.');setReady(true);}});return()=>{active=false;};},[]);
 useEffect(()=>{if(!ready||error||!canSave.current)return;const payload=JSON.stringify(state);queue.current=queue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(key,payload)).catch(()=>setError('Salvataggio dei preferiti non riuscito. Riprova per conservare le modifiche.'));},[state,ready,error]);
 function update(patch:Partial<State>){setState(previous=>({...previous,...patch}));}

 return <SafeAreaProvider><SafeAreaView style={s.page}><StatusBar style="dark"/><View style={s.brand}><Text style={s.title}>Fungo Italia</Text></View>{!!error&&<View><Text accessibilityRole="alert" style={s.error}>{error}</Text>{canSave.current&&<Pressable accessibilityRole="button" onPress={()=>setError('')} style={s.tab}><Text style={s.label}>Riprova salvataggio</Text></Pressable>}</View>}<View style={s.body}>{!ready?<ActivityIndicator accessibilityLabel="Caricamento"/>:<>
<View style={[s.body,tab!=='Studio'&&s.hidden]} accessibilityElementsHidden={tab!=='Studio'} importantForAccessibility={tab!=='Studio'?'no-hide-descendants':'auto'}><Studio taxa={allTaxa} favoriteIds={state.favoriteIds} onFavoriteIdsChange={favoriteIds=>update({favoriteIds})} resumeId={state.resumeId} onResumeChange={resumeId=>update({resumeId})}/></View>
<View style={[s.body,tab!=='Aree'&&s.hidden]} accessibilityElementsHidden={tab!=='Aree'} importantForAccessibility={tab!=='Aree'?'no-hide-descendants':'auto'}><Areas areas={areas as unknown as Area[]}/></View>
<View style={[s.body,tab!=='Note'&&s.hidden]} accessibilityElementsHidden={tab!=='Note'} importantForAccessibility={tab!=='Note'?'no-hide-descendants':'auto'}><Drafts/></View>
<View style={[s.body,tab!=='Contributi'&&s.hidden]} accessibilityElementsHidden={tab!=='Contributi'} importantForAccessibility={tab!=='Contributi'?'no-hide-descendants':'auto'}><Community/></View>
<View style={[s.body,tab!=='Foto'&&s.hidden]} accessibilityElementsHidden={tab!=='Foto'} importantForAccessibility={tab!=='Foto'?'no-hide-descendants':'auto'}><PhotoLibrary/></View>
<View style={[s.body,tab!=='3+1'&&s.hidden]} accessibilityElementsHidden={tab!=='3+1'} importantForAccessibility={tab!=='3+1'?'no-hide-descendants':'auto'}><ThreePlusOneReview active={tab==='3+1'}/></View>
</>}</View><View accessibilityRole="tablist" style={s.tabs}>{['Studio','Aree','Note','Contributi','Foto','3+1'].map(name=><Pressable key={name} accessibilityRole="tab" accessibilityState={{selected:tab===name}} onPress={()=>setTab(name)} style={[s.tab,tab===name&&s.active]}><Text style={tab===name?s.selected:s.label}>{name}</Text></Pressable>)}</View></SafeAreaView></SafeAreaProvider>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#f4f7f2'},brand:{padding:12,borderBottomWidth:1,borderBottomColor:'#d5dfd3'},title:{fontSize:23,fontWeight:'800',color:'#174f2b'},subtitle:{fontSize:13,color:'#506757'},body:{flex:1},hidden:{display:'none'},tabs:{flexDirection:'row',padding:8,gap:6,borderTopWidth:1,borderTopColor:'#d5dfd3'},tab:{flex:1,minHeight:52,alignItems:'center',justifyContent:'center',borderRadius:12},active:{backgroundColor:'#174f2b'},selected:{color:'white',fontWeight:'700'},label:{color:'#174f2b',fontWeight:'700'},error:{padding:10,color:'#842d26'}});
