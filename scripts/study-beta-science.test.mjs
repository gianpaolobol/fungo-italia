import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {assertOwnerScienceReceipt,verifyOwnerBetaScience} from './internal-beta-science.mjs';
const source='a'.repeat(40);
test('confirmed web snapshot permits only owner internal native beta without independent certification',async()=>{
 const proof=await verifyOwnerBetaScience(source);
 assert.equal(proof.betaAllowed,true);assert.equal(proof.sourceCommit,source);
 assert.equal(proof.ownerReview.fileCount,868);
 assert.equal(proof.ownerReview.contentDigest,'85efde0ea64d6f3896637d3e1002c3c2586effbcef918f6fa375d1e8d0cae8df');
 assert.equal(proof.independentReleaseReady,false);assert.equal(proof.appStoreReady,false);assert.equal(proof.publicWebAllowed,false);
 assert.equal(proof.strictChecks.readiness.exitCode,1);assert.equal(proof.strictChecks.toxicology.exitCode,1);
 const receipt={sourceCommit:source,testFlightOnly:true,diagnosticOnly:true,appStoreReady:false};
 assert.doesNotThrow(()=>assertOwnerScienceReceipt(receipt,proof));
 for(const patch of [{sourceCommit:'b'.repeat(40)},{ownerGroupId:'other'},{publicWebAllowed:true},{appStoreReady:true},{ownerReview:{...proof.ownerReview,contentDigest:'b'.repeat(64)}}])assert.throws(()=>assertOwnerScienceReceipt(receipt,{...proof,...patch}));
});
test('old and changed confirmations cannot extend current native audience or scientific content',async()=>{
 const {confirmedStudyBetaDecision}=await import('./study-beta-science.mjs');
 const confirmation=JSON.parse(await readFile('revisione/owner-ios-study-confirmation-20261027.json','utf8'));
 const webProof={publicBetaAllowed:true,sourceCommit:source,scientificContentDigest:confirmation.scientificContentDigest,authorizationSha256:confirmation.webApprovalSha256,strictChecks:{readiness:{exitCode:1,report:{totals:{}}},toxicology:{exitCode:1,report:{errors:[],warnings:[]}}}};
 assert.equal(confirmedStudyBetaDecision({confirmation,webProof,sourceCommit:source}).betaAllowed,true);
 for(const patch of [{confirmation:'approvo'},{scope:'production'},{externalTestersAllowed:true},{appStoreReady:true},{publicWebAllowed:true},{independentReviewComplete:true},{scientificContentDigest:'f'.repeat(64)},{ownerGroupId:'other'},{publishedWebSource:'b'.repeat(40)}])assert.throws(()=>confirmedStudyBetaDecision({confirmation:{...confirmation,...patch},webProof,sourceCommit:source}));
 assert.throws(()=>confirmedStudyBetaDecision({confirmation,webProof:{...webProof,sourceCommit:'b'.repeat(40)},sourceCommit:source}));
 assert.throws(()=>confirmedStudyBetaDecision({confirmation,webProof:{...webProof,publicBetaAllowed:false},sourceCommit:source}));
});
