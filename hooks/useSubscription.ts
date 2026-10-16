import {useCallback,useEffect,useRef,useState} from 'react';
import {AppState} from 'react-native';
import {getAnnualProduct,currentEntitlement,purchaseAnnual,restoreAnnual,observeEntitlement,subscriptionAvailable} from '../modules/fungo-subscription';
import {expiryDelay} from '../lib/subscriptionPolicy';
import type {SubscriptionProduct} from '../components/SubscriptionGate';
type Entitlement={active:boolean;expiresAt:string|null};
const inactive:Entitlement={active:false,expiresAt:null};
function verified(value:Entitlement):Entitlement{
 const expires=typeof value?.expiresAt==='string'?Date.parse(value.expiresAt):NaN;
 return value?.active===true&&Number.isFinite(expires)&&expires>Date.now()?{active:true,expiresAt:value.expiresAt}:inactive;
}
export default function useSubscription(){
 const [product,setProduct]=useState<SubscriptionProduct|null>(null),[entitlement,setEntitlement]=useState<Entitlement>(inactive),[checking,setChecking]=useState(subscriptionAvailable),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const mounted=useRef(true),generation=useRef(0),locked=useRef(false);
 const refresh=useCallback(async()=>{
  if(!subscriptionAvailable)return;
  const run=++generation.current;
  setChecking(true);setError('');
  const [access,price]=await Promise.allSettled([currentEntitlement(),getAnnualProduct()]);
  if(!mounted.current||run!==generation.current)return;
  if(access.status==='fulfilled')setEntitlement(verified(access.value));else{setEntitlement(inactive);setError('Abbonamento non verificabile. Riprova o ripristina gli acquisti.');}
  if(price.status==='fulfilled')setProduct(price.value);else{setProduct(null);setError(previous=>previous||'Prezzo non disponibile. Verifica la connessione allo Store.');}
  setChecking(false);
 },[]);
 useEffect(()=>{
  mounted.current=true;
  if(!subscriptionAvailable){setChecking(false);return()=>{mounted.current=false;};}
  void refresh();
  const listener=observeEntitlement(value=>{
   if(!mounted.current)return;
   ++generation.current;setEntitlement(verified(value));setChecking(false);
  });
  const appState=AppState.addEventListener('change',state=>{
   if(state==='active'){setEntitlement(inactive);void refresh();}
  });
  return()=>{mounted.current=false;++generation.current;listener.remove();appState.remove();};
 },[refresh]);
 useEffect(()=>{
  if(!entitlement.active||!entitlement.expiresAt)return;
  const expiry=entitlement.expiresAt;
  let timer:ReturnType<typeof setTimeout>;
  function arm(){timer=setTimeout(()=>{
   if(Date.parse(expiry)>Date.now()){arm();return;}
   setEntitlement(inactive);void refresh();
  },expiryDelay(expiry));}
  arm();return()=>clearTimeout(timer);
 },[entitlement.active,entitlement.expiresAt,refresh]);
 const purchase=useCallback(async()=>{
  if(!subscriptionAvailable||locked.current)return;
  locked.current=true;++generation.current;setBusy(true);setError('');
  try{
   const result=await purchaseAnnual();
   if(!mounted.current)return;
   // Read current StoreKit state again: an earlier purchase response must not undo a later revocation event.
   await refresh();
   if(mounted.current&&result.status==='pending')setError('Acquisto in attesa di approvazione Apple. L’accesso si attiverà dopo la conferma.');
  }catch{if(mounted.current){setEntitlement(inactive);setError('Acquisto non completato. Verifica il tuo account Apple e riprova.');}}
  finally{locked.current=false;if(mounted.current)setBusy(false);}
 },[refresh]);
 const restore=useCallback(async()=>{
  if(!subscriptionAvailable||locked.current)return;
  locked.current=true;++generation.current;setBusy(true);setError('');
  try{await restoreAnnual();if(mounted.current)await refresh();}
  catch{if(mounted.current){setEntitlement(inactive);setError('Ripristino non riuscito. Verifica la connessione e riprova.');}}
  finally{locked.current=false;if(mounted.current)setBusy(false);}
 },[refresh]);
 return{product,active:entitlement.active,expiresAt:entitlement.expiresAt,checking,busy,error,supported:subscriptionAvailable,purchase,restore,refresh};
}
