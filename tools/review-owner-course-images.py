"""Create contact sheets from photographs extracted through authorized owner access."""
import json,pathlib,hashlib
from PIL import Image,ImageOps,ImageDraw
root=pathlib.Path("photo-review")
index=json.loads((root/"owner-image-index.json").read_text())
inventory=json.loads((root/"inventory.json").read_text())
for source in index["documents"]:
 source["sheets"]=[]
 for image in source["images"]:
  path=pathlib.Path(image["path"])
  if hashlib.sha256(path.read_bytes()).hexdigest()!=image["imageSha256"]:raise RuntimeError("Transferred photo changed")
 for offset in range(0,len(source["images"]),20):
  sheet=Image.new("RGB",(1200,1300),(245,245,245));draw=ImageDraw.Draw(sheet)
  for i,entry in enumerate(source["images"][offset:offset+20]):
   im=ImageOps.contain(Image.open(entry["path"]).convert("RGB"),(282,210))
   x=(i%4)*300;y=(i//4)*260
   sheet.paste(im,(x+(300-im.width)//2,y+18))
   draw.text((x+8,y+232),str(offset+i+1)+" | p"+str(entry["page"])+"-x"+str(entry["xref"]),fill="black")
  name="owner-"+source["driveFileId"]+"-sheet-"+str(offset//20+1)+".jpg";sheet.save(root/name,quality=84)
  source["sheets"].append({"path":"photo-review/"+name,"from":offset+1,"to":min(offset+20,len(source["images"]))})
 source["status"]="extracted-through-owner-access"
 old=next((i for i,d in enumerate(inventory["documents"]) if d["sourceId"]==source["sourceId"]),None)
 if old is None:inventory["documents"].append(source)
 else:inventory["documents"][old]=source
(root/"owner-image-index.json").write_text(json.dumps(index,ensure_ascii=False,indent=2)+"\n")
(root/"inventory.json").write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+"\n")
print("Reviewed owner-access image transfer:",sum(len(d["images"]) for d in index["documents"]))
