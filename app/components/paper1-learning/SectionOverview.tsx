import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Map } from "lucide-react";
import { paper1Href } from "@/app/lib/paper1/href";
import type { Paper1Catalog, Paper1Locale, Paper1ReleaseState } from "@/app/lib/paper1/types";
import { Paper1LocaleBoundary } from "./Paper1LocaleBoundary";
import styles from "./Paper1Learning.module.css";

export function SectionOverview({ catalog, releaseStates, sectionId, locale }: { readonly catalog: Paper1Catalog; readonly releaseStates: Readonly<Record<string, Paper1ReleaseState>>; readonly sectionId: string; readonly locale: Paper1Locale }) {
  const section = catalog.sections.find((entry) => entry.id === sectionId);
  if (!section) return null;
  const topics = catalog.topics.filter((entry) => entry.sectionId === sectionId);
  const openCount = topics.filter((topic) => releaseStates[topic.slug] === "available").length;
  const strands = catalog.strands.filter((entry) => entry.sectionId === sectionId);

  return <div className={styles.page} lang={locale} data-paper1-section={section.id}>
    <Paper1LocaleBoundary locale={locale} />
    <nav className={styles.breadcrumb} aria-label={locale === "vi" ? "Vị trí trong khóa học" : "Breadcrumb"}><Link href={paper1Href("/paper-1", locale)}><Map size={16} />{locale === "vi" ? "Bản đồ học tập" : "Study map"}</Link><span>/</span><span aria-current="page">Section {section.id}</span></nav>
    <header className={styles.sectionHero}><div><span>{section.id}</span><BookOpen size={34} /></div><section><p className={styles.eyebrow}>PAPER 1 / SECTION {section.id}</p><h1>{section.title[locale]}</h1><p>{section.summary[locale]}</p></section></header>
    <div className={styles.sectionQuestion}><span>{locale === "vi" ? "CÂU HỎI LỚN" : "THE BIG QUESTION"}</span><p>{section.question[locale]}</p></div>
    {section.status === "planned" ? <section className={styles.planned}><ClockCopy locale={locale} /><Link className={styles.secondaryLink} href={paper1Href("/paper-1", locale)}><ArrowLeft size={17} />{locale === "vi" ? "Về Study Map" : "Back to Study Map"}</Link></section> : <>
      <section className={styles.sectionRoute} aria-labelledby="paper1-section-route"><div className={styles.blockHeading}><div><span>{locale === "vi" ? "LỘ TRÌNH CHAPTER 1" : "CHAPTER 1 ROUTE"}</span><h2 id="paper1-section-route">{locale === "vi" ? `${openCount}/8 bài đã mở · 3 mục syllabus` : `${openCount}/8 lessons open · 3 syllabus strands`}</h2></div></div><nav>{strands.map((strand) => <a href={`#strand-${strand.id.replace(".", "-")}`} key={strand.id}><span>{strand.id}</span><strong>{strand.title[locale]}</strong><small>{topics.filter((topic) => topic.strandId === strand.id && releaseStates[topic.slug] === "available").length}/{topics.filter((topic) => topic.strandId === strand.id).length} {locale === "vi" ? "bài đã mở" : "lessons open"}</small></a>)}</nav></section>
      <div className={styles.strandGroups}>{strands.map((strand) => <section id={`strand-${strand.id.replace(".", "-")}`} className={styles.strandGroup} key={strand.id}><header><span>{strand.id}</span><h2>{strand.title[locale]}</h2></header><div>{topics.filter((topic) => topic.strandId === strand.id).map((topic) => { const prereq = topic.prerequisiteLessonIds.map((id) => catalog.topics.find((entry) => entry.lessonId === id)).filter(Boolean); const available = releaseStates[topic.slug] === "available"; return <Link key={topic.lessonId} className={styles.topicRow} href={paper1Href(`/paper-1/topics/${topic.slug}`, locale)}><span>{String(topic.order).padStart(2,"0")}</span><span><strong>{topic.title[locale]}</strong><small>{topic.summary[locale]}</small>{!available && <em>{locale === "vi" ? "Bản xem trước · chưa mở" : "Preview · not yet open"}</em>}{available && prereq.length > 0 && <em>{locale === "vi" ? "Nên học trước: " : "Recommended first: "}{prereq.map((entry) => entry?.title[locale]).join(", ")}</em>}</span><ArrowRight size={18} /></Link>; })}</div></section>)}</div>
    </>}
  </div>;
}

function ClockCopy({ locale }: { readonly locale: Paper1Locale }) {
  return <><span className={styles.plannedBadge}>{locale === "vi" ? "ĐANG BIÊN SOẠN" : "PLANNED"}</span><h2>{locale === "vi" ? "Phần này chưa được mở" : "This section is not open yet"}</h2><p>{locale === "vi" ? "Phạm vi đã có trong bản đồ để bạn thấy toàn bộ Paper 1. Bài học và minh họa sẽ chỉ mở sau khi hoàn tất review." : "The scope appears on the map so you can see the whole of Paper 1. Lessons and visuals will open only after review."}</p></>;
}
