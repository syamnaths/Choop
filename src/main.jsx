import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Home.jsx';
import { CategoryDirectory, CategoryPage, OfferPage } from './Catalog.jsx';
import AuthPage from './AuthPage.jsx';
import { SavedPage } from './OfferActions.jsx';
import { BusinessLanding, BusinessAuth, BusinessDashboard } from './Business.jsx';
import { ProfilePage, NotificationsPage } from './Profile.jsx';
import { Header, Footer, Subpage } from './components.jsx';
import pages from './pages.json';
import { routeSlug, safeOfferReturn, pageTitle } from './routes.js';
import './styles.css';

function App() {
  const slug = routeSlug(window.location.pathname);
  const businessPath = window.location.pathname.replace(/\/$/, '');
  const home = !slug || slug === 'index';
  const isBusinessDashboard = businessPath === '/business/dashboard';
  const page = pages[slug];
  const path = window.location.pathname;
  const categoryRoute = path.startsWith('/categories/') || ['dining', 'shopping', 'experiences'].includes(slug);
  const offerRoute = path.startsWith('/offers/') || ['style-deal', 'cafe-treat', 'weekend-special'].includes(slug);
  const [notice, setNotice] = useState('');
  const [readOnlyPreview, setReadOnlyPreview] = useState(false);
  useEffect(() => { const controller = new AbortController(); fetch('/api/config', { signal: controller.signal }).then(response => response.ok ? response.json() : null).then(data => { if (data) setReadOnlyPreview(data.readOnlyPreview === true); }).catch(() => {}); return () => controller.abort(); }, []);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [businessStatus, setBusinessStatus] = useState('loading');
  const isBusinessArea = businessPath === '/business' || businessPath.startsWith('/business/');
  useEffect(() => { if (!isBusinessArea) return; const controller = new AbortController(); fetch('/api/business/session', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('unavailable'); return response.json(); }).then(data => { setBusiness(data.business); setBusinessStatus('ready'); }).catch(error => { if (error.name !== 'AbortError') setBusinessStatus('error'); }); return () => controller.abort(); }, [isBusinessArea]);
  async function businessSignOut() { try { const response = await fetch('/api/business/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); if (!response.ok) throw new Error(); setBusiness(null); window.location.href = '/business'; } catch { setNotice('Unable to sign out. Please try again.'); } }
  const [sessionStatus, setSessionStatus] = useState('loading');
  useEffect(() => { const controller = new AbortController(); fetch('/api/auth/session', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('unavailable'); return response.json(); }).then(data => { setUser(data.user); setSessionStatus('ready'); }).catch(error => { if (error.name !== 'AbortError') setSessionStatus('error'); }); return () => controller.abort(); }, []);
  async function signOut() { try { const response = await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); if (!response.ok) throw new Error(); setUser(null); setNotice('You have signed out.'); } catch { setNotice('Unable to sign out. Please try again.'); } }
  useEffect(() => {
    document.body.classList.toggle('subpage', !home);
    document.title = pageTitle(window.location.pathname, pages);
    return () => document.body.classList.remove('subpage');
  }, [home, page]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches || !('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll('main > section:not(.hero):not(.sub-hero), .sub-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight) return;
      target.classList.add('reveal');
      observer.observe(target);
    });
    return () => {
      observer.disconnect();
      targets.forEach((target) => target.classList.remove('reveal', 'is-visible'));
    };
  }, [home, page]);
  function scrollOffers(direction) {
    const carousel = document.querySelector('#offer-scroll');
    const card = carousel?.querySelector('article');
    if (card) carousel.scrollBy({ left: direction * (card.offsetWidth + 18), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function onNewsletterSubmit(event) {
    event.preventDefault();
    setNotice('Newsletter signup is a preview and is not connected yet.');
  }
  return <>{readOnlyPreview && <div className="preview-notice" role="status">Preview mode: browse offers. Accounts, saving, and redemption are not available.</div>}{!isBusinessDashboard && <Header user={user} sessionStatus={sessionStatus} onSignOut={signOut} businessArea={isBusinessArea} business={business} businessStatus={businessStatus} onBusinessSignOut={businessSignOut}/>} {businessPath === '/business' ? <BusinessLanding/> : businessPath === '/business/join' ? <BusinessAuth join/> : businessPath === '/business/sign-in' ? <BusinessAuth join={false}/> : businessPath === '/business/dashboard' ? <BusinessDashboard/> : home ? <Home scrollOffers={scrollOffers} onNewsletterSubmit={onNewsletterSubmit}/> : slug === 'saved' ? <SavedPage user={user} sessionStatus={sessionStatus}/> : slug === 'profile' ? <ProfilePage user={user} status={sessionStatus} onUpdate={setUser}/> : slug === 'notifications' ? <NotificationsPage user={user} status={sessionStatus}/> : ['sign-in', 'join'].includes(slug) ? <AuthPage mode={slug} onAuthenticated={() => { window.location.href = safeOfferReturn(new URLSearchParams(window.location.search).get('next')); }}/> : ['explore', 'categories'].includes(slug) ? <CategoryDirectory/> : categoryRoute && slug !== '__not_found__' ? <CategoryPage slug={slug}/> : offerRoute && slug !== '__not_found__' ? <OfferPage slug={slug} user={user} sessionStatus={sessionStatus}/> : page ? <Subpage page={page} slug={slug}/> : <main className="wrap sub-content"><h1>Page not found.</h1><a href="/">← Back to home</a></main>}{!isBusinessDashboard && <Footer/>}<div className={`toast${notice ? ' show' : ''}`} role="status" aria-live="polite">{notice}</div></>;
}
createRoot(document.getElementById('root')).render(<App/>);
