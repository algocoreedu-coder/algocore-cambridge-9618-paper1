import { BookImage, BookOpenText } from "lucide-react";
import { Disclosure } from "@/app/components/algocore-ui";
import { getPaper1AtlasItems } from "@/app/lib/paper1/atlas-registry";
import type { Paper1AtlasRole, Paper1Locale } from "@/app/lib/paper1/types";
import styles from "./LessonPage.module.css";

const roleLabel: Record<Paper1AtlasRole, Record<Paper1Locale, string>> = {
  required: { en: "Required visual", vi: "Hình bắt buộc" },
  supporting: { en: "Supporting visual", vi: "Hình bổ trợ" },
  extension: { en: "Extension", vi: "Mở rộng" },
};

export function AtlasReferenceGallery({ ids, lessonId, locale }: {
  readonly ids: readonly string[];
  readonly lessonId: string;
  readonly locale: Paper1Locale;
}) {
  const items = getPaper1AtlasItems(ids);
  if (items.length !== ids.length || items.some((item) => item.lessonId !== lessonId)) {
    throw new Error(`Paper 1 Atlas contract mismatch for ${lessonId}`);
  }

  const requiredItems = items.filter((item) => item.role === "required");
  const additionalItems = items.filter((item) => item.role !== "required");

  const summary = locale === "vi"
    ? `Mở hình bổ trợ và mở rộng (${additionalItems.length})`
    : `Open supporting and extension visuals (${additionalItems.length})`;

  return <aside className={styles.atlasGallery} aria-labelledby={`${lessonId}-atlas-title`}>
    <header className={styles.atlasHeader}>
      <span aria-hidden="true"><BookImage size={20} /></span>
      <div>
        <h3 id={`${lessonId}-atlas-title`}>{locale === "vi" ? "Atlas minh họa từ sách" : "Coursebook visual atlas"}</h3>
        <p>{locale === "vi"
          ? "Mỗi thẻ là frame hoàn chỉnh đại diện cho một sơ đồ được biên soạn lại. Dùng hình cốt lõi trước, rồi mở hình bổ trợ hoặc mở rộng khi cần."
          : "Each card is a complete representative frame from an original reconstruction. Start with core visuals, then use supporting or extension visuals as needed."}</p>
      </div>
    </header>
    <div className={styles.atlasGrid} role="group" aria-label={locale === "vi" ? "Hình bắt buộc của bài" : "Required lesson visuals"}>
      {requiredItems.map((item) => <AtlasCard item={item} locale={locale} key={item.id} />)}
    </div>
    {additionalItems.length > 0 && <Disclosure summary={summary}>
      <div className={styles.atlasGrid}>
        {additionalItems.map((item) => <AtlasCard item={item} locale={locale} key={item.id} />)}
      </div>
    </Disclosure>}
  </aside>;
}

function AtlasCard({ item, locale }: {
  readonly item: ReturnType<typeof getPaper1AtlasItems>[number];
  readonly locale: Paper1Locale;
}) {
  return <figure className={styles.atlasCard} data-atlas-role={item.role}>
          <div className={styles.atlasPreview}>
            <img
              src={item.preview[locale]}
              alt={`${item.title[locale]}. ${item.description[locale]}`}
              width="960"
              height="500"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <div className={styles.atlasMeta}>
              <span data-role={item.role}>{roleLabel[item.role][locale]}</span>
              <span><BookOpenText size={14} aria-hidden="true" />{locale === "vi" ? `Trang in ${item.source.printedPage}` : `Printed page ${item.source.printedPage}`}</span>
            </div>
            <h4>{item.title[locale]}</h4>
            <p>{item.description[locale]}</p>
            <small>{locale === "vi" ? "Nhãn nguồn: " : "Source label: "}{item.source.label}</small>
          </figcaption>
        </figure>;
}
