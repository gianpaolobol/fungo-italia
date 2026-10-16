import {createAppleApi} from './app-store-connect.mjs';
const api=await createAppleApi(),APP='6821140326';
const must=(r,label)=>{if(!r.ok)throw Error(label+' '+r.status+' '+JSON.stringify({codes:r.codes,details:r.details,sources:r.sources}));return r;};
let groups=must(await api('/v1/apps/'+APP+'/subscriptionGroups'),'groups').data;
let group=groups.find(g=>g.attributes.referenceName==='Fungo Italia Premium');
if(!group)group=must(await api('/v1/subscriptionGroups',{method:'POST',body:{data:{type:'subscriptionGroups',attributes:{referenceName:'Fungo Italia Premium'},relationships:{app:{data:{type:'apps',id:APP}}}}}}),'create group').data;
let subscriptions=must(await api('/v1/subscriptionGroups/'+group.id+'/subscriptions'),'subscriptions').data;
let subscription=subscriptions.find(s=>s.attributes.productId==='it.fungoitalia.premium.annual');
if(!subscription)subscription=must(await api('/v1/subscriptions',{method:'POST',body:{data:{type:'subscriptions',attributes:{name:'Fungo Italia annuale',productId:'it.fungoitalia.premium.annual',subscriptionPeriod:'ONE_YEAR',groupLevel:1,familySharable:false,reviewNote:'Annual access to the complete mycology atlas and photographic exercises. Free preview: five study profiles and area browsing. StoreKit 2 purchase, restore and verified entitlements. No free trial.'},relationships:{group:{data:{type:'subscriptionGroups',id:group.id}}}}}}),'create subscription').data;
console.log('ANNUAL_SETUP '+JSON.stringify({group,subscription}));
for(const [label,path]of Object.entries({groupLocalizations:'/v1/subscriptionGroups/'+group.id+'/subscriptionGroupLocalizations',localizations:'/v1/subscriptions/'+subscription.id+'/subscriptionLocalizations',prices:'/v1/subscriptions/'+subscription.id+'/prices?include=subscriptionPricePoint,territory&limit=200',points:'/v1/subscriptions/'+subscription.id+'/pricePoints?filter[territory]=ITA&include=territory&limit=200',availability:'/v1/subscriptions/'+subscription.id+'/subscriptionAvailability'})){
const r=await api(path);console.log('ANNUAL_PROBE '+JSON.stringify({label,result:r}));}
