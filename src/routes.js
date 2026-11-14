const offerSlugs = new Set(['cafe-treat', 'weekend-special', 'style-deal']);
const categorySlugs = new Set(['dining', 'shopping', 'experiences']);

export function pagePath(value) {
  const slug = value.replace(/^\//, '').replace(/\.html$/, '');
  if (!slug || slug === 'index') return '/';
  if (offerSlugs.has(slug)) return `/offers/${slug}`;
  if (categorySlugs.has(slug)) return `/categories/${slug}`;
  return `/${slug}`;
}
export function routeSlug(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].replace(/\.html$/, '');
  if (parts.length === 2 && parts[0] === 'offers' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parts[1])) return parts[1];
  if (parts.length === 2 && parts[0] === 'categories' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parts[1])) return parts[1];
  return '__not_found__';
}
// Only internal offer paths are accepted as post-auth return destinations.
export function safeOfferReturn(value) {
  return typeof value === 'string' && /^\/offers\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : '/';
}
export function pageTitle(pathname, pages) {
  const path = pathname.replace(/\/$/, '') || '/';
  const businessTitles = { '/business': 'For businesses', '/business/join': 'Join as a business', '/business/sign-in': 'Business sign in', '/business/dashboard': 'Business dashboard' };
  if (businessTitles[path]) return `${businessTitles[path]} — CHOOP`;
  const slug = routeSlug(path);
  if (!slug || slug === 'index') return 'CHOOP — Discover. Share. Save.';
  const titles = { saved:'Saved offers', profile:'My profile', notifications:'Notifications', explore:'Explore offers', categories:'Explore offers' };
  if (titles[slug]) return `${titles[slug]} — CHOOP`;
  if (path.startsWith('/offers/') && slug !== '__not_found__') return 'Offer details — CHOOP';
  if (path.startsWith('/categories/') && slug !== '__not_found__') return 'Category — CHOOP';
  if (pages[slug]) return `${pages[slug][0]} — CHOOP`;
  return 'Page not found — CHOOP';
}
