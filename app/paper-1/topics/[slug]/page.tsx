import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicLesson } from "@/app/components/paper1-learning/LessonPage";
import { TopicPreview } from "@/app/components/paper1-learning/TopicPreview";
import { getPaper1Catalog, getPaper1ReleaseStates, resolvePaper1Locale, type PageQuery } from "@/app/lib/paper1/catalog";
import { getPaper1Lesson } from "@/app/lib/paper1/lesson-registry";

export const dynamicParams = false;
export function generateStaticParams() { return getPaper1Catalog().topics.map((topic) => ({ slug: topic.slug })); }

export async function generateMetadata({ params, searchParams }: { readonly params: Promise<{ slug: string }>; readonly searchParams: Promise<PageQuery> }): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = resolvePaper1Locale(query);
  const topic = getPaper1Catalog().topics.find((entry) => entry.slug === slug);
  return topic ? { title: topic.title[locale], description: topic.summary[locale] } : {};
}

export default async function Paper1TopicPage({ params, searchParams }: { readonly params: Promise<{ slug: string }>; readonly searchParams: Promise<PageQuery> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const catalog = getPaper1Catalog();
  const topic = catalog.topics.find((entry) => entry.slug === slug);
  if (!topic) notFound();
  const locale = resolvePaper1Locale(query);
  if (getPaper1ReleaseStates()[slug] !== "available") return <TopicPreview catalog={catalog} topic={topic} locale={locale} />;
  const lesson = await getPaper1Lesson(slug);
  if (!lesson || lesson.lessonId !== topic.lessonId || lesson.slug !== topic.slug) throw new Error(`Paper 1 release contract mismatch for ${slug}`);
  return <TopicLesson lesson={lesson} catalog={catalog} locale={locale} />;
}
