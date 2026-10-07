"""Acquire explicitly licensed European observations with strong documented community consensus. Candidates are not approved atlas illustrations."""
import json,pathlib,time,urllib.request,urllib.parse
p=pathlib.Path("src/data/reference-external-source-candidates.json");data=json.loads(p.read_text());known={s["sourceId"] for s in data["sources"]}
report={"searches":[],"failures":[]};licenses={"cc-by":("CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"),"cc-by-sa":("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"),"cc0":("CC0 1.0","https://creativecommons.org/publicdomain/zero/1.0/")}
def get(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"FungoItalia/1.0 source-evidence review github.com/gianpaolobol/fungo-italia"}),timeout=45) as r:return json.load(r)

for oid in [328628028,139353633,34346955,58497477,152210983,54721825,54869908]:
 try:
  obs=get("https://api.inaturalist.org/v1/observations/"+str(oid))["results"][0]
  if obs.get("quality_grade")!="research":continue
  target=obs["taxon"]["name"];author=obs["user"].get("name") or obs["user"]["login"]
  photos=[a["photo"] for a in obs.get("observation_photos",[]) if a.get("photo",{}).get("license_code") in licenses]
  for photo in photos[:6]:
   pid=photo["id"];code=photo["license_code"];url=photo.get("original_url") or photo.get("url","").replace("/square.","/original.")
   if not url.startswith("https://inaturalist-open-data.s3.amazonaws.com/"):continue
   source="https://www.inaturalist.org/observations/"+str(oid);sid="EXT-INAT-"+str(oid)+"-"+str(pid)
   if sid in known:continue
   data["sources"].append({"sourceId":sid,"subjectTaxon":target,"sourceUrl":source,"assetUrl":url,"author":author,"licenseName":licenses[code][0],"licenseUrl":licenses[code][1],"licenseEvidenceUrl":source,"taxonomicEvidence":source,"verificationBasis":"Primary research-grade observation and explicit native-photo license verified through provider API. Photo and taxonomic limits require independent visual review; no certification.","kind":"image","primaryObservationId":oid,"primaryPhotoId":pid});known.add(sid)
  report["searches"].append({"taxon":target,"observationId":oid,"author":author,"placeDescription":obs.get("place_guess"),"identifications":obs.get("identifications",[])})
 except Exception as exc:report["failures"].append({"observationId":oid,"message":str(exc)[:150]})
 time.sleep(3)
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
(pathlib.Path("reference-candidates")/"targeted-observation-evidence.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
