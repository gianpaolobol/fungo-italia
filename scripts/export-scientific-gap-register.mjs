import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {buildReleaseReadinessReport} from './release-readiness.mjs';

const read=async name=>JSON.parse(await readFile('src/data/'+name+'.json','utf8'));
const [catalog,groups]=await Promise.all([read('catalog'),read('groups')]);
const report=buildReleaseReadinessReport(catalog,groups,{includeGroups:false});
const categories=['independent-review-not-attested','missing-habitat','missing-lookalikes','habitat-without-pointwise-evidence','missing-odor','odor-without-pointwise-evidence','missing-spore-print','spore-print-without-pointwise-evidence','missing-edibility','edibility-without-pointwise-evidence','missing-sources','missing-reference-views'];
const count=key=>report.profileRows.filter(r=>r.gaps.some(g=>g===key||g.startsWith(key+':'))).length;
const esc=s=>'"'+String(s??'').replaceAll('"','""')+'"';
const columns=['id','scientificName','rank','gaps','missingViews',...categories];
const rows=report.profileRows.map(r=>[r.id,r.scientificName,r.rank,r.gaps.join('; '),r.imageCompleteness.missingViews.join('; '),...categories.map(key=>r.gaps.some(g=>g===key||g.startsWith(key+':'))?'BLOCKED':'')]);
const csv=[columns.map(esc).join(','),...rows.map(row=>row.map(esc).join(','))].join('\n')+'\n';
const summary={schemaVersion:1,source:'scripts/release-readiness.mjs',checked:report.totals.checked,blocked:report.totals.blocked,ready:report.totals.releaseReady,counts:Object.fromEntries(categories.map(k=>[k,count(k)])),items:report.profileRows.map(r=>({id:r.id,name:r.scientificName,gaps:r.gaps,missingViews:r.imageCompleteness.missingViews}))};
const dest=process.argv.slice(2).find(arg=>!arg.startsWith('--'))||'release-evidence';
await mkdir(dest,{recursive:true});
await Promise.all([writeFile(join(dest,'scientific-gap-register.csv'),csv),writeFile(join(dest,'scientific-gap-register.json'),JSON.stringify(summary,null,2)+'\n')]);
console.log(JSON.stringify({destination:dest,checked:summary.checked,blocked:summary.blocked,counts:summary.counts},null,2));
if(process.argv.includes('--strict')&&!report.releaseReady)process.exitCode=1;
