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
taxa=["Agaricus bresadolanus","Agaricus bitorquis","Agaricus bisporus","Cyclocybe cylindracea","Amanita ovoidea","Amanita pantherina","Amanita muscaria","Amanita caesarea","Saproamanita vittadinii","Collybia phyllophila","Infundibulicybe geotropa","Infundibulicybe gibba","Clitopilus prunulus","Coprinopsis atramentaria","Coprinus comatus","Phlegmacium variiforme","Entoloma rhodopolium","Entoloma vernum","Entoloma saundersii","Galerina marginata","Hygrocybe conica","Hygrocybe punicea","Hypholoma fasciculare","Lentinula edodes","Lepiota cristata","Leucoagaricus leucothites","Panaeolus cyanescens","Kuehneromyces mutabilis","Stropharia rugosoannulata","Tricholoma filamentosum","Tricholoma equestre","Tricholoma terreum","Tricholoma sejunctum","Tricholoma imbricatum","Volvopluteus gloiocephalus","Volvariella volvacea","Lactifluus volemus","Lactarius tesquorum","Russula delica","Rubroboletus satanas","Rubroboletus pulchrotinctus","Caloboletus calopus","Hygrophoropsis aurantiaca","Craterellus tubaeformis","Craterellus cornucopioides","Gomphus clavatus","Gomphidius glutinosus","Hericium erinaceus","Hapalopilus rutilans","Laetiporus sulphureus","Scutiger pes-caprae","Polyporus umbellatus","Meripilus giganteus","Ramaria formosa","Ramaria pallida","Ramaria botrytis","Auricularia auricula-judae","Gyromitra esculenta","Sarcosphaera coronaria","Psilocybe semilanceata","Scleroderma citrinum","Morchella esculenta","Helvella lacunosa"]
licenses={"cc-by":("CC BY 4.0","https://creativecommons.org/licenses/by/4.0/"),"cc-by-sa":("CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"),"cc0":("CC0 1.0","https://creativecommons.org/publicdomain/zero/1.0/")}
if expert_ids:
 for target in taxa:
  try:
   params=urllib.parse.urlencode({"taxon_name":target,"user_id":",".join(expert_ids),"quality_grade":"research","photo_license":"cc-by,cc-by-sa,cc0","photos":"true","per_page":5,"order_by":"votes","order":"desc"})
   observations=get("https://api.inaturalist.org/v1/observations?"+params)["results"]
   matches=[]
   for obs in observations:
    if obs.get("taxon",{}).get("name")!=target or str(obs["user"]["id"]) not in expert_ids:continue
    photos=[a["photo"] for a in obs.get("observation_photos",[]) if a.get("photo",{}).get("license_code") in licenses]
    if photos:matches.append((len(photos),obs,photos))
   if not matches:report["searches"].append({"taxon":target,"usableObservations":0});continue
   _,obs,photos=max(matches,key=lambda x:x[0]);oid=obs["id"];author=obs["user"].get("name") or obs["user"]["login"];selected=[]
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
