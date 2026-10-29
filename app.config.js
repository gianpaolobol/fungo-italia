const {execFileSync}=require('node:child_process');
const config=require('./app.json').expo;
function git(...args){try{return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{return '';}}
module.exports=()=>{
 const sourceCommit=process.env.GITHUB_SHA||process.env.EAS_BUILD_GIT_COMMIT_HASH||git('rev-parse','HEAD');
 if(!/^[0-9a-f]{40}$/i.test(sourceCommit))throw new Error('Release source commit unavailable');
 const verified=process.env.FUNGO_VERIFIED_SOURCE;
 if(verified&&verified!==sourceCommit)throw new Error('Verified build source differs from current source');
 const dirty=verified===sourceCommit?false:!!git('status','--porcelain','--untracked-files=no');
 const betaUrl=process.env.FUNGO_BETA_SERVICE_URL;
 const iosBeta=process.env.FUNGO_IOS_MANAGED_BETA;
 if(iosBeta&&iosBeta!=='1')throw Error('Invalid iOS managed beta option');
 if(iosBeta==='1'&&!betaUrl)throw Error('iOS managed beta requires a verified service endpoint');
 let betaServiceUrl;
 if(betaUrl){const u=new URL(betaUrl);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('Invalid HTTPS beta service root');betaServiceUrl=u.href;}
 const stamped={...config,plugins:betaServiceUrl?[...(config.plugins||[]),'expo-secure-store']:config.plugins,extra:{...config.extra,...(betaServiceUrl?{betaServiceUrl}:{}),...(iosBeta==='1'?{betaIOS:true}:{}),release:{sourceCommit,version:config.version,dirty}}};
 const projectId=process.env.EXPO_PROJECT_ID;
 if(!projectId)return stamped;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId))throw new Error('EXPO_PROJECT_ID non valido');
 return {...stamped,slug:'fungo-italia-',extra:{...stamped.extra,eas:{projectId}},updates:{url:'https://u.expo.dev/'+projectId},runtimeVersion:{policy:'fingerprint'}};
};
