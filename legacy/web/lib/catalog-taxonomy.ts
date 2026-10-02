import { catalogTaxa } from './objective-catalog.ts';
import { studyAtlasTaxa } from './study-atlas-catalog.ts';
import type { Taxon } from './domain.ts';
export const contributionTaxa: Taxon[] = [...studyAtlasTaxa,...catalogTaxa.filter(taxon=>!studyAtlasTaxa.some(study=>study.id===taxon.id))];
export function resolveContributionTaxon(id:string):Taxon|null{return contributionTaxa.find(taxon=>taxon.id===id)??null;}
export function storageTaxonFor(taxon:Taxon):Taxon{return catalogTaxa.find(legacy=>legacy.scientificName===taxon.scientificName&&legacy.rank===taxon.rank)??taxon;}
export function equivalentCatalogIds(id:string):string[]{const taxon=resolveContributionTaxon(id);return taxon?contributionTaxa.filter(candidate=>candidate.scientificName===taxon.scientificName&&candidate.rank===taxon.rank).map(candidate=>candidate.id):[id];}
