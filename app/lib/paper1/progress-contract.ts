import type { Paper1Assessment, Paper1Lesson } from "./types";

export type Paper1AssessmentReviewRule = {
  readonly id: string;
  readonly reviewKind: "deterministic" | "self-review";
};

export type Paper1ProgressContract = {
  readonly lessonId: string;
  readonly assessmentVersion: string;
  readonly assessmentIds: readonly string[];
  readonly assessmentReviewRules: readonly Paper1AssessmentReviewRule[];
};

export function paper1AssessmentReviewKind(assessment: Paper1Assessment): Paper1AssessmentReviewRule["reviewKind"] {
  return ["explain", "compare", "justify"].includes(assessment.kind) ? "self-review" : "deterministic";
}

export function paper1ProgressContractFromLesson(lesson: Paper1Lesson): Paper1ProgressContract {
  return {
    lessonId: lesson.lessonId,
    assessmentVersion: lesson.assessmentVersion,
    assessmentIds: lesson.assessments.map((assessment) => assessment.id),
    assessmentReviewRules: lesson.assessments.map((assessment) => ({
      id: assessment.id,
      reviewKind: paper1AssessmentReviewKind(assessment),
    })),
  };
}
