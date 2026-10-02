import type { ReactNode } from "react";

import styles from "./AlgoCoreUI.module.css";

export type ProgressProps = Readonly<{ label: string; value: number; max: number; detail?: string }>;
export function Progress({ label, value, max, detail }: ProgressProps) {
  const safeMax = Math.max(1, max);
  const safeValue = Math.min(safeMax, Math.max(0, value));
  const percent = Math.round((safeValue / safeMax) * 100);
  return <div className={styles.progressGroup}><div className={styles.progressMeta}><strong>{label}</strong><span>{detail ?? `${safeValue} / ${safeMax}`}</span></div><div className={styles.progressTrack} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={safeValue}><span style={{ width: `${percent}%` }} /></div></div>;
}

export type StepState = "complete" | "current" | "locked";
export type LessonStep = Readonly<{ id: string; label: string; state: StepState }>;
export function LessonStepper({ label, steps }: Readonly<{ label: string; steps: readonly LessonStep[] }>) {
  return <nav className={styles.stepper} aria-label={label}><ol>{steps.map((step, index) => <li className={styles.step} data-state={step.state} aria-current={step.state === "current" ? "step" : undefined} key={step.id}><span className={styles.stepMarker} aria-hidden="true">{step.state === "complete" ? "✓" : index + 1}</span><span>{step.label}</span></li>)}</ol></nav>;
}

export type StageNavigationProps = Readonly<{
  label: string;
  previousLabel: string;
  nextLabel: string;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}>;
export function StageNavigation({ label, previousLabel, nextLabel, previousDisabled, nextDisabled, onPrevious, onNext }: StageNavigationProps) {
  return <nav className={styles.stageNavigation} aria-label={label}><button className={styles.stageAction} data-variant="secondary" type="button" disabled={previousDisabled} onClick={onPrevious}>← {previousLabel}</button><button className={styles.stageAction} data-variant="primary" type="button" disabled={nextDisabled} onClick={onNext}>{nextLabel} →</button></nav>;
}

export type Segment = Readonly<{ id: string; label: string; disabled?: boolean }>;
export function SegmentedControl({ label, segments, value, onChange }: Readonly<{ label: string; segments: readonly Segment[]; value: string; onChange?: (value: string) => void }>) {
  return <div className={styles.segments} role="group" aria-label={label}>{segments.map((segment) => <button className={styles.segment} type="button" aria-pressed={value === segment.id} disabled={segment.disabled} onClick={() => onChange?.(segment.id)} key={segment.id}>{segment.label}</button>)}</div>;
}

export type LanguageOption = Readonly<{ locale: "en" | "vi"; label: string; href: string }>;
export function LanguageSwitch({ label, locale, options }: Readonly<{ label: string; locale: "en" | "vi"; options: readonly LanguageOption[] }>) {
  return <nav className={styles.languageSwitch} aria-label={label}>{options.map((option) => <a href={option.href} aria-current={locale === option.locale ? "page" : undefined} hrefLang={option.locale} lang={option.locale} key={option.locale}>{option.label}</a>)}</nav>;
}

export type LessonContainerProps = Readonly<{ width?: "reading" | "lesson" | "visual" | "full"; children: ReactNode }>;
export function LessonContainer({ width = "lesson", children }: LessonContainerProps) {
  return <div className={styles.container} data-width={width}>{children}</div>;
}

export type LessonShellProps = Readonly<{ title: string; description?: string; eyebrow?: string; actions?: ReactNode; width?: LessonContainerProps["width"]; children: ReactNode }>;
export function LessonShell({ title, description, eyebrow, actions, width = "lesson", children }: LessonShellProps) {
  return <LessonContainer width={width}><div className={styles.shell}><header className={styles.shellHeader}>{eyebrow && <strong className={styles.description}>{eyebrow}</strong>}<h1>{title}</h1>{description && <p>{description}</p>}{actions}</header><div className={styles.shellMain} data-lesson-main>{children}</div></div></LessonContainer>;
}
