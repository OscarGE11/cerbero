const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class TelegramApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

export async function fetchTelegramApi<T>(
  path: string,
  initData: string,
  init?: RequestInit & { accessToken?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Telegram-Init-Data": initData,
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  if (init?.accessToken) {
    headers.Authorization = `Bearer ${init.accessToken}`;
  }

  const { accessToken: _accessToken, ...fetchInit } = init ?? {};

  const res = await fetch(`${apiUrl}${path}`, {
    ...fetchInit,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const body = data as { error?: string };
    throw new TelegramApiError(
      body.error ?? "Error en la petición",
      res.status,
      body.error,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return data as T;
}

export function getTelegramWebAppUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_TELEGRAM_WEBAPP_URL ??
    process.env.NEXT_PUBLIC_DASHBOARD_URL ??
    "http://localhost:3000/telegram";
  const normalized = base.replace(/\/$/, "");
  if (!path) return normalized;
  return `${normalized}${path.startsWith("/") ? path : `/${path}`}`;
}
