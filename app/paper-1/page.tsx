import { StudyMap } from "@/app/components/paper1-learning/StudyMap";
import { getPaper1Catalog, getPaper1ProgressContracts, getPaper1ReleaseStates, resolvePaper1Locale, type PageQuery } from "@/app/lib/paper1/catalog";

export default async function Paper1Page({ searchParams }: { readonly searchParams: Promise<PageQuery> }) {
  const catalog = getPaper1Catalog();
  const [query, progressContracts] = await Promise.all([searchParams, getPaper1ProgressContracts(catalog.topics)]);
  return <StudyMap catalog={catalog} releaseStates={getPaper1ReleaseStates()} progressContracts={progressContracts} locale={resolvePaper1Locale(query)} />;
}
