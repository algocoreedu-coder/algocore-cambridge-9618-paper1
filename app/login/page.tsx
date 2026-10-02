import type { Metadata } from "next";

import { safeLearningPath } from "@/app/lib/auth";

import { LoginForm } from "./LoginForm";
import { LoginLanguageSwitch } from "./LoginLanguageSwitch";
import styles from "./LoginPage.module.css";

type LoginLocale = "en" | "vi";
type LoginSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function resolveLocale(value: string | string[] | undefined): LoginLocale {
  return firstValue(value) === "vi" ? "vi" : "en";
}

function loginHref(locale: LoginLocale, nextPath: string): string {
  return `/login?${new URLSearchParams({ lang: locale, next: safeLearningPath(nextPath, locale) }).toString()}`;
}

const copy = {
  en: {
    language: "Choose language",
    eyebrow: "CAMBRIDGE 9618 · PAPER 1 · 2026",
    title: "Student sign in",
    description: "Use the class account provided by your teacher to continue your A Level Computer Science revision.",
    support: "If you cannot sign in, ask your teacher to check the class account.",
    access: "Student learning access",
  },
  vi: {
    language: "Chọn ngôn ngữ",
    eyebrow: "CAMBRIDGE 9618 · PAPER 1 · 2026",
    title: "Đăng nhập học sinh",
    description: "Hãy dùng tài khoản lớp do giáo viên cung cấp để tiếp tục ôn tập A Level Computer Science.",
    support: "Nếu chưa đăng nhập được, em hãy nhờ giáo viên kiểm tra lại tài khoản lớp.",
    access: "Khu vực học tập của học sinh",
  },
} as const;

export async function generateMetadata({
  searchParams,
}: Readonly<{ searchParams: Promise<LoginSearchParams> }>): Promise<Metadata> {
  const locale = resolveLocale((await searchParams).lang);
  return {
    title: locale === "vi" ? "Đăng nhập học sinh · AlgoCore Education" : "Student sign in · AlgoCore Education",
    description: locale === "vi"
      ? "Đăng nhập để học Cambridge A Level Computer Science cùng AlgoCore."
      : "Sign in to AlgoCore Cambridge A Level Computer Science learning.",
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<LoginSearchParams> }>) {
  const query = await searchParams;
  const locale = resolveLocale(query.lang);
  const nextPath = safeLearningPath(firstValue(query.next), locale);
  const initialError = firstValue(query.error) === "invalid" ? "invalid" : firstValue(query.error) === "unavailable" ? "unavailable" : null;
  const text = copy[locale];

  return <main className={styles.page}>
    <section className={styles.card} aria-labelledby="login-title">
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/algocore-logo.png" alt="AlgoCore Education" width="775" height="276" />
        </div>
        <script dangerouslySetInnerHTML={{ __html: "document.addEventListener('click',function(e){var t=e.target;var a=t&&t.closest?t.closest('[data-login-language-switch] a[href]'):null;if(!a||!location.hash)return;var u=new URL(a.href,location.href);u.hash=location.hash;a.href=u.pathname+u.search+u.hash;},true);" }} />
        <LoginLanguageSwitch
          label={text.language}
          locale={locale}
          options={[
            { locale: "en", label: "English", href: loginHref("en", nextPath) },
            { locale: "vi", label: "Tiếng Việt", href: loginHref("vi", nextPath) },
          ]}
        />
      </header>

      <div className={styles.content}>
        <div className={styles.introduction}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h1 id="login-title">{text.title}</h1>
          <p>{text.description}</p>
          <p className={styles.accessNote}>{text.access}</p>
        </div>
        <LoginForm locale={locale} nextPath={nextPath} initialError={initialError} />
      </div>

      <footer className={styles.footer}>{text.support}</footer>
    </section>
  </main>;
}

