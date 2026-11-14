import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import pages from '../src/pages.json' with { type: 'json' };
import { cardImageFor } from '../src/card-images.js';

test('Explore presents each current category with a working page and relevant local image', () => {
  const cards = pages.explore[4];
  assert.deepEqual(cards.map((card) => card[2]), ['dining.html', 'shopping.html', 'experiences.html']);
  for (const [, , href] of cards) {
    assert.ok(pages[href.replace('.html', '')], `Missing destination: ${href}`);
    const image = cardImageFor(href);
    assert.ok(image && existsSync(new URL(`../public/assets/${image}`, import.meta.url)), `Missing image for ${href}`);
  }
  assert.equal(cardImageFor(null), null);
});
