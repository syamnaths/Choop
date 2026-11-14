import React, { useEffect, useState } from 'react';
import { ButtonLink } from './components.jsx';
import { OfferActions } from './OfferActions.jsx';
import { filterOffers } from './catalog-filters.js';

export function useCatalog(path) {
  const [state, setState] = useState({ status: 'loading', data: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', data: null });
    fetch(path, { signal: controller.signal }).then(async response => {
      if (response.status === 404) { setState({ status: 'missing', data: null }); return; }
      if (!response.ok) throw new Error('Catalog unavailable');
      const result = await response.json(); setState({ status: 'ready', data: result.data });
    }).catch(error => { if (error.name !== 'AbortError') setState({ status: 'error', data: null }); });
    return () => controller.abort();
  }, [path]);
  return state;
}
function imageUrl(image) { return typeof image === 'string' && /^\/assets\/[a-zA-Z0-9._-]+$/.test(image) ? image : '/assets/friends-cafe.png'; }
export function CatalogState({ state, empty = 'Nothing here yet. Check back soon.' }) {
  if (state.status === 'loading') return <p role="status" className="catalog-state">Loading…</p>;
  if (state.status === 'error') return <p role="alert" className="catalog-state">We can’t load the catalog right now. Please try again later.</p>;
  if (state.status === 'missing') return <p className="catalog-state">We couldn’t find that page. <a href="/explore">Explore categories</a></p>;
  if (Array.isArray(state.data) && !state.data.length) return <p className="catalog-state">{empty}</p>;
  return null;
}
export function CatalogCard({ item, type }) {
  const href = type === 'category' ? `/categories/${item.slug}` : `/offers/${item.slug}`;
  if (type === 'offer') return <article className="coupon-ticket"><a href={href} className="coupon-ticket__link"><div className="coupon-ticket__body"><div className="coupon-ticket__merchant"><img src={imageUrl(item.image)} alt="" loading="lazy"/><span>{item.merchant?.name || 'CHOOP offer'}</span></div><h3>{item.title}</h3><p>{item.description}</p><span className="coupon-ticket__action">View offer <span aria-hidden="true">↗</span></span></div><div className="coupon-ticket__stub"><span className="coupon-ticket__label">{item.example ? 'EXAMPLE' : 'SPECIAL OFFER'}</span>{item.discountPercent != null ? <><strong>{item.discountPercent}<small>%</small></strong><b>OFF</b></> : <strong className="coupon-ticket__spark" aria-hidden="true">✳</strong>}<span className="coupon-ticket__detail">VIEW DETAILS ↗</span></div></a></article>;
  return <article className="sub-card sub-card--image"><a className="catalog-card-link" href={href}><div className="sub-card__image"><img src={imageUrl(item.image)} alt="" loading="lazy"/></div><div className="sub-card__body"><h3>{item.title}</h3><p>{item.description}</p><span className="sub-card__link">Explore category <span aria-hidden="true">↗</span></span></div></a></article>;
}
export function CatalogList({ type, endpoint, empty }) {
  const state = useCatalog(endpoint);
  return <><CatalogState state={state} empty={empty}/>{state.status === 'ready' && state.data?.length > 0 && <div className="sub-grid">{state.data.map(item => <CatalogCard key={item.slug} item={item} type={type}/>)}</div>}</>;
}
export function CategoryDirectory() {
  const [selected, setSelected] = useState(() => new URLSearchParams(window.location.search).get('category') || '');
  const categories = useCatalog('/api/categories');
  const offers = useCatalog(selected ? `/api/offers?category=${encodeURIComponent(selected)}` : '/api/offers');
  const visible = filterOffers(offers.data, selected);
  function selectCategory(slug) {
    setSelected(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set('category', slug); else url.searchParams.delete('category');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }
  return <main className="wrap browse-page"><div className="browse-heading"><a className="back-link" href="/">← Back to home</a><span className="eyebrow pink">DISCOVER SOMETHING GOOD</span><h1>Find your next favorite<span>.</span></h1><p>Explore offers from places worth sharing.</p></div><section aria-labelledby="browse-offers-title" className="browse-content"><div className="browse-toolbar"><div><h2 id="browse-offers-title">Explore offers</h2><p>Choose a category or see what catches your eye.</p></div></div><div className="category-filters" role="group" aria-label="Filter offers by category"><button type="button" aria-pressed={!selected} className={!selected ? 'is-selected' : ''} onClick={() => selectCategory('')}>All offers</button>{categories.status === 'ready' && categories.data?.map(category=><button type="button" key={category.slug} aria-pressed={selected===category.slug} className={selected===category.slug?'is-selected':''} onClick={()=>selectCategory(category.slug)}>{category.title}</button>)}</div>{categories.status === 'error' && <p className="browse-filter-note">Categories couldn’t be loaded. You can still browse all offers.</p>}{selected && categories.status === 'ready' && !categories.data?.some(category=>category.slug===selected) && <p className="browse-filter-note">This category isn’t available. Choose another or view all offers.</p>}<CatalogState state={offers} empty={selected ? 'There are no offers in this category right now.' : 'There are no offers available right now.'}/>{offers.status === 'ready' && offers.data?.length === 100 && <p className="browse-filter-note">Showing up to 100 offers. Choose a category to narrow your results.</p>}{offers.status === 'ready' && offers.data?.length > 0 && (visible.length ? <div className="sub-grid">{visible.map(offer=><CatalogCard key={offer.slug} item={offer} type="offer"/>)}</div> : <div className="browse-empty"><h3>No offers in this category yet.</h3><p>Try another category to discover more.</p><button type="button" onClick={()=>selectCategory('')}>View all offers ↗</button></div>)}</section></main>;
}
export function CategoryPage({ slug }) {
  const category = useCatalog(`/api/categories/${encodeURIComponent(slug)}`);
  const offers = useCatalog(`/api/offers?category=${encodeURIComponent(slug)}`);
  useEffect(() => { if (category.status === 'ready') document.title = `${category.data.title} — CHOOP`; else if (category.status === 'missing') document.title = 'Category not found — CHOOP'; }, [category]);
  return <main className="wrap browse-page"><CatalogState state={category}/>{category.status === 'ready' && <><div className="browse-heading"><a className="back-link" href="/explore">← All offers</a><span className="eyebrow pink">EXPLORE THE CATEGORY</span><h1>{category.data.title}<span>.</span></h1><p>{category.data.description}</p></div><section className="browse-content"><div className="browse-toolbar"><div><h2>Offers to explore</h2><p>Find something you like and see the details.</p></div><a href="/explore">View all offers ↗</a></div><CatalogState state={offers} empty="There are no offers in this category right now."/>{offers.status === 'ready' && offers.data?.length > 0 && <div className="sub-grid">{offers.data.map(offer => <CatalogCard key={offer.slug} item={offer} type="offer"/>)}</div>}</section></>}</main>;
}
export function OfferPage({ slug, user, sessionStatus }) {
  const state = useCatalog(`/api/offers/${encodeURIComponent(slug)}`); const offer = state.data;
  useEffect(() => { if (state.status === 'ready') document.title = `${state.data.title} — CHOOP`; else if (state.status === 'missing') document.title = 'Offer not found — CHOOP'; }, [state]);
  return <main className="offer-page wrap"><CatalogState state={state}/>{state.status === 'ready' && <><a className="back-link offer-back" href="/explore">← Browse offers</a><div className="offer-layout"><div className="offer-visual"><img src={imageUrl(offer.image)} alt=""/><span className="offer-visual__tag">{offer.example ? 'EXAMPLE OFFER' : 'OFFER'}</span></div><div className="offer-summary"><span className="eyebrow pink">{offer.example ? 'AN EXAMPLE OFFER' : 'DISCOVER AN OFFER'}</span><h1>{offer.title}<span>.</span></h1>{offer.merchant?.name && <p className="offer-merchant">{offer.merchant.name}{offer.example && <span> · Example merchant</span>}</p>}<p className="offer-description">{offer.description}</p>{offer.discountPercent != null && <div className="offer-discount"><div><strong>{offer.discountPercent}<span>%</span></strong><b>OFF</b></div><p>See offer details<br/><span>Terms apply</span></p></div>}<OfferActions offer={offer} user={user} sessionStatus={sessionStatus}/></div></div><div className="offer-details"><section><span className="eyebrow pink">THE GOOD-TO-KNOW</span><h2>The details<span>.</span></h2>{offer.terms?.length ? <ul>{offer.terms.map((term,index)=><li key={index}>{term}</li>)}</ul> : <p>Offer terms are not available yet.</p>}</section><section><span className="eyebrow pink">SIMPLE AS THAT</span><h2>How it works<span>.</span></h2>{offer.example ? <p>This example shows how an offer could work. It cannot be redeemed.</p> : <div className="offer-steps">{(offer.redemptionSteps?.length ? offer.redemptionSteps : ['Review the offer details and any terms before you visit.', 'Sign in and select Get redemption code when you’re ready to use the offer.', 'Show the one-time code to the participating business before it expires.']).map((step,index)=><div className="offer-step" key={index}><span>{String(index+1).padStart(2,'0')}</span><div><p>{step}</p></div></div>)}</div>}</section></div></>}</main>;
}
export function HomeCatalog({ type }) {
  const categories = type === 'category';
  return <section className={`section ${categories ? 'category-section' : ''}`}><div className="wrap"><div className="center"><span className="eyebrow pink">{categories ? 'A DEAL FOR EVERY KIND OF DAY' : 'DISCOVER SOMETHING GOOD'}</span><h2>{categories ? 'Your interests.' : 'Choose the deal that'}<br/><em>{categories ? 'Your offers.' : 'makes your day.'}</em></h2></div><div className="home-catalog"><CatalogList type={type} endpoint={categories ? '/api/categories' : '/api/offers'} empty={categories ? 'No categories are available yet.' : 'No offers are available right now.'}/></div></div></section>;
}
