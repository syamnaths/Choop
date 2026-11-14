import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProfile, profileComplete } from '../server/profile.mjs';
test('profile fields are bounded and completeness depends on name and supported city', () => {
  assert.deepEqual(validateProfile({displayName:'  Asha  ',city:'Mumbai',avatar:'lavender'}),{displayName:'Asha',city:'Mumbai',avatar:'lavender',interests:[]});
  assert.equal(profileComplete({displayName:'Asha',city:'Mumbai'}),true);
  assert.equal(profileComplete({displayName:'',city:'Mumbai'}),false);
  assert.equal(validateProfile({displayName:'A',city:'Unknown',avatar:'pink'}),null);
  assert.equal(validateProfile({displayName:'A',city:'Mumbai',avatar:'url'}),null);
  assert.equal(validateProfile({displayName:'A'.repeat(81),city:'Mumbai',avatar:'pink'}),null);
});

test('profile updates require a valid session and only affect its owner', async () => {
  const {createAuth, hashToken} = await import('../server/auth.mjs');
  const users = [{_id: 1, email: 'one@example.com'}, {_id: 2, email: 'two@example.com'}];
  const sessions = [{tokenHash: hashToken('valid-token'), userId: 1, expiresAt: new Date(Date.now() + 60000)}];
  const db = {collection(name) { return name === 'users' ? {
    async findOne(query) { return users.find(user => user._id === query._id) || null; },
    async updateOne(query, update) { const user = users.find(item => item._id === query._id); if (!user) return {matchedCount: 0}; Object.assign(user, update.$set); return {matchedCount: 1}; },
  } : { async findOne(query) { return sessions.find(item => item.tokenHash === query.tokenHash && item.expiresAt > query.expiresAt.$gt) || null; } }; }};
  const auth = createAuth(db);
  assert.equal((await auth.updateProfile(null,{displayName:'A',city:'Mumbai',avatar:'pink'})).status,401);
  assert.equal((await auth.updateProfile('invalid',{displayName:'A',city:'Mumbai',avatar:'pink'})).status,401);
  assert.equal((await auth.updateProfile('valid-token',{displayName:'A',city:'Bad',avatar:'pink'})).status,400);
  const result = await auth.updateProfile('valid-token',{displayName:'Asha',city:'Mumbai',avatar:'teal', interests:['Coffee','Movies'], email:'changed@example.com', _id:2});
  assert.equal(result.user.profileComplete,true); assert.equal(result.user.email,'one@example.com');
  assert.equal(users[0].displayName,'Asha'); assert.deepEqual(result.user.interests,['Coffee','Movies']); assert.equal(users[1].displayName,undefined);
});

test('interest tags must be known, unique and limited; old profiles may omit them', async () => {
  const base={displayName:'Asha',city:'Mumbai',avatar:'pink'};
  assert.deepEqual(validateProfile({...base, interests:['Coffee','Movies']})?.interests,['Coffee','Movies']);
  assert.deepEqual(validateProfile(base)?.interests,[]);
  assert.equal(validateProfile({...base,interests:['Coffee','Coffee']}),null);
  assert.equal(validateProfile({...base,interests:['not a real interest']}),null);
  assert.equal(validateProfile({...base,interests:'Coffee'}),null);
});
