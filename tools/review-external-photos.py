"""Acquire explicitly attributed, licensed scientific reference photographs for visual review only."""
import hashlib,io,json,pathlib,time,urllib.request,urllib.parse,urllib.error
import pymupdf
from PIL import Image,ImageOps,ImageDraw
root=pathlib.Path("reference-candidates");root.mkdir(exist_ok=True)
sources=json.loads(pathlib.Path("src/data/reference-external-source-candidates.json").read_text())["sources"]
items=[];failures=[]
previous=json.loads((root/"index.json").read_text())["candidates"] if (root/"index.json").exists() else []
def get(url):
 if not url.startswith("https://"):raise ValueError("HTTPS required")
 req=urllib.request.Request(url,headers={"User-Agent":"FungoItalia/1.0 scientific educational image curation (github.com/gianpaolobol/fungo-italia)"})
 with urllib.request.urlopen(req,timeout=60) as r:
  data=r.read(32*1024*1024+1)
  if len(data)>32*1024*1024:raise ValueError("Source exceeds limit")
  return data
def save(source,raw,suffix,page=None,xref=None):
 im=Image.open(io.BytesIO(raw));im=ImageOps.exif_transpose(im).convert("RGB")
 if min(im.size)<100:return
 im.thumbnail((1600,1600),Image.Resampling.LANCZOS);im.info.clear()
 name=source["sourceId"].lower()+"-"+suffix+".jpg";path=root/name
 im.save(path,quality=90,optimize=True)
 items.append({**source,"candidateId":source["sourceId"]+"-"+suffix,"candidatePath":str(path),"sourceSha256":source_hash,"extractedImageSha256":hashlib.sha256(raw).hexdigest(),"candidateSha256":hashlib.sha256(path.read_bytes()).hexdigest(),"width":im.width,"height":im.height,"page":page,"xref":xref,"reviewStatus":"pending-visual-review"})
for source in sources:
 if ("upload.wikimedia.org/" in source["assetUrl"] or "/Special:FilePath/" in source["assetUrl"]):
  cached=[i for i in previous if i["sourceId"]==source["sourceId"] and i["licenseUrl"]==source["licenseUrl"]]
  if cached and all(pathlib.Path(i["candidatePath"]).exists() and hashlib.sha256(pathlib.Path(i["candidatePath"]).read_bytes()).hexdigest()==i["candidateSha256"] for i in cached):items.extend(cached)
  else:failures.append({"sourceId":source["sourceId"],"errorType":"PublisherRateLimit","message":"Wikimedia automated requests paused after robot-policy/rate-limit response; no retries or bypass."})
  continue
 if source["sourceId"].startswith("EXT-COMP-") and ("upload.wikimedia.org/" in source["assetUrl"] or "/Special:FilePath/" in source["assetUrl"]):
  original_url=source["assetUrl"]
  filename=urllib.parse.unquote(urllib.parse.urlparse(original_url).path.rsplit("/",1)[-1]).replace(" ","_")
  digest=hashlib.md5(filename.encode()).hexdigest()
  encoded=urllib.parse.quote(filename,safe="")
  source["originalAssetUrl"]=original_url
  source["assetUrl"]="https://upload.wikimedia.org/wikipedia/commons/thumb/"+digest[0]+"/"+digest[:2]+"/"+encoded+"/1280px-"+encoded
  source["retrievalNote"]="Publisher-provided 1280px thumbnail, as recommended by Wikimedia for reuse; not an original-resolution file."
 cached=[i for i in previous if i["sourceId"]==source["sourceId"] and i["assetUrl"]==source["assetUrl"] and i["licenseUrl"]==source["licenseUrl"]]
 if cached and all(pathlib.Path(i["candidatePath"]).exists() and hashlib.sha256(pathlib.Path(i["candidatePath"]).read_bytes()).hexdigest()==i["candidateSha256"] for i in cached):
  items.extend([{**i,**source} for i in cached]);continue
 try:
  data=get(source["assetUrl"]);source_hash=hashlib.sha256(data).hexdigest()
  if source["kind"]=="pdf":
   with pymupdf.open(stream=data,filetype="pdf") as pdf:
    for n in source["pages"]:
     page=pdf[n-1]
     page.get_pixmap(matrix=pymupdf.Matrix(1.8,1.8)).pil_save(root/(source["sourceId"].lower()+"-page-"+str(n)+".jpg"))
     for info in page.get_image_info(xrefs=True):
      x=info["xref"]
      if x and info["width"]>=150 and info["height"]>=150:save(source,pdf.extract_image(x)["image"],"x"+str(x),n,x)
  else:save(source,data,"original")
 except Exception as e:
  failures.append({"sourceId":source["sourceId"],"errorType":type(e).__name__,"message":str(e)[:180]})
 time.sleep(3)
(root/"index.json").write_text(json.dumps({"version":1,"candidates":items,"failures":failures},ensure_ascii=False,indent=2)+"\n")
for offset in range(0,len(items),12):
 sheet=Image.new("RGB",(1200,1200),(245,245,245));draw=ImageDraw.Draw(sheet)
 for j,item in enumerate(items[offset:offset+12]):
  im=ImageOps.contain(Image.open(item["candidatePath"]),(380,245));x=(j%3)*400;y=(j//3)*300
  sheet.paste(im,(x+(400-im.width)//2,y+4))
  draw.text((x+8,y+257),str(offset+j+1)+" "+item["subjectTaxon"],fill="black")
  draw.text((x+8,y+277),item["candidateId"][:56],fill="black")
 sheet.save(root/("sheet-"+str(offset//12+1)+".jpg"),quality=88)
print(json.dumps({"candidates":len(items),"failures":failures}))
