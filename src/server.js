require('dotenv').config();

const path = require('node:path');
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { validateAndExtractClaims, createDemoToken } = require('./jwt');

const app = express();
const port = Number(process.env.PORT || 3000);
const secret = process.env.JWT_SECRET;

if (!secret || secret === 'replace-this-with-a-long-random-secret') {
  throw new Error('JWT_SECRET must be set to a non-default secret in .env');
}

app.use(cors());
app.use(express.json({ limit: '10kb' }));

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'JWT Validation API',
      version: '1.0.0',
      description: 'Validate HS256 JWT signatures, expiration, username, and roles.'
    },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
      schemas: {
        ValidateTokenRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', description: 'A signed HS256 JWT' }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, 'server.js')]
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

/**
 * @openapi
 * /api/jwt/validate:
 *   post:
 *     summary: Validate a JWT and extract username and roles
 *     tags: [JWT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateTokenRequest'
 *           examples:
 *             valid:
 *               value: { token: "paste-a-valid-jwt-here" }
 *             altered:
 *               value: { token: "paste-a-token-with-an-altered-signature-here" }
 *             expired:
 *               value: { token: "paste-an-expired-jwt-here" }
 *     responses:
 *       200:
 *         description: Valid token and extracted claims
 *       400:
 *         description: Missing or malformed request
 *       401:
 *         description: Invalid signature or expired token
 */
app.post('/api/jwt/validate', (req, res) => {
  try {
    const claims = validateAndExtractClaims(req.body?.token, secret);
    return res.status(200).json({ valid: true, claims });
  } catch (_error) {
    return res.status(401).json({ valid: false, error: 'Invalid Token' });
  }
});

/**
 * @openapi
 * /api/jwt/demo-token/{state}:
 *   get:
 *     summary: Create a token for the Swagger and frontend demos
 *     tags: [JWT]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema: { type: string, enum: [valid, altered, expired] }
 *     responses:
 *       200: { description: Demo token }
 *       400: { description: Unknown state }
 */
app.get('/api/jwt/demo-token/:state', (req, res) => {
  const states = ['valid', 'altered', 'expired'];
  if (!states.includes(req.params.state)) {
    return res.status(400).json({ error: 'State must be valid, altered, or expired' });
  }
  return res.json({ state: req.params.state, token: createDemoToken(secret, req.params.state) });
});

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ valid: false, error: 'Request body must be valid JSON' });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(port, () => console.log(`JWT Validation API running at http://localhost:${port}`));
}

module.exports = app;