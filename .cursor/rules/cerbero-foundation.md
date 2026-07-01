# Cerbero — Contexto de arquitectura

## Stack

- Monorepo: Bun Workspaces
- Backend + Bot: Bun + Hono + Telegraf (Fase 2/3)
- Frontend: Next.js 14 + React Query (Fase 4)
- DB: Supabase (Postgres) + Supabase Auth
- Tooling: Biome, Lefthook, Commitlint

## Estructura de workspaces

```
cerbero/
├── apps/              # api, dashboard (fases posteriores)
├── packages/shared/   # Tipos y DTOs compartidos
└── supabase/          # Migraciones versionadas
```

## Reglas no negociables

1. **Bot y API comparten services** — el bot nunca accede a Supabase directamente.
2. **RLS es la seguridad real** — no confíes solo en filtros de aplicación por `user_id`.
3. **`packages/shared` sin dependencias de apps** — solo tipos, DTOs y constantes.
4. **Migraciones solo vía Supabase CLI** — no editar tablas a mano en producción.
5. **`SUPABASE_SERVICE_ROLE_KEY` nunca al frontend** — bypassa RLS.

## Estado actual (Fase 1)

Completado:
- Monorepo con Bun workspaces
- Biome + Lefthook + Commitlint
- `packages/shared` con tipos base
- Migraciones Supabase (`categories`, `movements`, RLS)
- Seed de categorías

Pendiente:
- `apps/api` — Fase 2/3
- `apps/dashboard` — Fase 4

## Convenciones de código

- DB: `snake_case` | TS dominio: `camelCase` | Mappers en `apps/api`
- Commits: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- Scopes: `shared`, `supabase`, `repo`, `api`, `bot`, `dashboard`

## Esquema de BD

- `categories` — global, lectura para autenticados
- `movements` — por usuario, RLS con `auth.uid() = user_id`
