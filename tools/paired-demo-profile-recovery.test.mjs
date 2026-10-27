import test from 'node:test';import assert from 'node:assert/strict';
import {validateProfileArtifact,extractionScript} from './paired-demo-profile-recovery.mjs';
import {execFileSync} from 'node:child_process';
test('only pinned original predeployment profile archive is accepted',()=>{
 const digest='a'.repeat(64),m={id:12,name:'Paired-browser-profiles-before',expired:false,digest:'sha256:'+digest,size_in_bytes:123,workflow_run:{id:34,head_branch:'main'}};
 assert.doesNotThrow(()=>validateProfileArtifact(m,12,digest));
 for(const patch of [{id:13},{name:'other'},{expired:true},{digest:'sha256:'+'b'.repeat(64)},{size_in_bytes:0},{workflow_run:{id:34,head_branch:'branch'}}])assert.throws(()=>validateProfileArtifact({...m,...patch},12,digest));
});
test('profile extraction preserves regular files and in-archive hardlinks, rejects traversal and external links',()=>{
 const fixture=`import io,tarfile,tempfile,pathlib,subprocess,sys
script=sys.argv[1]
for name,link,ok in [('chromium/state',None,True),('../escape',None,False),('webkit/link','/etc/passwd',False),('webkit/link','../escape',False)]:
 with tempfile.TemporaryDirectory() as root:
  root=pathlib.Path(root);p=root/'profile.tar.gz';out=root/'out';out.mkdir()
  with tarfile.open(p,'w:gz') as t:
   x=tarfile.TarInfo(name)
   if link:x.type=tarfile.SYMTYPE;x.linkname=link;t.addfile(x)
   else:x.size=4;t.addfile(x,io.BytesIO(b'data'))
  r=subprocess.run([sys.executable,'-c',script,str(p),str(out)],capture_output=True)
  assert (r.returncode==0)==ok,(name,r.stderr)
with tempfile.TemporaryDirectory() as root:
 root=pathlib.Path(root);p=root/'profile.tar.gz';out=root/'out';out.mkdir()
 with tarfile.open(p,'w:gz') as t:
  x=tarfile.TarInfo('./webkit/blob');x.size=4;t.addfile(x,io.BytesIO(b'data'))
  x=tarfile.TarInfo('./webkit/link');x.type=tarfile.LNKTYPE;x.linkname='./webkit/blob';t.addfile(x)
 subprocess.run([sys.executable,'-c',script,str(p),str(out)],check=True)
 assert (out/'webkit/link').read_bytes()==b'data'
`;
 execFileSync('python3',['-c',fixture,extractionScript]);
});
