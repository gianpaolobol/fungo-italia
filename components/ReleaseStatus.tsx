import React,{useState} from 'react';
import {Platform,Pressable,StyleSheet,Text,View} from 'react-native';
import useReleaseAlignment from '../hooks/useReleaseAlignment';
import {prepareWebUpdate} from '../lib/release-alignment.mjs';
export default function ReleaseStatus({details=false}:{details?:boolean}){
 return Platform.OS==='web'?<WebReleaseStatus details={details}/>:null;
}
function WebReleaseStatus({details}:{details:boolean}){
 const {status,localVersion,release,refresh}=useReleaseAlignment();
 const [updating,setUpdating]=useState(false),[message,setMessage]=useState('');
 if(!details&&status!=='update-available')return null;
 async function update(){
  if(updating)return;
  setUpdating(true);setMessage('');
  try{
   if(typeof navigator==='undefined'||!('serviceWorker'in navigator))throw Error('Offline support unavailable');
   await prepareWebUpdate(navigator.serviceWorker);
   window.location.reload();
  }catch{setMessage('Aggiornamento non completato. Verifica la connessione e riprova.');setUpdating(false);}
 }
 const copy=status==='web-current'?'Versione web aggiornata. L’aggiornamento iPhone attende la conferma del titolare.':status==='checking'?'Verifica della versione in corso…':status==='aligned'?'Questa versione corrisponde alla versione TestFlight verificata.':status==='unknown'?'Non è possibile verificare la versione adesso. Riprova quando sei online.':release?.schemaVersion===2?'È disponibile un aggiornamento della sola versione web.':'È disponibile una versione diversa, verificata su TestFlight.';
 return <View style={s.card} accessibilityLiveRegion="polite">
  {details&&<Text style={s.version}>Versione {localVersion}</Text>}
  <Text style={s.body}>{copy}</Text>
  {status==='update-available'&&<>
   {release&&<Text style={s.body}>{release.schemaVersion===2?'Versione web '+release.version:'Versione TestFlight '+release.version+' ('+release.buildNumber+')'}</Text>}
   <Text style={s.body}>Termina l’esercizio prima di aggiornare: la pagina verrà ricaricata.</Text><Pressable accessibilityRole="button" accessibilityState={{disabled:updating}} disabled={updating} onPress={()=>void update()} style={s.button}><Text style={s.buttonText}>{updating?'Preparazione aggiornamento…':'Aggiorna anteprima'}</Text></Pressable>
  </>}
  {details&&status!=='checking'&&<Pressable accessibilityRole="button" onPress={()=>void refresh()} style={s.button}><Text style={s.buttonText}>Verifica versione</Text></Pressable>}
  {!!message&&<Text accessibilityRole="alert" style={s.body}>{message}</Text>}
 </View>;
}
const s=StyleSheet.create({card:{alignSelf:'stretch',flexShrink:1,padding:12,gap:8,borderRadius:12,backgroundColor:'#edf3e9'},version:{fontSize:14,fontWeight:'700',color:'#174f2b'},body:{fontSize:14,lineHeight:20,color:'#304b39',flexShrink:1},button:{minHeight:44,paddingVertical:10,paddingHorizontal:12,borderRadius:9,borderWidth:1,borderColor:'#789180',justifyContent:'center'},buttonText:{fontSize:14,fontWeight:'600',textAlign:'center',color:'#174f2b'}});
