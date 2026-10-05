"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button, Select } from "@/app/components/algocore-ui";
import {
  BRANCH_PROGRAM,
  LOAD_STORE_PROGRAM,
  PERFORMANCE_CASES,
  addressModel,
  addressingFrames,
  assemblerFrames,
  assembleFixture,
  binary8,
  branchPacketFrames,
  cpuPacketFrames,
  cpuTransferFrames,
  loadStorePacketFrames,
  mask8,
  maskFrames,
  normalizeBoundedInteger,
  performanceFrames,
  shift8,
  shiftFrames,
  type AddressingMode,
  type BranchPacket,
  type CpuPacket,
  type CpuSnapshot,
  type DeviceScenario,
  type LoadStorePacket,
  type MaskOperation,
  type PerformanceCase,
  type ShiftKind,
  type TransferMode,
} from "@/app/lib/paper1/chapter4-models";
import type { Paper1Locale } from "@/app/lib/paper1/types";
import styles from "./Chapter4VisualLab.module.css";

type LedgerEntry = Readonly<{ label: string; value: string | number; current?: boolean }>;
type Scene = Readonly<{ title: string; explanation: string; graphic: ReactNode; ledger: readonly LedgerEntry[] }>;
type Prediction = Readonly<{ prompt: string; choices: readonly Readonly<{ id: string; label: string }>[]; correctChoiceId: string }>;
type FlowNode = Readonly<{ id: string; label: string; value?: string | number }>;

const copy = (locale: Paper1Locale, en: string, vi: string) => locale === "vi" ? vi : en;
const shown = (value: unknown) => value === null || value === undefined ? "—" : String(value);

function NumberControl({ id, label, value, min, max, onChange }: { readonly id: string; readonly label: string; readonly value: number; readonly min: number; readonly max: number; readonly onChange: (value: number) => void }) {
  return <label className={styles.numberControl} htmlFor={id}><span>{label}</span><input id={id} type="number" inputMode="numeric" min={min} max={max} step={1} value={value} onChange={(event) => onChange(normalizeBoundedInteger(Number(event.target.value), min, max))} /></label>;
}

type JourneyProps = Readonly<{
  readonly locale: Paper1Locale;
  readonly visualId: string;
  readonly title: string;
  readonly intro: string;
  readonly controls: ReactNode;
  readonly prediction: Prediction;
  readonly scenes: readonly Scene[];
  readonly stateKey: string;
  readonly onReset: () => void;
  readonly staticEquivalent?: ReactNode;
}>;

function Journey({ locale, visualId, title, intro, controls, prediction, scenes, stateKey, onReset, staticEquivalent }: JourneyProps) {
  return <section className={styles.lab} data-paper1-visual={visualId} aria-labelledby={`${visualId}-title`}>
    <header className={styles.header}>
      <span>CHAPTER 4 · {visualId}</span>
      <h3 id={`${visualId}-title`}>{title}</h3>
      <p>{intro}</p>
    </header>
    <div className={styles.controls}>{controls}<div className={styles.controlNote}><strong>{copy(locale, "Change the case", "Đổi tình huống")}</strong><span>{copy(locale, "The four-step packet and prediction reset so the next trace starts from a known state.", "Packet bốn bước và prediction sẽ reset để trace tiếp theo bắt đầu từ state đã biết.")}</span></div></div>
    <JourneySession key={stateKey} locale={locale} prediction={prediction} scenes={scenes} onReset={onReset} staticEquivalent={staticEquivalent} />
  </section>;
}

function JourneySession({ locale, prediction, scenes, onReset, staticEquivalent }: Pick<JourneyProps, "locale" | "prediction" | "scenes" | "onReset" | "staticEquivalent">) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<string>();
  const radioName = useId();
  const safeStep = Math.min(step, scenes.length - 1);
  const current = scenes[safeStep];
  const finished = safeStep === scenes.length - 1;
  const selected = prediction.choices.find((entry) => entry.id === choice);
  const expected = prediction.choices.find((entry) => entry.id === prediction.correctChoiceId);

  const reset = () => {
    onReset();
    setStep(0);
    setChoice(undefined);
  };

  return <>
    <fieldset className={styles.prediction}>
      <legend>{copy(locale, "Predict before revealing the trace", "Dự đoán trước khi xem trace")}</legend>
      <p>{prediction.prompt}</p>
      <div>{prediction.choices.map((entry) => <label key={entry.id}><input type="radio" name={radioName} checked={choice === entry.id} onChange={() => setChoice(entry.id)} /><span>{entry.label}</span></label>)}</div>
      <small aria-live="polite">{choice ? copy(locale, "Prediction recorded. Use Next to reveal one semantic change.", "Đã ghi dự đoán. Dùng Tiếp theo để mở một semantic change.") : copy(locale, "Choose one answer to enable Next.", "Chọn một đáp án để bật nút Tiếp theo.")}</small>
    </fieldset>
    <div className={styles.stage}>
      <div className={styles.meter} style={{ "--step-count": scenes.length } as CSSProperties} role="img" aria-label={copy(locale, `Step ${safeStep + 1} of ${scenes.length}`, `Bước ${safeStep + 1} trên ${scenes.length}`)}>{scenes.map((_, index) => <span key={index} data-current={index === safeStep || undefined} data-complete={index < safeStep || undefined} />)}</div>
      <div className={styles.instrument}>
        <div className={styles.canvasWrap} tabIndex={0} aria-label={copy(locale, "Interactive trace diagram", "Sơ đồ trace tương tác")}>{current.graphic}</div>
        <aside className={styles.ledger} aria-label={copy(locale, "State ledger", "State ledger")}><strong>{copy(locale, "STATE LEDGER", "STATE LEDGER")}</strong><dl>{current.ledger.map((entry, index) => <div key={`${entry.label}-${index}`} data-current={entry.current || undefined}><dt><span>{index + 1}</span>{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl></aside>
      </div>
      <div className={styles.explanation} aria-live="polite" aria-atomic="true">
        <span>{copy(locale, `STEP ${safeStep + 1}`, `BƯỚC ${safeStep + 1}`)}</span>
        <h4>{current.title}</h4>
        <p>{current.explanation}</p>
      </div>
      <div className={styles.textEquivalent}><strong>{copy(locale, "Cumulative text equivalent", "Mô tả chữ tích lũy")}</strong><p>{copy(locale, "This ordered trace keeps every revealed transition available without relying on motion or colour.", "Trace theo thứ tự này giữ lại mọi chuyển đổi đã mở mà không phụ thuộc vào chuyển động hoặc màu sắc.")}</p><ol>{scenes.slice(0, safeStep + 1).map((scene, sceneIndex) => <li key={`${scene.title}-${sceneIndex}`} aria-current={sceneIndex === safeStep ? "step" : undefined}><h5>{copy(locale, `Step ${sceneIndex + 1}`, `Bước ${sceneIndex + 1}`)} · {scene.title}</h5><p>{scene.explanation}</p><dl>{scene.ledger.map((entry, entryIndex) => <div key={`${entry.label}-${entryIndex}`}><dt>{entry.label}</dt><dd>{entry.value}</dd></div>)}</dl></li>)}</ol>{finished && staticEquivalent ? <div className={styles.staticEquivalent}>{staticEquivalent}</div> : null}</div>
      {finished && choice ? <aside className={styles.comparison} data-match={choice === prediction.correctChoiceId || undefined} aria-live="polite"><strong>{choice === prediction.correctChoiceId ? copy(locale, "Prediction matched the model", "Dự đoán khớp với mô hình") : copy(locale, "Revise the prediction", "Hãy điều chỉnh dự đoán")}</strong><dl><div><dt>{copy(locale, "You chose", "Bạn chọn")}</dt><dd>{selected?.label}</dd></div><div><dt>{copy(locale, "Model outcome", "Kết quả mô hình")}</dt><dd>{expected?.label}</dd></div></dl></aside> : null}
      <nav className={styles.navigation} aria-label={copy(locale, "Model controls", "Điều khiển mô hình")}>
        <Button variant="secondary" disabled={safeStep === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft size={17} aria-hidden="true" />{copy(locale, "Back", "Quay lại")}</Button>
        <Button variant="quiet" onClick={reset}><RotateCcw size={17} aria-hidden="true" />{copy(locale, "Reset", "Đặt lại")}</Button>
        <Button disabled={!choice || finished} onClick={() => setStep((value) => Math.min(scenes.length - 1, value + 1))}>{copy(locale, "Next", "Tiếp theo")}<ArrowRight size={17} aria-hidden="true" /></Button>
      </nav>
    </div>
  </>;
}

function SignalFlow({ nodes, activeIds, payload, locale }: { readonly nodes: readonly FlowNode[]; readonly activeIds: readonly string[]; readonly payload?: string | number; readonly locale: Paper1Locale }) {
  return <div className={styles.signalFlow} role="img" aria-label={copy(locale, `Trace with ${activeIds.length} active object(s)`, `Trace có ${activeIds.length} object đang active`)}>{nodes.map((node, index) => <div className={styles.flowNodeWrap} key={node.id}><div className={styles.flowNode} data-active={activeIds.includes(node.id) || undefined}><small>{String(index + 1).padStart(2, "0")}</small><strong>{node.label}</strong>{node.value !== undefined ? <span>{node.value}</span> : null}{activeIds.includes(node.id) && payload !== undefined ? <b className={styles.payload} aria-hidden="true">{payload}</b> : null}</div>{index < nodes.length - 1 ? <i aria-hidden="true">→</i> : null}</div>)}</div>;
}

const active = (activeIds: readonly string[], ...ids: string[]) => ids.some((id) => activeIds.includes(id));

const cpuLedger = (state: CpuSnapshot, locale: Paper1Locale): readonly LedgerEntry[] => [
  { label: "PC / MAR", value: `${shown(state.PC)} / ${shown(state.MAR)}` },
  { label: "MDR / CIR", value: `${shown(state.MDR)} / ${shown(state.CIR)}` },
  { label: "ACC / STATUS", value: `${shown(state.ACC)} / ${state.status}` },
  { label: "IX / ALU", value: `${shown(state.IX)} / ${copy(locale, "arithmetic + logic", "số học + logic")}` },
  { label: "SYSTEM CLOCK / IAS", value: copy(locale, "timing pulses / Immediate Access Store: primary memory holding active instructions and data", "xung nhịp / Immediate Access Store: bộ nhớ sơ cấp chứa lệnh và dữ liệu đang dùng") },
  { label: "ADDRESS / DATA", value: `${shown(state.addressBus)} / ${shown(state.dataBus)}` },
  { label: "MEMORY CONTROL", value: state.memoryControl },
  { label: "INTERRUPT REQUEST", value: state.interruptRequest },
  { label: "CU STATE", value: state.cuState },
  ...(state.savedContext ? [{ label: "SAVED PC / ACC / STATUS", value: `${state.savedContext.PC} / ${state.savedContext.ACC} / ${state.savedContext.status}` }] : []),
];

function cpuPacketNodes(frameId: string | undefined, state: CpuSnapshot, locale: Paper1Locale): FlowNode[] {
  const saved = state.savedContext ? `${state.savedContext.PC} / ${state.savedContext.ACC} / ${state.savedContext.status}` : "—";
  switch (frameId) {
    case "mar-from-pc": return [{ id: "PC", label: "PC", value: state.PC }, { id: "MAR", label: "MAR", value: state.MAR }];
    case "increment-pc": return [{ id: "PC", label: copy(locale, "PC advances", "PC tăng"), value: state.PC }];
    case "instruction-to-mdr":
    case "operand-read": return [{ id: "memory", label: copy(locale, "Memory source", "Nguồn Memory"), value: state.memoryValue }, { id: "dataBus", label: copy(locale, "Data bus", "Data bus"), value: state.dataBus }, { id: "MDR", label: "MDR", value: state.MDR }];
    case "mdr-to-cir": return [{ id: "MDR", label: "MDR", value: state.MDR }, { id: "CIR", label: "CIR", value: state.CIR }];
    case "decode": return [{ id: "CIR", label: "CIR", value: state.CIR }, { id: "CU", label: copy(locale, "Control unit", "Control unit"), value: state.cuState }];
    case "operand-address": return [{ id: "CU", label: copy(locale, "Decoded operand", "Operand đã decode"), value: "100" }, { id: "MAR", label: "MAR", value: state.MAR }];
    case "acc-from-mdr": return [{ id: "MDR", label: "MDR", value: state.MDR }, { id: "ACC", label: "ACC", value: state.ACC }];
    case "interrupt-check": return [{ id: "device", label: copy(locale, "Device", "Thiết bị"), value: state.interruptRequest }, { id: "interruptRequest", label: copy(locale, "Interrupt request", "Yêu cầu ngắt"), value: state.interruptRequest }, { id: "CU", label: "CPU / CU", value: state.cuState }];
    case "save-context": return [{ id: "mainContext", label: "PC / ACC / STATUS", value: `${state.PC} / ${state.ACC} / ${state.status}` }, { id: "savedContext", label: copy(locale, "Saved context", "Context đã lưu"), value: saved }];
    case "dispatch": return state.interruptRequest === "NONE"
      ? [{ id: "CU", label: copy(locale, "Prepare the next fetch", "Chuẩn bị fetch tiếp theo"), value: `PC=${state.PC}` }]
      : [{ id: "CU", label: copy(locale, "CU dispatch", "CU dispatch"), value: state.cuState }, { id: "PC", label: "PC", value: state.PC }];
    case "service": return state.interruptRequest === "NONE"
      ? [{ id: "CU", label: copy(locale, "Main program continues", "Chương trình chính tiếp tục"), value: `PC=${state.PC}` }]
      : [{ id: "CU", label: copy(locale, "ISR state", "State ISR"), value: state.cuState }, { id: "isrState", label: "PC / ACC / STATUS", value: `${state.PC} / ${state.ACC} / ${state.status}` }];
    case "restore-status": return [{ id: "savedContext", label: copy(locale, "Saved context", "Context đã lưu"), value: saved }, { id: "status", label: "STATUS", value: state.status }];
    case "restore-acc": return [{ id: "savedContext", label: copy(locale, "Saved context", "Context đã lưu"), value: saved }, { id: "ACC", label: "ACC", value: state.ACC }];
    case "restore-pc": return [{ id: "savedContext", label: copy(locale, "Saved context", "Context đã lưu"), value: saved }, { id: "PC", label: "PC", value: state.PC }];
    default: return [{ id: "CU", label: copy(locale, "Control unit state", "State control unit"), value: state.cuState }];
  }
}

function CpuBoard({ state, activeIds, payload, locale, transferMode, frameId }: { readonly state: CpuSnapshot; readonly activeIds: readonly string[]; readonly payload?: string | number; readonly locale: Paper1Locale; readonly transferMode?: TransferMode; readonly frameId?: string }) {
  const nodes: FlowNode[] = transferMode
    ? transferMode === "read"
      ? [{ id: "memory", label: copy(locale, "Memory source", "Nguồn Memory"), value: state.memoryValue }, { id: "dataBus", label: copy(locale, "Data bus", "Data bus"), value: state.dataBus }, { id: "MDR", label: copy(locale, "MDR destination", "Đích MDR"), value: state.MDR }]
      : [{ id: "MDR", label: copy(locale, "MDR source", "Nguồn MDR"), value: state.MDR }, { id: "dataBus", label: copy(locale, "Data bus", "Data bus"), value: state.dataBus }, { id: "memory", label: copy(locale, "Memory destination", "Đích Memory"), value: state.memoryValue }]
    : cpuPacketNodes(frameId, state, locale);
  const dataDirection = transferMode === "write" ? "MDR → Memory" : transferMode === "read" ? "Memory → MDR" : "Memory ↔ MDR";
  const nodeIds = nodes.map((node) => node.id);
  const flowActiveIds = transferMode ? activeIds.filter((id) => nodeIds.includes(id)) : nodeIds;
  const emphasizeAux = flowActiveIds.length === 0;
  return <div className={styles.cpuBoard}><SignalFlow locale={locale} nodes={nodes} activeIds={flowActiveIds} payload={payload} /><div className={styles.registerTiles} aria-label={copy(locale, "CPU register state", "State các thanh ghi CPU")}><div data-active={emphasizeAux && activeIds.includes("PC") || undefined}><span>PC</span><b>{state.PC}</b></div><div data-active={emphasizeAux && activeIds.includes("MAR") || undefined}><span>MAR</span><b>{state.MAR}</b></div><div data-active={emphasizeAux && activeIds.includes("MDR") || undefined}><span>MDR</span><b>{state.MDR}</b></div><div data-active={emphasizeAux && activeIds.includes("CIR") || undefined}><span>CIR</span><b>{state.CIR}</b></div><div data-active={emphasizeAux && activeIds.includes("ACC") || undefined}><span>ACC</span><b>{state.ACC}</b></div><div><span>IX</span><b>{state.IX}</b></div><div data-active={emphasizeAux && activeIds.includes("status") || undefined}><span>STATUS</span><b>{state.status}</b></div></div><div className={styles.registerTiles} aria-label={copy(locale, "Processor components and primary memory", "Các thành phần processor và bộ nhớ sơ cấp")}><div><span>ALU</span><b>{copy(locale, "arithmetic + logic", "số học + logic")}</b></div><div><span>SYSTEM CLOCK</span><b>{copy(locale, "timing pulses", "xung nhịp")}</b></div><div><span>IAS · IMMEDIATE ACCESS STORE</span><b>{copy(locale, "primary memory holding active instructions and data", "bộ nhớ sơ cấp chứa lệnh và dữ liệu đang dùng")}</b></div><div data-active={emphasizeAux && activeIds.includes("CU") || undefined}><span>CU STATE</span><b>{state.cuState}</b></div></div><div className={styles.busRack}><div data-active={emphasizeAux && activeIds.includes("addressBus") || undefined}><span>{copy(locale, "ADDRESS BUS · MAR → Memory", "ADDRESS BUS · MAR → Memory")}</span><b>{shown(state.addressBus)}</b></div><div data-active={emphasizeAux && activeIds.includes("dataBus") || undefined}><span>{copy(locale, `DATA BUS · ${dataDirection}`, `DATA BUS · ${dataDirection}`)}</span><b>{shown(state.dataBus)}</b></div><div data-active={emphasizeAux && activeIds.includes("controlBus") || undefined}><span>{copy(locale, "MEMORY CONTROL · CU → Memory", "MEMORY CONTROL · CU → Memory")}</span><b>{state.memoryControl}</b></div><div data-active={emphasizeAux && activeIds.includes("interruptRequest") || undefined}><span>{copy(locale, "INTERRUPT REQUEST · Device → CPU", "INTERRUPT REQUEST · Thiết bị → CPU")}</span><b>{state.interruptRequest}</b></div></div></div>;
}

function CpuTransferLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { mode: "read" as TransferMode, address: 100, payload: 42 };
  const [mode, setMode] = useState(defaults.mode);
  const [address, setAddress] = useState(defaults.address);
  const [payload, setPayload] = useState(defaults.payload);
  const frames = cpuTransferFrames(mode, address, payload);
  const titles = [copy(locale, "Identify source and destination", "Xác định source và destination"), copy(locale, "Select the address", "Chọn address"), copy(locale, "Issue the control signal", "Phát control signal"), copy(locale, "Commit the payload", "Commit payload")];
  const explanations = mode === "read" ? [
    copy(locale, `Memory[${address}] contains ${payload}; MDR is the destination. The address is not the stored contents.`, `Memory[${address}] chứa ${payload}; MDR là destination. Address không phải contents được lưu.`),
    copy(locale, `MAR receives address ${address}, and the address bus selects that location.`, `MAR nhận address ${address}, và address bus chọn location đó.`),
    copy(locale, "The CU issues READ on the control bus. No contents have moved yet.", "CU phát READ trên control bus. Contents chưa di chuyển."),
    copy(locale, `The data bus carries ${payload} from Memory[${address}] to MDR.`, `Data bus mang ${payload} từ Memory[${address}] tới MDR.`),
  ] : [
    copy(locale, `${payload} is ready in MDR; Memory[${address}] is the destination.`, `${payload} đã sẵn trong MDR; Memory[${address}] là destination.`),
    copy(locale, `MAR receives address ${address}, and the address bus selects that location.`, `MAR nhận address ${address}, và address bus chọn location đó.`),
    copy(locale, "The CU issues WRITE on the control bus. Memory is selected but unchanged.", "CU phát WRITE trên control bus. Memory đã được chọn nhưng chưa đổi."),
    copy(locale, `The data bus carries ${payload} from MDR to Memory[${address}].`, `Data bus mang ${payload} từ MDR tới Memory[${address}].`),
  ];
  const scenes = frames.map((frame, index): Scene => ({ title: titles[index], explanation: explanations[index], graphic: <CpuBoard locale={locale} state={frame.state} activeIds={frame.activeIds} payload={frame.payload} transferMode={mode} frameId={frame.id} />, ledger: cpuLedger(frame.state, locale) }));
  return <Journey locale={locale} visualId="VIS-P1-L25" title={copy(locale, "Stored-program bus bench", "Bàn trace bus stored-program")} intro={copy(locale, "Follow one bounded memory transfer and audit its address, control signal, data direction and final state.", "Theo dõi một memory transfer hữu hạn và audit address, control signal, hướng data cùng final state.")} stateKey={`${mode}-${address}-${payload}`} onReset={() => { setMode(defaults.mode); setAddress(defaults.address); setPayload(defaults.payload); }} controls={<><Select id="p1-l25-mode" label={copy(locale, "Transfer", "Transfer")} value={mode} onChange={(event) => setMode(event.target.value as TransferMode)}><option value="read">{copy(locale, "Memory read", "Đọc memory")}</option><option value="write">{copy(locale, "Memory write", "Ghi memory")}</option></Select><NumberControl id="p1-l25-address" label={copy(locale, "Address", "Address")} value={address} min={0} max={255} onChange={setAddress} /><NumberControl id="p1-l25-payload" label={copy(locale, "8-bit payload", "Payload 8-bit")} value={payload} min={0} max={255} onChange={setPayload} /></>} prediction={{ prompt: copy(locale, "Which bus carries the stored contents?", "Bus nào mang contents được lưu?"), choices: [{ id: "data", label: copy(locale, "Data bus", "Data bus") }, { id: "address", label: copy(locale, "Address bus", "Address bus") }, { id: "control", label: copy(locale, "Control bus", "Control bus") }], correctChoiceId: "data" }} scenes={scenes} />;
}

const perfLabels: Readonly<Record<PerformanceCase, Readonly<{ en: string; vi: string }>>> = {
  processor: { en: "Processor type", vi: "Loại bộ xử lý" }, clock: { en: "Clock speed", vi: "Clock speed" }, cores: { en: "Processor cores", vi: "Processor core" }, cache: { en: "Cache", vi: "Cache" }, bus: { en: "Data-bus width", vi: "Độ rộng data bus" }, usb: { en: "USB", vi: "USB" }, hdmi: { en: "HDMI", vi: "HDMI" }, vga: { en: "VGA", vi: "VGA" },
};

const perfText: Readonly<Record<string, Readonly<{ en: string; vi: string }>>> = {
  "workload-instruction-profile": { en: "A workload with a particular instruction profile", vi: "Workload có đặc trưng instruction riêng" }, "different-processor-type": { en: "Choose a processor design suited to the task", vi: "Chọn thiết kế bộ xử lý phù hợp với tác vụ" }, "architecture-may-match-workload": { en: "Its architecture may execute that workload more effectively", vi: "Kiến trúc có thể thực thi workload đó hiệu quả hơn" }, "software-system-and-task-still-matter": { en: "Software, the rest of the system and the actual task still limit the result", vi: "Software, phần còn lại của hệ thống và tác vụ thực tế vẫn giới hạn kết quả" },
  "cpu-bound": { en: "A CPU-bound workload", vi: "Workload bị giới hạn bởi CPU" }, "higher-clock": { en: "Increase clock frequency", vi: "Tăng clock frequency" }, "more-cycles-per-second": { en: "More cycles are available each second", vi: "Có thêm cycle mỗi giây" }, "cpi-and-io-still-matter": { en: "Cycles per instruction and I/O waiting still limit the result", vi: "Cycle per instruction và chờ I/O vẫn giới hạn kết quả" },
  "parallelisable-work": { en: "Work that can be split", vi: "Work có thể chia" }, "more-cores": { en: "Add processor cores", vi: "Thêm processor core" }, "parts-run-concurrently": { en: "Independent parts may run concurrently", vi: "Các phần độc lập có thể chạy đồng thời" }, "serial-work-and-coordination": { en: "Serial work and coordination cap the benefit", vi: "Work tuần tự và coordination giới hạn lợi ích" },
  "repeated-data-read": { en: "Repeated reads of the same data", vi: "Đọc lặp lại cùng data" }, "nearer-copy": { en: "Keep a copy near the CPU", vi: "Giữ bản sao gần CPU" }, "cache-hit-reduces-wait": { en: "A cache hit reduces waiting", vi: "Cache hit giảm thời gian chờ" }, "cache-miss-needs-slower-memory": { en: "A miss still reaches slower memory", vi: "Cache miss vẫn truy cập memory chậm hơn" },
  "word-transfer": { en: "Transfer one word", vi: "Truyền một word" }, "wider-data-bus": { en: "Use a wider data bus", vi: "Dùng data bus rộng hơn" }, "more-bits-per-transfer": { en: "More bits move per transfer", vi: "Nhiều bit hơn mỗi transfer" }, "compatibility-and-workload": { en: "CPU, memory and workload must benefit", vi: "CPU, memory và workload phải phù hợp" },
  "peripheral-data": { en: "Connect a peripheral for data", vi: "Kết nối peripheral để trao đổi data" }, usb: { en: "Use USB", vi: "Dùng USB" }, "data-exchange": { en: "Peripheral data exchange", vi: "Trao đổi data với peripheral" }, "version-device-cable": { en: "Capability depends on version, device and cable", vi: "Khả năng phụ thuộc version, device và cable" },
  "digital-display": { en: "Digital display with picture and sound", vi: "Display số cần hình và âm thanh" }, hdmi: { en: "Use HDMI", vi: "Dùng HDMI" }, "digital-video-and-audio": { en: "Digital video and audio", vi: "Digital video và audio" }, "matching-compatible-endpoints": { en: "Both endpoints must be compatible", vi: "Hai endpoint phải tương thích" },
  "analogue-display": { en: "Compatible analogue display", vi: "Display analogue tương thích" }, vga: { en: "Use VGA", vi: "Dùng VGA" }, "analogue-video": { en: "Analogue video", vi: "Analogue video" }, "no-standard-audio": { en: "The standard connection carries no audio", vi: "Kết nối chuẩn này không mang audio" },
};
const perfCopy = (locale: Paper1Locale, key: string) => perfText[key]?.[locale] ?? key;

function PerformanceLab({ locale }: { readonly locale: Paper1Locale }) {
  const [selected, setSelected] = useState<PerformanceCase>("clock");
  const frames = performanceFrames(selected);
  const facts = PERFORMANCE_CASES[selected];
  const labels = [facts.need, facts.change, facts.effect, facts.limit];
  const titles = [copy(locale, "Identify the need", "Xác định nhu cầu"), copy(locale, "Change one factor", "Đổi một yếu tố"), copy(locale, "Reveal the possible effect", "Mở possible effect"), copy(locale, "Expose the limiting condition", "Nêu limiting condition")];
  const scenes = frames.map((frame, index): Scene => ({ title: titles[index], explanation: perfCopy(locale, frame.state.fact), graphic: <SignalFlow locale={locale} nodes={labels.map((key, nodeIndex) => ({ id: ["need", "change", "effect", "limit"][nodeIndex], label: perfCopy(locale, key) }))} activeIds={frame.activeIds} payload={index + 1} />, ledger: [{ label: copy(locale, "Case", "Tình huống"), value: perfLabels[selected][locale] }, { label: copy(locale, "Current fact", "Fact hiện tại"), value: perfCopy(locale, frame.state.fact) }, { label: copy(locale, "Claim type", "Loại claim"), value: facts.family === "performance" ? copy(locale, "conditional comparison", "so sánh có điều kiện") : copy(locale, "signal/use match", "match signal/use") }] }));
  const port = facts.family === "port";
  const correct = port ? selected : "conditional";
  return <Journey locale={locale} visualId="VIS-P1-L26" title={copy(locale, "Constraint comparison bench", "Bàn so sánh theo constraint")} intro={copy(locale, "Change one condition, trace its possible benefit, then reveal the bottleneck or compatibility limit.", "Đổi một condition, trace lợi ích có thể có rồi mở bottleneck hoặc giới hạn tương thích.")} stateKey={selected} onReset={() => setSelected("clock")} controls={<Select id="p1-l26-case" label={copy(locale, "Factor or port", "Yếu tố hoặc port")} value={selected} onChange={(event) => setSelected(event.target.value as PerformanceCase)}>{(Object.keys(PERFORMANCE_CASES) as PerformanceCase[]).map((key) => <option key={key} value={key}>{perfLabels[key][locale]}</option>)}</Select>} prediction={{ prompt: port ? copy(locale, "Which connection matches this signal/use?", "Kết nối nào match signal/use này?") : copy(locale, "Does changing this factor guarantee proportional speed-up for every program?", "Đổi yếu tố này có bảo đảm mọi program nhanh lên theo cùng tỷ lệ không?"), choices: port ? [{ id: "usb", label: "USB" }, { id: "hdmi", label: "HDMI" }, { id: "vga", label: "VGA" }] : [{ id: "conditional", label: copy(locale, "No — benefit depends on workload and limits", "Không — lợi ích phụ thuộc workload và giới hạn") }, { id: "proportional", label: copy(locale, "Yes — always proportional", "Có — luôn tỷ lệ thuận") }, { id: "none", label: copy(locale, "It can never help", "Nó không bao giờ có ích") }], correctChoiceId: correct }} scenes={scenes} />;
}

const cpuPacketLabels: Readonly<Record<CpuPacket, Readonly<{ en: string; vi: string }>>> = { fetch: { en: "Instruction fetch", vi: "Fetch instruction" }, execute: { en: "Decode and execute", vi: "Decode và execute" }, interrupt: { en: "Interrupt dispatch", vi: "Dispatch interrupt" }, return: { en: "Return from ISR", vi: "Return từ ISR" } };

function CpuCycleLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults: Readonly<{ operand: number; interrupt: "none" | "device"; packet: CpuPacket }> = { operand: 42, interrupt: "device", packet: "fetch" };
  const [operand, setOperand] = useState(defaults.operand);
  const [interrupt, setInterrupt] = useState<"none" | "device">(defaults.interrupt);
  const [packet, setPacket] = useState<CpuPacket>(defaults.packet);
  const frames = cpuPacketFrames(packet, operand, interrupt === "device");
  const titleMap: Readonly<Record<string, Readonly<{ en: string; vi: string }>>> = {
    "mar-from-pc": { en: "MAR receives the instruction address", vi: "MAR nhận instruction address" }, "increment-pc": { en: "PC advances", vi: "PC tăng" }, "instruction-to-mdr": { en: "Read the instruction into MDR", vi: "Đọc instruction vào MDR" }, "mdr-to-cir": { en: "Copy the instruction to CIR", vi: "Copy instruction sang CIR" }, decode: { en: "Decode opcode and operand", vi: "Decode opcode và operand" }, "operand-address": { en: "Select the operand address", vi: "Chọn operand address" }, "operand-read": { en: "Read the operand", vi: "Đọc operand" }, "acc-from-mdr": { en: "Execute LDD", vi: "Execute LDD" }, "interrupt-check": { en: "Check after the instruction", vi: "Check sau instruction" }, "save-context": { en: "Save the return context", vi: "Lưu return context" }, dispatch: { en: "Branch to the ISR", vi: "Branch tới ISR" }, service: { en: "Service the device", vi: "Service device" }, "isr-complete": { en: "Finish the ISR", vi: "Hoàn tất ISR" }, "restore-status": { en: "Restore Status", vi: "Restore Status" }, "restore-acc": { en: "Restore ACC", vi: "Restore ACC" }, "restore-pc": { en: "Restore PC and resume", vi: "Restore PC và resume" },
  };
  const explain = (id: string, state: CpuSnapshot) => {
    if (id === "mar-from-pc") return copy(locale, "MAR receives 200 while PC still contains 200.", "MAR nhận 200 khi PC vẫn chứa 200.");
    if (id === "increment-pc") return copy(locale, "PC becomes 201; MAR keeps the old instruction address 200.", "PC thành 201; MAR giữ instruction address cũ 200.");
    if (id === "instruction-to-mdr") return copy(locale, "READ transfers LDD 100 from Memory[200] to MDR.", "READ chuyển LDD 100 từ Memory[200] tới MDR.");
    if (id === "mdr-to-cir") return copy(locale, "CIR receives the instruction copy for the CU to decode.", "CIR nhận bản copy instruction để CU decode.");
    if (id === "decode") return copy(locale, "The CU identifies opcode LDD and address operand 100.", "CU xác định opcode LDD và address operand 100.");
    if (id === "operand-address") return copy(locale, "MAR is replaced with data address 100.", "MAR được thay bằng data address 100.");
    if (id === "operand-read") return copy(locale, `A second READ transfers ${operand} from Memory[100] to MDR.`, `READ thứ hai chuyển ${operand} từ Memory[100] tới MDR.`);
    if (id === "acc-from-mdr") return copy(locale, `ACC receives ${operand}; LDD has completed.`, `ACC nhận ${operand}; LDD đã hoàn tất.`);
    if (id === "interrupt-check") return interrupt === "device" ? copy(locale, "A device request is detected only after LDD completes.", "Device request chỉ được phát hiện sau khi LDD hoàn tất.") : copy(locale, "No interrupt is pending; the next fetch uses PC=201.", "Không có interrupt pending; fetch tiếp theo dùng PC=201.");
    if (id === "save-context") return interrupt === "device" ? copy(locale, `Save PC=201, ACC=${operand} and Status=Z=1.`, `Lưu PC=201, ACC=${operand} và Status=Z=1.`) : copy(locale, "No context save is needed.", "Không cần save context.");
    if (id === "dispatch") return interrupt === "device" ? copy(locale, "PC receives illustrative ISR address 900.", "PC nhận ISR address minh họa 900.") : copy(locale, "The CPU is ready to fetch the next instruction.", "CPU sẵn sàng fetch instruction tiếp theo.");
    if (id === "service") return interrupt === "device" ? copy(locale, "The illustrative ISR reaches PC=901, ACC=7 and Status=Z=0.", "ISR minh họa đạt PC=901, ACC=7 và Status=Z=0.") : copy(locale, "Main-program state remains unchanged.", "Main-program state giữ nguyên.");
    if (id === "isr-complete") return copy(locale, "The bounded ISR has completed; saved main-program state is still available.", "ISR hữu hạn đã hoàn tất; main-program state đã lưu vẫn còn.");
    if (id === "restore-status") return copy(locale, "Restore Status=Z=1 before returning.", "Restore Status=Z=1 trước khi return.");
    if (id === "restore-acc") return copy(locale, `Restore ACC=${operand}.`, `Restore ACC=${operand}.`);
    return copy(locale, "Restore PC=201 and resume the interrupted program.", "Restore PC=201 và resume program bị interrupt.");
  };
  const noInterruptTitles: Readonly<Record<string, Readonly<{ en: string; vi: string }>>> = {
    "interrupt-check": { en: "Confirm that no request is pending", vi: "Xác nhận không có yêu cầu ngắt" },
    "save-context": { en: "Keep the main-program context unchanged", vi: "Giữ nguyên context của chương trình chính" },
    dispatch: { en: "Continue to the next fetch", vi: "Tiếp tục tới lần fetch kế tiếp" },
    service: { en: "Remain in the main program", vi: "Tiếp tục trong chương trình chính" },
  };
  const scenes = frames.map((frame): Scene => ({ title: packet === "interrupt" && interrupt === "none" ? noInterruptTitles[frame.id][locale] : titleMap[frame.id][locale], explanation: explain(frame.id, frame.state), graphic: <CpuBoard locale={locale} state={frame.state} activeIds={frame.activeIds} payload={frame.payload} frameId={frame.id} />, ledger: cpuLedger(frame.state, locale) }));
  const prediction: Prediction = packet === "fetch" ? { prompt: copy(locale, "What will CIR contain at the end of this packet?", "CIR sẽ chứa gì ở cuối packet này?"), choices: [{ id: "instruction", label: "LDD 100" }, { id: "operand", label: String(operand) }, { id: "next", label: "201" }], correctChoiceId: "instruction" } : packet === "execute" ? { prompt: copy(locale, "What will ACC contain after LDD completes?", "ACC sẽ chứa gì sau khi LDD hoàn tất?"), choices: [{ id: "operand", label: String(operand) }, { id: "address", label: "100" }, { id: "instruction", label: "LDD 100" }], correctChoiceId: "operand" } : packet === "interrupt" ? { prompt: copy(locale, "When is the interrupt request checked?", "Interrupt request được check khi nào?"), choices: [{ id: "after", label: copy(locale, "After the current instruction", "Sau instruction hiện tại") }, { id: "middle", label: copy(locale, "Halfway through the operand read", "Giữa operand read") }, { id: "never", label: copy(locale, "It is never checked", "Không bao giờ được check") }], correctChoiceId: "after" } : { prompt: copy(locale, "Which address resumes the main program?", "Address nào resume main program?"), choices: [{ id: "201", label: "201" }, { id: "900", label: "900" }, { id: "100", label: "100" }], correctChoiceId: "201" };
  return <Journey locale={locale} visualId="VIS-P1-L27" title={copy(locale, "M1 CPU trace recorder", "Bộ ghi CPU trace M1")} intro={copy(locale, "Select a four-step packet so every register transfer remains explicit and independently testable.", "Chọn packet bốn bước để mỗi register transfer vẫn rõ và kiểm thử độc lập được.")} stateKey={`${operand}-${interrupt}-${packet}`} onReset={() => { setOperand(defaults.operand); setInterrupt(defaults.interrupt); setPacket(defaults.packet); }} controls={<><NumberControl id="p1-l27-operand" label={copy(locale, "Memory[100]", "Memory[100]")} value={operand} min={0} max={255} onChange={setOperand} /><Select id="p1-l27-interrupt" label="Interrupt" value={interrupt} onChange={(event) => { const value = event.target.value as "none" | "device"; setInterrupt(value); if (value === "none" && packet === "return") setPacket("fetch"); }}><option value="none">{copy(locale, "None", "Không có")}</option><option value="device">{copy(locale, "Device request", "Device request")}</option></Select><Select id="p1-l27-packet" label={copy(locale, "Trace packet", "Trace packet")} value={packet} onChange={(event) => setPacket(event.target.value as CpuPacket)}>{(Object.keys(cpuPacketLabels) as CpuPacket[]).map((key) => <option key={key} value={key} disabled={key === "return" && interrupt === "none"}>{cpuPacketLabels[key][locale]}</option>)}</Select></>} prediction={prediction} scenes={scenes} />;
}

function AssemblerBoard({ start, step, locale }: { readonly start: number; readonly step: number; readonly locale: Paper1Locale }) {
  const fixture = assembleFixture(start);
  return <div className={styles.tableGrid}><div className={styles.tableRegion} tabIndex={0} aria-label={copy(locale, "Assembly source", "Assembly source")}><table><caption>{copy(locale, "Source", "Source")}</caption><thead><tr><th>{copy(locale, "Address", "Address")}</th><th>{copy(locale, "Label", "Label")}</th><th>{copy(locale, "Instruction", "Instruction")}</th></tr></thead><tbody>{fixture.source.map(([label, mnemonic, operand], index) => <tr key={start + index} data-current={step === 0 && index === 1 || undefined}><td>{start + index}</td><td>{label || "—"}</td><td>{mnemonic} {operand}</td></tr>)}</tbody></table></div><div className={styles.tableRegion} tabIndex={0} aria-label={copy(locale, "Symbol table", "Symbol table")}><table><caption>{copy(locale, "Symbol table", "Symbol table")}</caption><thead><tr><th>{copy(locale, "Symbol", "Symbol")}</th><th>{copy(locale, "Address", "Address")}</th></tr></thead><tbody>{step >= 1 ? Object.entries(fixture.symbols).map(([label, address]) => <tr key={label} data-current={step === 2 && label === "DONE" || undefined}><td>{label}</td><td>{address}</td></tr>) : <tr><td colSpan={2}>—</td></tr>}</tbody></table></div>{step >= 3 ? <div className={styles.tableRegion} tabIndex={0} aria-label={copy(locale, "Object code", "Object code")}><table><caption>{copy(locale, "Toy object code", "Toy object code")}</caption><thead><tr><th>{copy(locale, "Address", "Address")}</th><th>{copy(locale, "Opcode", "Opcode")}</th><th>{copy(locale, "Operand", "Operand")}</th></tr></thead><tbody>{fixture.object.map((row) => <tr key={row.address}><td>{row.address}</td><td>{row.opcode}</td><td>{row.operand}</td></tr>)}</tbody></table></div> : null}</div>;
}

function AssemblerLab({ locale }: { readonly locale: Paper1Locale }) {
  const [start, setStart] = useState(100);
  const frames = assemblerFrames(start);
  const scenes: Scene[] = [
    { title: copy(locale, "Mark the forward reference", "Đánh dấu forward reference"), explanation: copy(locale, "JMP DONE uses a label declared later; the assembler has not run the program.", "JMP DONE dùng label được khai báo sau; assembler chưa chạy program."), graphic: <AssemblerBoard locale={locale} start={start} step={0} />, ledger: [{ label: copy(locale, "Forward reference", "Forward reference"), value: "DONE", current: true }, { label: copy(locale, "Location counter at JMP", "Location counter tại JMP"), value: frames[0].state.forwardReferenceAddress, current: true }] },
    { title: copy(locale, "Pass 1 builds the symbol table", "Pass 1 tạo symbol table"), explanation: copy(locale, `Each source row occupies one address, so DONE is recorded at ${start + 3}.`, `Mỗi source row chiếm một address nên DONE được ghi tại ${start + 3}.`), graphic: <AssemblerBoard locale={locale} start={start} step={1} />, ledger: [{ label: "START / VALUE / DONE", value: `${start} / ${start + 2} / ${start + 3}` }, { label: copy(locale, "Object code", "Object code"), value: copy(locale, "not emitted", "chưa emit") }] },
    { title: copy(locale, "Pass 2 resolves the operand", "Pass 2 resolve operand"), explanation: copy(locale, `The assembler looks up DONE and replaces the JMP operand with ${start + 3}.`, `Assembler lookup DONE và thay JMP operand bằng ${start + 3}.`), graphic: <AssemblerBoard locale={locale} start={start} step={2} />, ledger: [{ label: "JMP DONE", value: `JMP ${start + 3}` }, { label: copy(locale, "Pass", "Pass"), value: 2 }] },
    { title: copy(locale, "Emit the toy object rows", "Emit toy object row"), explanation: copy(locale, "Mnemonics are encoded and label operands are resolved. These numeric opcodes belong only to this declared fixture.", "Mnemonic được encode và label operand được resolve. Numeric opcode chỉ thuộc fixture đã khai báo này."), graphic: <AssemblerBoard locale={locale} start={start} step={3} />, ledger: [{ label: copy(locale, "Rows emitted", "Row đã emit"), value: frames[3].state.object.length }, { label: copy(locale, "Execution", "Execution"), value: copy(locale, "not started", "chưa bắt đầu") }] },
  ];
  return <Journey locale={locale} visualId="VIS-P1-L28" title={copy(locale, "Two-pass assembly ledger", "Ledger two-pass assembler")} intro={copy(locale, "Keep source addresses, symbols, resolved operands and object rows visible as separate products.", "Giữ source address, symbol, resolved operand và object row thành các product riêng.")} stateKey={String(start)} onReset={() => setStart(100)} controls={<NumberControl id="p1-l28-start" label={copy(locale, "Start address", "Start address")} value={start} min={0} max={240} onChange={setStart} />} prediction={{ prompt: copy(locale, "What address will label DONE receive?", "Label DONE sẽ nhận address nào?"), choices: [{ id: "correct", label: String(start + 3) }, { id: "minus", label: String(start + 2) }, { id: "plus", label: String(start + 4) }], correctChoiceId: "correct" }} scenes={scenes} />;
}

const addressLabels: Readonly<Record<AddressingMode, string>> = { immediate: "Immediate", direct: "Direct", indirect: "Indirect", indexed: "Indexed", relative: "Relative" };
function AddressBoard({ mode, step, locale }: { readonly mode: AddressingMode; readonly step: number; readonly locale: Paper1Locale }) {
  const model = addressModel(mode);
  const rule = mode === "immediate" ? "value = operand" : mode === "direct" ? "EA = operand" : mode === "indirect" ? "EA = Memory[operand]" : mode === "indexed" ? "EA = operand + IX" : "branch target = PC + offset";
  const nodes: FlowNode[] = [{ id: "instruction", label: `${addressLabels[mode]} ${model.operand}` }, { id: "calculation", label: rule, value: step >= 1 ? shown(model.effectiveAddress ?? model.operand) : "?" }, { id: mode === "immediate" ? "literal" : mode === "indirect" ? "pointer" : "effectiveAddress", label: mode === "immediate" ? copy(locale, "Literal", "Literal") : mode === "relative" ? copy(locale, "Target address", "Địa chỉ đích") : "EA", value: step >= 1 ? shown(model.effectiveAddress ?? model.operand) : "?" }, { id: "memory", label: mode === "immediate" || mode === "relative" ? copy(locale, "No data read", "Không đọc data") : copy(locale, "Memory", "Memory"), value: step >= 2 ? mode === "relative" ? copy(locale, "control flow", "luồng điều khiển") : model.value : "?" }, { id: "value", label: mode === "relative" ? copy(locale, "Branch target", "Đích nhánh") : copy(locale, "Value", "Value"), value: step >= 2 ? model.value : "?" }];
  return <SignalFlow locale={locale} nodes={nodes} activeIds={addressingFrames(mode)[step].activeIds} payload={step + 1} />;
}

function AddressingLab({ locale }: { readonly locale: Paper1Locale }) {
  const [mode, setMode] = useState<AddressingMode>("immediate");
  const model = addressModel(mode);
  const frames = addressingFrames(mode);
  const rule = mode === "immediate" ? "value = operand" : mode === "direct" ? "EA = operand" : mode === "indirect" ? "EA = Memory[operand]" : mode === "indexed" ? "EA = operand + IX" : "branch target = PC + offset";
  const scenes: Scene[] = [
    { title: copy(locale, "Read the addressing context", "Đọc addressing context"), explanation: copy(locale, `Mode=${mode}; operand=${model.operand}; IX=5; PC=201.`, `Mode=${mode}; operand=${model.operand}; IX=5; PC=201.`), graphic: <AddressBoard locale={locale} mode={mode} step={0} />, ledger: [{ label: "MODE / OPERAND", value: `${mode} / ${model.operand}` }, { label: "IX / PC", value: "5 / 201" }] },
    { title: copy(locale, "Resolve the literal or effective address", "Resolve literal hoặc effective address"), explanation: copy(locale, `${rule}. ${mode === "immediate" ? "Immediate has no effective memory address." : `EA=${model.effectiveAddress}.`}`, `${rule}. ${mode === "immediate" ? "Immediate không có effective memory address." : `EA=${model.effectiveAddress}.`}`), graphic: <AddressBoard locale={locale} mode={mode} step={1} />, ledger: [{ label: copy(locale, "Rule", "Rule"), value: rule }, { label: "EA", value: shown(model.effectiveAddress) }] },
    { title: mode === "relative" ? copy(locale, "Calculate the control-flow target", "Tính đích luồng điều khiển") : copy(locale, "Follow the required dereference", "Theo dereference cần thiết"), explanation: mode === "indirect" ? copy(locale, `Memory[100]=120 supplies the pointer; Memory[120]=${model.value} supplies the value.`, `Memory[100]=120 cung cấp pointer; Memory[120]=${model.value} cung cấp value.`) : mode === "immediate" ? copy(locale, "The operand itself is the value, so memory is not accessed.", "Operand chính là value nên không truy cập memory.") : mode === "relative" ? copy(locale, `PC=201 plus offset 2 gives branch target 203. This fixture calculates control flow and does not fetch data from Memory[203].`, `PC=201 cộng offset 2 cho đích nhánh 203. Fixture này tính luồng điều khiển và không đọc data từ Memory[203].`) : copy(locale, `Read Memory[${model.effectiveAddress}] to obtain ${model.value}.`, `Đọc Memory[${model.effectiveAddress}] để nhận ${model.value}.`), graphic: <AddressBoard locale={locale} mode={mode} step={2} />, ledger: [{ label: copy(locale, "Path", "Path"), value: model.path.join(" → ") }, { label: copy(locale, "Data-memory reads", "Số lần đọc data-memory"), value: model.readCount }] },
    { title: mode === "relative" ? copy(locale, "Verify the branch target", "Verify đích nhánh") : copy(locale, "Verify address and value", "Verify address và value"), explanation: mode === "relative" ? copy(locale, `The calculated branch target is ${model.value}; it is an address for the next control-flow step, not a fetched data value.`, `Đích nhánh đã tính là ${model.value}; đây là địa chỉ cho bước luồng điều khiển tiếp theo, không phải data value đã đọc.`) : copy(locale, `The final value is ${model.value}; keep it separate from ${shown(model.effectiveAddress)} as the effective address.`, `Final value là ${model.value}; giữ nó tách khỏi effective address ${shown(model.effectiveAddress)}.`), graphic: <AddressBoard locale={locale} mode={mode} step={3} />, ledger: [{ label: mode === "relative" ? copy(locale, "Branch target", "Đích nhánh") : "EA", value: shown(model.effectiveAddress) }, { label: mode === "relative" ? copy(locale, "Control-flow address", "Địa chỉ luồng điều khiển") : copy(locale, "Final value", "Final value"), value: model.value }, { label: copy(locale, "Data-memory reads", "Số lần đọc data-memory"), value: model.readCount }] },
  ];
  const alternatives = Array.from(new Set([model.value, model.operand, model.value + 5])).slice(0, 3);
  while (alternatives.length < 3) alternatives.push(alternatives[alternatives.length - 1] + 1);
  return <Journey locale={locale} visualId="VIS-P1-L29" title={copy(locale, "Effective-address route map", "Bản đồ effective-address")} intro={copy(locale, "Separate operands, effective addresses, data dereferences and the relative branch-target calculation for five syllabus modes.", "Tách operand, effective address, data dereference và phép tính đích nhánh relative cho năm mode trong syllabus.")} stateKey={mode} onReset={() => setMode("immediate")} controls={<Select id="p1-l29-mode" label={copy(locale, "Addressing mode", "Addressing mode")} value={mode} onChange={(event) => setMode(event.target.value as AddressingMode)}>{(Object.keys(addressLabels) as AddressingMode[]).map((key) => <option key={key} value={key}>{addressLabels[key]}</option>)}</Select>} prediction={{ prompt: mode === "relative" ? copy(locale, "What branch target address will PC-relative calculation produce?", "Phép tính PC-relative tạo địa chỉ đích nhánh nào?") : copy(locale, "What final value will this fixed fixture obtain?", "Fixture cố định này sẽ nhận final value nào?"), choices: alternatives.map((value) => ({ id: String(value), label: String(value) })), correctChoiceId: String(model.value) }} scenes={scenes} />;
}

const shownFlag = (value: boolean | null) => value === null ? "—" : String(value);

function TraceBoard({ input, packet, step, locale }: { readonly input: 65 | 66; readonly packet: BranchPacket; readonly step: number; readonly locale: Paper1Locale }) {
  const frame = branchPacketFrames(input, packet)[step];
  return <div className={styles.traceBoard}><ol className={styles.programList}>{BRANCH_PROGRAM.map((instruction, index) => <li key={instruction} data-current={frame.state.instruction === instruction || undefined} data-skipped={frame.state.skipped?.includes(instruction) || undefined}><span>{index}</span><code>{instruction}</code></li>)}</ol><div className={styles.registerTiles}><div data-active={frame.activeIds.includes("PC") || undefined}><span>PC</span><b>{frame.state.PC}</b></div><div data-active={frame.activeIds.includes("ACC") || undefined}><span>ACC</span><b>{frame.state.ACC}</b></div><div data-active={frame.activeIds.includes("equal") || undefined}><span>EQUAL</span><b>{shownFlag(frame.state.equal)}</b></div><div data-active={frame.activeIds.includes("OUT") || undefined}><span>OUTPUT</span><b>{frame.state.output}</b></div></div><p>{copy(locale, "Current instruction", "Instruction hiện tại")}: <code>{frame.state.instruction}</code></p></div>;
}

function LoadStoreBoard({ packet, step, locale }: { readonly packet: LoadStorePacket; readonly step: number; readonly locale: Paper1Locale }) {
  const frame = loadStorePacketFrames(packet)[step];
  const state = frame.state;
  return <div className={styles.traceBoard}><ol className={styles.programList}>{LOAD_STORE_PROGRAM.map((instruction, index) => <li key={instruction} data-current={state.instruction === instruction || undefined}><span>{index}</span><code>{instruction}</code></li>)}</ol><div className={styles.registerTiles}><div data-active={frame.activeIds.includes("PC") || undefined}><span>PC</span><b>{state.PC}</b></div><div data-active={frame.activeIds.includes("ACC") || undefined}><span>ACC</span><b>{state.ACC}</b></div><div data-active={frame.activeIds.includes("memory20") || undefined}><span>MEM[20]</span><b>{state.memory20}</b></div><div><span>MEM[21]</span><b>{state.memory21}</b></div><div data-active={frame.activeIds.includes("memory22") || undefined}><span>MEM[22]</span><b>{state.memory22}</b></div><div data-active={frame.activeIds.includes("END") || undefined}><span>HALTED</span><b>{String(state.halted)}</b></div></div><p>{copy(locale, "Current state", "State hiện tại")}: <code>{state.instruction}</code></p></div>;
}

function AssemblyTraceLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { program: "branch" as "branch" | "load-store", input: 65 as 65 | 66, branchPacket: "decision" as BranchPacket, loadStorePacket: "load-store" as LoadStorePacket };
  const [program, setProgram] = useState<"branch" | "load-store">(defaults.program);
  const [input, setInput] = useState<65 | 66>(defaults.input);
  const [branchPacket, setBranchPacket] = useState<BranchPacket>(defaults.branchPacket);
  const [loadStorePacket, setLoadStorePacket] = useState<LoadStorePacket>(defaults.loadStorePacket);
  const branchFrames = branchPacketFrames(input, branchPacket);
  const branchScenes = branchFrames.map((frame, index): Scene => ({ title: branchPacket === "decision" ? [copy(locale, "Read input", "Đọc input"), copy(locale, "Compare without changing ACC", "Compare mà không đổi ACC"), copy(locale, "Execute the conditional branch", "Execute conditional branch"), copy(locale, "Record the selected route", "Ghi route đã chọn")][index] : input === 66 ? [copy(locale, "Increment ACC", "Tăng ACC"), copy(locale, "Jump to output", "Jump tới output"), copy(locale, "Output the character", "Output character"), copy(locale, "End the trace", "Kết thúc trace")][index] : [copy(locale, "Mark skipped instructions", "Đánh dấu instruction bị skip"), copy(locale, "Output the character", "Output character"), copy(locale, "End the trace", "Kết thúc trace"), copy(locale, "Verify the completed path", "Verify path hoàn tất")][index], explanation: copy(locale, `After ${frame.state.instruction}: PC=${frame.state.PC}, ACC=${frame.state.ACC}, equal=${shownFlag(frame.state.equal)}, output=${frame.state.output}.`, `Sau ${frame.state.instruction}: PC=${frame.state.PC}, ACC=${frame.state.ACC}, equal=${shownFlag(frame.state.equal)}, output=${frame.state.output}.`), graphic: <TraceBoard locale={locale} input={input} packet={branchPacket} step={index} />, ledger: [{ label: copy(locale, "Instruction", "Instruction"), value: frame.state.instruction, current: true }, { label: "PC / ACC", value: `${frame.state.PC} / ${frame.state.ACC}`, current: active(frame.activeIds, "PC", "ACC") }, { label: "EQUAL / OUTPUT", value: `${shownFlag(frame.state.equal)} / ${frame.state.output}`, current: active(frame.activeIds, "equal", "OUT") }] }));
  const loadFrames = loadStorePacketFrames(loadStorePacket);
  const loadScenes = loadFrames.map((frame, index): Scene => {
    const state = frame.state;
    const initial = state.instruction === "initial" || index === 0;
    const explanation = state.instruction === "initial"
      ? copy(locale, "Initial state: ACC=0; Memory[20]=0, Memory[21]=8 and Memory[22]=0.", "Initial state: ACC=0; Memory[20]=0, Memory[21]=8 và Memory[22]=0.")
      : state.instruction === "LDM #12" ? copy(locale, "LDM loads literal 12 into ACC and advances PC.", "LDM load literal 12 vào ACC và tăng PC.")
        : state.instruction === "STO 20" ? copy(locale, "STO copies ACC=12 to Memory[20]; ACC is unchanged.", "STO copy ACC=12 tới Memory[20]; ACC không đổi.")
          : state.instruction === "LDD 21" ? copy(locale, "LDD loads the contents 8 from Memory[21] into ACC.", "LDD load contents 8 từ Memory[21] vào ACC.")
            : state.instruction === "ADD 20" ? copy(locale, "ADD combines ACC=8 with Memory[20]=12, producing ACC=20.", "ADD cộng ACC=8 với Memory[20]=12, tạo ACC=20.")
              : state.instruction === "STO 22" ? copy(locale, "STO copies ACC=20 to Memory[22]; ACC remains 20.", "STO copy ACC=20 tới Memory[22]; ACC vẫn là 20.")
                : copy(locale, "END returns control to the operating system. The model makes no claim about PC after that handoff, so PC remains displayed at the current END row 5.", "END trả control về operating system. Mô hình không khẳng định PC sau lần bàn giao đó nên PC tiếp tục hiển thị tại END row hiện tại là 5.");
    return { title: initial ? copy(locale, "Establish the packet state", "Thiết lập packet state") : copy(locale, `Execute ${state.instruction}`, `Execute ${state.instruction}`), explanation, graphic: <LoadStoreBoard locale={locale} packet={loadStorePacket} step={index} />, ledger: [{ label: copy(locale, "Instruction", "Instruction"), value: state.instruction }, { label: "PC / ACC", value: `${state.PC} / ${state.ACC}` }, { label: "MEM[20] / MEM[21] / MEM[22]", value: `${state.memory20} / ${state.memory21} / ${state.memory22}` }, { label: "HALTED / OUTPUT", value: `${state.halted} / ${state.output || "—"}` }] };
  });
  const branchPrediction: Prediction = branchPacket === "decision" ? {
    prompt: copy(locale, "Which address will JPE select after the comparison?", "JPE sẽ chọn address nào sau phép compare?"),
    choices: [{ id: "5", label: "5" }, { id: "3", label: "3" }, { id: "2", label: "2" }],
    correctChoiceId: input === 65 ? "5" : "3",
  } : {
    prompt: copy(locale, "What character will the full program output?", "Full program sẽ output character nào?"),
    choices: [{ id: "A", label: "A" }, { id: "B", label: "B" }, { id: "C", label: "C" }],
    correctChoiceId: input === 65 ? "A" : "C",
  };
  const loadPrediction: Prediction = loadStorePacket === "load-store" ? { prompt: copy(locale, "What will ACC contain after LDD 21?", "ACC sẽ chứa gì sau LDD 21?"), choices: [{ id: "8", label: "8" }, { id: "12", label: "12" }, { id: "20", label: "20" }], correctChoiceId: "8" } : { prompt: copy(locale, "What will Memory[22] contain before END returns control?", "Memory[22] sẽ chứa gì trước khi END trả control?"), choices: [{ id: "20", label: "20" }, { id: "12", label: "12" }, { id: "8", label: "8" }], correctChoiceId: "20" };
  const fullTrace = program === "branch"
    ? [...branchPacketFrames(input, "decision").slice(0, 3), ...branchPacketFrames(input, "completion")]
    : [...loadStorePacketFrames("load-store"), ...loadStorePacketFrames("add-finish").slice(1)];
  const staticEquivalent = <section aria-label={copy(locale, "Complete program trace", "Trace chương trình đầy đủ")}><h5>{copy(locale, "Complete program trace", "Trace chương trình đầy đủ")}</h5><ol>{fullTrace.map((traceFrame, traceIndex) => <li key={`${traceFrame.id}-${traceIndex}`}><code>{traceFrame.state.instruction}</code><span>{"equal" in traceFrame.state ? `PC=${traceFrame.state.PC} · ACC=${traceFrame.state.ACC} · EQUAL=${shownFlag(traceFrame.state.equal)} · OUT=${traceFrame.state.output || "—"}` : `PC=${traceFrame.state.PC} · ACC=${traceFrame.state.ACC} · M20=${traceFrame.state.memory20} · M21=${traceFrame.state.memory21} · M22=${traceFrame.state.memory22} · HALTED=${traceFrame.state.halted}`}</span></li>)}</ol></section>;
  const controls = <><Select id="p1-l30-program" label={copy(locale, "Program fixture", "Program fixture")} value={program} onChange={(event) => setProgram(event.target.value as "branch" | "load-store")}><option value="branch">{copy(locale, "Branch and I/O", "Branch và I/O")}</option><option value="load-store">{copy(locale, "Load, store and arithmetic", "Load, store và arithmetic")}</option></Select>{program === "branch" ? <><Select id="p1-l30-input" label={copy(locale, "ASCII input", "ASCII input")} value={input} onChange={(event) => setInput(Number(event.target.value) as 65 | 66)}><option value={65}>65 = A</option><option value={66}>66 = B</option></Select><Select id="p1-l30-branch-packet" label={copy(locale, "Trace packet", "Trace packet")} value={branchPacket} onChange={(event) => setBranchPacket(event.target.value as BranchPacket)}><option value="decision">{copy(locale, "Branch decision", "Branch decision")}</option><option value="completion">{copy(locale, "Complete selected path", "Hoàn tất path đã chọn")}</option></Select></> : <Select id="p1-l30-load-packet" label={copy(locale, "Trace packet", "Trace packet")} value={loadStorePacket} onChange={(event) => setLoadStorePacket(event.target.value as LoadStorePacket)}><option value="load-store">{copy(locale, "Initial → LDD 21", "Initial → LDD 21")}</option><option value="add-finish">{copy(locale, "LDD 21 → END", "LDD 21 → END")}</option></Select>}</>;
  return <Journey locale={locale} visualId="VIS-P1-L30" title={copy(locale, "Assembly trace console", "Console assembly trace")} intro={copy(locale, "Trace one instruction per change, keep skipped rows visible, and audit PC, ACC, memory, condition and output.", "Trace một instruction mỗi change, giữ row bị skip hiển thị và audit PC, ACC, memory, condition cùng output.")} stateKey={`${program}-${input}-${branchPacket}-${loadStorePacket}`} onReset={() => { setProgram(defaults.program); setInput(defaults.input); setBranchPacket(defaults.branchPacket); setLoadStorePacket(defaults.loadStorePacket); }} controls={controls} prediction={program === "branch" ? branchPrediction : loadPrediction} scenes={program === "branch" ? branchScenes : loadScenes} staticEquivalent={staticEquivalent} />;
}

function BitRow({ label, bits, activeIndex, changed = false }: { readonly label: string; readonly bits: string; readonly activeIndex?: number; readonly changed?: boolean }) {
  return <div className={styles.bitRow}><strong>{label}</strong><div>{bits.split("").map((bit, index) => <span key={index} data-active={index === activeIndex || undefined} data-changed={changed && index === activeIndex || undefined}><small>{7 - index}</small>{bit}</span>)}</div></div>;
}

function ShiftBoard({ value, kind, step, locale }: { readonly value: number; readonly kind: ShiftKind; readonly step: number; readonly locale: Paper1Locale }) {
  const model = shift8(value, kind);
  const left = kind.endsWith("l");
  const edge = left ? 0 : 7;
  return <div className={styles.bitBoard}><BitRow label={copy(locale, "Before", "Trước")} bits={model.before} activeIndex={step <= 1 ? edge : undefined} /><div className={styles.shiftRule}><span>{kind.toUpperCase()}</span><b>{step >= 1 ? copy(locale, `out ${model.outgoingBit} · in ${model.insertedBit}`, `ra ${model.outgoingBit} · vào ${model.insertedBit}`) : "?"}</b></div><BitRow label={copy(locale, "After", "Sau")} bits={step >= 2 ? model.after : "????????"} activeIndex={step >= 2 ? left ? 7 : 0 : undefined} changed={step >= 2} /></div>;
}

function ShiftLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { value: 150, kind: "lsl" as ShiftKind };
  const [value, setValue] = useState(defaults.value);
  const [kind, setKind] = useState<ShiftKind>(defaults.kind);
  const model = shift8(value, kind);
  const frames = shiftFrames(value, kind);
  const interpretation = kind === "asl"
    ? copy(locale, `Result=${model.result} unsigned, ${model.signedAfter} signed; ASL overflow=${model.overflow}.`, `Result=${model.result} unsigned, ${model.signedAfter} signed; ASL overflow=${model.overflow}.`)
    : copy(locale, `Result=${model.result} unsigned and ${model.signedAfter} when interpreted as signed.`, `Result=${model.result} unsigned và ${model.signedAfter} khi diễn giải là signed.`);
  const explanations = [copy(locale, `The outgoing edge bit is ${model.outgoingBit}; bit positions remain fixed at 7..0.`, `Edge bit đi ra là ${model.outgoingBit}; vị trí bit giữ cố định 7..0.`), copy(locale, `${kind.toUpperCase()} inserts ${model.insertedBit}${kind.startsWith("ro") ? " by wrapping the outgoing bit" : kind === "asr" ? " by copying the sign bit" : " as zero"}.`, `${kind.toUpperCase()} chèn ${model.insertedBit}${kind.startsWith("ro") ? " bằng cách wrap bit đi ra" : kind === "asr" ? " bằng cách copy sign bit" : " dưới dạng zero"}.`), copy(locale, `Every bit moves exactly one position, producing ${model.after}.`, `Mỗi bit dịch đúng một vị trí, tạo ${model.after}.`), interpretation];
  const scenes = frames.map((frame, index): Scene => ({ title: [copy(locale, "Mark the edge bit", "Đánh dấu edge bit"), copy(locale, "Apply the fill or wrap rule", "Áp dụng fill hoặc wrap rule"), copy(locale, "Shift one position", "Dịch một vị trí"), copy(locale, "Interpret the fixed-width result", "Interpret result fixed-width")][index], explanation: explanations[index], graphic: <ShiftBoard locale={locale} value={value} kind={kind} step={index} />, ledger: [{ label: "BEFORE / AFTER", value: `${model.before} / ${index >= 2 ? model.after : "????????"}` }, { label: copy(locale, "Outgoing / inserted", "Bit ra / chèn"), value: index >= 1 ? `${model.outgoingBit} / ${model.insertedBit}` : "? / ?" }, { label: copy(locale, "Unsigned / signed", "Unsigned / signed"), value: index >= 3 ? `${model.result} / ${model.signedAfter}` : "? / ?" }] }));
  const distractor1 = binary8(model.result ^ 1);
  const distractor2 = binary8(model.result ^ 128);
  return <Journey locale={locale} visualId="VIS-P1-L31" title={copy(locale, "Eight-bit shift rail", "Thanh dịch 8-bit")} intro={copy(locale, "Track the outgoing bit, fill rule and fixed-width result for logical, arithmetic and cyclic shifts.", "Theo dõi bit đi ra, fill rule và result fixed-width cho logical, arithmetic và cyclic shift.")} stateKey={`${value}-${kind}`} onReset={() => { setValue(defaults.value); setKind(defaults.kind); }} controls={<><NumberControl id="p1-l31-value" label={copy(locale, "8-bit value", "Giá trị 8-bit")} value={value} min={0} max={255} onChange={setValue} /><Select id="p1-l31-kind" label={copy(locale, "Shift", "Shift")} value={kind} onChange={(event) => setKind(event.target.value as ShiftKind)}>{(["lsl", "lsr", "asl", "asr", "rol", "ror"] as ShiftKind[]).map((key) => <option key={key} value={key}>{key.toUpperCase()}</option>)}</Select></>} prediction={{ prompt: copy(locale, "What is the resulting 8-bit word after one shift?", "Word 8-bit sau một shift là gì?"), choices: [{ id: model.after, label: model.after }, { id: distractor1, label: distractor1 }, { id: distractor2, label: distractor2 }], correctChoiceId: model.after }} scenes={scenes} />;
}

function MaskBoard({ value, bit, operation, scenario, step, locale }: { readonly value: number; readonly bit: number; readonly operation: MaskOperation; readonly scenario: DeviceScenario; readonly step: number; readonly locale: Paper1Locale }) {
  const model = maskFrames(value, bit, operation, scenario)[step].state;
  const activeIndex = 7 - bit;
  const outcome = model.deviceState.targetChanged ? `${model.deviceState.before} → ${model.deviceState.after}` : copy(locale, `${model.deviceState.after} (unchanged)`, `${model.deviceState.after} (không đổi)`);
  return <div className={styles.bitBoard}><BitRow label={copy(locale, "Source register", "Source register")} bits={model.sourceBits} activeIndex={activeIndex} /><BitRow label={copy(locale, "Mask", "Mask")} bits={step >= 1 ? model.maskBits : "????????"} activeIndex={step >= 1 ? activeIndex : undefined} /><div className={styles.shiftRule}><span>{operation}</span><b>{step >= 2 ? copy(locale, "ALU → ACC", "ALU → ACC") : "?"}</b></div><BitRow label={copy(locale, "ACC result", "Kết quả ACC")} bits={step >= 2 ? model.accAfterBits : "????????"} activeIndex={step >= 2 ? activeIndex : undefined} changed={step >= 2 && model.accAfter !== model.accBefore} />{step >= 3 ? <div className={styles.deviceState} data-active="true"><strong>{model.deviceState.deviceName}</strong><span>{copy(locale, model.deviceState.mode === "monitoring" ? "Monitoring only — no device write" : "Explicit device write committed", model.deviceState.mode === "monitoring" ? "Chỉ giám sát — không ghi thiết bị" : "Đã ghi rõ ràng vào thiết bị")}</span><b>{outcome}</b></div> : null}</div>;
}

function MaskLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { value: 150, bit: 2, operation: "AND" as MaskOperation, scenario: "greenhouse" as DeviceScenario };
  const [value, setValue] = useState(defaults.value);
  const [bit, setBit] = useState(defaults.bit);
  const [operation, setOperation] = useState<MaskOperation>(defaults.operation);
  const [scenario, setScenario] = useState<DeviceScenario>(defaults.scenario);
  const model = mask8(value, bit, operation, scenario);
  const frames = maskFrames(value, bit, operation, scenario);
  const controlOutcome = model.targetChanged
    ? copy(locale, `An explicit write stores ACC=${model.accAfter} in the device register, changing bit ${bit} from ${model.targetBefore} to ${model.targetAfter}.`, `Một lệnh ghi rõ ràng lưu ACC=${model.accAfter} vào device register, đổi bit ${bit} từ ${model.targetBefore} thành ${model.targetAfter}.`)
    : copy(locale, `An explicit write stores ACC=${model.accAfter}; bit ${bit} was already ${model.targetAfter}, so the device state is unchanged.`, `Một lệnh ghi rõ ràng lưu ACC=${model.accAfter}; bit ${bit} đã là ${model.targetAfter}, nên trạng thái thiết bị không đổi.`);
  const explanations = [copy(locale, `ACC starts with a copy of source register ${model.sourceBits}; the source itself remains unchanged by the ALU.`, `ACC bắt đầu với bản sao source register ${model.sourceBits}; ALU không đổi source.`), copy(locale, `A one-hot mask for bit ${bit} is ${model.maskBits} (${model.mask}).`, `One-hot mask cho bit ${bit} là ${model.maskBits} (${model.mask}).`), copy(locale, `The ALU computes ${model.sourceBits} ${operation} ${model.maskBits} and stores ${model.accAfterBits} in ACC. The source register is still ${model.sourceBits}.`, `ALU tính ${model.sourceBits} ${operation} ${model.maskBits} và lưu ${model.accAfterBits} vào ACC. Source register vẫn là ${model.sourceBits}.`), operation === "AND" ? copy(locale, `ACC=${model.accAfter} reports bit ${bit} as ${model.testResult}; monitoring does not write to the device.`, `ACC=${model.accAfter} báo bit ${bit} là ${model.testResult}; monitoring không ghi vào thiết bị.`) : controlOutcome];
  const perBitLedger: readonly LedgerEntry[] = Array.from({ length: 8 }, (_, index) => {
    const position = 7 - index;
    return { label: `bit ${position}`, value: `${model.sourceBits[index]} ${operation} ${model.maskBits[index]} = ${model.accAfterBits[index]}`, current: position === bit };
  });
  const scenes = frames.map((frame, index): Scene => ({ title: [copy(locale, "Locate the source bit", "Xác định bit nguồn"), copy(locale, "Build and align the mask", "Tạo và căn mask"), copy(locale, "Store the ALU result in ACC", "Lưu kết quả ALU vào ACC"), operation === "AND" ? copy(locale, "Interpret ACC for monitoring", "Diễn giải ACC để giám sát") : copy(locale, "Commit ACC to the device", "Ghi ACC vào thiết bị")][index], explanation: explanations[index], graphic: <MaskBoard locale={locale} value={value} bit={bit} operation={operation} scenario={scenario} step={index} />, ledger: [{ label: copy(locale, "SOURCE / MASK", "SOURCE / MASK"), value: `${model.sourceBits} / ${index >= 1 ? model.maskBits : "????????"}`, current: index <= 1 }, { label: copy(locale, "ACC before / after", "ACC trước / sau"), value: `${model.accBefore} / ${index >= 2 ? model.accAfter : "?"}`, current: index === 2 }, { label: copy(locale, "Source changed by ALU", "Source bị ALU thay đổi"), value: String(model.sourceRegisterChanged), current: index === 2 }, { label: copy(locale, "Explicit write / committed", "Ghi rõ ràng / đã commit"), value: `${model.explicitWriteBack} / ${index >= 3 ? frame.state.commitPerformed : false}`, current: index === 3 }, { label: copy(locale, "Device bit before / after", "Device bit trước / sau"), value: `${model.targetBefore} / ${index >= 3 ? frame.state.targetAfter : "?"}`, current: index === 3 }, ...(index >= 3 ? [{ label: copy(locale, "Device state", "Trạng thái thiết bị"), value: `${model.deviceState.deviceName} · ${model.deviceState.mode} · ${model.deviceState.targetChanged ? `${model.deviceState.before} → ${model.deviceState.after}` : `${model.deviceState.after} unchanged`}`, current: true }] : []), ...(index >= 2 ? perBitLedger : [])] }));
  const alternatives = Array.from(new Set([model.result, model.result ^ model.mask, model.result ^ 255])).slice(0, 3);
  while (alternatives.length < 3) alternatives.push((alternatives[alternatives.length - 1] + 1) & 255);
  return <Journey locale={locale} visualId="VIS-P1-L32" title={copy(locale, "Device-register mask bench", "Bàn mask device-register")} intro={copy(locale, "Build a one-hot mask, store the bitwise result in ACC, then distinguish monitoring from an explicit device write.", "Tạo one-hot mask, lưu kết quả bitwise vào ACC, rồi phân biệt monitoring với lệnh ghi thiết bị rõ ràng.")} stateKey={`${value}-${bit}-${operation}-${scenario}`} onReset={() => { setValue(defaults.value); setBit(defaults.bit); setOperation(defaults.operation); setScenario(defaults.scenario); }} controls={<><Select id="p1-l32-scenario" label={copy(locale, "Device scenario", "Tình huống thiết bị")} value={scenario} onChange={(event) => setScenario(event.target.value as DeviceScenario)}><option value="greenhouse">{copy(locale, "Greenhouse channels", "Các kênh nhà kính")}</option><option value="alarm-panel">{copy(locale, "Alarm-panel zones", "Các vùng bảng báo động")}</option></Select><NumberControl id="p1-l32-value" label={copy(locale, "Source device register", "Source device register")} value={value} min={0} max={255} onChange={setValue} /><NumberControl id="p1-l32-bit" label={copy(locale, "Target bit", "Target bit")} value={bit} min={0} max={7} onChange={setBit} /><Select id="p1-l32-operation" label={copy(locale, "Operation", "Operation")} value={operation} onChange={(event) => setOperation(event.target.value as MaskOperation)}><option value="AND">{copy(locale, "AND — test in ACC", "AND — test trong ACC")}</option><option value="OR">{copy(locale, "OR — set then write", "OR — set rồi ghi")}</option><option value="XOR">{copy(locale, "XOR — toggle then write", "XOR — toggle rồi ghi")}</option></Select></>} prediction={{ prompt: copy(locale, "What decimal result will the ALU store in ACC?", "ALU sẽ lưu kết quả decimal nào vào ACC?"), choices: alternatives.map((result) => ({ id: String(result), label: `${result} · ${binary8(result)}` })), correctChoiceId: String(model.accAfter) }} scenes={scenes} />;
}

export function Chapter4VisualLab({ lessonId, locale }: { readonly lessonId: string; readonly locale: Paper1Locale }) {
  if (lessonId === "P1-L25") return <CpuTransferLab locale={locale} />;
  if (lessonId === "P1-L26") return <PerformanceLab locale={locale} />;
  if (lessonId === "P1-L27") return <CpuCycleLab locale={locale} />;
  if (lessonId === "P1-L28") return <AssemblerLab locale={locale} />;
  if (lessonId === "P1-L29") return <AddressingLab locale={locale} />;
  if (lessonId === "P1-L30") return <AssemblyTraceLab locale={locale} />;
  if (lessonId === "P1-L31") return <ShiftLab locale={locale} />;
  if (lessonId === "P1-L32") return <MaskLab locale={locale} />;
  return null;
}
