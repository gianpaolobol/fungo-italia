import React,{useRef,useState} from 'react';
import {ActivityIndicator,Linking,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
export type SubscriptionProduct={id:string;localizedPrice:string;subscriptionPeriod:{unit:string;value:number}};
export type SubscriptionGateProps={
 product:SubscriptionProduct|null;active:boolean;checking:boolean;busy:boolean;
 supported:boolean;expiresAt:string|null;error:string;privacyUrl:string;
 onPurchase:()=>Promise<void>;onRestore:()=>Promise<void>;onRetry:()=>Promise<void>;onPreview:()=>void;
};
const terms='https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const manage='https://apps.apple.com/account/subscriptions';
export default function SubscriptionGate(p:SubscriptionGateProps){
 const [message,setMessage]=useState(''),[running,setRunning]=useState(false),lock=useRef(false);
 const disabled=p.busy||p.checking||running;
 const available=p.supported&&p.product?.subscriptionPeriod.unit==='year'&&p.product.subscriptionPeriod.value===1&&!!p.product.localizedPrice;
 async function run(fn:()=>Promise<void>){if(lock.current||p.busy)return;lock.current=true;setRunning(true);setMessage('');try{await fn();}catch{setMessage('Operazione non completata. Riprova.');}finally{lock.current=false;setRunning(false);}}
 async function open(url:string){try{await Linking.openURL(url);}catch{setMessage('Collegamento non aperto. Verifica la connessione.');}}
 const button=(label:string,fn:()=>void,primary=false,off=false)=><Pressable accessibilityRole="button" accessibilityState={{disabled:off}} disabled={off} onPress={fn} style={[primary?s.primary:s.secondary,off&&s.disabled]}><Text style={primary?s.primaryText:s.secondaryText}>{label}</Text></Pressable>;
 return <ScrollView contentContainerStyle={s.page}>
  <Text accessibilityRole="header" style={s.title}>Fungo Italia completo</Text>
  <Text style={s.body}>L’atlante completo e gli esercizi per il tuo studio micologico. Include gli aggiornamenti pubblicati durante l’abbonamento.</Text>
  <View style={s.card}><Text style={s.benefit}>Tutte le schede di specie, generi e gruppi</Text><Text style={s.benefit}>Fotografie, confronti e caratteri di studio</Text><Text style={s.benefit}>Esame fotografico con correzione e ripasso</Text></View>
  {p.busy&&<View accessibilityLiveRegion="polite" style={s.loading}><ActivityIndicator/><Text style={s.body}>Operazione App Store in corso…</Text></View>}
  {p.checking&&<View style={s.loading}><ActivityIndicator/><Text style={s.body}>Verifica dell’abbonamento…</Text></View>}
  {p.active?<><Text style={s.body}>Abbonamento attivo</Text>{p.expiresAt&&<Text style={s.small}>Accesso verificato fino al {new Date(p.expiresAt).toLocaleDateString('it-IT')}.</Text>}</>:p.supported?<><Text style={s.price}>{available?p.product!.localizedPrice+' / anno':'Prezzo non disponibile'}</Text><Text style={s.small}>Abbonamento annuale con rinnovo automatico. Nessun periodo di prova.</Text>{button(available?'Abbonati · '+p.product!.localizedPrice+' / anno':'Abbonamento non disponibile',()=>void run(p.onPurchase),true,disabled||!available)}<Text style={s.small}>Il pagamento viene addebitato al tuo account Apple alla conferma dell’acquisto. L’abbonamento si rinnova automaticamente, salvo disdetta almeno 24 ore prima della scadenza. Il costo del rinnovo viene addebitato nelle 24 ore precedenti la scadenza. Puoi gestire o annullare il rinnovo nelle impostazioni degli abbonamenti Apple.</Text></>:<Text style={s.body}>L’abbonamento è disponibile nella versione iPhone e iPad. Su questo dispositivo puoi consultare l’anteprima gratuita e le aree.</Text>}
  {p.supported&&button('Ripristina acquisti',()=>void run(p.onRestore),false,disabled)}
  {button(p.active?'Apri l’atlante':'Continua con l’anteprima gratuita',p.onPreview)}
  {!p.active&&<Text style={s.small}>Nell’anteprima: 5 schede dell’atlante e consultazione delle aree. L’esame fotografico richiede l’abbonamento.</Text>}
  {!!(message||p.error)&&<Text accessibilityRole="alert" style={s.error}>{message||p.error}</Text>}
  {p.supported&&button('Aggiorna stato e prezzo',()=>void run(p.onRetry),false,disabled)}
  <View style={s.links}>{p.supported&&<Pressable accessibilityRole="link" style={s.link} onPress={()=>void open(manage)}><Text style={s.linkText}>Gestisci abbonamento</Text></Pressable>}<Pressable accessibilityRole="link" style={s.link} onPress={()=>void open(p.privacyUrl)}><Text style={s.linkText}>Privacy</Text></Pressable><Pressable accessibilityRole="link" style={s.link} onPress={()=>void open(terms)}><Text style={s.linkText}>Condizioni d’uso</Text></Pressable></View>
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:20,paddingBottom:36,gap:14},title:{fontSize:27,fontWeight:'800',color:'#174f2b'},body:{fontSize:16,lineHeight:23,color:'#304b39'},small:{fontSize:13,lineHeight:19,color:'#435c49'},card:{padding:16,gap:10,borderRadius:14,backgroundColor:'#fff'},benefit:{fontSize:16,lineHeight:23,color:'#174f2b'},price:{fontSize:27,fontWeight:'800',color:'#174f2b'},primary:{minHeight:52,padding:14,borderRadius:12,backgroundColor:'#174f2b',alignItems:'center',justifyContent:'center'},primaryText:{fontSize:16,fontWeight:'700',color:'#fff',textAlign:'center'},secondary:{minHeight:48,padding:12,borderRadius:12,borderWidth:1,borderColor:'#789180',alignItems:'center',justifyContent:'center'},secondaryText:{fontSize:15,color:'#174f2b',fontWeight:'600',textAlign:'center'},disabled:{opacity:.45},loading:{flexDirection:'row',alignItems:'center',gap:10},links:{gap:3},link:{minHeight:44,justifyContent:'center'},linkText:{fontSize:14,color:'#174f2b',textDecorationLine:'underline'},error:{fontSize:14,lineHeight:20,color:'#a32424'}});
