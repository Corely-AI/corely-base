# E2E (Playwright)

- Run the Todo UI suite: `pnpm --filter @corely/e2e e2e tests/todos.spec.ts`
- Run the full UI suite: `pnpm --filter @corely/e2e e2e`
- Open Playwright UI mode: `pnpm --filter @corely/e2e e2e:ui`

Defaults:

- Web app: `BASE_URL=http://127.0.0.1:8080`
- API: `API_URL=http://127.0.0.1:3000`

The Playwright config starts `@corely/api` and `@corely/web` automatically and assumes Postgres is already available through the repo's configured `DATABASE_URL`.
