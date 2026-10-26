import {createHash} from 'node:crypto';
import {validateCandidate} from '../scripts/release-parity.mjs';
import {validateRelease} from '../lib/release-alignment.mjs';
import {assertOwnerScienceReceipt} from '../scripts/internal-beta-science.mjs';
import {ownerGroup} from '../scripts/consolidated-beta-audience.mjs';
export const publicURL='https://gianpaolobol.github.io/fungo-italia/';
const sha=/^[a-f0-9]{40}$/,hex=/^[a-f0-9]{64}$/;
const requireThat=(ok,message)=>{if(!ok)throw Error(message);};
export const authorizationDigest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function authorizePairedDemo(receipt,a,expectedDigest){
 requireThat(hex.test(expectedDigest??'')&&a&&authorizationDigest(a)===expectedDigest,'Explicit exact public authorization digest required');
 requireThat(a.schemaVersion===1&&a.type==='owner-distribution-authorization'&&a.scope==='public-demo-beta'&&a.status==='approved'&&a.owner?.role==='owner'&&a.owner.name==='Gian Paolo Franceschini','Distinct approved owner public demo authorization required');
 requireThat(typeof a.confirmation==='string'&&a.confirmation.trim().length>0&&typeof a.approvedAt==='string'&&Number.isFinite(Date.parse(a.approvedAt)),'Actual owner confirmation and approval date required');
 requireThat(a.publicURL===publicURL&&a.certified===false&&a.independentReviewComplete===false&&a.appStoreReady===false&&a.externalTestFlightAllowed===false,'Public demo cannot authorize certification, App Store or broader TestFlight');
 requireThat(sha.test(a.sourceCommit??'')&&hex.test(a.candidateArtifactSha256??'')&&Number.isSafeInteger(a.candidateArtifactId)&&a.candidateArtifactId>0&&Number.isSafeInteger(a.candidateProducerRunId)&&a.candidateProducerRunId>0,'Immutable source and original artifact identity required');
 for(const key of ['sourceCommit','version','buildNumber','webContentHash','iconSha256','ipaSha256','appleBuildId'])requireThat(receipt?.[key]===a[key],'Authorized native identity differs: '+key);
 requireThat(receipt.appId==='6821140326'&&receipt.bundleId==='it.fungoitalia.app'&&receipt.testFlightOnly===true&&receipt.diagnosticOnly===true&&receipt.appStoreReady===false,'Unexpected native release scope');
 requireThat(receipt.producerRunId===String(a.candidateProducerRunId),'Signed IPA producer differs');
 requireThat(receipt.internalGroupIds?.length===1&&receipt.internalGroupIds[0]===ownerGroup,'Owner-only native group required');
 requireThat(receipt.processingState==='VALID'&&receipt.internalBuildState==='IN_BETA_TESTING'&&validateRelease({schemaVersion:1,...receipt}),'Actual Apple beta availability required');
 requireThat(hex.test(receipt.ipaSha256??'')&&typeof receipt.betaDetailId==='string'&&receipt.betaDetailId.length>0&&typeof receipt.betaStateVerifiedAt==='string'&&Number.isFinite(Date.parse(receipt.betaStateVerifiedAt)),'Signed IPA digest and actual Apple beta detail receipt required');
 const science=receipt.scientificReview;assertOwnerScienceReceipt(receipt,science);
 requireThat(science.ownerReview.contentDigest===a.scientificContentDigest&&science.ownerReview.fileCount===a.scientificFileCount&&science.ownerReview.declarationSha256===a.ownerReviewDeclarationSha256,'Reviewed scientific snapshot differs');
 requireThat(Array.isArray(science.strictChecks?.toxicology?.report?.errors)&&science.strictChecks.toxicology.report.errors.length===0,'Structural toxicology errors block public demo');
 requireThat(receipt.nativeStorekitVerified===true&&receipt.storekitUIVerified===true,'Native and purchase UI proof required');
 for(const [key,path]of Object.entries({native:'subscription-storekit-tests.yml',ui:'subscription-storekit-ui.yml',demo:'agaricus-demo-ui.yml'})){
  const p=receipt.evidence?.[key];requireThat(p?.id===a.nativeProofRunIds?.[key]&&Number.isSafeInteger(p.id)&&p.id>0&&p.sourceCommit===a.sourceCommit&&p.path==='.github/workflows/'+path&&p.verified===true&&p.conclusion==='success','Successful exact-source proof required: '+key);
 }
 return {scope:'public-demo-beta',certified:false,independentReviewComplete:false,appStoreReady:false,authorizationSha256:expectedDigest,authorizedSource:a.sourceCommit,pairedTestFlightBuild:a.buildNumber,authorizedOn:a.approvedAt};
}
export function validatePairedArtifact(m,a){
 requireThat(m?.id===a.candidateArtifactId&&m.name==='Paired-web-candidate'&&m.expired===false&&m.digest==='sha256:'+a.candidateArtifactSha256,'Original candidate artifact or ZIP digest differs');
 requireThat(m.workflow_run?.id===a.candidateProducerRunId&&m.workflow_run.head_sha===a.sourceCommit&&m.workflow_run.head_branch==='main','Original artifact producer differs');
 requireThat(Number.isSafeInteger(m.size_in_bytes)&&m.size_in_bytes>0&&m.size_in_bytes<1024*1024*1024,'Unexpected artifact size');
}
export function assertPublisherDiff(diff,source){
 requireThat(diff?.base_commit?.sha===source&&Number.isSafeInteger(diff.total_commits)&&diff.total_commits<=100&&Array.isArray(diff.files)&&diff.files.length<300,'Complete source/orchestrator comparison required');
 const allowed=p=>typeof p==='string'&&(p.startsWith('docs/')||/^tools\/paired-demo(?:[-.][A-Za-z0-9.-]+)?\.mjs$/.test(p)||p==='.github/workflows/promote-paired-demo.yml'||/^revisione\/public-demo-authorizations\/[a-f0-9]{40}\.json$/.test(p));
 requireThat(diff.files.every(f=>allowed(f.filename)&&(!f.previous_filename||allowed(f.previous_filename))),'Application changed after signed source; new paired build required');
}
export async function preparePairedDemo({dir,receipt,authorization,expectedDigest,iconPath}){
 const webDistribution=authorizePairedDemo(receipt,authorization,expectedDigest);
 const {build}=await validateCandidate({dir,expectedSha:authorization.sourceCommit,iconPath});
 for(const k of ['sourceCommit','version','iconSha256','webContentHash'])requireThat(build[k]===receipt[k],'Native/web bytes differ: '+k);
 return {schemaVersion:1,...Object.fromEntries(['sourceCommit','version','buildNumber','iconSha256','webContentHash','appleBuildId','processingState','internalBuildState','betaDetailId','betaStateVerifiedAt','diagnosticOnly','testFlightOnly','ipaSha256','producerRunId','nativeStorekitVerified','storekitUIVerified','appStoreReady','evidence','internalGroupIds'].map(k=>[k,receipt[k]])),webDistribution};
}
