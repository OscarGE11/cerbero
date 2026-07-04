"use client";

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthInfo,
  AuthModeTabs,
  AuthShell,
} from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { translateAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setLoading(true);
    setError(null);
    setInfo(null);

    if (mode === "signup") {
      const confirmPassword = String(form.get("confirmPassword"));
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        setLoading(false);
        return;
      }
    }

    const supabase = createClient();

    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(translateAuthError(authError));
        setLoading(false);
        return;
      }
    } else {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(translateAuthError(authError));
        setLoading(false);
        return;
      }

      if (!data.session) {
        setInfo(
          "Te hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada.",
        );
        setLoading(false);
        return;
      }
    }

    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell
      title="Cerbero"
      subtitle={
        mode === "login"
          ? "Accede a tu panel financiero"
          : "Crea tu cuenta en segundos"
      }
    >
      <AuthModeTabs value={mode} onValueChange={switchMode} />

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
        <AuthField label="Contraseña" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={mode === "signup" ? 6 : undefined}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </AuthField>
        {mode === "signup" && (
          <AuthField label="Confirmar contraseña" htmlFor="confirmPassword">
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </AuthField>
        )}
        {error && <AuthError message={error} />}
        {info && <AuthInfo message={info} />}
        <AuthButton loading={loading}>
          {loading
            ? "Procesando…"
            : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
        </AuthButton>
      </form>

      {mode === "login" && (
        <p className="mt-4 text-center text-sm">
          <Button variant="link" asChild className="h-auto p-0">
            <Link href="/forgot-password">¿Has olvidado tu contraseña?</Link>
          </Button>
        </p>
      )}

      <p className="mt-5 text-center text-sm text-muted-foreground">
        ¿Vienes de Telegram? Usa{" "}
        <Button variant="link" asChild className="h-auto p-0">
          <Link href="/link">/login en el bot</Link>
        </Button>
      </p>
    </AuthShell>
  );
}
