const jwt = require('jsonwebtoken');

/**
 * Verifies the token signature and expiration before returning application claims.
 * jsonwebtoken's default clock check rejects expired tokens through TokenExpiredError.
 */
function validateAndExtractClaims(token, secret) {
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('Token is required');
  }

  const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
  const roles = Array.isArray(payload.roles)
    ? payload.roles.filter((role) => typeof role === 'string')
    : typeof payload.role === 'string'
      ? [payload.role]
      : [];

  return {
    username: typeof payload.username === 'string'
      ? payload.username
      : typeof payload.sub === 'string'
        ? payload.sub
        : null,
    roles,
    expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
    issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : null
  };
}

function createDemoToken(secret, state) {
  const payload = { username: 'demo.user', roles: ['USER', 'REPORTER'] };
  if (state === 'expired') {
    return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: -60 });
  }

  const token = jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '15m' });
  if (state === 'altered') {
    return `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;
  }
  return token;
}

module.exports = { validateAndExtractClaims, createDemoToken };