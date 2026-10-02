"use client";

import { useEffect, useState } from "react";
import type { Paper1Topic } from "@/app/lib/paper1/types";
import {
  PAPER1_PROGRESS_EVENT,
  projectPaper1LearnerProgress,
  readPaper1ProgressEnvelope,
  readPaper1ProgressScope,
  readPaper1StageProgress,
  type Paper1LearnerProgress,
} from "./paper1-progress";

export function usePaper1Progress(topics: readonly Paper1Topic[]) {
  const [progress, setProgress] = useState<Readonly<Record<string, Paper1LearnerProgress>>>({});

  useEffect(() => {
    const refresh = () => {
      const scope = readPaper1ProgressScope();
      setProgress(Object.fromEntries(topics.map((topic) => [topic.lessonId, projectPaper1LearnerProgress(
        readPaper1ProgressEnvelope(scope, topic.lessonId),
        readPaper1StageProgress(scope, topic.lessonId),
      )])));
    };
    refresh();
    window.addEventListener(PAPER1_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(PAPER1_PROGRESS_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [topics]);

  return progress;
}

export function paper1ProgressLabel(status: Paper1LearnerProgress["status"], locale: "en" | "vi") {
  if (status === "reviewed") return locale === "vi" ? "Đã ôn và đối chiếu" : "Reviewed";
  if (status === "in-progress") return locale === "vi" ? "Đang học" : "In progress";
  return locale === "vi" ? "Chưa bắt đầu" : "Not started";
}
