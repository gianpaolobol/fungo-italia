import assert from 'node:assert/strict';
export const progressFixture={
 favorite:'minimum-card-objective-agaricus--01--agaricus-sez-xanthodermatei',
 marker:'keep-existing-notes',
 notes:{version:1,drafts:[{id:'public-demo21-existing-draft',updatedAt:'2026-10-26T12:00:00.000Z',date:'2026-10-26',taxon:'Bozza verifica aggiornamento',habitat:'',characters:'Lamelle osservate',evidence:'',sources:'',notes:'Nota privata sintetica da conservare',latitude:'',longitude:''}]}
};
export function assertBrowserProgress(state){
 assert.equal(state.note,progressFixture.marker);assert.deepEqual(state.study.favoriteIds,[progressFixture.favorite]);assert.equal(state.study.resumeId,progressFixture.favorite);
 assert.deepEqual(state.notes,progressFixture.notes,'Real stored note drafts changed or disappeared');
}
