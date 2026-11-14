import test from 'node:test'; import assert from 'node:assert/strict'; import {createSavedOffers} from '../server/saved.mjs';
test('saving is authenticated, idempotent and isolated by user',async()=>{
 const records=[]; const db={collection:()=>({createIndex:async()=>{},updateOne:async(q,u)=>{if(!records.some(x=>x.userId===q.userId&&x.offerSlug===q.offerSlug))records.push(u.$setOnInsert);},deleteOne:async(q)=>{const i=records.findIndex(x=>x.userId===q.userId&&x.offerSlug===q.offerSlug);if(i>=0)records.splice(i,1);},find:(q)=>({sort(){return this},limit(){return this},async toArray(){return records.filter(x=>x.userId===q.userId)}})})};
 const auth={userId:async t=>t==='one'?1:t==='two'?2:null};const catalog={offer:async s=>s==='deal'?{slug:s,title:'Deal'}:null};const service=createSavedOffers(db,auth,catalog);
 assert.equal((await service.set(null,'deal',true)).status,401);assert.equal((await service.set('one','missing',true)).status,404);
 await service.set('one','deal',true);await service.set('one','deal',true);await service.set('two','deal',true);assert.equal(records.length,2);
 await service.set('one','deal',false);assert.equal((await service.list('two')).saved.length,1);assert.equal((await service.list('one')).saved.length,0);
});
