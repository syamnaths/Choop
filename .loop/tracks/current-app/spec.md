# CHOOP concept and city selection

Status: building · map `current-app` in `docs/app-map/atlas-data.mjs`

## Scope

Record the existing React concept and add a header selector for major Indian cities. Start with “Choose your city”; choosing an option updates the control only. No location detection, filtering, storage, network submission or claim of exhaustive coverage. Selection resets on page navigation or reload. Existing offers and accounts remain illustrative.

## Evidence

- RED: `node --test tests/cities.test.mjs` failed because the city module did not exist.
- GREEN: the same test passed for representative major cities, uniqueness, and invalid values.
- `npm run build` passed; 19 static entry pages generated.
- Security review: source inspection found no network request, storage or sensitive input in this feature. No confirmed vulnerabilities; no browser or third-party audit performed.
- Browser and visual review: not run. The prior local server bind was denied by the environment; browser execution was not requested. Phone layout and actual keyboard interaction remain unverified.
- Existing prototype content and legal placeholders remain non-production; no legal compliance claim.

## Remaining before delivery

Run a local server and visually verify the header at desktop and phone widths, select a city with keyboard and touch, confirm reset behavior, and inspect console errors. Then reconcile the map and mark it delivered with fresh evidence. No Git checkpoint was made because the project is not a Git repository.

## Explore category cards — 2026-11-14

- Added a visible category directory on Explore and a reusable `ContentCard` with destination-specific, local images. Non-linked informational cards remain text-led; no offers or categories were invented.
- RED: `node --test tests/explore-categories.test.mjs` failed because the image mapping did not exist. GREEN: that test and the city test pass; they check all three category destinations and asset files.
- `npm run build` passed. A first HTTP request to `/explore.html` returned 200, but subsequent module and image requests failed to connect; the local runtime is therefore not verified. Browser/visual review not run.
- Focused source review: images are bundled local assets and links are fixed internal paths; no new data collection or network service. No confirmed vulnerability from this limited review.
- Next: check category images, links, layout and console at phone and desktop in a functioning browser and server; keep the map building until that and the earlier city-selector review are complete.

## Category navigation refinement — 2026-11-14

Replaced the oversized “Explore more categories” cards on the three category pages with a compact outline CTA. Offer cards remain image-led. City and Explore tests and the production build passed; browser visual review remains outstanding. No data, network or security boundary changed.

## Style Deal detail — 2026-11-14

Replaced the generic Style Deal screen with a tailored offer detail, example merchant, sample terms and proposed redemption steps. The fictional merchant and example-only offer are explicitly identified; claim is disabled. No transaction, collection or backend was added. Existing city and category tests and the production build passed. No dedicated behavior test was added for static copy. Source review found no new security boundary; browser, visual and runtime verification remain outstanding.

## Clean URLs — 2026-11-14

Added clean routes (including `/explore`, `/categories/shopping`, and `/offers/style-deal`) while preserving legacy `.html` entries. The route test covers clean and legacy resolution and unknown nested paths; production build and output-entry checks passed. Static-host deep-link behavior and browser/runtime verification remain outstanding. Database-backed content is requested but database choice and scope are pending.

## Local MongoDB catalog and accounts — 2026-11-14

Owner selected local MongoDB for categories, offers and merchant details, and email/password sign-in. Added read-only catalog API, dynamic routes and UI states, local-only opt-in sample seed, and local email/password registration, login, session and logout. Passwords use salted scrypt, sessions use hashed random tokens and HttpOnly SameSite cookies. Email verification, recovery and account deletion are not implemented; no production claim.

Unit/integration-with-fakes checks cover auth hashing, duplicate accounts, login, expiry, logout, catalog routing and publication windows; build passed. MongoDB driver install failed due to registry DNS, and no `mongod` was found: real database, HTTP, browser, cookies, UI and network-error behavior are unverified. Security review is limited to source and mocked tests; local per-process throttling is not a production safeguard. Next: install dependencies and start local MongoDB, then verify full flows against a disposable database, including unique indexes, session expiry and failure handling. Keep map building.

## Local API startup diagnosis — 2026-11-14

Vite returned HTTP 502 because the API was not listening on 127.0.0.1:3001. `mongod` and the MongoDB Node driver were absent; npm install failed with registry DNS ENOTFOUND. Starting the API and the new combined dev command failed in this environment with listen EPERM. Docker daemon access was denied. Added a combined dev launcher and an explicit JSON 503 proxy response when the API is unavailable; these do not replace the required MongoDB service. Targeted tests and build passed; runtime, MongoDB and browser verification remain blocked. `chext_driver.js` was not found in application sources and appears external to the project.

## Password visibility — 2026-11-14

Added a keyboard-accessible labeled show/hide control to the shared sign-in and join form; passwords remain masked initially. Production build and authentication unit tests passed. Browser verification is outstanding.

## API 503 diagnosis — 2026-11-14

API on port 3001 and Vite proxy both returned the API's JSON 503; MongoDB driver is now installed. No listener was observed on local port 27017; direct sandbox connection returned EPERM, so precise database-side diagnosis requires host terminal evidence. Added a safe connection-error message in the API terminal without logging URI or credentials. Auth/catalog tests and server syntax check passed. MongoDB and end-to-end auth remain unverified.

## Profile and notifications — 2026-11-14

Signed-in users can open a profile from the header avatar and choose a built-in avatar style, display name and city. A header notification links to the profile while name or city is missing; it is derived from saved profile fields and is not persisted as a notification. Profile changes require an active session and update only the authenticated account. No image upload or geolocation is used.

RED: profile validation test failed before the module existed. GREEN: validation, unauthorized/expired session behavior and cross-account protection tested with a fake database; auth tests and production build passed. Source review checked server-side session binding, field allowlisting and same-origin POST; real MongoDB, HTTP and browser verification remain outstanding. Privacy checklist and handoff updated for profile data.

## Profile interests — 2026-11-14

Added optional searchable multi-select interests with removable tags, up to 12 choices from a shared allowlist. The server validates and saves tags for the authenticated user; existing accounts without interests default to an empty list. Profile-completion rules remain name and city only. Tags are not yet used to rank or filter offers. RED: validation test failed before implementation; GREEN: profile and auth tests and production build passed, using a fake database for authorization tests. Privacy notes updated. Real MongoDB and browser verification remain outstanding.

## Business accounts and coupons — 2026-11-14

Added separate business sign-up, sign-in and sessions; owner-scoped coupon drafts and explicit publish/unpublish; business landing and dashboard. Drafts are hidden from public catalog. New category-only local seed inserts missing default categories without changing existing documents or adding offers. Consumer and business cookies and collections are separate. Passwords use existing scrypt; mutations use same-origin checks, and business ownership is resolved from session rather than client input.

Focused fake-database tests pass for validation, unauthenticated access and cross-business publishing denial. Production build passed. The running existing API returned 200 for auth session and an empty categories list, showing database access from that process; it predates these server changes. Restart and live business registration/coupon flow remain unverified; browser checks not run. Self-service merchant verification, moderation, offer editing, redemption, email verification and password recovery are not implemented. The implementation is local development only; no production-readiness claim.

## Business registration 405 — 2026-11-14

Observed POST `/api/business/register` return 405 with `Allow: GET` through both Vite and port 3001; the running API predates the business routes. Updated the combined dev launcher to run the API with Node watch mode so later server changes reload automatically. A one-time restart of the existing dev process is still required. Business unit tests and build passed; live registration has not yet been retried. Browser `chext_driver.js` warnings are not from project source.

## Empty business categories — 2026-11-14

The running `/api/categories` endpoint returned 200 with an empty array, so the dashboard selector has no options. Attempted the local-only `npm run seed:categories` command; it could not connect from this execution environment. The existing seed uses insert-if-absent and does not overwrite categories or create example offers. Run it in the user's terminal connected to the same local database, then refresh and verify the API returns categories.

## Profile city autofill — 2026-11-14

When a signed-in user opens a profile without a saved city, the browser requests location permission and the app finds the nearest supported city locally within 25 km, rejecting imprecise readings. The suggested city remains editable and is persisted only when the profile is saved; coordinates are neither sent nor stored. Denial, unsupported browsers and unmatched locations retain manual selection. RED: location test failed before the module existed; GREEN: nearest-city, distant, inaccurate and invalid cases and profile tests passed; build passed. Browser permission prompts, exact geographic coverage and runtime behavior remain unverified. Privacy checklist and handoff updated.

## Business header session — 2026-11-14

Business pages now use the business session for header actions, rather than the separate consumer session. Signed-in businesses see Dashboard and Sign out; signed-out businesses see business-specific sign-in and join links. The mobile menu uses the same distinction. Build and business/auth tests passed; browser and live session verification remain outstanding.

## Authentication attempt limits — 2026-11-14

Fixed a shared 20-request bucket that counted profile saves, coupon actions, and sign-outs as sign-in attempts. Only consumer/business login and registration now consume separate per-IP fixed-window budgets; 429 includes Retry-After and an estimated wait. The local per-process limiter is not production-grade. RED: limiter test failed before module creation. GREEN: limiter, auth and business tests and server syntax passed. Runtime: an empty login request through Vite returned the expected 401 rather than 429, and session returned 200; successful login with user credentials was not tested.

## Role-aware header and category selector — 2026-11-14

Owner clarified “admin” means the business or merchant account. Refactored header navigation and account controls for consumer, guest and business sessions, including mobile and unavailable/loading states. No platform administrator role was added. Improved business coupon category select styling and explicit loading/empty/error disabled states while retaining a native select. Build and existing business/auth/route tests passed; browser visual and live session checks remain outstanding.

## Merchant dashboard layout — 2026-11-14

Reworked the business dashboard into a distinct workspace with responsive navigation, business identity, coupon counts derived from the current API response, draft/published list and existing create/publish actions. No invented performance analytics. The API returns at most 100 coupons; the overview indicates this when the limit is reached. Production build and business/auth/catalog unit tests passed. Browser visual, keyboard and end-to-end verification were not run; real-session behavior remains to be checked.

## Save, share and redeem — 2026-11-14

Owner selected one-time codes and one redemption per consumer per offer. Added owner-scoped saved-offer records, a saved page and public-link sharing. Eligible published non-example offers can issue a 10-minute random code, stored only as a hash; generating a replacement invalidates the old code. Owning businesses can redeem in the dashboard; atomic claim update and unique user/offer index prevent duplicate use. Unauthenticated and wrong-merchant requests fail, and expired codes are rejected. Save and redemption methods use same-origin checks and server-derived identities; code attempts use local per-process rate limits.

Fake-database unit tests cover saving isolation, idempotence, invalid/expired/replaced codes, wrong merchant, concurrent redemption and repeat claim; auth/business tests and build passed. Runtime: unauthenticated API requests through Vite returned expected 401 for saved, code issuance and merchant redemption. Real authenticated MongoDB flow and browser interaction not tested. Important limitation: offer eligibility checks and claim updates are separate database operations, so unpublishing/expiry can race with redemption; distributed rate limits, merchant verification, audit/reconciliation and security review remain production blockers. User and business personal data and redemption records require privacy and retention decisions.

## Offer discovery and browser titles — 2026-11-14

Moved offer cards near the top of the home page and made Explore an offer list with category filters, removing the category-introduction and extra click from the main path. Category pages show offers directly; offer cards have one full-card link. Sign-in and join preserve a validated internal offer return path. Dynamic category/offer and business routes now receive meaningful browser titles, with loaded names overriding generic titles and missing records identified honestly. Duplicate offer error text removed.

Filter, route and safe-return tests, catalog, saved and redemption tests and production build passed. Public API returned categories and offers. Browser, keyboard, visual and successful authenticated return flow were not tested. Existing API list is capped at 100 offers, so client-side filters cover the returned list only; production pagination/filtering remains open.

## Coupon ticket cards and saved icon — 2026-11-14

Offer cards now use a ticket-shaped, whole-card link with a discount stub, perforated divider and compact merchant image; category cards remain unchanged. Replaced the header heart glyph with a proportioned SVG. Explore category selection now requests filtered offers from the API, rather than filtering only the first unfiltered response; each response remains capped at 100 and shows a notice at that limit. Build, catalog, route, saved and redemption tests passed. Browser visual and interaction verification remain outstanding.

## Default redemption guidance and header controls — 2026-11-14

Offer detail pages without merchant-specific steps now explain the existing one-time-code journey; example offers explicitly remain non-redeemable. The consumer desktop header uses a labeled sign-out icon with profile avatar last; mobile retains sign-out in the menu. Catalog, redemption and route tests and build passed. Browser visual and end-to-end verification remain outstanding.

## Hosted preview preparation — 2026-11-14

Prepared a Render free web service and MongoDB Atlas free-cluster configuration in `render.yaml`, with Node serving the built app and API from one origin, clean-route fallback, health endpoint, required production database URI and secure-cookie setting. The Render config explicitly enables read-only preview mode: all writes and account/session-backed data are blocked, while public catalog reads use a read-only database connection without creating indexes. A visible banner describes the restriction. Synthetic, non-redeemable import data and setup instructions are in `docs/hosting/`.

Static routing and preview policy tests, existing catalog/auth/business/redemption tests and build passed; npm ci offline dry-run passed with an engine warning because this machine runs Node 25 and the deployment is pinned to Node 22.22.0. No cloud deployment, hosted runtime or authenticated browser test was performed. Git is not initialized. Production acceptance remains blocked by authentication/verification, moderation, durable rate limiting, privacy/deletion, redemption race and end-to-end review. No live or personal data should be used in the preview.

## Render setup handoff — 2026-11-14

Verified Blueprint configuration, locked dependencies, production-mode build, preview-policy/static/catalog/route checks and Atlas contract. Added selective GitHub commands and clarified separate Atlas import credentials in the hosted preview guide. No repository, Render service, Atlas cluster or hosted verification was created; owner will perform setup. This remains read-only preview only, with the previously documented production blockers.

## Local test accounts and Render configuration — 2026-11-14

At the owner's request, created two local test consumer accounts and one test business via the application API; created three TEST-labeled local offers and saved one for the first test user. Account credentials were provided to the owner and are not recorded here. API confirmed creation, publication and one saved offer; temporary sessions were signed out. The test offers are local test data, not real merchant promotions, and should not be migrated to a public deployment. Render startup log reports MONGODB_URI is missing; owner needs to configure the Atlas secret in Render. The prepared Render deployment is read-only and these local accounts do not exist there.
