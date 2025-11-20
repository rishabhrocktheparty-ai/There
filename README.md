# There Backend

Node.js/Express backend in TypeScript providing:

- Admin auth with role-based permissions (`super_admin`, `config_manager`, `viewer`)
- User auth with password and social providers (Google, Apple, GitHub)
- Mock OAuth flow for development with test users
- Ethical configuration management (CRUD + versioning)
- Role templates (father, mother, sibling, mentor)
- Cultural parameters (region-specific settings)
- User relationships
- Conversation history & emotional pattern tracking
- Voice profile & avatar configuration
- Usage analytics & reporting
- Comprehensive audit logging
- File uploads for voice samples and avatars
- Realtime communication via Socket.IO
- Health check system with monitoring dashboard

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Server runs on `http://localhost:4000` by default.

## Scripts

- `npm run dev` – start dev server with auto-reload
- `npm run build` – build TypeScript to `dist`
- `npm start` – run built server
- `npm test` – run Jest test suite
- `npm run health:check` – test health check endpoints
- `npm run db:test` – test database connection
- `npm run db:seed` – seed database with test data

## High-Level Architecture

- `src/server.ts` – bootstraps Express, Socket.IO, middleware
- `src/app.ts` – Express app, routes and error handling
- `src/routes/*` – route definitions per domain
- `src/controllers/*` – HTTP controllers (lightweight here; many routes inline)
- `src/services/*` – core business logic (in-memory for now)
- `src/models/*` – TypeScript domain models
- `src/middleware/*` – auth, validation, security, error handling
- `src/utils/*` – helpers (logger, validators, socket handlers)