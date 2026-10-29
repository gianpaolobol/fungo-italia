export function betaEndpoint(platform,extra){
 if(platform!=='android'&&!(platform==='ios'&&extra?.betaIOS===true))return null;
 try{const u=new URL(extra?.betaServiceUrl);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'?u.origin:null;}catch{return null;}
}
export function resolveAccess(platform,subscriptionActive,betaActive,iosBetaConfigured=false){
 if(subscriptionActive===true)return{full:true,kind:'subscription'};
 if((platform==='android'||(platform==='ios'&&iosBetaConfigured===true))&&betaActive===true)return{full:true,kind:'beta'};
 return{full:false,kind:'demo'};
}
