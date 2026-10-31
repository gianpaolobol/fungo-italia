// API v1 read adapter for the future corrected app. No App.tsx imports, billing
// mutation, global localStorage, AsyncStorage, device identity or cached tokens.
export function createCourseClient({endpoint,publicKey,getSession,fetcher=fetch}) {
  const origin=new URL(endpoint);
  if(origin.protocol!=='https:'||!/^[-a-z0-9]+\.supabase\.co$/.test(origin.hostname)||
     origin.pathname!=='/'||origin.username||origin.password||origin.port||origin.search||origin.hash||
     !publicKey||typeof getSession!=='function')throw Error('invalid_course_client');
  async function request(path,body) {
    const session=await getSession();
    if(!session?.accessToken||!session.accountId||!session.sessionId)throw Error('sign_in_required');
    const {accountId,sessionId,accessToken}=session;
    const response=await fetcher(`${origin.origin}/rest/v1/${path}`,{
      method:body===undefined?'GET':'POST',
      headers:{apikey:publicKey,Authorization:`Bearer ${accessToken}`,'Accept-Profile':'pilot',
        ...(body===undefined?{}:{'Content-Profile':'pilot','Content-Type':'application/json'})},
      ...(body===undefined?{}:{body:JSON.stringify(body)}),
      redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000)
    });
    const current=await getSession();
    if(current?.accountId!==accountId||current?.sessionId!==sessionId)throw Error('session_changed');
    if(!response.ok)throw Error(response.status===401?'session_expired':'course_request_failed');
    const rows=response.status===204?null:await response.json();
    const afterBody=await getSession();
    if(afterBody?.accountId!==accountId||afterBody?.sessionId!==sessionId)throw Error('session_changed');
    return rows;
  }
  async function read(table,columns,filters={}) {
    const query=new URLSearchParams({select:columns.join(','),order:'created_at.asc,id.asc',limit:'100',...filters});
    const rows=await request(`${table}?${query}`);
    if(!Array.isArray(rows)||rows.length>100||rows.some(row=>!row||typeof row.id!=='string'||typeof row.title!=='string'))
      throw Error('invalid_course_response');
    // Return only the v1 contract's metadata; never raw unexpected server fields.
    return rows.map(row=>Object.fromEntries(columns.filter(k=>Object.hasOwn(row,k)).map(k=>[k,row[k]])));
  }
  const uuid=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
  function id(value){if(typeof value!=='string'||!uuid.test(value))throw Error('invalid_id');return value;}
  function title(value){if(typeof value!=='string'||!value.trim()||value.trim().length>160)throw Error('invalid_title');return value.trim();}
  async function rpc(name,body,kind='uuid'){
    const result=await request(`rpc/${name}`,body);
    if(kind==='uuid'){if(typeof result!=='string'||!uuid.test(result))throw Error('invalid_course_response');}
    if(kind==='void'&&result!==null)throw Error('invalid_course_response');
    return result;
  }
  return Object.freeze({apiVersion:1,
    listCourses:()=>read('courses',['id','title','created_at']),
    listMaterials:async(courseId)=>{
      if(!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(courseId))throw Error('invalid_course');
      return read('materials',['id','title','author','bytes','state','created_at'],{course_id:`eq.${courseId}`});
    },
    createCourse:async(value)=>rpc('create_course',{title:title(value)}),
    createGroup:async(courseId,value)=>rpc('create_group',{course_id:id(courseId),title:title(value)}),
    inviteStudents:async(courseId,groupIds,emails)=>{
      id(courseId);
      if(!Array.isArray(groupIds)||groupIds.length<1||groupIds.length>2)throw Error('invalid_groups');
      groupIds.forEach(id);
      if(!Array.isArray(emails)||emails.length<1||emails.length>30||emails.some(e=>typeof e!=='string'||e.length>254))throw Error('invalid_emails');
      const rows=await rpc('invite_students',{course_id:courseId,group_ids:groupIds,emails},'rows');
      if(!Array.isArray(rows)||rows.length>30||rows.some(r=>!r||!uuid.test(r.id)||typeof r.email!=='string'||typeof r.accepted!=='boolean'))throw Error('invalid_course_response');
      return rows.map(({id,email,accepted})=>({id,email,accepted}));
    },
    listInvitations:async()=>{
      const rows=await rpc('my_invitations',{},'rows');
      if(!Array.isArray(rows)||rows.length>30||rows.some(r=>!r||!uuid.test(r.id)||!uuid.test(r.course_id)||typeof r.title!=='string'||typeof r.expires_at!=='string'||!Array.isArray(r.groups)||r.groups.some(g=>typeof g!=='string')))throw Error('invalid_course_response');
      return rows.map(({id,course_id,title,expires_at,groups})=>({id,course_id,title,expires_at,groups}));
    },
    acceptInvitation:async(invitationId)=>rpc('accept_invitation',{invitation_id:id(invitationId)}),
    revokeInvitation:async(invitationId)=>rpc('revoke_invitation',{invitation_id:id(invitationId)},'void'),
    revokeMembership:async(membershipId)=>rpc('revoke_membership',{membership_id:id(membershipId)},'void'),
    resendInvitation:async(invitationId)=>rpc('request_invite_notice',{invitation_id:id(invitationId)})
  });
}
