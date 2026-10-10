import React,{useEffect,useRef,useState} from 'react';
import {AppState,Image,Platform,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {buildVisualReviewQueue} from '../src/visualReviewQueue';
import {visualReviewStore} from '../src/reviewStorage';
import {createScan,decodeScan,runPhotoBatch,scanKey,PhotoScan,Decision,Photo,PhotoResult,decodeManifest,observationsForPhotos} from '../src/photoScan';
import {classifyLocalPhoto,photoClassifierAvailable,createPhotoSnapshot} from '../src/localPhotoClassifier';

const labels:Record<Decision,string>={candidate:'Possibile fungo',other:'Non pertinente',uncertain:'Incerta'};
export default function PhotoLibrary(){
 const [scan,setScan]=useState<PhotoScan>(createScan),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[message,setMessage]=useState('Caricamento del punto di ripresa…');
 const [history,setHistory]=useState<{number:number;photos:PhotoResult[]}|null>(null);
 const manifest=useRef<Photo[]|null>(null);
 const snapshot=useRef(scan),lock=useRef(false),stop=useRef(false),alive=useRef(true);
 function display(value:PhotoScan){snapshot.current=value;if(alive.current)setScan(value);}
 function archiveKey(number:number){return `${scanKey}:${snapshot.current.sessionId}:batch:${number}`;}
 function manifestKey(){return `${scanKey}:${snapshot.current.sessionId}:manifest`;}
 async function save(value:PhotoScan){await AsyncStorage.setItem(scanKey,JSON.stringify(value));display(value);}
 useEffect(()=>{alive.current=true;void AsyncStorage.getItem(scanKey).then(raw=>{display(decodeScan(raw));setReady(true);setMessage('Pronto. Ogni avvio analizza al massimo 20 foto.');}).catch(()=>setMessage('Punto di ripresa non leggibile. I dati esistenti sono conservati: scansione bloccata.'));const sub=AppState.addEventListener('change',value=>{if(value!=='active')stop.current=true;});return()=>{alive.current=false;stop.current=true;sub.remove();};},[]);
 async function exclusive(action:()=>Promise<void>){if(lock.current||!ready)return;lock.current=true;stop.current=false;setBusy(true);try{await action();}catch{if(alive.current)setMessage('Operazione interrotta. Riparti dall’ultima foto salvata; controlla permessi Foto e spazio disponibile.');}finally{lock.current=false;if(alive.current)setBusy(false);}}
 async function analyze(){await exclusive(async()=>{
  if(Platform.OS!=='ios'||!photoClassifierAvailable){setMessage('Il filtro locale richiede la nuova versione iOS distribuita tramite TestFlight.');return;}
  const MediaLibrary=await import('expo-media-library');
  const permission=await MediaLibrary.requestPermissionsAsync(false,['photo']);
  if(!permission.granted){setMessage('Accesso Foto non concesso. Verifica le Impostazioni dell’iPhone.');return;}
  if(stop.current)return;
  let current=snapshot.current;
  if(current.lastBatch.length===20&&!current.complete){
   // Archive before clearing the current batch; storage failure leaves it reviewable.
   await AsyncStorage.setItem(archiveKey(current.batchNumber),JSON.stringify(current.lastBatch));
   current={...current,batchNumber:current.batchNumber+1,lastBatch:[]};await save(current);
  }
  if(current.complete){setMessage('Le foto accessibili sono state analizzate. Puoi revisionare l’ultimo lotto.');return;}
  if(!manifest.current){
   const raw=await AsyncStorage.getItem(manifestKey());
   if(raw)manifest.current=decodeManifest(raw);
   else {if(current.offset>0)throw Error('Elenco foto mancante');const photos=await createPhotoSnapshot();await AsyncStorage.setItem(manifestKey(),JSON.stringify(photos));manifest.current=photos;}
  }
  setMessage('Analisi locale in corso. Puoi mettere in pausa; nessuna foto viene inviata.');
  const result=await runPhotoBatch(current,{
   query:async offset=>manifest.current!.slice(offset,offset+20),
   classify:photo=>classifyLocalPhoto(photo.id),save,stopped:()=>stop.current
  });
  display(result);
  setMessage(stop.current?'In pausa. La prossima analisi riprende dalla foto successiva.':result.complete?'Foto accessibili terminate. Controlla i risultati prima di confermare.':'Lotto terminato. Controlla i risultati e conferma i funghi nel 3+1 prima di proseguire.');
 });}
 async function change(id:string,decision:Decision){await exclusive(async()=>{if(history){const photos=history.photos.map(p=>p.id===id?{...p,decision}:p);await AsyncStorage.setItem(archiveKey(history.number),JSON.stringify(photos));setHistory({...history,photos});}else await save({...snapshot.current,lastBatch:snapshot.current.lastBatch.map(p=>p.id===id?{...p,decision}:p)});});}
 async function browse(number:number){await exclusive(async()=>{if(number===snapshot.current.batchNumber){setHistory(null);return;}const raw=await AsyncStorage.getItem(archiveKey(number));if(!raw)throw Error('Lotto mancante');const decoded=decodeScan(JSON.stringify({...createScan(),lastBatch:JSON.parse(raw)}));setHistory({number,photos:decoded.lastBatch});});}
 async function restart(){await exclusive(async()=>{const old=snapshot.current;if(old.lastBatch.length)await AsyncStorage.setItem(archiveKey(old.batchNumber),JSON.stringify(old.lastBatch));await save(createScan());manifest.current=null;setHistory(null);setMessage('Nuova scansione pronta: includerà le foto ora autorizzate. Le bozze 3+1 sono conservate.');});}
 const visible=history?.photos??scan.lastBatch;
 const visibleNumber=history?.number??scan.batchNumber;
 async function confirm(){await exclusive(async()=>{
  const selected=(history?.photos??snapshot.current.lastBatch).filter(p=>p.decision==='candidate');
  if(!selected.length){setMessage('Nessun fungo selezionato. Puoi correggere manualmente anche le foto incerte.');return;}
  const observations=observationsForPhotos(selected);
  await visualReviewStore.merge(buildVisualReviewQueue(observations,20));
  setMessage(`${selected.length} foto confermate nella coda 3+1. Le bozze precedenti sono conservate.`);
 });}
 return <ScrollView contentContainerStyle={s.page}>
  <Text style={s.title}>Selezione locale delle foto</Text>
  <Text style={s.body}>Analizza fino a 20 immagini alla volta, una per volta, dalla più recente. Apple Vision cerca possibili funghi sul dispositivo. Non identifica la specie o la commestibilità. Verifica anche le immagini escluse: il filtro può sbagliare.</Text>
  <View style={s.card}><Text style={s.head}>Lotto {visibleNumber}: {visible.length} / 20</Text><Text style={s.body}>{scan.total} foto analizzate · {visible.filter(p=>p.decision==='candidate').length} possibili funghi</Text><Text accessibilityRole="alert" style={s.body}>{message}</Text></View>
  <Pressable accessibilityRole="button" disabled={busy||!ready||scan.complete||!!history} onPress={()=>void analyze()} style={[s.button,(busy||!ready||scan.complete||!!history)&&s.disabled]}><Text style={s.buttonText}>{scan.total?'Continua: massimo 20 foto':'Autorizza e analizza 20 foto'}</Text></Pressable>
  {busy&&<Pressable accessibilityRole="button" onPress={()=>{stop.current=true;setMessage('Pausa richiesta. Attendo il salvataggio della foto corrente.');}} style={s.secondary}><Text style={s.secondaryText}>Ferma dopo la foto corrente</Text></Pressable>}
  {!!visible.length&&<Pressable disabled={busy} style={[s.button,busy&&s.disabled]} onPress={()=>void confirm()}><Text style={s.buttonText}>Conferma le selezionate nel 3+1</Text></Pressable>}
  <View style={s.row}>{visibleNumber>1&&<Pressable disabled={busy} style={s.secondary} onPress={()=>void browse(visibleNumber-1)}><Text>Lotto precedente</Text></Pressable>}{history&&<Pressable disabled={busy} style={s.secondary} onPress={()=>void browse(Math.min(scan.batchNumber,visibleNumber+1))}><Text>Lotto successivo</Text></Pressable>}</View>
  {scan.complete&&<Pressable disabled={busy} style={s.secondary} onPress={()=>void restart()}><Text>Nuova scansione delle foto autorizzate</Text></Pressable>}
  {visible.map((photo,i)=><View key={photo.id} style={s.card}>
   <Text style={s.head}>Foto {i+1} · {labels[photo.decision]}</Text><Text style={s.note}>Selezione da verificare manualmente</Text>{photo.uri?<Image source={{uri:photo.uri}} style={s.image} resizeMode="contain"/>:<Text style={s.body}>Miniatura non disponibile localmente</Text>}{photo.reason&&<Text style={s.body}>{photo.reason}</Text>}
   <View style={s.row}>{(['candidate','other','uncertain'] as Decision[]).map(decision=><Pressable accessibilityRole="button" accessibilityState={{selected:photo.decision===decision}} disabled={busy} key={decision} style={[s.choice,photo.decision===decision&&s.chosen]} onPress={()=>void change(photo.id,decision)}><Text style={s.secondaryText}>{labels[decision]}</Text></Pressable>)}</View>
  </View>)}
  <Text style={s.note}>Solo miniature locali; niente invio di fotografie o coordinate. Le foto disponibili soltanto su iCloud restano incerte. Puoi concedere accesso solo alle foto che scegli. Ogni lotto viene conservato sul dispositivo; la coda 3+1 mantiene solo le foto che confermi.</Text>
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:16,gap:14},title:{fontSize:22,fontWeight:'800',color:'#174f2b'},body:{fontSize:15,lineHeight:21,color:'#304c39'},card:{padding:14,borderRadius:14,backgroundColor:'#fff',borderWidth:1,borderColor:'#d5dfd3',gap:8},head:{fontSize:16,fontWeight:'800',color:'#174f2b'},button:{padding:15,borderRadius:14,backgroundColor:'#174f2b',alignItems:'center'},buttonText:{color:'#fff',fontWeight:'800'},note:{fontSize:12,lineHeight:17,color:'#607268'},secondary:{padding:14,borderRadius:14,borderWidth:1,borderColor:'#174f2b',alignItems:'center'},secondaryText:{color:'#174f2b',fontWeight:'700'},disabled:{opacity:.4},image:{width:'100%',height:180,borderRadius:10},row:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{padding:10,minHeight:44,borderRadius:10,borderWidth:1,borderColor:'#d5dfd3'},chosen:{backgroundColor:'#dcebdc',borderColor:'#174f2b'}});
