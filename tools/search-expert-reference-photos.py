"""Search only named, previously documented specialist accounts; all outputs remain pending visual review."""
import json,pathlib,time,urllib.request,urllib.parse
path=pathlib.Path("src/data/reference-external-source-candidates.json");data=json.loads(path.read_text());known={s["sourceId"] for s in data["sources"]};report={"specialists":[],"searches":[],"failures":[]};expert_ids=[]
headers={"User-Agent":"FungoItalia/1.0 educational photograph curation github.com/gianpaolobol/fungo-italia"}
def get(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=45) as r:return json.load(r)
for oid in [232719197,19154361,34492154,45700061]:
 try:
  obs=get("https://api.inaturalist.org/v1/observations/"+str(oid))["results"][0];u=obs["user"];expert_ids.append(str(u["id"]));report["specialists"].append({"userId":u["id"],"name":u.get("name") or u.get("login"),"sourceObservation":oid})
 except Exception as e:report["failures"].append({"anchor":oid,"message":str(e)[:150]})
 time.sleep(5)

try:
 params=urllib.parse.urlencode({"user_id":"alan_rockefeller","taxon_name":"Panaeolus cyanescens","photos":"true","per_page":1})
 anchors=get("https://api.inaturalist.org/v1/observations?"+params)["results"]
 for obs in anchors:
  u=obs["user"]
  if (u.get("name") or "").casefold()=="alan rockefeller":
   expert_ids.append(str(u["id"]));report["specialists"].append({"userId":u["id"],"name":u["name"],"sourceObservation":obs["id"]})
except Exception as exc:report["failures"].append({"account":"Alan Rockefeller","message":str(exc)[:150]})
time.sleep(5)

taxa=["Leucocoprinus leucothites","Agaricus romagnesii","Agaricus infidus","Cortinarius variiformis","Phlegmacium variiforme","Entoloma saundersii","Panaeolus cyanescens"]
licenses={"cc-by":("CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"),"cc-by-sa":("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"),"cc0":("CC0 1.0","https://creativecommons.org/publicdomain/zero/1.0/")}
if expert_ids:
 for target in taxa:
  try:
   params=urllib.parse.urlencode({"taxon_name":target,"user_id":",".join(expert_ids),"quality_grade":"research","photo_license":"cc-by,cc-by-sa,cc0","photos":"true","per_page":15,"order_by":"votes","order":"desc"})
   observations=get("https://api.inaturalist.org/v1/observations?"+params)["results"]
   matches=[]
   for obs in observations:
    if obs.get("taxon",{}).get("name")!=target or str(obs["user"]["id"]) not in expert_ids:continue
    photos=[a["photo"] for a in obs.get("observation_photos",[]) if a.get("photo",{}).get("license_code") in licenses]
    if photos:matches.append((len(photos),obs,photos))
   if not matches:report["searches"].append({"taxon":target,"usableObservations":0});continue
   for _,obs,photos in sorted(matches,key=lambda x:x[0],reverse=True)[:3]:
    oid=obs["id"];author=obs["user"].get("name") or obs["user"]["login"];selected=[]
    for photo in photos[:4]:
     pid=photo["id"];code=photo["license_code"];url=photo.get("original_url") or photo.get("url","").replace("/square.","/original.")
     if not url.startswith("https://") or "/original." not in url:continue
     sid="EXT-INAT-"+str(oid)+"-"+str(pid);selected.append({"photoId":pid,"assetUrl":url,"licenseCode":code})
     if sid in known:continue
     sourceurl="https://www.inaturalist.org/observations/"+str(oid)
     data["sources"].append({"sourceId":sid,"subjectTaxon":target,"sourceUrl":sourceurl,"assetUrl":url,"author":author,"licenseName":licenses[code][0],"licenseUrl":licenses[code][1],"licenseEvidenceUrl":sourceurl,"taxonomicEvidence":sourceurl,"verificationBasis":"Named specialist account, primary observation consensus and photo-specific license verified through the provider API; independent visual and taxonomic limitations reviewed separately.","kind":"image","primaryObservationId":oid,"primaryPhotoId":pid,"qualityGrade":obs.get("quality_grade")})
     known.add(sid)
    report["searches"].append({"taxon":target,"observationId":oid,"author":author,"photos":selected,"placeDescription":obs.get("place_guess")})
  except Exception as e:report["failures"].append({"taxon":target,"message":str(e)[:150]})
  time.sleep(5)
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
out=pathlib.Path("reference-candidates");out.mkdir(exist_ok=True)
(out/"expert-observation-search.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"searches":len(report["searches"]),"failures":len(report["failures"])}))
