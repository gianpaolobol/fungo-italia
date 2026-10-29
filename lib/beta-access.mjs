export function betaEndpoint(platform,extra){
 if(platform!=='android'&&!(platform==='ios'&&extra?.betaIOS===true))return null;
 try{const u=new URL(extra?.betaServiceUrl);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'?u.origin:null;}catch{return null;}
}
export function resolveAccess(platform,subscriptionActive,betaActive,managedBetaConfigured=false){
 // Managed tester builds require a server-verified invitation, even when
 // StoreKit or Play reports an active subscription from an earlier install.
 if((platform==='ios'||platform==='android')&&managedBetaConfigured===true)return betaActive===true?{full:true,kind:'beta'}:{full:false,kind:'demo'};
 if(subscriptionActive===true)return{full:true,kind:'subscription'};
 if(platform==='android'&&betaActive===true)return{full:true,kind:'beta'};
 return{full:false,kind:'demo'};
}
