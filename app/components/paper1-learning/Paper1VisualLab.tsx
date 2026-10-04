"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button, Field, Select } from "@/app/components/algocore-ui";
import { ObserveSceneVisual } from "./AtlasReferenceGallery";
import { Chapter2VisualLab, chapter2VisualLessonIds } from "./Chapter2VisualLab";
import { Chapter3VisualLab, chapter3VisualLessonIds } from "./Chapter3VisualLab";
import { Chapter4VisualLab } from "./Chapter4VisualLab";
import { Chapter5VisualLab } from "./Chapter5VisualLab";
import { Chapter6VisualLab } from "./Chapter6VisualLab";
import {
  bitmapStorage,
  bitmapRleFixture,
  binaryPlaceValueFixture,
  characterEncoding,
  numberRepresentation,
  pcmStorage,
  rleComparison,
  rleDecode,
  sampleAndQuantiseFixture,
  signedArithmetic,
  unitConversion,
  vectorDrawing,
  type LearningLocale,
  type BinaryPlaceWeight,
  type BitmapScanOrder,
  type RepresentationKind,
  type SignedOperation,
  type UnitConvention,
  type UnitPrefix,
  type VectorShape,
} from "@/app/lib/paper1/models";
import styles from "./Paper1VisualLab.module.css";

const chapter4VisualLessonIds = Object.freeze(["P1-L25", "P1-L26", "P1-L27", "P1-L28", "P1-L29", "P1-L30", "P1-L31", "P1-L32"]);
const chapter5VisualLessonIds = Object.freeze(["P1-L33", "P1-L34", "P1-L35", "P1-L36"]);
const chapter6VisualLessonIds = Object.freeze(["P1-L37", "P1-L38", "P1-L39", "P1-L40"]);

type Locale = LearningLocale;
type Scene = Readonly<{ sceneId?: string; title: string; explanation: string; transcript: string; graphic: ReactNode }>;
type Prediction = Readonly<{ prompt: string; choices: readonly string[]; expectedChoice: string; observedOutcome: string; explanation: string }>;

const copy = (locale: Locale, en: string, vi: string) => locale === "vi" ? vi : en;
const format = (value: number) => new Intl.NumberFormat("en-GB").format(value);
const plural = (count: number, singular: string, pluralForm = `${singular}s`) => count === 1 ? singular : pluralForm;
const svgCoordinate = (value: number) => Number(value.toFixed(4));
const boundedInteger = (raw: string, minimum: number, maximum: number) => {
  const parsed = /^-?\d+$/.test(raw) ? Number(raw) : Number.NaN;
  const valid = Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum;
  return { valid, value: valid ? parsed : minimum };
};
const boundedNumber = (raw: string, minimum: number, maximum: number) => {
  const parsed = raw.trim() === "" ? Number.NaN : Number(raw);
  const valid = Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum;
  return { valid, value: valid ? parsed : minimum };
};

function BitStrip({ bits, groups = [], active = [] }: { readonly bits: string; readonly groups?: readonly string[]; readonly active?: readonly number[] }) {
  const boundaries = new Set<number>();
  let cursor = 0;
  for (const group of groups.slice(0, -1)) { cursor += group.length; boundaries.add(cursor); }
  return <div className={styles.bitStrip} role="img" aria-label={bits.split("").join(" ")}>
    {bits.split("").map((bit, index) => <span key={index} data-active={active.includes(index) || undefined} data-boundary={boundaries.has(index) || undefined}>{bit}</span>)}
  </div>;
}

function BinaryPlaceValueScene({ locale, value }: { readonly locale: Locale; readonly value: number }) {
  const [toggledWeight, setToggledWeight] = useState<BinaryPlaceWeight>();
  useEffect(() => setToggledWeight(undefined), [value]);
  const fixture = binaryPlaceValueFixture(value, toggledWeight);
  return <div className={styles.fixture}>
    <p className={styles.fixtureResult} aria-live="polite">{copy(locale, "Running sum", "Tổng hiện tại")}: <strong>{fixture.sum}</strong>{toggledWeight ? <span> ({copy(locale, `toggled ${toggledWeight}`, `đã đổi cột ${toggledWeight}`)})</span> : null}</p>
    <div className={styles.fixtureTable}><table><caption>{copy(locale, "8-bit place-value fixture; this width belongs to the current model.", "Fixture place value 8 bit; độ rộng này thuộc mô hình hiện tại.")}</caption><thead><tr>{fixture.weights.map((weight) => <th scope="col" key={weight}>{weight}</th>)}</tr></thead><tbody><tr>{fixture.bits.map((bit, index) => <td key={fixture.weights[index]}><button type="button" aria-pressed={toggledWeight === fixture.weights[index]} aria-label={copy(locale, `Toggle weight ${fixture.weights[index]}; current bit ${bit}`, `Đổi bit ở trọng số ${fixture.weights[index]}; bit hiện tại ${bit}`)} onClick={() => setToggledWeight((current) => current === fixture.weights[index] ? undefined : fixture.weights[index])}>{bit}</button></td>)}</tr></tbody></table></div>
    <small>{copy(locale, "Select one bit column to compare the new total. For 238, turning off weight 32 gives 206.", "Chọn một cột bit để so tổng mới. Với 238, tắt trọng số 32 cho kết quả 206.")}</small>
  </div>;
}

function SamplingFixture({ locale, rate, resolution }: { readonly locale: Locale; readonly rate: number; readonly resolution: number }) {
  const density = rate <= 8000 ? "baseline" : "higher";
  const resolutionBits = resolution <= 8 ? 2 : resolution <= 16 ? 3 : 4;
  const fixture = sampleAndQuantiseFixture(density, resolutionBits);
  return <div className={styles.fixture}>
    <p className={styles.fixtureResult}>{copy(locale, "Illustrative sampling fixture; not an audible-quality simulation.", "Fixture sampling minh họa; không mô phỏng chất lượng nghe.")}</p>
    <div className={styles.fixtureTable}><table><caption>{copy(locale, `${density} time density; ${resolutionBits}-bit normalized quantisation`, `Mật độ thời gian ${density}; quantisation chuẩn hóa ${resolutionBits} bit`)}</caption><thead><tr><th scope="col">{copy(locale, "Time", "Thời gian")}</th><th scope="col">{copy(locale, "Measured", "Đo được")}</th><th scope="col">{copy(locale, "Quantised", "Đã quantise")}</th><th scope="col">Binary</th></tr></thead><tbody>{fixture.rows.map((row) => <tr key={row.time}><th scope="row">{row.time.toFixed(2)}</th><td>{row.measured.toFixed(2)}</td><td>{row.quantised.toFixed(2)}</td><td><code>{row.binary}</code></td></tr>)}</tbody></table></div>
    <small>{copy(locale, `Sample spacing ${fixture.sampleSpacing}; mean illustrative quantisation error ${fixture.meanQuantisationError.toFixed(3)}. Change rate and resolution separately to compare their effects.`, `Khoảng cách sample ${fixture.sampleSpacing}; sai số quantisation minh họa trung bình ${fixture.meanQuantisationError.toFixed(3)}. Hãy đổi riêng rate và resolution để so từng tác động.`)}</small>
  </div>;
}

function BitmapRleScene({ locale, scanOrder }: { readonly locale: Locale; readonly scanOrder: BitmapScanOrder }) {
  const fixture = bitmapRleFixture(scanOrder);
  return <div className={styles.fixture}>
    <p className={styles.fixtureResult}>{copy(locale, "Monochrome bitmap preset; scan order and byte model are explicit.", "Preset bitmap đơn sắc; công bố scan order và byte model.")}</p>
    <div className={styles.bitmapFixture}><table><caption>{copy(locale, `8 by 8 bitmap scanned ${scanOrder}`, `Bitmap 8 × 8 quét theo ${scanOrder}`)}</caption><thead><tr><th scope="col">#</th>{Array.from({ length: fixture.width }, (_, index) => <th scope="col" key={index}>{index + 1}</th>)}</tr></thead><tbody>{fixture.grid.map((row, rowIndex) => <tr key={rowIndex}><th scope="row">{rowIndex + 1}</th>{row.split("").map((cell, columnIndex) => <td key={columnIndex} data-cell={cell}>{cell}</td>)}</tr>)}</tbody></table></div>
    <div className={styles.fixtureTokens} aria-label={copy(locale, "Run-length pairs", "Các cặp run-length")}>{fixture.runs.map((run, index) => <code key={`${run.character}-${index}`}>{run.count}{run.character}</code>)}</div>
    <small>{copy(locale, `Raw ${fixture.rawBytes} B; encoded ${fixture.encodedBytes} B using two bytes per run; first run ${fixture.firstRun.count}${fixture.firstRun.character}; exact decode ${fixture.decodedGrid.join("") === fixture.grid.join("") ? "yes" : "no"}.`, `Thô ${fixture.rawBytes} B; đã encode ${fixture.encodedBytes} B với hai byte mỗi run; run đầu ${fixture.firstRun.count}${fixture.firstRun.character}; giải mã chính xác ${fixture.decodedGrid.join("") === fixture.grid.join("") ? "có" : "không"}.`)}</small>
  </div>;
}

function Journey({ locale, visualId, title, intro, controls, prediction, scenes, stateKey, onReset }: {
  readonly locale: Locale;
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
  const [predictionIndex, setPredictionIndex] = useState<number | null>(null);
  const predictionName = useId();
  useEffect(() => { setStep(0); setPredictionIndex(null); }, [stateKey]);
  const safeStep = Math.min(step, scenes.length - 1);
  const scene = scenes[safeStep];
  const predictionChoice = predictionIndex === null ? "" : prediction.choices[predictionIndex] ?? "";
  const comparisonReady = predictionIndex !== null && safeStep === scenes.length - 1;
  const predictionMatches = comparisonReady && predictionChoice === prediction.expectedChoice;
  const reset = () => { onReset(); setStep(0); setPredictionIndex(null); };
  return <section className={styles.lab} data-paper1-visual={visualId} aria-labelledby={`${visualId}-title`}>
    <header className={styles.header}><span>{visualId}</span><h3 id={`${visualId}-title`}>{title}</h3><p>{intro}</p></header>
    <div className={styles.controls} role="group" aria-label={copy(locale, "Visual inputs", "Dữ liệu đầu vào cho minh họa")}>{controls}</div>
    <fieldset className={styles.prediction}>
      <legend>{copy(locale, "Predict before stepping", "Dự đoán trước khi xem từng bước")}</legend>
      <p>{prediction.prompt}</p>
      <div>{prediction.choices.map((choice, index) => <label key={index}><input type="radio" name={predictionName} value={index} checked={predictionIndex === index} onChange={() => setPredictionIndex(index)} /><span>{choice}</span></label>)}</div>
      <small aria-live="polite">{predictionChoice ? copy(locale, "Prediction recorded. This does not mark the lesson as mastered.", "Đã ghi nhận dự đoán. Thao tác này không đánh dấu bạn đã thành thạo bài học.") : copy(locale, "Choose one answer, then inspect the model.", "Chọn một đáp án rồi quan sát mô hình.")}</small>
    </fieldset>
    <div className={styles.stage}>
      <div className={styles.stepMeter} role="img" aria-label={copy(locale, `Step ${safeStep + 1} of ${scenes.length}`, `Bước ${safeStep + 1} trên ${scenes.length}`)}>{scenes.map((_, index) => <span key={index} data-current={index === safeStep || undefined} />)}</div>
      <div className={styles.scene} aria-live="polite" aria-atomic="true">
        <div className={styles.graphic} tabIndex={0} aria-label={copy(locale, "Visual scene; use arrow keys to scroll when needed", "Cảnh minh họa; dùng phím mũi tên để cuộn khi cần")}>{scene.graphic}</div>
        <div className={styles.explanation}><span>{copy(locale, `STEP ${safeStep + 1}`, `BƯỚC ${safeStep + 1}`)}</span><h4>{scene.title}</h4><p>{scene.explanation}</p></div>
      </div>
      <ObserveSceneVisual lessonId={visualId.replace(/^VIS-/, "")} sceneId={scene.sceneId} locale={locale} />
      <div className={styles.textEquivalent}><strong>{copy(locale, "Text equivalent", "Mô tả tương đương bằng chữ")}</strong><p>{scene.transcript}</p></div>
      {comparisonReady && <aside className={styles.predictionComparison} data-match={predictionMatches ? "true" : "false"} aria-live="polite" aria-atomic="true">
        <strong>{predictionMatches ? copy(locale, "Prediction matched the observation", "Dự đoán khớp với quan sát") : copy(locale, "Prediction needs revision", "Cần điều chỉnh dự đoán")}</strong>
        <dl><div><dt>{copy(locale, "Your prediction", "Dự đoán của bạn")}</dt><dd>{predictionChoice}</dd></div><div><dt>{copy(locale, "Observed outcome", "Kết quả quan sát")}</dt><dd>{prediction.observedOutcome}</dd></div></dl>
        <p>{prediction.explanation}</p><small>{copy(locale, "This comparison supports reflection; it does not record mastery.", "Phần đối chiếu giúp bạn tự sửa lý do; hệ thống không ghi đây là thành thạo.")}</small>
      </aside>}
      <nav className={styles.navigation} aria-label={copy(locale, "Visual steps", "Các bước của minh họa")}>
        <Button variant="secondary" disabled={safeStep === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft size={17} aria-hidden="true" />{copy(locale, "Back", "Quay lại")}</Button>
        <Button variant="quiet" onClick={reset}><RotateCcw size={17} aria-hidden="true" />{copy(locale, "Reset", "Đặt lại")}</Button>
        <Button disabled={predictionIndex === null || safeStep === scenes.length - 1} onClick={() => setStep((value) => Math.min(scenes.length - 1, value + 1))}>{copy(locale, "Next", "Tiếp theo")}<ArrowRight size={17} aria-hidden="true" /></Button>
      </nav>
    </div>
  </section>;
}

function UnitLab({ locale }: { readonly locale: Locale }) {
  const defaults = { value: 2, prefix: 2 as UnitPrefix, convention: "binary" as UnitConvention };
  const [valueInput, setValueInput] = useState(String(defaults.value));
  const [prefix, setPrefix] = useState(defaults.prefix);
  const [convention, setConvention] = useState(defaults.convention);
  const parsedValue = boundedNumber(valueInput, 1, 64);
  const value = parsedValue.value;
  const valueError = parsedValue.valid ? "" : copy(locale, "Enter a number from 1 to 64.", "Nhập một số từ 1 đến 64.");
  const result = unitConversion(value, prefix, convention);
  const labels = convention === "binary" ? ["B", "KiB", "MiB", "GiB", "TiB"] : ["B", "kB", "MB", "GB", "TB"];
  const ladder = (active: number) => <div className={styles.ladder} role="img" aria-label={`${value} ${result.unit}; base ${result.base}; ${format(result.bytes)} bytes`}>
    {labels.slice(0, prefix + 1).reverse().map((label, index) => <span key={label} data-active={index === active || undefined}><strong>{index === 0 ? value : index === prefix ? format(result.bytes) : "×"}</strong><small>{label}</small></span>)}
  </div>;
  const scenes: Scene[] = parsedValue.valid ? [
    { title: copy(locale, "Identify the convention", "Xác định quy ước"), explanation: copy(locale, `${result.unit} uses base ${result.base}. The capital B means bytes.`, `${result.unit} dùng cơ số ${result.base}. Chữ B viết hoa là byte.`), transcript: copy(locale, `${value} ${result.unit}; ${prefix} prefix ${plural(prefix, "step")}; each step multiplies by ${result.base}.`, `${value} ${result.unit}; ${prefix} bậc tiền tố; mỗi bậc nhân với ${result.base}.`), graphic: ladder(0) },
    { title: copy(locale, "Convert to bytes", "Quy đổi về byte"), explanation: `${value} × ${result.base}^${prefix} = ${format(result.bytes)} B`, transcript: copy(locale, `${value} ${result.unit} equals ${format(result.bytes)} bytes.`, `${value} ${result.unit} bằng ${format(result.bytes)} byte.`), graphic: ladder(prefix) },
    { title: copy(locale, "Convert bytes to bits", "Đổi byte sang bit"), explanation: `${format(result.bytes)} × 8 = ${format(result.bits)} bits`, transcript: copy(locale, `${format(result.bytes)} bytes contain ${format(result.bits)} bits because one byte is eight bits.`, `${format(result.bytes)} byte chứa ${format(result.bits)} bit vì một byte bằng tám bit.`), graphic: <div className={styles.formula}><strong>{format(result.bytes)} B</strong><span>× 8</span><strong data-accent>{format(result.bits)} b</strong></div> },
  ] : [{ title: copy(locale, "Enter a valid quantity", "Nhập số lượng hợp lệ"), explanation: valueError, transcript: valueError, graphic: <div className={styles.modelError} role="alert">{valueError}</div> }];
  return <Journey locale={locale} visualId="VIS-P1-L01" title={copy(locale, "Storage units and prefixes", "Đơn vị lưu trữ và tiền tố")} intro={copy(locale, "Compare decimal and binary prefixes, then travel from a named unit to bytes and bits.", "So sánh tiền tố thập phân và nhị phân, rồi quy đổi về byte và bit.")} stateKey={`${valueInput}-${prefix}-${convention}`} onReset={() => { setValueInput(String(defaults.value)); setPrefix(defaults.prefix); setConvention(defaults.convention); }} prediction={{ prompt: copy(locale, "Which base will be applied at every prefix step?", "Mỗi bậc tiền tố sẽ dùng cơ số nào?"), choices: ["1000", "1024"], expectedChoice: String(result.base), observedOutcome: copy(locale, `The selected convention uses base ${result.base}.`, `Quy ước đã chọn dùng cơ số ${result.base}.`), explanation: copy(locale, "The named convention fixes the multiplier used at every prefix step.", "Tên quy ước xác định hệ số nhân dùng ở mỗi bậc tiền tố.") }} controls={<><Field id="p1-unit-value" label={copy(locale, "Quantity", "Số lượng")} type="number" step="any" min={1} max={64} value={valueInput} error={valueError || undefined} onChange={(event) => setValueInput(event.target.value)} /><Select id="p1-unit-prefix" label={copy(locale, "Prefix", "Tiền tố")} value={prefix} onChange={(event) => setPrefix(Number(event.target.value) as UnitPrefix)}><option value={1}>{convention === "binary" ? "KiB" : "kB"}</option><option value={2}>{convention === "binary" ? "MiB" : "MB"}</option><option value={3}>{convention === "binary" ? "GiB" : "GB"}</option><option value={4}>{convention === "binary" ? "TiB" : "TB"}</option></Select><Select id="p1-unit-convention" label={copy(locale, "Convention", "Quy ước")} value={convention} onChange={(event) => setConvention(event.target.value as UnitConvention)}><option value="decimal">{copy(locale, "Decimal · ×1000", "Thập phân · ×1000")}</option><option value="binary">{copy(locale, "Binary · ×1024", "Nhị phân · ×1024")}</option></Select></>} scenes={scenes} />;
}

function RepresentationLab({ locale }: { readonly locale: Locale }) {
  const defaults = { value: 238, kind: "unsigned" as RepresentationKind };
  const [valueInput, setValueInput] = useState(String(defaults.value));
  const [kind, setKind] = useState(defaults.kind);
  const value = /^-?\d+$/.test(valueInput) ? Number(valueInput) : Number.NaN;
  const model = numberRepresentation(value, kind);
  const invalid = !model.valid;
  const reason = invalid ? (model.reason === "integer-required" ? copy(locale, "Enter a whole number; bit encodings do not accept a fractional value here.", "Hãy nhập số nguyên; mã hóa bit ở đây không nhận giá trị có phần lẻ.") : model.reason === "bcd-range" ? copy(locale, "BCD in this model accepts 0–99.", "BCD trong mô hình này nhận từ 0–99.") : model.reason === "signed-range" ? copy(locale, "The value is outside this signed 8-bit range.", "Giá trị nằm ngoài miền signed 8-bit này.") : copy(locale, "Unsigned and hexadecimal modes accept 0–255.", "Chế độ không dấu và hexadecimal nhận từ 0–255.")) : "";
  const bits = model.valid ? model.bits : "????????";
  function changeKind(next: RepresentationKind) {
    setKind(next);
    setValueInput(String(next === "bcd" ? 59 : next === "ones" || next === "twos" ? -90 : 238));
  }
  const scenes: Scene[] = model.valid ? [
    { title: copy(locale, "Choose the representation", "Chọn cách biểu diễn"), explanation: copy(locale, "The same written value can require a different encoding rule.", "Cùng một giá trị viết ra có thể cần quy tắc mã hóa khác nhau."), transcript: copy(locale, `Input ${value}; representation ${kind}.`, `Giá trị vào ${value}; cách biểu diễn ${kind}.`), graphic: <div className={styles.valueCard}><small>{copy(locale, "INPUT VALUE", "GIÁ TRỊ VÀO")}</small><strong>{value}</strong><span>→ {kind.toUpperCase()}</span></div> },
    { sceneId: "P1-L02-scene-binary-place-values", title: copy(locale, kind === "bcd" ? "Encode each decimal digit" : "Apply positional weights", kind === "bcd" ? "Mã hóa từng chữ số thập phân" : "Áp dụng trọng số theo vị trí"), explanation: kind === "bcd" ? copy(locale, "BCD encodes each decimal digit in its own four-bit group.", "BCD mã hóa riêng từng chữ số thập phân bằng một nhóm bốn bit.") : kind === "ones" || kind === "twos" ? copy(locale, "For a negative value, encode the magnitude, invert the bits, then add one only for two's complement.", "Với số âm, mã hóa độ lớn, đảo bit, rồi chỉ cộng một khi dùng bù hai.") : copy(locale, "Read binary positions in powers of two; hexadecimal groups four bits per digit.", "Đọc các vị trí nhị phân theo lũy thừa của hai; hexadecimal nhóm bốn bit cho mỗi chữ số."), transcript: copy(locale, `Encoded bits: ${bits}.`, `Các bit đã mã hóa: ${bits}.`), graphic: kind === "unsigned" ? <BinaryPlaceValueScene locale={locale} value={value} /> : <BitStrip bits={bits} groups={model.groups} active={kind === "bcd" ? [0, 4] : [0]} /> },
    { title: copy(locale, "Verify by decoding", "Kiểm tra bằng cách giải mã"), explanation: `${bits} → ${model.label}`, transcript: copy(locale, `Decoding ${bits} under the ${kind} rule gives ${model.label}.`, `Giải mã ${bits} theo quy tắc ${kind} cho ${model.label}.`), graphic: <div className={styles.formula}><strong>{bits}</strong><span>→</span><strong data-accent>{model.label}</strong></div> },
  ] : [{ title: copy(locale, "Choose a valid value", "Chọn giá trị hợp lệ"), explanation: reason, transcript: reason, graphic: <div className={styles.modelError} role="alert">{reason}</div> }];
  return <Journey locale={locale} visualId="VIS-P1-L02" title={copy(locale, "Number representations", "Các cách biểu diễn số")} intro={copy(locale, "Inspect unsigned binary, hexadecimal, BCD, one's complement and two's complement without treating them as interchangeable.", "Quan sát nhị phân không dấu, hexadecimal, BCD, bù một và bù hai mà không nhầm chúng là cùng một quy tắc.")} stateKey={`${valueInput}-${kind}`} onReset={() => { setValueInput(String(defaults.value)); setKind(defaults.kind); }} prediction={{ prompt: copy(locale, "Will the selected rule accept this value?", "Quy tắc đã chọn có nhận giá trị này không?"), choices: [copy(locale, "Yes", "Có"), copy(locale, "No", "Không")], expectedChoice: copy(locale, model.valid ? "Yes" : "No", model.valid ? "Có" : "Không"), observedOutcome: model.valid ? copy(locale, "The value is valid under the selected representation rule.", "Giá trị hợp lệ theo quy tắc biểu diễn đã chọn.") : reason, explanation: model.valid ? copy(locale, "The model can encode this value using the selected representation.", "Mô hình có thể mã hóa giá trị này bằng cách biểu diễn đã chọn.") : reason }} controls={<><Field id="p1-representation-value" label={copy(locale, "Integer", "Số nguyên")} type="number" step={1} min={-128} max={255} value={valueInput} error={reason || undefined} onChange={(event) => setValueInput(event.target.value)} /><Select id="p1-representation-kind" label={copy(locale, "Representation", "Cách biểu diễn")} value={kind} onChange={(event) => changeKind(event.target.value as RepresentationKind)}><option value="unsigned">{copy(locale, "Unsigned binary", "Nhị phân không dấu")}</option><option value="hex">Hexadecimal</option><option value="bcd">BCD</option><option value="ones">{copy(locale, "8-bit one's complement", "Bù một 8 bit")}</option><option value="twos">{copy(locale, "8-bit two's complement", "Bù hai 8 bit")}</option></Select></>} scenes={scenes} />;
}

function SignedLab({ locale }: { readonly locale: Locale }) {
  const defaults = { a: 100, b: 35, operation: "add" as SignedOperation };
  const [aInput, setAInput] = useState(String(defaults.a)); const [bInput, setBInput] = useState(String(defaults.b)); const [operation, setOperation] = useState(defaults.operation);
  const parsedA = /^-?\d+$/.test(aInput) ? Number(aInput) : Number.NaN;
  const parsedB = /^-?\d+$/.test(bInput) ? Number(bInput) : Number.NaN;
  const aValid = Number.isSafeInteger(parsedA) && parsedA >= -128 && parsedA <= 127;
  const bValid = Number.isSafeInteger(parsedB) && parsedB >= -128 && parsedB <= 127;
  const operandsValid = aValid && bValid;
  const a = aValid ? parsedA : 0;
  const b = bValid ? parsedB : 0;
  const operandError = copy(locale, "Enter a whole number from −128 to 127.", "Nhập số nguyên từ −128 đến 127.");
  const model = signedArithmetic(a, b, operation);
  const operator = operation === "add" ? "+" : "−";
  const predictionB = operation === "subtract" && bInput.trim().startsWith("-") ? `(${bInput})` : (bInput || "?");
  const encodedOperandLabel = operation === "subtract"
    ? b === -128
      ? copy(locale, "−(−128): +128 is not representable, so 8-bit negation wraps modulo 256", "−(−128): không thể biểu diễn +128, nên phép đổi dấu 8 bit quay vòng theo modulo 256")
      : `−(${b}) = ${-b}`
    : String(b);
  const arithmeticGraphic = (activeRows: number[]) => <div className={styles.binaryCalculation} role="img" aria-label={copy(locale, `${model.bitsA} plus encoded operand ${model.bitsB} equals ${model.bitsResult}`, `${model.bitsA} cộng toán hạng đã mã hóa ${model.bitsB} bằng ${model.bitsResult}`)}><BitStrip bits={model.bitsA} active={activeRows.includes(0) ? [7] : []} /><span>+</span><BitStrip bits={model.bitsB} active={activeRows.includes(1) ? [7] : []} /><i /><BitStrip bits={model.bitsResult} active={activeRows.includes(2) ? [7] : []} /></div>;
  const scenes: Scene[] = operandsValid ? [
    { title: copy(locale, "Encode both operands", "Mã hóa hai toán hạng"), explanation: `${a} → ${model.bitsA}; ${encodedOperandLabel} → ${model.bitsB}`, transcript: copy(locale, `A is ${model.bitsA}. The encoded second operand is ${model.bitsB}.`, `A là ${model.bitsA}. Toán hạng thứ hai đã mã hóa là ${model.bitsB}.`), graphic: arithmeticGraphic([0, 1]) },
    { title: copy(locale, "Add the encoded operands column by column", "Cộng hai toán hạng đã mã hóa theo từng cột"), explanation: copy(locale, operation === "subtract" ? "Subtraction first encodes −B in two's complement; the bit operation is then A + (−B). Each column produces a result bit and a carry." : "Each column produces a result bit and a carry into the next column.", operation === "subtract" ? "Phép trừ trước tiên mã hóa −B bằng bù hai; phép toán bit sau đó là A + (−B). Mỗi cột tạo một bit kết quả và một bit nhớ." : "Mỗi cột tạo ra một bit kết quả và một bit nhớ sang cột kế tiếp."), transcript: copy(locale, `Eight column additions of the encoded operands produce ${model.bitsResult}, with final carry ${model.carryOut}.`, `Tám phép cộng cột của các toán hạng đã mã hóa tạo ${model.bitsResult}, với carry cuối là ${model.carryOut}.`), graphic: <div className={styles.columnTable}><table><thead><tr><th>bit</th><th>A</th><th>{operation === "subtract" ? "−B" : "B"}</th><th>{copy(locale, "carry in", "nhớ vào")}</th><th>{copy(locale, "result", "kết quả")}</th></tr></thead><tbody>{model.columns.slice().reverse().map((column) => <tr key={column.index}><th scope="row">{column.index}</th><td>{column.bitA}</td><td>{column.bitB}</td><td>{column.carryIn}</td><td>{column.result}</td></tr>)}</tbody></table></div> },
    { title: copy(locale, "Interpret the stored result", "Diễn giải kết quả được lưu"), explanation: `${model.bitsResult} = ${model.signedResult} (${copy(locale, "signed 8-bit", "signed 8-bit")})`, transcript: copy(locale, `The stored 8-bit pattern decodes to ${model.signedResult}; the exact mathematical result is ${model.exact}.`, `Mẫu 8-bit được lưu giải mã thành ${model.signedResult}; kết quả toán học chính xác là ${model.exact}.`), graphic: arithmeticGraphic([2]) },
    { title: copy(locale, "Separate carry from overflow", "Phân biệt carry và overflow"), explanation: copy(locale, `Carry out is ${model.carryOut}. Signed overflow is ${model.overflow ? "true" : "false"} because the exact result ${model.exact} ${model.overflow ? "is outside" : "is inside"} −128…127.`, `Carry out là ${model.carryOut}. Signed overflow là ${model.overflow ? "đúng" : "sai"} vì kết quả chính xác ${model.exact} ${model.overflow ? "nằm ngoài" : "nằm trong"} −128…127.`), transcript: copy(locale, `Carry and signed overflow are different facts: carry ${model.carryOut}; overflow ${model.overflow}.`, `Carry và signed overflow là hai dữ kiện khác nhau: carry ${model.carryOut}; overflow ${model.overflow ? "đúng" : "sai"}.`), graphic: <div className={styles.statusPair}><div data-active={model.carryOut === 1 || undefined}><small>CARRY OUT</small><strong>{model.carryOut}</strong></div><div data-warning={model.overflow || undefined}><small>OVERFLOW</small><strong>{model.overflow ? copy(locale, "YES", "CÓ") : copy(locale, "NO", "KHÔNG")}</strong></div></div> },
  ] : [{ title: copy(locale, "Enter valid operands", "Nhập toán hạng hợp lệ"), explanation: operandError, transcript: operandError, graphic: <div className={styles.modelError} role="alert">{operandError}</div> }];
  return <Journey locale={locale} visualId="VIS-P1-L03" title={copy(locale, "Signed arithmetic and overflow", "Số học có dấu và overflow")} intro={copy(locale, "Trace an 8-bit addition or subtraction and keep carry separate from signed overflow.", "Trace phép cộng hoặc trừ 8 bit và phân biệt carry với signed overflow.")} stateKey={`${aInput}-${bInput}-${operation}`} onReset={() => { setAInput(String(defaults.a)); setBInput(String(defaults.b)); setOperation(defaults.operation); }} prediction={{ prompt: copy(locale, `Will the exact result ${aInput || "?"} ${operator} ${predictionB} fit in signed 8-bit?`, `Kết quả chính xác ${aInput || "?"} ${operator} ${predictionB} có nằm trong signed 8-bit không?`), choices: [copy(locale, "Fits", "Nằm trong"), copy(locale, "Overflows", "Overflow")], expectedChoice: copy(locale, model.overflow ? "Overflows" : "Fits", model.overflow ? "Overflow" : "Nằm trong"), observedOutcome: copy(locale, model.overflow ? "The exact result is outside −128…127." : "The exact result is inside −128…127.", model.overflow ? "Kết quả chính xác nằm ngoài −128…127." : "Kết quả chính xác nằm trong −128…127."), explanation: copy(locale, "Signed overflow is decided by the exact mathematical result, not by carry-out alone.", "Signed overflow được xác định bằng kết quả toán học chính xác, không chỉ bằng carry-out.") }} controls={<><Field id="p1-signed-a" label="A (−128…127)" type="number" step={1} min={-128} max={127} value={aInput} error={aValid ? undefined : operandError} onChange={(event) => setAInput(event.target.value)} /><Select id="p1-signed-operation" label={copy(locale, "Operation", "Phép toán")} value={operation} onChange={(event) => setOperation(event.target.value as SignedOperation)}><option value="add">{copy(locale, "Add", "Cộng")}</option><option value="subtract">{copy(locale, "Subtract", "Trừ")}</option></Select><Field id="p1-signed-b" label="B (−128…127)" type="number" step={1} min={-128} max={127} value={bInput} error={bValid ? undefined : operandError} onChange={(event) => setBInput(event.target.value)} /></>} scenes={scenes} />;
}

function EncodingLab({ locale }: { readonly locale: Locale }) {
  const defaults = "A"; const [character, setCharacter] = useState(defaults); const model = characterEncoding(character);
  const scenes: Scene[] = [
    { title: copy(locale, "Identify the character", "Xác định ký tự"), explanation: copy(locale, "A glyph is the visible shape. The computer associates it with a code point.", "Glyph là hình dạng nhìn thấy. Máy tính liên kết nó với một code point."), transcript: copy(locale, `The selected glyph is ${model.glyph}.`, `Glyph được chọn là ${model.glyph}.`), graphic: <div className={styles.glyph}><span>{model.glyph}</span><small>{copy(locale, "glyph", "hình ký tự")}</small></div> },
    { title: copy(locale, "Read the Unicode code point", "Đọc Unicode code point"), explanation: `${model.glyph} → ${model.codePointHex} → ${model.codePoint}`, transcript: copy(locale, `${model.glyph} has Unicode code point ${model.codePointHex}, decimal ${model.codePoint}.`, `${model.glyph} có Unicode code point ${model.codePointHex}, giá trị thập phân ${model.codePoint}.`), graphic: <div className={styles.formula}><strong>{model.glyph}</strong><span>→</span><strong data-accent>{model.codePointHex}</strong></div> },
    { title: copy(locale, "Encode for storage or transfer", "Mã hóa để lưu trữ hoặc truyền"), explanation: `UTF-8: ${model.utf8Bytes.map((byte) => `0x${byte.toString(16).toUpperCase().padStart(2, "0")}`).join(" ")}`, transcript: copy(locale, `UTF-8 uses ${model.utf8Bytes.length} byte${model.utf8Bytes.length === 1 ? "" : "s"}: ${model.utf8Bits.join(" ")}.`, `UTF-8 dùng ${model.utf8Bytes.length} byte: ${model.utf8Bits.join(" ")}.`), graphic: <div className={styles.byteGroups}>{model.utf8Bits.map((byte, index) => <div key={index}><small>{copy(locale, `byte ${index + 1}`, `byte ${index + 1}`)}</small><BitStrip bits={byte} active={index === 0 ? [0] : []} /></div>)}</div> },
    { title: copy(locale, "Check the encoding boundary", "Kiểm tra giới hạn encoding"), explanation: model.ascii === null ? copy(locale, "This code point is outside 7-bit ASCII, but UTF-8 represents it with multiple bytes.", "Code point này nằm ngoài ASCII 7 bit, nhưng UTF-8 biểu diễn được bằng nhiều byte.") : copy(locale, `This character is in ASCII at decimal ${model.ascii}; its one-byte UTF-8 encoding has the same value.`, `Ký tự này thuộc ASCII ở giá trị thập phân ${model.ascii}; mã UTF-8 một byte có cùng giá trị.`), transcript: model.ascii === null ? copy(locale, `${model.glyph} is not a 7-bit ASCII character.`, `${model.glyph} không phải ký tự ASCII 7-bit.`) : copy(locale, `${model.glyph} is in ASCII and Unicode.`, `${model.glyph} thuộc cả ASCII và Unicode.`), graphic: <div className={styles.statusPair}><div data-active={model.ascii !== null || undefined}><small>ASCII</small><strong>{model.ascii ?? "—"}</strong></div><div data-active><small>UTF-8</small><strong>{model.utf8Bytes.length} B</strong></div></div> },
  ];
  return <Journey locale={locale} visualId="VIS-P1-L04" title={copy(locale, "Character sets and encodings", "Bộ ký tự và cách mã hóa")} intro={copy(locale, "Follow a visible character through its Unicode code point into UTF-8 bytes.", "Theo dõi một ký tự từ Unicode code point đến các byte UTF-8.")} stateKey={character} onReset={() => setCharacter(defaults)} prediction={{ prompt: copy(locale, "How many UTF-8 bytes will this character use?", "Ký tự này sẽ dùng bao nhiêu byte UTF-8?"), choices: ["1", "2", "3", "4"], expectedChoice: String(model.utf8Bytes.length), observedOutcome: copy(locale, `${character} uses ${model.utf8Bytes.length} UTF-8 byte${model.utf8Bytes.length === 1 ? "" : "s"}.`, `${character} dùng ${model.utf8Bytes.length} byte UTF-8.`), explanation: copy(locale, "UTF-8 byte length follows the code point range; it is not always one byte per character.", "Số byte UTF-8 phụ thuộc vùng code point; không phải ký tự nào cũng dùng một byte.") }} controls={<Select id="p1-character" label={copy(locale, "Character", "Ký tự")} value={character} onChange={(event) => setCharacter(event.target.value)}><option value="A">A</option><option value="é">é</option><option value="€">€</option><option value="😊">😊</option></Select>} scenes={scenes} />;
}

const pixelPattern = ["00111100", "01111110", "11011011", "11111111", "10111101", "11000011", "01111110", "00111100"];
function PixelGrid({ locale, scale = 1, active = false }: { readonly locale: Locale; readonly scale?: number; readonly active?: boolean }) {
  return <div className={styles.pixelViewport} style={{ "--pixel-scale": scale } as CSSProperties} role="img" aria-label={copy(locale, "Eight by eight sample bitmap of a face", "Bitmap khuôn mặt mẫu tám nhân tám pixel")}>
    <div className={styles.pixelGrid}>{pixelPattern.join("").split("").map((value, index) => <span key={index} data-filled={value === "1" || undefined} data-active={active && [18, 21, 43].includes(index) || undefined} />)}</div>
  </div>;
}

function BitmapLab({ locale }: { readonly locale: Locale }) {
  const defaults = { width: 800, height: 600, depth: 24 };
  const [widthInput, setWidthInput] = useState(String(defaults.width));
  const [heightInput, setHeightInput] = useState(String(defaults.height));
  const [depth, setDepth] = useState(defaults.depth);
  const parsedWidth = boundedInteger(widthInput, 1, 4096);
  const parsedHeight = boundedInteger(heightInput, 1, 4096);
  const dimensionsValid = parsedWidth.valid && parsedHeight.valid;
  const dimensionError = copy(locale, "Enter a whole number from 1 to 4096.", "Nhập số nguyên từ 1 đến 4096.");
  const width = parsedWidth.value;
  const height = parsedHeight.value;
  const model = bitmapStorage(width, height, depth);
  const pixelNoun = model.pixels === 1 ? "pixel" : "pixels";
  const columnNoun = width === 1 ? "column" : "columns";
  const rowNoun = height === 1 ? "row" : "rows";
  const bitNoun = model.bits === 1 ? "bit" : "bits";
  const byteNoun = model.bytes === 1 ? "byte" : "bytes";
  const paddingBitNoun = model.paddingBits === 1 ? "bit" : "bits";
  const scenes: Scene[] = dimensionsValid ? [
    { title: copy(locale, "Count the pixels", "Đếm số pixel"), explanation: copy(locale, `${width} × ${height} = ${format(model.pixels)} ${pixelNoun}`, `${width} × ${height} = ${format(model.pixels)} pixel`), transcript: copy(locale, `The image contains ${format(model.pixels)} ${pixelNoun} arranged in ${width} ${columnNoun} and ${height} ${rowNoun}.`, `Ảnh có ${format(model.pixels)} pixel, xếp thành ${width} cột và ${height} hàng.`), graphic: <PixelGrid locale={locale} active /> },
    { title: copy(locale, "Choose colour depth", "Chọn color depth"), explanation: `2^${depth} = ${format(model.colours)} ${copy(locale, "possible colours per pixel", "màu có thể có cho mỗi pixel")}`, transcript: copy(locale, `Each pixel uses ${depth} ${plural(depth, "bit")}, so it can select one of ${format(model.colours)} colours.`, `Mỗi pixel dùng ${depth} bit nên có thể chọn một trong ${format(model.colours)} màu.`), graphic: <div className={styles.palette}><span /><span /><span data-active /><span /><span /><small>2<sup>{depth}</sup></small></div> },
    { title: copy(locale, "Calculate raw storage", "Tính dung lượng thô"), explanation: copy(locale, `${format(model.pixels)} × ${depth} = ${format(model.bits)} data ${bitNoun}. Packed into whole bytes, the minimum is ${format(model.bytes)} ${byteNoun}${model.paddingBits ? `, including ${model.paddingBits} unused final-byte padding ${paddingBitNoun}` : " with no final-byte padding"}.`, `${format(model.pixels)} × ${depth} = ${format(model.bits)} bit dữ liệu. Khi đóng gói thành byte nguyên, mức tối thiểu là ${format(model.bytes)} byte${model.paddingBits ? `, gồm ${model.paddingBits} bit đệm chưa dùng ở byte cuối` : " và không cần bit đệm ở byte cuối"}.`), transcript: copy(locale, `Before headers, row padding or compression: ${format(model.bits)} data ${bitNoun}, packed minimum ${format(model.bytes)} ${byteNoun}, final-byte padding ${model.paddingBits} ${paddingBitNoun}.`, `Trước header, row padding hoặc nén: ${format(model.bits)} bit dữ liệu, tối thiểu ${format(model.bytes)} byte đóng gói, ${model.paddingBits} bit đệm ở byte cuối.`), graphic: <div className={styles.formula}><strong>{format(model.bits)} {copy(locale, bitNoun, "bit")}</strong><span>+ {model.paddingBits} {copy(locale, `padding ${paddingBitNoun}`, "bit đệm")}</span><strong data-accent>{format(model.bytes)} B</strong></div> },
    { title: copy(locale, "Separate size from displayed quality", "Phân biệt kích thước và chất lượng hiển thị"), explanation: copy(locale, "More pixels can preserve more spatial detail; greater colour depth offers more possible colours. Display size alone does not add stored detail.", "Nhiều pixel có thể giữ nhiều chi tiết không gian hơn; color depth lớn hơn cho nhiều màu khả dụng hơn. Chỉ phóng kích thước hiển thị không tạo thêm chi tiết đã lưu."), transcript: copy(locale, `Resolution ${width} by ${height}; colour depth ${depth} ${plural(depth, "bit")}; storage ${format(model.bytes)} ${byteNoun}.`, `Độ phân giải ${width} × ${height}; colour depth ${depth} bit; dung lượng ${format(model.bytes)} byte.`), graphic: <div className={styles.zoomPair}><PixelGrid locale={locale} /><PixelGrid locale={locale} scale={1.45} /></div> },
  ] : [{ title: copy(locale, "Enter valid dimensions", "Nhập kích thước hợp lệ"), explanation: dimensionError, transcript: dimensionError, graphic: <div className={styles.modelError} role="alert">{dimensionError}</div> }];
  return <Journey locale={locale} visualId="VIS-P1-L05" title={copy(locale, "Bitmap resolution, colour and storage", "Độ phân giải, màu và dung lượng bitmap")} intro={copy(locale, "Relate width, height and colour depth to raw bitmap storage and visible pixel structure.", "Liên hệ chiều rộng, chiều cao và color depth với dung lượng thô và cấu trúc pixel.")} stateKey={`${widthInput}-${heightInput}-${depth}`} onReset={() => { setWidthInput(String(defaults.width)); setHeightInput(String(defaults.height)); setDepth(defaults.depth); }} prediction={{ prompt: copy(locale, "If colour depth doubles while dimensions stay fixed, what happens to raw storage?", "Nếu color depth tăng gấp đôi và kích thước không đổi, dung lượng thô thay đổi thế nào?"), choices: [copy(locale, "It doubles", "Tăng gấp đôi"), copy(locale, "It stays the same", "Không đổi"), copy(locale, "It quadruples", "Tăng gấp bốn")], expectedChoice: copy(locale, "It doubles", "Tăng gấp đôi"), observedOutcome: copy(locale, "Raw bitmap data doubles when bits per pixel double.", "Dữ liệu bitmap thô tăng gấp đôi khi số bit trên mỗi pixel tăng gấp đôi."), explanation: copy(locale, "Width and height stay fixed, so only the colour-depth factor doubles.", "Chiều rộng và chiều cao giữ nguyên nên chỉ hệ số color depth tăng gấp đôi.") }} controls={<><Field id="p1-bitmap-width" label={copy(locale, "Width (pixels)", "Chiều rộng (pixel)")} type="number" step={1} min={1} max={4096} value={widthInput} error={parsedWidth.valid ? undefined : dimensionError} onChange={(event) => setWidthInput(event.target.value)} /><Field id="p1-bitmap-height" label={copy(locale, "Height (pixels)", "Chiều cao (pixel)")} type="number" step={1} min={1} max={4096} value={heightInput} error={parsedHeight.valid ? undefined : dimensionError} onChange={(event) => setHeightInput(event.target.value)} /><Select id="p1-bitmap-depth" label={copy(locale, "Colour depth", "Color depth")} value={depth} onChange={(event) => setDepth(Number(event.target.value))}><option value={1}>1 bit</option><option value={8}>8 bit</option><option value={16}>16 bit</option><option value={24}>24 bit</option></Select></>} scenes={scenes} />;
}

function VectorPicture({ locale, shape, scale, highlight = 0 }: { readonly locale: Locale; readonly shape: VectorShape; readonly scale: number; readonly highlight?: number }) {
  const transform = `translate(${100 - 50 * scale} ${100 - 50 * scale}) scale(${scale})`;
  return <svg className={styles.vectorPicture} viewBox="0 0 200 200" role="img" aria-label={copy(locale, `${shape} vector drawing at scale ${scale}`, `Hình vector ${shape} ở tỉ lệ ${scale}`)}>
    <g transform={transform}>
      {shape === "badge" ? <><circle cx="50" cy="50" r="34" data-active={highlight === 1 || undefined} /><text x="50" y="58" textAnchor="middle" data-active={highlight === 2 || undefined}>A</text></> : shape === "arrow" ? <><line x1="18" y1="50" x2="76" y2="50" data-active={highlight === 1 || undefined} /><polygon points="68,36 86,50 68,64" data-active={highlight === 2 || undefined} /></> : <><rect x="20" y="24" width="60" height="52" rx="8" data-active={highlight === 1 || undefined} /><circle cx="50" cy="50" r="13" data-active={highlight === 2 || undefined} /></>}
    </g>
  </svg>;
}

function VectorLab({ locale }: { readonly locale: Locale }) {
  const defaults = { shape: "badge" as VectorShape, scale: 1 }; const [shape, setShape] = useState(defaults.shape); const [scale, setScale] = useState(defaults.scale); const model = vectorDrawing(shape, scale);
  const scenes: Scene[] = [
    { title: copy(locale, "Store drawing objects", "Lưu các đối tượng vẽ"), explanation: copy(locale, "A vector file stores object descriptions such as shape, coordinates, stroke and fill.", "File vector lưu mô tả đối tượng như hình dạng, tọa độ, nét và màu tô."), transcript: copy(locale, `Drawing list: ${model.objects.join("; ")}.`, `Drawing list: ${model.objects.join("; ")}.`), graphic: <div className={styles.drawingList}>{model.objects.map((object, index) => <code key={object} data-active={index === 0 || undefined}>{index + 1}. {object}</code>)}</div> },
    { title: copy(locale, "Render the instructions", "Render các chỉ dẫn"), explanation: copy(locale, "The renderer calculates the outline from the stored geometry.", "Trình render tính đường biên từ hình học đã lưu."), transcript: copy(locale, `The ${shape} is rendered from ${model.objects.length} drawing objects.`, `Hình ${shape} được render từ ${model.objects.length} đối tượng trong drawing list.`), graphic: <VectorPicture locale={locale} shape={shape} scale={1} highlight={1} /> },
    { title: copy(locale, "Scale the geometry", "Thay đổi tỉ lệ hình học"), explanation: copy(locale, `Coordinates are scaled by ${scale}. The edges are recalculated rather than enlarging a fixed pixel grid.`, `Tọa độ được nhân với ${scale}. Đường biên được tính lại thay vì phóng lớn một lưới pixel cố định.`), transcript: copy(locale, `Scale ${scale}; logical output ${model.outputWidth} by ${model.outputHeight}; no stored pixel grid is enlarged.`, `Tỉ lệ ${scale}; đầu ra logic ${model.outputWidth} × ${model.outputHeight}; không phóng lớn lưới pixel được lưu.`), graphic: <div className={styles.vectorCompare}><VectorPicture locale={locale} shape={shape} scale={1} /><VectorPicture locale={locale} shape={shape} scale={scale} highlight={2} /></div> },
  ];
  return <Journey locale={locale} visualId="VIS-P1-L06" title={copy(locale, "Vector objects and scaling", "Đối tượng vector và thay đổi tỉ lệ")} intro={copy(locale, "Read a vector drawing list, render it, and scale its geometry without inventing stored pixels.", "Đọc danh sách lệnh vector, render và thay đổi tỉ lệ hình học mà không tạo ra pixel lưu sẵn.")} stateKey={`${shape}-${scale}`} onReset={() => { setShape(defaults.shape); setScale(defaults.scale); }} prediction={{ prompt: copy(locale, "When this vector is enlarged, what is recalculated?", "Khi phóng lớn vector, thứ gì được tính lại?"), choices: [copy(locale, "Object geometry", "Hình học của đối tượng"), copy(locale, "A fixed pixel grid", "Một lưới pixel cố định")], expectedChoice: copy(locale, "Object geometry", "Hình học của đối tượng"), observedOutcome: copy(locale, "The renderer recalculates object geometry at the new scale.", "Trình render tính lại hình học của đối tượng theo tỉ lệ mới."), explanation: copy(locale, "A vector stores drawing instructions rather than a fixed stored pixel grid.", "Vector lưu chỉ dẫn vẽ thay vì một lưới pixel cố định.") }} controls={<><Select id="p1-vector-shape" label={copy(locale, "Drawing", "Hình vẽ")} value={shape} onChange={(event) => setShape(event.target.value as VectorShape)}><option value="badge">Badge</option><option value="arrow">Arrow</option><option value="icon">Icon</option></Select><Select id="p1-vector-scale" label={copy(locale, "Scale", "Tỉ lệ")} value={scale} onChange={(event) => setScale(Number(event.target.value))}><option value={0.75}>75%</option><option value={1}>100%</option><option value={1.5}>150%</option><option value={2}>200%</option></Select></>} scenes={scenes} />;
}

function Waveform({ locale, rate = 8000, resolution = 8, samples = false, quantised = false }: { readonly locale: Locale; readonly rate?: number; readonly resolution?: number; readonly samples?: boolean; readonly quantised?: boolean }) {
  const curvePoints = Array.from({ length: 65 }, (_, index) => ({
    x: svgCoordinate(index * 100 / 64),
    y: svgCoordinate(50 - Math.sin(index * Math.PI / 8) * 30),
  }));
  const path = curvePoints.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const sampleCount = rate <= 8000 ? 5 : rate <= 22050 ? 9 : rate <= 44100 ? 13 : 17;
  const bandCount = resolution <= 8 ? 4 : resolution <= 16 ? 7 : 10;
  const bandStep = 60 / (bandCount - 1);
  const bands = Array.from({ length: bandCount }, (_, index) => svgCoordinate(20 + index * bandStep));
  const samplePoints = Array.from({ length: sampleCount }, (_, index) => {
    const x = svgCoordinate(index * 100 / (sampleCount - 1));
    const y = svgCoordinate(50 - Math.sin(x * Math.PI / 12.5) * 30);
    return { x, y: quantised ? bands.reduce((closest, band) => Math.abs(band - y) < Math.abs(closest - y) ? band : closest, bands[0]) : y };
  });
  const label = samples ? copy(locale, `Normalized schematic: ${sampleCount} visible sample positions represent ${format(rate)} samples per second; ${bandCount} visible bands represent ${resolution}-bit resolution${quantised ? ", with samples snapped to bands" : ""}.`, `Sơ đồ chuẩn hóa: ${sampleCount} vị trí thấy được đại diện cho ${format(rate)} mẫu mỗi giây; ${bandCount} dải thấy được đại diện cho độ phân giải ${resolution} bit${quantised ? ", các mẫu được làm tròn vào dải" : ""}.`) : copy(locale, "Continuous analogue waveform before sampling", "Dạng sóng analogue liên tục trước khi lấy mẫu");
  return <svg className={styles.waveform} viewBox="0 0 100 100" role="img" aria-label={label}>
    {bands.map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} />)}
    <path d={path} />
    {samples && samplePoints.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="2.2" data-active={index < 3 || undefined} />)}
  </svg>;
}

function AudioLab({ locale }: { readonly locale: Locale }) {
  const defaults = { rate: 8000, resolution: 8, duration: 2, channels: 1 };
  const [rate, setRate] = useState(defaults.rate);
  const [resolution, setResolution] = useState(defaults.resolution);
  const [durationInput, setDurationInput] = useState(String(defaults.duration));
  const [channels, setChannels] = useState(defaults.channels);
  const parsedDuration = boundedNumber(durationInput, 0.1, 30);
  const duration = parsedDuration.value;
  const durationError = parsedDuration.valid ? "" : copy(locale, "Enter a duration from 0.1 to 30 seconds.", "Nhập thời lượng từ 0,1 đến 30 giây.");
  const model = pcmStorage(rate, resolution, duration, channels);
  const scenes: Scene[] = parsedDuration.valid ? [
    { title: copy(locale, "Start with an analogue signal", "Bắt đầu với tín hiệu analogue"), explanation: copy(locale, "The continuous curve represents amplitude changing with time.", "Đường cong liên tục biểu diễn biên độ thay đổi theo thời gian."), transcript: copy(locale, "A continuous waveform changes amplitude over time.", "Dạng sóng liên tục thay đổi biên độ theo thời gian."), graphic: <Waveform locale={locale} /> },
    { title: copy(locale, "Take measurements in time", "Đo tại các thời điểm"), explanation: copy(locale, `${format(rate)} samples are taken per second on each channel. The normalized diagram uses more visible dots for a higher rate; it is not one dot per real sample.`, `Mỗi kênh lấy ${format(rate)} mẫu mỗi giây. Sơ đồ chuẩn hóa dùng nhiều chấm nhìn thấy hơn cho rate cao hơn; mỗi chấm không tương ứng một mẫu thật.`), transcript: copy(locale, `${format(rate)} samples per second per channel for ${duration} ${plural(duration, "second")} gives ${format(model.samplesPerChannel)} samples per channel.`, `${format(rate)} mẫu mỗi giây trên mỗi kênh trong ${duration} giây tạo ${format(model.samplesPerChannel)} mẫu mỗi kênh.`), graphic: <Waveform locale={locale} rate={rate} resolution={resolution} samples /> },
    { sceneId: "P1-L07-scene-sample-and-quantise", title: copy(locale, "Quantise each measurement", "Quantise từng phép đo"), explanation: copy(locale, `${resolution} bits provide ${format(model.levels)} possible amplitude levels. Change sample rate and resolution one at a time to distinguish time spacing from amplitude levels.`, `${resolution} bit tạo ${format(model.levels)} mức biên độ khả dụng. Hãy đổi riêng sampling rate và sampling resolution để phân biệt khoảng thời gian với mức biên độ.`), transcript: copy(locale, `${resolution}-bit resolution means ${format(model.levels)} possible stored levels; each sample is mapped to its nearest available level.`, `Độ phân giải ${resolution}-bit cho ${format(model.levels)} mức lưu có thể; mỗi mẫu được ánh xạ vào mức khả dụng gần nhất.`), graphic: <SamplingFixture locale={locale} rate={rate} resolution={resolution} /> },
    { title: copy(locale, "Calculate uncompressed PCM storage", "Tính dung lượng PCM chưa nén"), explanation: `${format(rate)} × ${resolution} × ${duration} × ${channels} = ${format(model.bits)} bits = ${format(model.bytes)} bytes`, transcript: copy(locale, `${format(model.totalSamples)} total samples, ${resolution} bits each, require ${format(model.bytes)} bytes before headers or compression.`, `Tổng ${format(model.totalSamples)} mẫu, mỗi mẫu ${resolution} bit, cần ${format(model.bytes)} byte trước header hoặc nén.`), graphic: <div className={styles.formula}><strong>{format(model.totalSamples)} {copy(locale, "samples", "mẫu")}</strong><span>× {resolution} bits</span><strong data-accent>{format(model.bytes)} B</strong></div> },
  ] : [{ title: copy(locale, "Enter a valid duration", "Nhập thời lượng hợp lệ"), explanation: durationError, transcript: durationError, graphic: <div className={styles.modelError} role="alert">{durationError}</div> }];
  return <Journey locale={locale} visualId="VIS-P1-L07" title={copy(locale, "Audio sampling and storage", "Lấy mẫu âm thanh và dung lượng")} intro={copy(locale, "Move from an analogue waveform to samples, quantised values and an uncompressed PCM size.", "Đi từ waveform analogue đến sample, giá trị quantised và dung lượng PCM chưa nén.")} stateKey={`${rate}-${resolution}-${durationInput}-${channels}`} onReset={() => { setRate(defaults.rate); setResolution(defaults.resolution); setDurationInput(String(defaults.duration)); setChannels(defaults.channels); }} prediction={{ prompt: copy(locale, "Which change directly doubles raw PCM storage if all other inputs stay fixed?", "Thay đổi nào làm dung lượng PCM thô tăng gấp đôi khi các đầu vào khác giữ nguyên?"), choices: [copy(locale, "Double the duration", "Tăng gấp đôi duration"), copy(locale, "Rename the file", "Đổi tên file"), copy(locale, "Play it more loudly", "Phát to hơn")], expectedChoice: copy(locale, "Double the duration", "Tăng gấp đôi duration"), observedOutcome: copy(locale, "Doubling duration doubles the number of stored samples.", "Tăng gấp đôi duration làm số sample được lưu tăng gấp đôi."), explanation: copy(locale, "PCM size is sample rate × resolution × duration × channels.", "Dung lượng PCM bằng sampling rate × sampling resolution × duration × số kênh.") }} controls={<><Select id="p1-audio-rate" label={copy(locale, "Sample rate", "Sampling rate")} value={rate} onChange={(event) => setRate(Number(event.target.value))}><option value={8000}>8,000 Hz</option><option value={22050}>22,050 Hz</option><option value={44100}>44,100 Hz</option><option value={48000}>48,000 Hz</option></Select><Select id="p1-audio-resolution" label={copy(locale, "Sample resolution", "Sampling resolution")} value={resolution} onChange={(event) => setResolution(Number(event.target.value))}><option value={8}>8 bit</option><option value={16}>16 bit</option><option value={24}>24 bit</option></Select><Field id="p1-audio-duration" label={copy(locale, "Duration (seconds)", "Thời lượng (giây)")} type="number" step="any" min={0.1} max={30} value={durationInput} error={durationError || undefined} onChange={(event) => setDurationInput(event.target.value)} /><Select id="p1-audio-channels" label={copy(locale, "Channels", "Số kênh")} value={channels} onChange={(event) => setChannels(Number(event.target.value))}><option value={1}>Mono · 1</option><option value={2}>Stereo · 2</option></Select></>} scenes={scenes} />;
}

function CompressionLab({ locale }: { readonly locale: Locale }) {
  const defaults = { value: "AAAAABBBBBCCCCCCCC", scanOrder: "row-major" as BitmapScanOrder };
  const [value, setValue] = useState(defaults.value);
  const [scanOrder, setScanOrder] = useState<BitmapScanOrder>(defaults.scanOrder);
  const clean = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 24);
  const hasSymbols = clean.length > 0;
  const emptyError = copy(locale, "Enter at least one letter from A to Z.", "Nhập ít nhất một chữ cái từ A đến Z.");
  const ignoredError = copy(locale, "Only A–Z are used by this model; other characters are ignored.", "Mô hình chỉ dùng A–Z; các ký tự khác bị bỏ qua.");
  const inputError = !hasSymbols ? emptyError : value !== clean ? ignoredError : "";
  const model = rleComparison(clean);
  const encoded = model.runs.map((run) => `${run.count}${run.character}`).join(" ");
  const scenes: Scene[] = hasSymbols ? [
    { title: copy(locale, "Scan consecutive symbols", "Quét các ký hiệu liên tiếp"), explanation: copy(locale, "A run ends when the next symbol changes. RLE does not combine identical symbols separated by another value.", "Một run kết thúc khi ký hiệu tiếp theo thay đổi. RLE không gộp các ký hiệu giống nhau bị ngăn cách bởi giá trị khác."), transcript: copy(locale, `Source sequence: ${clean}.`, `Chuỗi nguồn: ${clean}.`), graphic: <div className={styles.symbols}>{clean.split("").map((character, index) => <span key={index} data-active={index < 3 || undefined}>{character}</span>)}</div> },
    { title: copy(locale, "Write count–symbol pairs", "Ghi các cặp số lượng–ký hiệu"), explanation: encoded, transcript: copy(locale, `The runs are ${model.runs.map((run) => `${run.count} ${plural(run.count, "copy", "copies")} of ${run.character}`).join(", ")}.`, `Các run là ${model.runs.map((run) => `${run.count} ký hiệu ${run.character}`).join(", ")}.`), graphic: <div className={styles.runs}>{model.runs.map((run, index) => <span key={`${run.character}-${index}`} data-active={index < 3 || undefined}><strong>{run.count}</strong><small>{run.character}</small></span>)}</div> },
    { sceneId: "P1-L08-scene-bitmap-runs", title: copy(locale, "Apply the same rule to a bitmap", "Áp dụng cùng quy tắc cho bitmap"), explanation: copy(locale, "Declare a scan order, flatten the pixel grid into a sequence, then encode consecutive colours. A different scan order can produce different runs.", "Công bố scan order, trải phẳng lưới pixel thành chuỗi rồi encode các màu liên tiếp. Scan order khác có thể tạo các run khác."), transcript: copy(locale, `The 8 by 8 bitmap is scanned ${scanOrder}; decoding with the same order reconstructs the grid exactly.`, `Bitmap 8 × 8 được quét theo ${scanOrder}; giải mã bằng cùng thứ tự sẽ phục hồi chính xác lưới.`), graphic: <BitmapRleScene locale={locale} scanOrder={scanOrder} /> },
    { title: copy(locale, "Decode to verify losslessness", "Giải mã để kiểm tra lossless"), explanation: `${encoded} → ${rleDecode(model.runs)}`, transcript: copy(locale, `Decoding reconstructs ${rleDecode(model.runs)}, exactly matching the original: ${rleDecode(model.runs) === clean}.`, `Giải mã khôi phục ${rleDecode(model.runs)}, khớp chính xác bản gốc: ${rleDecode(model.runs) === clean ? "đúng" : "sai"}.`), graphic: <div className={styles.formula}><strong>{encoded}</strong><span>→</span><strong data-accent>{rleDecode(model.runs)}</strong></div> },
    { title: copy(locale, "Compare storage for this model", "So sánh dung lượng trong mô hình"), explanation: copy(locale, `Assuming one byte for each count and one for each symbol: original ${model.originalBytes} B; RLE ${model.encodedBytes} B.`, `Giả sử mỗi count và mỗi ký hiệu dùng một byte: bản gốc ${model.originalBytes} B; RLE ${model.encodedBytes} B.`), transcript: copy(locale, `Original ${model.originalBytes} ${plural(model.originalBytes, "byte")}; encoded ${model.encodedBytes} ${plural(model.encodedBytes, "byte")}; RLE ${model.savesSpace ? "saves" : "does not save"} space for this sequence.`, `Bản gốc ${model.originalBytes} byte; đã mã hóa ${model.encodedBytes} byte; RLE ${model.savesSpace ? "tiết kiệm" : "không tiết kiệm"} dung lượng với chuỗi này.`), graphic: <div className={styles.barCompare}><div><span style={{ "--bar-percent": `${Math.max(8, Math.min(100, model.originalBytes * 4))}%` } as CSSProperties} /><small>{copy(locale, "original", "bản gốc")} · {model.originalBytes} B</small></div><div data-warning={!model.savesSpace || undefined}><span style={{ "--bar-percent": `${Math.max(8, Math.min(100, model.encodedBytes * 4))}%` } as CSSProperties} /><small>RLE · {model.encodedBytes} B</small></div></div> },
  ] : [{ title: copy(locale, "Enter a source sequence", "Nhập chuỗi nguồn"), explanation: emptyError, transcript: emptyError, graphic: <div className={styles.modelError} role="alert">{emptyError}</div> }];
  return <Journey locale={locale} visualId="VIS-P1-L08" title={copy(locale, "Lossless compression with RLE", "Nén lossless bằng RLE")} intro={copy(locale, "Encode text and bitmap runs, decode them back to the original, and test when RLE helps or adds overhead.", "Mã hóa run của text và bitmap, giải mã về bản gốc và kiểm tra khi nào RLE hiệu quả hoặc tạo overhead.")} stateKey={`${value}-${scanOrder}`} onReset={() => { setValue(defaults.value); setScanOrder(defaults.scanOrder); }} prediction={{ prompt: copy(locale, "Will RLE use fewer bytes for this sequence under the stated two-byte-per-run model?", "RLE có dùng ít byte hơn cho chuỗi này theo mô hình hai byte mỗi run không?"), choices: [copy(locale, "Yes", "Có"), copy(locale, "No", "Không")], expectedChoice: copy(locale, model.savesSpace ? "Yes" : "No", model.savesSpace ? "Có" : "Không"), observedOutcome: copy(locale, `Original: ${model.originalBytes} B; RLE: ${model.encodedBytes} B.`, `Bản gốc: ${model.originalBytes} B; RLE: ${model.encodedBytes} B.`), explanation: copy(locale, "Under this model, each run costs two bytes, so many short runs can add overhead.", "Trong mô hình này, mỗi run tốn hai byte nên nhiều run ngắn có thể tạo overhead.") }} controls={<><Field id="p1-rle-value" label={copy(locale, "Source sequence (A–Z, up to 24 symbols)", "Chuỗi nguồn (A–Z, tối đa 24 ký hiệu)")} value={value} maxLength={24} error={inputError || undefined} onChange={(event) => setValue(event.target.value.toUpperCase())} /><Select id="p1-rle-scan" label={copy(locale, "Bitmap scan order", "Thứ tự quét bitmap")} value={scanOrder} onChange={(event) => setScanOrder(event.target.value as BitmapScanOrder)}><option value="row-major">Row-major</option><option value="column-major">Column-major</option></Select><div className={styles.presets} role="group" aria-label={copy(locale, "Example sequences", "Các chuỗi ví dụ")}><button type="button" onClick={() => setValue("AAAAABBBBBCCCCCCCC")}>{copy(locale, "Long runs", "Run dài")}</button><button type="button" onClick={() => setValue("ABABABAB")}>{copy(locale, "Alternating", "Xen kẽ")}</button><button type="button" onClick={() => setValue("AAABBCAAAA")}>{copy(locale, "Mixed", "Hỗn hợp")}</button></div></>} scenes={scenes} />;
}

export function Paper1VisualLab({ lessonId, locale }: { readonly lessonId: string; readonly locale: Locale }) {
  if (lessonId === "P1-L01") return <UnitLab locale={locale} />;
  if (lessonId === "P1-L02") return <RepresentationLab locale={locale} />;
  if (lessonId === "P1-L03") return <SignedLab locale={locale} />;
  if (lessonId === "P1-L04") return <EncodingLab locale={locale} />;
  if (lessonId === "P1-L05") return <BitmapLab locale={locale} />;
  if (lessonId === "P1-L06") return <VectorLab locale={locale} />;
  if (lessonId === "P1-L07") return <AudioLab locale={locale} />;
  if (lessonId === "P1-L08") return <CompressionLab locale={locale} />;
  if (chapter2VisualLessonIds.includes(lessonId)) return <Chapter2VisualLab lessonId={lessonId} locale={locale} />;
  if (chapter3VisualLessonIds.includes(lessonId)) return <Chapter3VisualLab lessonId={lessonId} locale={locale} />;
  if (chapter4VisualLessonIds.includes(lessonId)) return <Chapter4VisualLab lessonId={lessonId} locale={locale} />;
  if (chapter5VisualLessonIds.includes(lessonId)) return <Chapter5VisualLab lessonId={lessonId} locale={locale} />;
  if (chapter6VisualLessonIds.includes(lessonId)) return <Chapter6VisualLab lessonId={lessonId} locale={locale} />;
  return <p className={styles.unavailable} role="status">{copy(locale, "This Paper 1 visual is not available.", "Minh họa Paper 1 này chưa có.")}</p>;
}
