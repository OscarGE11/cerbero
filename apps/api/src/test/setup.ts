/** Minimal env for unit/integration tests (loaded via bun test --preload). */
process.env.NODE_ENV ??= "development";
process.env.SUPABASE_URL ??= "https://test.supabase.co";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key-min-1-chars";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role-key-min";
process.env.DASHBOARD_URL ??= "http://localhost:3000";
process.env.PUBLIC_API_URL ??= "http://localhost:3001";
process.env.CORS_ORIGIN ??= "http://localhost:3000";
