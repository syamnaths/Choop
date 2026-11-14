import React from 'react';
import { ButtonLink } from './components.jsx';

const terms = [
  '30% off eligible full-price clothing and accessories, up to ₹600.',
  'Minimum purchase of ₹2,000 in a single transaction.',
  'Valid once per customer at a participating store; not valid online.',
  'Cannot be combined with other discounts or used on gift cards.',
];
const steps = [
  ['01', 'Find your favorites', 'Browse eligible clothing and accessories at the store.'],
  ['02', 'Show your coupon', 'Present your claimed coupon at checkout before paying.'],
  ['03', 'Enjoy your savings', 'The store applies the discount to an eligible purchase.'],
];
export default function StyleDeal() {
  return <main className="offer-page wrap">
    <a className="back-link offer-back" href="/categories/shopping">← Back to shopping</a>
    <div className="offer-layout">
      <div className="offer-visual"><img src="/assets/shopping.png" alt="Friends browsing a clothing boutique"/><span className="offer-visual__tag">SHOPPING & LIFESTYLE</span></div>
      <div className="offer-summary"><span className="eyebrow pink">AN EXAMPLE OFFER · IN STORE</span><h1>A little refresh for your wardrobe<span>.</span></h1><p className="offer-merchant">The Everyday Edit <span>· Fictional boutique</span></p><p className="offer-description">Find the pieces you’ll reach for again and again—from everyday essentials to the finishing touches that make an outfit yours.</p>
        <div className="offer-discount"><div><strong>30<span>%</span></strong><b>OFF</b></div><p>On eligible full-price styles<br/><span>Maximum discount ₹600</span></p></div>
        <div className="offer-meta"><div><span>MINIMUM SPEND</span><b>₹2,000</b></div><div><span>REDEMPTION</span><b>In store</b></div><div><span>AVAILABILITY</span><b>Example only</b></div></div>
        <button className="button dark offer-disabled" disabled>Claim offer <span>↗</span></button><p className="offer-disclaimer">This is a sample offer for the CHOOP concept. The boutique and terms are illustrative; no coupon is available to claim or redeem.</p>
      </div>
    </div>
    <div className="offer-details"><section><span className="eyebrow pink">THE GOOD-TO-KNOW</span><h2>The details<span>.</span></h2><p>Here’s an example of what to look for before using a shopping offer.</p><ul>{terms.map(term=><li key={term}>{term}</li>)}</ul><p className="fine">Illustrative terms only. Dates, locations and merchant participation are not established.</p></section>
      <section><span className="eyebrow pink">SIMPLE AS THAT</span><h2>How it would work<span>.</span></h2><div className="offer-steps">{steps.map(([number,title,description])=><div className="offer-step" key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div></section></div>
    <div className="offer-more"><div><span className="eyebrow pink">MORE TO DISCOVER</span><h2>Make a day of it<span>.</span></h2><p>Explore more of the shopping experiences we’re imagining for CHOOP.</p></div><ButtonLink href="/categories/shopping" variant="outline">Explore shopping</ButtonLink></div>
  </main>;
}
