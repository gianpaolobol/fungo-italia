// Evidence only: this program cannot build, submit or update a native app,
// grant entitlements, alter review declarations or deploy Pages.
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {runStrictScienceReports,snapshotScientificContent,manifestDigest} from '../scripts/internal-beta-science.mjs';
const sourceCommit=process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(!/^[a-f0-9]{40}$/.test(sourceCommit)||sourceCommit!==execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim())throw Error('Exact checked-out source required; PR merge SHA is not the candidate');
const strictChecks=runStrictScienceReports(),files=await snapshotScientificContent();
const foundations=JSON.parse(await readFile('src/data/theory-foundations.json','utf8'));
const unresolvedFoundations=foundations.filter(q=>q.provenance?.reviewStatus!=='independently-reviewed'||!q.provenance?.independentReviewEvidence).map(q=>q.id);
const report={schemaVersion:1,sourceCommit,checkedAt:new Date().toISOString(),scope:'web-only-preflight',scientificContentDigest:manifestDigest(files),scientificFileCount:files.length,strictChecks,unresolvedFoundations,independentReleaseReady:strictChecks.readiness.exitCode===0&&strictChecks.toxicology.exitCode===0&&unresolvedFoundations.length===0,published:false,nativeBuildAllowed:false,iOSUpdatePendingOwnerConfirmation:true,pwaUpgradeOfThisCandidateVerified:false};
await mkdir('docs/evidence/web-study-20261027',{recursive:true});await writeFile('docs/evidence/web-study-20261027/publication-preflight.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceCommit,independentReleaseReady:report.independentReleaseReady,strictReadiness:strictChecks.readiness.exitCode,strictToxicology:strictChecks.toxicology.exitCode,unresolvedFoundations:unresolvedFoundations.length,published:false,nativeBuildAllowed:false}));
