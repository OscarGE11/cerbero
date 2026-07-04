"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="auth-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 shadow-glow">
            <span className="text-xl font-bold text-primary">C</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Card className="glass-card border-white/[0.08] shadow-none">
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}

export function AuthField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function AuthButton({
  children,
  loading,
  type = "submit",
}: {
  children: React.ReactNode;
  loading?: boolean;
  type?: "submit" | "button";
}) {
  return (
    <Button
      type={type}
      disabled={loading}
      className="h-11 w-full rounded-xl text-sm font-semibold"
    >
      {children}
    </Button>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function AuthInfo({ message }: { message: string }) {
  return (
    <Alert variant="info">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

type AuthMode = "login" | "signup";

export function AuthModeTabs({
  value,
  onValueChange,
  children,
}: {
  value: AuthMode;
  onValueChange: (mode: AuthMode) => void;
  children?: React.ReactNode;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as AuthMode)}
    >
      <TabsList className="mb-6 grid h-auto w-full grid-cols-2 rounded-xl bg-white/[0.04] p-1">
        <TabsTrigger
          value="login"
          className="rounded-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
        >
          Iniciar sesión
        </TabsTrigger>
        <TabsTrigger
          value="signup"
          className="rounded-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
        >
          Registrarse
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
