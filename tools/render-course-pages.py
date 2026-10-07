"""Render named teaching pages for photographic attribution review."""
import contextlib,hashlib,io,json,pathlib,tempfile
import gdown,pymupdf
from PIL import Image
ROOT=pathlib.Path(".")
registry=json.loads((ROOT/"src/data/course-sources.json").read_text())
sources={s["driveFileId"]:s for s in registry["documents"]}
out=ROOT/"photo-review/pages";out.mkdir(parents=True,exist_ok=True)
report={"version":1,"sources":[]}
for file_id,pages in [
 ("1598gJqWSZ_Ylop0wmmm1tKfhlLttlrIm",[30,31,32,37,38,39,56,57,66,67]),
 ("1TknM1ntP2i72lvN4j3T9drOyoUxKwFE6",[34,42,121,136]),
 ("1ok-z5Wsxf0CwQ7gCy7Ne4YqK1NpmLeqH",[31]),
 ("1-lW1hrEK2ll8fItkPHfJi-oRzugXYlxr",[71,74]),
 ("1gIqusMIlu44WM8IQFf23kNIhIv4HsVaK",[30]),
 ("1_dhoC5hs6I5tG_bAI145535dXMtXEa_V",[53,54,62])
]:
 source=sources[file_id]
 with tempfile.TemporaryDirectory() as tmp:
  path=pathlib.Path(tmp)/"source.pdf"
  with contextlib.redirect_stdout(io.StringIO()),contextlib.redirect_stderr(io.StringIO()):
   ok=gdown.download(id=file_id,output=str(path),quiet=True,use_cookies=False)
  if not ok or not path.exists() or path.stat().st_size!=source["bytes"]:raise RuntimeError("Source unavailable or changed")
  digest=hashlib.sha256(path.read_bytes()).hexdigest()
  entry={"sourceId":source["sourceId"],"sha256":digest,"pages":[]}
  with pymupdf.open(path) as pdf:
   for number in pages:
    page=pdf[number-1]
    pix=page.get_pixmap(matrix=pymupdf.Matrix(1600/page.rect.width,1600/page.rect.width),alpha=False)
    im=Image.frombytes("RGB",(pix.width,pix.height),pix.samples)
    filename=file_id+"-p"+str(number)+".jpg";im.save(out/filename,quality=92,optimize=True)
    entry["pages"].append({"page":number,"text":page.get_text(),"path":"photo-review/pages/"+filename,"images":[{"xref":i["xref"],"bbox":list(i["bbox"])} for i in page.get_image_info(xrefs=True)]})
  report["sources"].append(entry)
(out/"index.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print("Rendered",sum(len(s["pages"]) for s in report["sources"]),"source pages for review.")
