"use client";

import { RootProvider } from "fumadocs-ui/provider/next";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

export type LearningLocale = "en" | "vi";

export const localeChangeEvent = "algocore:locale-change";
const LearningLocaleContext = createContext<LearningLocale>("en");

export function useLearningLocale(): LearningLocale {
  return useContext(LearningLocaleContext);
}

const viTranslations = {
  "On this page(table of contents)": "Trong bài này",
  "Toggle Theme(theme switcher)(aria-label)": "Đổi giao diện sáng tối",
  "Collapse Sidebar(sidebar)(aria-label)": "Thu gọn điều hướng",
  "Open Sidebar(sidebar)(aria-label)": "Mở điều hướng",
  "Close Sidebar(sidebar)(aria-label)": "Đóng điều hướng",
};

function localeFromLocation(fallback: LearningLocale): LearningLocale {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get("lang") === "vi" ? "vi" : "en";
}

export function AppProviders({
  children,
  initialLocale,
}: {
  readonly children: ReactNode;
  readonly initialLocale: LearningLocale;
}) {
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const navigateLearningRoute = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download") || anchor.hasAttribute("data-locale-switch")) return;
      const url = new URL(anchor.href, window.location.href);
      const isLearningRoute = /^\/paper-1(?:\/|$)/.test(url.pathname);
      if (url.origin !== window.location.origin || !isLearningRoute) return;
      if (url.searchParams.get("lang") !== locale) url.searchParams.set("lang", locale);
      anchor.href = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
      const current = new URL(window.location.href);
      if (url.pathname === current.pathname && url.search === current.search) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(anchor.href);
    };
    document.addEventListener("click", navigateLearningRoute, true);
    return () => document.removeEventListener("click", navigateLearningRoute, true);
  }, [locale]);

  useEffect(() => {
    const updateFromHistory = () => setLocale(localeFromLocation(initialLocale));
    const updateFromLesson = (event: Event) => {
      const requested = (event as CustomEvent<LearningLocale>).detail;
      setLocale(requested === "vi" ? "vi" : "en");
    };
    window.addEventListener("popstate", updateFromHistory);
    window.addEventListener(localeChangeEvent, updateFromLesson);
    return () => {
      window.removeEventListener("popstate", updateFromHistory);
      window.removeEventListener(localeChangeEvent, updateFromLesson);
    };
  }, [initialLocale]);

  return <LearningLocaleContext.Provider value={locale}>
    <RootProvider
      search={{ enabled: false }}
      theme={{ defaultTheme: "light" }}
      i18n={{ locale, translations: locale === "vi" ? viTranslations : {} }}
    >
      {children}
    </RootProvider>
  </LearningLocaleContext.Provider>;
}

