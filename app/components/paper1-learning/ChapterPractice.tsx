"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Eye, HelpCircle, RotateCcw, Target } from "lucide-react";
import { Button, Callout, Feedback } from "@/app/components/algocore-ui";
import { paper1Href } from "@/app/lib/paper1/href";
import { computePaper1PracticeDiagnostics } from "@/app/lib/paper1/practice-diagnostics";
import type { Paper1ChapterPractice, Paper1Locale } from "@/app/lib/paper1/types";
import { Paper1LocaleBoundary } from "./Paper1LocaleBoundary";
import { readPaper1ProgressScope } from "./paper1-progress";
import styles from "./ChapterPractice.module.css";

type ItemState = { draft: string; attempted: boolean; hintSeen: boolean; solutionSeen: boolean; awardedPointIds: readonly string[] };
type StoredPractice = {
  readonly practiceId: string;
  readonly contentVersion: string;
  readonly savedAt: number;
  readonly started: boolean;
  readonly timed: boolean;
  readonly remaining: number;
  readonly index: number;
  readonly finished: boolean;
  readonly states: Readonly<Record<string, ItemState>>;
};
type UndoSnapshot = { readonly expiresAt: number; readonly payload: StoredPractice };
const emptyItem = (): ItemState => ({ draft: "", attempted: false, hintSeen: false, solutionSeen: false, awardedPointIds: [] });
const practiceStorageKey = (scope: string, practiceId: string) => `algocore:paper1:practice:v1:${scope}:${practiceId}`;
const practiceUndoStorageKey = (scope: string, practiceId: string) => `algocore:paper1:practice-undo:v1:${scope}:${practiceId}`;
const UNDO_WINDOW_MS = 5 * 60 * 1000;

function isItemState(value: unknown): value is ItemState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<ItemState>;
  return typeof item.draft === "string"
    && typeof item.attempted === "boolean"
    && typeof item.hintSeen === "boolean"
    && typeof item.solutionSeen === "boolean"
    && Array.isArray(item.awardedPointIds)
    && item.awardedPointIds.every((id) => typeof id === "string");
}

function isStoredPractice(value: unknown, practice: Paper1ChapterPractice): value is StoredPractice {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const stored = value as Partial<StoredPractice>;
  const storedStates = stored.states;
  return stored.practiceId === practice.practiceId
    && stored.contentVersion === practice.contentVersion
    && typeof stored.savedAt === "number"
    && typeof stored.started === "boolean"
    && typeof stored.timed === "boolean"
    && Number.isSafeInteger(stored.remaining) && Number(stored.remaining) >= 0
    && Number.isSafeInteger(stored.index) && Number(stored.index) >= 0
    && typeof stored.finished === "boolean"
    && Boolean(storedStates) && typeof storedStates === "object" && !Array.isArray(storedStates)
    && Object.values(storedStates).every(isItemState);
}

export function ChapterPractice({ practice, locale }: { readonly practice: Paper1ChapterPractice; readonly locale: Paper1Locale }) {
  const chapterLabel = locale === "vi" ? `Chương ${practice.chapterId}` : `Chapter ${practice.chapterId}`;
  const [started, setStarted] = useState(false);
  const [timed, setTimed] = useState(false);
  const [remaining, setRemaining] = useState(practice.timing.timedMinutes * 60);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [states, setStates] = useState<Readonly<Record<string, ItemState>>>({});
  const [storageScope, setStorageScope] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot>();
  const itemNavRef = useRef<HTMLElement>(null);
  const itemButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const item = practice.items[index];
  const state = states[item.id] ?? emptyItem();

  function closeResetConfirmation() {
    setResetConfirmation(false);
    requestAnimationFrame(() => document.getElementById("paper1-reset-practice")?.focus());
  }

  useEffect(() => {
    const scope = readPaper1ProgressScope();
    setStorageScope(scope);
    if (!scope) { setStorageReady(true); return; }
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(practiceStorageKey(scope, practice.practiceId)) ?? "null");
      const savedUndo = JSON.parse(localStorage.getItem(practiceUndoStorageKey(scope, practice.practiceId)) ?? "null") as Partial<UndoSnapshot> | null;
      if (isStoredPractice(savedUndo?.payload, practice) && typeof savedUndo?.expiresAt === "number" && savedUndo.expiresAt > Date.now()) {
        setUndoSnapshot({ expiresAt: savedUndo.expiresAt, payload: savedUndo.payload });
      } else {
        localStorage.removeItem(practiceUndoStorageKey(scope, practice.practiceId));
      }
      if (!isStoredPractice(parsed, practice)) {
        setStorageReady(true);
        return;
      }
      const itemIds = new Set(practice.items.map((entry) => entry.id));
      const restoredStates = Object.fromEntries(Object.entries(parsed.states).filter(([id, value]) => itemIds.has(id) && isItemState(value)));
      const elapsed = parsed.started && parsed.timed && !parsed.finished && typeof parsed.savedAt === "number" ? Math.max(0, Math.floor((Date.now() - parsed.savedAt) / 1000)) : 0;
      const storedRemaining = Number.isSafeInteger(parsed.remaining) && Number(parsed.remaining) >= 0 ? Number(parsed.remaining) : practice.timing.timedMinutes * 60;
      const allAttempted = practice.items.every((entry) => restoredStates[entry.id]?.attempted === true);
      setStarted(parsed.started === true);
      setTimed(parsed.timed === true);
      setRemaining(Math.max(0, Math.min(practice.timing.timedMinutes * 60, storedRemaining - elapsed)));
      setIndex(Math.max(0, Math.min(practice.items.length - 1, Number.isSafeInteger(parsed.index) ? Number(parsed.index) : 0)));
      setFinished(parsed.finished === true && allAttempted);
      setStates(restoredStates);
    } catch { /* Practice remains usable when saved data is missing or corrupt. */ }
    setStorageReady(true);
  }, [practice.contentVersion, practice.items, practice.practiceId, practice.timing.timedMinutes]);

  useEffect(() => {
    const nav = itemNavRef.current;
    const active = itemButtonRefs.current[item.id];
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.scrollTo({ left: Math.max(0, active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2), behavior: reducedMotion ? "auto" : "smooth" });
  }, [index, item.id]);

  useEffect(() => {
    if (!resetConfirmation) return;
    requestAnimationFrame(() => document.getElementById("paper1-keep-practice")?.focus());
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") closeResetConfirmation(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [resetConfirmation]);

  useEffect(() => {
    if (!undoSnapshot) return;
    const delay = undoSnapshot.expiresAt - Date.now();
    if (delay <= 0) { setUndoSnapshot(undefined); return; }
    const timer = window.setTimeout(() => {
      setUndoSnapshot(undefined);
      if (storageScope) {
        try { localStorage.removeItem(practiceUndoStorageKey(storageScope, practice.practiceId)); } catch { /* no-op */ }
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [practice.practiceId, storageScope, undoSnapshot]);

  useEffect(() => {
    if (!storageReady || !storageScope) return;
    const payload: StoredPractice = { practiceId: practice.practiceId, contentVersion: practice.contentVersion, savedAt: Date.now(), started, timed, remaining, index, finished, states };
    try { localStorage.setItem(practiceStorageKey(storageScope, practice.practiceId), JSON.stringify(payload)); } catch { /* Practice remains usable without storage. */ }
  }, [finished, index, practice.contentVersion, practice.practiceId, remaining, started, states, storageReady, storageScope, timed]);

  useEffect(() => {
    if (!started || !timed || finished || remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [finished, remaining, started, timed]);

  const attemptedCount = practice.items.filter((entry) => states[entry.id]?.attempted).length;
  const score = useMemo(() => practice.items.reduce((total, entry) => {
    const awarded = new Set(states[entry.id]?.awardedPointIds ?? []);
    return total + entry.solution.markingPoints.reduce((subtotal, point) => subtotal + (awarded.has(point.id) ? point.marks : 0), 0);
  }, 0), [practice.items, states]);
  const diagnostics = useMemo(() => computePaper1PracticeDiagnostics(practice, states), [practice, states]);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  function update(change: (current: ItemState) => ItemState) {
    setStates((current) => ({ ...current, [item.id]: change(current[item.id] ?? emptyItem()) }));
  }
  function changeDraft(draft: string) {
    setFinished(false);
    update((current) => ({ ...current, draft, attempted: false, hintSeen: false, solutionSeen: false, awardedPointIds: [] }));
  }
  function currentPayload(): StoredPractice {
    return { practiceId: practice.practiceId, contentVersion: practice.contentVersion, savedAt: Date.now(), started, timed, remaining, index, finished, states };
  }
  function confirmReset() {
    const snapshot: UndoSnapshot = { expiresAt: Date.now() + UNDO_WINDOW_MS, payload: currentPayload() };
    if (storageScope) {
      try {
        localStorage.setItem(practiceUndoStorageKey(storageScope, practice.practiceId), JSON.stringify(snapshot));
        localStorage.removeItem(practiceStorageKey(storageScope, practice.practiceId));
      } catch { /* React state still provides an undo during this page visit. */ }
    }
    setUndoSnapshot(snapshot);
    setResetConfirmation(false);
    setStarted(false); setTimed(false); setRemaining(practice.timing.timedMinutes * 60); setIndex(0); setFinished(false); setStates({});
    requestAnimationFrame(() => document.getElementById("paper1-start-practice")?.focus());
  }
  function undoReset() {
    if (!undoSnapshot || undoSnapshot.expiresAt <= Date.now()) return;
    const restored = undoSnapshot.payload;
    setStarted(restored.started); setTimed(restored.timed); setRemaining(restored.remaining); setIndex(restored.index); setFinished(restored.finished); setStates(restored.states);
    setUndoSnapshot(undefined);
    if (storageScope) {
      try { localStorage.removeItem(practiceUndoStorageKey(storageScope, practice.practiceId)); } catch { /* no-op */ }
    }
  }

  if (!started) return <main className={styles.page} lang={locale} data-paper1-practice={practice.practiceId}>
    <Paper1LocaleBoundary locale={locale} />
    <Link className={styles.back} href={paper1Href(`/paper-1/sections/${practice.chapterId}`, locale)}><ArrowLeft size={17} />{locale === "vi" ? `Về ${chapterLabel}` : `Back to ${chapterLabel}`}</Link>
    <header className={styles.hero}><span>{practice.practiceId} · {practice.totalMarks} {locale === "vi" ? "điểm" : "marks"}</span><h1>{practice.title[locale]}</h1><p>{practice.intro[locale]}</p></header>
    {undoSnapshot && <section className={styles.undoBanner} role="status"><div><strong>{locale === "vi" ? "Bài làm vừa được đặt lại" : "Practice was just reset"}</strong><p>{locale === "vi" ? "Bạn có thể khôi phục toàn bộ câu trả lời và điểm tự chấm trong vòng 5 phút." : "You can restore every answer and self-mark for five minutes."}</p></div><Button variant="secondary" onClick={undoReset}><RotateCcw size={16} />{locale === "vi" ? "Khôi phục bài làm" : "Undo reset"}</Button></section>}
    <section className={styles.setup}>
      <h2>{locale === "vi" ? "Chọn cách làm" : "Choose a mode"}</h2>
      <label><input type="checkbox" checked={timed} onChange={(event) => setTimed(event.target.checked)} /><span><Clock3 size={20} /><strong>{locale === "vi" ? `Hẹn giờ ${practice.timing.timedMinutes} phút` : `${practice.timing.timedMinutes}-minute timer`}</strong><small>{locale === "vi" ? "Timer chỉ hỗ trợ luyện tập; hết giờ không khóa câu trả lời." : "The timer supports practice; reaching zero does not lock your work."}</small></span></label>
      <div className={styles.blueprint}><span>AO1 <strong>{practice.aoBlueprint.AO1}</strong></span><span>AO2 <strong>{practice.aoBlueprint.AO2}</strong></span><span>{practice.items.length} {locale === "vi" ? "câu" : "items"}</span></div>
      <Callout title={locale === "vi" ? "Quy tắc mở lời giải" : "Reveal policy"} icon={<Target />}><p>{locale === "vi" ? "Mỗi câu phải có câu trả lời được ghi nhận trước khi mở gợi ý hoặc lời giải. Điểm là tự chấm theo từng marking point; không chấm hai lần cùng một ý." : "Record an answer before revealing a hint or solution. Self-mark one marking point at a time; never award the same idea twice."}</p></Callout>
      <Button id="paper1-start-practice" onClick={() => setStarted(true)}>{locale === "vi" ? "Bắt đầu ôn tập" : "Start practice"}<ArrowRight size={17} /></Button>
    </section>
  </main>;

  return <main className={styles.page} lang={locale} data-paper1-practice={practice.practiceId}>
    <Paper1LocaleBoundary locale={locale} />
    <header className={styles.toolbar}>
      <div><strong>{practice.title[locale]}</strong><span>{attemptedCount}/{practice.items.length} {locale === "vi" ? "đã làm" : "attempted"} · {score}/{practice.totalMarks} {locale === "vi" ? "tự chấm" : "self-marked"}</span></div>
      {timed && <span className={styles.timer} role="timer" aria-live={remaining <= 60 ? "polite" : "off"}><Clock3 size={18} />{minutes}:{String(seconds).padStart(2, "0")}</span>}
    </header>
    {timed && remaining === 0 && <Feedback status="retry" title={locale === "vi" ? "Đã hết thời gian luyện" : "Practice time has elapsed"}>{locale === "vi" ? "Bạn vẫn có thể hoàn tất và tự chấm; kết quả cần được hiểu là untimed continuation." : "You can still finish and self-mark; treat the remainder as untimed continuation."}</Feedback>}
    <nav ref={itemNavRef} className={styles.itemNav} aria-label={locale === "vi" ? "Danh sách câu" : "Question list"}>{practice.items.map((entry, itemIndex) => {
      const attempted = states[entry.id]?.attempted === true;
      const current = itemIndex === index;
      return <button key={entry.id} ref={(node) => { itemButtonRefs.current[entry.id] = node; }} type="button" aria-current={current ? "step" : undefined} aria-label={locale === "vi" ? `Câu ${itemIndex + 1}, ${attempted ? "đã làm" : "chưa làm"}${current ? ", hiện tại" : ""}` : `Question ${itemIndex + 1}, ${attempted ? "attempted" : "not attempted"}${current ? ", current" : ""}`} data-attempted={attempted || undefined} onClick={() => setIndex(itemIndex)}>{itemIndex + 1}</button>;
    })}</nav>
    {finished && <section className={styles.summary}>
      <div className={styles.summaryLead}><CheckCircle2 size={26} /><div><h2>{locale === "vi" ? `Bản tự đánh giá ${chapterLabel}` : `${chapterLabel} self-review`}</h2><p>{locale === "vi" ? `Đã làm ${attemptedCount}/${practice.items.length} câu và tự chấm ${score}/${practice.totalMarks} điểm. Đây là bài AlgoCore tự biên soạn, không phải điểm Cambridge chính thức.` : `Attempted ${attemptedCount}/${practice.items.length} items and self-marked ${score}/${practice.totalMarks}. This is AlgoCore-original practice, not an official Cambridge score.`}</p></div></div>
      <div className={styles.aoSummary} aria-label={locale === "vi" ? "Điểm theo assessment objective" : "Marks by assessment objective"}>{diagnostics.ao.map((row) => <div key={row.id}><span>{row.id}</span><strong>{row.awarded}/{row.possible}</strong><small>{locale === "vi" ? "điểm tự chấm" : "self-marked"}</small></div>)}</div>
      <div className={styles.weakAreas}><h3>{locale === "vi" ? "Nội dung nên ôn lại" : "Revisit weak areas"}</h3>{diagnostics.weakAreas.length === 0 ? <p>{locale === "vi" ? "Bạn đã tự chấm đủ mọi marking point. Hãy thử lại ở chế độ hẹn giờ để kiểm tra độ vững." : "You awarded every marking point. Try the timed mode next to test fluency."}</p> : <ul>{diagnostics.weakAreas.map((area) => <li key={area.revisitLessonSlug}><div><Link href={paper1Href(`/paper-1/topics/${area.revisitLessonSlug}`, locale)}>{locale === "vi" ? "Ôn bài liên quan" : "Revisit lesson"}<ArrowRight size={16} /></Link><strong>{area.lostMarks} {locale === "vi" ? "điểm cần củng cố" : "marks to strengthen"}</strong></div><details><summary>{locale === "vi" ? "Xem objectives và requirements" : "View objectives and requirements"}</summary><p><b>Objectives:</b> {area.objectiveIds.join(" · ")}</p><p><b>Requirements:</b> {area.requirementIds.join(" · ")}</p></details></li>)}</ul>}</div>
    </section>}
    <article className={styles.item}>
      <header><span>{index + 1}/{practice.items.length}</span><div><small>{item.ao} · {item.commandWord} · {item.level} · {item.marks} {locale === "vi" ? "điểm" : "marks"}</small><h1>{item.prompt[locale]}</h1><p>{item.requirementIds.join(" · ")}</p></div></header>
      <label className={styles.answer}><span>{locale === "vi" ? "Câu trả lời của bạn" : "Your answer"}</span><textarea rows={8} value={state.draft} onChange={(event) => changeDraft(event.target.value)} /></label>
      <div className={styles.actions}>
        <Button disabled={!state.draft.trim()} onClick={() => update((current) => ({ ...current, attempted: true }))}>{state.attempted ? (locale === "vi" ? "Cập nhật lần làm" : "Update attempt") : (locale === "vi" ? "Ghi nhận lần làm" : "Record attempt")}</Button>
        <Button variant="secondary" disabled={!state.attempted} onClick={() => update((current) => ({ ...current, hintSeen: true }))}><HelpCircle size={16} />{locale === "vi" ? "Mở gợi ý" : "Reveal hint"}</Button>
        <Button variant="quiet" disabled={!state.attempted} onClick={() => update((current) => ({ ...current, solutionSeen: true }))}><Eye size={16} />{locale === "vi" ? "Mở lời giải" : "Reveal solution"}</Button>
      </div>
      {state.hintSeen && <aside className={styles.hint}><strong>{locale === "vi" ? "Gợi ý" : "Hint"}</strong><p>{item.hint[locale]}</p></aside>}
      {state.solutionSeen && <section className={styles.solution}>
        <h2>{locale === "vi" ? "Lời giải và marking points" : "Model answer and marking points"}</h2><p>{item.solution.modelAnswer[locale]}</p>
        <fieldset><legend>{locale === "vi" ? "Chỉ chọn ý có bằng chứng trong câu trả lời của bạn" : "Select only points evidenced in your answer"}</legend>{item.solution.markingPoints.map((point) => <label key={point.id}><input type="checkbox" checked={state.awardedPointIds.includes(point.id)} onChange={(event) => update((current) => ({ ...current, awardedPointIds: event.target.checked ? [...current.awardedPointIds, point.id] : current.awardedPointIds.filter((id) => id !== point.id) }))} /><span><strong>{point.marks}</strong>{point.point[locale]}</span></label>)}</fieldset>
        <Link href={paper1Href(`/paper-1/topics/${item.revisitLessonSlug}`, locale)}>{locale === "vi" ? "Ôn lại bài liên quan" : "Revisit the related lesson"}<ArrowRight size={16} /></Link>
      </section>}
      {index === practice.items.length - 1 && attemptedCount < practice.items.length ? <p className={styles.finishGate} role="status">{locale === "vi" ? `Cần ghi nhận câu trả lời cho đủ ${practice.items.length} câu trước khi xem tổng kết. Hiện đã làm ${attemptedCount}/${practice.items.length}.` : `Record an answer for all ${practice.items.length} items before opening the summary. ${attemptedCount}/${practice.items.length} attempted.`}</p> : null}
      <nav className={styles.pager}><Button variant="secondary" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}><ArrowLeft size={16} />{locale === "vi" ? "Câu trước" : "Previous"}</Button>{index < practice.items.length - 1 ? <Button onClick={() => setIndex((value) => Math.min(practice.items.length - 1, value + 1))}>{locale === "vi" ? "Câu tiếp" : "Next"}<ArrowRight size={16} /></Button> : <Button disabled={attemptedCount < practice.items.length} onClick={() => setFinished(true)}>{locale === "vi" ? "Hoàn tất và xem tổng kết" : "Finish and review"}<CheckCircle2 size={16} /></Button>}</nav>
    </article>
    {resetConfirmation && <section className={styles.resetConfirm} role="alertdialog" aria-labelledby="paper1-reset-title" aria-describedby="paper1-reset-description"><h2 id="paper1-reset-title">{locale === "vi" ? "Đặt lại toàn bộ bài luyện?" : "Reset all practice work?"}</h2><p id="paper1-reset-description">{locale === "vi" ? `Thao tác này sẽ xóa ${attemptedCount}/${practice.items.length} câu đã làm và ${score}/${practice.totalMarks} điểm tự chấm. Bạn có thể hoàn tác trong 5 phút.` : `This clears ${attemptedCount}/${practice.items.length} attempted items and ${score}/${practice.totalMarks} self-marked points. You can undo it for five minutes.`}</p><div><Button id="paper1-keep-practice" variant="secondary" onClick={closeResetConfirmation}>{locale === "vi" ? "Giữ bài làm" : "Keep my work"}</Button><Button onClick={confirmReset}><RotateCcw size={16} />{locale === "vi" ? "Đặt lại và cho phép hoàn tác" : "Reset with undo"}</Button></div></section>}
    <div className={styles.reset}><Button id="paper1-reset-practice" variant="quiet" onClick={() => setResetConfirmation(true)}><RotateCcw size={16} />{locale === "vi" ? "Làm lại từ đầu" : "Reset practice"}</Button></div>
  </main>;
}
