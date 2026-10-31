// API v1 read adapter for the future corrected app. No App.tsx imports, billing
// mutation, global localStorage, AsyncStorage, device identity or cached tokens.
export function createCourseClient({endpoint,publicKey,getSession,fetcher=fetch}) {
  const origin=new URL(endpoint);
  if(origin.protocol!=='https:'||!/^[-a-z0-9]+\.supabase\.co$/.test(origin.hostname)||
     origin.pathname!=='/'||origin.username||origin.password||origin.port||origin.search||origin.hash||
     !publicKey||typeof getSession!=='function')throw Error('invalid_course_client');
  async function read(table,columns,filters={}) {
    const session=await getSession();
    if(!session?.accessToken||!session.accountId||!session.sessionId)throw Error('sign_in_required');
    const {accountId,sessionId,accessToken}=session;
    const query=new URLSearchParams({select:columns.join(','),order:'created_at.asc,id.asc',limit:'100',...filters});
    const response=await fetcher(`${origin.origin}/rest/v1/${table}?${query}`,{
      headers:{apikey:publicKey,Authorization:`Bearer ${accessToken}`,'Accept-Profile':'pilot'},
      redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000)
    });
    const current=await getSession();
    if(current?.accountId!==accountId||current?.sessionId!==sessionId)throw Error('session_changed');
    if(!response.ok)throw Error(response.status===401?'session_expired':'course_request_failed');
    const rows=await response.json();
    const afterBody=await getSession();
    if(afterBody?.accountId!==accountId||afterBody?.sessionId!==sessionId)throw Error('session_changed');
    if(!Array.isArray(rows)||rows.length>100||rows.some(row=>!row||typeof row.id!=='string'||typeof row.title!=='string'))
      throw Error('invalid_course_response');
    // Return only the v1 contract's metadata; never raw unexpected server fields.
    return rows.map(row=>Object.fromEntries(columns.filter(k=>Object.hasOwn(row,k)).map(k=>[k,row[k]])));
  }
  return Object.freeze({apiVersion:1,
    listCourses:()=>read('courses',['id','title','created_at']),
    listMaterials:async(courseId)=>{
      if(!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(courseId))throw Error('invalid_course');
      return read('materials',['id','title','author','bytes','state','created_at'],{course_id:`eq.${courseId}`});
    }
  });
}
