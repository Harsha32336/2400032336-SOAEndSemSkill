# JWT Validation and Claims Extraction

This project validates HS256 JWT signatures, rejects expired tokens, and extracts `username` (or `sub`) and `roles`. It includes an Express API, Swagger UI, and a small browser client. No database is required because JWT validation is stateless.

## Run in VS Code

1. Install Node.js 18 or newer.
2. Open this folder in VS Code.
3. In the integrated terminal run `npm install`.
4. Copy `.env.example` to `.env` and set `JWT_SECRET` to a long, private value.
5. Start the server with `npm start` (or `npm run dev` for watch mode).
6. Open `http://localhost:3000` for the frontend.
7. Open `http://localhost:3000/api-docs` for Swagger UI. Use the demo-token endpoint or the frontend buttons to test valid, altered, and expired tokens.

## API

`POST /api/jwt/validate` accepts `{ "token": "..." }`. A valid token returns HTTP 200 with `claims.username`, `claims.roles`, `claims.expiresAt`, and `claims.issuedAt`. Any missing, malformed, altered, or expired token returns HTTP 401 with `{ "valid": false, "error": "Invalid Token" }`.

Run the automated checks with `npm test`.