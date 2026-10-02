"use client";

import Link from "next/link";
import { useLearningLocale } from "@/app/AppProviders";

export default function Paper1NotFound() {
  const locale = useLearningLocale();
  return <section className="mx-auto w-full max-w-3xl p-6 py-16" data-paper1-not-found><p className="mb-3 font-semibold">Paper 1 · 404</p><h1 className="mb-4 text-3xl font-bold">{locale === "vi" ? "Không tìm thấy mục này" : "This page was not found"}</h1><p className="mb-6">{locale === "vi" ? "Quay về Study Map để chọn section hoặc bài học có trong khóa học." : "Return to the Study Map to choose a section or lesson in this course."}</p><Link className="inline-flex min-h-11 items-center rounded-lg border px-4 font-semibold underline underline-offset-4" href={`/paper-1?lang=${locale}`}>{locale === "vi" ? "Về Study Map" : "Back to Study Map"}</Link></section>;
}
