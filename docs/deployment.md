# Cerbero — Guía de despliegue

> **Objetivo:** API + bot en **Railway**, dashboard en **Vercel**, base de datos y auth en **Supabase** (ya en la nube).
>
> **Antes de desplegar:** `bun run env:check` (desarrollo) · `bun run env:print -- --env production` (catálogo prod)

---

## Arquitectura en producción

```
Usuario (Telegram) ──webhook──► Railway (API + Bot, Bun/Hono)
Usuario (navegador) ──────────► Vercel (Next.js dashboard)
         │                              │
         └──────────┬───────────────────┘
                    ▼
              Supabase (Postgres + Auth)
```

| Servicio | Qué aloja | URL ejemplo |
|---|---|---|
| **Supabase** | DB, auth, RLS | `https://xxxx.supabase.co` |
| **Railway** | `apps/api` (REST + webhook Telegram) | `https://cerbero-api.up.railway.app` |
| **Vercel** | `apps/dashboard` (Next.js) | `https://cerbero.vercel.app` |

---

## Variables de entorno

### Comprobar qué necesitas

```bash
# Desarrollo — valida tu .env local
bun run env:check

# Ver catálogo de producción (sin validar)
bun run env:print -- --env production

# En Railway/Vercel CI — valida process.env del host
bun run env:check -- --env production --process --target api
```

### Desarrollo (`.env` en la raíz)

Copia `.env.example` → `.env`. El dashboard lee el mismo archivo vía `next.config.mjs`.

| Variable | Dónde | Valor local |
|---|---|---|
| `SUPABASE_URL` | API + dashboard | Tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | API + dashboard | Clave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo API | Service role |
| `TELEGRAM_BOT_TOKEN` | Solo API | @BotFather |
| `PORT` | API | `3001` |
| `DASHBOARD_URL` | API (enlaces del bot) | `http://localhost:3000` |
| `PUBLIC_API_URL` | API | `http://localhost:3001` |
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard | = `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard | = `SUPABASE_ANON_KEY` |
| `NEXT_PUBLIC_API_URL` | Dashboard | `http://localhost:3001` |

En desarrollo el bot usa **polling** (no hace falta webhook).

### Producción

Plantilla: `.env.production.example`

**Railway (API):**

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | (igual que dev) |
| `SUPABASE_ANON_KEY` | (igual que dev) |
| `SUPABASE_SERVICE_ROLE_KEY` | (igual que dev) |
| `TELEGRAM_BOT_TOKEN` | (igual que dev) |
| `DASHBOARD_URL` | URL de Vercel, ej. `https://cerbero.vercel.app` |
| `PUBLIC_API_URL` | URL pública de Railway, ej. `https://cerbero-api.up.railway.app` |
| `TELEGRAM_WEBHOOK_SECRET` | String aleatorio largo (`openssl rand -hex 32`) |
| `CORS_ORIGIN` | Misma URL que `DASHBOARD_URL` |
| `PORT` | Railway lo inyecta solo |

**Vercel (dashboard):**

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon |
| `NEXT_PUBLIC_API_URL` | URL pública de Railway |

> **Nunca** subas `SUPABASE_SERVICE_ROLE_KEY` ni `TELEGRAM_BOT_TOKEN` a Vercel.

---

## Cambios de código ya preparados

| Cambio | Archivo | Comportamiento |
|---|---|---|
| Webhook Telegram en prod | `apps/api/src/bot/index.ts` | `NODE_ENV=production` → webhook en `/telegram/webhook` |
| Polling en dev | mismo | `NODE_ENV=development` → polling como antes |
| CORS restringido | `apps/api/src/index.ts` | Prod: solo `CORS_ORIGIN` |
| Validación env | `apps/api/src/config/env.ts` | Exige webhook secret en producción |
| Script comprobación | `scripts/check-env.ts` | Valida dev/prod |

---

## Paso 1 — Supabase (auth redirects)

En [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **Authentication** → **URL Configuration**:

| Campo | Valor |
|---|---|
| **Site URL** | `https://tu-dashboard.vercel.app` |
| **Redirect URLs** | `https://tu-dashboard.vercel.app/**` |
| | `http://localhost:3000/**` (mantener para dev) |

Sin esto, el login en producción fallará tras el redirect de Supabase.

---

## Paso 2 — Railway (API + bot)

### 2.1 Crear proyecto

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub → repo `cerbero`.
2. **Root Directory:** `/` (monorepo).
3. **Build Command:** `bun install`
4. **Start Command:** `bun --filter @cerbero/api start`

### 2.2 Variables

Añade todas las de la sección Railway arriba. Genera el webhook secret:

```bash
openssl rand -hex 32
```

### 2.3 Dominio público

Settings → Networking → **Generate Domain** → copia la URL (será tu `PUBLIC_API_URL`).

### 2.4 Comprobar

```bash
curl https://TU-API.up.railway.app/health
# → {"status":"ok","env":"production"}
```

Revisa logs: debe aparecer `Telegram bot started (webhook → ...)`.

### 2.5 Notas Railway

- Un solo servicio/replica: Telegram webhook no admite dos instancias recibiendo updates.
- Si el deploy falla al arrancar, ejecuta localmente con las mismas vars:
  `NODE_ENV=production bun run env:check -- --env production --process --target api`

---

## Paso 3 — Vercel (dashboard)

### 3.1 Importar proyecto

1. [vercel.com](https://vercel.com) → Add New → Project → repo `cerbero`.
2. **Framework:** Next.js.
3. **Root Directory:** `apps/dashboard`

### 3.2 Build settings

| Campo | Valor |
|---|---|
| Build Command | `cd ../.. && bun install && bun run --filter @cerbero/dashboard build` |
| Output Directory | `.next` (default) |
| Install Command | `bun install` |

> Ajusta según el UI de Vercel si el monorepo requiere otro path. Alternativa: configurar `vercel.json` en `apps/dashboard`.

### 3.3 Variables de entorno

Las tres `NEXT_PUBLIC_*` de la tabla de producción.

### 3.4 Deploy y dominio

Tras el primer deploy, copia la URL → actualiza en Railway:
- `DASHBOARD_URL`
- `CORS_ORIGIN`

Redeploy Railway para que el bot enlace al dashboard correcto.

---

## Paso 4 — Verificación end-to-end

| # | Prueba | Esperado |
|---|---|---|
| 1 | `GET /health` en Railway | `status: ok` |
| 2 | Abrir dashboard en Vercel | Página de login |
| 3 | Registro/login | Redirect a `/dashboard` |
| 4 | Dashboard carga datos | Balance + transacciones |
| 5 | `/start` en Telegram | Bot responde |
| 6 | `/login` en Telegram | Enlace apunta a Vercel, no localhost |
| 7 | `/add` tras vincular | Movimiento aparece en dashboard |

---

## Flujo de desarrollo vs producción

```
┌─────────────────┬──────────────────────┬─────────────────────────┐
│                 │ development          │ production              │
├─────────────────┼──────────────────────┼─────────────────────────┤
│ Config          │ .env en raíz         │ Railway + Vercel UI     │
│ Comprobar       │ bun run env:check    │ env:check --process     │
│ Bot Telegram    │ polling              │ webhook HTTPS           │
│ API URL         │ localhost:3001       │ Railway domain          │
│ Dashboard URL   │ localhost:3000       │ Vercel domain           │
│ Arrancar local  │ bun run dev          │ —                       │
└─────────────────┴──────────────────────┴─────────────────────────┘
```

---

## Opcional: `vercel.json`

Crear `apps/dashboard/vercel.json` si el build del monorepo da problemas:

```json
{
  "installCommand": "cd ../.. && bun install",
  "buildCommand": "cd ../.. && bun run --filter @cerbero/dashboard build"
}
```

---

## Opcional: `railway.toml`

En la raíz del repo:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "bun install"

[deploy]
startCommand = "bun --filter @cerbero/api start"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
```

---

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Login redirect falla | URLs no configuradas en Supabase | Añadir dominio Vercel en Redirect URLs |
| Dashboard no carga datos | `NEXT_PUBLIC_API_URL` mal | Debe ser URL Railway, no localhost |
| CORS error en fetch | `CORS_ORIGIN` ≠ dominio Vercel | Igualar a `DASHBOARD_URL` |
| Bot no responde en prod | Webhook no registrado | Revisar logs Railway, `PUBLIC_API_URL` HTTPS |
| Bot responde en local pero no prod | Sigue en polling / otra instancia local | Parar `dev:api` local; solo webhook en prod |
| API crash al arrancar | Falta `TELEGRAM_WEBHOOK_SECRET` | `bun run env:print -- --env production` |
| 401 en `/telegram/webhook` | Secret no coincide | Mismo valor en Railway y el que Telegram recibe al `setWebhook` |

---

## Orden recomendado del primer deploy

1. `bun run env:check` en local.
2. Configurar redirects en Supabase.
3. Deploy Railway + variables + dominio.
4. Deploy Vercel + variables.
5. Actualizar `DASHBOARD_URL` y `CORS_ORIGIN` en Railway → redeploy.
6. Pruebas end-to-end.
7. Usar el producto unos días antes de la tabla filtrable.

---

## Comandos útiles

```bash
bun run env:check                              # validar .env desarrollo
bun run env:print                              # catálogo desarrollo
bun run env:print -- --env production          # catálogo producción
bun run env:check -- --env production --process --target api
bun run build                                  # build dashboard local
bun run dev                                    # API + dashboard en local
```
