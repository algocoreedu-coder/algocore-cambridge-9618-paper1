import { NextResponse } from "next/server";
import {
  isSameOriginPost,
  STUDENT_SESSION_COOKIE,
  STUDENT_PROGRESS_SCOPE_COOKIE,
  studentProgressScopeCookieOptions,
  studentSessionCookieOptions,
} from "@/app/lib/auth";

export async function POST(request: Request) {
  if (!isSameOriginPost(request)) {
    return new Response(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  let locale = "en";
  try {
    const formData = await request.formData();
    if (formData.get("lang") === "vi") locale = "vi";
  } catch {
    // A missing form body still logs the student out safely.
  }

  const response = new NextResponse(null, {
    status: 303,
    headers: {
      "Cache-Control": "no-store",
      Location: `/login?lang=${locale}`,
    },
  });
  response.cookies.set(STUDENT_SESSION_COOKIE, "", { ...studentSessionCookieOptions, maxAge: 0 });
  response.cookies.set(STUDENT_PROGRESS_SCOPE_COOKIE, "", { ...studentProgressScopeCookieOptions, maxAge: 0 });
  return response;
}
