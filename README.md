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
Setup your database schemas using Prisma:
```bash
pnpm -C packages/data run prisma:generate
pnpm -C packages/data run db:push
```

## Running the Application

To run the application locally, use:
```bash
# Run API and Web apps
pnpm dev
```
By default, the API starts on port 5000 and the Web on port 5173.

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
