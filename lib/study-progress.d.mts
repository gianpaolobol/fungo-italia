export type Unit={id:string;taxonId:string;scope:'minimum'|'extended';dimension:string;applicable:boolean};
export type Evidence={unitId:string;taxonId:string;bankRevision:string;sessionId:string;at:string;firstAttempt:boolean;correct:boolean;hinted:boolean;mode:'training'|'simulation';critical:boolean;sessionComplete?:boolean};
export type Progress={score:number|null;A:number;C:number;R:number;E:number;confidence:'initial'|'supported';criticalOpen:number;covered:number;total:number;gaps:{unitId:string;taxonId:string;dimension:string;critical:boolean;errors:number;unseen:boolean}[];consolidated:boolean;algorithmVersion:number};
export const algorithmVersion:number;
export function computeProgress(input:{units:Unit[];evidence:Evidence[];bankRevision:string;now?:number}):{minimum:Progress;extended:Progress};
