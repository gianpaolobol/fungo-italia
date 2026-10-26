import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {authorizePairedDemo,validatePairedArtifact,assertPublisherDiff,preparePairedDemo,publicURL,authorizationDigest} from './paired-demo-policy.mjs';
import {verifyPublishedFiles} from './public-demo21.mjs';
import {verifyOwnerBetaScience} from '../scripts/internal-beta-science.mjs';
import {candidateReceipt} from '../scripts/consolidated-evidence.mjs';
import {preflightAudience,ownerGroup} from '../scripts/consolidated-beta-audience.mjs';
import {createAppleApi} from '../scripts/app-store-connect.mjs';
import {confirmBetaState} from '../scripts/release-parity.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
async function gh(path){
 assert.equal(process.env.GITHUB_REPOSITORY,'gianpaolobol/fungo-italia');
 const r=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+path,{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(45000)});
 assert(r.ok,'GitHub proof unavailable: '+r.status);return r.json();
}
export async function verifyLiveProofs(receipt,a,digest){
 authorizePairedDemo(receipt,a,digest);
 assert.equal((await gh('/git/ref/heads/main')).object.sha,process.env.GITHUB_SHA,'Orchestrator main advanced; refuse stale promotion');
 assertPublisherDiff(await gh('/compare/'+a.sourceCommit+'...'+process.env.GITHUB_SHA),a.sourceCommit);
 assert.deepEqual(await verifyOwnerBetaScience(a.sourceCommit),receipt.scientificReview,'Scientific snapshot or diagnostics changed');
 const runs=await Promise.all(['native','ui','demo'].map(k=>gh('/actions/runs/'+a.nativeProofRunIds[k])));
 assert.deepEqual(receipt.evidence,candidateReceipt({sha:a.sourceCommit,native:runs[0],ui:runs[1],demo:runs[2]}).evidence);
 const run=await gh('/actions/runs/'+a.candidateProducerRunId);
 assert(run.head_sha===a.sourceCommit&&run.head_branch==='main'&&run.event==='push'&&run.path==='.github/workflows/consolidated-testflight.yml'&&run.conclusion==='success','Original paired producer must have succeeded');
 const jobs=await gh('/actions/runs/'+a.candidateProducerRunId+'/jobs?per_page=100');
 assert(!jobs.links?.next&&jobs.total_count===jobs.jobs.length,'Complete original producer jobs required');
 for(const name of ['source','beta'])assert.equal(jobs.jobs.find(j=>j.name===name)?.conclusion,'success','Original '+name+' job must pass');
 const beta=jobs.jobs.find(j=>j.name==='beta');
 for(const step of ['Record signed binary provenance','Verify source inside the signed native app before upload','Revalidate owner review immediately before upload','Preflight existing beta audience before any upload','Confirm Apple processing and confirmed owner group','Confirm actual Apple internal beta availability'])assert.equal(beta.steps?.find(s=>s.name===step)?.conclusion,'success','Original binary proof missing: '+step);
 const api=await createAppleApi();await preflightAudience(api);
 const app=await api('/v1/apps/6821140326');assert(app.ok&&app.data?.attributes?.bundleId===receipt.bundleId,'Apple app identity changed');
 const build=await api('/v1/builds/'+receipt.appleBuildId+'?include=betaGroups,preReleaseVersion');
 assert(build.ok&&build.data?.id===receipt.appleBuildId&&build.data.attributes.version===receipt.buildNumber&&build.data.attributes.processingState==='VALID'&&build.data.attributes.expired===false,'Exact Apple build unavailable');
 assert(build.included?.some(v=>v.type==='preReleaseVersions'&&v.id===build.data.relationships.preReleaseVersion?.data?.id&&v.attributes.version===receipt.version),'Apple app version differs');
 const link=build.data.relationships.betaGroups,groups=link?.data;
 assert(Array.isArray(groups)&&groups.length===1&&groups[0].type==='betaGroups'&&groups[0].id===ownerGroup&&!link.links?.next&&(link.meta?.paging?.total===undefined||link.meta.paging.total===1),'Apple build audience changed');
 const individuals=await api('/v1/builds/'+receipt.appleBuildId+'/individualTesters?limit=200');
 assert(individuals.ok&&!individuals.links?.next&&Array.isArray(individuals.data)&&individuals.data.length===0,'Unexpected individual testers');
 const fresh=await confirmBetaState(receipt,api);
 assert.equal((await gh('/git/ref/heads/main')).object.sha,process.env.GITHUB_SHA,'Main advanced during live proof; refuse stale promotion');
 return {sourceCommit:a.sourceCommit,buildNumber:receipt.buildNumber,appleBuildId:receipt.appleBuildId,internalBuildState:fresh.internalBuildState,internalGroupIds:[ownerGroup],verifiedAt:fresh.betaStateVerifiedAt,ownerAuthorizationSha256:digest};
}
async function artifact(dir,receipt,a,digest){
 authorizePairedDemo(receipt,a,digest);
 assert.equal(resolve(dir),resolve('dist-ios'));assert(process.env.RUNNER_TEMP?.startsWith('/'));
 const endpoint='/actions/artifacts/'+a.candidateArtifactId,m=await gh(endpoint);validatePairedArtifact(m,a);
 const r=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+endpoint+'/zip',{headers:{Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(300000)});
 assert(r.ok,'Original ZIP unavailable');const bytes=Buffer.from(await r.arrayBuffer());
 assert(bytes.length===m.size_in_bytes&&hash(bytes)===a.candidateArtifactSha256,'Original ZIP byte digest differs');
 const archive=join(process.env.RUNNER_TEMP,'paired-demo-original.zip');await writeFile(archive,bytes,{mode:0o600});
 const paths=execFileSync('unzip',['-Z1',archive],{encoding:'utf8',maxBuffer:10*1024*1024}).trimEnd().split('\n');
 assert(paths.every(p=>p&&!/[\\:%?#\x00-\x1f]/.test(p)&&p.replace(/\/$/,'').split('/').every(s=>s&&s!=='.'&&s!=='..')),'Unsafe ZIP path');
 assert(!/^l/m.test(execFileSync('zipinfo',['-l',archive],{encoding:'utf8',maxBuffer:10*1024*1024})),'ZIP symlinks forbidden');
 await mkdir(dir,{recursive:true});assert.equal((await readdir(dir)).length,0,'Candidate directory must be empty');
 execFileSync('unzip',['-q',archive,'-d',resolve(dir)],{stdio:'inherit'});
 await preparePairedDemo({dir,receipt,authorization:a,expectedDigest:digest,iconPath:resolve('assets/icon.png')});
}
async function main(){
 const [command]=process.argv.slice(2),source=process.env.PAIRED_SOURCE,digest=process.env.PUBLIC_AUTHORIZATION_SHA256;
 assert(/^[a-f0-9]{40}$/.test(source??''),'Exact paired source required');
 const a=await json('revisione/public-demo-authorizations/'+source+'.json');
 assert.equal(authorizationDigest(a),digest,'Authorization content changed');
 const receipt=await json(join(process.env.RUNNER_TEMP,'paired-beta-evidence/consolidated-testflight.json')),dir='dist-ios';
 if(command==='artifact'){await artifact(dir,receipt,a,digest);return;}
 assert(['promote','published'].includes(command),'Usage: paired-demo.mjs artifact|promote|published');
 const release=await preparePairedDemo({dir,receipt,authorization:a,expectedDigest:digest,iconPath:resolve('assets/icon.png')});
 const proof=await verifyLiveProofs(receipt,a,digest);
 await writeFile(join(process.env.RUNNER_TEMP,'paired-demo-native-proof.json'),JSON.stringify(proof,null,2)+'\n');
 if(command==='promote'){await writeFile(join(dir,'release.json'),JSON.stringify(release,null,2)+'\n');return;}
 const report=await verifyPublishedFiles({baseURL:publicURL,dir,release});
 await writeFile(join(process.env.RUNNER_TEMP,'paired-demo-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PAIRED_PUBLIC_DEMO_VERIFIED '+JSON.stringify(report));
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await main();
