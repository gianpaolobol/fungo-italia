export function checkedStudyAccess(value,now=Date.now()){
 if(value?.annualActive===false&&value.annualExpiresAt===undefined)value={...value,annualExpiresAt:null};
 if(!value||typeof value.baseOwned!=='boolean'||typeof value.annualActive!=='boolean'||typeof value.checkedAt!=='string'||!Number.isFinite(Date.parse(value.checkedAt))||!(value.annualExpiresAt===null||typeof value.annualExpiresAt==='string'&&Number.isFinite(Date.parse(value.annualExpiresAt))))throw Error('Diritti App Store non validi');
 return {...value,annualActive:value.annualActive&&value.annualExpiresAt!==null&&Date.parse(value.annualExpiresAt)>now};
}
export function deriveAccess(state,now=Date.now()){const annual=state?.annualActive===true&&Number.isFinite(Date.parse(state.annualExpiresAt))&&Date.parse(state.annualExpiresAt)>now;return {minimum:state?.baseOwned===true||annual,extended:annual,unlimitedTests:annual};}
export function canPurchaseAnnual(state){return state?.baseOwned===true&&state?.annualActive!==true;}
