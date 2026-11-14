const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validSlug(value) { return typeof value === 'string' && value.length <= 80 && slugPattern.test(value); }
const categoryFields = { _id: 0, slug: 1, title: 1, description: 1, image: 1, headline: 1 };
const offerFields = { _id: 0, slug: 1, title: 1, categorySlug: 1, description: 1, image: 1, discountPercent: 1, 'merchant.name': 1, terms: 1, redemptionSteps: 1, example: 1, startsAt: 1, endsAt: 1 };
const activeOffers = () => ({ published: true, $and: [{ $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: new Date() } }] }, { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gt: new Date() } }] }] });
export function createCatalog(db) {
  return {
    categories: () => db.collection('categories').find({ published: true }, { projection: categoryFields }).sort({ order: 1, title: 1 }).limit(100).toArray(),
    category: (slug) => db.collection('categories').findOne({ slug, published: true }, { projection: categoryFields }),
    offers: (categorySlug) => db.collection('offers').find({ ...activeOffers(), ...(categorySlug ? { categorySlug } : {}) }, { projection: offerFields }).sort({ title: 1 }).limit(100).toArray(),
    offer: (slug) => db.collection('offers').findOne({ slug, ...activeOffers() }, { projection: offerFields }),
  };
}
export async function dispatchCatalog(requestUrl, catalog) {
  let url; try { url = new URL(requestUrl, 'http://localhost'); } catch { return { status: 400, body: { error: 'Invalid request.' } }; }
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api' || !['categories','offers'].includes(parts[1]) || parts.length > 3) return { status: 404, body: { error: 'Not found.' } };
  const categorySlug = url.searchParams.get('category');
  if ((parts[2] && !validSlug(parts[2])) || (categorySlug !== null && !validSlug(categorySlug))) return { status: 400, body: { error: 'Invalid slug.' } };
  const data = parts[2] ? await catalog[parts[1] === 'categories' ? 'category' : 'offer'](parts[2]) : await catalog[parts[1]](parts[1] === 'offers' ? categorySlug : undefined);
  return data == null ? { status: 404, body: { error: 'Not found.' } } : { status: 200, body: { data } };
}
