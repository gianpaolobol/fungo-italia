import type { CatalogSearchDocument } from "./catalog-search.ts";
import type { Taxon } from "./domain.ts";
function normalize(value:string):string{return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("it").replace(/[._(),;:+/]+/g," ").replace(/\s+/g," ").trim();}
function acceptedName(taxon:Taxon):string{if("acceptedName" in taxon&&typeof taxon.acceptedName==="string"&&taxon.acceptedName.trim())return taxon.acceptedName.trim();return taxon.scientificName.trim();}
function unique(values:readonly string[]):string[]{return [...new Set(values.filter(value=>value.trim().length>0))];}
/** Published names do not upgrade safety approval or create member concepts. */
export function overlayPublishedStudySearchDocuments(documents:readonly CatalogSearchDocument[],publishedStudyTaxa:readonly Taxon[]):CatalogSearchDocument[]{
 const byId=new Map(publishedStudyTaxa.map(taxon=>[taxon.id,taxon]));
 return documents.map(document=>{
 const taxon=document.kind==="minimumTaxon"?byId.get(document.id):undefined;
 if(!taxon)return {...document,currentNames:[...document.currentNames],sourceNames:[...document.sourceNames],genera:[...document.genera]};
 const title=taxon.scientificName.trim()||document.title;
 const currentNames=taxon.rank==="species"?unique([acceptedName(taxon)]):[...document.currentNames];
 const genera=[...document.genera];
 if(taxon.rank==="species"){const match=acceptedName(taxon).match(/^([A-Z][A-Za-z-]+)\s+[a-z][A-Za-z-]+(?:\s|$)/);if(match&&!genera.includes(match[1]))genera.push(match[1]);}
 return {...document,title,rank:taxon.rank,currentNames,sourceNames:[...document.sourceNames],genera,searchText:normalize([document.searchText,document.sourceLabel,title,taxon.commonName,...currentNames,...taxon.aliases,...taxon.regionalNames.flatMap(entry=>[entry.name,...entry.regions]),...(taxon.hosts??[]),taxon.safetyNote].join(" "))};
 });
}
