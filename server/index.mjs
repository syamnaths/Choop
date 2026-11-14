import { createServer } from 'node:http';
import { getStaticResponse } from './static.mjs';
import { previewResponse } from './preview.mjs';
import { createCatalog, dispatchCatalog, validSlug } from './catalog.mjs';
import { createBusiness } from './business.mjs';
import { createSavedOffers } from './saved.mjs';
import { createRedemptions } from './redemption.mjs';
import { authLimitScope, createAuthLimiter } from './rate-limit.mjs';
import { createAuth, readSessionToken, sameOrigin, readJson } from './auth.mjs';

const production = process.env.NODE_ENV === 'production';
if (production && !process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in production.');
if (production && process.env.COOKIE_SECURE !== 'true') throw new Error('COOKIE_SECURE=true is required in production.');
const readOnlyPreview = process.env.READ_ONLY_PREVIEW === 'true';
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DATABASE || 'choop';
const port = Number(production ? (process.env.PORT || 10000) : (process.env.API_PORT || 3001));
const host = production ? '0.0.0.0' : '127.0.0.1';
const secureCookie = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
let connection;
async function services() {
  if (!connection) connection = import('mongodb').then(async ({ MongoClient }) => {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
    try { await client.connect(); const db = client.db(databaseName); if (readOnlyPreview) return { client, catalog: createCatalog(db) }; const auth = createAuth(db); const business = createBusiness(db); await auth.init(); await business.init(); const catalog = createCatalog(db); const saved = createSavedOffers(db, auth, catalog); await saved.init(); const redemption = createRedemptions(db, auth, business); await redemption.init(); return { client, catalog, auth, business, saved, redemption }; }
    catch (error) {
      console.error(`MongoDB connection failed (${error?.name || 'Error'}). Check that MongoDB is running and MONGODB_URI / MONGODB_DATABASE are correct.`);
      await client.close(); throw error;
    }
  }).catch((error) => { connection = undefined; throw error; });
  return connection;
}
const authLimiter = createAuthLimiter();
function limitAuth(path, req, res) {
  const scope = authLimitScope(path);
  if (!scope) return false;
  const result = authLimiter.check(scope, req.socket.remoteAddress || 'local');
  if (result.allowed) return false;
  reply(res, 429, { error: `Too many attempts. Please try again in ${Math.ceil(result.retryAfter / 60)} minute(s).` }, { 'Retry-After': String(result.retryAfter) });
  return true;
}
function reply(res, status, body, headers = {}) { res.writeHead(status, headers); res.end(JSON.stringify(body)); }
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/health' && req.method === 'GET') { res.writeHead(200, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('ok'); }
  if (!path.startsWith('/api/')) {
    if (!production) { res.writeHead(404); return res.end(); }
    const result = await getStaticResponse(req.url, req.method);
    res.writeHead(result.status,result.headers); return res.end(result.body);
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
  if (path === '/api/config' && req.method === 'GET') return reply(res,200,{readOnlyPreview});
  if (readOnlyPreview) { const result = previewResponse(req.method, path); if (result) return reply(res,result.status,result.body); }
  const token = readSessionToken(req.headers.cookie);
  try {
    if (path === '/api/redemptions/code' || path === '/api/redemptions/redeem') {
      if (req.method !== 'POST') return reply(res,405,{error:'Method not allowed.'});
      if (!sameOrigin(req)) return reply(res,403,{error:'Request not allowed.'});
      const limit = authLimiter.check(path === '/api/redemptions/code' ? 'claim-code' : 'redeem-code', req.socket.remoteAddress || 'local');
      if (!limit.allowed) return reply(res,429,{error:'Too many attempts. Please try again later.'},{'Retry-After':String(limit.retryAfter)});
      let input; try { input=await readJson(req); } catch { return reply(res,400,{error:'Invalid request.'}); }
      const { redemption }=await services();
      const raw=(req.headers.cookie || '').split(';').map(x=>x.trim()).find(x=>x.startsWith('choop_business='))?.slice('choop_business='.length);
      const businessToken=raw && /^[A-Za-z0-9_-]{43}$/.test(raw)?raw:null;
      const result=path.endsWith('/code')?await redemption.issue(token,input.slug):await redemption.redeem(businessToken,input.code);
      return reply(res,result.status || 200,result);
    }
    if (path === '/api/saved' || /^\/api\/saved\/[^/]+$/.test(path)) {
      const { saved } = await services();
      if (path === '/api/saved' && req.method === 'GET') { const result=await saved.list(token); return reply(res,result.status || 200,result); }
      if (req.method !== 'POST') return reply(res,405,{error:'Method not allowed.'});
      if (!sameOrigin(req)) return reply(res,403,{error:'Request not allowed.'});
      let input; try { input=await readJson(req); } catch { return reply(res,400,{error:'Invalid request.'}); }
      const slug=path.slice('/api/saved/'.length); const result=await saved.set(token,slug,input.save);
      return reply(res,result.status || 200,result);
    }
    if (path.startsWith('/api/business/')) {
      const rawBusinessToken = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('choop_business='))?.slice('choop_business='.length);
      const businessToken = rawBusinessToken && /^[A-Za-z0-9_-]{43}$/.test(rawBusinessToken) ? rawBusinessToken : null;
      const { business } = await services();
      if (req.method === 'GET' && path === '/api/business/session') return reply(res, 200, { business: await business.session(businessToken) });
      if (req.method === 'GET' && path === '/api/business/offers') { const result=await business.list(businessToken); return reply(res,result.status || 200,result); }
      if (req.method !== 'POST') return reply(res, 405, { error:'Method not allowed.' });
      if (!sameOrigin(req)) return reply(res, 403, { error:'Request not allowed.' });
      if (limitAuth(path, req, res)) return;
      let input; try { input=await readJson(req); } catch { return reply(res,400,{error:'Invalid request.'}); }
      if (path === '/api/business/logout') { await business.logout(businessToken); return reply(res,200,{business:null},{'Set-Cookie':`choop_business=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie}`}); }
      if (path === '/api/business/register' || path === '/api/business/login') { const result=path.endsWith('register')?await business.register(input):await business.login(input); if(result.error) return reply(res,result.status,{error:result.error}); return reply(res,200,{business:result.business},{'Set-Cookie':`choop_business=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secureCookie}`}); }
      if (path === '/api/business/offers') { const result=await business.create(businessToken,input); return reply(res,result.status || 201,result); }
      const match = /^\/api\/business\/offers\/([^/]+)\/visibility$/.exec(path);
      if (match && validSlug(match[1])) { const result=await business.setPublished(businessToken,match[1],input.published); return reply(res,result.status || 200,result); }
      return reply(res,404,{error:'Not found.'});
    }
    if (path.startsWith('/api/auth/')) {
      if (path === '/api/auth/session' && req.method === 'GET') return reply(res, 200, { user: await (await services()).auth.session(token) });
      if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
      if (!sameOrigin(req)) return reply(res, 403, { error: 'Request not allowed.' });
      if (limitAuth(path, req, res)) return;
      if (!['/api/auth/register','/api/auth/login','/api/auth/logout','/api/auth/profile'].includes(path)) return reply(res, 404, { error: 'Not found.' });
      let data; try { data = await readJson(req); } catch { return reply(res, 400, { error: 'Invalid request.' }); }
      const { auth } = await services();
      if (path === '/api/auth/profile') { const result = await auth.updateProfile(token, data); return result.error ? reply(res, result.status, { error: result.error }) : reply(res, 200, { user: result.user }); }
      if (path === '/api/auth/logout') { await auth.logout(token); return reply(res, 200, { user: null }, { 'Set-Cookie': `choop_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie}` }); }
      const result = path === '/api/auth/register' ? await auth.register(data.email, data.password) : await auth.login(data.email, data.password);
      if (result.error) return reply(res, result.status, { error: result.error });
      return reply(res, 200, { user: { email: result.email } }, { 'Set-Cookie': `choop_session=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secureCookie}` });
    }
    if (req.method !== 'GET') return reply(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
    const result = await dispatchCatalog(req.url, (await services()).catalog); return reply(res, result.status, result.body);
  } catch { return reply(res, 503, { error: 'The service is temporarily unavailable.' }); }
});
server.on('error', error => { console.error(`CHOOP API could not start (${error.code || error.message}). Check API_PORT and local permissions.`); process.exitCode = 1; });
server.listen(port, host, () => console.log(`CHOOP server listening on ${host}:${port}`));
async function shutdown() { server.close(); if (connection) { try { await (await connection).client.close(); } catch {} } }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
