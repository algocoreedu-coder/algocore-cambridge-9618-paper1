import catalogData from "@/content/paper1/catalog.json";
import releaseData from "@/content/paper1/release-manifest.json";
import type { Paper1Catalog, Paper1Locale, Paper1ReleaseManifest, Paper1ReleaseState } from "./types";

export type PageQuery = Record<string, string | string[] | undefined>;

export function resolvePaper1Locale(query: PageQuery): Paper1Locale {
  const value = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  return value === "vi" ? "vi" : "en";
}

export function getPaper1Catalog(): Paper1Catalog {
  const catalog = catalogData as Paper1Catalog;
  const releaseStates = getPaper1ReleaseStates();
  return {
    ...catalog,
    sections: catalog.sections.map((section) => {
      const topics = catalog.topics.filter((topic) => topic.sectionId === section.id);
      const available = topics.length > 0 && topics.every((topic) => releaseStates[topic.slug] === "available");
      return { ...section, status: available ? "available" : "planned" };
    }),
  };
}

export function getPaper1ReleaseManifest(): Paper1ReleaseManifest {
  return releaseData as Paper1ReleaseManifest;
}

export function availablePaper1Slugs(): ReadonlySet<string> {
  return new Set(getPaper1ReleaseManifest().lessons.filter((entry) => entry.state === "available").map((entry) => entry.slug));
}

export function getPaper1ReleaseStates(): Readonly<Record<string, Paper1ReleaseState>> {
  return Object.fromEntries(getPaper1ReleaseManifest().lessons.map((entry) => [entry.slug, entry.state]));
}
