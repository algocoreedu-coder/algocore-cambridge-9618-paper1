import type { Paper1Lesson } from "./types";

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  "units-and-magnitudes": () => import("@/content/paper1/lessons/units-and-magnitudes.json"),
  "number-systems": () => import("@/content/paper1/lessons/number-systems.json"),
  "signed-arithmetic": () => import("@/content/paper1/lessons/signed-arithmetic.json"),
  "character-encoding": () => import("@/content/paper1/lessons/character-encoding.json"),
  "bitmap-storage": () => import("@/content/paper1/lessons/bitmap-storage.json"),
  "vector-graphics": () => import("@/content/paper1/lessons/vector-graphics.json"),
  "sound-sampling": () => import("@/content/paper1/lessons/sound-sampling.json"),
  "compression": () => import("@/content/paper1/lessons/compression.json"),
};

export async function getPaper1Lesson(slug: string): Promise<Paper1Lesson | undefined> {
  const loader = loaders[slug];
  return loader ? (await loader()).default as Paper1Lesson : undefined;
}

export const implementedPaper1Slugs = Object.freeze(Object.keys(loaders));
