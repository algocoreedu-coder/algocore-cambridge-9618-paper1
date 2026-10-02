import Link from "next/link";
import { ArrowLeft, Clock3, Map } from "lucide-react";
import { paper1Href } from "@/app/lib/paper1/href";
import type { Paper1Catalog, Paper1Locale, Paper1Topic } from "@/app/lib/paper1/types";
import { Paper1LocaleBoundary } from "./Paper1LocaleBoundary";
import styles from "./Paper1Learning.module.css";

export function TopicPreview({ catalog, topic, locale }: { readonly catalog: Paper1Catalog; readonly topic: Paper1Topic; readonly locale: Paper1Locale }) {
  const section = catalog.sections.find((entry) => entry.id === topic.sectionId);
  const strand = catalog.strands.find((entry) => entry.id === topic.strandId);
  return <article className={styles.page} lang={locale} data-paper1-preview={topic.lessonId}>
    <Paper1LocaleBoundary locale={locale} />
    <nav className={styles.breadcrumb} aria-label={locale === "vi" ? "Vị trí trong khóa học" : "Breadcrumb"}><Link href={paper1Href("/paper-1", locale)}><Map size={16} />{locale === "vi" ? "Bản đồ học tập" : "Study map"}</Link><span>/</span><Link href={paper1Href(`/paper-1/sections/${topic.sectionId}`, locale)}>Section {topic.sectionId}</Link><span>/</span><span aria-current="page">{topic.lessonId}</span></nav>
    <header className={styles.sectionHero}><div><span>{topic.order}</span><Clock3 size={34} /></div><section><p className={styles.eyebrow}>PAPER 1 / {strand?.id}</p><h1>{topic.title[locale]}</h1><p>{topic.summary[locale]}</p></section></header>
    <section className={styles.planned}>
      <span className={styles.plannedBadge}>{locale === "vi" ? "BẢN XEM TRƯỚC" : "PREVIEW"}</span>
      <h2>{locale === "vi" ? "Bài này chưa được mở" : "This lesson is not open yet"}</h2>
      <p>{locale === "vi" ? "Bài học chỉ được mở sau khi nội dung, visual và câu hỏi đã qua đủ các cổng review. Trạng thái này do release manifest quyết định." : "The lesson opens only after its content, visual and assessments pass every review gate. The release manifest controls this status."}</p>
      <p><strong>{locale === "vi" ? "Phạm vi dự kiến: " : "Planned scope: "}</strong>{section?.title[locale]} · {strand?.title[locale]}</p>
      <Link className={styles.secondaryLink} href={paper1Href(`/paper-1/sections/${topic.sectionId}`, locale)}><ArrowLeft size={17} />{locale === "vi" ? "Về danh sách bài" : "Back to lesson list"}</Link>
    </section>
  </article>;
}
