import assert from 'node:assert/strict';import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';import {resolve,join} from 'node:path';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {assertPublisherDiff} from './paired-demo-policy.mjs';
export function validateProfileArtifact(m,id,digest){assert(Number.isSafeInteger(id)&&id>0&&/^[a-f0-9]{64}$/.test(digest));assert(m?.id===id&&m.name==='Paired-browser-profiles-before'&&m.expired===false&&m.digest==='sha256:'+digest&&m.workflow_run?.head_branch==='main'&&Number.isSafeInteger(m.workflow_run.id)&&Number.isSafeInteger(m.size_in_bytes)&&m.size_in_bytes>0&&m.size_in_bytes<512*1024*1024,'Pinned original predeployment profiles required');}
export const extractionScript=`import tarfile,pathlib,sys
archive,out=sys.argv[1:];root=pathlib.Path(out).resolve()
with tarfile.open(archive) as t:
 members=t.getmembers();assert len(members)<100000
 names={m.name:m for m in members};assert len(names)==len(members)
 for m in members:
  p=pathlib.PurePosixPath(m.name)
  assert not p.is_absolute() and '..' not in p.parts and not m.issym() and (m.isfile() or m.isdir() or m.islnk())
  assert (root/m.name).resolve().is_relative_to(root)
  if m.islnk():
   q=pathlib.PurePosixPath(m.linkname)
   assert not q.is_absolute() and '..' not in q.parts and m.linkname in names and names[m.linkname].isfile()
 t.extractall(root,filter='data')
`;
async function main(){
 assert.equal(process.env.GITHUB_REPOSITORY,'gianpaolobol/fungo-italia');assert(process.env.RUNNER_TEMP?.startsWith('/'));const out=resolve(process.argv[2]||'');assert.equal(out,join(process.env.RUNNER_TEMP,'paired-demo-browser'));
 const id=Number(process.env.PAIRED_PROFILE_ARTIFACT_ID),digest=process.env.PAIRED_PROFILE_ARTIFACT_SHA256,base='https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY,headers={Authorization:'Bearer '+process.env.GH_TOKEN,Accept:'application/vnd.github+json'};
 const gh=async path=>{const r=await fetch(base+path,{headers,signal:AbortSignal.timeout(45000)});assert(r.ok,'Profile provenance lookup failed');return r.json();};
 const m=await gh('/actions/artifacts/'+id);validateProfileArtifact(m,id,digest);const run=await gh('/actions/runs/'+m.workflow_run.id);assert(run.path==='.github/workflows/promote-paired-demo.yml'&&run.event==='workflow_dispatch'&&run.head_branch==='main');assertPublisherDiff(await gh('/compare/'+process.env.PAIRED_SOURCE+'...'+run.head_sha),process.env.PAIRED_SOURCE);
 const jobs=await gh('/actions/runs/'+run.id+'/jobs?per_page=100');assert.equal(jobs.total_count,jobs.jobs.length);const steps=jobs.jobs.find(j=>j.name==='promote')?.steps;assert(steps);const capture=steps.find(s=>s.name==='Capture actual previous public PWA and private synthetic progress'),archive=steps.find(s=>s.name==='Archive closed synthetic browser profiles before any deployment'),deploy=steps.find(s=>s.name==='Deploy original bytes paired with confirmed owner-only TestFlight');
 assert(capture?.conclusion==='success'&&archive?.conclusion==='success'&&deploy?.conclusion==='success');assert(Date.parse(m.created_at)<Date.parse(deploy.started_at),'Profiles must predate the actual deployment');
 const r=await fetch(base+'/actions/artifacts/'+id+'/zip',{headers,signal:AbortSignal.timeout(120000)});assert(r.ok);const bytes=Buffer.from(await r.arrayBuffer());assert(bytes.length===m.size_in_bytes&&createHash('sha256').update(bytes).digest('hex')===digest);
 const zip=join(process.env.RUNNER_TEMP,'paired-profiles-original.zip');await writeFile(zip,bytes,{mode:0o600});assert.equal(execFileSync('unzip',['-Z1',zip],{encoding:'utf8'}).trim(),'paired-browser-profiles-before.tar.gz');const tar=join(process.env.RUNNER_TEMP,'paired-profiles-original.tar.gz');await writeFile(tar,execFileSync('unzip',['-p',zip,'paired-browser-profiles-before.tar.gz'],{maxBuffer:512*1024*1024}),{mode:0o600});await mkdir(out,{recursive:true});assert.equal((await readdir(out)).length,0);execFileSync('python3',['-c',extractionScript,tar,out]);
 const report=JSON.parse(await readFile(join(out,'capture-report.json'),'utf8'));assert(report.status==='complete'&&report.scope==='live-public-origin'&&report.reports.length===2);for(const browser of ['chromium','webkit']){const p=report.reports.find(x=>x.browser===browser);assert(p?.browserRuntime==='1.62.0'&&p.scope==='live-public-origin'&&p.origin==='https://gianpaolobol.github.io'&&p.sourceAfter!==process.env.PAIRED_SOURCE&&/^[a-f0-9]{40}$/.test(p.sourceAfter)&&p.examSnapshot&&p.notesPreserved&&p.favoritesPreserved);}
 await writeFile(join(out,'profile-recovery-provenance.json'),JSON.stringify({scope:'original live-public predeployment profiles restored without changing progress or browser state',artifactId:id,artifactZipSha256:digest,producerRunId:run.id,captureCheckedAt:report.checkedAt,restoredAt:new Date().toISOString()},null,2)+'\n');
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await main();
