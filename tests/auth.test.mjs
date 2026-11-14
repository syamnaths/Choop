import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, validateCredentials, hashPassword, verifyPassword, makeToken, hashToken, readSessionToken, sameOrigin } from '../server/auth.mjs';
test('passwords are salted and checked without storing plaintext', async () => {
 const password='a long enough password'; const a=await hashPassword(password),b=await hashPassword(password);
 assert.notEqual(a,b); assert.equal(a.includes(password),false); assert.equal(await verifyPassword(password,a),true); assert.equal(await verifyPassword('wrong password',a),false); assert.equal(await verifyPassword(password,'invalid'),false);
});
test('credentials, tokens and origin are validated', () => {
 assert.equal(normalizeEmail(' User@Example.com '),'user@example.com'); assert.equal(validateCredentials('user@example.com','long password 123'),true); assert.equal(validateCredentials('invalid','short'),false);
 const token=makeToken(); assert.equal(readSessionToken(`choop_session=${token}`),token); assert.notEqual(hashToken(token),token); assert.equal(readSessionToken('choop_session=bad'),null);
 assert.equal(sameOrigin({headers:{origin:'http://localhost:5173',host:'localhost:5173'}}),true); assert.equal(sameOrigin({headers:{origin:'http://evil.test',host:'localhost:5173'}}),false);
});

test('registration, sign in, session expiry and sign out use database records', async () => {
  const { createAuth } = await import('../server/auth.mjs');
  const records = { users: [], sessions: [] };
  const db = { collection(name) { return {
    async createIndex() {},
    async insertOne(doc) { if (name === 'users' && records.users.some(user => user.email === doc.email)) { const error = new Error(); error.code = 11000; throw error; } const record = { ...doc, _id: records[name].length + 1 }; records[name].push(record); return { insertedId: record._id }; },
    async findOne(query) { return records[name].find(record => Object.entries(query).every(([key, value]) => key === 'expiresAt' ? record.expiresAt > value.$gt : record[key] === value)) || null; },
    async deleteOne(query) { records[name] = records[name].filter(record => record.tokenHash !== query.tokenHash); },
  }; } };
  const auth = createAuth(db); await auth.init();
  const joined = await auth.register(' Person@Example.com ', 'a long enough password');
  assert.equal(joined.email,'person@example.com'); assert.ok(joined.token);
  assert.equal((await auth.register('person@example.com','another long password')).status,409);
  assert.equal((await auth.login('person@example.com','incorrect password')).status,401);
  assert.equal((await auth.session(joined.token)).email,'person@example.com');
  records.sessions[0].expiresAt = new Date(0); assert.equal(await auth.session(joined.token),null);
  const login = await auth.login('person@example.com','a long enough password'); assert.ok(login.token);
  await auth.logout(login.token); assert.equal(await auth.session(login.token),null);
});
