import { NextResponse } from "next/server";
import {
  createStudentSessionToken,
  createStudentProgressScope,
  isSameOriginPost,
  safeLearningPath,
  studentAuthIsConfigured,
  STUDENT_SESSION_COOKIE,
  STUDENT_PROGRESS_SCOPE_COOKIE,
  studentProgressScopeCookieOptions,
  studentSessionCookieOptions,
  validateStudentCredentials,
} from "@/app/lib/auth";

type LoginRequestBody = { username?: unknown; password?: unknown; next?: unknown; lang?: unknown };

const MAX_BODY_BYTES = 4_096;
const MAX_CREDENTIAL_LENGTH = 128;
const MAX_FAILED_ATTEMPTS = 30;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1_000;
let failedAttemptWindow = { count: 0, resetAt: 0 };

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function attemptState(now = Date.now()) {
  if (failedAttemptWindow.resetAt <= now) {
    failedAttemptWindow = { count: 0, resetAt: now + ATTEMPT_WINDOW_MS };
  }
  return failedAttemptWindow;
}

async function readLoginBody(request: Request): Promise<LoginRequestBody | null> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return null;

  const reader = request.body?.getReader();
  if (!reader) return {};
  const decoder = new TextDecoder();
  let rawBody = "";
  let bytesRead = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    rawBody += decoder.decode(value, { stream: true });
  }
  rawBody += decoder.decode();
  if ((request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/x-www-form-urlencoded")) {
    const fields = new URLSearchParams(rawBody);
    return {
      username: fields.get("username"),
      password: fields.get("password"),
      next: fields.get("next"),
      lang: fields.get("lang"),
    };
  }
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as LoginRequestBody;
  } catch {
    return {};
  }
}

function formError(body: LoginRequestBody, error: "invalid" | "unavailable") {
  const locale = body.lang === "vi" ? "vi" : "en";
  const next = safeLearningPath(body.next, locale);
  const location = `/login?${new URLSearchParams({ lang: locale, next, error }).toString()}`;
  return new NextResponse(null, {
    status: 303,
    headers: { "Cache-Control": "no-store", Location: location },
  });
}

export async function POST(request: Request) {
  if (!isSameOriginPost(request)) return jsonError("Request was rejected.", 403);

  const isFormSubmission = (request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/x-www-form-urlencoded");
  const body = await readLoginBody(request);
  if (!body) return isFormSubmission ? formError({}, "unavailable") : jsonError("Sign-in request is too large.", 413);

  const attempts = attemptState();
  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    const retryAfter = Math.max(1, Math.ceil((attempts.resetAt - Date.now()) / 1_000));
    if (isFormSubmission) return formError(body, "unavailable");
    return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) },
    });
  }

  if (!studentAuthIsConfigured()) return isFormSubmission ? formError(body, "unavailable") : jsonError("Authentication service is not configured.", 503);
  if (
    typeof body.username !== "string"
    || typeof body.password !== "string"
    || body.username.length > MAX_CREDENTIAL_LENGTH
    || body.password.length > MAX_CREDENTIAL_LENGTH
    || !validateStudentCredentials(body.username, body.password)
  ) {
    attempts.count += 1;
    return isFormSubmission ? formError(body, "invalid") : jsonError("Invalid username or password.", 401);
  }

  failedAttemptWindow = { count: 0, resetAt: 0 };

  const redirectTo = safeLearningPath(body.next, body.lang);
  const response = isFormSubmission
    ? new NextResponse(null, { status: 303, headers: { "Cache-Control": "no-store", Location: redirectTo } })
    : NextResponse.json({ redirectTo }, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  response.cookies.set(STUDENT_SESSION_COOKIE, createStudentSessionToken(), studentSessionCookieOptions);
  response.cookies.set(STUDENT_PROGRESS_SCOPE_COOKIE, createStudentProgressScope(), studentProgressScopeCookieOptions);
  return response;
}
