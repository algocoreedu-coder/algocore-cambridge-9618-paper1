import type { Paper1AssessmentReviewRule } from "@/app/lib/paper1/progress-contract";

export type Paper1CheckpointState = {
  readonly draft: string;
  readonly attemptCount: number;
  readonly independentAttemptCount: number;
  readonly supportedAttemptCount: number;
  readonly hintSeen: boolean;
  readonly solutionSeen: boolean;
  readonly everCorrect?: boolean;
  readonly rubricReviewConfirmed?: boolean;
  readonly lastResult?: "correct" | "retry" | "self-review";
};

export type Paper1StoredProgress = Record<string, Paper1CheckpointState>;

export type Paper1ProgressEnvelope = {
  readonly meta: {
    readonly assessmentVersion: string;
    readonly contentVersion?: string;
    readonly assessmentIds?: readonly string[];
    readonly assessmentReviewRules?: readonly Paper1AssessmentReviewRule[];
    readonly lastAssessmentId?: string;
  };
  readonly items: Paper1StoredProgress;
};

export type Paper1LearnerProgress = {
  readonly status: "not-started" | "in-progress" | "reviewed";
  readonly attempted: number;
  readonly total: number;
  readonly resumeHash: string;
};

export type Paper1StageProgress = { readonly lastStage: string; readonly visitedStages: readonly string[] };

export const PAPER1_PROGRESS_EVENT = "algocore:paper1:progress-change";
const STORAGE_KEY = "algocore:paper1:progress:v1";
const LAST_STAGE_KEY = "algocore:paper1:last-stage:v1";
const PROGRESS_SCOPE_COOKIE = "algocore_progress_scope";

export function emptyCheckpointState(): Paper1CheckpointState {
  return { draft: "", attemptCount: 0, independentAttemptCount: 0, supportedAttemptCount: 0, hintSeen: false, solutionSeen: false, everCorrect: false, rubricReviewConfirmed: false };
}

export function readPaper1ProgressScope() {
  if (typeof document === "undefined") return "";
  const raw = document.cookie.split("; ").find((entry) => entry.startsWith(`${PROGRESS_SCOPE_COOKIE}=`))?.slice(PROGRESS_SCOPE_COOKIE.length + 1) ?? "";
  try {
    const scope = decodeURIComponent(raw);
    return /^[A-Za-z0-9_-]{22}$/.test(scope) ? scope : "";
  } catch {
    return "";
  }
}

export function paper1ProgressStorageKey(scope: string, lessonId: string) {
  return `${STORAGE_KEY}:${scope}:${lessonId}`;
}

function isCheckpointState(value: unknown): value is Paper1CheckpointState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<Paper1CheckpointState>;
  const validResult = item.lastResult === undefined || ["correct", "retry", "self-review"].includes(item.lastResult);
  return typeof item.draft === "string"
    && [item.attemptCount, item.independentAttemptCount, item.supportedAttemptCount].every((count) => typeof count === "number" && Number.isSafeInteger(count) && count >= 0)
    && typeof item.hintSeen === "boolean"
    && typeof item.solutionSeen === "boolean"
    && (item.everCorrect === undefined || typeof item.everCorrect === "boolean")
    && (item.rubricReviewConfirmed === undefined || typeof item.rubricReviewConfirmed === "boolean")
    && validResult;
}

function sameStringList(left: readonly string[] | undefined, right: readonly string[]) {
  return Array.isArray(left) && left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameReviewRules(left: readonly Paper1AssessmentReviewRule[] | undefined, right: readonly Paper1AssessmentReviewRule[]) {
  return Array.isArray(left) && left.length === right.length && left.every((rule, index) => rule.id === right[index]?.id && rule.reviewKind === right[index]?.reviewKind);
}

export function readPaper1ProgressEnvelope(
  scope: string,
  lessonId: string,
  assessmentVersion?: string,
  currentAssessmentIds: readonly string[] = [],
  currentReviewRules: readonly Paper1AssessmentReviewRule[] = [],
): Paper1ProgressEnvelope | undefined {
  if (typeof localStorage === "undefined" || !scope) return undefined;
  try {
    localStorage.removeItem(`${STORAGE_KEY}:${lessonId}`);
    const parsed: unknown = JSON.parse(localStorage.getItem(paper1ProgressStorageKey(scope, lessonId)) ?? "null");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    const envelope = parsed as Partial<Paper1ProgressEnvelope>;
    if (!envelope.meta) return undefined;
    const versionMatches = typeof envelope.meta.assessmentVersion === "string" && (!assessmentVersion || envelope.meta.assessmentVersion === assessmentVersion);
    if (!versionMatches) return undefined;
    if (currentAssessmentIds.length && !sameStringList(envelope.meta.assessmentIds, currentAssessmentIds)) return undefined;
    if (currentReviewRules.length && !sameReviewRules(envelope.meta.assessmentReviewRules, currentReviewRules)) return undefined;
    if (!envelope.items || typeof envelope.items !== "object" || Array.isArray(envelope.items)) return undefined;
    if (!Object.values(envelope.items).every(isCheckpointState)) return undefined;
    if (currentAssessmentIds.length && Object.keys(envelope.items).some((id) => !currentAssessmentIds.includes(id))) return undefined;
    const lastAssessmentId = envelope.meta.lastAssessmentId;
    if (lastAssessmentId && currentAssessmentIds.length && !currentAssessmentIds.includes(lastAssessmentId)) return undefined;
    return {
      meta: {
        assessmentVersion: assessmentVersion ?? envelope.meta.assessmentVersion,
        assessmentIds: currentAssessmentIds.length ? currentAssessmentIds : envelope.meta.assessmentIds,
        assessmentReviewRules: currentReviewRules.length ? currentReviewRules : envelope.meta.assessmentReviewRules,
        lastAssessmentId,
      },
      items: envelope.items,
    } as Paper1ProgressEnvelope;
  } catch {
    return undefined;
  }
}

export function projectPaper1LearnerProgress(envelope?: Paper1ProgressEnvelope, stageProgress?: Paper1StageProgress): Paper1LearnerProgress {
  if (!envelope && !stageProgress?.visitedStages.length) return { status: "not-started", attempted: 0, total: 0, resumeHash: "#understand" };
  const assessmentIds = envelope?.meta.assessmentIds ?? [];
  const attempted = assessmentIds.filter((id) => (envelope?.items[id]?.attemptCount ?? 0) > 0).length;
  const hasActivity = Boolean(stageProgress?.visitedStages.length) || Object.values(envelope?.items ?? {}).some((item) => item.draft.trim() || item.attemptCount > 0);
  const rules = envelope?.meta.assessmentReviewRules ?? [];
  const reviewed = rules.length === assessmentIds.length && rules.length > 0 && rules.every((rule) => {
    const state = envelope?.items[rule.id];
    if (!state || state.attemptCount < 1) return false;
    return rule.reviewKind === "deterministic" ? state.everCorrect === true : state.rubricReviewConfirmed === true;
  });
  const lastAssessmentId = envelope?.meta.lastAssessmentId;
  return {
    status: reviewed ? "reviewed" : hasActivity ? "in-progress" : "not-started",
    attempted,
    total: assessmentIds.length,
    resumeHash: lastAssessmentId ? `#assessment-${encodeURIComponent(lastAssessmentId)}` : `#${stageProgress?.lastStage ?? "understand"}`,
  };
}

export function readPaper1StageProgress(scope: string, lessonId: string): Paper1StageProgress | undefined {
  if (typeof localStorage === "undefined" || !scope) return undefined;
  try {
    const parsed = JSON.parse(localStorage.getItem(`${LAST_STAGE_KEY}:${scope}:${lessonId}`) ?? "null") as Partial<Paper1StageProgress> | null;
    if (!parsed || !Array.isArray(parsed.visitedStages) || typeof parsed.lastStage !== "string") return undefined;
    const validStages = ["understand", "observe", "worked-example", "recognise", "check", "recall"];
    const visitedStages = parsed.visitedStages.filter((stage): stage is string => typeof stage === "string" && validStages.includes(stage));
    return { lastStage: validStages.includes(parsed.lastStage) ? parsed.lastStage : "understand", visitedStages };
  } catch { return undefined; }
}

export function writePaper1LastStage(scope: string, lessonId: string, stage: string) {
  if (!scope) return;
  try {
    const current = readPaper1StageProgress(scope, lessonId);
    if (current?.lastStage === stage && current.visitedStages.includes(stage)) return;
    const visitedStages = Array.from(new Set([...(current?.visitedStages ?? []), stage]));
    localStorage.setItem(`${LAST_STAGE_KEY}:${scope}:${lessonId}`, JSON.stringify({ lastStage: stage, visitedStages } satisfies Paper1StageProgress));
    announcePaper1ProgressChange(lessonId);
  } catch { /* navigation still works without storage */ }
}

export function announcePaper1ProgressChange(lessonId: string) {
  window.dispatchEvent(new CustomEvent(PAPER1_PROGRESS_EVENT, { detail: { lessonId } }));
}
