import test from 'node:test';import assert from 'node:assert/strict';
import {selectPhotoSession,cardLearning} from '../lib/session-selection.mjs';
const bank=Array.from({length:40},(_,i)=>({id:String(i),questionKind:i===39?'profile':undefined,photos:i===39?[]:[{}]}));
const attempt=(id,passed,round=0)=>({caseId:id,round,answer:{assisted:false},grade:{passed}});
test('photographic session avoids recently correct cards while keeping errors and new cards',()=>{const h=[{id:'s',completedAt:'2026-10-27',attempts:Array.from({length:15},(_,i)=>attempt(String(i),i!==0))}];const ids=selectPhotoSession(bank,h,15,()=>.3);assert.equal(ids.length,15);assert.equal(new Set(ids).size,15);assert(!ids.includes('39'));assert(ids.includes('0'));assert(!ids.some(id=>+id>0&&+id<15));});
test('mastery requires two distinct unassisted perfect first attempts and is reset by error',()=>{const h=[{id:'a',attempts:[attempt('x',true),attempt('x',true,1)]}];assert.equal(cardLearning(h).x.learned,false);h.push({id:'b',attempts:[attempt('x',true)]});assert.equal(cardLearning(h).x.learned,true);h.push({id:'c',attempts:[attempt('x',false)]});assert.equal(cardLearning(h).x.learned,false);});
test('small demo remains repeatable without duplicates',()=>{assert.equal(selectPhotoSession(bank.slice(0,4),[],4,()=>.7).length,4);});
