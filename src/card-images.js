// Destination imagery is shared across all page cards that link to that subject.
const destinationImages = {
  'dining.html': 'dining.png',
  'cafe-treat.html': 'cafe-portrait.png',
  'shopping.html': 'shopping.png',
  'style-deal.html': 'shopping.png',
  'experiences.html': 'cinema.png',
  'weekend-special.html': 'cinema.png',
  'categories.html': 'deal-categories.png',
  'explore.html': 'friends-cafe.png',
  'how-it-works.html': 'friends-cafe.png',
  'about.html': 'restaurant-friends.png',
  'contact.html': 'restaurant-friends.png',
};
export function cardImageFor(href) {
  return Object.hasOwn(destinationImages, href) ? destinationImages[href] : null;
}
