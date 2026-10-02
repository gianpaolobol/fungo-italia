import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['--experimental-strip-types','scripts/export-floot-readiness.mjs'],{cwd:'legacy/web',stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
await import('./prepare-mobile-data.mjs');
await import('./generate-brand-assets.mjs');
