import {useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Platform} from 'react-native';
import {getAnnualProduct,currentEntitlement,purchaseAnnual,restoreAnnual,observeEntitlement,subscriptionAvailable} from '../modules/fungo-subscription';
import {expiryDelay} from '../lib/subscriptionPolicy';
import type {SubscriptionProduct} from '../components/SubscriptionGate';
type Entitlement={active:boolean;expiresAt:string|null};
const account=Platform?.OS==='android'?'Google Play':'Apple';
const inactive:Entitlement={active:false,expiresAt:null};
async function timely<T>(promise:Promise<T>):Promise<T>{let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([promise,new Promise<T>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Store timeout')),20000);})]);}finally{if(timer)clearTimeout(timer);}}
function verified(value:Entitlement):Entitlement{
 const expires=typeof value?.expiresAt==='string'?Date.parse(value.expiresAt):NaN;
 return value?.active===true&&Number.isFinite(expires)&&expires>Date.now()?{active:true,expiresAt:value.expiresAt}:inactive;
}
export default function useSubscription(){
 const [product,setProduct]=useState<SubscriptionProduct|null>(null),[entitlement,setEntitlement]=useState<Entitlement>(inactive),[checking,setChecking]=useState(subscriptionAvailable),[busy,setBusy]=useState(false),[error,setError]=useState(''),[priceError,setPriceError]=useState('');
 const [purchaseReady,setPurchaseReady]=useState(false);
 const readyRef=useRef(false);
 const markReady=useCallback((value:boolean)=>{readyRef.current=value;setPurchaseReady(value);},[]);
 const mounted=useRef(true),generation=useRef(0),priceGeneration=useRef(0),locked=useRef(false);
 const refresh=useCallback(async()=>{
  if(!subscriptionAvailable)return;
  const run=++generation.current,priceRun=++priceGeneration.current;
  markReady(false);setChecking(true);setError('');setPriceError('');
  // Offline access must not wait for a network request for the product price.
  // Apply a late verified native response even if the UI deadline has elapsed.
  // The generation guard still rejects responses superseded by refund or refresh events.
  const access=timely(currentEntitlement().then(value=>{
   if(!mounted.current||run!==generation.current)return;
   const state=verified(value);markReady(!state.active);setEntitlement(state);setChecking(false);setError('');return state;
  })).catch(()=>{
   if(mounted.current&&run===generation.current){markReady(false);setEntitlement(inactive);setChecking(false);setError('Abbonamento non verificabile. Riprova o ripristina gli acquisti.');}
  });
  // A price timeout is a UI deadline, not cancellation of the Apple request.
  // Apply its eventual response only while this refresh is still current.
  let priceReceived=false;
  const price=timely(getAnnualProduct().then(value=>{
   if(mounted.current&&priceRun===priceGeneration.current){priceReceived=true;setProduct(value);setPriceError('');}
  })).catch(()=>{
   if(mounted.current&&priceRun===priceGeneration.current&&!priceReceived){setProduct(null);setPriceError('Prezzo non disponibile. Verifica la connessione allo Store.');}
  });
  const [result]=await Promise.allSettled([access,price]);
  return run===generation.current&&result.status==='fulfilled'?result.value:undefined;
 },[markReady]);
 useEffect(()=>{
  mounted.current=true;
  if(!subscriptionAvailable){setChecking(false);return()=>{mounted.current=false;};}
  void refresh();
  const listener=observeEntitlement(value=>{
   if(!mounted.current)return;
   ++generation.current;const state=verified(value);markReady(!state.active);setEntitlement(state);setChecking(false);setError('');
  });
  const appState=AppState.addEventListener('change',state=>{
   if(state==='active'){setEntitlement(inactive);void refresh();}
  });
  return()=>{mounted.current=false;readyRef.current=false;++generation.current;++priceGeneration.current;listener.remove();appState.remove();};
 },[refresh,markReady]);
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
  // Trace only control flow, never Apple account identifiers or receipts.
  console.info('STOREKIT_UI purchase handler entered',JSON.stringify({supported:subscriptionAvailable,locked:locked.current,verifiedReady:readyRef.current}));
  if(!subscriptionAvailable||locked.current||!readyRef.current){console.info('STOREKIT_UI purchase blocked by guard');return;}
  console.info('STOREKIT_UI invoking native purchase');
  locked.current=true;markReady(false);++generation.current;setBusy(true);setError('');
  try{
   const result=await purchaseAnnual();
   if(!mounted.current)return;
   // Read current StoreKit state again: an earlier purchase response must not undo a later revocation event.
   const access=await refresh();
   if(mounted.current&&access&&!access.active&&result.status==='pending')setError(`Acquisto in attesa di approvazione ${account}. L’accesso si attiverà dopo la conferma.`);
  }catch{if(mounted.current){markReady(false);setEntitlement(inactive);setError(`Acquisto non completato. Verifica il tuo account ${account} e riprova.`);}}
  finally{locked.current=false;if(mounted.current)setBusy(false);}
 },[refresh,markReady]);
 const restore=useCallback(async()=>{
  if(!subscriptionAvailable||locked.current)return;
  locked.current=true;++generation.current;setBusy(true);setError('');
  try{await restoreAnnual();if(mounted.current){const state=await refresh();if(state&&!state.active)setError(`Nessun abbonamento attivo trovato per questo account ${account}.`);}}
  catch{if(mounted.current){markReady(false);setEntitlement(inactive);setError('Ripristino non riuscito. Verifica la connessione e riprova.');}}
  finally{locked.current=false;if(mounted.current)setBusy(false);}
 },[refresh,markReady]);
 return{product,purchaseReady,active:entitlement.active,expiresAt:entitlement.expiresAt,checking,busy,error:error||(!entitlement.active?priceError:''),supported:subscriptionAvailable,purchase,restore,refresh:async()=>{await refresh();}};
}
