"use client";

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthInfo,
  AuthModeTabs,
  AuthShell,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { TabsContent } from "@/components/ui/tabs";
import { linkTelegramAccount } from "@/features/telegram/api";
import { translateAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { useTelegram } from "@/lib/telegram/provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthMode = "login" | "signup";

export function TelegramLinkPage() {
  const router = useRouter();
  const { initData, hapticSuccess, hapticError, openLink } = useTelegram();
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onAuthSuccess(accessToken: string) {
    setLoading(true);
    setError(null);

    try {
      await linkTelegramAccount(initData, accessToken);
      hapticSuccess();
      router.replace("/telegram");
      router.refresh();
    } catch (err) {
      hapticError();
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
        "Te hemos enviado un correo de confirmación. Confírmalo y vuelve a iniciar sesión aquí.",
      );
      setAuthMode("login");
      setLoading(false);
      return;
    }

    await onAuthSuccess(data.session.access_token);
  }

  return (
    <AuthShell
      title="Vincular Telegram"
      subtitle="Crea tu cuenta o inicia sesión para vincular este Telegram."
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
            <AuthField label="Email" htmlFor="tg-login-email">
              <Input
                id="tg-login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </AuthField>
            <AuthField label="Contraseña" htmlFor="tg-login-password">
              <PasswordInput
                id="tg-login-password"
                name="password"
                required
                autoComplete="current-password"
              />
            </AuthField>
            {error && <AuthError message={error} />}
            <AuthButton loading={loading}>
              {loading ? "Vinculando…" : "Iniciar sesión y vincular"}
            </AuthButton>
          </form>
          <p className="mt-4 text-center text-sm">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() =>
                openLink(`${window.location.origin}/forgot-password`)
              }
            >
              ¿Has olvidado tu contraseña?
            </Button>
          </p>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignup} className="space-y-4">
            <AuthField label="Email" htmlFor="tg-signup-email">
              <Input
                id="tg-signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </AuthField>
            <AuthField label="Contraseña" htmlFor="tg-signup-password">
              <PasswordInput
                id="tg-signup-password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </AuthField>
            <AuthField
              label="Confirmar contraseña"
              htmlFor="tg-signup-confirm-password"
            >
              <PasswordInput
                id="tg-signup-confirm-password"
                name="confirmPassword"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </AuthField>
            {error && <AuthError message={error} />}
            {info && <AuthInfo message={info} />}
            <AuthButton loading={loading}>
              {loading ? "Vinculando…" : "Crear cuenta y vincular"}
            </AuthButton>
          </form>
        </TabsContent>
      </AuthModeTabs>
    </AuthShell>
  );
}
