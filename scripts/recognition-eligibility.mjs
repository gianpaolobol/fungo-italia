// Conservative recognition eligibility plan. Do not use to bypass source review.
// A minimum learning unit can be an exact species, a collective species group,
// section, subsection, subgenus or genus. Never force a collective into a binomial.
export const supportedRecognitionRanks=new Set(['species','speciesGroup','section','subsection','subgenus','genus']);
export const singleFoodCategories=new Set(['free','conditional','discouraged','no-food-value','inedible','toxic','deadly']);
export function recognitionEligibility(t){
 const reasons=[];
 if(!supportedRecognitionRanks.has(t.rank))reasons.push('unsupported-rank');
 if(typeof t.scientificName!=='string'||!t.scientificName.trim())reasons.push('missing-taxon-label');
 const food=t.studyProfile?.edibility;
 if(!singleFoodCategories.has(food?.category))reasons.push('non-univocal-food-category');
 const photos=(t.referenceImages||[]).filter(p=>p?.src?.startsWith('images/')&&p.subjectTaxon===t.scientificName&&p.credit);
 if(photos.length<3)reasons.push('insufficient-attributed-reference-views');
 const foodSource=t.edibilityEvidence?.some(e=>e.sourceId==='S2-guida-ragionata-commestibilita-2021')||t.sources?.some(s=>s.fields?.includes('edibility'));
 if(!foodSource)reasons.push('missing-S2-food-evidence');
 if(food?.category==='conditional'&&!(food.precautions||[]).length)reasons.push('missing-preparation');
 if(['toxic','deadly'].includes(food?.category)&&(!food.syndrome?.label||!food.syndrome?.latency||!food.syndrome?.severity))reasons.push('incomplete-toxicology');
 return {id:t.id,rank:t.rank,eligible:reasons.length===0,reasons,photos:photos.length};
}
