"""Extract review contact sheets from owner-authorized teaching photographs.
Never publishes complete PDFs or assigns taxon/view automatically.
"""
import contextlib, hashlib, io, json, pathlib, tempfile, concurrent.futures
import gdown, pymupdf
from PIL import Image, ImageDraw, ImageOps
ROOT=pathlib.Path("photo-review")
ROOT.mkdir(exist_ok=True)
registry=json.loads(pathlib.Path("src/data/course-sources.json").read_text())
docs=[d for d in registry["documents"] if d["mimeType"]=="application/pdf" and not any(s in d["title"].lower() for s in ["legislazione","figura professionale","botanica","anniballi","monteleone","pigelleto"])]
def extract(source):
 result={"sourceId":source["sourceId"],"driveFileId":source["driveFileId"],"title":source["title"],"authors":source.get("authors",[]),"status":"unavailable","images":[],"sheets":[]}
 try:
  with tempfile.TemporaryDirectory() as tmp:
   path=pathlib.Path(tmp)/"source.pdf"
   with contextlib.redirect_stdout(io.StringIO()),contextlib.redirect_stderr(io.StringIO()):
    ok=gdown.download(id=source["driveFileId"],output=str(path),quiet=True,use_cookies=False)
   if not ok or not path.exists():raise RuntimeError("download")
   if path.stat().st_size!=source["bytes"]:raise RuntimeError("source-size")
   result["sha256"]=hashlib.sha256(path.read_bytes()).hexdigest()
   thumbs=[];seen=set()
   with pymupdf.open(path) as pdf:
    result["pageCount"]=len(pdf)
    for page_index,page in enumerate(pdf):
     text=page.get_text()
     for info in page.get_image_info(xrefs=True):
      xref=info["xref"]
      if not xref or xref in seen or info["width"]<160 or info["height"]<140 or info["width"]*info["height"]<30000:continue
      seen.add(xref)
      raw=pdf.extract_image(xref)
      im=Image.open(io.BytesIO(raw["image"])).convert("RGB")
      if im.width/im.height>5 or im.height/im.width>5:continue
      key=source["driveFileId"]+"-p"+str(page_index+1)+"-x"+str(xref)
      result["images"].append({"id":key,"page":page_index+1,"xref":xref,"width":im.width,"height":im.height,"bbox":list(info["bbox"]),"pageText":text[:2400]})
      thumbs.append((key,ImageOps.contain(im,(282,210))))
    for offset in range(0,len(thumbs),20):
     batch=thumbs[offset:offset+20]
     sheet=Image.new("RGB",(1200,5*260),(245,245,245));draw=ImageDraw.Draw(sheet)
     for index,(key,im) in enumerate(batch):
      x=(index%4)*300;y=(index//4)*260
      sheet.paste(im,(x+(300-im.width)//2,y+18))
      short=key.split("-p")[-1]
      draw.text((x+8,y+232),str(offset+index+1)+" | p"+short,fill="black")
     name=source["driveFileId"]+"-sheet-"+str(offset//20+1)+".jpg"
     sheet.save(ROOT/name,quality=84)
     result["sheets"].append({"path":"photo-review/"+name,"from":offset+1,"to":offset+len(batch)})
   result["status"]="extracted-for-visual-review"
 except Exception as error:
  result["errorType"]=type(error).__name__
 return result
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 results=list(pool.map(extract,docs))
(ROOT/"inventory.json").write_text(json.dumps({"version":1,"permissionEvidenceId":"OWNER-COURSE-PHOTOS-2026-10-07","documents":results},ensure_ascii=False,indent=2))
print(json.dumps([{"sourceId":r["sourceId"],"status":r["status"],"images":len(r["images"]),"sheets":len(r["sheets"])} for r in results]))
if not any(r["images"] for r in results):raise SystemExit("No inspectable source images")
