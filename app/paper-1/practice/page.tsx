import type { Metadata } from "next";
import { ChapterPractice } from "@/app/components/paper1-learning/ChapterPractice";
import { resolvePaper1Locale, type PageQuery } from "@/app/lib/paper1/catalog";
import { getPaper1ChapterPractice } from "@/app/lib/paper1/practice-registry";

export const metadata: Metadata = { title: "Chapter 1 mixed revision" };

export default async function Paper1PracticePage({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  const practice = await getPaper1ChapterPractice("1");
  if (!practice) throw new Error("Paper 1 Chapter 1 practice is unavailable");
  return <ChapterPractice practice={practice} locale={resolvePaper1Locale(await searchParams)} />;
}
