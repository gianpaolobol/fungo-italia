import {checkedStudyAccess, type AccessState} from '../../lib/study-access.mjs';
import {requireOptionalNativeModule} from 'expo';
import {checkedAccess} from '../../lib/subscriptionPolicy';
export const ANNUAL_PRODUCT_ID='it.fungoitalia.premium.annual';
export type Entitlement={active:boolean;productId:string;expiresAt:string|null;checkedAt:string};
export type AnnualProduct={id:string;displayName:string;description:string;localizedPrice:string;subscriptionPeriod:{unit:'year';value:1}};
export type PurchaseResult={status:'purchased'|'pending'|'cancelled';entitlement:Entitlement};
type SubscriptionListener={remove():void};
type NativeAPI={
 product():Promise<AnnualProduct>;currentEntitlement():Promise<Entitlement>;purchase():Promise<PurchaseResult>;restore():Promise<Entitlement>;
 baseProduct():Promise<{id:string;displayName:string;localizedPrice:string}>;currentAccess():Promise<AccessState>;purchaseBase():Promise<{status:'purchased'|'pending'|'cancelled';access:AccessState}>;restoreAccess():Promise<AccessState>;
 addListener(event:'accessChanged',listener:(value:AccessState)=>void):SubscriptionListener;
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

export const BASE_PRODUCT_ID='it.fungoitalia.base.lifetime';
export async function getBaseProduct(){const p=await module().baseProduct();if(p.id!==BASE_PRODUCT_ID||!p.localizedPrice?.trim())throw Error('Base non disponibile');return p;}
export async function currentAccess(){return checkedStudyAccess(await module().currentAccess());}
export async function purchaseBase(){const r=await module().purchaseBase();if(!['purchased','pending','cancelled'].includes(r.status))throw Error('Risposta acquisto non valida');return {...r,access:checkedStudyAccess(r.access)};}
export async function restoreAccess(){return checkedStudyAccess(await module().restoreAccess());}
export function observeAccess(listener:(v:AccessState)=>void){return module().addListener('accessChanged',v=>{try{listener(checkedStudyAccess(v));}catch{listener({baseOwned:false,annualActive:false,annualExpiresAt:null,checkedAt:new Date().toISOString()});}});}
