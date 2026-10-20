// Version-only normalization for reusing the isolated hosted native test evidence.
// Dependencies, bundle identity, all native code, test code and execution settings stay exact.
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const version=v=>{if(!['1.0.0','1.1.0'].includes(v))throw Error('Unexpected evidence marketing version');};
export function normalizeNativeInput(path,text){
 if(['app.json','package.json','package-lock.json'].includes(path)){
  const data=JSON.parse(text);
  if(path==='app.json'){version(data.expo.version);delete data.expo.version;}
  else {version(data.version);delete data.version;if(path==='package-lock.json'){version(data.packages[''].version);delete data.packages[''].version;}}
  return JSON.stringify(stable(data));
 }
 if(path==='.github/workflows/subscription-storekit-tests.yml'){
  const match=text.match(/^on:\n[\s\S]*?(?=^permissions:)/m);
  if(!match)throw Error('Unexpected native workflow shape');
  return text.replace(match[0],'');
 }
 return text;
}
