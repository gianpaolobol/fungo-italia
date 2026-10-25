#!/usr/bin/env node
// Machine-readable reconciliation of excluded recognition photos.
// Conservative: no group membership inferred from genus or filename.
import {readFileSync} from 'node:fs';
import {photoRelationReport} from './recognition-photo-relations.mjs';
const atlas=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const bank=JSON.parse(readFileSync('src/data/exam-bank.json','utf8'));
if(!Array.isArray(atlas)||!Array.isArray(bank))throw Error('Expected arrays');
const ids=new Set(bank.map(c=>c.id));
const uncovered=atlas.filter(c=>!ids.has(c.id));
const rows=photoRelationReport(uncovered).map(row=>({
 ...row,exactOrExplicit:row.photos.filter(p=>p.match).length,
 needsMembership:row.photos.filter(p=>p.reason==='needs-explicit-membership-evidence').length,
 missingProvenance:row.photos.filter(p=>p.reason==='missing-provenance').length
}));
const summary={uncovered:rows.length,withThreeMatched:rows.filter(r=>r.exactOrExplicit>=3).length,withMembershipQuestions:rows.filter(r=>r.needsMembership>0).length,withMissingProvenance:rows.filter(r=>r.missingProvenance>0).length,withoutThreeMatched:rows.filter(r=>r.exactOrExplicit<3).map(r=>r.id)};
console.log(JSON.stringify({summary,rows},null,2));
