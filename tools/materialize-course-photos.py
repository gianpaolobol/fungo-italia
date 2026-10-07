"""Materialize visually verified course photographs without publishing source PDFs."""
import contextlib,hashlib,io,json,pathlib,tempfile
import gdown,pymupdf
from PIL import Image,ImageOps,ImageDraw
ROOT=pathlib.Path(".")
selected=json.loads((ROOT/"src/data/reference-photo-selections.json").read_text())
registry=json.loads((ROOT/"src/data/course-sources.json").read_text())
sources={d["sourceId"]:d for d in registry["documents"]}
local_index={r["path"]:r for r in json.loads((ROOT/"src/data/reference-source-photo-assets.json").read_text())["images"]}
manifest={"version":1,"images":[]};evidence={"version":1,"images":[]}
output=ROOT/"web/public/images/reference";output.mkdir(parents=True,exist_ok=True)
seen=set()
def render(s,im,source_hash):
 if s["view"] not in ["lateral","top","underside"] or s.get("visualReview")!="verified":raise RuntimeError("Missing visual review")
 im=im.convert("RGB")
 if "crop" in s:
  x0,y0,x1,y1=s["crop"]
  if not (0<=x0<x1<=1 and 0<=y0<y1<=1):raise RuntimeError("Invalid crop")
  im=im.crop((round(x0*im.width),round(y0*im.height),round(x1*im.width),round(y1*im.height)))
 if min(im.size)<100:raise RuntimeError("Insufficient source resolution")
 im=ImageOps.contain(im,(1600,1600))
 filename=s["filename"]
 if filename in seen or "/" in filename or not filename.endswith(".jpg"):raise RuntimeError("Unsafe filename")
 seen.add(filename)
 icc=im.info.get("icc_profile")
 im.info.clear()
 im.save(output/filename,quality=90,optimize=True,icc_profile=icc)
 data=(output/filename).read_bytes()
 manifest["images"].append({"scientificName":s["scientificName"],"subjectTaxon":s["subjectTaxon"],"src":"images/reference/"+filename,"view":s["view"],"alt":s["alt"],"credit":s["credit"],"sourceId":s["sourceId"],"page":s["page"],"taxonStatus":"identified","rights":{"status":"verified","publicRepository":True,"pages":True,"permissionEvidenceId":"OWNER-COURSE-PHOTOS-2026-10-07"}})
 evidence["images"].append({"src":"images/reference/"+filename,"sourceId":s["sourceId"],"sourceSha256":source_hash,"sourcePage":s["page"],"xref":s["xref"],"subjectTaxon":s["subjectTaxon"],"crop":s.get("crop"),"sha256":hashlib.sha256(data).hexdigest(),"width":im.width,"height":im.height,"visualReview":"verified","reviewNotes":s["reviewNotes"],"permissionEvidenceId":"OWNER-COURSE-PHOTOS-2026-10-07"})
for source_id in dict.fromkeys(s["sourceId"] for s in selected["images"]):
 source=sources[source_id];rows=[a for a in selected["images"] if a["sourceId"]==source_id]
 for s in [a for a in rows if "sourceImagePath" in a]:
  path=pathlib.Path(s["sourceImagePath"])
  if path.parts[0]!="source-photo-assets" or ".." in path.parts:raise RuntimeError("Unsafe source path")
  metadata=local_index[str(path)]
  if metadata["sourceId"]!=source_id or metadata["sourceSha256"]!=s["sourceSha256"] or metadata["page"]!=s["page"] or metadata["xref"]!=s["xref"]:raise RuntimeError("Transferred source provenance mismatch")
  raw=path.read_bytes()
  if hashlib.sha256(raw).hexdigest()!=s["sourceImageSha256"] or metadata["imageSha256"]!=s["sourceImageSha256"]:raise RuntimeError("Transferred source changed")
  render(s,Image.open(io.BytesIO(raw)),s["sourceSha256"])
 remote=[a for a in rows if "sourceImagePath" not in a]
 if not remote:continue
 with tempfile.TemporaryDirectory() as tmp:
  path=pathlib.Path(tmp)/"source.pdf"
  with contextlib.redirect_stdout(io.StringIO()),contextlib.redirect_stderr(io.StringIO()):
   ok=gdown.download(id=source["driveFileId"],output=str(path),quiet=True,use_cookies=False)
  if not ok or not path.exists() or path.stat().st_size!=source["bytes"]:raise RuntimeError("Source unavailable or changed")
  source_hash=hashlib.sha256(path.read_bytes()).hexdigest()
  with pymupdf.open(path) as pdf:
   for s in remote:
    if s["sourceSha256"]!=source_hash:raise RuntimeError("Reviewed source changed")
    page=pdf[s["page"]-1]
    if not any(i["xref"]==s["xref"] for i in page.get_image_info(xrefs=True)):raise RuntimeError("Image not on cited page")
    render(s,Image.open(io.BytesIO(pdf.extract_image(s["xref"])["image"])),source_hash)
(ROOT/"src/data/reference-images.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
(ROOT/"src/data/reference-image-evidence.json").write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+"\n")
review=ROOT/"photo-review";review.mkdir(exist_ok=True)
for offset in range(0,len(selected["images"]),12):
 sheet=Image.new("RGB",(1200,1200),(245,245,245));draw=ImageDraw.Draw(sheet)
 for index,s in enumerate(selected["images"][offset:offset+12]):
  im=ImageOps.contain(Image.open(output/s["filename"]),(380,245))
  x=(index%3)*400;y=(index//3)*300
  sheet.paste(im,(x+(400-im.width)//2,y+4))
  draw.text((x+8,y+257),str(offset+index+1)+" "+s["subjectTaxon"][:43],fill="black")
  draw.text((x+8,y+277),s["view"]+" p"+str(s["page"])+" x"+str(s["xref"]),fill="black")
 sheet.save(review/("selected-sheet-"+str(offset//12+1)+".jpg"),quality=87)
print("Materialized",len(manifest["images"]),"visually reviewed photographs.")
