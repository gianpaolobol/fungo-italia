"""Build unsigned review artifacts. Does not sign or execute Apple Shortcuts."""
import json, plistlib, pathlib, hashlib, re
ROOT = pathlib.Path(__file__).resolve().parent
OUT = pathlib.Path("shortcut-output")
ALLOWED = {"comment","alert","nothing","setvariable","format.date","filter.photos","repeat.each","image.resize","image.convert","setitemname","appendvariable","count","conditional","makezip","documentpicker.save"}
def validate(data):
    seen = set()
    stack = []
    for action in data["WFWorkflowActions"]:
        identifier = action["WFWorkflowActionIdentifier"]
        assert identifier.startswith("is.workflow.actions.")
        kind = identifier.removeprefix("is.workflow.actions.")
        assert kind in ALLOWED, f"Forbidden action: {identifier}"
        params = action["WFWorkflowActionParameters"]
        def scan(value):
            if isinstance(value, dict):
                if "OutputUUID" in value:
                    assert value["OutputUUID"] in seen, "Invalid output reference"
                if value.get("WFSerializationType") == "WFTextTokenString":
                    token = value["Value"]
                    for span in token.get("attachmentsByRange", {}):
                        match = re.fullmatch(r"\{(\d+), 1\}", span)
                        assert match and token["string"][int(match[1])] == "\ufffc", "Invalid token"
                for child in value.values(): scan(child)
            elif isinstance(value, list):
                for child in value: scan(child)
        scan(params)
        if kind == "image.convert":
            assert params["WFImagePreserveMetadata"] is False
            assert params["WFImageFormat"] == "JPEG"
        if kind == "documentpicker.save":
            assert params["WFAskWhereToSave"] is True
            assert params["WFSaveFileOverwrite"] is False
        if kind == "makezip": assert params["WFArchiveFormat"] == "zip"
        if kind in {"conditional", "repeat.each"}:
            mode = params["WFControlFlowMode"]
            group = params["GroupingIdentifier"]
            if mode == 0: stack.append((kind, group))
            elif mode == 2:
                assert stack and stack.pop() == (kind, group), "Unbalanced control flow"
            else: raise AssertionError("Unexpected control flow")
        uuid = params.get("UUID")
        if uuid:
            assert uuid not in seen
            seen.add(uuid)
    assert not stack
def main():
    OUT.mkdir(exist_ok=True)
    audit = {"status": "source checks only; not signed or tested on iPhone", "files": []}
    for path in sorted(ROOT.glob("*.shortcut.json")):
        data = json.loads(path.read_text())
        validate(data)
        target = OUT / path.name.replace(".shortcut.json", ".unsigned.shortcut")
        target.write_bytes(plistlib.dumps(data, fmt=plistlib.FMT_BINARY))
        assert plistlib.loads(target.read_bytes()) == data
        audit["files"].append({"source": path.name, "sha256": hashlib.sha256(target.read_bytes()).hexdigest(), "actions": len(data["WFWorkflowActions"])})
    assert len(audit["files"]) == 2
    (OUT / "audit.json").write_text(json.dumps(audit, indent=2))
if __name__ == "__main__": main()
