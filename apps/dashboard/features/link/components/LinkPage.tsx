"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { completeLinkSession, getLinkSessionStatus } from "@/features/link/api";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Step = "loading" | "auth" | "otp" | "invalid" | "missing";

export function LinkPage({ token }: { token?: string }) {
  const [step, setStep] = useState<Step>("loading");
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
      <main className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Validando enlace…</p>
      </main>
    );
  }

  if (step === "missing") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enlace inválido</CardTitle>
            <CardDescription>
              Empieza desde Telegram con el comando /login.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (step === "invalid") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enlace expirado</CardTitle>
            <CardDescription>
              {error ??
                "Este enlace ya no es válido. Usa /login de nuevo en Telegram."}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (step === "otp") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Código de vinculación</CardTitle>
            <CardDescription>
              Copia este código y envíalo al bot de Telegram.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-4xl font-bold tracking-[0.3em]">
              {code}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              <code>/link {code}</code>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              El código expira en 30 minutos.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Vincular Telegram</CardTitle>
          <CardDescription>
            Crea tu cuenta o inicia sesión para obtener el código OTP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Procesando…" : "Iniciar sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Procesando…" : "Crear cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
