import React, { useState } from 'react';
import { cities, isSupportedCity } from './cities.js';
import { cardImageFor } from './card-images.js';
import { pagePath } from './routes.js';
import { Avatar } from './Profile.jsx';

const links = [
  ['Explore deals', '/explore.html'], ['Categories', '/categories.html'],
  ['How it works', '/how-it-works.html'], ['For businesses', '/business.html'],
  ['About CHOOP', '/about.html'], ['FAQs', '/faq.html'],
  ['Privacy policy', '/privacy.html'], ['Terms & conditions', '/terms.html'], ['Contact', '/contact.html'],
];
export function Logo() { return <a className="logo" href="/" aria-label="Choop home">choop<span>✳</span></a>; }
export function ButtonLink({ href, children, variant = 'dark', small = false }) {
  return <a className={`button ${variant}${small ? ' small' : ''}`} href={href.startsWith('#') ? href : pagePath(href)}>{children}<span>↗</span></a>;
}
export function Card({ children, ...props }) { return <article {...props}>{children}</article>; }
export function CitySelector() {
  const [city, setCity] = useState('');
  return <div className="city-selector"><span aria-hidden="true" className="city-pin">⌖</span><label className="sr-only" htmlFor="city-select">Choose your city</label><select id="city-select" value={city} onChange={(event) => setCity(isSupportedCity(event.target.value) ? event.target.value : '')}><option value="">Choose your city</option>{cities.map((name) => <option key={name} value={name}>{name}</option>)}</select><span aria-hidden="true" className="city-chevron">⌄</span></div>;
}
function HeaderLinks({ businessArea, business }) {
  const items = businessArea
    ? (business ? [['Dashboard', '/business/dashboard'], ['My coupons', '/business/dashboard#coupons'], ['Explore CHOOP', '/explore']] : [['For businesses', '/business'], ['Explore CHOOP', '/explore']])
    : [['Explore', '/explore'], ['How it works', '/how-it-works'], ['For businesses', '/business']];
  return <>{items.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</>;
}
function ConsumerAccount({ user, status, onSignOut, mobile = false }) {
  if (status === 'loading') return <span className="header-session-status" role="status">Loading account…</span>;
  if (status === 'error') return <span className="header-session-status">Account unavailable</span>;
  if (!user) return mobile ? <><a href="/sign-in">Sign in</a><a href="/join">Join Choop</a></> : <><a className="sign" href="/sign-in">Sign in</a><ButtonLink href="/join" small>Join Choop</ButtonLink></>;
  if (mobile) return <><a href="/saved">Saved offers</a><a href="/profile">My profile</a><a href="/notifications">Notifications{!user.profileComplete ? ' (1)' : ''}</a><button onClick={onSignOut}>Sign out</button></>;
  return <div className="account-nav"><a href="/saved" className="saved-header-link" aria-label="Saved offers"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/></svg></a><a className="notification-link" href="/notifications" aria-label={user.profileComplete ? 'Notifications' : 'Notifications: complete your profile'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-2 7-2 9h16c0-2-2-2-2-9M10 20h4"/></svg>{!user.profileComplete && <span className="notification-dot"/>}</a><button type="button" className="header-signout" onClick={onSignOut} aria-label="Sign out" title="Sign out"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M14 8l4 4-4 4M18 12H8"/></svg></button><a href="/profile" className="profile-link" aria-label="My profile"><Avatar styleName={user.avatar}/></a></div>;
}
function BusinessAccount({ business, status, onSignOut, mobile = false }) {
  if (status === 'loading') return <span className="header-session-status" role="status">Loading account…</span>;
  if (status === 'error') return <span className="header-session-status">Account unavailable</span>;
  if (!business) return mobile ? <><a href="/business/sign-in">Business sign in</a><a href="/business/join">Join as a business</a></> : <><a className="sign" href="/business/sign-in">Business sign in</a><ButtonLink href="/business/join" small>Join as a business</ButtonLink></>;
  return mobile ? <><span className="mobile-business-name">{business.name}</span><a href="/business/dashboard">My dashboard</a><button onClick={onSignOut}>Sign out</button></> : <div className="account-nav business-account"><a href="/business/dashboard" className="business-identity" title={business.name}><span className="business-identity__icon" aria-hidden="true">✳</span><span>{business.name}</span></a><button onClick={onSignOut}>Sign out</button></div>;
}
export function Header({ user, sessionStatus, onSignOut, businessArea, business, businessStatus, onBusinessSignOut }) {
  const [open, setOpen] = useState(false);
  const accountProps = businessArea ? { business, status: businessStatus, onSignOut: onBusinessSignOut } : { user, status: sessionStatus, onSignOut };
  const Account = businessArea ? BusinessAccount : ConsumerAccount;
  return <header className={`header wrap${businessArea ? ' header--business' : ''}`} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}><Logo/><nav id="header-navigation" className={open ? 'open' : undefined} aria-label="Main navigation" onClick={event => { if (event.target.closest('a')) setOpen(false); }}><HeaderLinks businessArea={businessArea} business={business}/><div className="mobile-account"><Account {...accountProps} mobile/></div></nav>{!businessArea && <CitySelector/>}<div className={`header-actions${user && !businessArea ? ' header-actions--signed' : ''}`}><Account {...accountProps}/></div><button className="menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-controls="header-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button></header>;
}
export function Footer() { return <footer className="footer wrap"><div className="footer-main"><div><Logo/><p>Discover. Share. Save.</p></div><div className="footer-links">{links.map(([label, href]) => <a key={href} href={pagePath(href)}>{label}</a>)}</div></div><div className="footer-bottom"><span>© 2026 CHOOP. Concept preview.</span><span>Made for more good days. ✳</span></div></footer>; }
export function ContentCard({ heading, body, href }) {
  const image = cardImageFor(href);
  return <Card className={`sub-card${image ? ' sub-card--image' : ''}`}>
    {image && <a className="sub-card__image" href={pagePath(href)} tabIndex={-1} aria-hidden="true"><img src={`/assets/${image}`} alt="" loading="lazy" /></a>}
    <div className="sub-card__body"><h3>{heading}</h3><p>{body}</p>{href && <a className="sub-card__link" href={pagePath(href)}>Explore <span aria-hidden="true">↗</span></a>}</div>
  </Card>;
}
export function Subpage({ page, slug }) {
  const [label, title, description, image, cards] = page;
  const isExplore = slug === 'explore';
  const isCategory = ['dining', 'shopping', 'experiences'].includes(slug);
  return <main><section className="sub-hero wrap"><div><a className="back-link" href="/">← Back to home</a><p className="eyebrow pink">{label.toUpperCase()}</p><h1>{title}</h1><p className="sub-intro">{description}</p>{isExplore ? <ButtonLink href="#browse-categories">Browse categories</ButtonLink> : <ButtonLink href="/explore">Explore CHOOP</ButtonLink>}</div><img src={`/assets/${image}`} alt=""/></section><section className="wrap sub-content" id={isExplore ? 'browse-categories' : undefined}>{isExplore && <div className="sub-content__intro"><span className="eyebrow pink">FIND YOUR KIND OF GOOD TIME</span><h2>Explore by category<span>.</span></h2><p>From a great meal to a day out, start with what you love.</p></div>}<div className={`sub-grid${isCategory ? " sub-grid--category" : ""}`}>{cards.map(([heading, body, href]) => <ContentCard key={heading} heading={heading} body={body} href={href}/>)}</div>{isCategory && <div className="category-browse"><ButtonLink href="/categories.html" variant="outline">Explore more categories</ButtonLink></div>}<p className="fine">CHOOP is a concept preview. Offers and features shown are illustrative.</p></section></main>;
}
