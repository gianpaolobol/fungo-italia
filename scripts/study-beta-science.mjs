import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {ownerWebDecision} from '../tools/web-only-policy.mjs';
import {ownerGroup} from './consolidated-beta-audience.mjs';
export const STUDY_IOS_CONFIRMATION_DIGEST='32037af4686796d56070f6257f0afa446437f145212c3f77827c6e9562a4c1b1';
export const STUDY_IOS_SCIENCE_DIGEST='85efde0ea64d6f3896637d3e1002c3c2586effbcef918f6fa375d1e8d0cae8df';
export function confirmedStudyBetaDecision({confirmation:a,webProof:w,sourceCommit}){
 assert.equal(createHash('sha256').update(JSON.stringify(a)).digest('hex'),STUDY_IOS_CONFIRMATION_DIGEST,'Changed iOS owner confirmation');
 assert.equal(a.confirmation,'Confermo');assert.equal(a.scope,'owner-internal-testflight');assert.equal(a.ownerGroupId,ownerGroup);
 assert.equal(a.externalTestersAllowed,false);assert.equal(a.appStoreReady,false);assert.equal(a.independentReviewComplete,false);assert.equal(a.publicWebAllowed,false);
 assert.equal(a.scientificContentDigest,STUDY_IOS_SCIENCE_DIGEST);assert.equal(w.scientificContentDigest,a.scientificContentDigest);assert.equal(w.authorizationSha256,a.webApprovalSha256);
 assert.equal(w.sourceCommit,sourceCommit);assert(/^[a-f0-9]{40}$/.test(sourceCommit));assert.equal(w.publicBetaAllowed,true);assert.equal(w.strictChecks.toxicology.report.errors.length,0);
 return {schemaVersion:1,sourceCommit,betaAllowed:true,approvalScope:a.scope,ownerGroupId:ownerGroup,independentReleaseReady:false,appStoreReady:false,publicWebAllowed:false,ownerReview:{reviewType:'owner-review',reviewer:a.owner,declaredOn:a.confirmedOn,declarationSha256:STUDY_IOS_CONFIRMATION_DIGEST,contentDigest:a.scientificContentDigest,fileCount:868,independentReviewComplete:false,publishedWebSource:a.publishedWebSource},scientificTotals:w.strictChecks.readiness.report.totals,deferredGaps:w.strictChecks.readiness.report.blockers,toxicologyWarnings:w.strictChecks.toxicology.report.warnings,strictChecks:w.strictChecks};
}
export async function verifyConfirmedStudyBeta({files,strictChecks,sourceCommit}){
 const json=async p=>JSON.parse(await readFile(p,'utf8'));
 const w=ownerWebDecision({sourceCommit,approval:await json('revisione/owner-web-study-approval-20261027.json'),legacy:await json('revisione/owner-internal-beta-review-20261026.json'),packet:await json('revisione/theory-foundations-review-20261027.json'),foundationBytes:await readFile('src/data/theory-foundations.json'),files,strictChecks});
 return confirmedStudyBetaDecision({confirmation:await json('revisione/owner-ios-study-confirmation-20261027.json'),webProof:w,sourceCommit});
}
