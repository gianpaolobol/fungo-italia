import {requireOptionalNativeModule} from 'expo';
import {checkedAccess} from '../../lib/subscriptionPolicy';
export const ANNUAL_PRODUCT_ID='it.fungoitalia.premium.annual';
export type Entitlement={active:boolean;productId:string;expiresAt:string|null;checkedAt:string};
export type AnnualProduct={id:string;displayName:string;description:string;localizedPrice:string;subscriptionPeriod:{unit:'year';value:1}};
export type PurchaseResult={status:'purchased'|'pending'|'cancelled';entitlement:Entitlement};
type SubscriptionListener={remove():void};
type NativeAPI={
 product():Promise<AnnualProduct>;currentEntitlement():Promise<Entitlement>;purchase():Promise<PurchaseResult>;restore():Promise<Entitlement>;
 addListener(event:'entitlementChanged',listener:(value:Entitlement)=>void):SubscriptionListener;
};
const native=requireOptionalNativeModule<NativeAPI>('FungoSubscription');
export const subscriptionAvailable=native!==null;
function module():NativeAPI{
 if(!native)throw new Error('Gli abbonamenti richiedono la versione iOS di Fungo Italia installata da App Store o TestFlight.');
 return native;
}
const checked=checkedAccess;
export async function getAnnualProduct():Promise<AnnualProduct>{
 const p=await module().product();
 if(p.id!==ANNUAL_PRODUCT_ID||typeof p.localizedPrice!=='string'||!p.localizedPrice.trim()||p.subscriptionPeriod?.unit!=='year'||p.subscriptionPeriod?.value!==1)throw new Error('Abbonamento annuale non disponibile.');
 return p;
}
export async function currentEntitlement():Promise<Entitlement>{return checked(await module().currentEntitlement());}
export async function purchaseAnnual():Promise<PurchaseResult>{const r=await module().purchase();if(!['purchased','pending','cancelled'].includes(r.status))throw new Error('Risposta acquisto non valida.');return {...r,entitlement:checked(r.entitlement)};}
export async function restoreAnnual():Promise<Entitlement>{return checked(await module().restore());}
export function observeEntitlement(listener:(state:Entitlement)=>void):SubscriptionListener{
 return module().addListener('entitlementChanged',value=>{try{listener(checked(value));}catch{listener({active:false,productId:ANNUAL_PRODUCT_ID,expiresAt:null,checkedAt:new Date().toISOString()});}});
}
