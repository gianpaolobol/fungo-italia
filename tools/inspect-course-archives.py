"""Inspect three owner-supplied Drive ZIPs without publishing their originals."""
import contextlib, hashlib, io, json, pathlib, stat, tempfile, zipfile
import gdown
import pymupdf
ARCHIVES=[
 ("Atzeni", "1j_9dqN4wIXYAlFvaHRb19QKlhfXnq_ot",57307299),
 ("Morimando","1to-hjdAyzE8JB1KeFxn7BpLnd6QLTaUM",54892580),
 ("Salerni","1Y2tr4xaia5PbNt_HCFWDRfVncz5e6364",39658263),
]
results=[]
for label,file_id,expected_size in ARCHIVES:
 result={"label":label,"driveFileId":file_id,"expectedBytes":expected_size}
 try:
  with tempfile.TemporaryDirectory(prefix="course-") as directory:
   archive=pathlib.Path(directory)/"source.zip"
   with contextlib.redirect_stdout(io.StringIO()),contextlib.redirect_stderr(io.StringIO()):
    downloaded=gdown.download(id=file_id,output=str(archive),quiet=True,use_cookies=False)
   if not downloaded or not archive.exists(): raise RuntimeError("Drive download unavailable")
   if archive.stat().st_size!=expected_size: raise RuntimeError("Archive size differs from owner inventory")
   result["bytes"]=archive.stat().st_size
   result["sha256"]=hashlib.sha256(archive.read_bytes()).hexdigest()
   with zipfile.ZipFile(archive) as container:
    entries=container.infolist()
    if len(entries)>10000 or sum(e.file_size for e in entries)>1024**3: raise RuntimeError("Archive expansion exceeds inspection budget")
    files=[]
    for entry in entries:
     if entry.is_dir(): continue
     name=pathlib.PurePosixPath(entry.filename.replace("\\","/"))
     if name.is_absolute() or ".." in name.parts or stat.S_ISLNK(entry.external_attr>>16): raise RuntimeError("Unsafe archive entry")
     item={"path":str(name),"bytes":entry.file_size}
     if name.suffix.lower()==".pdf":
      if entry.file_size>128*1024**2: raise RuntimeError("PDF exceeds inspection budget")
      data=container.read(entry)
      with pymupdf.open(stream=data,filetype="pdf") as document:
       item["pages"]=len(document)
       item["passwordRequired"]=document.needs_pass
       item["copyPermitted"]=bool(document.permissions&pymupdf.PDF_PERM_COPY)
       if not document.needs_pass:
        item["textCharacters"]=sum(len(page.get_text()) for page in document)
     files.append(item)
    result["files"]=files
    result["status"]="downloaded-and-inspected"
 except Exception as error:
  # Do not print provider messages, tokens or temporary download URLs.
  result["status"]="unavailable"
  result["errorType"]=type(error).__name__
 results.append(result)
 print(json.dumps(result,ensure_ascii=False))
pathlib.Path("archive-inventory.json").write_text(json.dumps({"version":1,"archives":results},ensure_ascii=False,indent=2),encoding="utf-8")

if any(result['status']!='downloaded-and-inspected' for result in results):
 raise SystemExit('One or more course archives could not be inspected; see inventory.')
