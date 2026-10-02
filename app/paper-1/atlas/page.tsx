import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterAtlas } from "@/app/components/paper1-learning/ChapterAtlas";
import { resolvePaper1Locale, type PageQuery } from "@/app/lib/paper1/catalog";
import { getPaper1LearnerAtlasItem } from "@/app/lib/paper1/visual-placement-registry";

export const metadata: Metadata = { title: "Chapter 1 visual atlas" };

export default async function Paper1AtlasPage({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  const query = await searchParams;
  const raw = Array.isArray(query.visual) ? query.visual[0] : query.visual;
  if (raw && !getPaper1LearnerAtlasItem(raw)) notFound();
  return <ChapterAtlas locale={resolvePaper1Locale(query)} initialVisual={raw} />;
}
