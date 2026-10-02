"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button, Feedback, Field } from "@/app/components/algocore-ui";
import styles from "./LoginPage.module.css";

type LoginLocale = "en" | "vi";
type LoginError = "invalid" | "unavailable" | null;

const copy = {
  en: {
    username: "Username",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in",
    invalidTitle: "Sign-in details not recognised",
    invalidMessage: "Check the class username and password, then try again.",
    unavailableTitle: "Sign in is temporarily unavailable",
    unavailableMessage: "Please wait a moment and try again. If this continues, ask your teacher for help.",
  },
  vi: {
    username: "Tên đăng nhập",
    password: "Mật khẩu",
    submit: "Đăng nhập",
    submitting: "Đang đăng nhập",
    invalidTitle: "Thông tin đăng nhập chưa đúng",
    invalidMessage: "Kiểm tra lại tên đăng nhập và mật khẩu của lớp rồi thử lại.",
    unavailableTitle: "Tạm thời chưa thể đăng nhập",
    unavailableMessage: "Em hãy đợi một chút rồi thử lại. Nếu vẫn gặp lỗi, hãy nhờ giáo viên hỗ trợ.",
  },
} as const;

function isRedirectPayload(value: unknown): value is { redirectTo: string } {
  if (!value || typeof value !== "object" || !("redirectTo" in value)) return false;
  const redirectTo = (value as { redirectTo?: unknown }).redirectTo;
  return typeof redirectTo === "string" && (
    redirectTo === "/paper-1"
    || redirectTo.startsWith("/paper-1?")
    || redirectTo.startsWith("/paper-1/")
  );
}

export function LoginForm({ locale, nextPath, initialError = null }: Readonly<{ locale: LoginLocale; nextPath: string; initialError?: LoginError }>) {
  const router = useRouter();
  const text = copy[locale];
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginError>(initialError);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, next: nextPath, lang: locale }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (response.ok && isRedirectPayload(payload)) {
        // URL fragments never reach the proxy or login API. Browsers retain the
        // original fragment on the login URL, so carry it back to the validated
        // same-origin learning route after authentication.
        const redirectTo = window.location.hash && !payload.redirectTo.includes("#")
          ? `${payload.redirectTo}${window.location.hash}`
          : payload.redirectTo;
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      setError(response.status === 401 ? "invalid" : "unavailable");
    } catch {
      setError("unavailable");
    } finally {
      setPassword("");
      setSubmitting(false);
      requestAnimationFrame(() => document.getElementById("student-password")?.focus());
    }
  }

  const errorTitle = error === "invalid" ? text.invalidTitle : text.unavailableTitle;
  const errorMessage = error === "invalid" ? text.invalidMessage : text.unavailableMessage;

  return <form className={styles.form} action="/api/auth/login" method="post" onSubmit={submit} noValidate>
    <input type="hidden" name="lang" value={locale} />
    <input type="hidden" name="next" value={nextPath} />
    {error && <Feedback status="incorrect" title={errorTitle}>{errorMessage}</Feedback>}
    <Field
      id="student-username"
      label={text.username}
      name="username"
      type="text"
      autoComplete="username"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      autoFocus
      required
      disabled={submitting}
      value={username}
      onChange={(event) => setUsername(event.currentTarget.value)}
    />
    <Field
      id="student-password"
      label={text.password}
      name="password"
      type="password"
      autoComplete="current-password"
      required
      disabled={submitting}
      value={password}
      onChange={(event) => setPassword(event.currentTarget.value)}
    />
    <Button type="submit" loading={submitting} loadingLabel={text.submitting}>
      {text.submit}
    </Button>
  </form>;
}

