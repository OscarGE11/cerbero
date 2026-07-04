"use client";

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthInfo,
  AuthShell,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { translateAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const token = searchParams.get("token");

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!cancelled && event === "PASSWORD_RECOVERY") {
        setReady(true);
        setError(null);
      }
    });

    async function verifyRecoverySession() {
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;

        if (exchangeError) {
          setError(translateAuthError(exchangeError));
          return;
        }

        setReady(true);
        return;
      }

      if (token) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });

        if (cancelled) return;

        if (verifyError) {
          setError(translateAuthError(verifyError));
          return;
        }

        setReady(true);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        setReady(true);
        return;
      }

      setError(
        "El enlace no es válido. Solicita uno nuevo desde la página de recuperación.",
      );
    }

    void verifyRecoverySession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [code, token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));

    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(translateAuthError(updateError));
      setLoading(false);
      return;
    }

    setInfo("Tu contraseña se ha actualizado correctamente. Redirigiendo…");
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  }

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura para tu cuenta."
    >
      {ready ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField label="Nueva contraseña" htmlFor="password">
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </AuthField>
          <AuthField
            label="Confirmar nueva contraseña"
            htmlFor="confirmPassword"
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </AuthField>
          {error && <AuthError message={error} />}
          {info && <AuthInfo message={info} />}
          <AuthButton loading={loading}>
            {loading ? "Guardando…" : "Guardar contraseña"}
          </AuthButton>
        </form>
      ) : (
        <div className="space-y-4">
          {!error && (
            <p className="text-center text-sm text-muted-foreground">
              Verificando enlace…
            </p>
          )}
          {error && <AuthError message={error} />}
          {error && (
            <Button asChild className="h-11 w-full rounded-xl">
              <Link href="/forgot-password">Solicitar nuevo enlace</Link>
            </Button>
          )}
        </div>
      )}

      <p className="mt-5 text-center text-sm text-muted-foreground">
        <Button variant="link" asChild className="h-auto p-0">
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </p>
    </AuthShell>
  );
}
