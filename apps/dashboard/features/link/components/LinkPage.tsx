"use client";

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthShell,
  authInputClass,
} from "@/components/auth/auth-shell";
import { completeLinkSession, getLinkSessionStatus } from "@/features/link/api";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Step = "loading" | "auth" | "otp" | "invalid" | "missing";
type AuthMode = "login" | "signup";

export function LinkPage({ token }: { token?: string }) {
  const [step, setStep] = useState<Step>("loading");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStep("missing");
      return;
    }

    getLinkSessionStatus(token)
      .then((status) => {
        if (status.status === "invalid") {
          setStep("invalid");
        } else if (status.status === "completed") {
          setCode(status.code);
          setStep("otp");
        } else {
          setStep("auth");
        }
      })
      .catch(() => {
        setError("No se pudo validar el enlace. Inténtalo de nuevo.");
        setStep("invalid");
      });
  }, [token]);

  async function onAuthSuccess(accessToken: string) {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const result = await completeLinkSession(token, accessToken);
      setCode(result.code);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al vincular");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.session) {
      setError(authError?.message ?? "Error al iniciar sesión");
      setLoading(false);
      return;
    }

    await onAuthSuccess(data.session.access_token);
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setLoading(true);
    setError(null);

    const supabase = createClient();
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

    await onAuthSuccess(data.session.access_token);
  }

  if (step === "loading") {
    return (
      <main className="auth-gradient flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Validando enlace…</p>
      </main>
    );
  }

  if (step === "missing") {
    return (
      <AuthShell
        title="Enlace inválido"
        subtitle="Empieza desde Telegram con el comando /login."
      >
        <p className="text-sm text-muted-foreground">
          Abre el bot y escribe <code className="text-primary">/login</code>{" "}
          para obtener un enlace válido.
        </p>
      </AuthShell>
    );
  }

  if (step === "invalid") {
    return (
      <AuthShell
        title="Enlace expirado"
        subtitle={
          error ??
          "Este enlace ya no es válido. Usa /login de nuevo en Telegram."
        }
      >
        <p className="text-sm text-muted-foreground">
          Los enlaces de vinculación caducan tras un tiempo por seguridad.
        </p>
      </AuthShell>
    );
  }

  if (step === "otp") {
    return (
      <AuthShell
        title="Código de vinculación"
        subtitle="Copia este código y envíalo al bot de Telegram."
      >
        <div className="space-y-4 text-center">
          <p className="text-4xl font-bold tracking-[0.3em] text-primary">
            {code}
          </p>
          <p className="rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
            <code>/link {code}</code>
          </p>
          <p className="text-xs text-muted-foreground">
            El código expira en 30 minutos.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Vincular Telegram"
      subtitle="Crea tu cuenta o inicia sesión para obtener el código OTP."
    >
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white/[0.04] p-1">
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className={`rounded-lg py-2 text-sm font-medium transition ${
            authMode === "login"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("signup")}
          className={`rounded-lg py-2 text-sm font-medium transition ${
            authMode === "signup"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Registrarse
        </button>
      </div>

      {authMode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <AuthField label="Email" htmlFor="login-email">
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={authInputClass()}
            />
          </AuthField>
          <AuthField label="Contraseña" htmlFor="login-password">
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={authInputClass()}
            />
          </AuthField>
          {error && <AuthError message={error} />}
          <AuthButton loading={loading}>
            {loading ? "Procesando…" : "Iniciar sesión"}
          </AuthButton>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <AuthField label="Email" htmlFor="signup-email">
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={authInputClass()}
            />
          </AuthField>
          <AuthField label="Contraseña" htmlFor="signup-password">
            <input
              id="signup-password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={authInputClass()}
            />
          </AuthField>
          {error && <AuthError message={error} />}
          <AuthButton loading={loading}>
            {loading ? "Procesando…" : "Crear cuenta"}
          </AuthButton>
        </form>
      )}
    </AuthShell>
  );
}
