import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { validateCatalogProposal } from '@/lib/catalog-proposal';
import { resolveContributionTaxon,storageTaxonFor } from '@/lib/catalog-taxonomy';
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return NextResponse.json({error:'Registrazione richiesta.'},{status:401});if(!env.DB)return NextResponse.json({error:'Archivio temporaneamente non disponibile.'},{status:503});
 let body:unknown;try{body=await request.json();}catch{return NextResponse.json({errors:['Dati della proposta non validi.']},{status:400});}
 const validation=validateCatalogProposal(body);if(!validation.success)return NextResponse.json({errors:validation.errors},{status:400});const proposal=validation.data;
 if((proposal.proposalKind==='create')!==(proposal.fieldPath==='taxonomy.create'))return NextResponse.json({errors:['Tipo proposta e campo non coerenti.']},{status:400});
 const target=proposal.targetTaxonId?resolveContributionTaxon(proposal.targetTaxonId):null;
 if(proposal.proposalKind==='update'&&!target)return NextResponse.json({errors:['La scheda selezionata non è disponibile.']},{status:400});
 const stored=target?storageTaxonFor(target):null;
 const id=crypto.randomUUID(),fieldId=crypto.randomUUID();
 try{
 if(stored){const existing=await env.DB.prepare('SELECT id,rank FROM taxa WHERE scientific_name=?').bind(stored.scientificName).first<{id:string;rank:string}>();if(existing&&existing.rank!==stored.rank)return NextResponse.json({error:'Conflitto fra concetti tassonomici: serve riconciliazione curatoriale.'},{status:409});}
 const valueJson=JSON.stringify({value:proposal.proposedValue,scientificName:proposal.proposedScientificName,rank:proposal.proposedRank,requestedTaxonId:target?.id??null});
 await env.DB.batch([
 env.DB.prepare("INSERT INTO users(id,email,display_name,role) VALUES(?,?,?,'collector') ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name,updated_at=CURRENT_TIMESTAMP").bind(user.userId,user.email,user.displayName),
 ...(stored?[env.DB.prepare('INSERT OR IGNORE INTO taxa(id,scientific_name,rank,edibility,recognition_level,morphology_depth_required,safety_note) VALUES(?,?,?,?,?,?,?)').bind(stored.id,stored.scientificName,stored.rank,stored.edibility,stored.recognitionLevel??'minimo',stored.recognitionLevel==='approfondito'?1:0,stored.safetyNote)]:[]),
 env.DB.prepare("INSERT INTO catalog_change_sets(id,author_id,target_taxon_id,proposal_kind,status,criticality,region_scope,taxonomic_scope,rationale) VALUES(?,?,(SELECT id FROM taxa WHERE scientific_name=? AND rank=?),?,'submitted',?,?,?,?)").bind(id,user.userId,stored?.scientificName??null,stored?.rank??null,proposal.proposalKind,proposal.proposalKind==='create'?'critical':proposal.criticality,proposal.regionScope,proposal.taxonomicScope,proposal.rationale),
 env.DB.prepare('INSERT INTO catalog_field_changes(id,change_set_id,field_path,previous_value_json,proposed_value_json,source_citation,evidence_note) VALUES(?,?,?,NULL,?,?,?)').bind(fieldId,id,proposal.fieldPath,valueJson,proposal.sourceCitation,proposal.rationale),
 ]);return NextResponse.json({id,status:'submitted',criticality:proposal.proposalKind==='create'?'critical':proposal.criticality},{status:201});}catch(error){console.error('catalog_proposal_failed',error);return NextResponse.json({error:'Invio non riuscito. Riprova.'},{status:500});}
}
