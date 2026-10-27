import pathlib,yaml,unittest
ROOT=pathlib.Path(__file__).resolve().parents[3]
class RecoveryWorkflow(unittest.TestCase):
 def test_push_only_requests_existing_pair_verification(self):
  w=yaml.safe_load((ROOT/'.github/workflows/promote-paired-demo.yml').read_text())
  trigger=w.get('on',w.get(True))
  self.assertEqual(trigger['push'],{'branches':['main'],'paths':['docs/evidence/ios-study-confirmation-20261027/verification-request.json']})
  j=w['jobs']['promote'];self.assertEqual(j['if'],"github.ref == 'refs/heads/main'")
  self.assertEqual(w['concurrency'],{'group':'paired-public-pages','cancel-in-progress':False})
  e=j['env'];self.assertIn("github.event_name == 'push' || inputs.verification_only",e['PAIRED_VERIFICATION_ONLY'])
  for k,v in {'PAIRED_SOURCE':'7398825ea3b834d3b003aac3fd2d93232f791a54','PUBLIC_AUTHORIZATION_SHA256':'4d5d7b2bbefb219719cefb7989381c6fb47ee7822eee1af3e5300203728fafaf','PAIRED_PROFILE_ARTIFACT_ID':'12739667356','PAIRED_PROFILE_ARTIFACT_SHA256':'e7cff7a0133764ec0daa8400d19b13f9114bdc8cdcefb1244f4a86dbc109f4d3'}.items():
   self.assertIn(v,e[k]);self.assertIn("github.event_name == 'push'",e[k])
  steps=j['steps'];guards=[s for s in steps if s.get('run')=='node tools/paired-demo.mjs promote']
  self.assertEqual(len(guards),2)
  self.assertNotIn('if',guards[0])
  risky=[s for s in steps if s.get('uses') in ['actions/configure-pages@v5','actions/upload-pages-artifact@v3','actions/deploy-pages@v4'] or s.get('name') in ['Preserve previous public bytes and native receipt before any deployment','Repeat live Apple and exact-source guards immediately before deployment'] or s.get('with',{}).get('name')=='Paired-previous-web-rollback-snapshot']
  self.assertEqual(len(risky),6)
  for s in risky:self.assertEqual(s['if'], '${{ github.event_name == \'workflow_dispatch\' && !inputs.verification_only }}')
  restore=next(s for s in steps if s.get('name')=='Restore original predeployment public browser profiles')
  self.assertEqual(restore['if'],"${{ env.PAIRED_PROFILE_ARTIFACT_ID != '' }}")
  self.assertTrue(any(s.get('run')=='node tools/paired-demo-browser.mjs upgrade "$RUNNER_TEMP/paired-demo-browser"' for s in steps))
  self.assertTrue(any("process.env.PAIRED_VERIFICATION_ONLY!==''true''" in s.get('run','') or "process.env.PAIRED_VERIFICATION_ONLY===''true''" in s.get('run','') or "process.env.PAIRED_VERIFICATION_ONLY==='true'" in s.get('run','') for s in steps))
if __name__=='__main__':unittest.main()
