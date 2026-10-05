import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createStudentProgressScope,
  isValidStudentProgressScope,
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
  const publicPreview = process.env.ALGOCORE_PUBLIC_PREVIEW === "true";

  const withProgressScope = (response: NextResponse) => {
    const progressScope = request.cookies.get(STUDENT_PROGRESS_SCOPE_COOKIE)?.value;
    if (!isValidStudentProgressScope(progressScope)) {
      response.cookies.set(STUDENT_PROGRESS_SCOPE_COOKIE, createStudentProgressScope(), studentProgressScopeCookieOptions);
    }
    return response;
  };

  if (request.nextUrl.pathname === "/login") {
    if (hasValidSession || publicPreview) {
      const redirectTo = safeLearningPath(request.nextUrl.searchParams.get("next"), locale);
      return withProgressScope(NextResponse.redirect(new URL(redirectTo, request.url)));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!hasValidSession) {
    if (publicPreview) {
      return withProgressScope(NextResponse.next({ request: { headers: requestHeaders } }));
    }
    const loginUrl = new URL("/login", request.url);
    const requestedPath = safeLearningPath(`${request.nextUrl.pathname}${request.nextUrl.search}`, locale);
    loginUrl.searchParams.set("next", requestedPath);
    loginUrl.searchParams.set("lang", locale);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(STUDENT_SESSION_COOKIE, "", { ...studentSessionCookieOptions, maxAge: 0 });
    response.cookies.set(STUDENT_PROGRESS_SCOPE_COOKIE, "", { ...studentProgressScopeCookieOptions, maxAge: 0 });
    return response;
  }

  return withProgressScope(NextResponse.next({ request: { headers: requestHeaders } }));
}

export const config = {
  matcher: ["/", "/login", "/paper-1/:path*"],
};

