import test from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_TIMEOUT_MS, createSessionRecord, isSessionExpired, refreshSessionExpiry } from './sessionTimeout.js';

test('session timeout is 20 minutes', () => {
  assert.equal(SESSION_TIMEOUT_MS, 20 * 60 * 1000);
});

test('new session record expires 20 minutes from the current time', () => {
  const now = 1_700_000_000_000;
  const record = createSessionRecord(now);

  assert.equal(record.expiresAt, now + SESSION_TIMEOUT_MS);
});

test('expired session is detected when current time reaches or passes the expiry', () => {
  const now = 1_700_000_000_000;
  const expiredAt = now + 1;

  assert.equal(isSessionExpired(expiredAt, now + 1), true);
  assert.equal(isSessionExpired(expiredAt, now), false);
  assert.equal(isSessionExpired(null, now), true);
});

test('refreshSessionExpiry extends the session by 20 minutes', () => {
  const now = 1_700_000_000_000;
  assert.equal(refreshSessionExpiry(now), now + SESSION_TIMEOUT_MS);
});
