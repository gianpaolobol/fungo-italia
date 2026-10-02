import type { AtlasTaxon } from "./domain.ts";
import { atlasTaxa } from "./atlas-catalog.ts";
import { minimumCards } from "./minimum-cards.ts";
import { sourceMinimumLearningUnits } from "./minimum-learning-source.ts";
import { minimumCardNavigation } from "./minimum-navigation.ts";
import { publicAuditedFieldProfile, publicDescriptiveCardContent, publicEdibilityCategory, publicSafetySummary } from "./public-scientific-policy.ts";

const categoryLabels: Record<string, AtlasTaxon["edibility"]> = {
 EDIBLE:"commestibile",EDIBLE_AFTER_TREATMENT:"commestibile-dopo-trattamento",DISCOURAGED:"sconsigliato",
 NO_FOOD_VALUE:"senza-valore",NOT_EDIBLE:"non-commestibile",POISONOUS:"tossico",NOT_ASSESSED:"non-valutato",
};
const normal = (value:string) => value.trim().replace(/\s+/g," ").toLocaleLowerCase("it");
const units = new Map(sourceMinimumLearningUnits.map(unit=>[unit.id,unit]));
const navigation = new Map(minimumCardNavigation.map(entry=>[entry.cardId,entry]));
/** Canonical learning units; never treat historical parser output as a reconciled species inventory. */
export const studyAtlasTaxa: AtlasTaxon[] = minimumCards.map(card => {
 const unit=units.get(card.learningUnitId);
 if(!unit)throw new Error("Missing source unit: "+card.cardId);
 const names=new Set([card.displayName,card.sourceLabel,...card.currentAcceptedNames].map(normal));
 // Only a single species concept may inherit species metadata. Groups do not inherit a member's family or ecology.
 const exact=card.rank==="species" && card.currentAcceptedNames.length===1
   ? atlasTaxa.find(taxon=>names.has(normal(taxon.scientificName))||names.has(normal(taxon.acceptedName))) : undefined;
 const descriptive=publicDescriptiveCardContent(card);
 const profile=publicAuditedFieldProfile(card);
 const category=publicEdibilityCategory(card);
 return {
  id:card.cardId, commonName:exact && exact.commonName!==exact.scientificName ? exact.commonName : card.displayName,
  scientificName:card.displayName, acceptedName:card.currentAcceptedNames.length===1 ? card.currentAcceptedNames[0] : card.displayName,
  sourceName:card.sourceLabel, authorship:null, rank:card.rank,
  aliases:[...new Set([card.sourceLabel,...card.currentAcceptedNames,...(exact?.aliases ?? [])])].filter(name=>name!==card.displayName),
  regionalNames:exact?.regionalNames ?? [],edibility:category ? categoryLabels[category] ?? "non-valutato" : "non-valutato",
  safetyNote:publicSafetySummary(card),recognitionLevel:"minimo",objectiveLevels:["minimo"],
  kingdom:"Fungi",division:"Non documentata",className:"Non documentata",
  order:"Non documentato",family:null,
  parentScientificName:navigation.get(card.cardId)?.sourceHeadingLabel ?? "",
  diagnosticCharacters:[...profile.characters],odor:null,ecology:descriptive.ecologySummary ? [descriptive.ecologySummary] : [],
  mediaStatus:"preparing",sources:[{title:"Obiettivi tassonomici nella formazione dei micologi · V4, 09.06.2026",page:unit.sourcePage,kind:"obiettivi-minimi"}],
  externalIds:{speciesFungorum:null,indexFungorum:null,mycoBank:null},
 };
});
