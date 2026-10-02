"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Search, X } from "lucide-react";
import { Button, Select } from "@/app/components/algocore-ui";
import { paper1Href } from "@/app/lib/paper1/href";
import { getPaper1LearnerAtlasItems } from "@/app/lib/paper1/visual-placement-registry";
import type { Paper1Locale } from "@/app/lib/paper1/types";
import { AtlasImage, AtlasSourceMeta } from "./AtlasReferenceGallery";
import { Paper1LocaleBoundary } from "./Paper1LocaleBoundary";
import lessonStyles from "./LessonPage.module.css";
import styles from "./ChapterAtlas.module.css";

type Filter = "all" | "inline" | "reference" | "chapter";

export function ChapterAtlas({ locale, initialVisual }: { readonly locale: Paper1Locale; readonly initialVisual?: string }) {
  const items = getPaper1LearnerAtlasItems();
  const [query, setQuery] = useState("");
  const [lessonId, setLessonId] = useState("all");
  const [kind, setKind] = useState<Filter>("all");

  useEffect(() => {
    if (!initialVisual) return;
    document.getElementById(`atlas-${initialVisual}`)?.scrollIntoView({ block: "center" });
  }, [initialVisual]);

  const filtered = useMemo(() => items.filter(({ item, placement }) => {
    if (lessonId !== "all" && item.lessonId !== lessonId) return false;
    if (kind === "inline" && !placement.disposition.startsWith("INLINE_")) return false;
    if (kind === "reference" && placement.disposition !== "LESSON_REFERENCE_DISCLOSURE") return false;
    if (kind === "chapter" && placement.disposition !== "CHAPTER_ATLAS_ONLY") return false;
    const haystack = `${item.id} ${item.lessonId} ${item.title.en} ${item.title.vi} ${item.description.en} ${item.description.vi}`.toLowerCase();
    return query.trim().toLowerCase().split(/\s+/).filter(Boolean).every((term) => haystack.includes(term));
  }), [items, kind, lessonId, query]);

  return <main className={styles.page} lang={locale} data-paper1-atlas>
    <Paper1LocaleBoundary locale={locale} />
    <Link className={styles.back} href={paper1Href("/paper-1/sections/1", locale)}><ArrowLeft size={17} />{locale === "vi" ? "Về Chapter 1" : "Back to Chapter 1"}</Link>
    <header className={styles.hero}><span>CHAPTER 1 · 55 {locale === "vi" ? "TÀI NGUYÊN HỌC" : "LEARNER VISUALS"}</span><h1>{locale === "vi" ? "Atlas minh họa Chapter 1" : "Chapter 1 visual atlas"}</h1><p>{locale === "vi" ? "Thư viện tra cứu riêng cho các hình đã được kiểm nguồn. Visual cốt lõi vẫn xuất hiện tại đúng bước trong bài học; Atlas dùng để tìm, so sánh và ôn bù." : "A separate reference library for source-checked visuals. Core visuals still appear at the relevant lesson step; use the Atlas to search, compare and revisit."}</p></header>
    <section className={styles.filters} aria-label={locale === "vi" ? "Bộ lọc Atlas" : "Atlas filters"}>
      <label><span>{locale === "vi" ? "Tìm hình" : "Search visuals"}</span><div><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "vi" ? "ID, chủ đề hoặc mô tả…" : "ID, topic or description…"} />{query && <button type="button" onClick={() => setQuery("")} aria-label={locale === "vi" ? "Xóa tìm kiếm" : "Clear search"}><X size={17} /></button>}</div></label>
      <Select id="atlas-lesson" label={locale === "vi" ? "Bài học" : "Lesson"} value={lessonId} onChange={(event) => setLessonId(event.target.value)}><option value="all">{locale === "vi" ? "Tất cả 8 bài" : "All 8 lessons"}</option>{Array.from({ length: 8 }, (_, index) => <option value={`P1-L${String(index + 1).padStart(2, "0")}`} key={index}>P1-L{String(index + 1).padStart(2, "0")}</option>)}</Select>
      <Select id="atlas-kind" label={locale === "vi" ? "Cách sử dụng" : "Learning use"} value={kind} onChange={(event) => setKind(event.target.value as Filter)}><option value="all">{locale === "vi" ? "Tất cả" : "All"}</option><option value="inline">Inline</option><option value="reference">{locale === "vi" ? "Tham khảo sau bài" : "Lesson references"}</option><option value="chapter">Chapter Atlas only</option></Select>
    </section>
    <p className={styles.count} aria-live="polite">{filtered.length} {locale === "vi" ? "hình phù hợp" : "matching visuals"}</p>
    {filtered.length === 0 ? <section className={styles.empty}><Search size={30} /><h2>{locale === "vi" ? "Không có hình phù hợp" : "No matching visual"}</h2><p>{locale === "vi" ? "Hãy đổi từ khóa hoặc xóa bộ lọc." : "Change the search term or clear the filters."}</p><Button variant="secondary" onClick={() => { setQuery(""); setLessonId("all"); setKind("all"); }}>{locale === "vi" ? "Xóa bộ lọc" : "Clear filters"}</Button></section> : <section className={styles.grid}>
      {filtered.map(({ item, placement }) => {
        const text = "teachingClaim" in placement ? placement.teachingClaim[locale] : placement.rationale[locale];
        return <figure id={`atlas-${item.id}`} key={item.id} className={lessonStyles.atlasCard} data-selected={initialVisual === item.id || undefined} data-atlas-id={item.id}>
          <AtlasImage item={item} locale={locale} />
          <figcaption><AtlasSourceMeta item={item} locale={locale} /><h2>{item.title[locale]}</h2><p>{text}</p><p className={lessonStyles.textEquivalent}>{item.description[locale]}</p><Link className={styles.deepLink} href={paper1Href(`/paper-1/atlas?visual=${encodeURIComponent(item.id)}`, locale, `#atlas-${item.id}`)}><ExternalLink size={14} />{locale === "vi" ? "Liên kết trực tiếp" : "Direct link"}</Link></figcaption>
        </figure>;
      })}
    </section>}
  </main>;
}
