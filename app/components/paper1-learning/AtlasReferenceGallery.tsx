"use client";

import { useEffect, useRef, useState } from "react";
import { BookImage, BookOpenText, RefreshCcw } from "lucide-react";
import { Button, Disclosure } from "@/app/components/algocore-ui";
import placementData from "@/content/paper1/visual-placements.json";
import {
  getPaper1InstructionalPlacementsForStage,
  resolvePaper1ReferencePlacements,
} from "@/app/lib/paper1/visual-placement-registry";
import type {
  Paper1AtlasItem,
  Paper1InstructionalVisualPlacement,
  Paper1LessonStage,
  Paper1Locale,
} from "@/app/lib/paper1/types";
import styles from "./LessonPage.module.css";

type SourcePointerPlacement = {
  readonly atlasId: string;
  readonly disposition: string;
  readonly sourceLocator: string;
  readonly renderMode: "source-pointer-note";
  readonly replacementVisualId: string;
  readonly rationale?: { readonly en: string; readonly vi: string };
  readonly stage?: Paper1LessonStage;
  readonly anchor?: { readonly targetId: string };
  readonly teachingClaim?: { readonly en: string; readonly vi: string };
  readonly learnerAction?: { readonly en: string; readonly vi: string };
  readonly teacherPrompt?: { readonly en: string; readonly vi: string };
  readonly expectedObservation?: { readonly en: string; readonly vi: string };
  readonly misconceptionOrLimit?: { readonly en: string; readonly vi: string };
  readonly textEquivalent?: { readonly en: string; readonly vi: string };
  readonly order: number;
};

type SourcePointerContract = {
  readonly lessonId: string;
  readonly visualId: string;
  readonly instructionalPlacements: readonly SourcePointerPlacement[];
  readonly referencePlacements: readonly SourcePointerPlacement[];
};

const sourcePointerContracts = ((placementData as unknown as {
  readonly sourcePointerLessons?: readonly SourcePointerContract[];
}).sourcePointerLessons ?? []);

const lessonSourceNoteDispositions = new Set([
  "INLINE_UNDERSTAND",
  "INLINE_OBSERVE_SCENE",
  "INLINE_WORKED_EXAMPLE",
  "INLINE_RECOGNISE",
  "LESSON_REFERENCE_DISCLOSURE",
]);

function getSourcePointerContract(lessonId: string) {
  return sourcePointerContracts.find((entry) => entry.lessonId === lessonId);
}

export function AtlasImage({ item, locale }: { readonly item: Paper1AtlasItem; readonly locale: Paper1Locale }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"pending" | "ready" | "error">("pending");
  const imageRef = useRef<HTMLImageElement>(null);
  const alt = `${item.title[locale]}. ${item.description[locale]}`;
  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;
    setState(image.naturalWidth > 0 ? "ready" : "error");
  }, [attempt, item.id, locale]);
  return <div className={styles.atlasPreview} data-image-state={state}>
    {state === "pending" && <span className={styles.atlasLoading} role="status">{locale === "vi" ? "Đang tải hình…" : "Loading visual…"}</span>}
    {state === "error" ? <div className={styles.atlasError} role="alert">
      <BookImage size={26} aria-hidden="true" />
      <p>{locale === "vi" ? "Không tải được hình. Mô tả chữ vẫn dùng được bên dưới." : "The visual did not load. Its text equivalent remains available below."}</p>
      <Button variant="secondary" size="compact" onClick={() => { setState("pending"); setAttempt((value) => value + 1); }}><RefreshCcw size={15} />{locale === "vi" ? "Thử lại" : "Retry"}</Button>
    </div> : <img
      ref={imageRef}
      key={attempt}
      src={`${item.preview[locale]}${attempt ? `?retry=${attempt}` : ""}`}
      alt={alt}
      width="960"
      height="500"
      loading="lazy"
      decoding="async"
      onLoad={() => setState("ready")}
      onError={() => setState("error")}
    />}
  </div>;
}

export function AtlasSourceMeta({ item, locale }: { readonly item: Paper1AtlasItem; readonly locale: Paper1Locale }) {
  return <div className={styles.atlasMeta}>
    <span><BookOpenText size={14} aria-hidden="true" />{locale === "vi" ? `Trang in ${item.source.printedPage}` : `Printed page ${item.source.printedPage}`}</span>
    <span>{item.id}</span>
  </div>;
}

function InstructionalCard({ item, placement, locale }: {
  readonly item: Paper1AtlasItem;
  readonly placement: Paper1InstructionalVisualPlacement;
  readonly locale: Paper1Locale;
}) {
  return <figure id={`visual-${item.id}`} className={styles.instructionalVisual} data-atlas-id={item.id} data-disposition={placement.disposition}>
    <AtlasImage item={item} locale={locale} />
    <figcaption>
      <AtlasSourceMeta item={item} locale={locale} />
      <h3>{item.title[locale]}</h3>
      <p><strong>{locale === "vi" ? "Ý cần thấy: " : "Teaching claim: "}</strong>{placement.teachingClaim[locale]}</p>
      <dl className={styles.visualContract}>
        <div><dt>{locale === "vi" ? "Việc của học sinh" : "Learner action"}</dt><dd>{placement.learnerAction[locale]}</dd></div>
        <div><dt>{locale === "vi" ? "Câu hỏi giáo viên" : "Teacher prompt"}</dt><dd>{placement.teacherPrompt[locale]}</dd></div>
        <div><dt>{locale === "vi" ? "Bằng chứng quan sát" : "Observable evidence"}</dt><dd>{placement.expectedObservation[locale]}</dd></div>
        <div><dt>{locale === "vi" ? "Giới hạn/ngộ nhận" : "Limit or misconception"}</dt><dd>{placement.misconceptionOrLimit[locale]}</dd></div>
      </dl>
      <p className={styles.textEquivalent}><strong>{locale === "vi" ? "Mô tả chữ: " : "Text equivalent: "}</strong>{placement.textEquivalent[locale]}</p>
    </figcaption>
  </figure>;
}

export function InstructionalVisuals({ lessonId, stage, locale }: {
  readonly lessonId: string;
  readonly stage: Exclude<Paper1LessonStage, "observe">;
  readonly locale: Paper1Locale;
}) {
  const placements = getPaper1InstructionalPlacementsForStage(lessonId, stage);
  if (!placements.length) return null;
  return <div className={styles.instructionalVisualGrid} data-visual-stage={stage}>
    {placements.map(({ item, placement }) => <InstructionalCard key={item.id} item={item} placement={placement} locale={locale} />)}
  </div>;
}

export function ObserveSceneVisual({ lessonId, sceneId, locale }: {
  readonly lessonId: string;
  readonly sceneId?: string;
  readonly locale: Paper1Locale;
}) {
  if (!sceneId) return null;
  const placements = getPaper1InstructionalPlacementsForStage(lessonId, "observe")
    .filter(({ placement }) => placement.anchor.targetId === sceneId);
  if (!placements.length) return null;
  return <div className={styles.sceneVisuals} data-scene-visuals={sceneId}>
    {placements.map(({ item, placement }) => <InstructionalCard key={item.id} item={item} placement={placement} locale={locale} />)}
  </div>;
}

export function LessonReferenceDisclosure({ lessonId, locale }: { readonly lessonId: string; readonly locale: Paper1Locale }) {
  const references = resolvePaper1ReferencePlacements(lessonId)
    .filter(({ placement }) => placement.disposition === "LESSON_REFERENCE_DISCLOSURE");
  if (!references.length) return null;
  return <aside className={styles.lessonReferences} aria-labelledby={`${lessonId}-references`}>
    <h2 id={`${lessonId}-references`}>{locale === "vi" ? "Ví dụ tham khảo sau bài" : "Optional references after the lesson"}</h2>
    <p>{locale === "vi" ? "Các hình này dùng để luyện thêm hoặc khắc phục chỗ chưa chắc. Mở hình không thay đổi tiến độ bài học." : "Use these visuals for extra practice or remediation. Opening them does not change lesson progress."}</p>
    <Disclosure summary={locale === "vi" ? `Mở ${references.length} hình tham khảo` : `Open ${references.length} reference visuals`}>
      <div className={styles.atlasGrid}>
        {references.map(({ item, placement }) => <figure className={styles.atlasCard} data-atlas-id={item.id} key={item.id}>
          <AtlasImage item={item} locale={locale} />
          <figcaption><AtlasSourceMeta item={item} locale={locale} /><h3>{item.title[locale]}</h3><p>{placement.rationale[locale]}</p><p className={styles.textEquivalent}>{item.description[locale]}</p></figcaption>
        </figure>)}
      </div>
    </Disclosure>
  </aside>;
}

export function TeacherSourceAuditDisclosure({ lessonId, locale }: { readonly lessonId: string; readonly locale: Paper1Locale }) {
  const contract = getSourcePointerContract(lessonId);
  if (!contract) return null;
  const placements = [...contract.instructionalPlacements, ...contract.referencePlacements]
    .filter((placement) => lessonSourceNoteDispositions.has(placement.disposition))
    .toSorted((left, right) => (left.stage ?? "reference").localeCompare(right.stage ?? "reference") || left.order - right.order);
  if (!placements.length) return null;
  return <aside className={styles.lessonReferences} aria-labelledby={`${lessonId}-source-audit`} data-teacher-source-audit={lessonId}>
    <h2 id={`${lessonId}-source-audit`}>{locale === "vi" ? "Đối chiếu coursebook (tuỳ chọn)" : "Optional coursebook alignment"}</h2>
    <p>{locale === "vi"
      ? "Các pointer này ghi lại cách bài học bám coursebook. Chúng không thuộc sáu stage học tập và không hiển thị hình trong sách."
      : "These pointers record coursebook alignment. They are outside the six learning stages and do not render coursebook images."}</p>
    <Disclosure summary={locale === "vi" ? `Mở ${placements.length} ghi chú nguồn` : `Open ${placements.length} source notes`}>
      <div className={styles.atlasGrid}>
        {placements.map((placement) => <article className={styles.atlasCard} data-atlas-id={placement.atlasId} data-disposition={placement.disposition} data-render-mode={placement.renderMode} key={placement.atlasId}>
          <div className={styles.atlasMeta}><span><BookOpenText size={14} aria-hidden="true" />{placement.stage ?? (locale === "vi" ? "tham khảo" : "reference")}</span></div>
          <h3>{placement.sourceLocator}</h3>
          <p>{placement.rationale?.[locale] ?? placement.misconceptionOrLimit?.[locale] ?? placement.textEquivalent?.[locale]}</p>
          <p className={styles.textEquivalent}>{locale === "vi"
            ? "Hình trong sách không được hiển thị; bài học dùng visual gốc của AlgoCore."
            : "The coursebook image is not rendered; the lesson uses an AlgoCore-original visual."}</p>
        </article>)}
      </div>
    </Disclosure>
  </aside>;
}
