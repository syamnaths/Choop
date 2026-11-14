import React, { useEffect, useRef, useState } from 'react';
import { cities } from './cities.js';
import { nearestCity } from './location.js';
import { interests as availableInterests, maxInterests } from './interests.js';

const styles = ['pink', 'lavender', 'peach', 'teal'];
export function Avatar({ styleName = 'pink', size = '' }) {
  const safeStyle = styles.includes(styleName) ? styleName : 'pink';
  return <span className={`avatar avatar--${safeStyle} ${size}`}><img src="/assets/avatar.svg" alt=""/></span>;
}
function AccountState({ user, status }) {
  return <main className="wrap account-page"><div className="account-message">{status === 'loading' ? <p role="status">Loading your account…</p> : status === 'error' ? <><h1>We couldn’t load your account.</h1><p>Please try again when the service is available.</p></> : <><h1>Sign in to continue.</h1><p>Your profile and notifications are available after you sign in.</p><a className="button dark" href="/sign-in">Sign in <span>↗</span></a></>}</div></main>;
}
export function ProfilePage({ user, status, onUpdate }) {
  const cityTouched = useRef(false); const locationAttempted = useRef(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [name, setName] = useState(''); const [city, setCity] = useState(''); const [avatar, setAvatar] = useState('pink');
  const [selectedInterests, setSelectedInterests] = useState([]); const [interestQuery, setInterestQuery] = useState('');
  const [pending, setPending] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  useEffect(() => { if (user) { setName(user.displayName || ''); setCity(user.city || ''); setAvatar(user.avatar || 'pink'); setSelectedInterests(user.interests || []); } }, [user]);
  useEffect(() => {
    if (!user || user.city || locationAttempted.current) return;
    locationAttempted.current = true;
    if (!navigator.geolocation) { setLocationMessage('Location is unavailable. Please choose your city.'); return; }
    let active = true;
    setLocationMessage('Checking your location…');
    navigator.geolocation.getCurrentPosition(position => {
      if (!active || cityTouched.current) return;
      const suggestion = nearestCity(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
      if (suggestion) { setCity(current => current || suggestion); setLocationMessage(`Suggested ${suggestion} based on your location. Please check and save.`); }
      else setLocationMessage('Could not identify a nearby supported city. Please choose one.');
    }, () => { if (active && !cityTouched.current) setLocationMessage('Location unavailable or not allowed. Please choose your city.'); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    return () => { active = false; };
  }, [user]);
  if (!user) return <AccountState status={status}/>;
  async function save(event) {
    event.preventDefault(); setError(''); setMessage(''); setPending(true);
    try {
      const response = await fetch('/api/auth/profile', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({displayName:name, city, avatar, interests:selectedInterests}) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to save your profile.');
      onUpdate(data.user); setMessage('Your profile has been saved.');
    } catch (err) { setError(err.message === 'Failed to fetch' ? 'Unable to connect. Please try again later.' : err.message); }
    finally { setPending(false); }
  }
  const filteredInterests = availableInterests.filter(item => item.toLowerCase().includes(interestQuery.trim().toLowerCase()));
  function toggleInterest(item) { setSelectedInterests(current => current.includes(item) ? current.filter(value => value !== item) : current.length < maxInterests ? [...current, item] : current); }
  return <main className="wrap account-page"><a className="back-link" href="/">← Back to home</a><div className="account-heading"><span className="eyebrow pink">A LITTLE MORE YOU</span><h1>Your profile<span>.</span></h1><p>A few details to make CHOOP feel more like you.</p></div><div className="profile-layout"><aside className="profile-preview"><Avatar styleName={avatar} size="avatar--large"/><h2>{name.trim() || 'Your name'}</h2><p>{city || 'Your city'}</p><span className="profile-email">{user.email}</span></aside><form className="profile-form" onSubmit={save}><h2>Make it yours</h2><p>Choose an avatar and tell us what to call you.</p><fieldset className="avatar-options"><legend>Avatar style</legend>{styles.map(style => <label key={style} className="avatar-choice"><input type="radio" name="avatar" value={style} checked={avatar === style} onChange={()=>setAvatar(style)}/><Avatar styleName={style}/><span className="sr-only">{style}</span></label>)}</fieldset><label htmlFor="display-name">Display name</label><input id="display-name" value={name} onChange={event=>setName(event.target.value)} maxLength={80} required autoComplete="name"/><label htmlFor="profile-city">Your city</label><select id="profile-city" value={city} onChange={event=>{ cityTouched.current = true; setCity(event.target.value); setLocationMessage(''); }} required><option value="">Choose your city</option>{cities.map(item=><option value={item} key={item}>{item}</option>)}</select>{locationMessage && <p className="location-message" role="status">{locationMessage}</p>}<section className="interests-field" aria-labelledby="interests-heading"><div className="interests-heading"><div><h3 id="interests-heading">Your interests</h3><p>Choose what you enjoy. You can change these anytime.</p></div><span>{selectedInterests.length}/{maxInterests}</span></div><label className="sr-only" htmlFor="interest-search">Search interests</label><input id="interest-search" className="interest-search" type="search" placeholder="Search hobbies and interests" value={interestQuery} onChange={event=>setInterestQuery(event.target.value)} autoComplete="off"/><div className="selected-interests" aria-label="Selected interests">{selectedInterests.map(item=><button type="button" key={item} className="interest-tag" aria-label={`Remove ${item}`} onClick={()=>toggleInterest(item)}>{item}<span aria-hidden="true">×</span></button>)}</div><fieldset className="interest-options"><legend className="sr-only">Choose up to {maxInterests} interests</legend>{filteredInterests.length ? filteredInterests.map(item=><label key={item} className="interest-option"><input type="checkbox" checked={selectedInterests.includes(item)} disabled={!selectedInterests.includes(item) && selectedInterests.length >= maxInterests} onChange={()=>toggleInterest(item)}/><span>{item}</span></label>) : <p className="interest-empty">No matching interests. Try another search.</p>}</fieldset><p className="interest-note">Optional. Your choices are saved to your profile; offer matching is coming later.</p></section>{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="profile-success" role="status">{message}</p>}<button className="button dark" disabled={pending} type="submit">{pending ? 'Saving…' : 'Save profile'} <span>↗</span></button></form></div></main>;
}
export function NotificationsPage({ user, status }) {
  if (!user) return <AccountState status={status}/>;
  return <main className="wrap account-page"><a className="back-link" href="/">← Back to home</a><div className="account-heading"><span className="eyebrow pink">YOUR UPDATES</span><h1>Notifications<span>.</span></h1><p>Little reminders, all in one place.</p></div>{!user.profileComplete ? <div className="notification-card"><div className="notification-icon" aria-hidden="true">✳</div><div><span className="eyebrow pink">GETTING STARTED</span><h2>Complete your profile</h2><p>Add your name and city so your CHOOP profile feels more like you.</p><a href="/profile">Complete profile ↗</a></div></div> : <div className="notification-empty"><span aria-hidden="true">✳</span><h2>All caught up.</h2><p>There are no notifications right now.</p></div>}</main>;
}
