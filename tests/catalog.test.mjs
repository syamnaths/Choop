import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatchCatalog, validSlug, createCatalog } from '../server/catalog.mjs';
const catalog = { categories: async () => [{slug:'dining'}], category: async s => s === 'dining' ? {slug:s} : null, offers: async c => [{categorySlug:c}], offer: async () => null };
test('catalog API returns data, rejects malformed paths and handles missing entries', async () => {
  assert.equal((await dispatchCatalog('/api/categories',catalog)).body.data[0].slug,'dining');
  assert.equal((await dispatchCatalog('/api/categories/dining',catalog)).status,200);
  assert.equal((await dispatchCatalog('/api/offers?category=dining',catalog)).body.data[0].categorySlug,'dining');
  assert.equal((await dispatchCatalog('/api/offers/missing',catalog)).status,404);
  assert.equal((await dispatchCatalog('/api/offers?category=%24bad',catalog)).status,400);
  assert.equal((await dispatchCatalog('/api/unknown',catalog)).status,404);
  assert.equal(validSlug('style-deal'),true); assert.equal(validSlug('a/b'),false);
});
test('offer queries require publication and valid start and end windows', async () => {
  let query; const db={collection:()=>({find:(q)=>{query=q;return {sort(){return this},limit(){return this},async toArray(){return []}}}})};
  await createCatalog(db).offers('shopping');
  assert.equal(query.published,true); assert.equal(query.categorySlug,'shopping'); assert.equal(query.$and.length,2);
});
