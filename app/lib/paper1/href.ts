import type { Paper1Locale } from "./types";

export function paper1Href(path: string, locale: Paper1Locale, hash = "") {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${locale}${hash}`;
}
