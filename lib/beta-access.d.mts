export function betaEndpoint(platform:string,extra:unknown):string|null;
export function resolveAccess(platform:string,subscriptionActive:boolean,betaActive:boolean,iosBetaConfigured?:boolean):{full:boolean;kind:'subscription'|'beta'|'demo'};
