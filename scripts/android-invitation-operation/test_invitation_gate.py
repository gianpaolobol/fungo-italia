import importlib.util,unittest,xml.etree.ElementTree as ET
from pathlib import Path
spec=importlib.util.spec_from_file_location('smoke',Path(__file__).with_name('android-smoke.py'))
smoke=importlib.util.module_from_spec(spec);spec.loader.exec_module(smoke)
class InvitationGateTests(unittest.TestCase):
 def gate(self,enabled='false',extra=''):
  return ET.fromstring('<hierarchy><node text="Accesso completo su invito"/><node resource-id="beta-invite-code" content-desc="Codice personale dell’invito beta" text="Codice ricevuto via email"/><node resource-id="beta-redeem" content-desc="Attiva invito beta" enabled="'+enabled+'"/>'+extra+'</hierarchy>')
 def test_empty_invitation_is_disabled(self):smoke.verify_invitation_gate(self.gate())
 def test_enabled_empty_invitation_is_rejected(self):
  with self.assertRaises(AssertionError):smoke.verify_invitation_gate(self.gate('true'))
 def test_purchase_or_restore_route_is_rejected(self):
  for value in ['Abbonati · 19,99','Ripristina acquisti','Abbonamento attivo']:
   with self.assertRaises(AssertionError):smoke.verify_invitation_gate(self.gate(extra='<node text="'+value+'"/>'))
 def test_missing_code_field_is_rejected(self):
  root=self.gate();root.remove(root.find("./node[@resource-id='beta-invite-code']"))
  with self.assertRaises(AssertionError):smoke.verify_invitation_gate(root)
if __name__=='__main__':unittest.main()
