import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { applyPublishedChanges,type PublishedFieldChange } from "@/lib/catalog-publication";
import { catalogTaxa } from "@/lib/objective-catalog";
import { studyAtlasTaxa } from "@/lib/study-atlas-catalog";
import { equivalentCatalogIds } from "@/lib/catalog-taxonomy";
import { catalogSearchDocuments,parseCatalogSearchParams,searchCatalog,toPublicCatalogSearchDocument } from "@/lib/catalog-search";
import { overlayPublishedStudySearchDocuments } from "@/lib/published-study-search";
import { shouldUseCatalogServerSearch } from "@/lib/catalog-search-request";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return NextResponse.json({error:"Registrazione richiesta."},{status:401});
 let changes:Array<PublishedFieldChange & {sourceCitation:string}>=[],status:"live"|"degraded"="degraded";
 if(env.DB)try{
 const result=await env.DB.prepare("SELECT cs.id AS changeSetId,cs.status,cs.proposal_kind AS proposalKind,cs.target_taxon_id AS targetTaxonId,fc.field_path AS fieldPath,fc.proposed_value_json AS proposedValueJson,fc.source_citation AS sourceCitation,cs.region_scope AS regionScope,cr.published_at AS publishedAt FROM catalog_change_sets cs JOIN catalog_field_changes fc ON fc.change_set_id=cs.id JOIN catalog_releases cr ON cr.id=cs.published_release_id WHERE cs.status='published' ORDER BY cr.published_at ASC,cs.id ASC").all<PublishedFieldChange & {sourceCitation:string}>();
 changes=result.results;status="live";
 }catch(error){console.error("catalog_read_failed",error);}
 const expanded=changes.flatMap(change=>change.targetTaxonId?equivalentCatalogIds(change.targetTaxonId).map(targetTaxonId=>({...change,targetTaxonId})):[change]);
 const studyChanges=expanded.filter(change=>change.proposalKind==="update"&&studyAtlasTaxa.some(taxon=>taxon.id===change.targetTaxonId));
 const studyTaxa=applyPublishedChanges(studyAtlasTaxa,studyChanges);
 const params=new URL(request.url).searchParams;
 if(shouldUseCatalogServerSearch(params)){
 const result=searchCatalog(parseCatalogSearchParams(params),overlayPublishedStudySearchDocuments(catalogSearchDocuments,studyTaxa));
 return NextResponse.json({mode:"search",status,...result,items:result.items.map(toPublicCatalogSearchDocument)},{headers:{"Cache-Control":"private, no-store"}});
 }
 const publishedUpdates=changes.map(change=>({...change,targetIds:change.targetTaxonId?equivalentCatalogIds(change.targetTaxonId):[],value:parseValue(change.proposedValueJson)}));
 return NextResponse.json({release:changes.at(-1)?.publishedAt??"beta-base",taxa:applyPublishedChanges(catalogTaxa,expanded),studyTaxa,publishedUpdates,status},{headers:{"Cache-Control":"private, no-store"}});
}
function parseValue(raw:string):string{
 try{const input=JSON.parse(raw) as {value?:unknown;scientificName?:unknown;rank?:unknown};return [input.scientificName,input.rank,input.value].filter((value):value is string=>typeof value==="string").join(" · ");}catch{return "Valore non leggibile";}
}
