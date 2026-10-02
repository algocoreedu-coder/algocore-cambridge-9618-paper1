import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createStudentProgressScope,
  safeLearningPath,
  STUDENT_SESSION_COOKIE,
  STUDENT_PROGRESS_SCOPE_COOKIE,
  studentProgressScopeCookieOptions,
  studentSessionCookieOptions,
  verifyStudentSessionToken,
} from "./app/lib/auth";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const locale = request.nextUrl.searchParams.get("lang") === "vi" ? "vi" : "en";
  requestHeaders.set("x-algocore-locale", locale);

  const sessionToken = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
  const hasValidSession = verifyStudentSessionToken(sessionToken);

  if (request.nextUrl.pathname === "/login") {
    if (hasValidSession) {
      const redirectTo = safeLearningPath(request.nextUrl.searchParams.get("next"), locale);
      const response = NextResponse.redirect(new URL(redirectTo, request.url));
      response.cookies.set(STUDENT_PROGRESS_SCOPE_COOKIE, createStudentProgressScope(), studentProgressScopeCookieOptions);
      return response;
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    const requestedPath = safeLearningPath(`${request.nextUrl.pathname}${request.nextUrl.search}`, locale);
    loginUrl.searchParams.set("next", requestedPath);
    loginUrl.searchParams.set("lang", locale);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(STUDENT_SESSION_COOKIE, "", { ...studentSessionCookieOptions, maxAge: 0 });
    response.cookies.set(STUDENT_PROGRESS_SCOPE_COOKIE, "", { ...studentProgressScopeCookieOptions, maxAge: 0 });
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const expectedProgressScope = createStudentProgressScope();
  if (request.cookies.get(STUDENT_PROGRESS_SCOPE_COOKIE)?.value !== expectedProgressScope) {
    response.cookies.set(STUDENT_PROGRESS_SCOPE_COOKIE, expectedProgressScope, studentProgressScopeCookieOptions);
  }
  return response;
}

export const config = {
  matcher: ["/", "/login", "/paper-1/:path*"],
};

