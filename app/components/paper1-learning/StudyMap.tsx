"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileCheck2, Layers3, Map as MapIcon, Search, X } from "lucide-react";
import { SegmentedControl } from "@/app/components/algocore-ui";
import { paper1Href } from "@/app/lib/paper1/href";
import type { Paper1Catalog, Paper1Locale, Paper1ReleaseState } from "@/app/lib/paper1/types";
import { Paper1LocaleBoundary } from "./Paper1LocaleBoundary";
import styles from "./Paper1Learning.module.css";

function normalise(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d"); }

export function StudyMap({ catalog, releaseStates, locale }: { readonly catalog: Paper1Catalog; readonly releaseStates: Readonly<Record<string, Paper1ReleaseState>>; readonly locale: Paper1Locale }) {
  const [selectedId, setSelectedId] = useState("1");
  const [view, setView] = useState("map");
  const [query, setQuery] = useState("");
  const selected = catalog.sections.find((section) => section.id === selectedId) ?? catalog.sections[0];
  const openCount = catalog.topics.filter((topic) => releaseStates[topic.slug] === "available").length;
  const results = useMemo(() => {
    const terms = normalise(query.trim()).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return catalog.topics.filter((topic) => terms.every((term) => normalise([topic.lessonId, topic.title.en, topic.title.vi, topic.summary.en, topic.summary.vi, topic.searchTerms.join(" ")].join(" ")).includes(term)));
  }, [catalog, query]);

  return <div className={styles.page} lang={locale} data-paper1-map>
    <Paper1LocaleBoundary locale={locale} />
    <header className={styles.hero}><div className={styles.eyebrow}><span>{locale === "vi" ? "BẢN ĐỒ ÔN TẬP" : "YOUR REVISION AT A GLANCE"}</span><span>2026</span></div><h1>{locale === "vi" ? <>Nhìn thấy dữ liệu.<br /><em>Hiểu trọn Paper 1.</em></> : <>See the representation.<br /><em>Understand Paper 1.</em></>}</h1><p>{locale === "vi" ? `Khám phá tám phần của đề cương. ${openCount}/8 bài Chapter 1 đã qua release gate với minh họa tương tác và bài tự kiểm.` : `Explore all eight syllabus sections. ${openCount}/8 Chapter 1 lessons have passed the release gate with interactive visuals and self-checks.`}</p><div className={styles.facts}><span><Layers3 size={17} /><strong>8</strong> {locale === "vi" ? "phần" : "sections"}</span><span><CheckCircle2 size={17} /><strong>{openCount}/8</strong> {locale === "vi" ? "bài Chapter 1 đã mở" : "Chapter 1 lessons open"}</span><span><Clock3 size={17} />90 {locale === "vi" ? "phút" : "min"}</span><span><FileCheck2 size={17} />75 {locale === "vi" ? "điểm" : "marks"}</span></div></header>
    <p className={styles.availability}><CheckCircle2 size={18} />{locale === "vi" ? (openCount === 8 ? "Chapter 1 đã mở đủ tám bài. Chapter 2–8 được ghi rõ là đang biên soạn." : `Chapter 1 hiện mở ${openCount}/8 bài; các bài còn lại chỉ hiện bản xem trước. Chapter 2–8 đang biên soạn.`) : (openCount === 8 ? "All eight Chapter 1 lessons are open. Chapters 2–8 are clearly marked as planned." : `${openCount}/8 Chapter 1 lessons are open; the rest show preview pages. Chapters 2–8 are planned.`)}</p>
    <section className={styles.search} aria-labelledby="paper1-search-label"><label id="paper1-search-label" htmlFor="paper1-search">{locale === "vi" ? "Bạn muốn ôn kiến thức nào?" : "What do you want to revise?"}</label><div><Search size={20} /><input id="paper1-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "vi" ? "Tìm bit, BCD, bitmap, sampling…" : "Search bit, BCD, bitmap, sampling…"} />{query && <button type="button" onClick={() => setQuery("")} aria-label={locale === "vi" ? "Xóa tìm kiếm" : "Clear search"}><X size={18} /></button>}</div></section>
    {query.trim() ? <section className={styles.results} aria-label={locale === "vi" ? "Kết quả tìm kiếm" : "Search results"}><h2>{results.length} {locale === "vi" ? "bài phù hợp" : "matching lessons"}</h2>{results.map((topic) => { const available = releaseStates[topic.slug] === "available"; return <Link key={topic.lessonId} className={styles.topicRow} href={paper1Href(`/paper-1/topics/${topic.slug}`, locale)}><span>{String(topic.order).padStart(2,"0")}</span><span><strong>{topic.title[locale]}</strong><small>{topic.summary[locale]}</small>{!available && <em>{locale === "vi" ? "Bản xem trước · chưa mở" : "Preview · not yet open"}</em>}</span><ArrowRight size={18} /></Link>; })}</section> : <section className={styles.mapSection} aria-labelledby="paper1-map-heading"><div className={styles.blockHeading}><div><span>{locale === "vi" ? "8 PHẦN · MỘT LỘ TRÌNH" : "8 SECTIONS · ONE ROUTE"}</span><h2 id="paper1-map-heading">{locale === "vi" ? "Bản đồ học tập" : "Study map"}</h2></div><SegmentedControl label={locale === "vi" ? "Cách xem" : "View"} value={view} onChange={setView} segments={[{ id: "map", label: locale === "vi" ? "Sơ đồ" : "Map" }, { id: "list", label: locale === "vi" ? "Danh sách" : "List" }]} /></div><div className={styles.mapWorkspace}><div className={styles.nodeGrid} data-view={view}>{catalog.sections.map((section) => <button key={section.id} type="button" onClick={() => setSelectedId(section.id)} aria-pressed={selected.id === section.id} className={styles.mapNode}><span><b>{section.id}</b>{section.status === "available" ? (locale === "vi" ? "Đã mở" : "Open") : (locale === "vi" ? "Dự kiến" : "Planned")}</span><strong>{section.title[locale]}</strong><small>{section.id === "1" ? (locale === "vi" ? `8 bài · ${openCount} đã mở` : `8 lessons · ${openCount} open`) : (locale === "vi" ? "Đang biên soạn" : "In preparation")}</small></button>)}</div><aside className={styles.sectionDetail}><span className={styles.sectionNumber}>SECTION {selected.id}</span><h3>{selected.title[locale]}</h3><p className={styles.bigQuestion}>{selected.question[locale]}</p><p>{selected.summary[locale]}</p><Link className={styles.primaryLink} href={paper1Href(`/paper-1/sections/${selected.id}`, locale)}>{selected.status === "available" ? (locale === "vi" ? `Mở ${openCount} bài học` : `Open ${openCount} lessons`) : (locale === "vi" ? "Xem phạm vi dự kiến" : "View planned scope")}<ArrowRight size={18} /></Link></aside></div></section>}
  </div>;
}
