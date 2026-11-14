import React, { useState } from 'react';
import { safeOfferReturn } from './routes.js';

export default function AuthPage({ mode, onAuthenticated }) {
  const join = mode === 'join';
  const returnTo = safeOfferReturn(new URLSearchParams(window.location.search).get('next'));
  const switchLink = `${join ? '/sign-in' : '/join'}${returnTo === '/' ? '' : `?next=${encodeURIComponent(returnTo)}`}`;
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false); const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setError(''); setPending(true);
    try {
      const response = await fetch(`/api/auth/${join ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Please try again.');
      setPassword(''); onAuthenticated(data.user);
    } catch (err) { setError(err.message === 'Failed to fetch' ? 'Unable to connect. Please try again later.' : err.message); }
    finally { setPending(false); }
  }
  return <main className="auth-page wrap"><div className="auth-panel"><a className="back-link" href="/">← Back to home</a><span className="eyebrow pink">{join ? 'COME ON IN' : 'GOOD TO SEE YOU'}</span><h1>{join ? 'Good things are better together.' : 'Welcome back.'}</h1><p>{join ? 'Create your account and discover more of the good stuff.' : 'Sign in to your CHOOP account.'}</p><form onSubmit={submit} className="auth-form"><label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required/><label htmlFor="auth-password">Password</label><div className="password-field"><input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={join ? 'new-password' : 'current-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={join ? 12 : undefined} maxLength={128} required/><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(current => !current)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{showPassword && <path d="M4 4l16 16"/>}</svg></button></div>{join && <small>Use at least 12 characters.</small>}{error && <p role="alert" className="auth-error">{error}</p>}<button className="button dark" disabled={pending} type="submit">{pending ? 'Please wait…' : join ? 'Join Choop' : 'Sign in'} <span>↗</span></button></form><p className="auth-switch">{join ? 'Already have an account?' : 'New to CHOOP?'} <a href={switchLink}>{join ? 'Sign in' : 'Join Choop'} →</a></p><p className="fine">Email verification and password recovery are not available yet.</p></div><div className="auth-image"><img src="/assets/friends-cafe.png" alt="Friends enjoying a meal together"/><span>GOOD FINDS.<br/>BETTER TOGETHER. ✳</span></div></main>;
}
