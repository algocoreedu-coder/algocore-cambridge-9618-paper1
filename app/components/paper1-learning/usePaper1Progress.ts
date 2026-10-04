"use client";

import { useEffect, useRef, useState } from "react";
import type { Paper1ProgressContract } from "@/app/lib/paper1/progress-contract";
import type { Paper1Topic } from "@/app/lib/paper1/types";
import {
  PAPER1_PROGRESS_EVENT,
  projectPaper1LearnerProgress,
  readPaper1ProgressEnvelope,
  readPaper1ProgressScope,
  readPaper1StageProgress,
  type Paper1LearnerProgress,
} from "./paper1-progress";

export function usePaper1Progress(topics: readonly Paper1Topic[], contracts: Readonly<Record<string, Paper1ProgressContract>>) {
  const [progress, setProgress] = useState<Readonly<Record<string, Paper1LearnerProgress>>>({});
  const topicsRef = useRef(topics);
  const contractsRef = useRef(contracts);
  topicsRef.current = topics;
  contractsRef.current = contracts;
  const progressContractSignature = topics.map((topic) => {
    const contract = contracts[topic.lessonId];
    if (!contract) return `${topic.lessonId}:missing`;
    return `${topic.lessonId}:${contract.assessmentVersion}:${contract.assessmentIds.join(",")}:${contract.assessmentReviewRules.map((rule) => `${rule.id}=${rule.reviewKind}`).join(",")}`;
  }).join("|");

  useEffect(() => {
    const refresh = () => {
      const scope = readPaper1ProgressScope();
      setProgress(Object.fromEntries(topicsRef.current.map((topic) => {
        const contract = contractsRef.current[topic.lessonId];
        if (!contract) return [topic.lessonId, projectPaper1LearnerProgress()] as const;
        return [topic.lessonId, projectPaper1LearnerProgress(
          readPaper1ProgressEnvelope(scope, topic.lessonId, contract.assessmentVersion, contract.assessmentIds, contract.assessmentReviewRules),
          readPaper1StageProgress(scope, topic.lessonId),
        )] as const;
      })));
    };
    refresh();
    window.addEventListener(PAPER1_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(PAPER1_PROGRESS_EVENT, refresh); window.removeEventListener("storage", refresh); };
  // Server-derived arrays may be recreated by a client parent on every render.
  // The primitive signature changes only when the progress contract changes,
  // preventing refresh() -> setProgress() from retriggering this effect forever.
  }, [progressContractSignature]);

  return progress;
}

export function paper1ProgressLabel(status: Paper1LearnerProgress["status"], locale: "en" | "vi") {
  if (status === "reviewed") return locale === "vi" ? "Đã ôn và đối chiếu" : "Reviewed";
  if (status === "in-progress") return locale === "vi" ? "Đang học" : "In progress";
  return locale === "vi" ? "Chưa bắt đầu" : "Not started";
}
