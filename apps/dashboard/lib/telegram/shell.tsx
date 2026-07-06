"use client";

import { Button } from "@/components/ui/button";
import { useTelegram } from "@/lib/telegram/provider";

export function TelegramEnvironmentGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady, isTelegram } = useTelegram();

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </main>
    );
  }

  if (!isTelegram) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20">
            <span className="text-xl font-bold text-primary">C</span>
          </div>
          <h1 className="text-xl font-semibold">Abre desde Telegram</h1>
          <p className="text-sm text-muted-foreground">
            Esta interfaz solo funciona dentro del bot de Cerbero. Abre el bot
            en Telegram y pulsa el menú o usa /add o /login.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

export function TelegramShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <main className="telegram-shell mx-auto min-h-screen w-full max-w-lg px-4 py-6">
      {title ? (
        <header className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </header>
      ) : null}
      {children}
    </main>
  );
}

export function TelegramPrimaryButton({
  children,
  loading,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const { isTelegram } = useTelegram();

  if (isTelegram) {
    return null;
  }

  return (
    <Button
      type={type}
      className="h-11 w-full rounded-xl"
      disabled={loading}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
