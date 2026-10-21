import {createAppleApi} from './app-store-connect.mjs';
export const ownerGroup='f642807c-e4b2-43d4-a32a-d9fd087fdfe3';
export function validateAudience({groups,members,users}) {
 for(const r of [groups,members,users])if(!r?.ok||!Array.isArray(r.data)||r.links?.next)throw Error('Incomplete beta audience proof');
 const owner=groups.data.find(g=>g.id===ownerGroup&&g.attributes?.isInternalGroup===true);
 if(!owner)throw Error('Confirmed internal owner group missing');
 if(groups.data.some(g=>g.id!==ownerGroup&&g.attributes?.hasAccessToAllBuilds===true))throw Error('Another beta group automatically accesses new builds');
 if(members.data.length!==1||members.data[0].id!=='52fcf5f3-a3a1-42ea-93b7-869f8ef850a6')throw Error('Owner tester membership changed');
 const account=users.data.find(u=>u.id==='5698d1b1-d3be-4031-b11c-2d82203f274c');
 const email=String(members.data[0].attributes?.email||'').trim().toLowerCase();
 if(!email||String(account?.attributes?.username||'').trim().toLowerCase()!==email||!account?.attributes?.roles?.includes('ACCOUNT_HOLDER'))throw Error('Tester no longer matches confirmed account holder');
 return ownerGroup;
}
export async function preflightAudience(api){
 const [groups,members,users]=await Promise.all([api('/v1/apps/6821140326/betaGroups?limit=200'),api('/v1/betaGroups/'+ownerGroup+'/betaTesters?limit=200'),api('/v1/users?limit=200')]);
 validateAudience({groups,members,users});console.log('Confirmed existing owner-only beta audience; no invitations sent');return groups;
}
if(process.argv[1]?.endsWith('/consolidated-beta-audience.mjs'))await preflightAudience(await createAppleApi());
