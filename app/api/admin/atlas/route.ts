import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { studyAtlasTaxa } from "@/lib/study-atlas-catalog";
import { storageTaxonFor } from "@/lib/catalog-taxonomy";
import { isFounderAdmin } from "@/lib/founder-admin";
import { validateMaterializableChange } from "@/lib/catalog-publication";
type RuntimeEnv={CATALOG_CURATOR_EMAILS?:string};
const allowedFields=new Set(["names.common","taxonomy.acceptedScientificName","edibility.safetyNote","diagnostics.odor","ecology.association"]);
export async function GET(){
 const user=await getChatGPTUser();if(!user)return NextResponse.json({error:"Registrazione richiesta."},{status:401});
 const founder=isFounderAdmin(user.email,(env as unknown as RuntimeEnv).CATALOG_CURATOR_EMAILS);
 return NextResponse.json({founder,taxa:studyAtlasTaxa.map(({id,scientificName,commonName})=>({id,scientificName,commonName}))},{headers:{"Cache-Control":"private, no-store"}});
}
export async function PATCH(request:Request){
 const user=await getChatGPTUser();if(!user)return NextResponse.json({error:"Registrazione richiesta."},{status:401});
 if(!isFounderAdmin(user.email,(env as unknown as RuntimeEnv).CATALOG_CURATOR_EMAILS))return NextResponse.json({error:"Accesso riservato al fondatore-admin."},{status:403});
 if(!env.DB)return NextResponse.json({error:"Archivio non disponibile."},{status:503});
 let raw:unknown;try{raw=await request.json();}catch{return NextResponse.json({error:"Dati non validi."},{status:400});}
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return NextResponse.json({error:"Dati non validi."},{status:400});
 const input=raw as Record<string,unknown>;
 if(!["taxonId","fieldPath","value","sourceCitation","rationale"].every(key=>typeof input[key]==="string"&&(input[key] as string).trim()))return NextResponse.json({error:"Compila taxon, campo, valore, fonte e motivazione."},{status:400});
 const taxonId=input.taxonId as string,fieldPath=input.fieldPath as string,value=(input.value as string).trim(),citation=(input.sourceCitation as string).trim(),rationale=(input.rationale as string).trim();
 const taxon=studyAtlasTaxa.find(t=>t.id===taxonId);
 if(!taxon||!allowedFields.has(fieldPath)||citation.length<6||rationale.length<20)return NextResponse.json({error:"Seleziona una scheda e indica fonte verificabile e motivazione di almeno 20 caratteri."},{status:400});
 const proposedValueJson=JSON.stringify({value,requestedTaxonId:taxon.id});
 const validation=validateMaterializableChange({proposalKind:"update",fieldPath,targetTaxonId:taxon.id,proposedValueJson},studyAtlasTaxa);
 if(validation)return NextResponse.json({error:validation},{status:400});
 const stored=storageTaxonFor(taxon),critical=fieldPath.startsWith("taxonomy.")||fieldPath.startsWith("edibility.");
 const changeSetId=crypto.randomUUID(),fieldChangeId=crypto.randomUUID(),releaseId=critical?null:crypto.randomUUID(),now=new Date().toISOString();
 try{
 const existing=await env.DB.prepare("SELECT rank FROM taxa WHERE scientific_name=?").bind(stored.scientificName).first<{rank:string}>();
 if(existing&&existing.rank!==stored.rank)return NextResponse.json({error:"Conflitto di rango: serve riconciliazione curatoriale."},{status:409});
 await env.DB.batch([
 env.DB.prepare("INSERT INTO users(id,email,display_name,role) VALUES(?,?,?,'scientificCurator') ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name,updated_at=CURRENT_TIMESTAMP").bind(user.userId,user.email,user.displayName),
 env.DB.prepare("INSERT INTO taxa(id,scientific_name,rank,edibility,recognition_level,morphology_depth_required,safety_note) VALUES(?,?,?,?,?,?,?) ON CONFLICT(scientific_name) DO UPDATE SET scientific_name=CASE WHEN taxa.rank=excluded.rank THEN taxa.scientific_name ELSE NULL END").bind(stored.id,stored.scientificName,stored.rank,stored.edibility,stored.recognitionLevel??"minimo",stored.recognitionLevel==="approfondito"?1:0,stored.safetyNote),
 env.DB.prepare("INSERT INTO catalog_change_sets(id,author_id,target_taxon_id,proposal_kind,status,criticality,rationale,published_release_id) VALUES(?,?,(SELECT id FROM taxa WHERE scientific_name=? AND rank=?),'update',?,?,?,?)").bind(changeSetId,user.userId,stored.scientificName,stored.rank,critical?"submitted":"published",critical?"critical":"ordinary",rationale,releaseId),
 env.DB.prepare("INSERT INTO catalog_field_changes(id,change_set_id,field_path,proposed_value_json,source_citation,evidence_note) VALUES(?,?,?,?,?,?)").bind(fieldChangeId,changeSetId,fieldPath,proposedValueJson,citation,rationale),
 ...(releaseId?[env.DB.prepare("INSERT INTO catalog_releases(id,version,published_by,published_at,source_report_json) VALUES(?,?,?,?,?)").bind(releaseId,"founder-"+now.replace(/\D/g,"")+"-"+releaseId.slice(0,8),user.userId,now,JSON.stringify({changeSetId,directFounderPublication:true,critical:false}))]:[])
 ]);
 return NextResponse.json({ok:true,changeSetId,status:critical?"submitted":"published",publishedAt:critical?null:now});
 }catch(error){console.error("founder_change_failed",error);return NextResponse.json({error:"Modifica non salvata. Riprova."},{status:500});}
}
