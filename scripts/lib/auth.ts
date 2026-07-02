function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

export function getSupabaseConfig() {
  return {
    url: requireEnv("SUPABASE_URL"),
    anonKey: requireEnv(
      "SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    `http://localhost:${process.env.PORT ?? "3001"}`
  );
}

export function getDevCredentials(): { email: string; password: string } {
  const email = process.env.DEV_USER_EMAIL ?? Bun.argv[2];
  const password = process.env.DEV_USER_PASSWORD ?? Bun.argv[3];

  if (!email || !password) {
    throw new Error(
      "Missing credentials. Set DEV_USER_EMAIL and DEV_USER_PASSWORD in .env, or run: bun run auth:token -- email password",
    );
  }

  return { email, password };
}

export async function fetchJwt(): Promise<string> {
  const { url, anonKey } = getSupabaseConfig();
  const { email, password } = getDevCredentials();

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error_description?: string;
    msg?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ??
        data.msg ??
        "Login failed — check DEV_USER_* credentials",
    );
  }

  return data.access_token;
}
