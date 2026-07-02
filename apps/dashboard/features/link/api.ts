const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type LinkSessionStatus =
  | { status: "pending" }
  | { status: "completed"; code: string }
  | { status: "invalid" };

export async function getLinkSessionStatus(
  token: string,
): Promise<LinkSessionStatus> {
  const res = await fetch(
    `${apiUrl}/link/sessions/status?token=${encodeURIComponent(token)}`,
  );

  if (res.status === 410) {
    return { status: "invalid" };
  }

  if (!res.ok) {
    throw new Error("No se pudo validar el enlace");
  }

  return res.json() as Promise<LinkSessionStatus>;
}

export async function completeLinkSession(
  token: string,
  accessToken: string,
): Promise<{ code: string; expiresAt: string }> {
  const res = await fetch(`${apiUrl}/link/sessions/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Error al generar código");
  }

  return data;
}
