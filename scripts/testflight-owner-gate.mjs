const appId='6821140326',buildId='f15030a5-6079-4077-a09c-369431bd3547',groupId='f642807c-e4b2-43d4-a32a-d9fd087fdfe3';
export function validateOwnerAssignment({app,build,detail,group,members,users}){
 const require=(condition,message)=>{if(!condition)throw Error(message);};
 require(app?.id===appId&&app.attributes?.bundleId==='it.fungoitalia.app','Unexpected app');
 require(build?.id===buildId&&build.attributes?.version==='11'&&build.attributes.processingState==='VALID'&&build.attributes.expired===false,'Unexpected or unprocessed diagnostic binary');
 require(build.relationships?.app?.data?.id===appId,'Build app identity is unverified');
 require(['READY_FOR_BETA_TESTING','IN_BETA_TESTING'].includes(detail?.internalBuildState),'Build not ready for internal testing');
 require(group?.id===groupId&&group.attributes?.name==='Proprietario — prova iPhone'&&group.attributes.isInternalGroup===true&&group.relationships?.app?.data?.id===appId,'Unexpected owner group');
 require(Array.isArray(members?.data)&&members.data.length===1&&!members.links?.next,'Owner group audience is ambiguous');
 const member=members.data[0];
 require(member.id==='52fcf5f3-a3a1-42ea-93b7-869f8ef850a6','Unexpected internal tester');
 require(Array.isArray(users?.data)&&!users.links?.next,'Account roster is incomplete');
 const account=users.data.find(u=>u.id==='5698d1b1-d3be-4031-b11c-2d82203f274c');
 const email=String(member.attributes?.email||'').trim().toLowerCase();
 require(email.length>0&&String(account?.attributes?.username||'').trim().toLowerCase()===email&&account?.attributes?.roles?.includes('ACCOUNT_HOLDER'),'Tester is not the confirmed account holder');
 return {appId,buildId,groupId};
}
