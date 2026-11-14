# Platform

Chosen at the start: **Web app / PWA (runs in a browser)**. Stack: **React 19, Vite 8, JavaScript/CSS, Node API and local MongoDB**.
Change this file (and the release map) if the owner changes the platform. Do not change the platform without the owner's decision.

## Stack options considered

- Web app / PWA (runs in a browser): plain HTML/CSS/JS, React, Vue, Svelte, Next.js, Astro

## Test commands

- Web app / PWA (runs in a browser): node --test tests/*.test.mjs and npm run build

Atlas commands (Node 18+, development only): `npm run atlas`, `npm run atlas:status`, `npm run atlas:next`, `npm run atlas:check`, `npm run atlas:verify`.

## Proof ladder (strongest level reached is reported)

- Web app / PWA (runs in a browser): static → unit → runtime (local server) → browser (Playwright: real clicks, storage, service worker) → device (phone browser check)

Visual proof: phone-width and desktop screenshots in a real browser.

## Platform rules

- Bump `?v=` pins, the service-worker cache name and pinned tests together when a served file changes.
- Works at phone width without horizontal scroll; keyboard and screen-reader basics.
- Offline and slow-network behaviour stated when the app is a PWA.
- User text lives in locale files (for example `locales/<lang>.json`), in every language: en.

## Shared hotspots (one owner at a time)

app shell / entry HTML, service worker and cache names, shared translations, router

## Release path

1. Build or bundle the site
2. Check it on a phone browser
3. Owner approves the deploy
4. Deploy to the host
5. Confirm the live version number
