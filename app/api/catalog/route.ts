import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { applyPublishedChanges,type PublishedFieldChange } from '@/lib/catalog-publication';
import { catalogTaxa } from '@/lib/objective-catalog';
import { studyAtlasTaxa } from '@/lib/study-atlas-catalog';
import { equivalentCatalogIds } from '@/lib/catalog-taxonomy';
import { parseCatalogSearchParams,searchCatalog,toPublicCatalogSearchDocument } from '@/lib/catalog-search';
import { shouldUseCatalogServerSearch } from '@/lib/catalog-search-request';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const user=await getChatGPTUser();if(!user)return NextResponse.json({error:'Registrazione richiesta.'},{status:401});
 const params=new URL(request.url).searchParams;
 if(shouldUseCatalogServerSearch(params)){const result=searchCatalog(parseCatalogSearchParams(params));return NextResponse.json({mode:'search',status:'live',...result,items:result.items.map(toPublicCatalogSearchDocument)},{headers:{'Cache-Control':'private, no-store'}});}
 const base={release:'beta-base',taxa:catalogTaxa,studyTaxa:studyAtlasTaxa,status:'degraded'};
 if(!env.DB)return NextResponse.json(base,{headers:{'Cache-Control':'private, no-store'}});
 try{
 const result=await env.DB.prepare("SELECT cs.id AS changeSetId,cs.status,cs.proposal_kind AS proposalKind,cs.target_taxon_id AS targetTaxonId,fc.field_path AS fieldPath,fc.proposed_value_json AS proposedValueJson,cs.region_scope AS regionScope,cr.published_at AS publishedAt FROM catalog_change_sets cs JOIN catalog_field_changes fc ON fc.change_set_id=cs.id JOIN catalog_releases cr ON cr.id=cs.published_release_id WHERE cs.status='published' ORDER BY cr.published_at ASC,cs.id ASC").all<PublishedFieldChange>();
 const expanded=result.results.flatMap(change=>change.targetTaxonId?equivalentCatalogIds(change.targetTaxonId).map(targetTaxonId=>({...change,targetTaxonId})):[change]);
 const studyChanges=expanded.filter(change=>change.proposalKind==='update'&&studyAtlasTaxa.some(taxon=>taxon.id===change.targetTaxonId));
 return NextResponse.json({release:result.results.at(-1)?.publishedAt??'beta-base',taxa:applyPublishedChanges(catalogTaxa,expanded),studyTaxa:applyPublishedChanges(studyAtlasTaxa,studyChanges),status:'live'},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){console.error('catalog_read_failed',error);return NextResponse.json(base,{headers:{'Cache-Control':'private, no-store'}});}
}
