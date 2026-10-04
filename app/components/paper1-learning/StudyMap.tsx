"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileCheck2, Layers3, Search, X } from "lucide-react";
import { Button, SegmentedControl } from "@/app/components/algocore-ui";
import { paper1Href } from "@/app/lib/paper1/href";
import type { Paper1ProgressContract } from "@/app/lib/paper1/progress-contract";
import type { Paper1Catalog, Paper1Locale, Paper1ReleaseState, Paper1Topic } from "@/app/lib/paper1/types";
import { Paper1LocaleBoundary } from "./Paper1LocaleBoundary";
import { paper1ProgressLabel, usePaper1Progress } from "./usePaper1Progress";
import styles from "./Paper1Learning.module.css";

function normalise(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d"); }

export function StudyMap({ catalog, releaseStates, progressContracts, locale }: { readonly catalog: Paper1Catalog; readonly releaseStates: Readonly<Record<string, Paper1ReleaseState>>; readonly progressContracts: Readonly<Record<string, Paper1ProgressContract>>; readonly locale: Paper1Locale }) {
  const [selectedId, setSelectedId] = useState("1");
  const [view, setView] = useState("map");
  const [query, setQuery] = useState("");
  const progress = usePaper1Progress(catalog.topics, progressContracts);
  const selected = catalog.sections.find((section) => section.id === selectedId) ?? catalog.sections[0];
  const totalLessons = catalog.topics.length;
  const openCount = catalog.topics.filter((topic) => releaseStates[topic.slug] === "available").length;
  const availableSectionCount = catalog.sections.filter((section) => section.status === "available").length;
  const reviewedCount = catalog.topics.filter((topic) => progress[topic.lessonId]?.status === "reviewed").length;
  const selectedTopics = catalog.topics.filter((topic) => topic.sectionId === selected.id);
  const selectedOpenCount = selectedTopics.filter((topic) => releaseStates[topic.slug] === "available").length;
  const results = useMemo(() => {
    const terms = normalise(query.trim()).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return catalog.topics.filter((topic) => terms.every((term) => normalise([topic.lessonId, topic.title.en, topic.title.vi, topic.summary.en, topic.summary.vi, topic.searchTerms.join(" ")].join(" ")).includes(term)));
  }, [catalog, query]);

  const topicLink = (topic: Paper1Topic) => {
    const learner = progress[topic.lessonId];
    return paper1Href(`/paper-1/topics/${topic.slug}`, locale, releaseStates[topic.slug] === "available" ? learner?.resumeHash ?? "" : "");
  };

  return <div className={styles.page} lang={locale} data-paper1-map>
    <Paper1LocaleBoundary locale={locale} />
    <header className={styles.hero}>
      <div className={styles.eyebrow}><span>{locale === "vi" ? "BẢN ĐỒ ÔN TẬP" : "YOUR REVISION AT A GLANCE"}</span><span>2026</span></div>
      <h1>{locale === "vi" ? <>Nhìn thấy dữ liệu.<br /><em>Hiểu trọn Paper 1.</em></> : <>See the representation.<br /><em>Understand Paper 1.</em></>}</h1>
      <p>{locale === "vi" ? `Khám phá tám phần của đề cương. ${openCount}/${totalLessons} bài thuộc ${availableSectionCount}/8 phần đã qua release gate.` : `Explore all eight syllabus sections. ${openCount}/${totalLessons} lessons across ${availableSectionCount}/8 sections have passed the release gate.`}</p>
      <div className={styles.facts}><span><Layers3 size={17} /><strong>8</strong> {locale === "vi" ? "phần" : "sections"}</span><span><CheckCircle2 size={17} /><strong>{openCount}/{totalLessons}</strong> {locale === "vi" ? "bài đã mở" : "lessons open"}</span><span><Clock3 size={17} />90 {locale === "vi" ? "phút" : "min"}</span><span><FileCheck2 size={17} />75 {locale === "vi" ? "điểm" : "marks"}</span></div>
    </header>
    <div className={styles.statusLegend} aria-label={locale === "vi" ? "Chú giải trạng thái" : "Status legend"}>
      <p><strong>{locale === "vi" ? "Nội dung:" : "Availability:"}</strong> {openCount}/{totalLessons} {locale === "vi" ? "bài đã mở" : "lessons open"}</p>
      <p><strong>{locale === "vi" ? "Tiến độ của bạn:" : "Your progress:"}</strong> {reviewedCount}/{openCount} {locale === "vi" ? "bài đã ôn và đối chiếu" : "open lessons reviewed"}</p>
      <small>{locale === "vi" ? "Reviewed chỉ xuất hiện khi mọi câu xác định từng được làm đúng và mọi câu mở đã được nộp rồi xác nhận tự đối chiếu rubric." : "Reviewed requires a correct attempt for every deterministic checkpoint and a submitted, explicitly rubric-reviewed response for every open checkpoint."}</small>
      <small>{locale === "vi" ? "Tiến độ được lưu riêng cho phiên đăng nhập này trên trình duyệt. Đăng xuất sẽ bắt đầu một hồ sơ học cục bộ mới ở lần đăng nhập tiếp theo." : "Progress is private to this browser sign-in session. Signing out starts a new local learning record at the next sign-in."}</small>
    </div>
    <p className={styles.availability}><CheckCircle2 size={18} />{locale === "vi" ? (openCount === totalLessons ? `Đã mở đủ ${totalLessons} bài trong phạm vi hiện có.` : `Hiện mở ${openCount}/${totalLessons} bài thuộc ${availableSectionCount}/8 phần; các phần còn lại được ghi rõ là đang biên soạn.`) : (openCount === totalLessons ? `All ${totalLessons} lessons in the current scope are open.` : `${openCount}/${totalLessons} lessons across ${availableSectionCount}/8 sections are open; the remaining sections are clearly marked as planned.`)}</p>
    <section className={styles.search} aria-labelledby="paper1-search-label"><label id="paper1-search-label" htmlFor="paper1-search">{locale === "vi" ? "Bạn muốn ôn kiến thức nào?" : "What do you want to revise?"}</label><div><Search size={20} /><input id="paper1-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} placeholder={locale === "vi" ? "Tìm bit, bitmap, LAN, topology, DNS…" : "Search bit, bitmap, LAN, topology, DNS…"} />{query && <button type="button" onClick={() => setQuery("")} aria-label={locale === "vi" ? "Xóa tìm kiếm" : "Clear search"}><X size={18} /></button>}</div></section>
    {query.trim() ? <section className={styles.results} aria-label={locale === "vi" ? "Kết quả tìm kiếm" : "Search results"}>
      <h2 aria-live="polite">{results.length} {locale === "vi" ? "bài phù hợp" : "matching lessons"}</h2>
      {results.length === 0 ? <div className={styles.emptyResults}><Search size={28} aria-hidden="true" /><h3>{locale === "vi" ? "Không tìm thấy bài phù hợp" : "No matching lesson found"}</h3><p>{locale === "vi" ? "Hãy kiểm tra chính tả hoặc thử từ khóa như bit, bitmap, LAN, topology hay DNS." : "Check the spelling or try a term such as bit, bitmap, LAN, topology or DNS."}</p><Button variant="secondary" onClick={() => setQuery("")}><X size={17} />{locale === "vi" ? "Xóa tìm kiếm và về bản đồ" : "Clear search and return to map"}</Button></div> : results.map((topic) => {
        const available = releaseStates[topic.slug] === "available";
        const learner = progress[topic.lessonId];
        return <Link key={topic.lessonId} className={styles.topicRow} href={topicLink(topic)}><span>{String(topic.order).padStart(2,"0")}</span><span><strong>{topic.title[locale]}</strong><small>{topic.summary[locale]}</small>{available ? <em data-progress={learner?.status ?? "not-started"}>{paper1ProgressLabel(learner?.status ?? "not-started", locale)}{learner?.status === "in-progress" ? ` · ${locale === "vi" ? "Tiếp tục" : "Resume"}` : ""}</em> : <em>{locale === "vi" ? "Bản xem trước · chưa mở" : "Preview · not yet open"}</em>}</span><ArrowRight size={18} /></Link>;
      })}
    </section> : <section className={styles.mapSection} aria-labelledby="paper1-map-heading">
      <div className={styles.blockHeading}><div><span>{locale === "vi" ? "8 PHẦN · MỘT LỘ TRÌNH" : "8 SECTIONS · ONE ROUTE"}</span><h2 id="paper1-map-heading">{locale === "vi" ? "Bản đồ học tập" : "Study map"}</h2></div><SegmentedControl label={locale === "vi" ? "Cách xem" : "View"} value={view} onChange={setView} segments={[{ id: "map", label: locale === "vi" ? "Sơ đồ" : "Map" }, { id: "list", label: locale === "vi" ? "Danh sách" : "List" }]} /></div>
      <div className={styles.mapWorkspace}><div className={styles.nodeGrid} data-view={view}>{catalog.sections.map((section) => {
        const sectionTopics = catalog.topics.filter((topic) => topic.sectionId === section.id);
        const sectionOpen = sectionTopics.filter((topic) => releaseStates[topic.slug] === "available").length;
        const sectionReviewed = sectionTopics.filter((topic) => progress[topic.lessonId]?.status === "reviewed").length;
        return <button key={section.id} type="button" onClick={() => setSelectedId(section.id)} aria-pressed={selected.id === section.id} className={styles.mapNode}><span><b>{section.id}</b>{section.status === "available" ? (locale === "vi" ? "Đã mở" : "Open") : (locale === "vi" ? "Dự kiến" : "Planned")}</span><strong>{section.title[locale]}</strong><small>{sectionTopics.length ? (locale === "vi" ? `${sectionTopics.length} bài · ${sectionOpen} đã mở · ${sectionReviewed} đã ôn` : `${sectionTopics.length} lessons · ${sectionOpen} open · ${sectionReviewed} reviewed`) : (locale === "vi" ? "Đang biên soạn" : "In preparation")}</small></button>;
      })}</div><aside className={styles.sectionDetail}><span className={styles.sectionNumber}>SECTION {selected.id}</span><h3>{selected.title[locale]}</h3><p className={styles.bigQuestion}>{selected.question[locale]}</p><p>{selected.summary[locale]}</p><Link className={styles.primaryLink} href={paper1Href(`/paper-1/sections/${selected.id}`, locale)}>{selected.status === "available" ? (locale === "vi" ? `Mở ${selectedOpenCount} bài học` : `Open ${selectedOpenCount} lessons`) : (locale === "vi" ? "Xem phạm vi dự kiến" : "View planned scope")}<ArrowRight size={18} /></Link></aside></div>
    </section>}
  </div>;
}
