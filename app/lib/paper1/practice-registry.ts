import practiceData from "@/content/paper1/practice/chapter-1.json";
import type { Paper1ChapterPractice } from "./types";

const practice = practiceData as Paper1ChapterPractice;

export function getPaper1ChapterPractice(): Paper1ChapterPractice {
  return practice;
}
