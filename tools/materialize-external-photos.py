"""Materialize reviewed, openly licensed external photos; preserve course photographs."""
import hashlib, io, json, pathlib, re, unicodedata
from PIL import Image, ImageOps, ImageDraw
ROOT = pathlib.Path(".")
DATA = ROOT / "src/data"
OUTPUT = ROOT / "web/public/images/reference"
VIEWS = ("lateral", "top", "underside")
PREFIX = "EXTERNAL-LICENSE:"
def read(path):
    return json.loads(path.read_text())
def is_external(row):
    permission = row.get("permissionEvidenceId", row.get("rights", {}).get("permissionEvidenceId", ""))
    return permission.startswith(PREFIX)
def slug(name):
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
def main():
    rows = read(DATA / "reference-external-photo-selections.json")["images"]
    registry = read(DATA / "reference-external-sources.json")
    sources = {s["sourceId"]: s for s in registry["sources"]}
    if len(sources) != len(registry["sources"]):
        raise ValueError("Duplicate external source ID")
    old_manifest = read(DATA / "reference-images.json")
    old_evidence = read(DATA / "reference-image-evidence.json")
    kept = [i for i in old_manifest["images"] if not is_external(i)]
    kept_evidence = [i for i in old_evidence["images"] if not is_external(i)]
    occupied = {(i["scientificName"], i["view"]) for i in kept}
    taxa = read(DATA / "catalog.json") + read(DATA / "groups.json")
    canonical = {t["scientificName"] for t in taxa}
    emitted = set()
    pending = []
    for s in rows:
        source = sources[s["sourceId"]]
        view = s["view"]
        if view not in VIEWS or s["scientificName"] not in canonical:
            raise ValueError("Unknown photo taxon or view")
        if not s.get("credit") or not s.get("reviewNotes") or not source.get("taxonomicEvidence") or not source.get("verificationBasis"):
            raise ValueError("Incomplete review, credit or taxonomic evidence")
        if s["sourceUrl"] != source["sourceUrl"] or s["licenseUrl"] != source["licenseUrl"]:
            raise ValueError("Selection and source registry disagree")
        if s["subjectTaxon"] not in source.get("allowedSubjectTaxa", [source["subjectTaxon"]]):
            raise ValueError("Reviewed photo subject differs from source taxa")
        license_url = s["licenseUrl"].rstrip("/")
        standard = re.fullmatch(r"https://creativecommons\.org/(?:licenses/by(?:-sa)?/(?:[1-4]\.0|2\.5)|publicdomain/zero/1\.0)", license_url)
        declared = source["licenseName"] in ("CC BY", "Public domain") and s["licenseUrl"] == source["licenseEvidenceUrl"] and s["licenseUrl"].startswith("https://")
        if not (standard or declared):
            raise ValueError("Publication license is not documented")
        source_hash = s["sourceSha256"]
        for digest in (source_hash, s["candidateSha256"]):
            if not re.fullmatch(r"[0-9a-f]{64}", digest):
                raise ValueError("Invalid reviewed SHA-256")
        if source_hash != source["sourceSha256"]:
            raise ValueError("Reviewed source checksum differs from registry")
        path = pathlib.Path(s["sourcePath"])
        if path.is_absolute() or len(path.parts) < 3 or path.parts[:2] != ("source-photo-assets", "external") or ".." in path.parts:
            raise ValueError("Unsafe external source path")
        if not path.resolve().is_relative_to((ROOT / "source-photo-assets/external").resolve()):
            raise ValueError("External source escapes authorized directory")
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != s["candidateSha256"]:
            raise ValueError("Reviewed candidate image changed")
        crop = s["crop"]
        if len(crop) != 4 or not all(type(n) in (int, float) for n in crop):
            raise ValueError("Invalid crop")
        x0, y0, x1, y1 = crop
        if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
            raise ValueError("Invalid normalized crop")
        page = s.get("sourcePage")
        if page is not None and (type(page) is not int or page < 1):
            raise ValueError("Source page must be positive or null")
        key = (s["scientificName"], view)
        if key in occupied:
            continue
        if key in emitted:
            raise ValueError("Duplicate external taxon/view selection")
        emitted.add(key)
        filename = "external-" + slug(s["scientificName"]) + "-" + view + ".jpg"
        with Image.open(io.BytesIO(raw)) as original:
            oriented = ImageOps.exif_transpose(original).convert("RGB")
            im = oriented.crop((round(x0 * oriented.width), round(y0 * oriented.height), round(x1 * oriented.width), round(y1 * oriented.height)))
            if min(im.size) < 100:
                raise ValueError("Insufficient source crop resolution")
            im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            clean = Image.new("RGB", im.size)
            clean.paste(im)
            buffer = io.BytesIO()
            clean.save(buffer, format="JPEG", quality=90, optimize=True)
        payload = buffer.getvalue()
        src = "images/reference/" + filename
        permission = PREFIX + s["sourceId"]
        credit = s["credit"]
        if not any(token in credit.lower() for token in ("ritaglio", "ridimension", "adattat", "rielaborat", "derivat")):
            credit += " · " + ("ritaglio" if crop != [0, 0, 1, 1] else "copia JPEG rielaborata")
        entry = {
            "scientificName": s["scientificName"], "subjectTaxon": s["subjectTaxon"],
            "src": src, "view": view,
            "alt": s.get("alt", s["subjectTaxon"] + " — " + {"lateral": "vista laterale", "top": "vista superiore", "underside": "imenoforo"}[view]),
            "credit": credit, "sourceId": s["sourceId"], "page": page,
            "sourceUrl": s["sourceUrl"], "licenseUrl": s["licenseUrl"], "taxonStatus": "identified",
            "rights": {"status": "verified", "publicRepository": True, "pages": True, "permissionEvidenceId": permission}
        }
        evidence = {
            "src": src, "sourceId": s["sourceId"], "sourceSha256": source_hash,
            "candidateSha256": s["candidateSha256"], "sourcePath": str(path),
            "sourcePage": page, "xref": None, "subjectTaxon": s["subjectTaxon"],
            "crop": crop, "sha256": hashlib.sha256(payload).hexdigest(),
            "width": clean.width, "height": clean.height, "visualReview": "verified",
            "reviewNotes": s["reviewNotes"], "permissionEvidenceId": permission,
            "sourceUrl": s["sourceUrl"], "licenseUrl": s["licenseUrl"]
        }
        pending.append((filename, payload, entry, evidence))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    filenames = {p[0] for p in pending}
    if len(filenames) != len(pending):
        raise ValueError("Scientific-name filename collision")
    for filename, payload, _, _ in pending:
        (OUTPUT / filename).write_bytes(payload)
    for old in old_manifest["images"]:
        if is_external(old):
            name = pathlib.PurePosixPath(old["src"]).name
            if name.startswith("external-") and name not in filenames:
                (OUTPUT / name).unlink(missing_ok=True)
    manifest = {"version": 1, "images": kept + [p[2] for p in pending]}
    evidence = {"version": 1, "images": kept_evidence + [p[3] for p in pending]}
    write_json(DATA / "reference-images.json", manifest)
    write_json(DATA / "reference-image-evidence.json", evidence)
    coverage_rows = []
    for taxon in taxa:
        available = [v for v in VIEWS if any(i["scientificName"] == taxon["scientificName"] and i["view"] == v for i in manifest["images"])]
        coverage_rows.append({"scientificName": taxon["scientificName"], "availableViews": available, "missingViews": [v for v in VIEWS if v not in available]})
    coverage = {"version": 1, "requiredViews": list(VIEWS), "summary": {
        "cards": len(taxa), "images": len(manifest["images"]),
        "completeTriplets": sum(not r["missingViews"] for r in coverage_rows),
        "partialCards": sum(0 < len(r["availableViews"]) < 3 for r in coverage_rows),
        "withoutImages": sum(not r["availableViews"] for r in coverage_rows),
        "missingViews": sum(len(r["missingViews"]) for r in coverage_rows),
        "imageBytes": sum((ROOT / "web/public" / i["src"]).stat().st_size for i in manifest["images"])
    }, "cards": coverage_rows}
    write_json(DATA / "reference-image-coverage.json", coverage)
    review = ROOT / "photo-review"
    review.mkdir(exist_ok=True)
    for old in review.glob("external-selected-sheet-*.jpg"):
        old.unlink()
    for offset in range(0, len(pending), 12):
        sheet = Image.new("RGB", (1200, 1200), (245, 245, 245))
        draw = ImageDraw.Draw(sheet)
        for index, (_, _, entry, _) in enumerate(pending[offset:offset + 12]):
            with Image.open(ROOT / "web/public" / entry["src"]) as original:
                thumb = ImageOps.contain(original, (380, 245))
                x, y = (index % 3) * 400, (index // 3) * 300
                sheet.paste(thumb, (x + (400 - thumb.width) // 2, y + 4))
            draw.text((x + 8, y + 257), str(offset + index + 1) + " " + entry["subjectTaxon"][:43], fill="black")
            draw.text((x + 8, y + 277), entry["view"] + " " + entry["sourceId"][:35], fill="black")
        sheet.save(review / ("external-selected-sheet-" + str(offset // 12 + 1) + ".jpg"), quality=87)
    print("Materialized", len(pending), "external photos; preserved", len(kept), "course photos.")
if __name__ == "__main__":
    main()

