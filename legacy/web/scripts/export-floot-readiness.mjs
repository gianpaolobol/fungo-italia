import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { minimumCards } from "../lib/minimum-cards.ts";
import { minimumGenusCards } from "../lib/minimum-genus-cards.ts";
import { minimumCardNavigation } from "../lib/minimum-navigation.ts";
import { sourceMinimumLearningUnits } from "../lib/minimum-learning-source.ts";
import { catalogSearchDocuments, toPublicCatalogSearchDocument } from "../lib/catalog-search.ts";
import { publicAuditedFieldProfile } from "../lib/public-scientific-policy.ts";
import { publicGenusLayer } from "../lib/public-genus-policy.ts";
import { studyAtlasTaxa } from "../lib/study-atlas-catalog.ts";
import { betaAreas } from "../lib/seed-data.ts";
import { auditedFieldProfileEvidence } from "../lib/minimum-field-profile-evidence.ts";
import { scientificReviewQueue } from "../lib/scientific-review-queue.ts";
import attestations from "../data/catalog/release-attestations.json" with { type:"json" };
import sources from "../data/catalog/sources.json" with { type:"json" };

const output="artifacts/floot-readiness";
await mkdir(output,{recursive:true});
const units=new Map(sourceMinimumLearningUnits.map(unit=>[unit.id,unit]));
const nav=new Map(minimumCardNavigation.map(entry=>[entry.cardId,entry]));
const files=new Map();
files.set("catalog-data.json",{
 schemaVersion:1,generatedFrom:"GitHub canonical learning units",safetyPolicy:"Descriptive internal audit is separate from independent safety approval.",
 counts:{minimumCards:minimumCards.length,genusCards:minimumGenusCards.length,searchDocuments:catalogSearchDocuments.length},
 minimumCards:minimumCards.map(card=>({
  cardId:card.cardId,learningUnitId:card.learningUnitId,displayName:card.displayName,sourceLabel:card.sourceLabel,
  sourcePage:units.get(card.learningUnitId).sourcePage,rank:card.rank,currentAcceptedNames:card.currentAcceptedNames,
  currentGenera:nav.get(card.cardId).currentGenera,sourceGenus:nav.get(card.cardId).sourceHeadingLabel,
  deepMorphologyRequired:units.get(card.learningUnitId).deepMorphologyRequired,reviewStatus:card.reviewStatus,
  parentTeachingCardId:nav.get(card.cardId).teachingCardId,
 })),
 genusCards:minimumGenusCards.map(card=>({
  cardId:card.cardId,teachingUnitId:card.teachingUnitId,sourceLabel:card.sourceLabel,sourceRank:card.sourceRank,
  sourcePage:card.sourcePage,displayTitle:card.displayTitle,sourceGenera:card.sourceGenera,currentGenera:card.currentGenera,
  minimumChildCardIds:card.minimumChildCardIds,essential:{objectiveSummary:publicGenusLayer(card,"essential").objectiveSummary},
  deepening:{objectiveSummary:publicGenusLayer(card,"deepening").objectiveSummary},
  specialist:{objectiveSummary:publicGenusLayer(card,"specialist").objectiveSummary},reviewStatus:card.reviewStatus,
 })),
 searchDocuments:catalogSearchDocuments.map(toPublicCatalogSearchDocument),
});
files.set("study-atlas-taxa.json",studyAtlasTaxa.map(taxon=>({...taxon,regionalNames:taxon.regionalNames.map(entry=>entry.name),sources:taxon.sources})));
files.set("areas.json",betaAreas);
files.set("scientific-baseline.json",{
 schemaVersion:1,reviewScope:"internal-audit",independentReviewComplete:false,total:minimumCards.length,
 profiles:Object.fromEntries(minimumCards.map(card=>[card.sourceLabel,{name:card.displayName,...publicAuditedFieldProfile(card)}])),
});
files.set("field-profile-evidence.json",auditedFieldProfileEvidence);
files.set("catalog-sources.json",sources);
const manifest=[];
for(const [name,value] of files){
 const content=JSON.stringify(value,null,2)+"\n";
 await writeFile(output+"/"+name,content,"utf8");
 manifest.push({name,bytes:Buffer.byteLength(content),sha256:createHash("sha256").update(content).digest("hex")});
}
const report={
 schemaVersion:1,commit:process.env.GITHUB_SHA ?? null,generatedAt:new Date().toISOString(),
 counts:{minimum:minimumCards.length,groups:minimumGenusCards.length,searchDocuments:catalogSearchDocuments.length,areas:betaAreas.length},
 scientificReady:scientificReviewQueue.length===0 && attestations.independentMycologicalReview.status==="verified",pendingScientificClaims:scientificReviewQueue.length,
 independentReviewStatus:attestations.independentMycologicalReview.status,
 independentReviewRequired:true,files:manifest,
 transferWarnings:[
  "GitHub app is Next/vinext; Floot is React Router with typed GET/POST endpoints. These assets are a reviewed transfer package, not an automatic deployment.",
  "Preserve stable learning-unit and taxon IDs. Do not replace independently approved Floot safety assessments with unapproved GitHub drafts.",
  "Published database changes are not included in this static export. Migrate validated versioned changes separately.",
  "Floot area loaders must validate uniqueness and shape, not an exact historic count of 45.",
  "The Floot legacy scientificProfiles merge must bind sources to the actual displayed version before release.",
 ],
};
await writeFile(output+"/manifest.json",JSON.stringify(report,null,2)+"\n","utf8");
console.log(JSON.stringify(report,null,2));
