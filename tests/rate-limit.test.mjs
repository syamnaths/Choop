import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthLimiter, authLimitScope } from '../server/rate-limit.mjs';
test('only login and registration consume separate consumer and business budgets', () => {
  assert.equal(authLimitScope('/api/auth/profile'),null);
  assert.equal(authLimitScope('/api/business/offers'),null);
  assert.equal(authLimitScope('/api/auth/logout'),null);
  assert.equal(authLimitScope('/api/auth/login'),'consumer');
  assert.equal(authLimitScope('/api/business/register'),'business');
  const limiter=createAuthLimiter({limit:2,windowMs:1000});
  assert.equal(limiter.check('consumer','local',0).allowed,true);
  assert.equal(limiter.check('consumer','local',100).allowed,true);
  assert.deepEqual(limiter.check('consumer','local',200),{allowed:false,retryAfter:1});
  assert.equal(limiter.check('business','local',200).allowed,true);
  assert.equal(limiter.check('consumer','other',200).allowed,true);
  assert.equal(limiter.check('consumer','local',1001).allowed,true);
});
