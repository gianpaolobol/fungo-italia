const sourceId='COURSE-CHAT-MICOLAB-20261022';
const check=(ok,message)=>{if(!ok)throw Error(message);};
export function applyCourseChatImages(records,dataset,scope){
 check(dataset?.version===1&&dataset.sourceId===sourceId&&dataset.independentReviewComplete===false,'Invalid course photo registry');
 check(dataset.permission?.publicRepository===true&&dataset.permission?.applicationDistribution===true,'Course photograph publication not authorized');
 check(Array.isArray(scope?.coursePhotoLinks),'Missing admitted course photo links');
 const admittedLinks=new Set(scope.coursePhotoLinks.map(l=>JSON.stringify([l.src,l.atlasId,l.subjectTaxon,l.caseId])));
 const units=new Map(records.map(t=>[t.id,t])),cases=new Map(dataset.cases.map(c=>[c.id,c])),seen=new Set();
 for(const asset of dataset.images){
  check(/^images\/course-chat\/micolab-\d+\.jpg$/.test(asset.src)&&!seen.has(asset.src),'Invalid course asset path');seen.add(asset.src);
  check(/^[a-f0-9]{64}$/.test(asset.fileSha256)&&asset.caseIds.every(id=>cases.has(id)),'Missing course context');
  for(const link of asset.links){
   const t=units.get(link.atlasId),image=link.image,c=cases.get(image.caseId);
   check(admittedLinks.has(JSON.stringify([asset.src,link.atlasId,image.subjectTaxon,image.caseId])),'Course subject/link outside reviewed curriculum scope');
   check(t&&image.src===asset.src&&asset.caseIds.includes(image.caseId)&&image.sourceId===sourceId&&image.verificationScope==='course-photo-determination'&&image.view==='collection','Invalid course link');
   check(c&&c.subjectTaxon===image.subjectTaxon&&Number.isInteger(c.solutionMessageId)&&c.teacher,'Mismatched course determination');
   check(!/\b(?:cf|cfr|aff)\./i.test(image.subjectTaxon)||image.identificationEligible===false,'Qualified course image cannot identify a species');
   check(image.identificationEligible===false||image.relationship==='exact','Genus example cannot identify species');
   t.courseImages??=[];check(!t.courseImages.some(i=>i.src===image.src),'Duplicate course link');t.courseImages.push(structuredClone(image));
  }
 }
 for(const t of records){if(t.courseImages){const order=new Map(dataset.images.flatMap(asset=>asset.links.filter(link=>link.atlasId===t.id).map(link=>[asset.src,link.order])));t.courseImages.sort((a,b)=>order.get(a.src)-order.get(b.src));}}
 for(const entry of dataset.atlasCitations){const t=units.get(entry.atlasId);check(t,'Unknown course citation unit');t.sources??=[];for(const s of entry.sources){check(s.sourceId===sourceId&&s.reviewScope==='course-chat-photo'&&s.fields?.includes('courseImages'),'Invalid course citation');t.sources.push(structuredClone(s));}}
 return records;
}
