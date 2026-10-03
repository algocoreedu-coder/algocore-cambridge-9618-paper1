import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterPractice } from "@/app/components/paper1-learning/ChapterPractice";
import { resolvePaper1Locale, type PageQuery } from "@/app/lib/paper1/catalog";
import { getPaper1ChapterPractice, implementedPaper1PracticeChapterIds } from "@/app/lib/paper1/practice-registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return implementedPaper1PracticeChapterIds.map((chapterId) => ({ chapterId }));
}

export async function generateMetadata({ params, searchParams }: { readonly params: Promise<{ chapterId: string }>; readonly searchParams: Promise<PageQuery> }): Promise<Metadata> {
  const [{ chapterId }, query] = await Promise.all([params, searchParams]);
  const practice = await getPaper1ChapterPractice(chapterId);
  return practice ? { title: practice.title[resolvePaper1Locale(query)] } : {};
}

export default async function Paper1ChapterPracticePage({ params, searchParams }: { readonly params: Promise<{ chapterId: string }>; readonly searchParams: Promise<PageQuery> }) {
  const [{ chapterId }, query] = await Promise.all([params, searchParams]);
  const practice = await getPaper1ChapterPractice(chapterId);
  if (!practice) notFound();
  return <ChapterPractice practice={practice} locale={resolvePaper1Locale(query)} />;
}
