export type AccessState={baseOwned:boolean;annualActive:boolean;annualExpiresAt:string|null;checkedAt:string};
export function checkedStudyAccess(value:unknown,now?:number):AccessState;
export function deriveAccess(state:AccessState,now?:number):{minimum:boolean;extended:boolean;unlimitedTests:boolean};
