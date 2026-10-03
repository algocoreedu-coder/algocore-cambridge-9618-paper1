"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button, Select } from "@/app/components/algocore-ui";
import {
  bufferOccupancy,
  circuitRows,
  controlDecision,
  evaluateLogicCircuit,
  logicGateOutput,
  logicGateRows,
  memoryEventOutcome,
  memoryFacts,
  type ControlMode,
  type LogicCircuit,
  type LogicGate,
  type MemoryEvent,
  type MemoryType,
  type MemoryUse,
} from "@/app/lib/paper1/chapter3-models";
import type { Paper1Locale } from "@/app/lib/paper1/types";
import styles from "./Chapter3VisualLab.module.css";

type Localized = Readonly<{ en: string; vi: string }>;
type Scene = Readonly<{ title: string; explanation: string; graphic: ReactNode; metric?: Readonly<{ label: string; value: string }> }>;
type Prediction = Readonly<{ prompt: string; choices: readonly Readonly<{ id: string; label: string }>[]; correctChoiceId: string }>;
const copy = (locale: Paper1Locale, en: string, vi: string) => locale === "vi" ? vi : en;

function Journey({ locale, visualId, title, intro, controls, prediction, scenes, stateKey, onReset }: {
  readonly locale: Paper1Locale;
  readonly visualId: string;
  readonly title: string;
  readonly intro: string;
  readonly controls: ReactNode;
  readonly prediction: Prediction;
  readonly scenes: readonly Scene[];
  readonly stateKey: string;
  readonly onReset: () => void;
}) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<string>();
  const radioName = useId();
  const safeStep = Math.min(step, Math.max(0, scenes.length - 1));
  const current = scenes[safeStep];
  const finished = safeStep === scenes.length - 1;
  const selected = prediction.choices.find((entry) => entry.id === choice);
  const expected = prediction.choices.find((entry) => entry.id === prediction.correctChoiceId);

  useEffect(() => { setStep(0); setChoice(undefined); }, [stateKey]);

  const reset = () => {
    onReset();
    setStep(0);
    setChoice(undefined);
  };

  return <section className={styles.lab} data-paper1-visual={visualId} aria-labelledby={`${visualId}-title`}>
    <header className={styles.header}>
      <span>CHAPTER 3 · {visualId}</span>
      <h3 id={`${visualId}-title`}>{title}</h3>
      <p>{intro}</p>
    </header>
    <div className={styles.controls}>{controls}<div className={styles.controlNote}><strong>{copy(locale, "Change the input", "Đổi input")}</strong><span>{copy(locale, "The prediction and trace reset so you can test the new case fairly.", "Prediction và trace được reset để bạn kiểm tra tình huống mới công bằng.")}</span></div></div>
    <fieldset className={styles.prediction}>
      <legend>{copy(locale, "Predict before revealing the trace", "Dự đoán trước khi xem trace")}</legend>
      <p>{prediction.prompt}</p>
      <div>{prediction.choices.map((entry) => <label key={entry.id}><input type="radio" name={radioName} checked={choice === entry.id} onChange={() => setChoice(entry.id)} /><span>{entry.label}</span></label>)}</div>
      <small aria-live="polite">{choice ? copy(locale, "Prediction recorded. Use Next to test it one step at a time.", "Đã ghi dự đoán. Dùng Tiếp theo để kiểm tra từng bước.") : copy(locale, "Choose one answer to enable Next.", "Chọn một đáp án để bật nút Tiếp theo.")}</small>
    </fieldset>
    <div className={styles.stage}>
      <div className={styles.meter} style={{ "--step-count": scenes.length } as CSSProperties} role="img" aria-label={copy(locale, `Step ${safeStep + 1} of ${scenes.length}`, `Bước ${safeStep + 1} trên ${scenes.length}`)}>{scenes.map((_, index) => <span key={index} data-current={index === safeStep || undefined} data-complete={index < safeStep || undefined} />)}</div>
      <div className={styles.canvasWrap} tabIndex={0}>{current.graphic}</div>
      <div className={styles.explanation} aria-live="polite" aria-atomic="true">
        <span>{copy(locale, `STEP ${safeStep + 1}`, `BƯỚC ${safeStep + 1}`)}</span>
        <h4>{current.title}</h4>
        <p>{current.explanation}</p>
        {current.metric ? <dl><div><dt>{current.metric.label}</dt><dd>{current.metric.value}</dd></div></dl> : null}
      </div>
      <div className={styles.textEquivalent}><strong>{copy(locale, "Text equivalent", "Mô tả tương đương bằng chữ")}</strong><p>{current.explanation}</p></div>
      {finished && choice ? <aside className={styles.comparison} data-match={choice === prediction.correctChoiceId || undefined} aria-live="polite">
        <strong>{choice === prediction.correctChoiceId ? copy(locale, "Prediction matched the model", "Dự đoán khớp với mô hình") : copy(locale, "Revise the prediction", "Hãy điều chỉnh dự đoán")}</strong>
        <dl><div><dt>{copy(locale, "You chose", "Bạn chọn")}</dt><dd>{selected?.label}</dd></div><div><dt>{copy(locale, "Model outcome", "Kết quả mô hình")}</dt><dd>{expected?.label}</dd></div></dl>
      </aside> : null}
      <nav className={styles.navigation} aria-label={copy(locale, "Model controls", "Điều khiển mô hình")}>
        <Button variant="secondary" disabled={safeStep === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft size={17} aria-hidden="true" />{copy(locale, "Back", "Quay lại")}</Button>
        <Button variant="quiet" onClick={reset}><RotateCcw size={17} aria-hidden="true" />{copy(locale, "Reset", "Đặt lại")}</Button>
        <Button disabled={!choice || finished} onClick={() => setStep((value) => Math.min(scenes.length - 1, value + 1))}>{copy(locale, "Next", "Tiếp theo")}<ArrowRight size={17} aria-hidden="true" /></Button>
      </nav>
    </div>
  </section>;
}

function FlowDiagram({ locale, labels, active, capacity, filled }: { readonly locale: Paper1Locale; readonly labels: readonly string[]; readonly active: number; readonly capacity: number; readonly filled: number }) {
  return <div className={styles.flowDiagram} role="img" aria-label={copy(locale, `Data path with ${filled} of ${capacity} buffer slots occupied`, `Data path có ${filled} trên ${capacity} buffer slot đang dùng`)}>
    {labels.map((label, index) => <div key={label} className={styles.flowUnit} data-active={index <= active || undefined}>
      <span>{index + 1}</span><strong>{label}</strong>
      {index === 2 ? <div className={styles.bufferSlots}>{Array.from({ length: capacity }, (_, slot) => <i key={slot} data-filled={slot < filled || undefined} />)}</div> : null}
      {index < labels.length - 1 ? <b aria-hidden="true">→</b> : null}
    </div>)}
  </div>;
}

function BufferLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { workflow: "printer", capacity: 4 } as const;
  const [workflow, setWorkflow] = useState<"printer" | "audio">(defaults.workflow);
  const [capacity, setCapacity] = useState<number>(defaults.capacity);
  const caseData = workflow === "printer" ? {
    labels: [copy(locale, "Document", "Tài liệu"), copy(locale, "Primary memory", "Primary memory"), copy(locale, "Printer buffer", "Printer buffer"), copy(locale, "Print engine", "Bộ máy in")], produced: 8, consumed: 2,
  } : { labels: [copy(locale, "Network packets", "Network packet"), copy(locale, "Decoder", "Decoder"), copy(locale, "Playback buffer", "Playback buffer"), copy(locale, "Speaker", "Speaker")], produced: 5, consumed: 4 };
  const outcome = bufferOccupancy(capacity, caseData.produced, caseData.consumed);
  const resultId = outcome.full ? "fills" : "holds";
  const scenes: Scene[] = [
    { title: copy(locale, "Identify the data path", "Xác định data path"), explanation: copy(locale, "Name the producer, active working memory, finite waiting area and consumer before reasoning about speed.", "Gọi tên producer, working memory đang hoạt động, vùng chờ hữu hạn và consumer trước khi phân tích speed."), graphic: <FlowDiagram locale={locale} labels={caseData.labels} active={0} capacity={capacity} filled={0} /> },
    { title: copy(locale, "Produce a burst", "Tạo một burst"), explanation: copy(locale, `The producer supplies ${caseData.produced} units during the fixture while the consumer can process ${caseData.consumed}.`, `Producer cấp ${caseData.produced} unit trong fixture còn consumer xử lý được ${caseData.consumed}.`), graphic: <FlowDiagram locale={locale} labels={caseData.labels} active={1} capacity={capacity} filled={0} />, metric: { label: copy(locale, "Rate gap", "Chênh lệch tốc độ"), value: `${caseData.produced - caseData.consumed}` } },
    { title: copy(locale, "Queue the difference", "Xếp hàng phần chênh lệch"), explanation: copy(locale, "The buffer temporarily holds units that arrived before the consumer was ready. It coordinates the transfer; it does not make the consumer faster.", "Buffer tạm giữ unit đến trước khi consumer sẵn sàng. Nó phối hợp transfer; không làm consumer nhanh hơn."), graphic: <FlowDiagram locale={locale} labels={caseData.labels} active={2} capacity={capacity} filled={outcome.waiting} />, metric: { label: copy(locale, "Occupied", "Đang dùng"), value: `${outcome.waiting}/${capacity}` } },
    { title: outcome.full ? copy(locale, "The finite buffer fills", "Buffer hữu hạn bị đầy") : copy(locale, "The buffer absorbs this burst", "Buffer hấp thụ burst này"), explanation: outcome.full ? copy(locale, `The rate gap needs ${caseData.produced - caseData.consumed} slots but only ${capacity} exist. ${outcome.overflow} unit(s) must wait upstream or follow the system's overflow policy.`, `Chênh lệch tốc độ cần ${caseData.produced - caseData.consumed} slot nhưng chỉ có ${capacity}. ${outcome.overflow} unit phải chờ phía trước hoặc theo overflow policy của hệ thống.`) : copy(locale, "The consumer continues draining the queued data. A later or larger burst could still fill this finite buffer.", "Consumer tiếp tục lấy dữ liệu đang xếp hàng. Burst sau hoặc lớn hơn vẫn có thể làm buffer hữu hạn này đầy."), graphic: <FlowDiagram locale={locale} labels={caseData.labels} active={3} capacity={capacity} filled={outcome.waiting} />, metric: { label: copy(locale, "Outcome", "Kết quả"), value: outcome.full ? copy(locale, "full / back-pressure", "đầy / back-pressure") : copy(locale, "queued safely", "được xếp hàng") } },
  ];
  return <Journey locale={locale} visualId="VIS-P1-L19" title={copy(locale, "Data flow and finite buffers", "Dòng dữ liệu và buffer hữu hạn")} intro={copy(locale, "Trace where data is captured, held, queued and consumed; then test what a finite buffer can and cannot do.", "Lần theo nơi data được thu, giữ, xếp hàng và tiêu thụ; sau đó kiểm tra buffer hữu hạn làm được và không làm được gì.")} stateKey={`${workflow}-${capacity}`} onReset={() => { setWorkflow(defaults.workflow); setCapacity(defaults.capacity); }} prediction={{ prompt: copy(locale, "What happens to the buffer in this bounded fixture?", "Điều gì xảy ra với buffer trong fixture hữu hạn này?"), choices: [{ id: "fills", label: copy(locale, "It fills and creates upstream waiting", "Nó đầy và tạo chờ phía trước") }, { id: "holds", label: copy(locale, "It holds the temporary difference", "Nó giữ phần chênh lệch tạm thời") }, { id: "faster", label: copy(locale, "It makes the consumer physically faster", "Nó làm consumer nhanh hơn về vật lý") }], correctChoiceId: resultId }} controls={<><Select id="p1-l19-workflow" label={copy(locale, "Workflow", "Workflow")} value={workflow} onChange={(event) => setWorkflow(event.target.value as "printer" | "audio")}><option value="printer">{copy(locale, "Print job", "Print job")}</option><option value="audio">{copy(locale, "Audio playback", "Audio playback")}</option></Select><Select id="p1-l19-capacity" label={copy(locale, "Buffer capacity", "Buffer capacity")} value={capacity} onChange={(event) => setCapacity(Number(event.target.value))}><option value={3}>3 slots</option><option value={4}>4 slots</option><option value={6}>6 slots</option></Select></>} scenes={scenes} />;
}

type DeviceKey = "laser" | "3d" | "audio" | "hdd" | "flash" | "optical" | "touch" | "vr";
const deviceSpecs: Readonly<Record<DeviceKey, Readonly<{ label: Localized; parts: readonly Localized[]; steps: readonly Readonly<{ title: Localized; explanation: Localized }>[] }>>> = {
  laser: { label: { en: "Laser printer", vi: "Laser printer" }, parts: [{ en: "charged drum", vi: "drum tích điện" }, { en: "laser image", vi: "laser image" }, { en: "toner transfer", vi: "toner transfer" }, { en: "heated fuser", vi: "heated fuser" }], steps: [
    { title: { en: "Charge the drum", vi: "Tích điện drum" }, explanation: { en: "The photosensitive drum receives a uniform electrostatic charge.", vi: "Drum quang dẫn nhận electrostatic charge đồng đều." } }, { title: { en: "Write the latent image", vi: "Ghi latent image" }, explanation: { en: "The laser discharges selected points so the page image exists as a charge pattern.", vi: "Laser làm mất charge tại điểm được chọn để page image tồn tại dưới dạng charge pattern." } }, { title: { en: "Attract and transfer toner", vi: "Hút và chuyển toner" }, explanation: { en: "Toner follows the electrostatic image and is transferred from drum to paper.", vi: "Toner bám theo electrostatic image rồi chuyển từ drum sang paper." } }, { title: { en: "Fuse the page", vi: "Fuse trang in" }, explanation: { en: "Heated pressure rollers melt and press toner into the paper fibres.", vi: "Con lăn nhiệt và áp suất làm toner chảy và ép vào fibre của paper." } },
  ] },
  "3d": { label: { en: "3D printer", vi: "3D printer" }, parts: [{ en: "digital model", vi: "digital model" }, { en: "slicer", vi: "slicer" }, { en: "nozzle / energy", vi: "nozzle / energy" }, { en: "layered object", vi: "layered object" }], steps: [
    { title: { en: "Load the model", vi: "Nạp model" }, explanation: { en: "A three-dimensional digital model defines the target geometry.", vi: "Digital model ba chiều định nghĩa geometry cần tạo." } }, { title: { en: "Slice into cross-sections", vi: "Slice thành cross-section" }, explanation: { en: "Software converts the model into thin ordered layers and a tool path.", vi: "Software đổi model thành các layer mỏng có thứ tự và tool path." } }, { title: { en: "Deposit or fuse material", vi: "Đắp hoặc fuse vật liệu" }, explanation: { en: "The printer forms one cross-section using deposited or fused material.", vi: "Printer tạo một cross-section bằng vật liệu được đắp hoặc fuse." } }, { title: { en: "Repeat additively", vi: "Lặp theo additive" }, explanation: { en: "The head or platform moves and the layers accumulate into a solid object.", vi: "Head hoặc platform di chuyển và các layer tích lũy thành solid object." } },
  ] },
  audio: { label: { en: "Microphone ↔ speaker", vi: "Microphone ↔ speaker" }, parts: [{ en: "sound / diaphragm", vi: "sound / diaphragm" }, { en: "coil + magnet", vi: "coil + magnet" }, { en: "ADC / DAC", vi: "ADC / DAC" }, { en: "digital samples", vi: "digital sample" }], steps: [
    { title: { en: "Move the diaphragm", vi: "Làm diaphragm chuyển động" }, explanation: { en: "Sound pressure vibrates a microphone diaphragm; playback drives a speaker cone in the reverse direction.", vi: "Sound pressure làm microphone diaphragm rung; playback điều khiển speaker cone theo chiều ngược lại." } }, { title: { en: "Convert motion and current", vi: "Chuyển đổi motion và current" }, explanation: { en: "Coil motion in a magnetic field induces current; speaker current creates a changing magnetic force.", vi: "Coil chuyển động trong magnetic field tạo current; speaker current tạo magnetic force thay đổi." } }, { title: { en: "Cross the analogue/digital boundary", vi: "Qua ranh giới analogue/digital" }, explanation: { en: "An ADC digitises microphone current; a DAC reconstructs analogue current from stored samples.", vi: "ADC digitise microphone current; DAC khôi phục analogue current từ stored sample." } }, { title: { en: "Store or reproduce sound", vi: "Lưu hoặc tái tạo sound" }, explanation: { en: "The computer stores digital samples, or amplifies DAC output so the speaker produces pressure waves.", vi: "Computer lưu digital sample hoặc amplify DAC output để speaker tạo pressure wave." } },
  ] },
  hdd: { label: { en: "Magnetic hard disk", vi: "Magnetic hard disk" }, parts: [{ en: "spinning platter", vi: "platter quay" }, { en: "actuator arm", vi: "actuator arm" }, { en: "read/write head", vi: "read/write head" }, { en: "track + sector", vi: "track + sector" }], steps: [
    { title: { en: "Spin the platter", vi: "Quay platter" }, explanation: { en: "The spindle rotates magnetically coated platters at a controlled speed.", vi: "Spindle quay platter phủ vật liệu từ ở tốc độ được kiểm soát." } }, { title: { en: "Select the track", vi: "Chọn track" }, explanation: { en: "The actuator moves the head radially to the requested track.", vi: "Actuator đưa head theo bán kính tới track được yêu cầu." } }, { title: { en: "Wait for the sector", vi: "Chờ sector" }, explanation: { en: "Rotation brings the requested sector under the head.", vi: "Chuyển động quay đưa sector cần thiết tới dưới head." } }, { title: { en: "Sense magnetic transitions", vi: "Cảm nhận magnetic transition" }, explanation: { en: "The head senses stored magnetic orientation and electronics decode the pattern into bits.", vi: "Head cảm nhận hướng từ đã lưu và electronics giải mã pattern thành bit." } },
  ] },
  flash: { label: { en: "Flash storage", vi: "Flash storage" }, parts: [{ en: "control gate", vi: "control gate" }, { en: "floating gate", vi: "floating gate" }, { en: "trapped charge", vi: "trapped charge" }, { en: "threshold read", vi: "threshold read" }], steps: [
    { title: { en: "Select a cell", vi: "Chọn cell" }, explanation: { en: "The controller addresses cells within a page or block.", vi: "Controller address cell trong page hoặc block." } }, { title: { en: "Apply a programming voltage", vi: "Áp programming voltage" }, explanation: { en: "The electric field moves electrons onto or away from an insulated floating gate.", vi: "Electric field đưa electron vào hoặc ra khỏi floating gate cách điện." } }, { title: { en: "Trap the charge", vi: "Giữ charge" }, explanation: { en: "Insulation retains charge after power is removed, making the state non-volatile.", vi: "Lớp cách điện giữ charge sau khi mất điện, làm state non-volatile." } }, { title: { en: "Sense the threshold", vi: "Cảm nhận threshold" }, explanation: { en: "Read circuitry tests transistor threshold state and decodes it as stored data.", vi: "Read circuitry kiểm tra transistor threshold state và giải mã thành stored data." } },
  ] },
  optical: { label: { en: "Optical disc", vi: "Optical disc" }, parts: [{ en: "spinning disc", vi: "disc quay" }, { en: "spiral track", vi: "spiral track" }, { en: "focused laser", vi: "focused laser" }, { en: "light sensor", vi: "light sensor" }], steps: [
    { title: { en: "Rotate the spiral track", vi: "Quay spiral track" }, explanation: { en: "The disc spins while the optical head follows the single spiral data path.", vi: "Disc quay khi optical head theo một spiral data path." } }, { title: { en: "Focus the laser", vi: "Hội tụ laser" }, explanation: { en: "A low-power beam reaches a precise recorded position.", vi: "Beam công suất thấp tới đúng recorded position." } }, { title: { en: "Measure reflection", vi: "Đo reflection" }, explanation: { en: "Recorded surface or dye states return different light levels to a sensor.", vi: "Recorded surface hoặc dye state trả về light level khác nhau cho sensor." } }, { title: { en: "Decode or write", vi: "Decode hoặc write" }, explanation: { en: "Electronics decode the reflection; recordable media use a stronger laser to change the recording layer.", vi: "Electronics giải mã reflection; recordable media dùng laser mạnh hơn để đổi recording layer." } },
  ] },
  touch: { label: { en: "Capacitive touchscreen", vi: "Capacitive touchscreen" }, parts: [{ en: "electrode grid", vi: "electrode grid" }, { en: "finger contact", vi: "finger contact" }, { en: "capacitance change", vi: "capacitance change" }, { en: "touch coordinates", vi: "touch coordinate" }], steps: [
    { title: { en: "Maintain the field", vi: "Duy trì field" }, explanation: { en: "Transparent electrodes form a sensing grid across the screen.", vi: "Electrode trong suốt tạo sensing grid trên màn hình." } }, { title: { en: "Touch the surface", vi: "Chạm bề mặt" }, explanation: { en: "A conductive finger changes local capacitance near grid intersections.", vi: "Ngón tay dẫn điện làm đổi capacitance cục bộ gần grid intersection." } }, { title: { en: "Measure the change", vi: "Đo thay đổi" }, explanation: { en: "The controller samples electrode changes and estimates the touch position.", vi: "Controller lấy mẫu thay đổi electrode và ước lượng touch position." } }, { title: { en: "Report the event", vi: "Báo event" }, explanation: { en: "Coordinates are sent to software as a touch, gesture or release event.", vi: "Coordinate được gửi tới software thành touch, gesture hoặc release event." } },
  ] },
  vr: { label: { en: "VR headset", vi: "VR headset" }, parts: [{ en: "head sensors", vi: "head sensor" }, { en: "new viewpoint", vi: "viewpoint mới" }, { en: "left/right frames", vi: "frame trái/phải" }, { en: "lenses + audio", vi: "lens + audio" }], steps: [
    { title: { en: "Measure head motion", vi: "Đo head motion" }, explanation: { en: "Gyroscopes, accelerometers or cameras estimate head orientation and movement.", vi: "Gyroscope, accelerometer hoặc camera ước lượng hướng và chuyển động đầu." } }, { title: { en: "Calculate the viewpoint", vi: "Tính viewpoint" }, explanation: { en: "The computer updates the virtual camera from the tracked pose.", vi: "Computer cập nhật virtual camera từ tracked pose." } }, { title: { en: "Render two frames", vi: "Render hai frame" }, explanation: { en: "Separate left and right images provide stereoscopic depth through headset displays and lenses.", vi: "Image trái và phải riêng tạo stereoscopic depth qua headset display và lens." } }, { title: { en: "Update visual and audio output", vi: "Cập nhật visual và audio output" }, explanation: { en: "The next frame and binaural audio reflect the user's new orientation.", vi: "Frame tiếp theo và binaural audio phản ánh hướng mới của người dùng." } },
  ] },
};

function DeviceGlyph({ device, step, locale }: { readonly device: DeviceKey; readonly step: number; readonly locale: Paper1Locale }) {
  const label = deviceSpecs[device].label[locale];
  return <svg className={styles.deviceGlyph} viewBox="0 0 360 170" role="img" aria-label={copy(locale, `${label} mechanism diagram`, `Sơ đồ cơ chế ${label}`)}>
    <title>{label}</title>
    {device === "laser" ? <g><circle cx="165" cy="90" r="44" /><path d="M25 38h90l45 48" /><path d="M200 90h118v48H196" /><path d="M220 136h70" /></g> : null}
    {device === "3d" ? <g><path d="M150 25h60l-12 35h-36z" /><path d="M180 60v30" /><path d="M115 140h130" /><path d="M135 130h90M145 116h70M158 102h44" /></g> : null}
    {device === "audio" ? <g><path d="M20 85c25-60 45 60 70 0s45 60 70 0" /><path d="M190 40v90l55-45z" /><path d="M255 55c25 18 25 42 0 60M275 40c40 28 40 62 0 90" /></g> : null}
    {device === "hdd" ? <g><circle cx="150" cy="85" r="58" /><circle cx="150" cy="85" r="10" /><circle cx="150" cy="85" r="34" /><path d="M300 35l-94 66" /><circle cx="300" cy="35" r="12" /></g> : null}
    {device === "flash" ? <g><rect x="80" y="30" width="200" height="110" rx="18" /><path d="M110 58h140M110 112h140" /><rect x="145" y="70" width="70" height="30" rx="6" /><circle cx="165" cy="85" r="4" /><circle cx="180" cy="85" r="4" /><circle cx="195" cy="85" r="4" /></g> : null}
    {device === "optical" ? <g><circle cx="165" cy="88" r="70" /><circle cx="165" cy="88" r="12" /><path d="M35 28l105 50" /><path d="M35 28h65" /><path d="M225 125l90 22" /></g> : null}
    {device === "touch" ? <g><rect x="70" y="22" width="220" height="126" rx="18" /><path d="M115 30v110M160 30v110M205 30v110M250 30v110M78 62h204M78 98h204" /><path d="M205 10v70" /><circle cx="205" cy="84" r="17" /></g> : null}
    {device === "vr" ? <g><path d="M75 55q105-45 210 0l-20 75q-45 15-85-25-40 40-85 25z" /><circle cx="135" cy="82" r="25" /><circle cx="225" cy="82" r="25" /><path d="M65 72H25M295 72h40" /><path d="M160 30q20-22 40 0" /></g> : null}
    <text x="180" y="162" textAnchor="middle">{copy(locale, `Phase ${step + 1}`, `Pha ${step + 1}`)}</text>
  </svg>;
}

function DeviceRail({ spec, active, locale }: { readonly spec: (typeof deviceSpecs)[DeviceKey]; readonly active: number; readonly locale: Paper1Locale }) {
  return <div className={styles.deviceScene}><DeviceGlyph device={(Object.keys(deviceSpecs) as DeviceKey[]).find((key) => deviceSpecs[key] === spec) ?? "laser"} step={active} locale={locale} /><div className={styles.mechanismRail}>{spec.parts.map((part, index) => <div key={part.en} data-active={index <= active || undefined}><span>{index + 1}</span><strong>{part[locale]}</strong>{index < spec.parts.length - 1 ? <b>→</b> : null}</div>)}</div></div>;
}

function DeviceLab({ locale }: { readonly locale: Paper1Locale }) {
  const [device, setDevice] = useState<DeviceKey>("laser");
  const spec = deviceSpecs[device];
  const scenes = spec.steps.map((entry, index): Scene => ({ title: entry.title[locale], explanation: entry.explanation[locale], graphic: <DeviceRail spec={spec} active={index} locale={locale} />, metric: index === spec.steps.length - 1 ? { label: copy(locale, "Mechanism", "Cơ chế"), value: spec.label[locale] } : undefined }));
  return <Journey locale={locale} visualId="VIS-P1-L20" title={copy(locale, "Eight device mechanisms", "Tám cơ chế thiết bị")} intro={copy(locale, "Select each syllabus device family and trace its own components, physical change and data conversion in order.", "Chọn từng nhóm thiết bị trong syllabus và lần theo thành phần, biến đổi vật lý cùng data conversion riêng theo thứ tự.")} stateKey={device} onReset={() => setDevice("laser")} prediction={{ prompt: copy(locale, "Which reasoning pattern produces a complete device explanation?", "Mẫu reasoning nào tạo lời giải thích thiết bị hoàn chỉnh?"), choices: [{ id: "causal", label: copy(locale, "Component → physical change → data/result", "Component → physical change → data/result") }, { id: "purpose", label: copy(locale, "Only state what the device is used for", "Chỉ nêu device dùng để làm gì") }, { id: "generic", label: copy(locale, "Use one generic mechanism for every device", "Dùng một cơ chế chung cho mọi device") }], correctChoiceId: "causal" }} controls={<Select id="p1-l20-device" label={copy(locale, "Device family", "Nhóm thiết bị")} value={device} onChange={(event) => setDevice(event.target.value as DeviceKey)}>{(Object.keys(deviceSpecs) as DeviceKey[]).map((key) => <option key={key} value={key}>{deviceSpecs[key].label[locale]}</option>)}</Select>} scenes={scenes} />;
}

const sensorLabels: Readonly<Record<string, Localized>> = {
  temperature: { en: "Temperature sensor", vi: "Temperature sensor" }, pressure: { en: "Pressure sensor", vi: "Pressure sensor" }, infrared: { en: "Infra-red sensor", vi: "Infra-red sensor" }, sound: { en: "Sound sensor", vi: "Sound sensor" },
};

function ControlLoop({ locale, sensor, mode, reading, target, active }: { readonly locale: Paper1Locale; readonly sensor: string; readonly mode: ControlMode; readonly reading: number; readonly target: number; readonly active: number }) {
  const decision = controlDecision(mode, reading, target);
  const nodes = [sensorLabels[sensor][locale], copy(locale, "ADC / input", "ADC / input"), copy(locale, "Controller", "Controller"), mode === "control" ? copy(locale, "Actuator", "Actuator") : copy(locale, "Record / alert", "Record / alert"), copy(locale, "New reading", "Reading mới")];
  return <div className={styles.controlLoop} role="img" aria-label={copy(locale, `${mode} loop: reading ${reading}, target ${target}, actuator ${decision.actuator}`, `${mode} loop: reading ${reading}, target ${target}, actuator ${decision.actuator}`)}>{nodes.map((node, index) => <div key={node} data-active={index <= active || undefined}><span>{index + 1}</span><strong>{node}</strong>{index === 2 ? <small>{reading} {decision.comparison} {target}</small> : index === 3 ? <small>{mode === "control" ? `actuator ${decision.actuator}` : copy(locale, "no automatic action", "không tự động tác động")}</small> : index === 4 ? <small>{mode === "control" ? decision.nextReading : reading}</small> : null}{index < nodes.length - 1 ? <b>→</b> : null}</div>)}</div>;
}

function EmbeddedLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { sensor: "temperature", mode: "control" as ControlMode, reading: 21, target: 24 };
  const [sensor, setSensor] = useState(defaults.sensor);
  const [mode, setMode] = useState<ControlMode>(defaults.mode);
  const [reading, setReading] = useState(defaults.reading);
  const [target, setTarget] = useState(defaults.target);
  const decision = controlDecision(mode, reading, target);
  const correct = mode === "monitor" ? "record" : decision.actuator;
  const scenes: Scene[] = [
    { title: copy(locale, "Sense the physical condition", "Sense điều kiện vật lý"), explanation: copy(locale, `${sensorLabels[sensor][locale]} produces a signal representing the current reading ${reading}.`, `${sensorLabels[sensor][locale]} tạo signal biểu diễn reading hiện tại ${reading}.`), graphic: <ControlLoop locale={locale} sensor={sensor} mode={mode} reading={reading} target={target} active={0} /> },
    { title: copy(locale, "Convert and compare", "Convert và compare"), explanation: copy(locale, `The processor receives a digital value and compares ${reading} with the stated target ${target}; the result is ${decision.comparison}.`, `Processor nhận digital value và so sánh ${reading} với target ${target}; kết quả là ${decision.comparison}.`), graphic: <ControlLoop locale={locale} sensor={sensor} mode={mode} reading={reading} target={target} active={2} />, metric: { label: copy(locale, "Comparison", "So sánh"), value: decision.comparison } },
    { title: mode === "monitor" ? copy(locale, "Record or alert", "Record hoặc alert") : copy(locale, "Drive the actuator", "Điều khiển actuator"), explanation: mode === "monitor" ? copy(locale, "Monitoring stores the reading or alerts a person. It does not automatically change the measured process in this fixture.", "Monitoring lưu reading hoặc alert cho người. Nó không tự động thay đổi process được đo trong fixture này.") : copy(locale, `The controller sets the actuator ${decision.actuator} under the explicit rule: ON only when reading is below target.`, `Controller đặt actuator ${decision.actuator} theo rule rõ ràng: ON chỉ khi reading nhỏ hơn target.`), graphic: <ControlLoop locale={locale} sensor={sensor} mode={mode} reading={reading} target={target} active={3} />, metric: { label: copy(locale, "Output", "Output"), value: mode === "monitor" ? copy(locale, "record / alert", "record / alert") : decision.actuator } },
    { title: copy(locale, "Use the next reading as feedback", "Dùng reading tiếp theo làm feedback"), explanation: mode === "monitor" ? copy(locale, "The next sample extends the record. No actuator branch closes a control loop.", "Sample tiếp theo mở rộng record. Không có actuator branch khép control loop.") : copy(locale, `This bounded state model records the next reading as ${decision.nextReading}. It demonstrates decision and feedback, not physical heating or pressure dynamics.`, `State model hữu hạn ghi reading tiếp theo là ${decision.nextReading}. Nó minh họa decision và feedback, không mô phỏng động lực học nhiệt hoặc pressure.`), graphic: <ControlLoop locale={locale} sensor={sensor} mode={mode} reading={reading} target={target} active={4} />, metric: { label: copy(locale, "Next reading", "Reading tiếp"), value: String(decision.nextReading) } },
  ];
  return <Journey locale={locale} visualId="VIS-P1-L21" title={copy(locale, "Sensor–controller–actuator feedback", "Feedback sensor–controller–actuator")} intro={copy(locale, "Change the sensor, reading, target and mode; predict the output, then trace the bounded decision rule.", "Đổi sensor, reading, target và mode; dự đoán output rồi lần theo decision rule hữu hạn.")} stateKey={`${sensor}-${mode}-${reading}-${target}`} onReset={() => { setSensor(defaults.sensor); setMode(defaults.mode); setReading(defaults.reading); setTarget(defaults.target); }} prediction={{ prompt: copy(locale, "What output will this selected mode produce?", "Mode đã chọn sẽ tạo output nào?"), choices: [{ id: "record", label: copy(locale, "Record or alert only", "Chỉ record hoặc alert") }, { id: "on", label: copy(locale, "Actuator ON", "Actuator ON") }, { id: "off", label: copy(locale, "Actuator OFF", "Actuator OFF") }], correctChoiceId: correct }} controls={<><Select id="p1-l21-sensor" label={copy(locale, "Sensor", "Sensor")} value={sensor} onChange={(event) => setSensor(event.target.value)}>{Object.entries(sensorLabels).map(([key, label]) => <option key={key} value={key}>{label[locale]}</option>)}</Select><Select id="p1-l21-mode" label={copy(locale, "Mode", "Mode")} value={mode} onChange={(event) => setMode(event.target.value as ControlMode)}><option value="monitor">{copy(locale, "Monitoring", "Monitoring")}</option><option value="control">{copy(locale, "Control", "Control")}</option></Select><label className={styles.rangeLabel} htmlFor="p1-l21-reading"><span>{copy(locale, "Reading", "Reading")} · {reading}</span><input id="p1-l21-reading" type="range" min="0" max="40" value={reading} onChange={(event) => setReading(Number(event.target.value))} /></label><label className={styles.rangeLabel} htmlFor="p1-l21-target"><span>{copy(locale, "Target", "Target")} · {target}</span><input id="p1-l21-target" type="range" min="0" max="40" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label></>} scenes={scenes} />;
}

const memoryLabels: Readonly<Record<MemoryUse, Localized>> = {
  "main-memory": { en: "large main memory", vi: "main memory dung lượng lớn" }, cache: { en: "small high-speed cache", vi: "cache nhỏ tốc độ cao" }, "fixed-firmware": { en: "fixed production firmware", vi: "production firmware cố định" }, "prototype-firmware": { en: "firmware under development", vi: "firmware đang phát triển" }, "device-settings": { en: "changeable device settings", vi: "device setting có thể đổi" },
};

function MemoryPanel({ locale, memory, event, useCase, active }: { readonly locale: Paper1Locale; readonly memory: MemoryType; readonly event: MemoryEvent; readonly useCase: MemoryUse; readonly active: number }) {
  const facts = memoryFacts[memory];
  const outcome = memoryEventOutcome(memory, event);
  return <div className={styles.memoryPanel} role="img" aria-label={copy(locale, `${memory} properties and ${event} outcome ${outcome}`, `${memory} properties và kết quả ${event}: ${outcome}`)}>
    <div className={styles.memoryChip} data-active={active >= 0 || undefined}><small>MEMORY</small><strong>{memory}</strong><span>{facts.volatile ? "VOLATILE" : "NON-VOLATILE"}</span></div>
    <div className={styles.propertyGrid}>
      <div data-active={active >= 0 || undefined}><span>{copy(locale, "Power removed", "Mất điện")}</span><strong>{facts.volatile ? copy(locale, "data lost", "mất data") : copy(locale, "data retained", "giữ data")}</strong></div>
      <div data-active={active >= 1 || undefined}><span>{copy(locale, "Write lifecycle", "Write lifecycle")}</span><strong>{facts.writable}</strong></div>
      <div data-active={active >= 1 || undefined}><span>Refresh</span><strong>{facts.refresh ? copy(locale, "required", "bắt buộc") : copy(locale, "not required", "không cần")}</strong></div>
      <div data-active={active >= 2 || undefined}><span>{copy(locale, "Selected use", "Use case đã chọn")}</span><strong>{memoryLabels[useCase][locale]}</strong></div>
    </div>
  </div>;
}

function MemoryLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { memory: "DRAM" as MemoryType, event: "power-off" as MemoryEvent, useCase: "main-memory" as MemoryUse };
  const [memory, setMemory] = useState<MemoryType>(defaults.memory);
  const [event, setEvent] = useState<MemoryEvent>(defaults.event);
  const [useCase, setUseCase] = useState<MemoryUse>(defaults.useCase);
  const facts = memoryFacts[memory];
  const outcome = memoryEventOutcome(memory, event);
  const suitable = facts.bestUses.includes(useCase);
  const scenes: Scene[] = [
    { title: copy(locale, "Inspect volatility", "Kiểm tra volatility"), explanation: facts.volatile ? copy(locale, `${memory} requires continuous power to retain the selected data state.`, `${memory} cần nguồn liên tục để giữ data state đã chọn.`) : copy(locale, `${memory} retains its stored state when power is removed.`, `${memory} giữ stored state khi mất điện.`), graphic: <MemoryPanel locale={locale} memory={memory} event={event} useCase={useCase} active={0} /> },
    { title: copy(locale, "Apply the selected event", "Áp dụng event đã chọn"), explanation: copy(locale, `Event “${event}” produces the model outcome “${outcome}”. The result follows the technology's stated lifecycle, not its name alone.`, `Event “${event}” tạo model outcome “${outcome}”. Kết quả theo lifecycle đã nêu của technology, không chỉ theo tên.`), graphic: <MemoryPanel locale={locale} memory={memory} event={event} useCase={useCase} active={1} />, metric: { label: copy(locale, "Event outcome", "Kết quả event"), value: outcome } },
    { title: suitable ? copy(locale, "The use matches the trade-off", "Use case khớp trade-off") : copy(locale, "Choose a stronger match", "Chọn technology phù hợp hơn"), explanation: suitable ? copy(locale, `${memory} is a strong match for ${memoryLabels[useCase][locale]} under this syllabus comparison.`, `${memory} phù hợp với ${memoryLabels[useCase][locale]} trong comparison theo syllabus.`) : copy(locale, `${memory} is not the strongest match for ${memoryLabels[useCase][locale]}. Compare speed, density, cost, volatility and reprogramming method before choosing.`, `${memory} không phải lựa chọn tốt nhất cho ${memoryLabels[useCase][locale]}. Hãy so sánh speed, density, cost, volatility và cách reprogram trước khi chọn.`), graphic: <MemoryPanel locale={locale} memory={memory} event={event} useCase={useCase} active={2} />, metric: { label: copy(locale, "Selection", "Lựa chọn"), value: suitable ? copy(locale, "strong match", "phù hợp") : copy(locale, "revise", "cần sửa") } },
  ];
  return <Journey locale={locale} visualId="VIS-P1-L22" title={copy(locale, "Memory lifecycle and selection", "Lifecycle và lựa chọn memory")} intro={copy(locale, "Apply power, write and refresh events to seven memory labels, then test each technology against a concrete use.", "Áp dụng event power, write, refresh cho bảy nhãn memory rồi kiểm tra technology với use case cụ thể.")} stateKey={`${memory}-${event}-${useCase}`} onReset={() => { setMemory(defaults.memory); setEvent(defaults.event); setUseCase(defaults.useCase); }} prediction={{ prompt: copy(locale, `Is ${memory} a strong match for ${memoryLabels[useCase][locale]}?`, `${memory} có phù hợp với ${memoryLabels[useCase][locale]} không?`), choices: [{ id: "yes", label: copy(locale, "Yes — the trade-off fits", "Có — trade-off phù hợp") }, { id: "no", label: copy(locale, "No — choose another technology", "Không — chọn technology khác") }], correctChoiceId: suitable ? "yes" : "no" }} controls={<><Select id="p1-l22-memory" label={copy(locale, "Memory type", "Loại memory")} value={memory} onChange={(eventValue) => setMemory(eventValue.target.value as MemoryType)}>{(Object.keys(memoryFacts) as MemoryType[]).map((key) => <option key={key} value={key}>{key}</option>)}</Select><Select id="p1-l22-event" label={copy(locale, "Event", "Event")} value={event} onChange={(eventValue) => setEvent(eventValue.target.value as MemoryEvent)}><option value="power-off">{copy(locale, "Remove power", "Mất điện")}</option><option value="write">{copy(locale, "Attempt write / reprogram", "Thử write / reprogram")}</option><option value="refresh">{copy(locale, "Check refresh", "Kiểm tra refresh")}</option></Select><Select id="p1-l22-use" label={copy(locale, "Use case", "Use case")} value={useCase} onChange={(eventValue) => setUseCase(eventValue.target.value as MemoryUse)}>{(Object.keys(memoryLabels) as MemoryUse[]).map((key) => <option key={key} value={key}>{memoryLabels[key][locale]}</option>)}</Select></>} scenes={scenes} />;
}

function GateShape({ gate, x = 0, y = 0, scale = 1, active = true }: { readonly gate: LogicGate; readonly x?: number; readonly y?: number; readonly scale?: number; readonly active?: boolean }) {
  const base = gate === "NAND" ? "AND" : gate === "NOR" ? "OR" : gate;
  const bubble = gate === "NOT" || gate === "NAND" || gate === "NOR";
  const outputStart = bubble ? 82 : 75;
  return <g transform={`translate(${x} ${y}) scale(${scale})`} data-active={active || undefined} className={styles.gateShape}>
    {base === "NOT" ? <><line x1="0" y1="50" x2="20" y2="50" /><path d="M20 18 L20 82 L70 50 Z" /></> : <><line x1="0" y1="32" x2="22" y2="32" /><line x1="0" y1="68" x2="22" y2="68" />{base === "AND" ? <path d="M22 15 L48 15 C68 15 78 30 78 50 C78 70 68 85 48 85 L22 85 Z" /> : <><path d="M22 15 Q42 50 22 85 Q58 84 78 50 Q58 16 22 15 Z" /><path d="M14 15 Q34 50 14 85" />{base === "XOR" ? <path d="M7 15 Q27 50 7 85" /> : null}</>}</>}
    {bubble ? <circle cx="78" cy="50" r="6" /> : null}<line x1={outputStart} y1="50" x2="100" y2="50" /><text x="50" y="55" textAnchor="middle">{gate}</text>
  </g>;
}

function GatePanel({ locale, gate, inputA, inputB, stage }: { readonly locale: Paper1Locale; readonly gate: LogicGate; readonly inputA: 0 | 1; readonly inputB: 0 | 1; readonly stage: number }) {
  const output = logicGateOutput(gate, inputA, inputB);
  const rows = logicGateRows(gate);
  return <div className={styles.gatePanel}>
    <svg viewBox="0 0 300 150" role="img" aria-label={copy(locale, `${gate} gate with input A ${inputA}${gate === "NOT" ? "" : ` and B ${inputB}`}, output ${output}`, `${gate} gate có input A ${inputA}${gate === "NOT" ? "" : ` và B ${inputB}`}, output ${output}`)}><text x="18" y={gate === "NOT" ? "80" : "59"}>A={inputA}</text>{gate !== "NOT" ? <text x="18" y="105">B={inputB}</text> : null}<GateShape gate={gate} x={90} y={25} scale={1.05} active={stage >= 0} /><text x="235" y="80" data-output={stage >= 2 || undefined}>Y={stage >= 2 ? output : "?"}</text></svg>
    <table><caption>{copy(locale, `${gate} truth table`, `Truth table ${gate}`)}</caption><thead><tr><th>A</th>{gate !== "NOT" ? <th>B</th> : null}<th>Y</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.inputA}-${row.inputB}`} data-current={stage >= 3 && row.inputA === inputA && (gate === "NOT" || row.inputB === inputB) || undefined}><td>{row.inputA}</td>{gate !== "NOT" ? <td>{row.inputB}</td> : null}<td>{row.output}</td></tr>)}</tbody></table>
  </div>;
}

function LogicGateLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { gate: "AND" as LogicGate, inputA: 1 as 0 | 1, inputB: 0 as 0 | 1 };
  const [gate, setGate] = useState<LogicGate>(defaults.gate);
  const [inputA, setInputA] = useState<0 | 1>(defaults.inputA);
  const [inputB, setInputB] = useState<0 | 1>(defaults.inputB);
  const output = logicGateOutput(gate, inputA, inputB);
  const rule = gate === "NOT" ? copy(locale, "invert A", "invert A") : gate === "AND" ? copy(locale, "1 only when both inputs are 1", "1 chỉ khi cả hai input là 1") : gate === "OR" ? copy(locale, "1 when at least one input is 1", "1 khi ít nhất một input là 1") : gate === "NAND" ? copy(locale, "the inverse of AND", "inverse của AND") : gate === "NOR" ? copy(locale, "the inverse of OR", "inverse của OR") : copy(locale, "1 when the two inputs differ", "1 khi hai input khác nhau");
  const scenes: Scene[] = [
    { title: copy(locale, "Read the standard symbol", "Đọc standard symbol"), explanation: copy(locale, "Identify the base shape, any output inversion bubble and the extra input curve used only by XOR.", "Nhận diện base shape, output inversion bubble và input curve thêm chỉ có ở XOR."), graphic: <GatePanel locale={locale} gate={gate} inputA={inputA} inputB={inputB} stage={0} /> },
    { title: copy(locale, "Apply the selected inputs", "Áp dụng input đã chọn"), explanation: gate === "NOT" ? copy(locale, `NOT has one input, so B is ignored. The active input is A=${inputA}.`, `NOT có một input nên B bị bỏ qua. Active input là A=${inputA}.`) : copy(locale, `This syllabus gate uses two inputs: A=${inputA} and B=${inputB}.`, `Gate trong syllabus này dùng hai input: A=${inputA} và B=${inputB}.`), graphic: <GatePanel locale={locale} gate={gate} inputA={inputA} inputB={inputB} stage={1} /> },
    { title: copy(locale, "Evaluate the gate rule", "Tính theo gate rule"), explanation: copy(locale, `${gate}: ${rule}. Therefore the selected output is ${output}.`, `${gate}: ${rule}. Vì vậy output đã chọn là ${output}.`), graphic: <GatePanel locale={locale} gate={gate} inputA={inputA} inputB={inputB} stage={2} />, metric: { label: copy(locale, "Output", "Output"), value: String(output) } },
    { title: copy(locale, "Verify the truth row", "Verify truth row"), explanation: copy(locale, "The highlighted row contains the exact selected input combination. Every possible combination appears once in the complete table.", "Row được highlight chứa đúng input combination đã chọn. Mỗi possible combination xuất hiện một lần trong table hoàn chỉnh."), graphic: <GatePanel locale={locale} gate={gate} inputA={inputA} inputB={inputB} stage={3} />, metric: { label: copy(locale, "Verified Y", "Y đã verify"), value: String(output) } },
  ];
  return <Journey locale={locale} visualId="VIS-P1-L23" title={copy(locale, "Logic symbols and truth rows", "Logic symbol và truth row")} intro={copy(locale, "Select a standard gate, predict its output and verify the exact input row in the complete truth table.", "Chọn standard gate, dự đoán output và verify đúng input row trong truth table hoàn chỉnh.")} stateKey={`${gate}-${inputA}-${inputB}`} onReset={() => { setGate(defaults.gate); setInputA(defaults.inputA); setInputB(defaults.inputB); }} prediction={{ prompt: copy(locale, "What is the output for the selected gate and inputs?", "Output của gate và input đã chọn là gì?"), choices: [{ id: "0", label: "0" }, { id: "1", label: "1" }], correctChoiceId: String(output) }} controls={<><Select id="p1-l23-gate" label={copy(locale, "Gate", "Gate")} value={gate} onChange={(event) => setGate(event.target.value as LogicGate)}>{(["NOT", "AND", "OR", "NAND", "NOR", "XOR"] as LogicGate[]).map((entry) => <option key={entry}>{entry}</option>)}</Select><Select id="p1-l23-a" label="Input A" value={inputA} onChange={(event) => setInputA(Number(event.target.value) as 0 | 1)}><option value={0}>0</option><option value={1}>1</option></Select><Select id="p1-l23-b" label={gate === "NOT" ? copy(locale, "Input B (ignored for NOT)", "Input B (bỏ qua với NOT)") : "Input B"} value={inputB} disabled={gate === "NOT"} onChange={(event) => setInputB(Number(event.target.value) as 0 | 1)}><option value={0}>0</option><option value={1}>1</option></Select></>} scenes={scenes} />;
}

function CircuitDiagram({ locale, circuit, inputA, inputB, inputC, stage }: { readonly locale: Paper1Locale; readonly circuit: LogicCircuit; readonly inputA: 0 | 1; readonly inputB: 0 | 1; readonly inputC: 0 | 1; readonly stage: number }) {
  const result = evaluateLogicCircuit(circuit, inputA, inputB, inputC);
  const firstGate: LogicGate = circuit === "alarm" ? "AND" : "OR";
  const finalGate: LogicGate = circuit === "alarm" ? "OR" : "AND";
  return <div className={styles.circuitPanel}>
    <svg viewBox="0 0 620 270" role="img" aria-label={copy(locale, `${result.expression}; inputs ${inputA}, ${inputB}, ${inputC}; output ${result.output}`, `${result.expression}; input ${inputA}, ${inputB}, ${inputC}; output ${result.output}`)}>
      <text x="18" y="52">A={inputA}</text><text x="18" y="98">B={inputB}</text><text x="18" y="210">C={inputC}</text>
      <GateShape gate={firstGate} x={105} y={25} scale={1.2} active={stage >= 1} />
      {circuit === "alarm" ? <GateShape gate="NOT" x={105} y={150} scale={1.2} active={stage >= 2} /> : <g data-active={stage >= 2 || undefined} className={styles.passSignal}><line x1="105" y1="210" x2="225" y2="210" /><circle cx="170" cy="210" r="10" /><text x="170" y="214" textAnchor="middle">C</text></g>}
      <line className={styles.circuitWire} data-active={stage >= 1 || undefined} x1="225" y1="85" x2="382" y2="132" />
      <line className={styles.circuitWire} data-active={stage >= 2 || undefined} x1="225" y1="210" x2="382" y2="174" />
      <text x="280" y="95">P={stage >= 1 ? result.p : "?"}</text><text x="280" y="208">Q={stage >= 2 ? result.q : "?"}</text>
      <GateShape gate={finalGate} x={380} y={100} scale={1.2} active={stage >= 3} />
      <text x="528" y="165" data-output={stage >= 3 || undefined}>Y={stage >= 3 ? result.output : "?"}</text>
    </svg>
    <strong className={styles.expression}>{result.expression}</strong>
  </div>;
}

function CircuitTable({ circuit, inputA, inputB, inputC }: { readonly circuit: LogicCircuit; readonly inputA: 0 | 1; readonly inputB: 0 | 1; readonly inputC: 0 | 1 }) {
  return <div className={styles.truthScroll}><table className={styles.circuitTable}><thead><tr><th>A</th><th>B</th><th>C</th><th>P</th><th>Q</th><th>Y</th></tr></thead><tbody>{circuitRows(circuit).map((row) => <tr key={`${row.inputA}${row.inputB}${row.inputC}`} data-current={row.inputA === inputA && row.inputB === inputB && row.inputC === inputC || undefined}><td>{row.inputA}</td><td>{row.inputB}</td><td>{row.inputC}</td><td>{row.p}</td><td>{row.q}</td><td>{row.output}</td></tr>)}</tbody></table></div>;
}

function LogicDesignLab({ locale }: { readonly locale: Paper1Locale }) {
  const defaults = { circuit: "alarm" as LogicCircuit, inputA: 1 as 0 | 1, inputB: 0 as 0 | 1, inputC: 0 as 0 | 1 };
  const [circuit, setCircuit] = useState<LogicCircuit>(defaults.circuit);
  const [inputA, setInputA] = useState<0 | 1>(defaults.inputA);
  const [inputB, setInputB] = useState<0 | 1>(defaults.inputB);
  const [inputC, setInputC] = useState<0 | 1>(defaults.inputC);
  const result = evaluateLogicCircuit(circuit, inputA, inputB, inputC);
  const statement = circuit === "alarm" ? copy(locale, "Alarm when A and B are both 1, or C is 0.", "Alarm khi A và B cùng bằng 1, hoặc C bằng 0.") : copy(locale, "Permission when A or B is 1, and C is 1.", "Permission khi A hoặc B bằng 1, đồng thời C bằng 1.");
  const scenes: Scene[] = [
    { title: copy(locale, "Translate the statement", "Dịch statement"), explanation: copy(locale, `${statement} Group each condition before drawing gates.`, `${statement} Group từng condition trước khi vẽ gate.`), graphic: <CircuitDiagram locale={locale} circuit={circuit} inputA={inputA} inputB={inputB} inputC={inputC} stage={0} /> },
    { title: copy(locale, "Evaluate branch P", "Tính branch P"), explanation: circuit === "alarm" ? copy(locale, `P = A AND B = ${inputA} AND ${inputB} = ${result.p}.`, `P = A AND B = ${inputA} AND ${inputB} = ${result.p}.`) : copy(locale, `P = A OR B = ${inputA} OR ${inputB} = ${result.p}.`, `P = A OR B = ${inputA} OR ${inputB} = ${result.p}.`), graphic: <CircuitDiagram locale={locale} circuit={circuit} inputA={inputA} inputB={inputB} inputC={inputC} stage={1} />, metric: { label: "P", value: String(result.p) } },
    { title: copy(locale, "Evaluate branch Q", "Tính branch Q"), explanation: circuit === "alarm" ? copy(locale, `Q = NOT C = NOT ${inputC} = ${result.q}.`, `Q = NOT C = NOT ${inputC} = ${result.q}.`) : copy(locale, `Q carries C directly, so Q = ${result.q}.`, `Q mang C trực tiếp nên Q = ${result.q}.`), graphic: <CircuitDiagram locale={locale} circuit={circuit} inputA={inputA} inputB={inputB} inputC={inputC} stage={2} />, metric: { label: "Q", value: String(result.q) } },
    { title: copy(locale, "Join branches and verify the row", "Nối branch và verify row"), explanation: copy(locale, `${result.expression}; the selected inputs produce P=${result.p}, Q=${result.q}, so Y=${result.output}. The highlighted truth row records the same calculation.`, `${result.expression}; input đã chọn tạo P=${result.p}, Q=${result.q}, nên Y=${result.output}. Truth row được highlight ghi cùng phép tính.`), graphic: <div><CircuitDiagram locale={locale} circuit={circuit} inputA={inputA} inputB={inputB} inputC={inputC} stage={3} /><CircuitTable circuit={circuit} inputA={inputA} inputB={inputB} inputC={inputC} /></div>, metric: { label: "Y", value: String(result.output) } },
  ];
  return <Journey locale={locale} visualId="VIS-P1-L24" title={copy(locale, "Statement → expression → circuit → truth row", "Statement → expression → circuit → truth row")} intro={copy(locale, "Trace two finite three-input circuits through named intermediate signals, then verify all eight input rows.", "Lần theo hai circuit ba input hữu hạn qua intermediate signal có tên rồi verify đủ tám input row.")} stateKey={`${circuit}-${inputA}-${inputB}-${inputC}`} onReset={() => { setCircuit(defaults.circuit); setInputA(defaults.inputA); setInputB(defaults.inputB); setInputC(defaults.inputC); }} prediction={{ prompt: copy(locale, "What is the final output for the selected circuit and inputs?", "Final output của circuit và input đã chọn là gì?"), choices: [{ id: "0", label: "0" }, { id: "1", label: "1" }], correctChoiceId: String(result.output) }} controls={<><Select id="p1-l24-circuit" label={copy(locale, "Circuit rule", "Circuit rule")} value={circuit} onChange={(event) => setCircuit(event.target.value as LogicCircuit)}><option value="alarm">{copy(locale, "Alarm: (A AND B) OR NOT C", "Alarm: (A AND B) OR NOT C")}</option><option value="permission">{copy(locale, "Permission: (A OR B) AND C", "Permission: (A OR B) AND C")}</option></Select>{(["A", "B", "C"] as const).map((name) => <Select key={name} id={`p1-l24-${name.toLowerCase()}`} label={`Input ${name}`} value={name === "A" ? inputA : name === "B" ? inputB : inputC} onChange={(event) => { const value = Number(event.target.value) as 0 | 1; if (name === "A") setInputA(value); else if (name === "B") setInputB(value); else setInputC(value); }}><option value={0}>0</option><option value={1}>1</option></Select>)}</>} scenes={scenes} />;
}

export function Chapter3VisualLab({ lessonId, locale }: { readonly lessonId: string; readonly locale: Paper1Locale }) {
  if (lessonId === "P1-L19") return <BufferLab locale={locale} />;
  if (lessonId === "P1-L20") return <DeviceLab locale={locale} />;
  if (lessonId === "P1-L21") return <EmbeddedLab locale={locale} />;
  if (lessonId === "P1-L22") return <MemoryLab locale={locale} />;
  if (lessonId === "P1-L23") return <LogicGateLab locale={locale} />;
  if (lessonId === "P1-L24") return <LogicDesignLab locale={locale} />;
  return null;
}

export const chapter3VisualLessonIds = Object.freeze(["P1-L19", "P1-L20", "P1-L21", "P1-L22", "P1-L23", "P1-L24"]);
