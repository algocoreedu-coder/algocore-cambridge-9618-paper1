"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, HelpCircle, RotateCcw } from "lucide-react";
import { Button, Feedback } from "@/app/components/algocore-ui";
import { paper1AssessmentReviewKind } from "@/app/lib/paper1/progress-contract";
import type { Paper1Assessment, Paper1Locale } from "@/app/lib/paper1/types";
import {
  announcePaper1ProgressChange,
  emptyCheckpointState,
  paper1ProgressStorageKey,
  readPaper1ProgressEnvelope,
  readPaper1ProgressScope,
  type Paper1CheckpointState as ItemState,
  type Paper1ProgressEnvelope,
  type Paper1StoredProgress as StoredProgress,
} from "./paper1-progress";
import styles from "./LessonPage.module.css";

function normalise(value: string) { return value.trim().toLowerCase().replace(/[,\s]+/g, "").replace(/[₂₁₆]/g, ""); }

export function LessonCheckpoints({ lessonId, assessmentVersion, assessments, locale }: { readonly lessonId: string; readonly assessmentVersion: string; readonly assessments: readonly Paper1Assessment[]; readonly locale: Paper1Locale }) {
  const [items, setItems] = useState<StoredProgress>({});
  const [progressScope, setProgressScope] = useState("");
  const [lastAssessmentId, setLastAssessmentId] = useState<string>();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const scope = readPaper1ProgressScope();
    const assessmentIds = assessments.map((assessment) => assessment.id);
    const assessmentReviewRules = assessments.map((assessment) => ({ id: assessment.id, reviewKind: paper1AssessmentReviewKind(assessment) }));
    const envelope = readPaper1ProgressEnvelope(scope, lessonId, assessmentVersion, assessmentIds, assessmentReviewRules);
    setReady(false);
    setProgressScope(scope);
    setItems(envelope?.items ?? {});
    setLastAssessmentId(envelope?.meta.lastAssessmentId);
    setReady(true);
  }, [assessmentVersion, assessments, lessonId]);
  useEffect(() => {
    if (!ready || !progressScope) return;
    try {
      const envelope: Paper1ProgressEnvelope = { meta: { assessmentVersion, assessmentIds: assessments.map((assessment) => assessment.id), assessmentReviewRules: assessments.map((assessment) => ({ id: assessment.id, reviewKind: paper1AssessmentReviewKind(assessment) })), lastAssessmentId }, items };
      localStorage.setItem(paper1ProgressStorageKey(progressScope, lessonId), JSON.stringify(envelope));
      announcePaper1ProgressChange(lessonId);
    } catch { /* memory fallback keeps the lesson usable */ }
  }, [assessmentVersion, assessments, items, lastAssessmentId, lessonId, progressScope, ready]);

  function update(id: string, change: (state: ItemState) => ItemState) {
    setLastAssessmentId(id);
    setItems((current) => ({ ...current, [id]: change(current[id] ?? emptyCheckpointState()) }));
  }

  return <div className={styles.checkpointList} aria-busy={!ready}>{assessments.map((assessment, index) => <Checkpoint key={assessment.id} assessment={assessment} index={index} locale={locale} ready={ready} state={items[assessment.id] ?? emptyCheckpointState()} update={(change) => update(assessment.id, change)} />)}</div>;
}

function Checkpoint({ assessment, index, locale, ready, state, update }: { readonly assessment: Paper1Assessment; readonly index: number; readonly locale: Paper1Locale; readonly ready: boolean; readonly state: ItemState; readonly update: (change: (state: ItemState) => ItemState) => void }) {
  const exact = useMemo(() => new Set((assessment.acceptedAnswers ?? []).map(normalise)), [assessment.acceptedAnswers]);
  const isChoice = assessment.kind === "single-choice";
  const isOpen = ["explain", "compare", "justify"].includes(assessment.kind);
  function attempt() {
    const supported = state.hintSeen || state.solutionSeen;
    const correct = isOpen ? undefined : isChoice ? state.draft === assessment.correctChoiceId : exact.has(normalise(state.draft));
    update((current) => ({ ...current, attemptCount: current.attemptCount + 1, independentAttemptCount: current.independentAttemptCount + (supported ? 0 : 1), supportedAttemptCount: current.supportedAttemptCount + (supported ? 1 : 0), everCorrect: current.everCorrect || correct === true, lastResult: isOpen ? "self-review" : correct ? "correct" : "retry" }));
  }
  function changeDraft(draft: string) { update((current) => ({ ...current, draft, lastResult: undefined })); }
  function showHint() { update((current) => ({ ...current, hintSeen: true })); }
  function showSolution() { update((current) => ({ ...current, solutionSeen: true })); }

  return <article id={`assessment-${assessment.id}`} className={styles.checkpoint} data-state={state.lastResult}>
    <header><span>{String(index + 1).padStart(2,"0")}</span><div><small>{assessment.requirementId} · {assessment.level} · {locale === "vi" ? "AlgoCore tự biên soạn" : "AlgoCore original"}</small><h3>{assessment.prompt[locale]}</h3></div></header>
    {isChoice ? <fieldset disabled={!ready}><legend className={styles.srOnly}>{assessment.prompt[locale]}</legend>{assessment.choices?.map((choice) => <label key={choice.id}><input type="radio" name={assessment.id} value={choice.id} checked={state.draft === choice.id} onChange={() => changeDraft(choice.id)} /><span>{choice.label[locale]}</span></label>)}</fieldset> : isOpen ? <textarea disabled={!ready} aria-label={locale === "vi" ? "Câu trả lời của bạn" : "Your answer"} value={state.draft} onChange={(event) => changeDraft(event.target.value)} rows={5} placeholder={locale === "vi" ? "Viết câu trả lời trước khi xem rubric…" : "Write your answer before opening the rubric…"} /> : <input disabled={!ready} aria-label={locale === "vi" ? "Câu trả lời của bạn" : "Your answer"} value={state.draft} onChange={(event) => changeDraft(event.target.value)} />}
    <div className={styles.checkpointActions}><Button onClick={attempt} disabled={!ready || !state.draft.trim()}>{isOpen ? (locale === "vi" ? "Ghi nhận & tự kiểm" : "Record & self-check") : (locale === "vi" ? "Kiểm tra" : "Check")}</Button><Button variant="secondary" onClick={showHint} disabled={!ready}><HelpCircle size={16} />{locale === "vi" ? "Gợi ý" : "Hint"}</Button><Button variant="quiet" onClick={showSolution} disabled={!ready}><Eye size={16} />{locale === "vi" ? "Xem lời giải" : "Show solution"}</Button></div>
    <div className={styles.progressFlags} role="group" aria-label={locale === "vi" ? "Dấu vết học tập" : "Learning record"}>{state.attemptCount > 0 && <span><CheckCircle2 size={14} />{locale === "vi" ? `Đã thử ${state.attemptCount} lần` : `${state.attemptCount} attempt${state.attemptCount === 1 ? "" : "s"}`}</span>}{state.independentAttemptCount > 0 && <span>{locale === "vi" ? "Có lần làm độc lập" : "Independent attempt recorded"}</span>}{state.hintSeen && <span>{locale === "vi" ? "Đã xem gợi ý" : "Hint seen"}</span>}{state.solutionSeen && <span>{locale === "vi" ? "Đã xem lời giải" : "Solution seen"}</span>}{state.supportedAttemptCount > 0 && <span>{locale === "vi" ? "Có lần làm lại có hỗ trợ" : "Supported retry recorded"}</span>}</div>
    {state.hintSeen && <aside className={styles.hint}><strong>{locale === "vi" ? "Gợi ý" : "Hint"}</strong><p>{assessment.hint[locale]}</p></aside>}
    {state.lastResult === "correct" && <Feedback status="success" title={locale === "vi" ? "Đúng theo quy tắc đã nêu" : "Correct under the stated rule"} />}
    {state.lastResult === "retry" && <Feedback status="retry" title={locale === "vi" ? "Chưa khớp — hãy thử lại" : "Not yet — try again"}>{locale === "vi" ? "Mở gợi ý nếu bạn cần một bước đỡ." : "Open the hint if you need a scaffold."}</Feedback>}
    {state.lastResult === "self-review" && <Feedback status="info" title={locale === "vi" ? "Dùng rubric để tự đối chiếu" : "Use the rubric to self-review"}>{locale === "vi" ? "Câu giải thích không được chấm bằng từ khóa." : "Explanation answers are not keyword-scored."}</Feedback>}
    {state.solutionSeen && <section className={styles.solution}><h4>{locale === "vi" ? "Lời giải mẫu · xem ngay được" : "Model answer · always available"}</h4><p>{assessment.solution.modelAnswer[locale]}</p>{assessment.solution.rubric && <ul>{assessment.solution.rubric.map((point, pointIndex) => <li key={pointIndex}>{point[locale]}</li>)}</ul>}<p className={styles.solutionNote}><RotateCcw size={15} />{locale === "vi" ? "Xem lời giải không đánh dấu thành thạo. Lần thử sau được ghi là có hỗ trợ." : "Opening the solution does not mark mastery. A later attempt is recorded as supported."}</p>{isOpen && state.attemptCount > 0 && <Button variant="secondary" disabled={state.rubricReviewConfirmed} onClick={() => update((current) => ({ ...current, rubricReviewConfirmed: true }))}><CheckCircle2 size={16} />{state.rubricReviewConfirmed ? (locale === "vi" ? "Đã xác nhận tự đối chiếu" : "Self-review confirmed") : (locale === "vi" ? "Xác nhận đã đối chiếu rubric" : "Confirm rubric review")}</Button>}</section>}
  </article>;
}
