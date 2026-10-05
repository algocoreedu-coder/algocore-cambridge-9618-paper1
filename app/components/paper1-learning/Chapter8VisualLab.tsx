"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Database, RotateCcw } from "lucide-react";
import { Button } from "@/app/components/algocore-ui";
import {
  L44_RECORD_CHANGES,
  L44_STORAGE_MODELS,
  L45_KEY_CHOICES,
  L45_RECORD_OPERATIONS,
  L45_SCHEMA_FIXTURES,
  L46_DATASETS,
  L46_DEPENDENCY_CHOICES,
  L47_PACKETS,
  L48_STATEMENT_FIXTURES,
  L49_DDL_FAMILIES,
  L49_VALIDITY_VARIANTS,
  L50_STATEMENT_PACKETS,
  chapter8SemanticText as semanticText,
  l44RelationalProofbenchFrames,
  l45KeyRelationFrames,
  l46NormalisationFrames,
  l47DbmsControlFrames,
  l48SqlRoleFrames,
  l49DdlSchemaFrames,
  l50DmlTraceFrames,
  type L44RecordChange,
  type L44StorageModel,
  type L45KeyChoice,
  type L45RecordOperation,
  type L45SchemaFixture,
  type L46Dataset,
  type L46DependencyChoice,
  type L47Packet,
  type L48StatementFixture,
  type L49DdlFamily,
  type L49Validity,
  type L50Packet,
  type ModelFrame,
  type Chapter8RevealMap,
} from "@/app/lib/paper1/chapter8-models";
import type { Paper1Locale } from "@/app/lib/paper1/types";
import styles from "./Chapter8VisualLab.module.css";

type LocalText = Readonly<{ en: string; vi: string }>;
type Choice = Readonly<{ id: string; label: LocalText }>;
type Receipt = Readonly<{ label: LocalText; value: unknown }>;
type TableSpec = Readonly<{ title: LocalText; rows: readonly Readonly<Record<string, unknown>>[] }>;
type ViewState = Readonly<{ source: string; operation: string; result: string; receipts: readonly Receipt[]; tables?: readonly TableSpec[] }>;
type Prediction = Readonly<{ prompt: LocalText; choices: readonly Choice[]; expectedChoiceId: string; rubric: readonly LocalText[] }>;

const copy = (locale: Paper1Locale, value: LocalText) => value[locale];
const tx = (en: string, vi: string): LocalText => ({ en, vi });
const valueText = (value: unknown): string => {
  if (Array.isArray(value)) return value.length ? value.map(valueText).join(" · ") : "—";
  if (value && typeof value === "object") return Object.entries(value).map(([key, item]) => `${key}: ${valueText(item)}`).join("; ");
  if (typeof value === "boolean") return value ? "true" : "false";
  return value === "" || value === null || value === undefined ? "—" : String(value);
};

const LEDGER_FIELD_BY_LABEL: Readonly<Record<string, string>> = {
  "Source structure": "sourceStructure", "Authoritative records": "authoritativeRecordCount", "Application references": "applicationReferenceCount", "Stored copies": "storedCopyCount", "Update targets": "updateTargets", "Program dependencies": "programDependencies", Evidence: "evidence", Limitation: "limitation",
  "Candidate keys": "candidateKeys", "Primary / secondary": "primarySecondary", "Foreign keys": "foreignKeys", "Key verdict": "keyVerdict", "Constraint outcome": "constraintOutcome", "Index boundary": "indexEffect",
  Diagnosis: "diagnosis", "Normal form": "normalForm", "Primary keys": "primaryKeys", "Provenance map": "provenanceMap", "Reconstructed facts": "reconstructedFacts", "Anomaly evidence": "anomalyEvidence",
  "Dictionary entry": "dictionaryEntry", "Logical schema effect": "logicalSchemaEffect", "Integrity control": "integrityControl", "Security control": "securityControl", "Backup evidence": "backupEvidence", "Result / limitation": "result",
  Dialect: "dialect", "Matched rows": "matchedRows", "Structure before / after": "structureAfter",
  "DDL tokens": "tokens", "Data types": "dataTypes", "Prospective schema": "prospectiveSchema", "Constraint check": "constraintCheck", "Committed schema": "schemaAfter", "Declared faults": "declaredFaults",
  "Join pairs": "joinPairs", "Matching rows": "matchedRowIds", "Group / aggregate inputs": "aggregateInputs", "Projected / sort columns": "projectedColumns", "Affected rows": "affectedRowIds", "Dialect boundary": "dialect",
};

const TABLE_FIELD_BY_LABEL: Readonly<Record<string, string>> = {
  "Source records": "sourceRecords", "Current result records": "resultRecords", "Rows before": "rowsBefore", "Query result": "result", "Rows after": "rowsAfter", "Source rows": "sourceRows", "Result rows": "resultRows",
};

const CHANGE_LABELS: Readonly<Record<L44RecordChange, LocalText>> = {
  employee_contact_change: tx("Employee contact update", "Cập nhật liên hệ nhân viên"),
  customer_address_change: tx("Customer address update", "Cập nhật địa chỉ khách hàng"),
  new_cross_function_enquiry: tx("New cross-function enquiry", "Truy vấn liên phòng ban mới"),
};
const STORAGE_LABELS: Readonly<Record<L44StorageModel, LocalText>> = {
  file_based: tx("Separate file-based programs", "Các chương trình dùng tệp riêng"),
  relational: tx("Shared relational design", "Thiết kế quan hệ dùng chung"),
};
const SCHEMA_LABELS: Readonly<Record<L45SchemaFixture, LocalText>> = {
  person_passport: tx("Person and passport (1:1)", "Person và passport (1:1)"),
  class_student: tx("Class and student (1:M)", "Class và student (1:M)"),
  student_subject_enrolment: tx("Student and subject through enrolment (M:N)", "Student và subject qua enrolment (M:N)"),
};
const DATASET_LABELS: Readonly<Record<L46Dataset, LocalText>> = {
  club_member_contacts: tx("Club member contacts", "Liên hệ thành viên câu lạc bộ"),
  order_product_lines: tx("Order product lines", "Các dòng sản phẩm của đơn hàng"),
  course_class_teacher: tx("Course, class and teacher", "Khóa học, lớp và giáo viên"),
};
const PACKET_LABELS: Readonly<Record<L47Packet, LocalText>> = {
  developer_schema_change: tx("Developer requests a schema change", "Developer yêu cầu đổi schema"),
  developer_complex_query: tx("Developer tests a two-table query", "Developer thử truy vấn hai bảng"),
  dba_role_access: tx("DBA assigns read-only access", "DBA cấp quyền chỉ đọc"),
  dba_integrity_constraint: tx("DBA adds an integrity constraint", "DBA thêm ràng buộc integrity"),
  dba_backup_restore_test: tx("DBA tests a restore", "DBA kiểm tra khôi phục"),
  authorised_analyst_query: tx("Authorised analyst requests a summary", "Analyst được phép yêu cầu báo cáo"),
};
const SQL_ROLE_LABELS: Readonly<Record<L48StatementFixture, LocalText>> = {
  create_database: tx("CREATE DATABASE", "CREATE DATABASE"), create_table: tx("CREATE TABLE", "CREATE TABLE"),
  alter_table: tx("ALTER TABLE", "ALTER TABLE"), select_where: tx("SELECT … WHERE", "SELECT … WHERE"),
  inner_join: tx("INNER JOIN", "INNER JOIN"), insert_row: tx("INSERT", "INSERT"),
  update_where: tx("UPDATE … WHERE", "UPDATE … WHERE"), delete_where: tx("DELETE … WHERE", "DELETE … WHERE"),
};
const DDL_LABELS: Readonly<Record<L49DdlFamily, LocalText>> = {
  create_database: tx("Create a database", "Tạo database"), create_table_types: tx("Create a typed table", "Tạo bảng có kiểu dữ liệu"),
  alter_table: tx("Alter a table", "Thay đổi bảng"), primary_key: tx("Declare a primary key", "Khai báo primary key"),
  foreign_key_references: tx("Declare a foreign-key reference", "Khai báo foreign key tham chiếu"),
};
const DML_LABELS: Readonly<Record<L50Packet, LocalText>> = {
  select_from_where: tx("Filter and project", "Lọc và chiếu cột"), order_by: tx("Order query results", "Sắp xếp kết quả"),
  group_by_count: tx("Group and count", "Nhóm và đếm"), sum_avg: tx("SUM and AVG", "SUM và AVG"),
  inner_join_two_tables: tx("Join two tables", "Join hai bảng"), insert_full_row: tx("Insert a complete row", "Thêm một hàng đầy đủ"),
  insert_explicit_columns: tx("Insert with explicit columns", "Thêm với danh sách cột"), update_where: tx("Update matching rows", "Cập nhật hàng thỏa điều kiện"),
  delete_where: tx("Delete matching rows", "Xóa hàng thỏa điều kiện"), delete_without_where: tx("Delete every row", "Xóa toàn bộ hàng"),
};

function SelectControl<T extends string>({ id, label, value, values, labels, onChange }: { readonly id: string; readonly label: LocalText; readonly value: T; readonly values: readonly T[]; readonly labels: Readonly<Record<T, LocalText>>; readonly onChange: (value: T) => void; }) {
  const locale = id.endsWith("-vi") ? "vi" : "en";
  return <label className={styles.selectControl} htmlFor={id}><span>{copy(locale, label)}</span><select id={id} value={value} onChange={(event) => onChange(event.target.value as T)}>{values.map((entry) => <option key={entry} value={entry}>{copy(locale, labels[entry])}</option>)}</select></label>;
}

function DataTable({ locale, spec }: { readonly locale: Paper1Locale; readonly spec: TableSpec }) {
  if (!spec.rows.length) return null;
  const columns = [...new Set(spec.rows.flatMap((row) => Object.keys(row)))];
  return <div className={styles.localScroll} tabIndex={0} role="region" aria-label={copy(locale, spec.title)}><table><caption>{copy(locale, spec.title)}</caption><thead><tr>{columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{spec.rows.map((row, index) => <tr key={`${index}-${valueText(row)}`}>{columns.map((column) => <td key={column}>{valueText(row[column])}</td>)}</tr>)}</tbody></table></div>;
}

function ProofCanvas({ locale, tag, view, activeIds }: { readonly locale: Paper1Locale; readonly tag: string; readonly view: ViewState; readonly activeIds: readonly string[] }) {
  const sourceTokens = ["source", "schema", "request", "statement", "requirement", "dependency"];
  const resultTokens = ["result", "evidence", "limitation", "constraint", "reconstruction", "conclusion"];
  const activeNode = activeIds.some((id) => sourceTokens.includes(id)) ? "source" : activeIds.some((id) => resultTokens.includes(id)) ? "result" : "operation";
  const nodes = [
    { id: "source", label: tx("Source facts", "Dữ kiện nguồn"), value: view.source },
    { id: "operation", label: tx("One transformation", "Một phép biến đổi"), value: view.operation },
    { id: "result", label: tx("Observable result", "Kết quả quan sát được"), value: view.result },
  ];
  return <div className={styles.canvas} aria-label={copy(locale, tx("Relational Proofbench canvas", "Khung Relational Proofbench"))}>
    <div className={styles.flow}>{nodes.map((node, index) => <div className={styles.nodeWrap} key={node.id}><article className={styles.node} data-active={activeNode === node.id || undefined}><small>{copy(locale, node.label)}</small><strong>{semanticText(locale, node.value)}</strong>{activeNode === node.id ? <b aria-label={copy(locale, tx(`Provenance tag ${tag}`, `Nhãn truy vết ${tag}`))}>{tag}</b> : null}</article>{index < nodes.length - 1 ? <span aria-hidden="true">→</span> : null}</div>)}</div>
    {view.tables?.map((table) => <DataTable locale={locale} spec={table} key={`${table.title.en}-${table.rows.length}`} />)}
  </div>;
}

function Journey<T extends Readonly<{ reveal: Chapter8RevealMap; provenanceTag: string }>>({ locale, visualId, title, intro, stateKey, controls, sourceFacts, frames, prediction, toView, onReset }: {
  readonly locale: Paper1Locale;
  readonly visualId: string;
  readonly title: LocalText;
  readonly intro: LocalText;
  readonly stateKey: string;
  readonly controls: ReactNode;
  readonly sourceFacts: readonly Receipt[];
  readonly frames: readonly ModelFrame<T>[];
  readonly prediction: Prediction;
  readonly toView: (frame: ModelFrame<T>, index: number) => ViewState;
  readonly onReset: () => void;
}) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const radioName = useId();
  const predictionRef = useRef<HTMLFieldSetElement>(null);
  const previousStateKey = useRef(stateKey);
  if (previousStateKey.current !== stateKey) {
    previousStateKey.current = stateKey;
    setStep(0);
    setChoice("");
    setReason("");
    setSubmitted(false);
  }
  const safeStep = Math.min(step, frames.length - 1);
  const current = frames[safeStep];
  const projectView = (frame: ModelFrame<T>, index: number): ViewState => {
    const raw = toView(frame, index);
    const state = frame.state;
    const receipts = raw.receipts.filter((entry) => state.reveal.ledgerFields.includes(LEDGER_FIELD_BY_LABEL[entry.label.en] ?? "not-unlocked"));
    const tables = raw.tables?.filter((entry) => state.reveal.tableFields.includes(TABLE_FIELD_BY_LABEL[entry.title.en] ?? "relations"));
    return { source: state.reveal.source, operation: state.reveal.operation, result: state.reveal.result, receipts, tables };
  };
  const view = projectView(current, safeStep);
  const ready = Boolean(choice) && reason.trim().length >= 12;
  const reset = () => {
    onReset();
    setStep(0); setChoice(""); setReason(""); setSubmitted(false);
    requestAnimationFrame(() => predictionRef.current?.focus());
  };
  return <section className={styles.lab} data-paper1-visual={visualId} aria-labelledby={`${visualId}-title`}>
    <header className={styles.header}><span className={styles.kicker}><Database size={16} aria-hidden="true" /> {visualId} · Relational Proofbench</span><h3 id={`${visualId}-title`}>{copy(locale, title)}</h3><p>{copy(locale, intro)}</p></header>
    <div className={styles.controls}>{controls}</div>
    <section className={styles.sourceCard} aria-labelledby={`${visualId}-source`}><h4 id={`${visualId}-source`}>{copy(locale, tx("Source fixture visible before prediction", "Bộ dữ liệu nguồn hiển thị trước dự đoán"))}</h4><dl>{sourceFacts.map((fact) => <div key={fact.label.en}><dt>{copy(locale, fact.label)}</dt><dd>{semanticText(locale, fact.value)}</dd></div>)}</dl></section>
    <fieldset ref={predictionRef} tabIndex={-1} className={styles.prediction}><legend>{copy(locale, tx("Predict before the answer-bearing trace is revealed", "Dự đoán trước khi mở truy vết chứa đáp án"))}</legend><p>{copy(locale, prediction.prompt)}</p><div className={styles.choiceGrid}>{prediction.choices.map((entry) => <label key={entry.id}><input type="radio" name={radioName} checked={choice === entry.id} disabled={submitted} onChange={() => { setChoice(entry.id); setStep(0); }} /><span>{copy(locale, entry.label)}</span></label>)}</div><label className={styles.reason}><span>{copy(locale, tx("Write one because-clause using the source facts", "Viết một mệnh đề vì sao dùng dữ kiện nguồn"))}</span><textarea rows={3} value={reason} disabled={submitted} onChange={(event) => { setReason(event.target.value); setStep(0); }} /></label><div className={styles.submitRow}><Button disabled={!ready || submitted} onClick={() => setSubmitted(true)}>{copy(locale, tx("Record prediction", "Ghi dự đoán"))}</Button><small aria-live="polite">{submitted ? copy(locale, tx("Prediction recorded. Use Next to reveal one semantic change at a time.", "Đã ghi dự đoán. Dùng Tiếp theo để mở từng thay đổi ngữ nghĩa.")) : ready ? copy(locale, tx("Ready to record.", "Sẵn sàng ghi.")) : copy(locale, tx("Choose one option and write at least 12 characters.", "Chọn một phương án và viết ít nhất 12 ký tự."))}</small></div></fieldset>
    {submitted ? <div className={styles.stage}>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{locale === "vi" ? `Bước ${safeStep + 1} trên ${frames.length}: ${semanticText("vi", current.id)}. Bằng chứng ${current.ticket}. Nhãn truy vết ${current.state.provenanceTag}.` : `Step ${safeStep + 1} of ${frames.length}: ${semanticText("en", current.id)}. Evidence ${current.ticket}. Provenance ${current.state.provenanceTag}.`}</p>
      <div className={styles.stageHeader}><div><small>{copy(locale, tx("Proof step", "Bước chứng minh"))} {safeStep + 1}/{frames.length}</small><h4>{semanticText(locale, current.id)}</h4></div><div className={styles.tagStack}><span className={styles.provenance}>{current.state.provenanceTag}</span><span className={styles.evidenceTicket}>{copy(locale, tx("Evidence step", "Bước bằng chứng"))} {current.ticket}</span></div></div>
      <div className={styles.instrument}><ProofCanvas locale={locale} tag={current.state.provenanceTag} view={view} activeIds={current.activeIds} /><aside className={styles.ledger} aria-label={copy(locale, tx("Trace ledger", "Sổ truy vết"))}><h4>{copy(locale, tx("Trace ledger", "Sổ truy vết"))}</h4><dl>{view.receipts.map((entry) => <div key={entry.label.en}><dt>{copy(locale, entry.label)}</dt><dd>{semanticText(locale, entry.value)}</dd></div>)}</dl></aside></div>
      <section className={styles.textEquivalent} aria-labelledby={`${visualId}-text`}><h4 id={`${visualId}-text`}>{copy(locale, tx("Cumulative text equivalent", "Bản chữ tích lũy tương đương"))}</h4><ol>{frames.slice(0, safeStep + 1).map((frame, index) => { const reveal = frame.state.reveal; return <li key={frame.id} aria-current={index === safeStep ? "step" : undefined}><strong>{index + 1}. {semanticText(locale, frame.id)} · {frame.state.provenanceTag} · {frame.ticket}</strong><span>{semanticText(locale, reveal.source)} → {semanticText(locale, reveal.operation)} → {semanticText(locale, reveal.result)}</span></li>; })}</ol></section>
      {safeStep === frames.length - 1 ? <section className={styles.comparison} data-match={choice === prediction.expectedChoiceId || undefined}><h4>{copy(locale, tx("Prediction comparison and rubric self-review", "So sánh dự đoán và tự kiểm theo rubric"))}</h4><p><strong>{copy(locale, tx("Prediction", "Dự đoán"))}:</strong> {copy(locale, prediction.choices.find((entry) => entry.id === choice)?.label ?? tx("Not recorded", "Chưa ghi"))}</p><p><strong>{copy(locale, tx("Authored outcome", "Kết quả đã soạn"))}:</strong> {semanticText(locale, view.result)}</p><ul>{prediction.rubric.map((item) => <li key={item.en}>{copy(locale, item)}</li>)}</ul><p>{copy(locale, tx("Use this evidence to review your explanation. Alternative valid schemas or SQL should be checked against the rubric, not rejected by naming alone.", "Dùng bằng chứng này để tự kiểm phần giải thích. Schema hoặc SQL tương đương hợp lệ phải được đối chiếu rubric, không bị loại chỉ vì tên khác."))}</p></section> : null}
      <nav className={styles.navigation} aria-label={copy(locale, tx("Proof controls", "Điều khiển truy vết"))}><Button variant="secondary" disabled={safeStep === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft size={17} aria-hidden="true" />{copy(locale, tx("Back", "Quay lại"))}</Button><Button variant="quiet" onClick={reset}><RotateCcw size={17} aria-hidden="true" />{copy(locale, tx("Reset", "Đặt lại"))}</Button><Button disabled={safeStep === frames.length - 1} onClick={() => setStep((value) => Math.min(frames.length - 1, value + 1))}>{copy(locale, tx("Next", "Tiếp theo"))}<ArrowRight size={17} aria-hidden="true" /></Button></nav>
    </div> : null}
  </section>;
}

const tableRows = (rows: readonly Readonly<Record<string, string | number | boolean>>[]) => rows as readonly Readonly<Record<string, unknown>>[];
const labelsAB = { valid_minimal: tx("Use the displayed minimal identifier", "Dùng định danh tối thiểu đang hiển thị"), invalid_or_non_minimal: tx("Use the displayed alternate key proposal", "Dùng đề xuất khóa thay thế đang hiển thị") } as const;
const operationsAB = { valid_reference: tx("Insert using an existing parent reference", "Thêm hàng dùng tham chiếu parent hiện có"), violating_operation: tx("Insert using a missing parent reference", "Thêm hàng dùng tham chiếu parent còn thiếu") } as const;
const diagnosesAB = { correct_declared_set: tx("Diagnose from the displayed functional dependencies", "Chẩn đoán từ functional dependency đang hiển thị"), incorrect_diagnosis: tx("Diagnose from sample-row appearance alone", "Chẩn đoán chỉ từ hình thức các hàng mẫu") } as const;
const variantsAB = { valid: tx("Candidate statement A", "Câu lệnh ứng viên A"), invalid: tx("Candidate statement B", "Câu lệnh ứng viên B") } as const;

function L44Lab({ locale }: { readonly locale: Paper1Locale }) {
  const [change, setChange] = useState<L44RecordChange>("employee_contact_change");
  const [storage, setStorage] = useState<L44StorageModel>("file_based");
  const defaults = () => { setChange("employee_contact_change"); setStorage("file_based"); };
  const frames = l44RelationalProofbenchFrames(change, storage); const final = frames.at(-1)!.state;
  return <Journey locale={locale} visualId="VIS-P1-L44" title={tx("File-to-relation anomaly bench", "Bàn kiểm chứng bất thường từ tệp sang quan hệ")} intro={tx("Follow one stable record tag through an update and compare separate files with one controlled relational fact.", "Theo một nhãn bản ghi ổn định qua phép cập nhật và so sánh tệp riêng với dữ kiện quan hệ được kiểm soát.")} stateKey={`${change}-${storage}`} onReset={defaults} frames={frames} controls={<><SelectControl id={`l44-change-${locale}`} label={tx("Record change", "Thay đổi bản ghi")} value={change} values={L44_RECORD_CHANGES} labels={CHANGE_LABELS} onChange={setChange} /><SelectControl id={`l44-storage-${locale}`} label={tx("Storage model", "Mô hình lưu trữ")} value={storage} values={L44_STORAGE_MODELS} labels={STORAGE_LABELS} onChange={setStorage} /></>} sourceFacts={[{ label: tx("Business fact", "Dữ kiện nghiệp vụ"), value: frames[0].state.businessFact }, { label: tx("Source records", "Bản ghi nguồn"), value: frames[0].state.sourceRecords }, { label: tx("Provenance", "Nhãn truy vết"), value: frames[0].state.provenanceTag }]} prediction={{ prompt: tx("What is the strongest outcome to test for this storage model?", "Kết quả quan trọng nhất cần kiểm tra cho mô hình lưu trữ này là gì?"), choices: [{ id: "risk", label: tx("A missed duplicate update or program–data dependence remains visible", "Vẫn thấy cập nhật bản sao bị bỏ sót hoặc phụ thuộc chương trình–dữ liệu") }, { id: "control", label: tx("One controlled fact and declared relationships support the trace", "Một dữ kiện được kiểm soát và quan hệ khai báo hỗ trợ truy vết") }, { id: "perfect", label: tx("The storage model eliminates every possible error", "Mô hình lưu trữ loại bỏ mọi lỗi có thể") }], expectedChoiceId: storage === "file_based" ? "risk" : "control", rubric: [tx("Name the duplicated location or query path.", "Nêu vị trí trùng lặp hoặc đường truy vấn."), tx("Explain the observed consequence.", "Giải thích hệ quả quan sát được."), tx("Qualify the relational benefit; it does not remove every error.", "Giới hạn lợi ích quan hệ; nó không xóa mọi lỗi.")] }} toView={(frame) => { const state = frame.state; return { source: state.businessFact, operation: `${state.storageModel}:${state.phase}`, result: state.inconsistencyFlags[0] ?? "trace-pending", receipts: [{ label: tx("Source structure", "Cấu trúc nguồn"), value: state.sourceStructure }, { label: tx("Authoritative records", "Bản ghi có thẩm quyền"), value: state.authoritativeRecordCount }, { label: tx("Application references", "Tham chiếu ứng dụng"), value: state.applicationReferenceCount }, { label: tx("Stored copies", "Bản sao được lưu"), value: state.storedCopyCount }, { label: tx("Update targets", "Mục tiêu cập nhật"), value: state.updateTargets }, { label: tx("Program dependencies", "Phụ thuộc chương trình"), value: state.programDependencies }, { label: tx("Evidence", "Bằng chứng"), value: state.evidence }, { label: tx("Limitation", "Giới hạn"), value: state.limitation }], tables: [{ title: tx("Source records", "Bản ghi nguồn"), rows: tableRows(state.sourceRecords) }, ...(state.phase !== "observe-duplicate-files" ? [{ title: tx("Current result records", "Bản ghi kết quả hiện tại"), rows: tableRows(state.resultRecords) }] : [])] }; }} />;
}

function L45Lab({ locale }: { readonly locale: Paper1Locale }) {
  const [schema, setSchema] = useState<L45SchemaFixture>("person_passport"); const [keyChoice, setKeyChoice] = useState<L45KeyChoice>("valid_minimal"); const [operation, setOperation] = useState<L45RecordOperation>("valid_reference");
  const frames = l45KeyRelationFrames(schema, keyChoice, operation); const final = frames.at(-1)!.state;
  return <Journey locale={locale} visualId="VIS-P1-L45" title={tx("Key, relationship and integrity bench", "Bàn kiểm chứng khóa, quan hệ và integrity")} intro={tx("Trace a declared key rule and a row operation through cardinality and referential integrity evidence.", "Truy vết quy tắc khóa đã khai báo và thao tác hàng qua bằng chứng cardinality và referential integrity.")} stateKey={`${schema}-${keyChoice}-${operation}`} onReset={() => { setSchema("person_passport"); setKeyChoice("valid_minimal"); setOperation("valid_reference"); }} frames={frames} controls={<><SelectControl id={`l45-schema-${locale}`} label={tx("Schema fixture", "Fixture schema")} value={schema} values={L45_SCHEMA_FIXTURES} labels={SCHEMA_LABELS} onChange={setSchema} /><SelectControl id={`l45-key-${locale}`} label={tx("Key proposal", "Đề xuất khóa")} value={keyChoice} values={L45_KEY_CHOICES} labels={labelsAB} onChange={setKeyChoice} /><SelectControl id={`l45-operation-${locale}`} label={tx("Record operation", "Thao tác bản ghi")} value={operation} values={L45_RECORD_OPERATIONS} labels={operationsAB} onChange={setOperation} /></>} sourceFacts={[{ label: tx("Relations", "Quan hệ"), value: frames[0].state.relations.map((entry) => entry.name) }, { label: tx("Attributes", "Thuộc tính"), value: frames[0].state.attributes }, { label: tx("Domain rules", "Quy tắc miền"), value: frames[0].state.domainRules }, { label: tx("Key proposal target", "Relation nhận đề xuất khóa"), value: frames[0].state.keyProposalTarget }, { label: tx("Selected key proposal", "Đề xuất khóa đã chọn"), value: frames[0].state.chosenKey }, { label: tx("Selected record operation", "Thao tác bản ghi đã chọn"), value: frames[0].state.operation }]} prediction={{ prompt: tx("Will the selected key and operation satisfy the declared identity/reference rules?", "Khóa và thao tác đã chọn có thỏa quy tắc định danh/tham chiếu không?"), choices: [{ id: "accepted", label: tx("Accepted: minimal key evidence and referenced value exist", "Chấp nhận: có bằng chứng khóa tối thiểu và giá trị được tham chiếu") }, { id: "rejected", label: tx("Rejected: key or reference evidence fails", "Từ chối: bằng chứng khóa hoặc tham chiếu không đạt") }, { id: "index", label: tx("An index decides referential validity", "Index quyết định tính hợp lệ tham chiếu") }], expectedChoiceId: final.committed && final.keyVerdict.startsWith("valid") ? "accepted" : "rejected", rubric: [tx("Use the declared domain rule, not sample uniqueness alone.", "Dùng quy tắc miền đã khai báo, không chỉ dựa vào uniqueness của mẫu."), tx("State the relationship in both directions.", "Nêu quan hệ theo cả hai chiều."), tx("Keep indexing separate from integrity.", "Tách indexing khỏi integrity.")] }} toView={(frame) => { const state = frame.state; return { source: `${state.schemaFixture}:${state.domainRules.join("|")}`, operation: `${state.chosenKey}:${state.operation}`, result: `${state.constraintOutcome}:${state.cardinality}`, receipts: [{ label: tx("Candidate keys", "Candidate keys"), value: state.candidateKeys }, { label: tx("Primary / secondary", "Primary / secondary"), value: `${valueText(state.primaryKeys)} · ${valueText(state.secondaryKeys)}` }, { label: tx("Foreign keys", "Foreign keys"), value: state.foreignKeys }, { label: tx("Key verdict", "Kết luận khóa"), value: state.keyVerdict }, { label: tx("Constraint outcome", "Kết quả ràng buộc"), value: state.constraintOutcome }, { label: tx("Index boundary", "Giới hạn index"), value: state.indexEffect }], tables: state.relations.map((entry) => ({ title: tx(entry.name, entry.name), rows: tableRows(entry.rows) })) }; }} />;
}

function L46Lab({ locale }: { readonly locale: Paper1Locale }) {
  const [dataset, setDataset] = useState<L46Dataset>("club_member_contacts"); const [diagnosis, setDiagnosis] = useState<L46DependencyChoice>("correct_declared_set"); const frames = l46NormalisationFrames(dataset, diagnosis);
  return <Journey locale={locale} visualId="VIS-P1-L46" title={tx("Dependency-guided normalisation bench", "Bàn chuẩn hóa theo phụ thuộc")} intro={tx("Follow one tuple or attribute tag from declared dependencies through 1NF, 2NF and 3NF, then reconstruct every source fact.", "Theo nhãn tuple hoặc attribute từ phụ thuộc đã khai báo qua 1NF, 2NF và 3NF, rồi tái dựng mọi dữ kiện nguồn.")} stateKey={`${dataset}-${diagnosis}`} onReset={() => { setDataset("club_member_contacts"); setDiagnosis("correct_declared_set"); }} frames={frames} controls={<><SelectControl id={`l46-dataset-${locale}`} label={tx("Dataset", "Bộ dữ liệu")} value={dataset} values={L46_DATASETS} labels={DATASET_LABELS} onChange={setDataset} /><SelectControl id={`l46-diagnosis-${locale}`} label={tx("Dependency diagnosis", "Chẩn đoán phụ thuộc")} value={diagnosis} values={L46_DEPENDENCY_CHOICES} labels={diagnosesAB} onChange={setDiagnosis} /></>} sourceFacts={[{ label: tx("Source facts", "Dữ kiện nguồn"), value: frames[0].state.sourceFacts }, { label: tx("Declared dependencies", "Phụ thuộc đã khai báo"), value: frames[0].state.functionalDependencies }, { label: tx("Provenance", "Nhãn truy vết"), value: frames[0].state.provenanceTag }, { label: tx("Selected diagnosis method", "Cách chẩn đoán đã chọn"), value: copy(locale, diagnosesAB[diagnosis]) }]} prediction={{ prompt: tx("Does the chosen diagnosis follow from the declared dependencies?", "Chẩn đoán đã chọn có suy ra từ phụ thuộc đã khai báo không?"), choices: [{ id: "supported", label: tx("Supported by the declared functional dependencies", "Được hỗ trợ bởi các functional dependency đã khai báo") }, { id: "unsupported", label: tx("Unsupported by the declared functional dependencies", "Không được hỗ trợ bởi các functional dependency đã khai báo") }], expectedChoiceId: diagnosis === "correct_declared_set" ? "supported" : "unsupported", rubric: [tx("Name the key and declared dependency.", "Nêu khóa và dependency đã khai báo."), tx("Identify repeating, partial or transitive dependency precisely.", "Xác định chính xác repeating, partial hoặc transitive dependency."), tx("Verify all facts and PK/FK links after decomposition.", "Kiểm chứng mọi dữ kiện và liên kết PK/FK sau phân rã.")] }} toView={(frame) => { const state = frame.state; return { source: `${state.dataset}:${state.functionalDependencies.join("|")}`, operation: `${state.phase}:${state.normalForm}`, result: state.reconstructedFacts.length ? "all-source-facts-reconstructed" : `${state.relations.length}-relation-state`, receipts: [{ label: tx("Diagnosis", "Chẩn đoán"), value: state.diagnosis }, { label: tx("Normal form", "Dạng chuẩn"), value: state.normalForm }, { label: tx("Primary keys", "Primary keys"), value: state.primaryKeys }, { label: tx("Foreign keys", "Foreign keys"), value: state.foreignKeys }, { label: tx("Provenance map", "Bản đồ truy vết"), value: state.provenanceMap }, { label: tx("Reconstructed facts", "Dữ kiện tái dựng"), value: state.reconstructedFacts }, { label: tx("Anomaly evidence", "Bằng chứng anomaly"), value: state.anomalyEvidence }], tables: state.relations.map((entry) => ({ title: tx(entry.name, entry.name), rows: tableRows(entry.rows) })) }; }} />;
}

function L47Lab({ locale }: { readonly locale: Paper1Locale }) {
  const [packet, setPacket] = useState<L47Packet>("developer_schema_change"); const frames = l47DbmsControlFrames(packet); const final = frames.at(-1)!.state;
  const toolChoices = [{ id: "developer-interface", label: tx("Developer interface", "Developer interface") }, { id: "query-processor", label: tx("Query processor", "Query processor") }, { id: "control", label: tx("Access, integrity or backup control", "Kiểm soát access, integrity hoặc backup") }];
  const expected = final.tool === "developer-interface" || final.tool === "query-processor" ? final.tool : "control";
  return <Journey locale={locale} visualId="VIS-P1-L47" title={tx("DBMS responsibility and control bench", "Bàn trách nhiệm và kiểm soát DBMS")} intro={tx("Route a coherent request to its responsible role, tool or control and inspect evidence of success and its limitation.", "Chuyển một yêu cầu nhất quán tới role, tool hoặc control chịu trách nhiệm và kiểm tra bằng chứng thành công cùng giới hạn.")} stateKey={packet} onReset={() => setPacket("developer_schema_change")} frames={frames} controls={<SelectControl id={`l47-packet-${locale}`} label={tx("Request packet", "Gói yêu cầu")} value={packet} values={L47_PACKETS} labels={PACKET_LABELS} onChange={setPacket} />} sourceFacts={[{ label: tx("Actor", "Vai trò"), value: frames[0].state.role }, { label: tx("Request", "Yêu cầu"), value: frames[0].state.request }, { label: tx("Protected asset", "Tài sản được bảo vệ"), value: frames[0].state.protectedAsset }]} prediction={{ prompt: tx("Which DBMS tool or control owns the request's main action?", "Tool hoặc control DBMS nào chịu trách nhiệm chính cho yêu cầu?"), choices: toolChoices, expectedChoiceId: expected, rubric: [tx("Separate database, DBMS and actor roles.", "Phân biệt database, DBMS và vai trò người dùng."), tx("Distinguish developer interface from query processor.", "Phân biệt developer interface và query processor."), tx("State why access, integrity and recovery evidence are different.", "Nêu vì sao bằng chứng access, integrity và recovery khác nhau.")] }} toView={(frame) => { const state = frame.state; return { source: `${state.role}:${state.request}`, operation: `${state.revealedResponsibility}:${state.revealedTool}`, result: state.revealedEvidence[0] ?? "evidence-pending", receipts: [{ label: tx("Dictionary entry", "Mục data dictionary"), value: state.dictionaryEntry }, { label: tx("Logical schema effect", "Ảnh hưởng logical schema"), value: state.logicalSchemaEffect }, { label: tx("Integrity control", "Kiểm soát integrity"), value: state.integrityControl }, { label: tx("Security control", "Kiểm soát security"), value: state.securityControl }, { label: tx("Backup evidence", "Bằng chứng backup"), value: state.backupEvidence }, { label: tx("Result / limitation", "Kết quả / giới hạn"), value: state.revealedEvidence }] }; }} />;
}

function L48Lab({ locale }: { readonly locale: Paper1Locale }) {
  const [fixture, setFixture] = useState<L48StatementFixture>("create_database"); const frames = l48SqlRoleFrames(fixture); const final = frames.at(-1)!.state;
  return <Journey locale={locale} visualId="VIS-P1-L48" title={tx("SQL role and target reader", "Trình đọc vai trò và mục tiêu SQL")} intro={tx("Classify one exact statement, trace its target and verify its structure, row or result effect without claiming a physical execution plan.", "Phân loại một câu lệnh chính xác, truy vết mục tiêu và kiểm chứng ảnh hưởng lên structure, row hoặc result mà không coi đó là physical execution plan.")} stateKey={fixture} onReset={() => setFixture("create_database")} frames={frames} controls={<SelectControl id={`l48-fixture-${locale}`} label={tx("Statement fixture", "Fixture câu lệnh")} value={fixture} values={L48_STATEMENT_FIXTURES} labels={SQL_ROLE_LABELS} onChange={setFixture} />} sourceFacts={[{ label: tx("Statement", "Câu lệnh"), value: frames[0].state.statement }, { label: tx("Declared starting structure", "Structure ban đầu đã khai báo"), value: frames[0].state.structureBefore }, { label: tx("Source rows", "Hàng nguồn"), value: frames[0].state.rowsBefore }]} prediction={{ prompt: tx("Which language role does this exact statement perform?", "Câu lệnh chính xác này thực hiện vai trò ngôn ngữ nào?"), choices: [{ id: "DDL", label: tx("DDL: create or modify structure", "DDL: tạo hoặc đổi structure") }, { id: "DML", label: tx("DML: query or maintain stored rows", "DML: truy vấn hoặc duy trì hàng dữ liệu") }], expectedChoiceId: final.languageRole, rubric: [tx("Name DDL or DML and the exact target.", "Nêu DDL hoặc DML và mục tiêu chính xác."), tx("Trace the schema, rows or result that changes.", "Truy vết schema, hàng hoặc kết quả thay đổi."), tx("Keep the logical teaching trace separate from a physical plan.", "Tách logical teaching trace khỏi physical plan.")] }} toView={(frame) => { const state = frame.state; return { source: state.statement, operation: `${state.revealedLanguageRole}:${state.revealedTarget}`, result: state.revealedEffect, receipts: [{ label: tx("Dialect", "Dialect"), value: state.dialect }, { label: tx("Matched rows", "Hàng thỏa"), value: state.matchedRows }, { label: tx("Structure before / after", "Structure trước / sau"), value: `${valueText(state.structureBefore)} → ${valueText(state.structureAfter)}` }, { label: tx("Evidence", "Bằng chứng"), value: state.revealedEffect }, { label: tx("Limitation", "Giới hạn"), value: state.limitation }], tables: [{ title: tx("Rows before", "Hàng trước"), rows: tableRows(state.rowsBefore) }, ...(state.phase === "verify-effect" && state.result.length ? [{ title: tx("Query result", "Kết quả truy vấn"), rows: tableRows(state.result) }] : []), ...(state.phase === "verify-effect" && state.rowsAfter.length ? [{ title: tx("Rows after", "Hàng sau"), rows: tableRows(state.rowsAfter) }] : [])] }; }} />;
}

function L49Lab({ locale }: { readonly locale: Paper1Locale }) {
  const [family, setFamily] = useState<L49DdlFamily>("create_database"); const [variant, setVariant] = useState<L49Validity>("valid"); const frames = l49DdlSchemaFrames(family, variant); const final = frames.at(-1)!.state;
  return <Journey locale={locale} visualId="VIS-P1-L49" title={tx("DDL schema builder", "Trình dựng schema bằng DDL")} intro={tx("Map one structural requirement to DDL tokens, inspect a prospective schema change and commit it only when the declared constraint check succeeds.", "Ánh xạ một yêu cầu cấu trúc tới token DDL, kiểm tra thay đổi schema dự kiến và chỉ commit khi ràng buộc đã khai báo hợp lệ.")} stateKey={`${family}-${variant}`} onReset={() => { setFamily("create_database"); setVariant("valid"); }} frames={frames} controls={<><SelectControl id={`l49-family-${locale}`} label={tx("DDL family", "Nhóm DDL")} value={family} values={L49_DDL_FAMILIES} labels={DDL_LABELS} onChange={setFamily} /><SelectControl id={`l49-variant-${locale}`} label={tx("Statement candidate", "Câu lệnh ứng viên")} value={variant} values={L49_VALIDITY_VARIANTS} labels={variantsAB} onChange={setVariant} /></>} sourceFacts={[{ label: tx("Requirement", "Yêu cầu"), value: frames[0].state.requirement }, { label: tx("Existing schema", "Schema hiện có"), value: frames[0].state.schemaBefore }, { label: tx("Candidate statement", "Câu lệnh ứng viên"), value: frames[0].state.statement }]} prediction={{ prompt: tx("Will the candidate commit the requested schema change in the declared teaching dialect?", "Ứng viên có commit thay đổi schema yêu cầu trong teaching dialect đã khai báo không?"), choices: [{ id: "commit", label: tx("Commit: syntax and declared constraint evidence are valid", "Commit: syntax và bằng chứng ràng buộc hợp lệ") }, { id: "reject", label: tx("Reject: one isolated declared fault prevents mutation", "Từ chối: một lỗi đã khai báo ngăn mutation") }], expectedChoiceId: final.valid ? "commit" : "reject", rubric: [tx("Use complete DDL syntax and the seven syllabus data types where required.", "Dùng syntax DDL đầy đủ và bảy data type syllabus khi cần."), tx("Verify PK/FK evidence against the declared schema.", "Kiểm chứng PK/FK theo schema đã khai báo."), tx("A rejected statement leaves committed schema unchanged.", "Câu lệnh bị từ chối giữ nguyên schema đã commit.")] }} toView={(frame) => { const state = frame.state; return { source: `${state.requirement}:${state.schemaBefore.join("|")}`, operation: state.statement, result: state.phase === "verify-constraint" ? state.valid ? "schema-change-committed" : `rejected:${state.errorReason}` : "prospective-change-only", receipts: [{ label: tx("DDL tokens", "Token DDL"), value: state.tokens }, { label: tx("Data types", "Data type"), value: state.dataTypes }, { label: tx("Prospective schema", "Schema dự kiến"), value: state.prospectiveSchema }, { label: tx("Constraint check", "Kiểm tra ràng buộc"), value: state.constraintCheck }, { label: tx("Committed schema", "Schema đã commit"), value: state.schemaAfter }, { label: tx("Declared faults", "Lỗi đã khai báo"), value: state.declaredFaults }, { label: tx("Dialect", "Dialect"), value: state.dialect }] }; }} />;
}

function L50Lab({ locale }: { readonly locale: Paper1Locale }) {
  const [packet, setPacket] = useState<L50Packet>("select_from_where"); const frames = l50DmlTraceFrames(packet); const final = frames.at(-1)!.state; const queryPackets: readonly L50Packet[] = ["select_from_where", "order_by", "group_by_count", "sum_avg", "inner_join_two_tables"];
  return <Journey locale={locale} visualId="VIS-P1-L50" title={tx("DML row and result tracer", "Trình truy vết hàng và kết quả DML")} intro={tx("Trace one original SQL packet through source, match, transform and result while preserving the exact source rows for Back.", "Truy vết một gói SQL gốc qua source, match, transform và result đồng thời giữ hàng nguồn chính xác cho nút Quay lại.")} stateKey={packet} onReset={() => setPacket("select_from_where")} frames={frames} controls={<SelectControl id={`l50-packet-${locale}`} label={tx("Statement packet", "Gói câu lệnh")} value={packet} values={L50_STATEMENT_PACKETS} labels={DML_LABELS} onChange={setPacket} />} sourceFacts={[{ label: tx("Statement", "Câu lệnh"), value: frames[0].state.statement }, { label: tx("Source tables", "Bảng nguồn"), value: frames[0].state.sourceTables }, { label: tx("Parameters", "Tham số"), value: frames[0].state.parameters }]} prediction={{ prompt: tx("What observable output should this packet produce?", "Gói này phải tạo output quan sát được nào?"), choices: [{ id: "query", label: tx("A query result; source rows remain unchanged", "Một kết quả truy vấn; hàng nguồn không đổi") }, { id: "mutation", label: tx("A committed row after-state; table schema remains", "Trạng thái hàng sau khi commit; schema bảng vẫn còn") }, { id: "drop", label: tx("The table structure is dropped", "Structure của bảng bị drop") }], expectedChoiceId: queryPackets.includes(packet) ? "query" : "mutation", rubric: [tx("Name exact matching or affected row IDs.", "Nêu ID hàng thỏa hoặc bị ảnh hưởng chính xác."), tx("Derive aggregates only from displayed inputs.", "Tính aggregate chỉ từ input đã hiển thị."), tx("Keep the two-table limit and explain DELETE without WHERE correctly.", "Giữ giới hạn hai bảng và giải thích đúng DELETE không WHERE.")] }} toView={(frame) => { const state = frame.state; const result = state.phase === "result" ? state.resultRows.length ? "query-result-ready" : `row-after-state:${state.rowsAfter.length}` : state.revealedMatches.length ? `matched:${state.revealedMatches.join(",")}` : "trace-pending"; return { source: state.statement, operation: `${state.phase}:${state.sourceTables.join("+")}`, result, receipts: [{ label: tx("Join pairs", "Cặp join"), value: state.joinPairs }, { label: tx("Matching rows", "Hàng thỏa"), value: state.revealedMatches }, { label: tx("Group / aggregate inputs", "Group / input aggregate"), value: `${valueText(state.groupKeys)} · ${valueText(state.aggregateInputs)}` }, { label: tx("Projected / sort columns", "Cột project / sort"), value: `${valueText(state.projectedColumns)} · ${valueText(state.sortKeys)}` }, { label: tx("Affected rows", "Hàng bị ảnh hưởng"), value: state.affectedRowIds }, { label: tx("Evidence", "Bằng chứng"), value: state.evidence }, { label: tx("Dialect boundary", "Giới hạn dialect"), value: state.dialect }], tables: [{ title: tx("Source rows", "Hàng nguồn"), rows: tableRows(state.sourceRows) }, ...(state.revealedResultRows.length ? [{ title: tx("Result rows", "Hàng kết quả"), rows: tableRows(state.revealedResultRows) }] : []), ...(state.phase === "result" && !state.resultRows.length ? [{ title: tx("Rows after", "Hàng sau"), rows: tableRows(state.revealedRowsAfter) }] : [])] }; }} />;
}

export function Chapter8VisualLab({ lessonId, locale }: { readonly lessonId: string; readonly locale: Paper1Locale }) {
  if (lessonId === "P1-L44") return <L44Lab locale={locale} />;
  if (lessonId === "P1-L45") return <L45Lab locale={locale} />;
  if (lessonId === "P1-L46") return <L46Lab locale={locale} />;
  if (lessonId === "P1-L47") return <L47Lab locale={locale} />;
  if (lessonId === "P1-L48") return <L48Lab locale={locale} />;
  if (lessonId === "P1-L49") return <L49Lab locale={locale} />;
  if (lessonId === "P1-L50") return <L50Lab locale={locale} />;
  return null;
}

export const chapter8VisualLessonIds: readonly string[] = ["P1-L44", "P1-L45", "P1-L46", "P1-L47", "P1-L48", "P1-L49", "P1-L50"];
