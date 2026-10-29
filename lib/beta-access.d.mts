export function betaEndpoint(platform:string,extra:unknown):string|null;
export function resolveAccess(platform:string,subscriptionActive:boolean,betaActive:boolean,managedBetaConfigured?:boolean):{full:boolean;kind:'subscription'|'beta'|'demo'};
