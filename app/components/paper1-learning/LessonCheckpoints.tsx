"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, HelpCircle, RotateCcw } from "lucide-react";
import { Button, Feedback } from "@/app/components/algocore-ui";
import type { Paper1Assessment, Paper1Locale } from "@/app/lib/paper1/types";
import styles from "./LessonPage.module.css";

type ItemState = { draft: string; attemptCount: number; independentAttemptCount: number; supportedAttemptCount: number; hintSeen: boolean; solutionSeen: boolean; lastResult?: "correct" | "retry" | "self-review" };
type StoredProgress = Record<string, ItemState>;
type StoredProgressEnvelope = { readonly meta: { readonly contentVersion: string }; readonly items: StoredProgress };
const STORAGE_KEY = "algocore:paper1:progress:v1";
const PROGRESS_SCOPE_COOKIE = "algocore_progress_scope";

function readProgressScope() {
  const raw = document.cookie.split("; ").find((entry) => entry.startsWith(`${PROGRESS_SCOPE_COOKIE}=`))?.slice(PROGRESS_SCOPE_COOKIE.length + 1) ?? "";
  try {
    const scope = decodeURIComponent(raw);
    return /^[A-Za-z0-9_-]{22}$/.test(scope) ? scope : "";
  } catch {
    return "";
  }
}

function storageKey(scope: string, lessonId: string) {
  return `${STORAGE_KEY}:${scope}:${lessonId}`;
}

function isItemState(value: unknown): value is ItemState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<ItemState>;
  const validResult = item.lastResult === undefined || ["correct", "retry", "self-review"].includes(item.lastResult);
  return typeof item.draft === "string"
    && [item.attemptCount, item.independentAttemptCount, item.supportedAttemptCount].every((count) => typeof count === "number" && Number.isSafeInteger(count) && count >= 0)
    && typeof item.hintSeen === "boolean"
    && typeof item.solutionSeen === "boolean"
    && validResult;
}

function loadProgress(scope: string, lessonId: string, contentVersion: string): StoredProgress {
  try {
    localStorage.removeItem(`${STORAGE_KEY}:${lessonId}`);
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(scope, lessonId)) ?? "null");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const envelope = parsed as Partial<StoredProgressEnvelope>;
    if (envelope.meta?.contentVersion !== contentVersion || !envelope.items || typeof envelope.items !== "object" || Array.isArray(envelope.items)) return {};
    if (!Object.values(envelope.items).every(isItemState)) return {};
    return envelope.items as StoredProgress;
  } catch { return {}; }
}

function normalise(value: string) { return value.trim().toLowerCase().replace(/[,\s]+/g, "").replace(/[₂₁₆]/g, ""); }

export function LessonCheckpoints({ lessonId, contentVersion, assessments, locale }: { readonly lessonId: string; readonly contentVersion: string; readonly assessments: readonly Paper1Assessment[]; readonly locale: Paper1Locale }) {
  const [items, setItems] = useState<StoredProgress>({});
  const [progressScope, setProgressScope] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const scope = readProgressScope();
    setReady(false);
    setProgressScope(scope);
    setItems(scope ? loadProgress(scope, lessonId, contentVersion) : {});
    setReady(true);
  }, [contentVersion, lessonId]);
  useEffect(() => { if (!ready || !progressScope) return; try { localStorage.setItem(storageKey(progressScope, lessonId), JSON.stringify({ meta: { contentVersion }, items } satisfies StoredProgressEnvelope)); } catch { /* memory fallback keeps the lesson usable */ } }, [contentVersion, items, lessonId, progressScope, ready]);

  function update(id: string, change: (state: ItemState) => ItemState) {
    setItems((current) => ({ ...current, [id]: change(current[id] ?? { draft: "", attemptCount: 0, independentAttemptCount: 0, supportedAttemptCount: 0, hintSeen: false, solutionSeen: false }) }));
  }

  return <div className={styles.checkpointList} aria-busy={!ready}>{assessments.map((assessment, index) => <Checkpoint key={assessment.id} assessment={assessment} index={index} locale={locale} ready={ready} state={items[assessment.id] ?? { draft: "", attemptCount: 0, independentAttemptCount: 0, supportedAttemptCount: 0, hintSeen: false, solutionSeen: false }} update={(change) => update(assessment.id, change)} />)}</div>;
}

function Checkpoint({ assessment, index, locale, ready, state, update }: { readonly assessment: Paper1Assessment; readonly index: number; readonly locale: Paper1Locale; readonly ready: boolean; readonly state: ItemState; readonly update: (change: (state: ItemState) => ItemState) => void }) {
  const exact = useMemo(() => new Set((assessment.acceptedAnswers ?? []).map(normalise)), [assessment.acceptedAnswers]);
  const isChoice = assessment.kind === "single-choice";
  const isOpen = ["explain", "compare", "justify"].includes(assessment.kind);
  function attempt() {
    const supported = state.hintSeen || state.solutionSeen;
    const correct = isOpen ? undefined : isChoice ? state.draft === assessment.correctChoiceId : exact.has(normalise(state.draft));
    update((current) => ({ ...current, attemptCount: current.attemptCount + 1, independentAttemptCount: current.independentAttemptCount + (supported ? 0 : 1), supportedAttemptCount: current.supportedAttemptCount + (supported ? 1 : 0), lastResult: isOpen ? "self-review" : correct ? "correct" : "retry" }));
  }
  function changeDraft(draft: string) { update((current) => ({ ...current, draft, lastResult: undefined })); }
  function showHint() { update((current) => ({ ...current, hintSeen: true })); }
  function showSolution() { update((current) => ({ ...current, solutionSeen: true })); }

  return <article className={styles.checkpoint} data-state={state.lastResult}>
    <header><span>{String(index + 1).padStart(2,"0")}</span><div><small>{assessment.requirementId} · {assessment.level} · {locale === "vi" ? "AlgoCore tự biên soạn" : "AlgoCore original"}</small><h3>{assessment.prompt[locale]}</h3></div></header>
    {isChoice ? <fieldset disabled={!ready}><legend className={styles.srOnly}>{assessment.prompt[locale]}</legend>{assessment.choices?.map((choice) => <label key={choice.id}><input type="radio" name={assessment.id} value={choice.id} checked={state.draft === choice.id} onChange={() => changeDraft(choice.id)} /><span>{choice.label[locale]}</span></label>)}</fieldset> : isOpen ? <textarea disabled={!ready} aria-label={locale === "vi" ? "Câu trả lời của bạn" : "Your answer"} value={state.draft} onChange={(event) => changeDraft(event.target.value)} rows={5} placeholder={locale === "vi" ? "Viết câu trả lời trước khi xem rubric…" : "Write your answer before opening the rubric…"} /> : <input disabled={!ready} aria-label={locale === "vi" ? "Câu trả lời của bạn" : "Your answer"} value={state.draft} onChange={(event) => changeDraft(event.target.value)} />}
    <div className={styles.checkpointActions}><Button onClick={attempt} disabled={!ready || !state.draft.trim()}>{isOpen ? (locale === "vi" ? "Ghi nhận & tự kiểm" : "Record & self-check") : (locale === "vi" ? "Kiểm tra" : "Check")}</Button><Button variant="secondary" onClick={showHint} disabled={!ready}><HelpCircle size={16} />{locale === "vi" ? "Gợi ý" : "Hint"}</Button><Button variant="quiet" onClick={showSolution} disabled={!ready}><Eye size={16} />{locale === "vi" ? "Xem lời giải" : "Show solution"}</Button></div>
    <div className={styles.progressFlags} role="group" aria-label={locale === "vi" ? "Dấu vết học tập" : "Learning record"}>{state.attemptCount > 0 && <span><CheckCircle2 size={14} />{locale === "vi" ? `Đã thử ${state.attemptCount} lần` : `${state.attemptCount} attempt${state.attemptCount === 1 ? "" : "s"}`}</span>}{state.independentAttemptCount > 0 && <span>{locale === "vi" ? "Có lần làm độc lập" : "Independent attempt recorded"}</span>}{state.hintSeen && <span>{locale === "vi" ? "Đã xem gợi ý" : "Hint seen"}</span>}{state.solutionSeen && <span>{locale === "vi" ? "Đã xem lời giải" : "Solution seen"}</span>}{state.supportedAttemptCount > 0 && <span>{locale === "vi" ? "Có lần làm lại có hỗ trợ" : "Supported retry recorded"}</span>}</div>
    {state.hintSeen && <aside className={styles.hint}><strong>{locale === "vi" ? "Gợi ý" : "Hint"}</strong><p>{assessment.hint[locale]}</p></aside>}
    {state.lastResult === "correct" && <Feedback status="success" title={locale === "vi" ? "Đúng theo quy tắc đã nêu" : "Correct under the stated rule"} />}
    {state.lastResult === "retry" && <Feedback status="retry" title={locale === "vi" ? "Chưa khớp — hãy thử lại" : "Not yet — try again"}>{locale === "vi" ? "Mở gợi ý nếu bạn cần một bước đỡ." : "Open the hint if you need a scaffold."}</Feedback>}
    {state.lastResult === "self-review" && <Feedback status="info" title={locale === "vi" ? "Dùng rubric để tự đối chiếu" : "Use the rubric to self-review"}>{locale === "vi" ? "Câu giải thích không được chấm bằng từ khóa." : "Explanation answers are not keyword-scored."}</Feedback>}
    {state.solutionSeen && <section className={styles.solution}><h4>{locale === "vi" ? "Lời giải mẫu · xem ngay được" : "Model answer · always available"}</h4><p>{assessment.solution.modelAnswer[locale]}</p>{assessment.solution.rubric && <ul>{assessment.solution.rubric.map((point, pointIndex) => <li key={pointIndex}>{point[locale]}</li>)}</ul>}<p className={styles.solutionNote}><RotateCcw size={15} />{locale === "vi" ? "Xem lời giải không đánh dấu thành thạo. Lần thử sau được ghi là có hỗ trợ." : "Opening the solution does not mark mastery. A later attempt is recorded as supported."}</p></section>}
  </article>;
}
