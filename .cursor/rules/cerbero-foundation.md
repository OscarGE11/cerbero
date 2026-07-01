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
├── apps/              # api (Fase 2), dashboard (Fase 4)
├── packages/shared/   # Tipos y DTOs compartidos
└── supabase/          # Migraciones versionadas
```

## Reglas no negociables

1. **Bot y API comparten services** — el bot nunca accede a Supabase directamente.
2. **RLS es la seguridad real** — no confíes solo en filtros de aplicación por `user_id`.
3. **`packages/shared` sin dependencias de apps** — solo tipos, DTOs y constantes.
4. **Migraciones solo vía Supabase CLI** — no editar tablas a mano en producción.
5. **`SUPABASE_SERVICE_ROLE_KEY` nunca al frontend** — bypassa RLS.

## Estado actual

**Fase 1 completada.** Siguiente: **Fase 2 — API** (`apps/api`).

Completado:
- Monorepo con Bun workspaces (`cerbero/`)
- Biome + Lefthook + Commitlint
- `packages/shared` — `Movement`, `CreateMovementDto`, `Category`, `MovementType`
- Supabase remoto: tablas `categories` + `movements`, RLS activo, 8 categorías seed
- Proyecto Supabase enlazado: `pprtjlpmnbaypmfjmyyo`
- `.env` local configurado (URL, publishable key → `NEXT_PUBLIC_*`, secret key → `SUPABASE_SERVICE_ROLE_KEY`)
- Repo en GitHub (`main`)

Pendiente:
- `apps/api` — Fase 2 (Hono, endpoints, auth JWT)
- Bot Telegram — Fase 3
- `apps/dashboard` — Fase 4

## Convenciones de código

- DB: `snake_case` | TS dominio: `camelCase` | Mappers en `apps/api`
- Commits: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- Scopes: `shared`, `supabase`, `repo`, `api`, `bot`, `dashboard`
- Supabase seed remoto: `bunx supabase db push --include-seed` (no existe `db seed` en CLI 2.x)

## Esquema de BD

- `categories` — global, lectura para autenticados, `icon` opcional (seed sin iconos)
- `movements` — por usuario, RLS con `auth.uid() = user_id`

## Variables de entorno

| Supabase Dashboard | Variable `.env` |
|---|---|
| Project URL | `SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_URL` |
| Publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Secret key | `SUPABASE_SERVICE_ROLE_KEY` |

Ver `cerbero-plan.md` → Hoja de Ruta para checklist completo por fases.
