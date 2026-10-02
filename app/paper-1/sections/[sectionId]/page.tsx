import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionOverview } from "@/app/components/paper1-learning/SectionOverview";
import { getPaper1Catalog, getPaper1ReleaseStates, resolvePaper1Locale, type PageQuery } from "@/app/lib/paper1/catalog";

export const dynamicParams = false;
export function generateStaticParams() { return getPaper1Catalog().sections.map((section) => ({ sectionId: section.id })); }

export async function generateMetadata({ params, searchParams }: { readonly params: Promise<{ sectionId: string }>; readonly searchParams: Promise<PageQuery> }): Promise<Metadata> {
  const [{ sectionId }, query] = await Promise.all([params, searchParams]);
  const locale = resolvePaper1Locale(query);
  const section = getPaper1Catalog().sections.find((entry) => entry.id === sectionId);
  return section ? { title: section.title[locale], description: section.summary[locale] } : {};
}

export default async function Paper1SectionPage({ params, searchParams }: { readonly params: Promise<{ sectionId: string }>; readonly searchParams: Promise<PageQuery> }) {
  const [{ sectionId }, query] = await Promise.all([params, searchParams]);
  const catalog = getPaper1Catalog();
  if (!catalog.sections.some((section) => section.id === sectionId)) notFound();
  return <SectionOverview catalog={catalog} releaseStates={getPaper1ReleaseStates()} sectionId={sectionId} locale={resolvePaper1Locale(query)} />;
}
