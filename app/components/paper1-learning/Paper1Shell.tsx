"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { Root } from "fumadocs-core/page-tree";
import { BookOpen, Images, LogOut, Map, NotebookPen } from "lucide-react";
import { localeChangeEvent, useLearningLocale } from "@/app/AppProviders";
import { Button, SegmentedControl } from "@/app/components/algocore-ui";
import { paper1Href } from "@/app/lib/paper1/href";
import type { Paper1Catalog, Paper1Locale } from "@/app/lib/paper1/types";
import styles from "./Paper1Learning.module.css";

export function Paper1Shell({ catalog, children }: { readonly catalog: Paper1Catalog; readonly children: ReactNode }) {
  const locale = useLearningLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pending = useRef<{ locale: Paper1Locale; hash: string } | null>(null);

  useEffect(() => {
    if (!pending.current || searchParams.get("lang") !== pending.current.locale) return;
    const hash = pending.current.hash;
    pending.current = null;
    if (hash) window.history.replaceState(window.history.state, "", `${pathname}?${searchParams.toString()}${hash}`);
  }, [pathname, searchParams]);

  const tree = useMemo<Root>(() => ({
    $id: `paper1-root-${locale}`,
    name: "Cambridge 9618",
    children: [
      { $id: "paper1-map", type: "page", name: locale === "vi" ? "Bản đồ học tập" : "Study map", url: paper1Href("/paper-1", locale), icon: <Map /> },
      { $id: "paper1-atlas", type: "page", name: locale === "vi" ? "Atlas Chapter 1" : "Chapter 1 Atlas", url: paper1Href("/paper-1/atlas", locale), icon: <Images /> },
      ...catalog.sections.filter((section) => section.status === "available").map((section) => ({ $id: `paper1-practice-${section.id}`, type: "page" as const, name: locale === "vi" ? `Ôn tập Chương ${section.id}` : `Chapter ${section.id} practice`, url: paper1Href(`/paper-1/practice/${section.id}`, locale), icon: <NotebookPen /> })),
      { $id: "paper1-sections", type: "separator", name: locale === "vi" ? "8 PHẦN PAPER 1" : "PAPER 1 · 8 SECTIONS" },
      ...catalog.sections.map((section) => ({ $id: `paper1-section-${section.id}`, type: "page" as const, name: `${section.id} · ${section.title[locale]}`, url: paper1Href(`/paper-1/sections/${section.id}`, locale), icon: <BookOpen /> })),
    ],
  }), [catalog, locale]);

  function changeLocale(value: string) {
    const next: Paper1Locale = value === "vi" ? "vi" : "en";
    if (next === locale) return;
    const params = new URLSearchParams(window.location.search);
    params.set("lang", next);
    pending.current = { locale: next, hash: window.location.hash };
    window.dispatchEvent(new CustomEvent(localeChangeEvent, { detail: next }));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return <>
    <a className={styles.skipLink} href="#paper1-main">{locale === "vi" ? "Đến nội dung chính" : "Skip to content"}</a>
    <DocsLayout tree={tree} containerProps={{ className: styles.docsLayout }} nav={{ title: <span className="brand-logo"><img src="/algocore-logo.png" alt="AlgoCore Education" width="146" height="52" /></span>, url: paper1Href("/paper-1", locale) }} sidebar={{ collapsible: true, banner: <div className="course-label"><span>CAMBRIDGE 9618 · 2026</span><strong>Paper 1</strong><p>{locale === "vi" ? "Lý thuyết cơ bản" : "Fundamental Theory"}</p></div>, footer: <div className={styles.sidebarFooter}><span><LogOut size={18} aria-hidden="true" />AlgoCore Learning</span><form action="/api/auth/logout" method="post"><input type="hidden" name="lang" value={locale} /><Button type="submit" variant="secondary" size="compact">{locale === "vi" ? "Đăng xuất" : "Sign out"}</Button></form></div> }}>
      <div className={styles.content} data-paper1-shell>
        <div role="region" aria-label={locale === "vi" ? "Thanh công cụ Paper 1" : "Paper 1 toolbar"}>
        <div className={styles.topbar}><span><i aria-hidden="true" /> PAPER 1 <b>/</b> {locale === "vi" ? "Lý thuyết cơ bản" : "Fundamental Theory"}</span><SegmentedControl label={locale === "vi" ? "Ngôn ngữ" : "Language"} value={locale} onChange={changeLocale} segments={[{ id: "en", label: "EN" }, { id: "vi", label: "VI" }]} /></div>
        </div>
        <main id="paper1-main" className={styles.main} tabIndex={-1}>{children}</main>
        <footer className={styles.footer}><span>AlgoCore Education</span><span>Cambridge 9618 · 2026 · Syllabus v2</span></footer>
      </div>
    </DocsLayout>
  </>;
}
