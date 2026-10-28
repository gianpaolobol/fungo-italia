export function resolveAccess(platform,subscriptionActive,betaActive){
 if(subscriptionActive===true)return{full:true,kind:'subscription'};
 if(platform==='android'&&betaActive===true)return{full:true,kind:'beta'};
 return{full:false,kind:'demo'};
}
