import copy, json, pathlib, unittest
from build import validate
class SecurityChecks(unittest.TestCase):
    def setUp(self):
        self.source = json.loads((pathlib.Path(__file__).parent / "probe.shortcut.json").read_text())
    def test_sources_pass(self):
        validate(self.source)
    def test_network_action_rejected(self):
        self.source["WFWorkflowActions"].append({"WFWorkflowActionIdentifier": "is.workflow.actions.downloadurl", "WFWorkflowActionParameters": {}})
        with self.assertRaises(AssertionError): validate(self.source)
    def test_metadata_preservation_rejected(self):
        for action in self.source["WFWorkflowActions"]:
            if action["WFWorkflowActionIdentifier"].endswith(".image.convert"):
                action["WFWorkflowActionParameters"]["WFImagePreserveMetadata"] = True
        with self.assertRaises(AssertionError): validate(self.source)
    def test_overwrite_rejected(self):
        for action in self.source["WFWorkflowActions"]:
            if action["WFWorkflowActionIdentifier"].endswith(".documentpicker.save"):
                action["WFWorkflowActionParameters"]["WFSaveFileOverwrite"] = True
        with self.assertRaises(AssertionError): validate(self.source)
