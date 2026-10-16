import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Platform,Pressable,StyleSheet,Text,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'expo-status-bar';
import Studio,{StudyTaxon} from './components/Studio';
import Areas,{Area} from './components/Areas';
import PhotoExam from './components/PhotoExam';
import SubscriptionGate from './components/SubscriptionGate';
import useSubscription from './hooks/useSubscription';
import catalog from './src/data/catalog.json';
import areas from './src/data/areas.json';
import groups from './src/data/groups.json';
const allTaxa=[...catalog,...groups] as unknown as StudyTaxon[];
type State={version:1;favoriteIds:string[];resumeId:string|null};
const key='fungo-italia:study:v1';
const tabs=Platform.OS==='ios'?['Studio','Aree','Esame','Abbonamento'] as const:['Studio','Aree','Esame'] as const;
const previewTaxa=allTaxa.filter(t=>t.kind!=='teaching-group').slice(0,5);
export default function App(){
 const billing=useSubscription();
 const fullAccess=Platform.OS!=='ios'||billing.active;
 const shownTaxa=fullAccess?allTaxa:previewTaxa,shownIds=new Set(shownTaxa.map(t=>t.id));
 const [tab,setTab]=useState<typeof tabs[number]>('Studio'),[state,setState]=useState<State>({version:1,favoriteIds:[],resumeId:null}),[ready,setReady]=useState(false),[error,setError]=useState('');
 const queue=useRef<Promise<void>>(Promise.resolve()),canSave=useRef(false);
 const allowed=new Set(allTaxa.map(t=>t.id));
 useEffect(()=>{let active=true;AsyncStorage.getItem(key).then(raw=>{if(!active)return;if(raw){const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.favoriteIds)||!value.favoriteIds.every((id:unknown)=>typeof id==='string')||(value.resumeId!==null&&typeof value.resumeId!=='string'))throw Error('Formato');setState({version:1,favoriteIds:[...new Set(value.favoriteIds as string[])].filter(id=>allowed.has(id)),resumeId:allowed.has(value.resumeId)?value.resumeId:null});}canSave.current=true;setReady(true);}).catch(()=>{if(active){setError('Preferiti non leggibili. La consultazione resta disponibile; i dati memorizzati non verranno sovrascritti.');setReady(true);}});return()=>{active=false;};},[]);
 useEffect(()=>{if(!ready||error||!canSave.current)return;const payload=JSON.stringify(state);queue.current=queue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(key,payload)).catch(()=>setError('Salvataggio dei preferiti non riuscito. Riprova per conservare le modifiche.'));},[state,ready,error]);
 function update(patch:Partial<State>){setState(previous=>({...previous,...patch}));}

 const gate=<SubscriptionGate product={billing.product} active={billing.active} checking={billing.checking} busy={billing.busy} supported={billing.supported} expiresAt={billing.expiresAt} error={billing.error} privacyUrl="https://gianpaolobol.github.io/fungo-italia/privacy.html" onPurchase={billing.purchase} onRestore={billing.restore} onRetry={billing.refresh} onPreview={()=>setTab('Studio')}/>;
 return <SafeAreaProvider><SafeAreaView style={s.page}><StatusBar style="dark"/><View style={s.brand}><Text style={s.title}>Fungo Italia</Text></View>{!!error&&<View><Text accessibilityRole="alert" style={s.error}>{error}</Text>{canSave.current&&<Pressable accessibilityRole="button" onPress={()=>setError('')} style={s.tab}><Text style={s.label}>Riprova salvataggio</Text></Pressable>}</View>}<View style={s.body}>{!ready?<ActivityIndicator accessibilityLabel="Caricamento"/>:<>
<View style={[s.body,tab!=='Studio'&&s.hidden]} accessibilityElementsHidden={tab!=='Studio'} importantForAccessibility={tab!=='Studio'?'no-hide-descendants':'auto'}>{!fullAccess&&<Pressable accessibilityRole="button" onPress={()=>setTab('Abbonamento')} style={s.preview}><Text style={s.label}>Anteprima gratuita · 5 schede</Text><Text style={s.small}>Apri l’abbonamento per l’atlante completo e l’esame.</Text></Pressable>}<Studio key={fullAccess?'full':'preview'} taxa={shownTaxa} favoriteIds={state.favoriteIds.filter(id=>shownIds.has(id))} onFavoriteIdsChange={favoriteIds=>setState(previous=>({...previous,favoriteIds:[...previous.favoriteIds.filter(id=>!shownIds.has(id)),...favoriteIds]}))} resumeId={state.resumeId&&shownIds.has(state.resumeId)?state.resumeId:null} onResumeChange={resumeId=>update({resumeId})}/></View>
<View style={[s.body,tab!=='Aree'&&s.hidden]} accessibilityElementsHidden={tab!=='Aree'} importantForAccessibility={tab!=='Aree'?'no-hide-descendants':'auto'}><Areas areas={areas as unknown as Area[]}/></View>
<View style={[s.body,tab!=='Esame'&&s.hidden]} accessibilityElementsHidden={tab!=='Esame'} importantForAccessibility={tab!=='Esame'?'no-hide-descendants':'auto'}>{fullAccess?<PhotoExam/>:tab==='Esame'?gate:null}</View>
<View style={[s.body,tab!=='Abbonamento'&&s.hidden]} accessibilityElementsHidden={tab!=='Abbonamento'} importantForAccessibility={tab!=='Abbonamento'?'no-hide-descendants':'auto'}>{tab==='Abbonamento'?gate:null}</View>
</>}</View><View accessibilityRole="tablist" style={s.tabs}>{tabs.map(name=><Pressable key={name} testID={'tab-'+name.toLowerCase()} accessibilityRole="tab" accessibilityState={{selected:tab===name}} onPress={()=>setTab(name)} style={[s.tab,tab===name&&s.active]}><Text style={tab===name?s.selected:s.label}>{name}</Text></Pressable>)}</View></SafeAreaView></SafeAreaProvider>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#f4f7f2'},brand:{padding:12,borderBottomWidth:1,borderBottomColor:'#d5dfd3'},title:{fontSize:23,fontWeight:'800',color:'#174f2b'},subtitle:{fontSize:13,color:'#506757'},body:{flex:1},hidden:{display:'none'},tabs:{flexDirection:'row',padding:8,gap:6,borderTopWidth:1,borderTopColor:'#d5dfd3'},tab:{flex:1,minHeight:52,alignItems:'center',justifyContent:'center',borderRadius:12},active:{backgroundColor:'#174f2b'},selected:{color:'white',fontWeight:'700',fontSize:12,textAlign:'center'},label:{color:'#174f2b',fontWeight:'700',fontSize:12,textAlign:'center'},error:{padding:10,color:'#842d26'},preview:{padding:12,gap:4,borderBottomWidth:1,borderBottomColor:'#c6d3c5',backgroundColor:'#e7f0e2'},small:{fontSize:13,lineHeight:18,color:'#435c49'}});
