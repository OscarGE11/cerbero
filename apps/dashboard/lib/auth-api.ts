const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function requestPasswordReset(email: string): Promise<string> {
  const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = (await res.json()) as { message?: string; error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? "No se pudo enviar la solicitud");
  }

  return (
    data.message ??
    "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña."
  );
}
