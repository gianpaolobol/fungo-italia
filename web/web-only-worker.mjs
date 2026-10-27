import assert from 'node:assert/strict';
// The old paired23 document cannot recognize a web-only receipt. Activate a
// fully cached web-only shell so its next ordinary reload can reach the new UI.
// Activation does not reload a document or write any user storage. The generated
// worker retains the previous cache, letting an open exercise finish normally.
export function webOnlyWorker(worker){const marker='await cache.addAll(CORE_FILES);';assert.equal(worker.split(marker).length,2,'Expected exactly one atomic cache installation');return worker.replace(marker,marker+'await self.skipWaiting();');}
