import { StudyMap } from "@/app/components/paper1-learning/StudyMap";
import { getPaper1Catalog, getPaper1ReleaseStates, resolvePaper1Locale, type PageQuery } from "@/app/lib/paper1/catalog";

export default async function Paper1Page({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  return <StudyMap catalog={getPaper1Catalog()} releaseStates={getPaper1ReleaseStates()} locale={resolvePaper1Locale(await searchParams)} />;
}
