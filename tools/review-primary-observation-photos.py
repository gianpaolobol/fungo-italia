"""Retrieve public source metadata and explicitly reusable photos from the primary observation provider."""
import json,pathlib,time,urllib.request,urllib.error
path=pathlib.Path("src/data/reference-external-source-candidates.json")
data=json.loads(path.read_text()); ids={s["sourceId"] for s in data["sources"]}; evidence=[]; failures=[]
targets={232719197:"Gyroporus cyanescens",194984296:"Caloboletus radicans",244111371:"Caloboletus radicans",41289920:"Gyroporus cyanescens",241513396:"Caloboletus radicans",155152863:"Gyromitra esculenta",34492154:"Entoloma sinuatum"}
licenses={"cc-by":("CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"),"cc-by-sa":("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"),"cc0":("CC0 1.0","https://creativecommons.org/publicdomain/zero/1.0/")}
try:
 req=urllib.request.Request("https://api.gbif.org/v1/occurrence/1978831435",headers={"User-Agent":"FungoItalia/1.0 github.com/gianpaolobol/fungo-italia"})
 with urllib.request.urlopen(req,timeout=45) as r:gbif=json.load(r)
 references=str(gbif.get("occurrenceID",""))+" "+str(gbif.get("references",""))
 import re
 match=re.search(r"inaturalist.org/observations/(\\d+)",references)
 if match:targets[int(match.group(1))]="Entoloma clypeatum"
 evidence.append({"gbifOccurrenceId":1978831435,"scientificName":gbif.get("scientificName"),"references":references,"media":gbif.get("media")})
except Exception as e:failures.append({"gbifOccurrenceId":1978831435,"type":type(e).__name__,"message":str(e)[:150]})
for oid,target in targets.items():
 try:
  req=urllib.request.Request("https://api.inaturalist.org/v1/observations/"+str(oid),headers={"User-Agent":"FungoItalia/1.0 educational reference curation github.com/gianpaolobol/fungo-italia"})
  with urllib.request.urlopen(req,timeout=45) as r:obs=json.load(r)["results"][0]
  if obs.get("taxon",{}).get("name")!=target:raise ValueError("Observation consensus differs from requested taxon")
  photos=obs.get("observation_photos",[]); summary={"observationId":oid,"taxon":target,"qualityGrade":obs.get("quality_grade"),"author":obs.get("user",{}).get("name") or obs.get("user",{}).get("login"),"photos":[]}
  for association in photos[:6]:
   photo=association.get("photo",{}); code=photo.get("license_code");pid=photo.get("id")
   if code not in licenses or not pid:continue
   url=photo.get("original_url") or photo.get("url","").replace("/square.","/original.")
   if not url.startswith("https://") or url==photo.get("url") and "/original." not in url:continue
   source="EXT-INAT-"+str(oid)+"-"+str(pid)
   summary["photos"].append({"photoId":pid,"assetUrl":url,"licenseCode":code,"attribution":photo.get("attribution")})
   if source in ids:continue
   evidence_url="https://www.inaturalist.org/observations/"+str(oid)
   data["sources"].append({"sourceId":source,"subjectTaxon":target,"sourceUrl":evidence_url,"assetUrl":url,"author":photo.get("attribution") or summary["author"],"licenseName":licenses[code][0],"licenseUrl":licenses[code][1],"licenseEvidenceUrl":evidence_url,"taxonomicEvidence":evidence_url,"verificationBasis":"Primary public observation consensus and photo-specific license confirmed through iNaturalist API; visual angle and identification limitations reviewed separately.","kind":"image","primaryObservationId":oid,"primaryPhotoId":pid,"qualityGrade":obs.get("quality_grade")})
   ids.add(source)
  evidence.append(summary)
 except Exception as e:failures.append({"observationId":oid,"type":type(e).__name__,"message":str(e)[:150]})
 time.sleep(5)
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
out=pathlib.Path("reference-candidates");out.mkdir(exist_ok=True)
(out/"primary-observation-evidence.json").write_text(json.dumps({"observations":evidence,"failures":failures},ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"observations":len(evidence),"failures":failures}))
