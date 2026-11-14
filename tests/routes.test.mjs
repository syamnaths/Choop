import test from 'node:test';
import assert from 'node:assert/strict';
import { pagePath, routeSlug } from '../src/routes.js';

test('clean routes and legacy links resolve to the same page', () => {
  for (const slug of ['explore', 'dining', 'shopping', 'style-deal', 'cafe-treat']) {
    assert.equal(routeSlug(pagePath(slug)), slug);
    assert.equal(routeSlug(`/${slug}.html`), slug);
  }
  assert.equal(pagePath('style-deal.html'), '/offers/style-deal');
  assert.equal(pagePath('shopping.html'), '/categories/shopping');
  assert.equal(routeSlug('/unknown/style-deal'), '__not_found__');
  assert.equal(routeSlug('/'), '');
});

test('post-sign-in return only accepts local offer paths', async () => {
  const {safeOfferReturn}=await import('../src/routes.js');
  assert.equal(safeOfferReturn('/offers/style-deal'),'/offers/style-deal');
  assert.equal(safeOfferReturn('//evil.test'),'/');
  assert.equal(safeOfferReturn('https://evil.test/offers/a'),'/');
  assert.equal(safeOfferReturn('/offers/a?next=//evil.test'),'/');
});

test('dynamic and business routes receive meaningful browser titles', async () => {
  const {pageTitle}=await import('../src/routes.js');
  assert.equal(pageTitle('/business/dashboard',{}),'Business dashboard — CHOOP');
  assert.equal(pageTitle('/business/join',{}),'Join as a business — CHOOP');
  assert.equal(pageTitle('/offers/new-deal',{}),'Offer details — CHOOP');
  assert.equal(pageTitle('/categories/dining',{}),'Category — CHOOP');
  assert.equal(pageTitle('/saved',{}),'Saved offers — CHOOP');
  assert.equal(pageTitle('/unknown',{}),'Page not found — CHOOP');
});
