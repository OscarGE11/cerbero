"use client";

import { TelegramHomePage } from "@/features/telegram/components/telegram-home";
import { useTelegramMe } from "@/features/telegram/hooks";
import { TelegramShell } from "@/lib/telegram/shell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TelegramPage() {
  const router = useRouter();
  const { data: me, isLoading, isError } = useTelegramMe();

  useEffect(() => {
    if (!isLoading && me && !me.linked) {
      router.replace("/telegram/link");
    }
  }, [isLoading, me, router]);

  if (isLoading) {
    return (
      <TelegramShell>
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </TelegramShell>
    );
  }

  if (isError || !me?.linked) {
    return (
      <TelegramShell>
        <p className="text-sm text-muted-foreground">Redirigiendo…</p>
      </TelegramShell>
    );
  }

  return <TelegramHomePage />;
}
