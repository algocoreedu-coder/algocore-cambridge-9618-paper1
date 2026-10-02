import type { ReactNode } from "react";

import styles from "./AlgoCoreUI.module.css";

type HeadingLevel = 2 | 3 | 4;
function Heading({ level, children }: Readonly<{ level: HeadingLevel; children: ReactNode }>) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return <Tag>{children}</Tag>;
}

export type CardProps = Readonly<{ title?: string; headingLevel?: HeadingLevel; icon?: ReactNode; variant?: "lesson" | "question" | "hint" | "exam-tip" | "warning"; children: ReactNode }>;
export function Card({ title, headingLevel = 3, icon, variant = "lesson", children }: CardProps) {
  return <article className={styles.card} data-variant={variant}>{title && <header className={styles.cardHeader}>{icon && <span aria-hidden="true">{icon}</span>}<Heading level={headingLevel}>{title}</Heading></header>}{children}</article>;
}

export type CalloutProps = Readonly<{ title: string; headingLevel?: HeadingLevel; icon?: ReactNode; variant?: "info" | "success" | "warning" | "error"; children: ReactNode }>;
export function Callout({ title, headingLevel = 3, icon, variant = "info", children }: CalloutProps) {
  return <aside className={styles.callout} data-variant={variant} role={variant === "error" ? "alert" : "note"}><header className={styles.calloutHeader}>{icon && <span aria-hidden="true">{icon}</span>}<Heading level={headingLevel}>{title}</Heading></header>{children}</aside>;
}

const feedbackIcons = { info: "i", success: "✓", retry: "↻", incorrect: "!", complete: "✓" } as const;
export type FeedbackProps = Readonly<{ status: keyof typeof feedbackIcons; title: string; children?: ReactNode }>;
export function Feedback({ status, title, children }: FeedbackProps) {
  return <div className={styles.feedback} data-status={status} role={status === "incorrect" ? "alert" : "status"} aria-live={status === "incorrect" ? "assertive" : "polite"}><span className={styles.feedbackIcon} aria-hidden="true">{feedbackIcons[status]}</span><div><strong>{title}</strong>{children && <p>{children}</p>}</div></div>;
}

export type CodeLine = Readonly<{ number: number; text: string; active?: boolean }>;
export type CodePanelProps = Readonly<{ title: string; caption?: string; lines: readonly CodeLine[]; label?: string }>;
export function CodePanel({ title, caption, lines, label = title }: CodePanelProps) {
  return <figure className={styles.codePanel}><figcaption className={styles.codeHeader}><strong>{title}</strong>{caption && <span>{caption}</span>}</figcaption><pre tabIndex={0} aria-label={label}><code>{lines.map((line) => <span className={styles.codeLine} data-active={line.active || undefined} aria-current={line.active ? "step" : undefined} key={line.number}><span className={styles.lineNumber} aria-hidden="true">{line.number}</span><span>{line.text || " "}</span></span>)}</code></pre></figure>;
}

export type StateFact = Readonly<{ label: string; value: string | number | boolean; changed?: boolean }>;
export type StateVisualProps = Readonly<{ title: string; facts: readonly StateFact[]; emptyLabel?: string }>;
export function StateVisual({ title, facts, emptyLabel = "No state to display" }: StateVisualProps) {
  return <section className={styles.stateVisual} aria-label={title}><h3>{title}</h3>{facts.length > 0 ? <dl className={styles.facts}>{facts.map((fact) => <div className={styles.fact} data-changed={fact.changed || undefined} key={fact.label}><dt>{fact.label}</dt><dd>{String(fact.value)}</dd></div>)}</dl> : <p className={styles.description}>{emptyLabel}</p>}</section>;
}

export type DisclosureProps = Readonly<{ summary: string; children: ReactNode; open?: boolean }>;
export function Disclosure({ summary, children, open }: DisclosureProps) {
  return <details className={styles.disclosure} open={open}><summary>{summary}</summary><div className={styles.disclosureBody}>{children}</div></details>;
}
