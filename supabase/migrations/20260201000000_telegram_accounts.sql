CREATE TABLE telegram_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id       BIGINT NOT NULL UNIQUE,
  telegram_username TEXT,
  linked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE link_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code       TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE telegram_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_telegram_account" ON telegram_accounts
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_link_codes" ON link_codes
  FOR ALL USING (auth.uid() = user_id);
