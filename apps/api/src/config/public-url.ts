import { env } from "./env.js";

let resolvedPublicApiUrl: string | null = null;

export function toOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("/")) return null;

  try {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function collectOriginCandidates(): string[] {
  const origins = new Set<string>();

  for (const value of [
    process.env.PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : undefined,
  ]) {
    if (!value) continue;
    const origin = toOrigin(value);
    if (origin) origins.add(origin);
  }

  return [...origins];
}

async function isReachable(origin: string): Promise<boolean> {
  try {
    const response = await fetch(`${origin}/health`, {
      signal: AbortSignal.timeout(8_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getPublicApiUrl(): string {
  return resolvedPublicApiUrl ?? env.PUBLIC_API_URL;
}

export function setPublicApiUrl(url: string): void {
  resolvedPublicApiUrl = url;
}

/** Pick the first configured origin whose /health responds. */
export async function resolveReachablePublicApiUrl(): Promise<string> {
  if (resolvedPublicApiUrl) return resolvedPublicApiUrl;

  const candidates = collectOriginCandidates();

  for (const origin of candidates) {
    if (await isReachable(origin)) {
      if (origin !== env.PUBLIC_API_URL) {
        console.warn(
          `Using reachable API origin ${origin} (configured PUBLIC_API_URL was ${env.PUBLIC_API_URL})`,
        );
      }
      setPublicApiUrl(origin);
      return origin;
    }
  }

  console.error(
    `No reachable PUBLIC API URL found. Set PUBLIC_API_URL to your active Railway domain, e.g. https://cerbero-api.up.railway.app (tried: ${candidates.join(", ") || "none"})`,
  );
  setPublicApiUrl(env.PUBLIC_API_URL);
  return env.PUBLIC_API_URL;
}
