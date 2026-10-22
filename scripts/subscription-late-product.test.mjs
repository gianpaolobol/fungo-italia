import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const product={id:'it.fungoitalia.premium.annual',localizedPrice:'19,99 €',subscriptionPeriod:{unit:'year',value:1}};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
// Run the real hook; replace only React's renderer, native bridge and clock.
function harness({accessPending=false}={}){
 const slots=[],effects=[],pending=[],timers=new Map(),requests=[],access=deferred();let index=0,nextTimer=0,observer;
 const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
 const react={
  useState(initial){const i=index++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
  useRef(initial){const i=index++;return slots[i]??=( {current:initial} );},
  useCallback(fn,deps){const i=index++;if(!slots[i]||!same(slots[i].deps,deps))slots[i]={fn,deps};return slots[i].fn;},
  useEffect(fn,deps){const i=index++;if(!effects[i]||!same(effects[i].deps,deps))pending.push(()=>{effects[i]?.cleanup?.();effects[i]={deps,cleanup:fn()};});}
 };
 const native={subscriptionAvailable:true,getAnnualProduct(){const r=deferred();requests.push(r);return r.promise;},currentEntitlement:()=>accessPending?access.promise:Promise.resolve({active:false,expiresAt:null}),observeEntitlement(fn){observer=fn;return{remove(){observer=undefined;}}},purchaseAnnual:async()=>{throw Error('No purchase expected');},restoreAnnual:async()=>{}};
 const module={exports:{}};
 const source=ts.transpileModule(fs.readFileSync('hooks/useSubscription.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const context={module,exports:module.exports,require(name){if(name==='react')return react;if(name==='react-native')return{AppState:{addEventListener(){return{remove(){}}}}};if(name.includes('modules/fungo-subscription'))return native;if(name.includes('subscriptionPolicy'))return{expiryDelay:()=>1000};throw Error(name);},setTimeout(fn,ms){const id=++nextTimer;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);},Date,Promise};
 vm.runInNewContext(source,context);
 function render(){index=0;const value=module.exports.default();while(pending.length)pending.shift()();return value;}
 render();
 return{render,requests,access,emit:value=>observer?.(value),timeout(){for(const[id,t]of[...timers])if(t.ms===20000){timers.delete(id);t.fn();}},unmount(){for(const e of effects)e?.cleanup?.();}};
}
test('late Apple product recovers after the UI timeout without changing entitlement',async()=>{
 const h=harness();await flush();h.timeout();await flush();assert.equal(h.render().product,null);assert.match(h.render().error,/Prezzo non disponibile/);
 h.requests[0].resolve(product);await flush();assert.ok(h.render().product,'Late Apple product must be applied');assert.equal(h.render().product.localizedPrice,product.localizedPrice);assert.equal(h.render().error,'');assert.equal(h.render().active,false);assert.equal(h.render().purchaseReady,true);
});
test('late price never makes an unverified entitlement ready for purchase',async()=>{
 const h=harness({accessPending:true});h.timeout();await flush();h.requests[0].resolve(product);await flush();assert.ok(h.render().product,'Late Apple product must be applied');assert.equal(h.render().product.localizedPrice,product.localizedPrice);assert.equal(h.render().purchaseReady,false);assert.equal(h.render().active,false);
});
test('a superseded price response cannot overwrite the current refresh',async()=>{
 const h=harness();void h.render().refresh();h.requests[1].resolve({...product,localizedPrice:'20,99 €'});await flush();h.requests[0].resolve(product);await flush();assert.equal(h.render().product.localizedPrice,'20,99 €');
});
test('a late product cannot update an unmounted subscription hook',async()=>{
 const h=harness();h.unmount();h.requests[0].resolve(product);await flush();assert.equal(h.render().product,null);
});

test('a product arriving at the timeout boundary cannot be erased by its timeout handler',async()=>{
 const h=harness();await flush();h.timeout();h.requests[0].resolve(product);await flush();assert.ok(h.render().product,'Timeout handler must not erase an accepted product');assert.equal(h.render().product.localizedPrice,product.localizedPrice);assert.equal(h.render().error,'');assert.equal(h.render().active,false);
});
