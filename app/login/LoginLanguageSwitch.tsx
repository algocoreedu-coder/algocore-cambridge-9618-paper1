"use client";

import type { MouseEvent } from "react";

import { LanguageSwitch, type LanguageOption } from "@/app/components/algocore-ui";

import styles from "./LoginPage.module.css";

type LoginLocale = "en" | "vi";

export function LoginLanguageSwitch({
  label,
  locale,
  options,
}: Readonly<{
  label: string;
  locale: LoginLocale;
  options: readonly LanguageOption[];
}>) {
  function preserveDeepLink(event: MouseEvent<HTMLSpanElement>) {
    if (!window.location.hash) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest("a");
    const href = link?.getAttribute("href");
    if (!href) return;

    event.preventDefault();
    const destination = new URL(href, window.location.href);
    destination.hash = window.location.hash;
    window.location.assign(`${destination.pathname}${destination.search}${destination.hash}`);
  }

  return <span className={styles.languageSwitchGuard} data-login-language-switch onClickCapture={preserveDeepLink}>
    <LanguageSwitch label={label} locale={locale} options={options} />
  </span>;
}
