# Cerbero

Tracker de gastos e ingresos personal con bot de Telegram y dashboard web.

## Prerrequisitos

- [Bun](https://bun.sh) >= 1.1
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Git

## Setup local

```bash
bun install
bunx lefthook install
```

## Scripts

| Comando | Descripción |
|---|---|
| `bun run check` | Lint + format check con Biome |
| `bun run format` | Aplica formato con Biome |
| `bun run typecheck` | Verifica tipos en packages y API |
| `bun run dev:api` | Arranca la API + bot Telegram (puerto 3001) |
| `bun run auth:token` | Obtiene JWT de Supabase (lee `.env` automáticamente) |
| `bun run auth:link-code` | Genera código de vinculación para `/link` en Telegram |

## Bot Telegram — setup rápido

### 1. Migración (si no aplicaste la de Telegram)

```bash
bunx supabase db push
```

### 2. Arrancar API + bot (una sola terminal)

```bash
bun run dev:api
```

Debes ver **las dos líneas**:
- `Cerbero API listening on http://localhost:3001`
- `Telegram bot started (polling)`

Si `/start` no responde: suele ser que el bot no arrancó o hay **otra instancia** usando el token (`lsof -i :3001` → `kill PID`).

### 3. Flujo de vinculación (prod-like)

1. En Telegram: **`/login`**
2. Abre el enlace que te manda (ej. `http://localhost:3001/link?token=...`)
3. Regístrate o inicia sesión en la web
4. Copia el **código OTP** que aparece
5. En Telegram: **`/link 482913`**
6. Usa **`/add`**, **`/last`**, **`/month`**

Comandos BotFather: [docs/botfather-commands.txt](./docs/botfather-commands.txt)

### Dev alternativo (sin Telegram)

```bash
bun run auth:link-code   # requiere DEV_USER_EMAIL/PASSWORD en .env
```

## API (`apps/api`)

Endpoints protegidos con `Authorization: Bearer <supabase_jwt>`:

- `GET /health` — sin auth
- `GET /categories` — lista categorías
- `GET /movements?type=&categoryId=&from=&to=&limit=` — lista movimientos
- `POST /movements` — crea movimiento (body: `CreateMovementDto`)

Spec vinculación Telegram (Fase 3): [docs/telegram-account-linking.md](./docs/telegram-account-linking.md)

## Supabase

Las migraciones viven en `supabase/migrations/`. No edites el esquema a mano en producción.

### Primera vez (proyecto remoto)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Enlaza el proyecto:

```bash
bunx supabase link --project-ref <tu-project-ref>
```

3. Aplica migraciones:

```bash
bunx supabase db push
```

4. Ejecuta el seed (opcional):

```bash
bunx supabase db seed
```

### Desarrollo local

```bash
bunx supabase start
bunx supabase db reset   # migraciones + seed
```

## Estructura

```
cerbero/
├── apps/           # api (Fase 2) y dashboard (Fase 4)
├── packages/
│   └── shared/     # Tipos TypeScript compartidos
└── supabase/       # Migraciones y seed
```

## Convenciones

- **Commits:** Conventional Commits — `type(scope): description`
- **Tipos:** DB usa `snake_case`, dominio TS usa `camelCase`. Los mappers viven en `apps/api` (Fase 2).
- **Categorías:** Tabla en lugar de enum de Postgres para extender sin migraciones complejas.
- **Seguridad:** `SUPABASE_SERVICE_ROLE_KEY` solo en backend. RLS es la capa de seguridad real.

## Roadmap

Ver [cerbero-plan.md](./cerbero-plan.md) para el plan completo del proyecto.
