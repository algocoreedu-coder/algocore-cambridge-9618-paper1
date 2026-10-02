import type { Metadata } from "next";
import { ChapterPractice } from "@/app/components/paper1-learning/ChapterPractice";
import { resolvePaper1Locale, type PageQuery } from "@/app/lib/paper1/catalog";
import { getPaper1ChapterPractice } from "@/app/lib/paper1/practice-registry";

export const metadata: Metadata = { title: "Chapter 1 mixed revision" };

export default async function Paper1PracticePage({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  return <ChapterPractice practice={getPaper1ChapterPractice()} locale={resolvePaper1Locale(await searchParams)} />;
}
