import {ownerGroup,preflightAudience} from './consolidated-beta-audience.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createAppleApi} from './app-store-connect.mjs';
const receipt=JSON.parse(await readFile(process.env.RUNNER_TEMP+'/consolidated-build.json','utf8'));
if(receipt.appId!=='6821140326'||receipt.version!=='1.1.0'||receipt.testFlightOnly!==true)throw Error('Unexpected beta identity');
let api=await createAppleApi(),build;
for(let attempt=0;attempt<45;attempt++){
 if(attempt===25)api=await createAppleApi();
 const r=await api('/v1/builds?filter[app]=6821140326&filter[version]='+encodeURIComponent(receipt.buildNumber)+'&include=preReleaseVersion&limit=10');
 if(!r.ok)throw Error('Apple build lookup failed '+r.status+' '+r.codes.join(','));
 build=r.data.find(b=>r.included?.some(v=>v.type==='preReleaseVersions'&&v.id===b.relationships.preReleaseVersion?.data?.id&&v.attributes.version===receipt.version));
 if(build?.attributes.processingState==='VALID')break;
 if(build&&['FAILED','INVALID'].includes(build.attributes.processingState))throw Error('Apple rejected beta processing: '+build.attributes.processingState);
 if(attempt===44)throw Error('Apple processing not confirmed yet');
 console.log('Waiting for Apple processing of '+receipt.version+' ('+receipt.buildNumber+')');
 await new Promise(resolve=>setTimeout(resolve,20000));
}
if(build.attributes.usesNonExemptEncryption==null){
 const r=await api('/v1/builds/'+build.id,{method:'PATCH',body:{data:{type:'builds',id:build.id,attributes:{usesNonExemptEncryption:false}}}});
 if(!r.ok)throw Error('Export compliance confirmation failed '+r.status);
}
const groups=await preflightAudience(api);
if(!groups.ok||groups.links?.next)throw Error('Complete internal group list unavailable');
const internal=groups.data.filter(g=>g.id===ownerGroup&&g.attributes.isInternalGroup);
if(internal.length!==1)throw Error('Confirmed owner beta group missing; refusing broader audience');
for(const group of internal){
 const current=await api('/v1/betaGroups/'+group.id+'/builds?limit=200');
 if(!current.ok)throw Error('Internal beta group lookup failed');
 if(!current.data.some(b=>b.id===build.id)){
  const r=await api('/v1/betaGroups/'+group.id+'/relationships/builds',{method:'POST',body:{data:[{type:'builds',id:build.id}]}});
  if(!r.ok)throw Error('Internal beta assignment failed '+r.status+' '+r.codes.join(','));
 }
}
const assigned=await api('/v1/builds/'+build.id+'/betaGroups?limit=200'),individual=await api('/v1/builds/'+build.id+'/individualTesters?limit=200');
if(!assigned.ok||assigned.links?.next||assigned.data.length!==1||assigned.data[0].id!==ownerGroup)throw Error('Actual Apple beta groups differ from owner-only selection');
if(!individual.ok||individual.links?.next||individual.data.length!==0)throw Error('Unexpected individual beta assignments');
const versions=await api('/v1/apps/6821140326/appStoreVersions?filter[platform]=IOS&limit=20');
if(!versions.ok)throw Error('App Store review status lookup failed');
const report={...receipt,appleBuildId:build.id,processingState:build.attributes.processingState,internalGroupIds:assigned.data.map(g=>g.id),appStoreVersions:versions.data.map(v=>({version:v.attributes.versionString,state:v.attributes.appStoreState})),verifiedAt:new Date().toISOString()};
await mkdir('store-evidence',{recursive:true});await writeFile('store-evidence/consolidated-testflight.json',JSON.stringify(report,null,2)+'\n');
console.log('CONSOLIDATED_TESTFLIGHT_CONFIRMED '+JSON.stringify(report));
