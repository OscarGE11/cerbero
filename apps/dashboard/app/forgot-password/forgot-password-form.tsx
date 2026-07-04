"use client";

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthInfo,
  AuthShell,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth-api";
import { translateAuthError } from "@/lib/auth-errors";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const message = await requestPasswordReset(email);
      setInfo(message);
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </AuthField>
        {error && <AuthError message={error} />}
        {info && <AuthInfo message={info} />}
        <AuthButton loading={loading}>
          {loading ? "Enviando…" : "Enviar enlace"}
        </AuthButton>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        <Button variant="link" asChild className="h-auto p-0">
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </p>
    </AuthShell>
  );
}
