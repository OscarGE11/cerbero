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
| `bun run typecheck` | Verifica tipos en `packages/*` |

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
