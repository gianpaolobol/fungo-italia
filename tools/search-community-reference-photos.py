"""Acquire explicitly licensed European observations with strong documented community consensus. Candidates are not approved atlas illustrations."""
import json,pathlib,time,urllib.request,urllib.parse
p=pathlib.Path("src/data/reference-external-source-candidates.json");data=json.loads(p.read_text());known={s["sourceId"] for s in data["sources"]}
report={"searches":[],"failures":[]};licenses={"cc-by":("CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"),"cc-by-sa":("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"),"cc0":("CC0 1.0","https://creativecommons.org/publicdomain/zero/1.0/")}
def get(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"FungoItalia/1.0 source-evidence review github.com/gianpaolobol/fungo-italia"}),timeout=45) as r:return json.load(r)
for target in ["Agaricus bresadolanus","Tricholoma equestre","Russula delica","Coprinus comatus","Morchella esculenta","Verpa conica","Ramaria flava","Ramaria flavescens"]:
 try:
  params=urllib.parse.urlencode({"taxon_name":target,"quality_grade":"research","photo_license":"cc-by,cc-by-sa,cc0","photos":"true","per_page":60,"order_by":"votes","order":"desc","nelat":72,"nelng":50,"swlat":28,"swlng":-25})
  results=get("https://api.inaturalist.org/v1/observations?"+params)["results"];matches=[]
  for obs in results:
   actual=obs.get("taxon",{}).get("name")
   if actual!=target:continue
   identifiers={i.get("user",{}).get("id") for i in obs.get("identifications",[]) if i.get("current") and i.get("taxon",{}).get("id")==obs["taxon"]["id"]}
   identifiers.discard(None)
   if len(identifiers)<2:continue
   photos=[a["photo"] for a in obs.get("observation_photos",[]) if a.get("photo",{}).get("license_code") in licenses]
   if photos:matches.append((len(photos),len(identifiers),obs,photos))
  if not matches:report["searches"].append({"taxon":target,"qualifiedObservations":0});continue
  for _,votes,obs,photos in sorted(matches,key=lambda x:(x[0],x[1]),reverse=True)[:8]:
   oid=obs["id"];author=obs["user"].get("name") or obs["user"]["login"];selected=[]
   for photo in photos[:4]:
    pid=photo["id"];code=photo["license_code"];url=photo.get("original_url") or photo.get("url","").replace("/square.","/original.")
    if not url.startswith("https://inaturalist-open-data.s3.amazonaws.com/") or "/original." not in url:continue
    sid="EXT-INAT-"+str(oid)+"-"+str(pid);selected.append({"photoId":pid,"assetUrl":url,"licenseCode":code})
    if sid in known:continue
    source="https://www.inaturalist.org/observations/"+str(oid)
    data["sources"].append({"sourceId":sid,"subjectTaxon":target,"sourceUrl":source,"assetUrl":url,"author":author,"licenseName":licenses[code][0],"licenseUrl":licenses[code][1],"licenseEvidenceUrl":source,"taxonomicEvidence":source,"verificationBasis":"Primary European research-grade observation with at least two current matching species identifications and explicit native-photo license; not an independent scientific determination. Photo angles remain pending review.","kind":"image","primaryObservationId":oid,"primaryPhotoId":pid,"qualityGrade":"research","supportingIdentifierCount":votes});known.add(sid)
   report["searches"].append({"taxon":target,"observationId":oid,"author":author,"supportingIdentifierCount":votes,"photos":selected,"placeDescription":obs.get("place_guess"),"identifications":[{"name":i.get("user",{}).get("name") or i.get("user",{}).get("login"),"taxon":i.get("taxon",{}).get("name"),"current":i.get("current")} for i in obs.get("identifications",[])]})
 except Exception as exc:report["failures"].append({"taxon":target,"message":str(exc)[:150]})
 time.sleep(5)
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
(pathlib.Path("reference-candidates")/"community-observation-evidence.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"searches":len(report["searches"]),"failures":report["failures"]}))
