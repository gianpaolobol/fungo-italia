export const ANNUAL_ID='it.fungoitalia.premium.annual';
export type VerifiedAccess={active:boolean;productId:string;expiresAt:string|null;checkedAt:string};
export function checkedAccess(value:unknown,now=Date.now()):VerifiedAccess{
 const v=value as VerifiedAccess;
 if(!v||typeof v.active!=='boolean'||v.productId!==ANNUAL_ID||!Number.isFinite(Date.parse(v.checkedAt))||(v.expiresAt!==null&&!Number.isFinite(Date.parse(v.expiresAt))))throw new Error('Risposta di verifica App Store non valida.');
 return {...v,active:v.active&&v.expiresAt!==null&&Date.parse(v.expiresAt)>now};
}
export function expiryDelay(expiry:string,now=Date.now()):number{
 const end=Date.parse(expiry);if(!Number.isFinite(end))return 0;
 return Math.max(0,Math.min(end-now,2147483647));
}
