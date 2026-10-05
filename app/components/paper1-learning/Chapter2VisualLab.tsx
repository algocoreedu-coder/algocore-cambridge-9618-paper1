"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button, Select } from "@/app/components/algocore-ui";
import oracleData from "@/content/paper1/chapter2-visual-oracles.json";
import type { Paper1Locale } from "@/app/lib/paper1/types";
import styles from "./Chapter2VisualLab.module.css";

type Localized = Readonly<{ en: string; vi: string }>;
type NodeKind = "client" | "server" | "network" | "cloud" | "database" | "warning" | "fibre" | "wireless" | "document";
type VisualNode = Readonly<{ id: string; label: Localized; kind: NodeKind; x: number; y: number }>;
type VisualEdge = Readonly<{ id: string; from: string; to: string; label: Localized }>;
type VisualMetric = Readonly<{ label: Localized; value: Localized }>;
type VisualStep = Readonly<{ title: Localized; explanation: Localized; activeNodes: readonly string[]; activeEdges: readonly string[]; metric?: VisualMetric }>;
type VisualScenario = Readonly<{ id: string; label: Localized; correctChoiceId: string; nodes: readonly VisualNode[]; edges: readonly VisualEdge[]; steps: readonly VisualStep[] }>;
type VisualOracle = Readonly<{
  lessonId: string;
  visualId: string;
  title: Localized;
  intro: Localized;
  prompt: Localized;
  choices: readonly Readonly<{ id: string; label: Localized }>[];
  scenarios: readonly VisualScenario[];
}>;

const oracles = oracleData as readonly VisualOracle[];
const nodeSize = { width: 116, height: 54 } as const;

function NetworkCanvas({ scenario, step, locale }: { readonly scenario: VisualScenario; readonly step: VisualStep; readonly locale: Paper1Locale }) {
  const markerId = useId().replaceAll(":", "");
  const nodes = useMemo(() => new Map(scenario.nodes.map((node) => [node.id, node])), [scenario.nodes]);
  return <div className={styles.canvasWrap} tabIndex={0} aria-label={locale === "vi" ? "Sơ đồ mạng tương tác; dùng phím mũi tên để cuộn khi cần" : "Interactive network diagram; use arrow keys to scroll when needed"}>
    <svg className={styles.canvas} viewBox="0 0 600 270" role="img" aria-labelledby={`${markerId}-title ${markerId}-desc`}>
      <title id={`${markerId}-title`}>{step.title[locale]}</title>
      <desc id={`${markerId}-desc`}>{step.explanation[locale]}</desc>
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" /></marker>
      </defs>
      <g className={styles.edges}>
        {scenario.edges.map((edge) => {
          const from = nodes.get(edge.from);
          const to = nodes.get(edge.to);
          if (!from || !to) return null;
          const active = step.activeEdges.includes(edge.id);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.max(1, Math.hypot(dx, dy));
          const inset = 56;
          const x1 = from.x + dx / length * inset;
          const y1 = from.y + dy / length * 26;
          const x2 = to.x - dx / length * inset;
          const y2 = to.y - dy / length * 26;
          return <g key={edge.id} data-active={active || undefined}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={`url(#${markerId})`} />
            <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle">{edge.label[locale]}</text>
            {active ? <circle className={styles.packet} r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path={`M${x1},${y1} L${x2},${y2}`} /></circle> : null}
          </g>;
        })}
      </g>
      <g className={styles.nodes}>
        {scenario.nodes.map((node) => {
          const active = step.activeNodes.includes(node.id);
          return <g key={node.id} transform={`translate(${node.x - nodeSize.width / 2} ${node.y - nodeSize.height / 2})`} data-active={active || undefined} data-kind={node.kind}>
            <rect width={nodeSize.width} height={nodeSize.height} rx="14" />
            <text x={nodeSize.width / 2} y={nodeSize.height / 2 + 4} textAnchor="middle">{node.label[locale]}</text>
          </g>;
        })}
      </g>
    </svg>
  </div>;
}

function Chapter2Journey({ oracle, locale }: { readonly oracle: VisualOracle; readonly locale: Paper1Locale }) {
  const [scenarioId, setScenarioId] = useState(oracle.scenarios[0]?.id ?? "");
  const [stepIndex, setStepIndex] = useState(0);
  const [prediction, setPrediction] = useState<string>();
  const predictionName = useId();
  const scenario = oracle.scenarios.find((entry) => entry.id === scenarioId) ?? oracle.scenarios[0];
  const lastIndex = Math.max(0, scenario.steps.length - 1);
  const safeIndex = Math.min(stepIndex, lastIndex);
  const step = scenario.steps[safeIndex];
  const finished = safeIndex === lastIndex;
  const chosen = oracle.choices.find((choice) => choice.id === prediction);
  const expected = oracle.choices.find((choice) => choice.id === scenario.correctChoiceId);
  const matched = finished && prediction === scenario.correctChoiceId;

  useEffect(() => { setStepIndex(0); setPrediction(undefined); }, [scenarioId]);

  const reset = () => {
    setScenarioId(oracle.scenarios[0]?.id ?? "");
    setStepIndex(0);
    setPrediction(undefined);
  };

  return <section className={styles.lab} data-paper1-visual={oracle.visualId} aria-labelledby={`${oracle.visualId}-title`}>
    <header className={styles.header}>
      <span>CHAPTER 2 · {oracle.visualId}</span>
      <h3 id={`${oracle.visualId}-title`}>{oracle.title[locale]}</h3>
      <p>{oracle.intro[locale]}</p>
    </header>

    <div className={styles.controls}>
      <Select id={`${oracle.lessonId}-scenario`} label={locale === "vi" ? "Tình huống" : "Scenario"} value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
        {oracle.scenarios.map((entry) => <option key={entry.id} value={entry.id}>{entry.label[locale]}</option>)}
      </Select>
      <div className={styles.scenarioNote}><strong>{locale === "vi" ? "Đổi input" : "Change the input"}</strong><span>{locale === "vi" ? "Mỗi tình huống có outcome và oracle riêng." : "Each scenario has its own outcome and oracle."}</span></div>
    </div>

    <fieldset className={styles.prediction}>
      <legend>{locale === "vi" ? "Dự đoán trước khi chạy mô hình" : "Predict before running the model"}</legend>
      <p>{oracle.prompt[locale]}</p>
      <div>{oracle.choices.map((choice) => <label key={choice.id}><input type="radio" name={predictionName} checked={prediction === choice.id} onChange={() => setPrediction(choice.id)} /><span>{choice.label[locale]}</span></label>)}</div>
      <small aria-live="polite">{prediction ? (locale === "vi" ? "Đã ghi dự đoán. Bây giờ đi từng bước để kiểm chứng." : "Prediction recorded. Step through the model to test it.") : (locale === "vi" ? "Chọn một dự đoán để bật nút Tiếp theo." : "Choose a prediction to enable Next.")}</small>
    </fieldset>

    <div className={styles.stage}>
      <div className={styles.meter} style={{ "--step-count": scenario.steps.length } as CSSProperties} role="img" aria-label={locale === "vi" ? `Bước ${safeIndex + 1} trên ${scenario.steps.length}` : `Step ${safeIndex + 1} of ${scenario.steps.length}`}>
        {scenario.steps.map((_, index) => <span key={index} data-current={index === safeIndex || undefined} data-complete={index < safeIndex || undefined} />)}
      </div>
      <NetworkCanvas scenario={scenario} step={step} locale={locale} />
      <div className={styles.explanation} aria-live="polite" aria-atomic="true">
        <span>{locale === "vi" ? `BƯỚC ${safeIndex + 1}` : `STEP ${safeIndex + 1}`}</span>
        <h4>{step.title[locale]}</h4>
        <p>{step.explanation[locale]}</p>
        {step.metric ? <dl><div><dt>{step.metric.label[locale]}</dt><dd>{step.metric.value[locale]}</dd></div></dl> : null}
      </div>
      <div className={styles.textEquivalent}><strong>{locale === "vi" ? "Mô tả tương đương bằng chữ" : "Text equivalent"}</strong><p>{step.explanation[locale]}</p></div>
      {finished && prediction ? <aside className={styles.comparison} data-match={matched || undefined} aria-live="polite">
        <strong>{matched ? (locale === "vi" ? "Dự đoán khớp với mô hình" : "Prediction matched the model") : (locale === "vi" ? "Hãy điều chỉnh dự đoán" : "Revise the prediction")}</strong>
        <dl><div><dt>{locale === "vi" ? "Bạn chọn" : "You chose"}</dt><dd>{chosen?.label[locale]}</dd></div><div><dt>{locale === "vi" ? "Mô hình cho thấy" : "Model outcome"}</dt><dd>{expected?.label[locale]}</dd></div></dl>
        <p>{step.explanation[locale]}</p>
      </aside> : null}
      <nav className={styles.navigation} aria-label={locale === "vi" ? "Điều khiển mô hình" : "Model controls"}>
        <Button variant="secondary" disabled={safeIndex === 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))}><ArrowLeft size={17} aria-hidden="true" />{locale === "vi" ? "Quay lại" : "Back"}</Button>
        <Button variant="quiet" onClick={reset}><RotateCcw size={17} aria-hidden="true" />{locale === "vi" ? "Đặt lại" : "Reset"}</Button>
        <Button disabled={!prediction || finished} onClick={() => setStepIndex((value) => Math.min(lastIndex, value + 1))}>{locale === "vi" ? "Tiếp theo" : "Next"}<ArrowRight size={17} aria-hidden="true" /></Button>
      </nav>
    </div>
  </section>;
}

export function Chapter2VisualLab({ lessonId, locale }: { readonly lessonId: string; readonly locale: Paper1Locale }) {
  const oracle = oracles.find((entry) => entry.lessonId === lessonId);
  if (!oracle) return null;
  return <Chapter2Journey oracle={oracle} locale={locale} />;
}

export const chapter2VisualLessonIds = Object.freeze(oracles.map((entry) => entry.lessonId));
