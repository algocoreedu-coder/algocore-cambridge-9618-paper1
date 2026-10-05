import type { Paper1ChapterPractice } from "./types";

const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  "1": () => import("@/content/paper1/practice/chapter-1.json"),
  "2": () => import("@/content/paper1/practice/chapter-2.json"),
  "3": () => import("@/content/paper1/practice/chapter-3.json"),
  "4": () => import("@/content/paper1/practice/chapter-4.json"),
  "5": () => import("@/content/paper1/practice/chapter-5.json"),
  "6": () => import("@/content/paper1/practice/chapter-6.json"),
  "7": () => import("@/content/paper1/practice/chapter-7.json"),
  "8": () => import("@/content/paper1/practice/chapter-8.json"),
};

export async function getPaper1ChapterPractice(chapterId = "1"): Promise<Paper1ChapterPractice | undefined> {
  const loader = loaders[chapterId];
  if (!loader) return undefined;
  const practice = (await loader()).default as Paper1ChapterPractice;
  return practice.chapterId === chapterId ? practice : undefined;
}

export const implementedPaper1PracticeChapterIds = Object.freeze(Object.keys(loaders));
