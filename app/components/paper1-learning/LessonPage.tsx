import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Brain, CheckCircle2, Eye, Lightbulb, Map, RotateCcw, Target } from "lucide-react";
import { Callout, Card, Disclosure } from "@/app/components/algocore-ui";
import { paper1Href } from "@/app/lib/paper1/href";
import type { Paper1Catalog, Paper1Lesson, Paper1Locale } from "@/app/lib/paper1/types";
import { getPaper1VisualDefinition } from "@/app/lib/paper1/visual-registry";
import { LessonCheckpoints } from "./LessonCheckpoints";
import { LessonStageRail } from "./LessonStageRail";
import { Paper1LocaleBoundary } from "./Paper1LocaleBoundary";
import { Paper1VisualLab } from "./Paper1VisualLab";
import { InstructionalVisuals, LessonReferenceDisclosure } from "./AtlasReferenceGallery";
import styles from "./LessonPage.module.css";

export function TopicLesson({ lesson, catalog, locale }: { readonly lesson: Paper1Lesson; readonly catalog: Paper1Catalog; readonly locale: Paper1Locale }) {
  const topic = catalog.topics.find((entry) => entry.lessonId === lesson.lessonId);
  const index = catalog.topics.findIndex((entry) => entry.lessonId === lesson.lessonId);
  const previous = catalog.topics[index - 1];
  const next = catalog.topics[index + 1];
  const prerequisites = lesson.prerequisiteLessonIds.map((id) => catalog.topics.find((entry) => entry.lessonId === id)).filter(Boolean);
  const related = lesson.relatedSlugs.map((slug) => catalog.topics.find((entry) => entry.slug === slug)).filter(Boolean);
  const visual = getPaper1VisualDefinition(lesson.visualId);
  const assessmentVersion = "assessmentVersion" in lesson && typeof lesson.assessmentVersion === "string" ? lesson.assessmentVersion : lesson.contentVersion;
  if (!visual || visual.lessonId !== lesson.lessonId) throw new Error(`Paper 1 visual contract mismatch for ${lesson.lessonId}`);

  return <article className={styles.lesson} lang={locale} data-paper1-lesson={lesson.lessonId}>
    <Paper1LocaleBoundary locale={locale} />
    <nav className={styles.breadcrumb} aria-label={locale === "vi" ? "Vị trí trong khóa học" : "Breadcrumb"}><Link href={paper1Href("/paper-1", locale)}><Map size={16} />{locale === "vi" ? "Bản đồ học tập" : "Study map"}</Link><span>/</span><Link href={paper1Href("/paper-1/sections/1", locale)}>Section 1</Link><span>/</span><span aria-current="page">{lesson.lessonId}</span></nav>
    <header className={styles.header}><div className={styles.eyebrow}><span>{lesson.lessonId}</span><span>§ {lesson.strandId}</span><span>{topic?.learningMode}</span></div><h1>{lesson.title[locale]}</h1><p className={styles.centralQuestion}>{lesson.question[locale]}</p><p>{lesson.opening[locale]}</p></header>
    <LessonStageRail lessonId={lesson.lessonId} locale={locale} />

    <section className={styles.objectiveGrid} aria-label={locale === "vi" ? "Mục tiêu và kiến thức cần trước" : "Objectives and prerequisites"}>
      <div><span className={styles.kicker}><Target size={16} />{locale === "vi" ? "MỤC TIÊU SYLLABUS" : "SYLLABUS OBJECTIVES"}</span><ul>{lesson.objectives.map((objective) => <li key={objective.id}><strong>{objective.id}</strong>{objective.text[locale]}</li>)}</ul></div>
      <aside><span className={styles.kicker}><BookOpen size={16} />{locale === "vi" ? "TRƯỚC KHI HỌC" : "BEFORE YOU START"}</span>{prerequisites.length ? prerequisites.map((entry) => <Link key={entry?.lessonId} href={paper1Href(`/paper-1/topics/${entry?.slug}`, locale)}>{locale === "vi" ? "Nên học trước: " : "Recommended first: "}<strong>{entry?.title[locale]}</strong></Link>) : <p>{locale === "vi" ? "Không có bài bắt buộc trước." : "No required prerequisite lesson."}</p>}<small>{lesson.requirementIds.length} {locale === "vi" ? "yêu cầu nguyên tử được dạy và kiểm" : "atomic requirements taught and checked"}</small></aside>
    </section>

    <section id="understand" className={styles.chapter}><SectionHeading icon={<Brain />} number="01" title={locale === "vi" ? "Hiểu mô hình" : "Understand the model"} subtitle={locale === "vi" ? "Khái niệm, quy tắc, giả định và giới hạn" : "Concepts, rules, assumptions and limits"} />
      <div className={styles.theory}>{lesson.theory.map((block) => <section id={block.id} key={block.id}><h3>{block.title[locale]}</h3>{block.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph[locale]}</p>)}{block.bullets && <ul>{block.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet[locale]}</li>)}</ul>}</section>)}</div>
      <InstructionalVisuals lessonId={lesson.lessonId} stage="understand" locale={locale} />
    </section>

    <section id="observe" className={styles.chapter}><SectionHeading icon={<Eye />} number="02" title={locale === "vi" ? "Quan sát cơ chế" : "Observe the mechanism"} subtitle={locale === "vi" ? "Dự đoán, đổi input và đi từng bước" : "Predict, change the input and step through"} /><Paper1VisualLab lessonId={lesson.lessonId} locale={locale} /><aside className={styles.visualHandoff}><div><strong>{locale === "vi" ? "Bạn sẽ làm gì" : "Learner action"}</strong><p>{visual.learnerAction[locale]}</p></div><div><strong>{locale === "vi" ? "Kết quả cần quan sát" : "Observable outcome"}</strong><p>{visual.observableOutcome[locale]}</p></div><Disclosure summary={locale === "vi" ? "Phạm vi và giới hạn của mô hình" : "Model scope and limitations"}><p><strong>{locale === "vi" ? "Phạm vi: " : "Scope: "}</strong>{visual.modelScope[locale]}</p><p><strong>{locale === "vi" ? "Giới hạn: " : "Limitations: "}</strong>{visual.modelLimitations[locale]}</p></Disclosure></aside></section>

    <section id="worked-example" className={styles.chapter}><SectionHeading icon={<Lightbulb />} number="03" title={locale === "vi" ? "Ví dụ mẫu" : "Worked example"} subtitle={locale === "vi" ? "Theo một lời giải có giải thích" : "Follow a fully explained solution"} /><Card title={lesson.workedExample.title[locale]} headingLevel={3} variant="lesson"><p className={styles.examplePrompt}>{lesson.workedExample.prompt[locale]}</p><ol className={styles.workedSteps}>{lesson.workedExample.steps.map((step, stepIndex) => <li id={step.id} key={step.id}><span>{stepIndex + 1}</span><div><strong>{step.action[locale]}</strong><p>{step.result[locale]}</p></div></li>)}</ol><div className={styles.exampleResult}><CheckCircle2 size={19} />{lesson.workedExample.result[locale]}</div></Card><InstructionalVisuals lessonId={lesson.lessonId} stage="worked-example" locale={locale} /></section>

    <section id="recognise" className={styles.chapter}><SectionHeading icon={<AlertTriangle />} number="04" title={locale === "vi" ? "Nhận diện dạng bài" : "Recognise the question"} subtitle={locale === "vi" ? "Dấu hiệu, phương pháp và lỗi thường gặp" : "Cues, method and common errors"} /><div className={styles.recognitionGrid}><Card title={locale === "vi" ? "Dấu hiệu và phương pháp" : "Cues and method"} headingLevel={3}><ul>{lesson.recognition.cues.map((cue, indexCue) => <li key={indexCue}>{cue[locale]}</li>)}</ul><ol>{lesson.recognition.method.map((method, methodIndex) => <li key={methodIndex}>{method[locale]}</li>)}</ol></Card><Card title={locale === "vi" ? "Sửa hiểu lầm" : "Repair misconceptions"} headingLevel={3} variant="warning">{lesson.recognition.misconceptions.map((item, itemIndex) => <div className={styles.misconception} key={itemIndex}><strong>{item.mistake[locale]}</strong><p>{item.correction[locale]}</p></div>)}</Card></div><InstructionalVisuals lessonId={lesson.lessonId} stage="recognise" locale={locale} /></section>

    <section id="check" className={styles.chapter}><SectionHeading icon={<CheckCircle2 />} number="05" title={locale === "vi" ? "Tự kiểm" : "Check your understanding"} subtitle={locale === "vi" ? "Lời giải mở ngay; trạng thái xem được ghi trung thực" : "Solutions are immediate; reveal state is recorded honestly"} /><Callout title={locale === "vi" ? "Cách ghi tiến độ" : "How progress is recorded"} icon={<Target />}><p>{locale === "vi" ? "Mở gợi ý hoặc lời giải không tạo trạng thái Reviewed. Câu xác định cần từng được làm đúng; câu mở cần một lần nộp và xác nhận đã tự đối chiếu rubric." : "Opening a hint or solution does not create Reviewed status. Deterministic questions need a correct attempt; open responses need a submission and explicit rubric-review confirmation."}</p></Callout><LessonCheckpoints key={`${lesson.lessonId}:${assessmentVersion}`} lessonId={lesson.lessonId} assessmentVersion={assessmentVersion} assessments={lesson.assessments} locale={locale} /></section>

    <section id="recall" className={styles.chapter}><SectionHeading icon={<RotateCcw />} number="06" title={locale === "vi" ? "Nhớ lại không nhìn bài" : "Recall without looking"} subtitle={locale === "vi" ? "Tự trả lời trước, rồi mở các ý chính" : "Answer first, then reveal the key points"} /><div className={styles.recall}><p>{lesson.recall.prompt[locale]}</p><Disclosure summary={locale === "vi" ? "Mở các ý cần nhớ" : "Reveal the recall points"}><ul>{lesson.recall.answerPoints.map((point, pointIndex) => <li key={pointIndex}>{point[locale]}</li>)}</ul></Disclosure></div><LessonReferenceDisclosure lessonId={lesson.lessonId} locale={locale} /></section>

    <section className={styles.referenceGrid}><div><h2>{locale === "vi" ? "Thuật ngữ" : "Glossary"}</h2><dl>{lesson.glossary.map((entry) => <div key={entry.term}><dt>{entry.term}</dt><dd>{entry.meaning[locale]}</dd></div>)}</dl></div><div><h2>{locale === "vi" ? "Nguồn và provenance" : "Sources and provenance"}</h2>{lesson.sources.map((source) => <div className={styles.source} key={source.id}><strong>{source.title[locale]}</strong><span>{source.locator}</span><small>{source.kind === "algocore" ? (locale === "vi" ? "AlgoCore biên soạn · không phải câu hỏi Cambridge chính thức" : "AlgoCore authored · not an official Cambridge question") : source.kind}</small></div>)}</div></section>
    {related.length > 0 && <nav className={styles.related} aria-label={locale === "vi" ? "Bài liên quan" : "Related lessons"}><strong>{locale === "vi" ? "Bài liên quan" : "Related lessons"}</strong>{related.map((entry) => <Link key={entry?.lessonId} href={paper1Href(`/paper-1/topics/${entry?.slug}`, locale)}>{entry?.title[locale]}<ArrowRight size={16} /></Link>)}</nav>}
    <nav className={styles.lessonPager} aria-label={locale === "vi" ? "Chuyển bài" : "Lesson navigation"}>{previous ? <Link href={paper1Href(`/paper-1/topics/${previous.slug}`, locale)}><ArrowLeft size={18} /><span><small>{locale === "vi" ? "Bài trước" : "Previous"}</small>{previous.title[locale]}</span></Link> : <span />}{next ? <Link href={paper1Href(`/paper-1/topics/${next.slug}`, locale)}><span><small>{locale === "vi" ? "Bài tiếp" : "Next"}</small>{next.title[locale]}</span><ArrowRight size={18} /></Link> : <Link href={paper1Href("/paper-1/sections/1", locale)}><span><small>{locale === "vi" ? "Hoàn tất Chapter 1" : "Chapter 1 complete"}</small>{locale === "vi" ? "Về danh sách bài" : "Back to lesson list"}</span><ArrowRight size={18} /></Link>}</nav>
  </article>;
}

function SectionHeading({ icon, number, title, subtitle }: { readonly icon: React.ReactNode; readonly number: string; readonly title: string; readonly subtitle: string }) {
  return <header className={styles.sectionHeading}><span>{icon}</span><div><small>{number}</small><h2>{title}</h2><p>{subtitle}</p></div></header>;
}
