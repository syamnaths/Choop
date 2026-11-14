import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { validateProfile, publicProfile } from './profile.mjs';
const scrypt = promisify(scryptCallback);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const normalizeEmail = email => typeof email === 'string' ? email.trim().toLowerCase() : '';
export function validateCredentials(email, password) {
  return email.length <= 254 && emailPattern.test(email) && typeof password === 'string' && password.length >= 12 && password.length <= 128;
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 128 || typeof stored !== 'string' || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) return false;
  const [salt, hex] = stored.split(':'); const expected = Buffer.from(hex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
}
export const hashToken = token => createHash('sha256').update(token).digest('hex');
export function makeToken() { return randomBytes(32).toString('base64url'); }
export function readSessionToken(cookie = '') {
  const value = cookie.split(';').map(x => x.trim()).find(x => x.startsWith('choop_session='))?.slice('choop_session='.length);
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}
export function sameOrigin(req) {
  try { return Boolean(req.headers.origin) && new URL(req.headers.origin).host === req.headers.host && ['http:', 'https:'].includes(new URL(req.headers.origin).protocol); } catch { return false; }
}
export async function readJson(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new Error('invalid');
  let body = ''; for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 4096) throw new Error('invalid'); }
  const data = JSON.parse(body); if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid'); return data;
}
export function createAuth(db) {
  const users = db.collection('users'), sessions = db.collection('sessions');
  const expiryMs = 7 * 24 * 60 * 60 * 1000;
  async function issue(userId) {
    const token = makeToken(); await sessions.insertOne({ tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + expiryMs) }); return token;
  }
  return {
    async init() { await users.createIndex({email:1},{unique:true}); await sessions.createIndex({tokenHash:1},{unique:true}); await sessions.createIndex({expiresAt:1},{expireAfterSeconds:0}); },
    async register(email, password) {
      const normalized = normalizeEmail(email); if (!validateCredentials(normalized, password)) return { error: 'Enter a valid email and a password of 12–128 characters.', status: 400 };
      const passwordHash = await hashPassword(password);
      try { const result = await users.insertOne({ email: normalized, passwordHash, createdAt: new Date() }); return { email: normalized, token: await issue(result.insertedId) }; }
      catch (error) { if (error.code === 11000) return { error: 'An account with that email already exists. Try signing in.', status: 409 }; throw error; }
    },
    async login(email, password) {
      const normalized = normalizeEmail(email); const user = normalized.length <= 254 ? await users.findOne({email:normalized}) : null;
      if (!user || !(await verifyPassword(password, user.passwordHash))) return { error: 'Email or password is incorrect.', status: 401 };
      return { email: user.email, token: await issue(user._id) };
    },
    async userId(token) {
      if (!token) return null;
      const session = await sessions.findOne({tokenHash:hashToken(token),expiresAt:{$gt:new Date()}});
      return session?.userId || null;
    },
    async session(token) {
      if (!token) return null; const session = await sessions.findOne({tokenHash:hashToken(token),expiresAt:{$gt:new Date()}});
      if (!session) return null; const user = await users.findOne({_id:session.userId},{projection:{email:1,displayName:1,city:1,avatar:1,interests:1}}); return user ? publicProfile(user) : null;
    },
    async updateProfile(token, input) {
      if (!token) return { status: 401, error: 'Please sign in to update your profile.' };
      const session = await sessions.findOne({tokenHash:hashToken(token), expiresAt:{$gt:new Date()}});
      if (!session) return { status: 401, error: 'Your session has expired. Please sign in again.' };
      const profile = validateProfile(input);
      if (!profile) return { status: 400, error: 'Enter a name, choose a city and select an avatar.' };
      const result = await users.updateOne({_id:session.userId}, {$set: profile});
      if (!result.matchedCount) return { status: 401, error: 'Your account could not be found. Please sign in again.' };
      const user = await users.findOne({_id:session.userId},{projection:{email:1,displayName:1,city:1,avatar:1,interests:1}});
      return { user: publicProfile(user) };
    },
    async logout(token) { if (token) await sessions.deleteOne({tokenHash:hashToken(token)}); },
  };
}
