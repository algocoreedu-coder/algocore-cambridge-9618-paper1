import fs from "node:fs";

const baseUrl = (process.env.PAPER1_BASE_URL ?? "http://127.0.0.1:3041").replace(/\/$/, "");
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
if (!username || !password) throw new Error("Paper 1 HTTP check requires local test credentials; values are never printed.");
const catalog = JSON.parse(fs.readFileSync("content/paper1/catalog.json", "utf8"));
const practiceChapters = catalog.sections.filter((section) => section.status === "available").map((section) => {
  const practicePath = `content/paper1/practice/chapter-${section.id}.json`;
  if (!fs.existsSync(practicePath)) throw new Error(`Available Section ${section.id} has no chapter-practice payload`);
  const practice = JSON.parse(fs.readFileSync(practicePath, "utf8"));
  if (practice.chapterId !== section.id || practice.practiceId !== `P1-CP${section.id.padStart(2, "0")}`) throw new Error(`Section ${section.id} chapter-practice identity mismatch`);
  return practice;
});
const login = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/json", origin: baseUrl, "sec-fetch-site": "same-origin" }, body: JSON.stringify({ username, password, next: "/paper-1?lang=en", lang: "en" }) });
if (login.status !== 200) throw new Error(`Local sign-in failed with ${login.status}`);
const cookie = (login.headers.get("set-cookie") ?? "").split(";", 1)[0];
if (!cookie) throw new Error("Local sign-in returned no session cookie");

const failures = [];
async function page(pathname, expected) {
  const response = await fetch(`${baseUrl}${pathname}`, { headers: { cookie } });
  const html = await response.text();
  if (response.status !== 200) failures.push(`${pathname}: status ${response.status}`);
  for (const needle of expected) if (!html.includes(needle)) failures.push(`${pathname}: missing ${needle}`);
}

for (const locale of ["en", "vi"]) {
  await page(`/paper-1?lang=${locale}`, ["data-paper1-map", locale === "vi" ? "Bản đồ học tập" : "Study map"]);
  await page(`/paper-1/atlas?lang=${locale}`, ["data-paper1-atlas", locale === "vi" ? "Atlas minh họa Chapter 1" : "Chapter 1 visual atlas"]);
  await page(`/paper-1/practice?lang=${locale}`, ["data-paper1-practice=\"P1-CP01\"", locale === "vi" ? "Ôn tập tổng hợp Chapter 1" : "Chapter 1 mixed revision"]);
  for (const practice of practiceChapters) await page(`/paper-1/practice/${practice.chapterId}?lang=${locale}`, [
    `data-paper1-practice=\"${practice.practiceId}\"`,
    practice.title[locale],
  ]);
  for (const section of catalog.sections) await page(`/paper-1/sections/${section.id}?lang=${locale}`, [`data-paper1-section=\"${section.id}\"`]);
  for (const topic of catalog.topics) await page(`/paper-1/topics/${topic.slug}?lang=${locale}`, [
    `data-paper1-lesson=\"${topic.lessonId}\"`, `data-paper1-visual=\"VIS-${topic.lessonId}\"`,
    `id=\"understand\"`, `id=\"observe\"`, `id=\"worked-example\"`, `id=\"recognise\"`, `id=\"check\"`, `id=\"recall\"`,
    topic.title[locale],
  ]);
}
await page("/paper-1", ["<html lang=\"en\"", "Study map", "Fundamental Theory"]);
const unknown = await fetch(`${baseUrl}/paper-1/topics/not-a-paper1-topic?lang=en`, { headers: { cookie } });
if (unknown.status !== 404) failures.push(`/paper-1/topics/not-a-paper1-topic: expected 404, got ${unknown.status}`);
const unknownPractice = await fetch(`${baseUrl}/paper-1/practice/99?lang=en`, { headers: { cookie } });
if (unknownPractice.status !== 404) failures.push(`/paper-1/practice/99: expected 404, got ${unknownPractice.status}`);
const retired = await fetch(`${baseUrl}/paper-1/atlas?lang=en&visual=BOOK-C03-P082-RGB-PIXEL`, { headers: { cookie } });
if (retired.status !== 404) failures.push(`/paper-1/atlas retired visual: expected 404, got ${retired.status}`);
if (failures.length) { console.error(`Paper 1 HTTP routes: FAIL (${failures.length})`); failures.forEach((entry) => console.error(`- ${entry}`)); process.exit(1); }
console.log(`Paper 1 HTTP routes: PASS (${2 * (3 + practiceChapters.length + catalog.sections.length + catalog.topics.length)} explicit EN/VI pages + English default route; Atlas + legacy practice + ${practiceChapters.length} chapter practice routes; ${catalog.topics.length}/${catalog.topics.length} topics with six anchors and visual IDs; unknown topic/practice and retired Atlas item 404)`);
