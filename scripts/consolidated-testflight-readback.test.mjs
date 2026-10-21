import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const verifier=new URL('./verify-consolidated-testflight.mjs',import.meta.url).href;
const owner='f642807c-e4b2-43d4-a32a-d9fd087fdfe3';
async function runReadback(scenario='owner'){
 const dir=await mkdtemp(join(tmpdir(),'fungo-beta-readback-'));
 try{
  await writeFile(join(dir,'consolidated-build.json'),JSON.stringify({appId:'6821140326',version:'1.1.0',buildNumber:'14',testFlightOnly:true,sourceCommit:'38a7a85ac96803a5dca18bf5c6a39264bcc99444'}));
  const program=`
   import {generateKeyPairSync} from 'node:crypto';
   const owner=${JSON.stringify(owner)},scenario=${JSON.stringify(scenario)};
   const privateKey=generateKeyPairSync('ec',{namedCurve:'P-256'}).privateKey.export({type:'pkcs8',format:'pem'});
   const reply=(data,status=200)=>new Response(JSON.stringify(data),{status});
   globalThis.fetch=async (input,options={})=>{
    const url=new URL(input);
    if(url.origin==='https://api.expo.dev'){
     const {query}=JSON.parse(options.body);
     return reply({data:query.includes('appStoreConnectApiKeysPaginated')?{account:{byName:{appStoreConnectApiKeysPaginated:{edges:[{node:{id:'test-key',keyIdentifier:'35MS8YN74G',appleTeam:{appleTeamIdentifier:'BX9MDXAHKG'}}}]}}}}:{appStoreConnectApiKey:{byId:{keyIdentifier:'35MS8YN74G',issuerIdentifier:'00000000-0000-0000-0000-000000000000',keyP8:privateKey}}}});
    }
    if(url.origin!=='https://api.appstoreconnect.apple.com')throw Error('Unexpected network destination');
    const path=url.pathname;
    if(path==='/v1/builds')return reply({data:[{type:'builds',id:'current-build',attributes:{version:'14',processingState:'VALID',usesNonExemptEncryption:false},relationships:{preReleaseVersion:{data:{type:'preReleaseVersions',id:'v11'}}}}],included:[{type:'preReleaseVersions',id:'v11',attributes:{version:'1.1.0'}}]});
    if(path==='/v1/apps/6821140326/betaGroups')return reply({data:[{type:'betaGroups',id:owner,attributes:{isInternalGroup:true,hasAccessToAllBuilds:false}}]});
    if(path==='/v1/betaGroups/'+owner+'/betaTesters')return reply({data:[{id:'52fcf5f3-a3a1-42ea-93b7-869f8ef850a6',attributes:{email:'owner@example.test'}}]});
    if(path==='/v1/users')return reply({data:[{id:'5698d1b1-d3be-4031-b11c-2d82203f274c',attributes:{username:'owner@example.test',roles:['ACCOUNT_HOLDER']}}]});
    if(path==='/v1/betaGroups/'+owner+'/builds')return reply({data:[{type:'builds',id:'current-build'}]});
    // Observed Apple response: this related-resource GET is unsupported.
    if(path==='/v1/builds/current-build/betaGroups')return reply({errors:[{code:'FORBIDDEN_ERROR'}]},403);
    if(path==='/v1/builds/current-build'){
     if(url.searchParams.get('include')!=='betaGroups')throw Error('Actual group linkage must be requested');
     const ids=[{type:'betaGroups',id:owner}];
     if(scenario==='extra-group')ids.push({type:'betaGroups',id:'external'});
     if(scenario==='wrong-type')ids[0].type='betaTesters';
     const relation={data:ids,meta:{paging:{total:scenario==='truncated'?2:ids.length}}};
     if(scenario==='paged')relation.links={next:'https://api.appstoreconnect.apple.com/next'};
     return reply({data:{type:'builds',id:scenario==='wrong-build'?'other':'current-build',relationships:scenario==='missing'?{}:{betaGroups:relation}}});
    }
    if(path==='/v1/builds/current-build/individualTesters')return reply({data:scenario==='individual'?[{id:'unexpected'}]:[]});
    if(path==='/v1/apps/6821140326/appStoreVersions')return reply({data:[{attributes:{versionString:'1.0',appStoreState:'REJECTED'}}]});
    throw Error('Unexpected Apple request '+path);
   };
   await import(${JSON.stringify(verifier)});
  `;
  const result=spawnSync(process.execPath,['--input-type=module','-e',program],{cwd:dir,encoding:'utf8',timeout:15000,env:{...process.env,RUNNER_TEMP:dir,EXPO_TOKEN:'test-only-no-network'}});
  let report;try{report=JSON.parse(await readFile(join(dir,'store-evidence/consolidated-testflight.json'),'utf8'));}catch{}
  return {status:result.status,error:result.stderr,report};
 }finally{await rm(dir,{recursive:true,force:true});}
}
test('signed candidate readback accepts actual owner linkage through Apple build information',async()=>{
 const r=await runReadback();assert.equal(r.status,0,r.error);assert.deepEqual(r.report.internalGroupIds,[owner]);assert.equal(r.report.appleBuildId,'current-build');
});
test('readback refuses broader, incomplete or mismatched actual beta assignments',async()=>{
 for(const scenario of ['extra-group','missing','paged','truncated','wrong-build','wrong-type','individual']){
  const r=await runReadback(scenario);assert.notEqual(r.status,0,scenario);assert.equal(r.report,undefined,scenario);
 }
});
