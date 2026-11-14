export function filterOffers(offers, category) {
  if (!Array.isArray(offers)) return [];
  return category ? offers.filter(offer => offer.categorySlug === category) : offers;
}
