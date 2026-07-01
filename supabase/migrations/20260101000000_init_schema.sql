-- Cerbero initial schema: categories + movements with RLS

CREATE TABLE categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT
);

CREATE TABLE movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  title           TEXT NOT NULL,
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category_id     UUID REFERENCES categories(id),
  custom_category TEXT,
  comment         TEXT,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_categories" ON categories
  FOR SELECT TO authenticated USING (true);

ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_movements" ON movements
  FOR ALL USING (auth.uid() = user_id);
