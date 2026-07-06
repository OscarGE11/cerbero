"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type TelegramWebApp = typeof import("@twa-dev/sdk").default;

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

function applyThemeParams(webApp: TelegramWebApp) {
  const params = webApp.themeParams;
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
  const webAppRef = useRef<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [initData, setInitData] = useState("");
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    let cancelled = false;
    let removeThemeListener: (() => void) | undefined;

    void import("@twa-dev/sdk").then(({ default: WebApp }) => {
      if (cancelled) return;

      webAppRef.current = WebApp;
      const inTelegram = Boolean(WebApp.initData);
      setIsTelegram(inTelegram);

      if (inTelegram) {
        WebApp.ready();
        WebApp.expand();
        applyThemeParams(WebApp);
        setInitData(WebApp.initData);
        setColorScheme(WebApp.colorScheme === "light" ? "light" : "dark");

        const onThemeChanged = () => {
          applyThemeParams(WebApp);
          setColorScheme(WebApp.colorScheme === "light" ? "light" : "dark");
        };

        WebApp.onEvent("themeChanged", onThemeChanged);
        removeThemeListener = () => {
          WebApp.offEvent("themeChanged", onThemeChanged);
        };
      }

      setIsReady(true);
    });

    return () => {
      cancelled = true;
      removeThemeListener?.();
      const webApp = webAppRef.current;
      if (webApp) {
        webApp.MainButton.hide();
        webApp.BackButton.hide();
      }
    };
  }, []);

  const expand = useCallback(() => {
    if (isTelegram) webAppRef.current?.expand();
  }, [isTelegram]);

  const close = useCallback(() => {
    if (isTelegram) webAppRef.current?.close();
  }, [isTelegram]);

  const hapticSuccess = useCallback(() => {
    if (isTelegram) {
      webAppRef.current?.HapticFeedback.notificationOccurred("success");
    }
  }, [isTelegram]);

  const hapticError = useCallback(() => {
    if (isTelegram) {
      webAppRef.current?.HapticFeedback.notificationOccurred("error");
    }
  }, [isTelegram]);

  const showMainButton = useCallback(
    (text: string, onClick: () => void) => {
      const webApp = webAppRef.current;
      if (!isTelegram || !webApp) return;
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    },
    [isTelegram],
  );

  const hideMainButton = useCallback(() => {
    const webApp = webAppRef.current;
    if (isTelegram && webApp) {
      webApp.MainButton.hide();
      webApp.MainButton.offClick(() => undefined);
    }
  }, [isTelegram]);

  const showBackButton = useCallback(
    (onClick: () => void) => {
      const webApp = webAppRef.current;
      if (!isTelegram || !webApp) return;
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    },
    [isTelegram],
  );

  const hideBackButton = useCallback(() => {
    const webApp = webAppRef.current;
    if (isTelegram && webApp) {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(() => undefined);
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
