const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { validateAndExtractClaims } = require('../src/jwt');

const secret = 'test-secret';

test('extracts username and roles from a valid token', () => {
  const token = jwt.sign({ username: 'alice', roles: ['ADMIN'] }, secret, { expiresIn: '5m' });
  assert.deepEqual(validateAndExtractClaims(token, secret).roles, ['ADMIN']);
  assert.equal(validateAndExtractClaims(token, secret).username, 'alice');
});

test('rejects a token whose signature was altered', () => {
  const token = jwt.sign({ username: 'alice' }, secret, { expiresIn: '5m' });
  assert.throws(() => validateAndExtractClaims(`${token.slice(0, -1)}x`, secret));
});

test('rejects an expired token', () => {
  const token = jwt.sign({ username: 'alice' }, secret, { expiresIn: -1 });
  assert.throws(() => validateAndExtractClaims(token, secret), { name: 'TokenExpiredError' });
});