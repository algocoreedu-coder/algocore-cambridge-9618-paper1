import atlasData from "@/content/paper1/atlas-manifest.json";
import type { Paper1AtlasItem, Paper1AtlasManifest } from "./types";

const atlas = atlasData as Paper1AtlasManifest;

export function getPaper1AtlasItems(ids: readonly string[]): readonly Paper1AtlasItem[] {
  const requested = new Set(ids);
  return atlas.items.filter((item) => requested.has(item.id));
}

export function getPaper1AtlasItem(id: string): Paper1AtlasItem | undefined {
  return atlas.items.find((item) => item.id === id);
}
