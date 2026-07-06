"use client";

import WebApp from "@twa-dev/sdk";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface TelegramContextValue {
  isTelegram: boolean;
  isReady: boolean;
  initData: string;
  colorScheme: "light" | "dark";
  expand: () => void;
  close: () => void;
  hapticSuccess: () => void;
  hapticError: () => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

function applyThemeParams() {
  const params = WebApp.themeParams;
  const root = document.documentElement;

  if (params.bg_color) {
    root.style.setProperty("--tg-bg-color", params.bg_color);
  }
  if (params.text_color) {
    root.style.setProperty("--tg-text-color", params.text_color);
  }
  if (params.button_color) {
    root.style.setProperty("--tg-button-color", params.button_color);
  }
  if (params.button_text_color) {
    root.style.setProperty("--tg-button-text-color", params.button_text_color);
  }
  if (params.secondary_bg_color) {
    root.style.setProperty(
      "--tg-secondary-bg-color",
      params.secondary_bg_color,
    );
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [initData, setInitData] = useState("");
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const inTelegram = Boolean(WebApp.initData);
    setIsTelegram(inTelegram);

    if (inTelegram) {
      WebApp.ready();
      WebApp.expand();
      applyThemeParams();
      setInitData(WebApp.initData);
      setColorScheme(WebApp.colorScheme === "light" ? "light" : "dark");

      const onThemeChanged = () => {
        applyThemeParams();
        setColorScheme(WebApp.colorScheme === "light" ? "light" : "dark");
      };

      WebApp.onEvent("themeChanged", onThemeChanged);
      setIsReady(true);

      return () => {
        WebApp.offEvent("themeChanged", onThemeChanged);
        WebApp.MainButton.hide();
        WebApp.BackButton.hide();
      };
    }

    setIsReady(true);
  }, []);

  const expand = useCallback(() => {
    if (isTelegram) WebApp.expand();
  }, [isTelegram]);

  const close = useCallback(() => {
    if (isTelegram) WebApp.close();
  }, [isTelegram]);

  const hapticSuccess = useCallback(() => {
    if (isTelegram) WebApp.HapticFeedback.notificationOccurred("success");
  }, [isTelegram]);

  const hapticError = useCallback(() => {
    if (isTelegram) WebApp.HapticFeedback.notificationOccurred("error");
  }, [isTelegram]);

  const showMainButton = useCallback(
    (text: string, onClick: () => void) => {
      if (!isTelegram) return;
      WebApp.MainButton.setText(text);
      WebApp.MainButton.onClick(onClick);
      WebApp.MainButton.show();
    },
    [isTelegram],
  );

  const hideMainButton = useCallback(() => {
    if (isTelegram) {
      WebApp.MainButton.hide();
      WebApp.MainButton.offClick(() => undefined);
    }
  }, [isTelegram]);

  const showBackButton = useCallback(
    (onClick: () => void) => {
      if (!isTelegram) return;
      WebApp.BackButton.onClick(onClick);
      WebApp.BackButton.show();
    },
    [isTelegram],
  );

  const hideBackButton = useCallback(() => {
    if (isTelegram) {
      WebApp.BackButton.hide();
      WebApp.BackButton.offClick(() => undefined);
    }
  }, [isTelegram]);

  const value = useMemo(
    () => ({
      isTelegram,
      isReady,
      initData,
      colorScheme,
      expand,
      close,
      hapticSuccess,
      hapticError,
      showMainButton,
      hideMainButton,
      showBackButton,
      hideBackButton,
    }),
    [
      isTelegram,
      isReady,
      initData,
      colorScheme,
      expand,
      close,
      hapticSuccess,
      hapticError,
      showMainButton,
      hideMainButton,
      showBackButton,
      hideBackButton,
    ],
  );

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }
  return context;
}
