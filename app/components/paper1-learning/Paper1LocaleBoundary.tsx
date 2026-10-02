"use client";

import { useEffect } from "react";
import { localeChangeEvent } from "@/app/AppProviders";
import type { Paper1Locale } from "@/app/lib/paper1/types";

export function Paper1LocaleBoundary({ locale }: { readonly locale: Paper1Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    window.dispatchEvent(new CustomEvent(localeChangeEvent, { detail: locale }));
  }, [locale]);
  return null;
}
