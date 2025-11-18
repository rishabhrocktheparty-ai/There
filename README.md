# There Backend

Node.js/Express backend in TypeScript providing:

- Admin auth with role-based permissions (`super_admin`, `config_manager`, `viewer`)
- User auth with social providers (Google stub)
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

## High-Level Architecture

- `src/server.ts` – bootstraps Express, Socket.IO, middleware
- `src/app.ts` – Express app, routes and error handling
- `src/routes/*` – route definitions per domain
- `src/controllers/*` – HTTP controllers (lightweight here; many routes inline)
- `src/services/*` – core business logic (in-memory for now)
- `src/models/*` – TypeScript domain models
- `src/middleware/*` – auth, validation, security, error handling
- `src/utils/*` – helpers (logger, validators, socket handlers)