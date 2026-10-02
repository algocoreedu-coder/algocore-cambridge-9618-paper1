import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const STUDENT_SESSION_COOKIE = "algocore_student_session";
export const STUDENT_PROGRESS_SCOPE_COOKIE = "algocore_progress_scope";
export const STUDENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

const TOKEN_VERSION = "v1";
const MINIMUM_SESSION_SECRET_LENGTH = 32;
const ALLOWED_PATH_PREFIXES = ["/paper-1"] as const;
const ENCODED_SEPARATOR_OR_CONTROL = /%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i;
const RAW_CONTROL = /[\u0000-\u001f\u007f]/;

type AuthConfiguration = { username: string; password: string; sessionSecret: string };

function readAuthConfiguration(): AuthConfiguration | null {
  const username = process.env.ALGOCORE_STUDENT_USERNAME;
  const password = process.env.ALGOCORE_STUDENT_PASSWORD;
  const sessionSecret = process.env.ALGOCORE_SESSION_SECRET;
  if (!username || !password || !sessionSecret || Buffer.byteLength(sessionSecret, "utf8") < MINIMUM_SESSION_SECRET_LENGTH) return null;
  return { username, password, sessionSecret };
}

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

function constantTimeStringEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload, "utf8").digest();
}

export function studentAuthIsConfigured() {
  return readAuthConfiguration() !== null;
}

export function validateStudentCredentials(username: string, password: string) {
  const configuration = readAuthConfiguration();
  if (!configuration) return false;
  const usernameMatches = constantTimeStringEqual(username, configuration.username);
  const passwordMatches = constantTimeStringEqual(password, configuration.password);
  return usernameMatches && passwordMatches;
}

export function createStudentSessionToken(now = Date.now()) {
  const configuration = readAuthConfiguration();
  if (!configuration) throw new Error("Student authentication is not configured.");
  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + STUDENT_SESSION_MAX_AGE_SECONDS;
  const nonce = randomBytes(18).toString("base64url");
  const payload = `${TOKEN_VERSION}.${issuedAt}.${expiresAt}.${nonce}`;
  const signature = sign(payload, configuration.sessionSecret).toString("base64url");
  return `${payload}.${signature}`;
}

export function createStudentProgressScope() {
  const configuration = readAuthConfiguration();
  if (!configuration) throw new Error("Student authentication is not configured.");
  return createHmac("sha256", configuration.sessionSecret)
    .update(`progress:${configuration.username}`, "utf8")
    .digest("base64url")
    .slice(0, 22);
}

export function verifyStudentSessionToken(token: string | undefined, now = Date.now()) {
  const configuration = readAuthConfiguration();
  if (!configuration || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 5) return false;

  const [version, issuedAtValue, expiresAtValue, nonce, encodedSignature] = parts;
  const issuedAt = Number(issuedAtValue);
  const expiresAt = Number(expiresAtValue);
  const nowSeconds = Math.floor(now / 1000);
  if (
    version !== TOKEN_VERSION ||
    !Number.isSafeInteger(issuedAt) ||
    !Number.isSafeInteger(expiresAt) ||
    issuedAt > nowSeconds + 60 ||
    expiresAt <= nowSeconds ||
    expiresAt - issuedAt !== STUDENT_SESSION_MAX_AGE_SECONDS ||
    !/^[A-Za-z0-9_-]{24}$/.test(nonce) ||
    !/^[A-Za-z0-9_-]{43}$/.test(encodedSignature)
  ) return false;

  let suppliedSignature: Buffer;
  try {
    suppliedSignature = Buffer.from(encodedSignature, "base64url");
  } catch {
    return false;
  }
  if (suppliedSignature.toString("base64url") !== encodedSignature) return false;
  const expectedSignature = sign(`${version}.${issuedAtValue}.${expiresAtValue}.${nonce}`, configuration.sessionSecret);
  return suppliedSignature.length === expectedSignature.length && timingSafeEqual(suppliedSignature, expectedSignature);
}

export function safeInternalPath(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    ENCODED_SEPARATOR_OR_CONTROL.test(value) ||
    RAW_CONTROL.test(value)
  ) return "/";

  try {
    const baseUrl = new URL("http://algocore.internal");
    const destination = new URL(value, baseUrl);
    const pathIsAllowed = destination.pathname === "/" || ALLOWED_PATH_PREFIXES.some(
      (prefix) => destination.pathname === prefix || destination.pathname.startsWith(`${prefix}/`),
    );
    if (destination.origin !== baseUrl.origin || !pathIsAllowed) return "/";
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/";
  }
}

export function safeLearningPath(value: unknown, requestedLanguage: unknown = "en") {
  const language = requestedLanguage === "vi" ? "vi" : "en";
  const candidate = safeInternalPath(value);
  if (candidate === "/") return `/paper-1?lang=${language}`;

  const destination = new URL(candidate, "http://algocore.internal");
  if (destination.pathname === "/paper-1" || destination.pathname.startsWith("/paper-1/")) {
    destination.searchParams.set("lang", language);
  }
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function isSameOriginPost(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    if (originUrl.origin === requestUrl.origin) return true;
    const host = request.headers.get("host");
    return Boolean(host) && originUrl.origin === `${requestUrl.protocol}//${host}`;
  } catch {
    return false;
  }
}

const secureCookieSetting = process.env.ALGOCORE_COOKIE_SECURE;
const secureCookie = process.env.NODE_ENV === "production" && secureCookieSetting !== "false";
export const studentSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: secureCookie,
  path: "/",
  maxAge: STUDENT_SESSION_MAX_AGE_SECONDS,
};
export const studentProgressScopeCookieOptions = {
  ...studentSessionCookieOptions,
  httpOnly: false,
};

