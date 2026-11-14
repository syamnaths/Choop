# CHOOP

React implementation of the approved CHOOP v1 concept with a local MongoDB-backed catalog. The original static prototype remains in `choop-v1/` for reference.

## Run locally

Requires Node.js 22.12+ (22.x) and npm.

```sh
npm install
npm run dev
```

Run `npm run build` to create the static site in `dist/`, or `npm run preview` to serve that build. The build creates directory-based clean URLs and keeps the original `.html` entries for compatibility on static hosting.

## Structure

- `src/main.jsx`: application entry, route selection, and interactive state.
- `src/components.jsx`: shared navigation, footer, buttons, cards, and secondary-page layout.
- `src/Home.jsx`: landing-page section components.
- `src/pages.json`: content for secondary pages.
- `src/routes.js`: clean paths and legacy route resolution.
- `src/styles.css`: approved visual styles and animation.
- `public/assets/`: local image assets.
- `choop-v1/BRAND-AND-DESIGN-SYSTEM.md`: brand and design guidance.

Category and offer pages use the catalog API. Email/password accounts are implemented for local development; claiming, personalization, and newsletter signup remain concept previews.

## MongoDB catalog

The home catalog, category directory, category details and offer details read from a local server API. Start a local MongoDB server, install dependencies with `npm install`, then run `npm run dev`; it starts both the API and Vite together. If Vite was already running, stop it first and restart with `npm run dev`. For separate processes, use `npm run api` and `npm run dev:web`. The API defaults to `mongodb://127.0.0.1:27017`, database `choop`, and port `3001`. To override these, set `MONGODB_URI`, `MONGODB_DATABASE`, and `API_PORT` in the API process environment; the example `.env.example` is documentation and is not automatically loaded. If changing the API port, also update the Vite proxy. Database credentials must never use a `VITE_` prefix or be included in frontend files.

To populate a **local development database** with clearly marked illustrative records, explicitly run `npm run seed:examples`. It inserts only missing slugs and does not overwrite existing documents. The seed refuses non-local MongoDB URIs. No data is seeded automatically.

Collections: `categories` contain `slug`, `title`, `headline`, `description`, local `image`, `published`, and `order`. `offers` contain `slug`, `categorySlug`, `title`, `description`, local `image`, `discountPercent`, `merchant.name`, `terms`, `redemptionSteps`, `example`, and `published`; optional `startsAt` and `endsAt` must be BSON dates. Only published records in their availability window are returned. The sample seeder creates unique slug indexes. Create the same indexes when provisioning other databases.

The public API is read-only: `GET /api/categories`, `GET /api/categories/:slug`, `GET /api/offers?category=:slug`, and `GET /api/offers/:slug`. It returns 404 for missing records and 503 when MongoDB is unavailable. Offer redemption is available as a local-development flow; see below. The MongoDB service must be started independently. If the UI reports the catalog or account service is unavailable, verify MongoDB is running and `npm install` completed. The Node API listens on localhost and is intended for local development; production needs a deliberate deployment, access controls, rate limiting, and an HTTPS reverse proxy. For dynamic new slugs, the production host must rewrite unknown app routes to `index.html` and route `/api` to the API server. Legacy built `.html` routes remain supported.

## Local email and password accounts

With MongoDB and the API running, `/join` creates an account and `/sign-in` signs in. Passwords are salted and hashed with Node's `scrypt`; raw passwords and session tokens are not stored. Sessions expire after seven days and use an HttpOnly, SameSite=Strict cookie. Sign-out revokes the current session. Account email addresses, password hashes, display names, selected cities, built-in avatar styles and optional interest tags live in the `users` collection; session token hashes, user IDs, and expiry dates live in `sessions`. The API creates unique email and token indexes and a session expiry index on startup.

When a signed-in user opens an incomplete profile without a city, the browser requests location permission; coordinates are matched locally to an approximate supported city and are not sent to the server. The suggested city is saved only when the user saves the profile. Interest tags are saved preferences and are not yet used to rank or filter offers. The profile-completion notification is derived from the saved name and city and is not a stored notification. These are local-development flows. Email ownership verification, password recovery, deletion, production-grade abuse prevention, and a production deployment are not implemented. Do not treat these accounts as production-ready. Before any production use, configure HTTPS, set `COOKIE_SECURE=true`, use an appropriate durable rate limiter and review the authentication, privacy and recovery design. The current in-memory rate limit is per process and does not survive a restart.

## Business accounts and coupons

`/business` links to separate business sign-up, sign-in and dashboard pages. Business accounts and sessions are separate from consumer accounts. A signed-in business can create its own coupon drafts and explicitly publish or unpublish them. Published coupons appear in the public catalog; the local development redemption flow is described below. The API enforces business-session ownership on coupon changes. Business names and email addresses are stored with password hashes in `businesses`; session token hashes and expiry are stored in `businessSessions`. Merchant verification, email verification, recovery, moderation, offer editing and production-grade rate limiting are not implemented; this flow is for local development.

A new database needs categories before a business can create coupons. To add only the default categories to local MongoDB (without sample offers or overwriting existing category documents), run `npm run seed:categories`. The combined `npm run dev` command uses Node watch mode to reload the API after server-file changes. Restart an already-running older dev process once to pick up this setting.

## Saved offers, sharing, and redemption

Signed-in consumers can save available offers and find them under `/saved`. Sharing uses the device share sheet where available, with a copy-link fallback; it shares the public offer link, never a redemption code. Eligible non-example offers owned by a business can issue a 10-minute one-time code. Generating another code invalidates the previous code. A signed-in owning business enters the code in its dashboard; a successful redemption marks it used, and each consumer can redeem an offer once. Offer status and expiry are checked by the server. Codes are random, stored as hashes, and protected by a basic in-memory attempt limit.

This is a local-development implementation. Claiming and redemption have not been verified end to end with real user and business sessions. The current service checks offer availability and marks the redemption in separate database operations; simultaneous unpublishing or expiry can race with redemption. Durable distributed rate limiting, merchant verification, audit/reconciliation and production security review remain necessary before using this with real offers.

## Hosted preview

A read-only Render + MongoDB Atlas preview configuration is included. See [the hosting guide](docs/hosting/RENDER-PREVIEW.md) for setup, limits and production gaps. No service is deployed automatically.
