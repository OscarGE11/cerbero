"use client";

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthInfo,
  AuthModeTabs,
  AuthShell,
} from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { TabsContent } from "@/components/ui/tabs";
import { completeLinkSession, getLinkSessionStatus } from "@/features/link/api";
import { translateAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Step = "loading" | "auth" | "otp" | "invalid" | "missing";
type AuthMode = "login" | "signup";

export function LinkPage({ token }: { token?: string }) {
  const [step, setStep] = useState<Step>("loading");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
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
      setError(translateAuthError(authError ?? "Error al iniciar sesión"));
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
    const confirmPassword = String(form.get("confirmPassword"));

    setLoading(true);
    setError(null);
    setInfo(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
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
          <Alert className="border-white/[0.08] bg-white/[0.04]">
            <AlertDescription className="text-muted-foreground">
              <code>/link {code}</code>
            </AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground">
            El código expira en 30 minutos.
          </p>
          <Button asChild className="h-11 w-full rounded-xl">
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Vincular Telegram"
      subtitle="Crea tu cuenta o inicia sesión para obtener el código OTP."
    >
      <AuthModeTabs
        value={authMode}
        onValueChange={(value) => {
          setAuthMode(value);
          setError(null);
          setInfo(null);
        }}
      >
        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <AuthField label="Email" htmlFor="login-email">
              <Input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </AuthField>
            <AuthField label="Contraseña" htmlFor="login-password">
              <PasswordInput
                id="login-password"
                name="password"
                required
                autoComplete="current-password"
              />
            </AuthField>
            {error && <AuthError message={error} />}
            <AuthButton loading={loading}>
              {loading ? "Procesando…" : "Iniciar sesión"}
            </AuthButton>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignup} className="space-y-4">
            <AuthField label="Email" htmlFor="signup-email">
              <Input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </AuthField>
            <AuthField label="Contraseña" htmlFor="signup-password">
              <PasswordInput
                id="signup-password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </AuthField>
            <AuthField
              label="Confirmar contraseña"
              htmlFor="signup-confirm-password"
            >
              <PasswordInput
                id="signup-confirm-password"
                name="confirmPassword"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </AuthField>
            {error && <AuthError message={error} />}
            {info && <AuthInfo message={info} />}
            <AuthButton loading={loading}>
              {loading ? "Procesando…" : "Crear cuenta"}
            </AuthButton>
          </form>
        </TabsContent>
      </AuthModeTabs>
    </AuthShell>
  );
}
