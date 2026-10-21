const {execFileSync}=require('node:child_process');
const config=require('./app.json').expo;
function git(...args){try{return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{return '';}}
module.exports=()=>{
 const sourceCommit=process.env.GITHUB_SHA||git('rev-parse','HEAD');
 if(!/^[0-9a-f]{40}$/i.test(sourceCommit))throw new Error('Release source commit unavailable');
 const dirty=!!git('status','--porcelain','--untracked-files=no');
 const stamped={...config,extra:{...config.extra,release:{sourceCommit,version:config.version,dirty}}};
 const projectId=process.env.EXPO_PROJECT_ID;
 if(!projectId)return stamped;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId))throw new Error('EXPO_PROJECT_ID non valido');
 return {...stamped,slug:'fungo-italia-',extra:{...stamped.extra,eas:{projectId}},updates:{url:'https://u.expo.dev/'+projectId},runtimeVersion:{policy:'fingerprint'}};
};
