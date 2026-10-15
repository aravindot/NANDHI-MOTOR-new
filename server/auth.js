import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export const SESSION_TTL_MS = 20 * 60 * 1000;

const hashValue = (value) => createHash('sha256').update(String(value)).digest();

const constantTimeEqual = (left, right) => timingSafeEqual(hashValue(left), hashValue(right));

export const createAuthManager = ({
  username,
  password,
  ttlMs = SESSION_TTL_MS,
  now = Date.now,
  createToken = () => randomBytes(32).toString('base64url')
}) => {
  const sessions = new Map();
  const isConfigured = Boolean(username && password);

  const login = (submittedUsername, submittedPassword) => {
    if (!isConfigured) return null;

    const usernameMatches = constantTimeEqual(
      String(submittedUsername || '').trim().toLowerCase(),
      String(username).trim().toLowerCase()
    );
    const passwordMatches = constantTimeEqual(submittedPassword || '', password);
    if (!usernameMatches || !passwordMatches) return null;

    const token = createToken();
    const expiresAt = now() + ttlMs;
    sessions.set(hashValue(token).toString('hex'), expiresAt);
    return { token, expiresAt };
  };

  const authenticate = (token) => {
    if (!token) return false;
    const tokenHash = hashValue(token).toString('hex');
    const expiresAt = sessions.get(tokenHash);
    if (!expiresAt) return false;
    if (now() >= expiresAt) {
      sessions.delete(tokenHash);
      return false;
    }

    sessions.set(tokenHash, now() + ttlMs);
    return true;
  };

  const revoke = (token) => {
    if (token) sessions.delete(hashValue(token).toString('hex'));
  };

  const removeExpiredSessions = () => {
    const currentTime = now();
    for (const [tokenHash, expiresAt] of sessions) {
      if (currentTime >= expiresAt) sessions.delete(tokenHash);
    }
  };

  return { authenticate, isConfigured, login, removeExpiredSessions, revoke };
};

export const createLoginRateLimiter = ({
  maxAttempts = 10,
  windowMs = 15 * 60 * 1000,
  now = Date.now
} = {}) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const currentTime = now();
    const entry = attempts.get(key);
    const activeEntry = entry && currentTime - entry.startedAt < windowMs ? entry : null;

    if (activeEntry && activeEntry.count >= maxAttempts) {
      res.set('Retry-After', String(Math.ceil((activeEntry.startedAt + windowMs - currentTime) / 1000)));
      return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    }

    req.recordLoginFailure = () => {
      const failureTime = now();
      const currentEntry = attempts.get(key);
      if (!currentEntry || failureTime - currentEntry.startedAt >= windowMs) {
        attempts.set(key, { startedAt: failureTime, count: 1 });
      } else {
        currentEntry.count += 1;
      }
    };
    next();
  };
};

export const requireAuthentication = (authManager) => (req, res, next) => {
  const authorization = req.get('Authorization') || '';
  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]{40,})$/);

  if (!match || !authManager.authenticate(match[1])) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  req.authToken = match[1];
  return next();
};
