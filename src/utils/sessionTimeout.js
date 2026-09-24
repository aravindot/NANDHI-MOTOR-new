export const SESSION_TIMEOUT_MS = 20 * 60 * 1000;

export const createSessionRecord = (now = Date.now()) => ({
  createdAt: now,
  expiresAt: now + SESSION_TIMEOUT_MS
});

export const refreshSessionExpiry = (now = Date.now()) => now + SESSION_TIMEOUT_MS;

export const isSessionExpired = (expiresAt, now = Date.now()) => {
  if (!expiresAt) return true;
  return Number(now) >= Number(expiresAt);
};
