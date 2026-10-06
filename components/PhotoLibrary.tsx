import React,{useState} from 'react';
import {Platform,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {clusterByTime,makeObservationId,PrivateObservation} from '../src/photoObservations';
import {enrichCandidates} from '../src/photoCandidatePipeline';
import {buildVisualReviewQueue,VisualReviewItem,decodeVisualReviewQueue} from '../src/visualReviewQueue';
import {rankObservationPhotos,PhotoMeta} from '../src/photoSelection';

type ScanState={permission:'unknown'|'granted'|'limited'|'denied';count:number;observations:number;message:string};
const privateKey='fungo-italia:private-observations:v1';
const evidenceKey='fungo-italia:private-candidate-evidence:v1';
const reviewKey='fungo-italia:private-3plus1-queue:v1';

export default function PhotoLibrary(){
 const [state,setState]=useState<ScanState>({permission:'unknown',count:0,observations:0,message:'Nessuna scansione avviata.'});
 async function scan(){
  if(Platform.OS!=='ios'&&Platform.OS!=='android'){
   setState(s=>({...s,message:'La scansione della libreria Foto richiede Fungo Italia installato su iPhone o Android. La PWA resta dedicata alla consultazione.'}));
   return;
  }
  try{
   const MediaLibrary=await import('expo-media-library');
   const permission=await MediaLibrary.requestPermissionsAsync(false,['photo']);
   if(!permission.granted){
    setState({permission:(permission as {accessPrivileges?:string}).accessPrivileges==='limited'?'limited':'denied',count:0,observations:0,message:'Accesso Foto non concesso. Puoi modificarlo nelle Impostazioni del telefono.'});
    return;
   }
   const {Query,AssetField,MediaType}=MediaLibrary;
   let offset=0,total=0,pages=0;const metadata:PhotoMeta[]=[];
   for(;;){
    const assets=await new Query()
     .eq(AssetField.MEDIA_TYPE,MediaType.IMAGE)
     .limit(250)
     .offset(offset)
     .orderBy({key:AssetField.CREATION_TIME,ascending:false})
     .exeForMetadata();
    metadata.push(...assets.map(a=>({id:a.id,creationTime:a.creationTime,width:a.width,height:a.height,isFavorite:a.isFavorite})));
    total+=assets.length;pages++;
    setState({permission:(permission as {accessPrivileges?:string}).accessPrivileges==='limited'?'limited':'granted',count:total,observations:0,message:`Indicizzazione locale: ${total} foto lette. Nessun originale caricato.`});
    if(assets.length<250)break;
    offset+=assets.length;
    if(pages>2000)throw new Error('Limite di sicurezza scansione');
   }
   const groups=clusterByTime(metadata);
   const observations:PrivateObservation[]=groups.map(group=>({id:makeObservationId(group.map(a=>a.id),group[0]?.creationTime??null),assetIds:rankObservationPhotos(group,8).map(a=>a.assetId),capturedAt:group[0]?.creationTime??null,preciseLocation:null,appleCandidate:null,verificationStatus:'unreviewed'}));
   await AsyncStorage.setItem(privateKey,JSON.stringify({version:1,observations}));
   setState({permission:(permission as {accessPrivileges?:string}).accessPrivileges==='limited'?'limited':'granted',count:total,observations:observations.length,message:`Indice completato: ${total} foto accessibili, raggruppate localmente in ${observations.length} osservazioni temporali. GPS/EXIF vengono letti solo quando richiedi l’analisi dei gruppi. Nessun riconoscimento automatico è eseguito.`});
  }catch(e){
   setState(s=>({...s,message:'Scansione non completata. Verifica il permesso Foto e riprova.'}));
  }
 }

 async function enrich(){
  try{
   const raw=await AsyncStorage.getItem(privateKey);if(!raw){setState(s=>({...s,message:'Prima esegui l’indicizzazione della libreria.'}));return;}
   const parsed=JSON.parse(raw) as {version:1;observations:PrivateObservation[]};
   const evidence=await enrichCandidates(parsed.observations,100);
   await AsyncStorage.setItem(privateKey,JSON.stringify(parsed));
   await AsyncStorage.setItem(evidenceKey,JSON.stringify({version:1,evidence}));
   setState(s=>({...s,message:`Arricchiti privatamente ${evidence.length} gruppi con GPS/EXIF. Le coordinate precise restano sul dispositivo. Prossimo stadio: revisione visuale 3+1.`}));
  }catch{setState(s=>({...s,message:'Arricchimento GPS/EXIF non riuscito. Riprova dopo aver verificato il permesso Foto.'}));}
 }

 async function prepareReview(){
  try{
   const raw=await AsyncStorage.getItem(privateKey);if(!raw){setState(s=>({...s,message:'Prima indicizza la libreria.'}));return;}
   const parsed=JSON.parse(raw) as {version:1;observations:PrivateObservation[]};
   const queue=buildVisualReviewQueue(parsed.observations,100);
   const previousRaw=await AsyncStorage.getItem(reviewKey);const previous=decodeVisualReviewQueue(previousRaw);
   const combined=[...previous.queue,...queue.filter(x=>!previous.queue.some((old:VisualReviewItem)=>old.observationId===x.observationId))];
   await AsyncStorage.setItem(reviewKey,JSON.stringify({version:1,queue:combined}));
   setState(s=>({...s,message:`Coda 3+1 pronta: ${combined.length} osservazioni. Ogni gruppo mantiene al massimo 8 scatti e richiede 3 caratteri diagnostici + 1 conferma prima di essere considerato completo.`}));
  }catch{setState(s=>({...s,message:'Preparazione della coda 3+1 non riuscita.'}));}
 }
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>La mia raccolta fotografica</Text>
  <Text style={s.body}>Fungo Italia può indicizzare le foto autorizzate sul dispositivo senza trasferire l'intera libreria. Gli originali restano sul telefono finché non scegli di usare una fotografia in una scheda.</Text>
  <View style={s.card}><Text style={s.head}>Pipeline 3+1</Text><Text style={s.body}>Indicizza le foto autorizzate, forma gruppi temporali e prepara bozze da selezionare manualmente. Non riconosce automaticamente funghi, esemplari o parti anatomiche.</Text></View>
  <Pressable accessibilityRole="button" onPress={scan} style={s.button}><Text style={s.buttonText}>Autorizza e indicizza Foto</Text></Pressable>
  <Pressable accessibilityRole="button" onPress={enrich} style={s.secondary}><Text style={s.secondaryText}>Analizza GPS/EXIF dei primi 100 gruppi</Text></Pressable>
  <Pressable accessibilityRole="button" onPress={prepareReview} style={s.secondary}><Text style={s.secondaryText}>Prepara coda visuale 3+1</Text></Pressable>
  <View style={s.card}><Text style={s.head}>Stato</Text><Text style={s.body}>{state.message}</Text>{state.count>0&&<Text style={s.count}>{state.count} foto indicizzate</Text>}{state.observations>0&&<Text style={s.count}>{state.observations} gruppi temporali</Text>}</View>
  <Text style={s.note}>Privacy: l'autorizzazione può essere completa o limitata. Questa prima fase legge soltanto l'indice della libreria; non invia automaticamente fotografie né coordinate.</Text>
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:16,gap:14},title:{fontSize:22,fontWeight:'800',color:'#174f2b'},body:{fontSize:15,lineHeight:21,color:'#304c39'},card:{padding:14,borderRadius:14,backgroundColor:'#fff',borderWidth:1,borderColor:'#d5dfd3',gap:6},head:{fontSize:16,fontWeight:'800',color:'#174f2b'},button:{padding:15,borderRadius:14,backgroundColor:'#174f2b',alignItems:'center'},buttonText:{color:'#fff',fontWeight:'800'},count:{fontSize:18,fontWeight:'800',color:'#174f2b'},note:{fontSize:12,lineHeight:17,color:'#607268'},secondary:{padding:14,borderRadius:14,borderWidth:1,borderColor:'#174f2b',alignItems:'center'},secondaryText:{color:'#174f2b',fontWeight:'800'}});
