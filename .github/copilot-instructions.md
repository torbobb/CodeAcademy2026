# Copilot instructions

Norwegian-language workshop monorepo; each top-level folder is one session. Docs and comments are mostly Norwegian.

## Architecture

- `1-DevOps/idempotweet` (Next.js + Postgres) can publish `idem.created` to RabbitMQ queue `idem-events`; `2-EventDriven/*-consumer` (Java/.NET) consume it. Run only one consumer — they compete for the queue.
- `3-APIs/kaffebar-{java,dotnet}[-solution]` are two implementations of the same OpenAPI contract, both on :8080.
- `4-Frontend/kaffebar-web` proxies the API and streams RabbitMQ events to the browser as SSE. `src/types/kaffebar.ts` is generated from the API's `/openapi.json` (`yarn generate:types`).
- Root `docker-compose.yml` uses profiles; only RabbitMQ runs by default: `docker compose --profile java|dotnet up --build` (never both), plus `consumer`, `idempotweet`, `frontend`.
- Kaffebar events/auto-barista/auth are off by default; compose enables them via env (`KAFFEBAR_EVENTS_ENABLED` for Spring, `Kaffebar__Events__Enabled` for .NET).

## Starters vs. solutions

`*-solution` files/folders are reference answers; unsuffixed counterparts are intentionally incomplete starters (e.g. `kaffebar-web/src/lib/rabbitmq.ts`). Don't copy a solution into a starter unless asked.

## Commands

- Idempotweet / kaffebar-web (Yarn): `yarn lint`, `yarn test`, single file `yarn vitest run __tests__/path.test.ts`, by name `yarn vitest run -t "name"`. `just` wraps Idempotweet (`just dev`, `just test`, `just seed`).
- kaffebar-web without backend: `USE_MOCK_API=true yarn dev`.
- Kaffebar Java: `mvn clean verify`; single test `mvn test -Dtest=Class#method`.

## Conventions

- `kaffebar-web/AGENTS.md`: this Next.js version has breaking changes — read `node_modules/next/dist/docs/` before writing Next.js code.
- Work only in the Java parts. Ignore, don't edit, and don't mention the .NET parts (`*dotnet*` folders, `.cs`/`.csproj` files).
- Changes to the Java Kaffebar API contract require regenerating `kaffebar.ts`.
- Frontend SSE listeners each get their own exclusive queue (broadcast) and must close it on disconnect; consumers share one durable queue.
- `NEXT_PUBLIC_*` vars are baked in at build time (Docker build args).
