export type BetaState={active:boolean;checking:boolean;busy:boolean;expiresAt:string|null;error:string};
export type BetaController={state():BetaState;start():Promise<void>;redeem(token:string):Promise<void>;refresh():Promise<void>;background():void;foreground():Promise<void>;logout():Promise<void>;stop():void};
export function createBetaController(options:{enabled:boolean;request:(path:string,body:object,token:string|null)=>Promise<unknown>;storage:{get():Promise<string|null>;set(token:string):Promise<void>;clear():Promise<void>};onChange?:()=>void}):BetaController;
export function inviteTokenFromUrl(url:string):string|null;
