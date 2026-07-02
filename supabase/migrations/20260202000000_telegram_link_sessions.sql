CREATE TABLE telegram_link_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token             TEXT NOT NULL UNIQUE,
  telegram_id       BIGINT NOT NULL,
  telegram_username TEXT,
  user_id           UUID REFERENCES auth.users(id),
  code              TEXT,
  expires_at        TIMESTAMPTZ NOT NULL,
  completed_at      TIMESTAMPTZ,
  used_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX telegram_link_sessions_telegram_id_idx ON telegram_link_sessions (telegram_id);
