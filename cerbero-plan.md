# Cerbero — Plan de Proyecto

> Tracker de gastos e ingresos personal con bot de Telegram y dashboard web.

## Estado actual

**Fase activa:** Fase 4 — Dashboard

| Área | Estado |
|---|---|
| Monorepo Bun + tooling (Biome, Lefthook, Commitlint) | Completado |
| `packages/shared` (tipos base) | Completado |
| Supabase remoto (migraciones, RLS, seed 8 categorías) | Completado |
| Proyecto Supabase enlazado (`pprtjlpmnbaypmfjmyyo`) | Completado |
| `.env` local con URL + keys + `TELEGRAM_BOT_TOKEN` | Completado |
| Repositorio en GitHub | Completado |
| `apps/api` (Hono, endpoints, auth JWT) | Completado |
| Spec vinculación Telegram | Completado — ver `docs/telegram-account-linking.md` |
| Bot Telegram (Telegraf, /add, /link, /last, /month) | Completado |
| `apps/dashboard` | En curso (Fase 4) |

---

## Stack

| Capa | Tecnología |
|---|---|
| Monorepo | Bun Workspaces |
| Backend + Bot | Bun + Hono + Telegraf |
| Frontend | Next.js 14 + React Query + Recharts |
| UI | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (Postgres) |
| Auth | Supabase Auth |
| Linter/Formatter | Biome |
| Git hooks | Lefthook + Commitlint |
| Hosting dashboard | Vercel |
| Hosting backend/bot | Railway |
| Control de versiones | Git + GitHub |

---

## Estructura del Monorepo

```
cerbero/
├── apps/
│   ├── api/          # Bun + Hono (backend + bot)
│   └── dashboard/    # Next.js
├── packages/
│   └── shared/       # Tipos TypeScript compartidos
├── package.json      # Bun workspaces raíz
├── biome.json
├── lefthook.yml
└── commitlint.config.ts
```

---

## Base de Datos

### Tabla: `categories`

Tabla separada en lugar de enum de Postgres — más fácil de extender sin migraciones complejas.

```sql
CREATE TABLE categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT -- emoji o clave de icono, opcional
);

-- Seed inicial
INSERT INTO categories (name) VALUES
  ('Alimentación'), ('Transporte'), ('Ocio'),
  ('Salud'), ('Hogar'), ('Ropa'), ('Suscripciones'), ('Otro');
```

### Tabla: `movements`

```sql
CREATE TABLE movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  title           TEXT NOT NULL,
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category_id     UUID REFERENCES categories(id),
  custom_category TEXT,          -- nullable, solo si category es 'Otro'
  comment         TEXT,          -- nullable
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Row Level Security

Activar RLS para que cada usuario solo vea sus datos:

```sql
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_movements" ON movements
  FOR ALL USING (auth.uid() = user_id);
```

---

## Arquitectura Backend (`apps/api`)

Capas estrictas — los controllers no tienen lógica de negocio, los repositories no tienen lógica de dominio.

```
apps/api/src/
├── index.ts              # Entry point, instancia Hono + monta rutas
├── config/
│   ├── env.ts            # Validación de variables de entorno (zod)
│   └── supabase.ts       # Cliente Supabase singleton
├── routes/
│   ├── movements.ts      # POST /movements, GET /movements, etc.
│   └── categories.ts     # GET /categories
├── controllers/
│   ├── movements.ts      # Recibe Request, llama Service, devuelve Response
│   └── categories.ts
├── services/
│   ├── movements.ts      # Lógica de negocio (validaciones, transformaciones)
│   └── categories.ts
├── repositories/
│   ├── movements.ts      # Queries a Supabase, nada más
│   └── categories.ts
├── bot/
│   ├── index.ts          # Instancia Telegraf, monta scenes
│   ├── scenes/
│   │   └── addMovement.ts  # Wizard scene del stepper
│   └── middleware/
│       └── auth.ts       # Vincula Telegram user_id con Supabase user
└── types/                # Tipos locales de la API (re-exporta de shared)
```

### Principios SOLID aplicados

- **S** — Cada clase/módulo tiene una sola razón de cambio. El repository solo cambia si cambia la BD. El service solo cambia si cambia la lógica de negocio.
- **O** — Nuevas categorías o tipos de movimiento no requieren modificar código existente, solo datos.
- **D** — Los services reciben el repository por inyección (o importación explícita), no lo instancian internamente. Facilita testing.

---

## Bot de Telegram

Flujo con Telegraf Wizard Scene (stepper conversacional):

```
/add
  → ¿Gasto o ingreso? [Gasto] [Ingreso]
  → ¿Categoría? [Alimentación] [Transporte] ... [Otro]
  → Título (texto libre)
  → Importe (número)
  → Comentario (opcional) [Saltar]
  → Confirmación → persiste en BD
```

Comandos adicionales:
- `/last` — últimos 5 movimientos
- `/month` — resumen del mes actual
- `/cancel` — cancela el flujo activo

**Punto clave:** El bot llama a los mismos services que la API REST, no tiene lógica de persistencia propia.

---

## Frontend (`apps/dashboard`)

### Estructura Feature-Based

```
apps/dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Redirige a /dashboard
│   └── dashboard/
│       └── page.tsx          # Entry point de la feature
├── features/
│   ├── movements/
│   │   ├── components/       # MovementList, MovementCard, AddMovementForm
│   │   ├── api/              # useMovements, useCreateMovement (React Query)
│   │   ├── hooks/            # useMovementFilters, etc.
│   │   ├── utils/
│   │   └── constants/
│   ├── reports/
│   │   ├── components/       # Charts, ReportSummary
│   │   ├── api/
│   │   └── hooks/
│   └── categories/
│       ├── components/
│       └── api/
├── components/               # Componentes genuinamente compartidos
│   └── ui/                   # shadcn components
└── lib/
    ├── supabase.ts
    └── queryClient.ts
```

### Vistas principales

- **Dashboard** — resumen del mes: total gastos, total ingresos, balance, últimos movimientos
- **Movimientos** — listado filtrable por tipo, categoría, rango de fechas
- **Informes** — gráficas por día / mes / año (Recharts)
- **Categorías** — gestión de categorías

---

## Paquete Compartido (`packages/shared`)

Tipos TypeScript que usan tanto la API como el dashboard:

```typescript
export type MovementType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Movement {
  id: string;
  userId: string;
  type: MovementType;
  title: string;
  amount: number;
  categoryId?: string;
  customCategory?: string;
  comment?: string;
  date: string;
  createdAt: string;
}

export interface CreateMovementDto {
  type: MovementType;
  title: string;
  amount: number;
  categoryId?: string;
  customCategory?: string;
  comment?: string;
  date?: string;
}
```

---

## Configuración del Proyecto

### `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

### `lefthook.yml`

```yaml
pre-commit:
  commands:
    biome-check:
      run: bunx biome check --apply {staged_files}

commit-msg:
  commands:
    commitlint:
      run: bunx commitlint --edit {1}
```

### `commitlint.config.ts`

```typescript
export default {
  extends: ['@commitlint/config-conventional'],
};
```

Formato de commits: `type(scope): description`
Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

Ejemplos:
```
feat(bot): add wizard scene for movement creation
fix(api): validate amount is positive before persisting
refactor(dashboard): extract movement filters to custom hook
```

---

## Variables de Entorno

### `apps/api/.env`

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # Solo en backend, nunca en frontend
TELEGRAM_BOT_TOKEN=
PORT=3001
```

### `apps/dashboard/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Anon key, nunca la service role
NEXT_PUBLIC_API_URL=
```

---

## Hoja de Ruta

### Fase 1 — Base (semana 1-2)
- [x] Inicializar monorepo con Bun workspaces
- [x] Configurar Biome + Lefthook + Commitlint
- [x] Crear tablas en Supabase + RLS
- [x] Seed de categorías
- [x] `packages/shared` con tipos base

### Fase 2 — API (semana 2-3)
- [x] Estructura de carpetas backend
- [x] `POST /movements` con validación y persistencia
- [x] `GET /movements` con filtros básicos
- [x] `GET /categories`
- [x] Middleware de auth (JWT de Supabase)

### Fase 3 — Bot (semana 3-4)
- [x] Wizard scene completo (`/add`)
- [x] Comandos `/last` y `/month`
- [x] Vinculación Telegram user → Supabase user

### Fase 4 — Dashboard (semana 4-6)
- [ ] Setup Next.js + shadcn + React Query
- [ ] Vista de movimientos con filtros
- [ ] Formulario de creación
- [ ] Auth con Supabase Auth

### Fase 5 — Informes (semana 6-8)
- [ ] Gráficas por día / mes / año (Recharts)
- [ ] Comparativa gastos vs ingresos
- [ ] Resumen de categorías

---

## Puntos Ciegos a Vigilar

- **No aceptes sugerencias de arquitectura del IDE sin razonarlas tú primero.** Escribe el esquema/pseudocódigo antes de pedir que lo implemente.
- **El bot llama a los services, no a Supabase directamente.** Si acabas con lógica de BD en el bot, algo salió mal.
- **RLS es tu seguridad real.** No confíes solo en que la API filtre por `user_id` — si RLS no está activo, cualquier bug expone datos de otros usuarios.
- **`SUPABASE_SERVICE_ROLE_KEY` nunca al frontend.** Esta key bypasea RLS. Solo en el backend.
- **Migraciones desde el primer día.** Usa el CLI de Supabase para gestionar cambios de esquema, no edites tablas a mano en producción.

---

## Valor para Portafolio

Lo que puedes defender en una entrevista:

- Decisión de monorepo con Bun workspaces y por qué (compartir tipos, un solo repo)
- Por qué `categories` es una tabla y no un enum de Postgres
- Cómo funciona RLS y por qué es más seguro que filtrar en aplicación
- Feature-based folder structure y sus ventajas sobre structure-by-type
- Por qué el bot usa los mismos services que la API REST (DRY, single source of truth)
