# CHOOP hosted preview: Render + MongoDB Atlas

This prepares a **public, read-only preview**, not a production launch. Account registration/sign-in, saving, business management, and redemption are blocked by the API in preview mode. Use synthetic catalog data only. Do not use real personal data or real offers in this preview.

## Before creating services

- This project was not a Git repository when prepared. Create a repository and push the project to a Git provider only when you are ready. Do not commit `.env`, credentials, `node_modules`, or `dist`.
- The checked-in `render.yaml` creates one free Node web service. It builds the React app and serves it and the API on the same origin. It requires a MongoDB Atlas connection string; do not place it in source control or share it in chat.

## Put the deployable source on GitHub

Create an empty **private** repository named `choop` on GitHub (do not initialize it with a README). In a terminal opened in this project folder, run the commands below, replacing `YOUR_USERNAME` with your GitHub username:

```sh
git init
git add .gitignore package.json package-lock.json index.html vite.config.js render.yaml README.md src server scripts public docs/hosting
git status --short
git commit -m "Prepare CHOOP preview for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/choop.git
git push -u origin main
```

The explicit file list sends the app and the hosting guide without uploading local Loop history or the original prototype. Review `git status --short` before committing and do not add secrets. Keep your local Loop files; they are not needed to build or run the hosted app. If you already initialized Git, inspect its status and remote before running these commands.

## MongoDB Atlas

1. Create a free Atlas project and free cluster. Create a database user with **read-only access** limited to a dedicated `choop_preview` database. Keep its password private.
2. In Atlas, create a separate temporary writer user and add your own network IP to the access list for importing the sample data. Create `choop_preview.categories` and `choop_preview.offers`, then use MongoDB Compass to import the JSON arrays from `docs/hosting/preview-categories.json` and `docs/hosting/preview-offers.json` into their matching empty collections, using a separate database user with write access. The Render service itself should use the read-only user. These records are synthetic and clearly labeled. Do not import them into a database with existing records.
3. Configure Atlas's network access list for the Render service's documented outbound IP ranges. Render's dashboard shows the ranges under the service's **Connect → Outbound** tab. The ranges are shared with other Render services, so use a strong, least-privilege database credential. Do not allow access from everywhere as a shortcut.
4. After importing, remove the temporary writer and your temporary IP access when no longer needed. Obtain the Node driver connection string in Atlas and keep it private. Use the read-only database user, and make sure the URI does not contain a real user's credentials in checked-in files or logs.

## Render

1. In Render, create a Blueprint from the repository containing `render.yaml`. Choose the free plan shown by the Blueprint and provide `MONGODB_URI` in Render's secret environment-variable prompt. `MONGODB_DATABASE` is set to `choop_preview`.
2. Add Render's outbound IP ranges to Atlas as described above. It may be necessary to redeploy or retry while network access propagates.
3. Confirm the service starts, `/health` responds, `/api/categories` returns only the synthetic categories, and `/explore` and a deep link load directly. Check that writes such as account registration and redemption are blocked. Review mobile/desktop and console errors before sharing.
4. The generated `onrender.com` URL is public. Share only after the owner approves publication. No deployment or account provisioning is performed by the project files.

## Production gap

Before accepting real users or real redemptions, complete an authenticated end-to-end test, independent security review, proper abuse prevention and account recovery/verification, merchant verification/moderation, privacy/retention and deletion flows, audit and reconciliation, and fix the race between offer eligibility and redemption. Confirm legal content and operational ownership. Remove read-only preview mode only after those gaps are resolved and the owner approves a launch.
