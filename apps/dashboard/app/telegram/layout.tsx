import { TelegramProviders } from "@/components/providers/telegram-providers";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Cerbero — Telegram",
  description: "Tracker de gastos e ingresos en Telegram",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TelegramProviders>
      <div className="telegram-app min-h-screen bg-background">{children}</div>
    </TelegramProviders>
  );
}
