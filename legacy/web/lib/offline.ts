import type { AtlasTaxon } from "./domain.ts";
import { buildSummaryCardIndex } from "./summary-cards.ts";
export { prepareOfflineReader, cachePackageImages } from "./offline-registration.ts";
export const OFFLINE_SCHEMA = 1;
export const OFFLINE_PACKAGE_KEY = "fungo-public-study-package-v1";
export const OFFLINE_FAVORITES_KEY = "fungo-study-favorites-v1";
export const OFFLINE_RESUME_KEY = "fungo-study-resume-v1";
export interface OfflineCard {
 id: string; name: string; scientificName: string; rank: string;
 safety: string; edibility: string; status: string; basis: string;
 characters: string[]; differentiating: string | null;
 habitat: string | null; season: string | null; evidenceScope: string;
 sources: Array<{ title: string; page: number; kind: string }>;
 image: string | null;
}
export interface OfflinePackage { schema: number; version: string; savedAt: string; cards: OfflineCard[]; cachedImages: string[]; }
export function approvedOfflineImage(value: string | null | undefined): string | null {
 if (!value || !/^\/schede\/[a-zA-Z0-9/_-]+\.(webp|png|jpe?g)$/.test(value)) return null;
 return value;
}
export function packageVersion(cards: readonly OfflineCard[]): string {
 const source = JSON.stringify(cards); let hash = 2166136261;
 for (let i=0;i<source.length;i++) hash=Math.imul(hash ^ source.charCodeAt(i),16777619);
 return "study-v1-"+(hash >>> 0).toString(16);
}
/** Public study projection only: no users, observations or coordinates. */
export function buildOfflinePackage(taxa: readonly AtlasTaxon[], now=new Date()): OfflinePackage {
 const summaries=buildSummaryCardIndex(taxa);
 const cards: OfflineCard[]=taxa.map((taxon,index)=>{
  const summary=summaries[index];
  return {
   id:taxon.id,name:taxon.commonName,scientificName:taxon.scientificName,rank:taxon.rank,
   safety:taxon.safetyNote,edibility:taxon.edibility,status:summary.reviewStatus,basis:summary.basis,
   characters:summary.presentation.diagnosticCharacters ?? [],differentiating:summary.presentation.differentiatingCharacter,
   habitat:summary.presentation.habitatSummary,season:summary.presentation.seasonSummary,
   evidenceScope:"Profilo di studio con audit interno; non equivale a revisione micologica indipendente. Le fonti didattiche attestano obiettivi e rango: non provano automaticamente ogni carattere diagnostico.",
   sources:taxon.sources.map(({title,page,kind})=>({title,page,kind})),image:null
  };
 });
 return {schema:OFFLINE_SCHEMA,version:packageVersion(cards),savedAt:now.toISOString(),cards,cachedImages:[]};
}
export function parseOfflinePackage(raw:string|null):OfflinePackage|null {
 if(!raw)return null;
 try {
  const value=JSON.parse(raw) as OfflinePackage;
  if(!value||typeof value!=="object"||value.schema!==OFFLINE_SCHEMA||!Array.isArray(value.cards)||value.cards.length>1000||typeof value.version!=="string"||typeof value.savedAt!=="string"||!Number.isFinite(Date.parse(value.savedAt))||!Array.isArray(value.cachedImages))return null;
  if(!value.cachedImages.every(image=>typeof image==="string"&&approvedOfflineImage(image)===image))return null;
  if(!value.cards.every(card=>card&&typeof card==="object"&&typeof card.id==="string"&&typeof card.name==="string"&&typeof card.scientificName==="string"&&typeof card.safety==="string"&&typeof card.rank==="string"&&typeof card.edibility==="string"&&typeof card.status==="string"&&typeof card.basis==="string"&&typeof card.evidenceScope==="string"&&Array.isArray(card.characters)&&card.characters.every(item=>typeof item==="string")&&(card.differentiating===null||typeof card.differentiating==="string")&&(card.habitat===null||typeof card.habitat==="string")&&(card.season===null||typeof card.season==="string")&&(card.image===null||approvedOfflineImage(card.image)===card.image)&&Array.isArray(card.sources)&&card.sources.every(source=>source&&typeof source.title==="string"&&Number.isInteger(source.page)&&typeof source.kind==="string")))return null;
  return value;
 }catch{return null;}
}
export function readFavoriteIds(raw:string|null):string[]{
 try{const parsed:unknown=JSON.parse(raw??"[]");return Array.isArray(parsed)?[...new Set(parsed.filter((id):id is string=>typeof id==="string"&&id.length<200))].slice(0,1000):[];}catch{return [];}
}
export function readStoredPackage():OfflinePackage|null{
 if(typeof window==="undefined")return null;
 try{return parseOfflinePackage(localStorage.getItem(OFFLINE_PACKAGE_KEY));}catch{return null;}
}
