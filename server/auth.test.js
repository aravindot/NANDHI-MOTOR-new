import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthManager, createLoginRateLimiter, requireAuthentication } from './auth.js';

test('auth manager issues sessions only for the configured credentials', () => {
  let currentTime = 1000;
  let nextToken = 0;
  const auth = createAuthManager({
    username: 'admin',
    password: 'strong-password',
    now: () => currentTime,
    ttlMs: 1000,
    createToken: () => `test-token-${String(++nextToken).padStart(40, '0')}`
  });

  assert.equal(auth.login('admin', 'wrong-password'), null);
  const session = auth.login(' ADMIN ', 'strong-password');
  assert.ok(session);
  assert.equal(auth.authenticate(session.token), true);

  currentTime += 1001;
  assert.equal(auth.authenticate(session.token), false);
});

test('auth manager rejects unconfigured credentials and revokes logged-out sessions', () => {
  const unconfigured = createAuthManager({});
  assert.equal(unconfigured.isConfigured, false);
  assert.equal(unconfigured.login('admin', 'password'), null);

  const auth = createAuthManager({
    username: 'admin',
    password: 'strong-password',
    createToken: () => 'test-token'.padEnd(40, '0')
  });
  const session = auth.login('admin', 'strong-password');
  assert.ok(session);
  auth.revoke(session.token);
  assert.equal(auth.authenticate(session.token), false);
});

test('authentication middleware requires a valid bearer token', () => {
  let nextCalled = false;
  let statusCode;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    }
  };
  const middleware = requireAuthentication({
    authenticate: token => token === 'valid-token'.padEnd(40, '0')
  });

  middleware({ get: () => '' }, res, () => { nextCalled = true; });
  assert.equal(statusCode, 401);
  assert.equal(nextCalled, false);

  middleware(
    { get: () => `Bearer ${'valid-token'.padEnd(40, '0')}` },
    res,
    () => { nextCalled = true; }
  );
  assert.equal(nextCalled, true);
});

test('login rate limiter blocks requests after its attempt limit', () => {
  let currentTime = 1000;
  let statusCode;
  const res = {
    set() {},
    status(code) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    }
  };
  const limiter = createLoginRateLimiter({
    maxAttempts: 2,
    windowMs: 1000,
    now: () => currentTime
  });
  const req = { ip: '127.0.0.1' };
  let nextCount = 0;

  limiter(req, res, () => { nextCount += 1; req.recordLoginFailure(); });
  limiter(req, res, () => { nextCount += 1; req.recordLoginFailure(); });
  limiter(req, res, () => { nextCount += 1; });
  assert.equal(statusCode, 429);
  assert.equal(nextCount, 2);

  currentTime += 1001;
  limiter(req, res, () => { nextCount += 1; });
  assert.equal(nextCount, 3);
});
