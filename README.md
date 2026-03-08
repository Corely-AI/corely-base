# CorelyBase

CorelyBase is a minimal foundation template extracted from Corely Workspace, designed for rapid application prototyping and development with NextJS and NestJS. 

## Included Modules
- **API**: A NestJS backend for business logic. Includes only the essential platform modules (Auth, Identity, Tenants, Workspaces, Settings).
- **Web**: A standard frontend layout using React, React Router, and a feature-rich Sidebar, including user and tenant settings pages.
- **Packages**: Essential packages for domains, events, contracts, database access (Prisma), config, and UI components.

## Prerequisites
- Node.js (v20+)
- Postgres Database
- pnpm

## Setup
To install dependencies for the monorepo, run:
```bash
pnpm install
```

### Environment Variables
Setup your `.env` variables using the `.env.example` templates in `services/api` and `apps/web`.

### Database
Corely now supports either plain Postgres or Supabase-hosted Postgres as the database target.
All tables live in the `public` schema.

- `DATABASE_URL`: runtime database connection used by the API
- `DIRECT_DATABASE_URL`: optional direct/admin connection used by Prisma CLI for migrate, introspection, and baselining

Local Postgres example:
```bash
DATABASE_URL=postgresql://corely:corely@localhost:5434/corely?schema=public
DIRECT_DATABASE_URL=
```

Supabase example:
```bash
# Runtime: prefer direct or session-pooled URLs for the API
DATABASE_URL=postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require

# Admin / Prisma CLI: use a direct connection when available
DIRECT_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

Setup your database using Prisma:
```bash
pnpm -C packages/data run prisma:generate
pnpm prisma:migrate
```

For an existing Supabase project that already has the schema, baseline it before running future migrations:
```bash
mkdir -p packages/data/prisma/migrations/0_init_supabase
pnpm --filter @corely/data exec prisma migrate diff --from-empty --to-schema prisma/schema/schema.prisma --script > packages/data/prisma/migrations/0_init_supabase/migration.sql
pnpm --filter @corely/data exec prisma migrate resolve --applied 0_init_supabase
```

## Running the Application

To run the application locally, use:
```bash
# Run API and Web apps
pnpm dev
```
By default, the API starts on port 5000 and the Web on port 5173.

## Deploying the API to Vercel

The NestJS API can be deployed as a Vercel project with the project root set to `services/api`.

- Root Directory: `services/api`
- Framework Preset: `NestJS`
- Runtime database env: `DATABASE_URL`
- Optional admin env for external Prisma workflows: `DIRECT_DATABASE_URL`

For this monorepo, make sure the Vercel project can access workspace packages outside `services/api`.
If your Vercel project was created with an older root-directory configuration, enable source access outside the root directory in project settings.

Run Prisma migrations outside the Vercel runtime:
```bash
pnpm --filter @corely/data exec prisma migrate deploy
```

## Deploying the Frontend to Vercel

The Vite frontend can be deployed as a separate Vercel project with the project root set to `apps/web`.

- Root Directory: `apps/web`
- Framework Preset: `Vite`
- Output Directory: `dist`
- Frontend envs: any `VITE_*` variables required by the app

Deep-link refreshes are handled with a Vercel SPA rewrite in [apps/web/vercel.json](/Users/hadoan/Documents/GitHub/corely-base/apps/web/vercel.json), so routes such as `/dashboard` and `/auth/login` resolve back to `index.html` instead of returning a 404.

For this monorepo, make sure the web project can access workspace packages outside `apps/web`.
If your Vercel project was created with an older root-directory configuration, enable source access outside the root directory in project settings.

## Worker Support Removed
In this lite version, the background worker has been disabled and its related infrastructure packages have been removed to prioritize simplicity and lightweight deployment. An empty `NoopOutbox` adapter is wired into the system for Outbox messages. If background job processing is needed, you can re-implement the worker.

## Copilot Chat
The Copilot Chat feature has been ported from the Kerniflow ERP and relies minimally on Corely Base.

### Setup
Ensure the following environment variables are set in `.env`:
- `OPENAI_API_KEY`: Required for default OpenAI operations. (or `ANTHROPIC_API_KEY`)
- `AI_MODEL_PROVIDER`: Set to `openai` (default) or `anthropic`.
- `AI_MODEL_ID`: Set to the specific AI model name.

If API keys are missing, the feature degrades safely (prompts 400 error cleanly without logging keys to the console).

### Running Locally
Run `pnpm dev` for frontend + api servers. The Copilot Chat panel is accessible at `/copilot`.

### Vercel Deployment Notes
This feature operates exclusively via Server-Sent Events (SSE) and HTTP Streaming, requiring NO active WebSocket connections.
- It leverages fetching with `text/event-stream`.
- Vercel functions support HTTP streaming responses.
- Payload size must remain within Function invocation limits on Vercel.
