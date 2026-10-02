const config=require('./app.json').expo;
module.exports=()=>{
 const projectId=process.env.EXPO_PROJECT_ID;
 if(!projectId)return config;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId))throw new Error('EXPO_PROJECT_ID non valido');
 return {...config,extra:{...config.extra,eas:{projectId}},updates:{url:'https://u.expo.dev/'+projectId,requestHeaders:{'expo-channel-name':'preview'}},runtimeVersion:{policy:'fingerprint'}};
};
