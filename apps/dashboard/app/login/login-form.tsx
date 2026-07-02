"use client";

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
  authInputClass,
} from "@/components/auth/auth-shell";
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
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
    } else {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError(
          "Revisa tu email para confirmar la cuenta, o desactiva confirmación en Supabase (dev).",
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
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white/[0.04] p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg py-2 text-sm font-medium transition ${
            mode === "login"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-lg py-2 text-sm font-medium transition ${
            mode === "signup"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={authInputClass()}
          />
        </AuthField>
        <AuthField label="Contraseña" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={mode === "signup" ? 6 : undefined}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className={authInputClass()}
          />
        </AuthField>
        {error && <AuthError message={error} />}
        <AuthButton loading={loading}>
          {loading
            ? "Procesando…"
            : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
        </AuthButton>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        ¿Vienes de Telegram? Usa{" "}
        <Link href="/link" className="font-medium text-primary hover:underline">
          /login en el bot
        </Link>
      </p>
    </AuthShell>
  );
}
