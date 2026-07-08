-- Security fix: enable RLS on telegram_link_sessions (was missing).
--
-- This table is only accessed from the API using the service_role key,
-- which bypasses RLS. Enabling RLS with no policies for anon/authenticated
-- closes direct access via the public anon key (the classic Supabase footgun
-- of a public-schema table left without RLS).

ALTER TABLE telegram_link_sessions ENABLE ROW LEVEL SECURITY;
