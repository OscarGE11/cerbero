# Cerbero — Contexto compacto para agentes

> **Pásale este archivo en nuevas sesiones:** `@docs/cerbero-context.md`  
> Plan completo y roadmap: `@cerbero-plan.md`

---

## Qué es

Tracker de gastos/ingresos personal. Bot Telegram + dashboard web (pendiente). Monorepo en `/home/oscar/Documents/Desarrollo/cerbero/`.

---

## Estado (Jul 2026)

| Fase | Estado |
|---|---|
| 1 — Monorepo, shared, Supabase, tooling | ✅ |
| 2 — API REST (Hono) | ✅ |
| 3 — Bot Telegram + vinculación | ✅ |
| 4 — Dashboard Next.js | 🚧 En curso (home + auth; deploy preparado) |

**Supabase remoto:** `pprtjlpmnbaypmfjmyyo` · Repo en GitHub · `.env` local (no commitear).

---

## Stack

Bun workspaces · Hono · Telegraf · Supabase (Postgres + Auth) · Biome · Lefthook · Commitlint · `@cerbero/shared`

---

## Estructura

```
cerbero/
├── apps/api/          # API + bot (mismo proceso)
├── packages/shared/   # Tipos: Movement, Category, DTOs
├── supabase/          # Migraciones versionadas
├── scripts/           # Dev helpers (auth:token, auth:link-code)
└── docs/              # Specs
```

---

## Reglas de arquitectura (no negociables)

1. **Capas API:** routes → controllers → services → repositories
2. **Bot usa services**, nunca Supabase directo
3. **RLS** es la seguridad real; API usa JWT usuario (anon key + token), bot usa service role con `userId` verificado
4. **`packages/shared`** solo tipos/DTOs, sin deps de apps
5. **Migraciones** solo vía Supabase CLI (`bunx supabase db push`)
6. **`SUPABASE_SERVICE_ROLE_KEY`** nunca al frontend
7. DB `snake_case` · TS `camelCase` · mappers en `apps/api/src/lib/mappers.ts`

---

## Base de datos

| Tabla | Uso |
|---|---|
| `categories` | 8 categorías seed, lectura autenticados |
| `movements` | Gastos/ingresos por `user_id`, RLS |
| `telegram_accounts` | Enlace telegram_id ↔ auth.users |
| `link_codes` | Códigos OTP dev/dashboard (JWT → código) |
| `telegram_link_sessions` | Flujo `/login`: token URL + OTP |

Migraciones: `20260101000000_init_schema.sql`, `20260201000000_telegram_accounts.sql`, `20260202000000_telegram_link_sessions.sql`

---

## Variables `.env`

| Variable | Uso |
|---|---|
| `SUPABASE_URL` | API + scripts |
| `SUPABASE_SERVICE_ROLE_KEY` | Bot + admin backend |
| `SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT verify + web link page |
| `TELEGRAM_BOT_TOKEN` | Bot |
| `PORT` | Default 3001 |
| `DASHBOARD_URL` | URL del dashboard — enlace `/login` del bot (default `http://localhost:3000`) |
| `PUBLIC_APP_URL` | Legacy: página `/link` en API (ya no usada por el bot) |
| `DEV_USER_EMAIL/PASSWORD` | Solo scripts dev `auth:*` |

---

## Comandos monorepo

```bash
bun run dev:api        # API + bot (polling), carga .env auto
bun run dev:dashboard  # Next.js en :3000, carga .env auto
bun run check          # Biome
bun run typecheck
bun run dev            # API + dashboard (scripts/dev.sh)
bun run env:check      # Validar .env de desarrollo
bun run env:print      # Catálogo de variables (añadir -- --env production)
bun run auth:link-code # Dev only — genera OTP sin Telegram
bunx supabase db push  # Aplicar migraciones
```

**Deploy:** ver `docs/deployment.md` · Railway (API+bot) · Vercel (dashboard)

**Importante:** Solo una instancia de `dev:api` — Telegram polling no admite duplicados. Si `/start` no responde → `lsof -i :3001` → kill.

---

## API REST

Base: `http://localhost:3001` · Auth: `Authorization: Bearer <supabase_jwt>`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | No | Health check |
| GET | `/categories` | JWT | Lista categorías |
| GET | `/movements` | JWT | Filtros: type, categoryId, from, to, limit |
| POST | `/movements` | JWT | Crear movimiento |
| POST | `/link-codes` | JWT | OTP dev/dashboard (legacy) |
| GET | `/link?token=` | No | Página web registro/login → OTP |
| POST | `/link/sessions/complete` | JWT | Completa sesión `/login`, devuelve OTP |

---

## Bot Telegram

Arranca con `bun run dev:api`. Comandos BotFather: `docs/botfather-commands.txt`

| Comando | Sin vincular | Vinculado |
|---|---|---|
| `/start` | Bienvenida + instrucciones | Bienvenida |
| `/login` | Enlace web → registro → OTP | "Ya vinculado" |
| `/link CODIGO` | Vincula con OTP | — |
| `/link` | Ayuda | — |
| `/add` | Bloqueado | Wizard gasto/ingreso |
| `/last` | Bloqueado | Últimos 5 |
| `/month` | Bloqueado | Resumen mes |
| `/cancel` | Cancela wizard | Cancela wizard |

### Flujo vinculación prod-like

1. `/login` → enlace `DASHBOARD_URL/link?token=uuid`
2. Web: signup/login Supabase → muestra OTP 6 dígitos
3. `/link 482913` → inserta `telegram_accounts`
4. `/add` etc.

Código bot: `apps/api/src/bot/` · Wizard: `scenes/addMovement.ts`

---

## Cómo probar (checklist)

1. `bunx supabase db push`
2. `bun run dev:api` → ver API + bot started
3. Telegram: `/start` → `/login` → abrir link → registrarse → `/link OTP`
4. `/add` → completar wizard

Supabase dev: desactivar confirmación email si signup no devuelve session.

---

## Fase 4 — En curso

- `apps/dashboard` Next.js 14 + shadcn + React Query ✅ (setup)
- Auth Supabase en web ✅
- Pantalla `/link` (reemplaza página HTML de la API) ✅
- Pendiente: movimientos, informes, categorías

---

## Docs relacionados

| Archivo | Contenido |
|---|---|
| `cerbero-plan.md` | Plan completo, roadmap, SQL, SOLID |
| `docs/telegram-account-linking.md` | Spec vinculación detallada |
| `docs/botfather-commands.txt` | Copy-paste BotFather |
| `.cursor/rules/cerbero-foundation.md` | Puntero auto-cargado por Cursor |

---

## Commits

Conventional: `feat|fix|chore|docs|refactor|test(scope): msg`  
Scopes: `shared`, `supabase`, `repo`, `api`, `bot`, `dashboard`

---

## Puntos ciegos

- No editar tablas a mano en prod
- Lefthook: no incluir `.md` en glob Biome (falla si no procesa)
- Supabase seed remoto: `db push --include-seed` (no existe `db seed` CLI 2.x)
- Publishable key = `NEXT_PUBLIC_SUPABASE_ANON_KEY` · Secret key = `SERVICE_ROLE_KEY`
