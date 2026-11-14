const scopes = new Map([
  ['/api/auth/login', 'consumer'], ['/api/auth/register', 'consumer'],
  ['/api/business/login', 'business'], ['/api/business/register', 'business'],
]);
export const authLimitScope = path => scopes.get(path) || null;
export function createAuthLimiter({ limit = 20, windowMs = 15 * 60 * 1000 } = {}) {
  const attempts = new Map();
  return { check(scope, ip, now = Date.now()) {
    for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
    const key = `${scope}:${ip}`;
    const entry = attempts.get(key) || { count: 0, until: now + windowMs };
    if (entry.count >= limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((entry.until - now) / 1000)) };
    entry.count++; attempts.set(key, entry); return { allowed: true, retryAfter: 0 };
  } };
}
