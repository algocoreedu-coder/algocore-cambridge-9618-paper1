"use client";

import { useEffect, useState } from "react";
import type { Paper1Locale } from "@/app/lib/paper1/types";
import { readPaper1ProgressScope, writePaper1LastStage } from "./paper1-progress";
import styles from "./LessonPage.module.css";

const stages = [
  ["understand", "Understand", "Hiểu"],
  ["observe", "Observe", "Quan sát"],
  ["worked-example", "Worked example", "Ví dụ mẫu"],
  ["recognise", "Recognise", "Nhận diện"],
  ["check", "Check", "Tự kiểm"],
  ["recall", "Recall", "Nhớ lại"],
] as const;

export function LessonStageRail({ lessonId, locale }: { readonly lessonId: string; readonly locale: Paper1Locale }) {
  const [current, setCurrent] = useState("understand");

  useEffect(() => {
    const sections = stages.map(([id]) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    const updateFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (stages.some(([id]) => id === hash)) {
        setCurrent(hash);
        writePaper1LastStage(readPaper1ProgressScope(), lessonId, hash);
      }
    };
    updateFromHash();
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible?.target.id) {
        setCurrent(visible.target.id);
        writePaper1LastStage(readPaper1ProgressScope(), lessonId, visible.target.id);
      }
    }, { rootMargin: "-18% 0px -70% 0px", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", updateFromHash);
    return () => { observer.disconnect(); window.removeEventListener("hashchange", updateFromHash); };
  }, [lessonId]);

  return <nav className={styles.lessonNav} aria-label={locale === "vi" ? "Sáu phần của bài học" : "Six lesson stages"}>
    {stages.map(([id, en, vi], index) => <a
      key={id}
      href={`#${id}`}
      aria-current={current === id ? "step" : undefined}
      onClick={() => { setCurrent(id); writePaper1LastStage(readPaper1ProgressScope(), lessonId, id); }}
    ><span>{index + 1}</span><b>{locale === "vi" ? vi : en}</b></a>)}
  </nav>;
}
