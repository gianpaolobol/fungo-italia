import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Platform,Pressable,StyleSheet,Text,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'expo-status-bar';
import StudyDashboard from './components/StudyDashboard';
import useStudy from './hooks/useStudy';
import Studio,{StudyTaxon} from './components/Studio';
import Areas,{Area} from './components/Areas';
import PhotoExam from './components/PhotoExam';
import SubscriptionGate from './components/SubscriptionGate';
import useSubscription from './hooks/useSubscription';
import catalog from './src/data/catalog.json';
import areas from './src/data/areas.json';
import groups from './src/data/groups.json';
import {agaricusOnly} from './lib/demo-policy.mjs';
const allTaxa=[...catalog,...groups] as unknown as StudyTaxon[];
type State={version:1;favoriteIds:string[];resumeId:string|null};
const key='fungo-italia:study:v1';
const tabs=['Percorso','Studio','Esame','Aree'] as const;
const previewTaxa=agaricusOnly(allTaxa);
export default function App(){
 const billing=useSubscription();
 const fullAccess=billing.active;
 const study=useStudy({demo:!fullAccess});
 const shownTaxa=fullAccess?allTaxa:previewTaxa,shownIds=new Set(shownTaxa.map(t=>t.id));
 const [tab,setTab]=useState<typeof tabs[number]>('Percorso'),[showSubscription,setShowSubscription]=useState(false),[state,setState]=useState<State>({version:1,favoriteIds:[],resumeId:null}),[ready,setReady]=useState(false),[error,setError]=useState('');
 const queue=useRef<Promise<void>>(Promise.resolve()),canSave=useRef(false);
 const allowed=new Set(allTaxa.map(t=>t.id));
 useEffect(()=>{let active=true;AsyncStorage.getItem(key).then(raw=>{if(!active)return;if(raw){const value=JSON.parse(raw);if(value.version!==1||!Array.isArray(value.favoriteIds)||!value.favoriteIds.every((id:unknown)=>typeof id==='string')||(value.resumeId!==null&&typeof value.resumeId!=='string'))throw Error('Formato');setState({version:1,favoriteIds:[...new Set(value.favoriteIds as string[])].filter(id=>allowed.has(id)),resumeId:allowed.has(value.resumeId)?value.resumeId:null});}canSave.current=true;setReady(true);}).catch(()=>{if(active){setError('Preferiti non leggibili. La consultazione resta disponibile; i dati memorizzati non verranno sovrascritti.');setReady(true);}});return()=>{active=false;};},[]);
 useEffect(()=>{if(!ready||error||!canSave.current)return;const payload=JSON.stringify(state);queue.current=queue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(key,payload)).catch(()=>setError('Salvataggio dei preferiti non riuscito. Riprova per conservare le modifiche.'));},[state,ready,error]);
 function update(patch:Partial<State>){setState(previous=>({...previous,...patch}));}

 const gate=<SubscriptionGate product={billing.product} active={billing.active} checking={billing.checking} busy={billing.busy} purchaseReady={billing.purchaseReady} supported={billing.supported} expiresAt={billing.expiresAt} error={billing.error} privacyUrl="https://gianpaolobol.github.io/fungo-italia/privacy.html" onPurchase={billing.purchase} onRestore={billing.restore} onRetry={billing.refresh} onPreview={()=>setTab('Studio')}/>;
 return <SafeAreaProvider><SafeAreaView style={s.page}><StatusBar style="dark"/><View style={s.brand}><Text style={s.title}>Fungo Italia</Text><Pressable testID="open-subscription" accessibilityRole="button" accessibilityLabel="Abbonamento e sblocco completo" onPress={()=>setShowSubscription(true)} style={s.subscriptionButton}><Text style={s.mushroomIcon}>🍄</Text><Text style={s.subscriptionLabel}>Abbonamento</Text></Pressable></View>{!!error&&<View><Text accessibilityRole="alert" style={s.error}>{error}</Text>{canSave.current&&<Pressable accessibilityRole="button" onPress={()=>setError('')} style={s.tab}><Text style={s.label}>Riprova salvataggio</Text></Pressable>}</View>}<View style={s.body}>{showSubscription?<View style={s.body}><Pressable accessibilityRole="button" onPress={()=>setShowSubscription(false)} style={s.closeSubscription}><Text style={s.label}>‹ Torna all'app</Text></Pressable>{gate}</View>:!ready?<ActivityIndicator accessibilityLabel="Caricamento"/>:<>
<View style={[s.body,tab!=='Percorso'&&s.hidden]} accessibilityElementsHidden={tab!=='Percorso'} importantForAccessibility={tab!=='Percorso'?'no-hide-descendants':'auto'}>{tab==='Percorso'&&<StudyDashboard study={study} complete={fullAccess} onStudy={()=>{void study.startStudy().then(ok=>{if(ok)setTab('Studio');});}} onTraining={()=>setTab('Esame')} onAccess={()=>setShowSubscription(true)}/>}</View>
<View style={[s.body,tab!=='Studio'&&s.hidden]} accessibilityElementsHidden={tab!=='Studio'} importantForAccessibility={tab!=='Studio'?'no-hide-descendants':'auto'}>{!fullAccess&&<Pressable accessibilityRole="button" onPress={()=>setShowSubscription(true)} style={s.preview}><Text style={s.label}>Demo gratuita · Agaricus</Text><Text style={s.small}>Tutte le schede Agaricus e il test dedicato. Abbonati per il percorso completo.</Text></Pressable>}<Studio key={fullAccess?'full':'preview'} taxa={shownTaxa} favoriteIds={state.favoriteIds.filter(id=>shownIds.has(id))} onFavoriteIdsChange={favoriteIds=>setState(previous=>({...previous,favoriteIds:[...previous.favoriteIds.filter(id=>!shownIds.has(id)),...favoriteIds]}))} resumeId={state.resumeId&&shownIds.has(state.resumeId)?state.resumeId:null} onResumeChange={resumeId=>update({resumeId})}/></View>
<View style={[s.body,tab!=='Aree'&&s.hidden]} accessibilityElementsHidden={tab!=='Aree'} importantForAccessibility={tab!=='Aree'?'no-hide-descendants':'auto'}>{fullAccess?<Areas areas={areas as unknown as Area[]}/>:tab==='Aree'?gate:null}</View>
<View style={[s.body,tab!=='Esame'&&s.hidden]} accessibilityElementsHidden={tab!=='Esame'} importantForAccessibility={tab!=='Esame'?'no-hide-descendants':'auto'}><PhotoExam key={fullAccess?'full':'agaricus'} demo={!fullAccess} adaptiveIds={fullAccess?study.nextTraining.taxonIds:undefined}/></View>
</>}</View><View accessibilityRole="tablist" style={s.tabs}>{tabs.map(name=><Pressable key={name} testID={'tab-'+name.toLowerCase()} accessibilityRole="tab" accessibilityState={{selected:tab===name}} onPress={()=>setTab(name)} style={[s.tab,tab===name&&s.active]}><Text style={tab===name?s.selected:s.label}>{name}</Text></Pressable>)}</View></SafeAreaView></SafeAreaProvider>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#f4f7f2'},brand:{padding:12,borderBottomWidth:1,borderBottomColor:'#d5dfd3',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},subscriptionButton:{flexDirection:'row',alignItems:'center',gap:5,minHeight:44,paddingHorizontal:8},mushroomIcon:{fontSize:23},subscriptionLabel:{fontSize:12,fontWeight:'700',color:'#174f2b'},closeSubscription:{minHeight:44,justifyContent:'center',paddingHorizontal:14},title:{fontSize:23,fontWeight:'800',color:'#174f2b'},subtitle:{fontSize:13,color:'#506757'},body:{flex:1},hidden:{display:'none'},tabs:{flexDirection:'row',padding:8,gap:6,borderTopWidth:1,borderTopColor:'#d5dfd3'},tab:{flex:1,minHeight:52,alignItems:'center',justifyContent:'center',borderRadius:12},active:{backgroundColor:'#174f2b'},selected:{color:'white',fontWeight:'700',fontSize:12,textAlign:'center'},label:{color:'#174f2b',fontWeight:'700',fontSize:12,textAlign:'center'},error:{padding:10,color:'#842d26'},preview:{padding:12,gap:4,borderBottomWidth:1,borderBottomColor:'#c6d3c5',backgroundColor:'#e7f0e2'},small:{fontSize:13,lineHeight:18,color:'#435c49'}});
