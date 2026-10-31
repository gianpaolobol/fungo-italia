// Evaluates operator-supplied evidence. It is not a signature or proof that the
// claimed deployment/receipts exist; a reviewer must inspect the private records.
export function assessQualification(evidence,now=Date.now()) {
  const e=evidence||{},blockers=[];
  if(e.version!==1||e.environment!=='pilot-only')blockers.push('dedicated_pilot_evidence_required');
  if(e.billingLimitEur!==0||e.noAutomaticUpgrade!==true||e.freeQuotaVerified!==true)blockers.push('zero_cost_configuration_unverified');
  for(const field of ['independentWatchdog','dedicatedDatabase','realDatabaseRead','receivedOutageAlert',
    'receivedRecoveryAlert','weeklySummaryReceived','restoreTestPassed','privateFileAccessTestPassed'])
    if(e[field]!==true)blockers.push(field+'_unverified');
  if(typeof e.reference!=='string'||!e.reference.trim())blockers.push('private_evidence_reference_required');
  const rows=e.observations;
  if(!Number.isSafeInteger(now)||!Number.isSafeInteger(e.startedAt)||!Number.isSafeInteger(e.checkedAt)||
     e.checkedAt>now||now-e.checkedAt>9*3600000||!Array.isArray(rows)||rows.length<33||rows.length>1000) {
    blockers.push('eight_day_observations_required');
  } else {
    let last=null;
    for(const row of rows){
      if(!row||!Number.isSafeInteger(row.at)||row.at<e.startedAt||row.at>e.checkedAt||row.ok!==true||
         (last!==null&&(row.at<=last||row.at-last>7*3600000))){blockers.push('invalid_or_failed_observation');break;}
      last=row.at;
    }
    if(rows[0]?.at!==e.startedAt||last===null||last-e.startedAt<8*86400000||now-last>9*3600000)
      blockers.push('observation_window_incomplete_or_stale');
  }
  return {ready:blockers.length===0,blockers:[...new Set(blockers)]};
}
