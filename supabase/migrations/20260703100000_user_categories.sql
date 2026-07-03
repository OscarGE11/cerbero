-- Per-user saved custom categories (from bot "Otro" flow)

CREATE TABLE user_categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  use_count    INT NOT NULL DEFAULT 1 CHECK (use_count > 0),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name, type)
);

CREATE INDEX user_categories_user_type_last_used_idx
  ON user_categories (user_id, type, last_used_at DESC);

ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_user_categories" ON user_categories
  FOR ALL USING (auth.uid() = user_id);
