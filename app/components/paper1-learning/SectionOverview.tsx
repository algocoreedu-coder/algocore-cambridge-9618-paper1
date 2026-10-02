"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Images, Map, NotebookPen } from "lucide-react";
import { paper1Href } from "@/app/lib/paper1/href";
import type { Paper1Catalog, Paper1Locale, Paper1ReleaseState } from "@/app/lib/paper1/types";
import { Paper1LocaleBoundary } from "./Paper1LocaleBoundary";
import { paper1ProgressLabel, usePaper1Progress } from "./usePaper1Progress";
import styles from "./Paper1Learning.module.css";

export function SectionOverview({ catalog, releaseStates, sectionId, locale }: { readonly catalog: Paper1Catalog; readonly releaseStates: Readonly<Record<string, Paper1ReleaseState>>; readonly sectionId: string; readonly locale: Paper1Locale }) {
  const section = catalog.sections.find((entry) => entry.id === sectionId);
  const topics = catalog.topics.filter((entry) => entry.sectionId === sectionId);
  const progress = usePaper1Progress(topics);
  if (!section) return null;
  const openCount = topics.filter((topic) => releaseStates[topic.slug] === "available").length;
  const reviewedCount = topics.filter((topic) => progress[topic.lessonId]?.status === "reviewed").length;
  const strands = catalog.strands.filter((entry) => entry.sectionId === sectionId);

  return <div className={styles.page} lang={locale} data-paper1-section={section.id}>
    <Paper1LocaleBoundary locale={locale} />
    <nav className={styles.breadcrumb} aria-label={locale === "vi" ? "Vị trí trong khóa học" : "Breadcrumb"}><Link href={paper1Href("/paper-1", locale)}><Map size={16} />{locale === "vi" ? "Bản đồ học tập" : "Study map"}</Link><span>/</span><span aria-current="page">Section {section.id}</span></nav>
    <header className={styles.sectionHero}><div><span>{section.id}</span><BookOpen size={34} /></div><section><p className={styles.eyebrow}>PAPER 1 / SECTION {section.id}</p><h1>{section.title[locale]}</h1><p>{section.summary[locale]}</p></section></header>
    <div className={styles.sectionQuestion}><span>{locale === "vi" ? "CÂU HỎI LỚN" : "THE BIG QUESTION"}</span><p>{section.question[locale]}</p></div>
    {section.status === "planned" ? <section className={styles.planned}><ClockCopy locale={locale} /><Link className={styles.secondaryLink} href={paper1Href("/paper-1", locale)}><ArrowLeft size={17} />{locale === "vi" ? "Về Bản đồ học tập" : "Back to Study Map"}</Link></section> : <>
      <div className={styles.statusLegend} aria-label={locale === "vi" ? "Chú giải trạng thái" : "Status legend"}><p><strong>{locale === "vi" ? "Nội dung:" : "Availability:"}</strong> {openCount}/8 {locale === "vi" ? "bài đã mở" : "lessons open"}</p><p><strong>{locale === "vi" ? "Tiến độ của bạn:" : "Your progress:"}</strong> {reviewedCount}/8 {locale === "vi" ? "bài đã ôn và đối chiếu" : "lessons reviewed"}</p><small>{locale === "vi" ? "Đã mở là trạng thái phát hành. Tiến độ được tính riêng từ hoạt động của bạn." : "Open is a release state. Your learning progress is tracked separately."}</small></div>
      <section className={styles.sectionRoute} aria-labelledby="paper1-section-route"><div className={styles.blockHeading}><div><span>{locale === "vi" ? "LỘ TRÌNH CHAPTER 1" : "CHAPTER 1 ROUTE"}</span><h2 id="paper1-section-route">{locale === "vi" ? `${openCount}/8 bài đã mở · 3 mục syllabus` : `${openCount}/8 lessons open · 3 syllabus strands`}</h2></div></div><nav>{strands.map((strand) => <a href={`#strand-${strand.id.replace(".", "-")}`} key={strand.id}><span>{strand.id}</span><strong>{strand.title[locale]}</strong><small>{topics.filter((topic) => topic.strandId === strand.id && releaseStates[topic.slug] === "available").length}/{topics.filter((topic) => topic.strandId === strand.id).length} {locale === "vi" ? "bài đã mở" : "lessons open"}</small></a>)}</nav></section>
      <nav className={styles.chapterTools} aria-label={locale === "vi" ? "Tài nguyên Chapter 1" : "Chapter 1 resources"}><Link href={paper1Href("/paper-1/atlas", locale)}><Images size={20} /><span><strong>{locale === "vi" ? "Tài liệu hình minh họa Chapter 1" : "Chapter 1 visual reference"}</strong><small>{locale === "vi" ? "Lọc và xem từng hình tham khảo" : "Filter and inspect one reference at a time"}</small></span><ArrowRight size={18} /></Link><Link href={paper1Href("/paper-1/practice", locale)}><NotebookPen size={20} /><span><strong>{locale === "vi" ? "Luyện tập tổng hợp Chapter 1" : "Chapter 1 mixed practice"}</strong><small>{locale === "vi" ? "Guided → faded → independent" : "Guided → faded → independent"}</small></span><ArrowRight size={18} /></Link></nav>
      <div className={styles.strandGroups}>{strands.map((strand) => <section id={`strand-${strand.id.replace(".", "-")}`} className={styles.strandGroup} key={strand.id}><header><span>{strand.id}</span><h2>{strand.title[locale]}</h2></header><div>{topics.filter((topic) => topic.strandId === strand.id).map((topic) => {
        const prereq = topic.prerequisiteLessonIds.map((id) => catalog.topics.find((entry) => entry.lessonId === id)).filter(Boolean);
        const available = releaseStates[topic.slug] === "available";
        const learner = progress[topic.lessonId];
        const href = paper1Href(`/paper-1/topics/${topic.slug}`, locale, available ? learner?.resumeHash ?? "" : "");
        return <Link key={topic.lessonId} className={styles.topicRow} href={href}><span>{String(topic.order).padStart(2,"0")}</span><span><strong>{topic.title[locale]}</strong><small>{topic.summary[locale]}</small>{!available && <em>{locale === "vi" ? "Bản xem trước · chưa mở" : "Preview · not yet open"}</em>}{available && <em data-progress={learner?.status ?? "not-started"}>{paper1ProgressLabel(learner?.status ?? "not-started", locale)}{learner?.status === "in-progress" ? ` · ${locale === "vi" ? "Tiếp tục" : "Resume"}` : ""}</em>}{available && prereq.length > 0 && <em>{locale === "vi" ? "Nên học trước: " : "Recommended first: "}{prereq.map((entry) => entry?.title[locale]).join(", ")}</em>}</span><ArrowRight size={18} /></Link>;
      })}</div></section>)}</div>
    </>}
  </div>;
}

function ClockCopy({ locale }: { readonly locale: Paper1Locale }) {
  return <><span className={styles.plannedBadge}>{locale === "vi" ? "ĐANG BIÊN SOẠN" : "PLANNED"}</span><h2>{locale === "vi" ? "Phần này chưa được mở" : "This section is not open yet"}</h2><p>{locale === "vi" ? "Phạm vi đã có trong bản đồ để bạn thấy toàn bộ Paper 1. Bài học và minh họa sẽ chỉ mở sau khi hoàn tất review." : "The scope appears on the map so you can see the whole of Paper 1. Lessons and visuals will open only after review."}</p></>;
}
