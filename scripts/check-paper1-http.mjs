import fs from "node:fs";

const baseUrl = (process.env.PAPER1_BASE_URL ?? "http://127.0.0.1:3041").replace(/\/$/, "");
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
const publicPreview = process.env.ALGOCORE_PUBLIC_PREVIEW === "true";
if (!publicPreview && (!username || !password)) throw new Error("Authenticated Paper 1 HTTP check requires local test credentials; values are never printed.");

const catalog = JSON.parse(fs.readFileSync("content/paper1/catalog.json", "utf8"));
const chapter8Section = catalog.sections.find((section) => section.id === "8");
const chapter8Topics = catalog.topics.filter((topic) => topic.sectionId === "8");
if (chapter8Section?.status !== "available" || chapter8Topics.length !== 7) {
  throw new Error(`Chapter 8 HTTP fixture mismatch: status=${chapter8Section?.status ?? "missing"}, topics=${chapter8Topics.length}`);
}
if (!catalog.sections.every((section) => section.status === "available")) throw new Error("All eight Paper 1 sections must be available in the Chapter 8 release");

const practiceChapters = catalog.sections.map((section) => {
  const practicePath = `content/paper1/practice/chapter-${section.id}.json`;
  if (!fs.existsSync(practicePath)) throw new Error(`Available Section ${section.id} has no chapter-practice payload`);
  const practice = JSON.parse(fs.readFileSync(practicePath, "utf8"));
  if (practice.chapterId !== section.id || practice.practiceId !== `P1-CP${section.id.padStart(2, "0")}`) throw new Error(`Section ${section.id} chapter-practice identity mismatch`);
  return practice;
});
if (practiceChapters.length !== 8) throw new Error(`Expected eight chapter-practice fixtures, got ${practiceChapters.length}`);

const gateResponse = await fetch(`${baseUrl}/paper-1/sections/8?lang=vi`, { redirect: "manual" });
let cookie = "";
if (publicPreview) {
  if (gateResponse.status !== 200) throw new Error(`Public-preview Section 8 request was not open: ${gateResponse.status}`);
  cookie = (gateResponse.headers.get("set-cookie") ?? "").split(";", 1)[0];
  if (!/^algocore_progress_scope=[A-Za-z0-9_-]{22}$/.test(cookie)) throw new Error("Public-preview request did not assign a valid opaque progress scope");
  const previewLogin = await fetch(`${baseUrl}/login?lang=vi&next=${encodeURIComponent("/paper-1/sections/8?lang=vi")}`, { redirect: "manual" });
  if (![302, 303, 307, 308].includes(previewLogin.status)) throw new Error(`Public-preview login route did not redirect: ${previewLogin.status}`);
  const previewLocation = previewLogin.headers.get("location");
  if (!previewLocation) throw new Error("Public-preview login redirect has no location");
  const previewTarget = new URL(previewLocation, baseUrl);
  if (previewTarget.pathname !== "/paper-1/sections/8" || previewTarget.searchParams.get("lang") !== "vi") {
    throw new Error(`Public-preview login redirect did not preserve destination: ${previewTarget.pathname}${previewTarget.search}`);
  }
} else {
  if (![302, 303, 307, 308].includes(gateResponse.status)) throw new Error(`Unauthenticated Section 8 request did not redirect: ${gateResponse.status}`);
  const redirectLocation = gateResponse.headers.get("location");
  if (!redirectLocation) throw new Error("Unauthenticated Section 8 redirect has no location");
  const redirectTarget = new URL(redirectLocation, baseUrl);
  if (redirectTarget.pathname !== "/login" || redirectTarget.searchParams.get("lang") !== "vi" || redirectTarget.searchParams.get("next") !== "/paper-1/sections/8?lang=vi") {
    throw new Error(`Unauthenticated redirect did not preserve language/destination: ${redirectTarget.pathname}${redirectTarget.search}`);
  }
  const login = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/json", origin: baseUrl, "sec-fetch-site": "same-origin" }, body: JSON.stringify({ username, password, next: "/paper-1?lang=en", lang: "en" }) });
  if (login.status !== 200) throw new Error(`Local sign-in failed with ${login.status}`);
  cookie = (login.headers.get("set-cookie") ?? "").split(";", 1)[0];
  if (!/^algocore_student_session=/.test(cookie)) throw new Error("Local sign-in returned no session cookie");
}

const failures = [];
async function page(pathname, expected) {
  const response = await fetch(`${baseUrl}${pathname}`, { headers: { cookie } });
  const html = await response.text();
  if (response.status !== 200) failures.push(`${pathname}: status ${response.status}`);
  for (const needle of expected) if (!html.includes(needle)) failures.push(`${pathname}: missing ${needle}`);
}
async function pageExcludes(pathname, forbidden) {
  const response = await fetch(`${baseUrl}${pathname}`, { headers: { cookie } });
  const html = await response.text();
  if (response.status !== 200) failures.push(`${pathname}: status ${response.status}`);
  for (const needle of forbidden) if (html.includes(needle)) failures.push(`${pathname}: unexpectedly contains ${needle}`);
}

for (const locale of ["en", "vi"]) {
  await page(`/paper-1?lang=${locale}`, ["data-paper1-map", locale === "vi" ? "Bản đồ học tập" : "Study map"]);
  await page(`/paper-1/atlas?lang=${locale}`, ["data-paper1-atlas", locale === "vi" ? "Atlas minh họa Chapter 1" : "Chapter 1 visual atlas"]);
  await page(`/paper-1/practice?lang=${locale}`, ["data-paper1-practice=\"P1-CP01\"", locale === "vi" ? "Ôn tập tổng hợp Chapter 1" : "Chapter 1 mixed revision"]);
  for (const practice of practiceChapters) await page(`/paper-1/practice/${practice.chapterId}?lang=${locale}`, [
    `data-paper1-practice="${practice.practiceId}"`,
    practice.title[locale],
  ]);
  for (const section of catalog.sections) await page(`/paper-1/sections/${section.id}?lang=${locale}`, [`data-paper1-section="${section.id}"`]);
  for (const topic of catalog.topics) await page(`/paper-1/topics/${topic.slug}?lang=${locale}`, [
    `data-paper1-lesson="${topic.lessonId}"`, `data-paper1-visual="VIS-${topic.lessonId}"`,
    `id="understand"`, `id="observe"`, `id="worked-example"`, `id="recognise"`, `id="check"`, `id="recall"`,
    topic.title[locale],
  ]);
}

await page("/paper-1", ["<html lang=\"en\"", "Study map", "Fundamental Theory"]);
await page("/paper-1/topics/professional-ethics?lang=en", ['data-teacher-source-audit="P1-L41"']);
await page("/paper-1/topics/ai-impacts?lang=en", ['data-teacher-source-audit="P1-L43"']);
await pageExcludes("/paper-1/topics/copyright-licences?lang=en", ['data-teacher-source-audit="P1-L42"', "Open 0 source notes"]);
for (const topic of chapter8Topics) await page(`/paper-1/topics/${topic.slug}?lang=en`, [`data-teacher-source-audit="${topic.lessonId}"`]);
const chapter8LockedAnswers = {
  "relational-foundations": "separate-copies-or-layouts-require-separate-coordination",
  "keys-relationships": "accepted-reference-exists",
  normalisation: "all-source-facts-reconstructed",
  dbms: "schema-change-defined-and-recorded",
  "sql-foundations": "creates-a-database-container-in-the-declared-teaching-dialect",
  "sql-ddl": "schema-change-committed",
  "sql-dml": "WHERE-matches-B1-and-B2-then-SELECT-projects-two-columns",
};
for (const [slug, lockedAnswer] of Object.entries(chapter8LockedAnswers)) {
  await pageExcludes(`/paper-1/topics/${slug}?lang=en`, [lockedAnswer]);
  await pageExcludes(`/paper-1/topics/${slug}?lang=vi`, [lockedAnswer]);
}
const removedChapter8PointersByLesson = {
  "keys-relationships": ["BOOK-C08-P216-EXAM-SCHOOL-SCHEMA"],
  normalisation: ["BOOK-C08-P215-EXAM-PROGDEV", "BOOK-C08-P215-EXAM-PROGRAMMER-TABLES"],
  "sql-dml": ["BOOK-C08-P216-EXAM-SCHOOL-SCHEMA"],
};
for (const locale of ["en", "vi"]) for (const [slug, removedPointers] of Object.entries(removedChapter8PointersByLesson)) {
  await pageExcludes(`/paper-1/topics/${slug}?lang=${locale}`, removedPointers);
}

const unknown = await fetch(`${baseUrl}/paper-1/topics/not-a-paper1-topic?lang=en`, { headers: { cookie } });
if (unknown.status !== 404) failures.push(`/paper-1/topics/not-a-paper1-topic: expected 404, got ${unknown.status}`);
const unknownPractice = await fetch(`${baseUrl}/paper-1/practice/99?lang=en`, { headers: { cookie } });
if (unknownPractice.status !== 404) failures.push(`/paper-1/practice/99: expected 404, got ${unknownPractice.status}`);
for (const visualId of ["BOOK-C03-P082-RGB-PIXEL", "BOOK-C08-P215-EXAM-PROGDEV", "BOOK-C08-P215-EXAM-PROGRAMMER-TABLES", "BOOK-C08-P216-EXAM-SCHOOL-SCHEMA"]) {
  const retired = await fetch(`${baseUrl}/paper-1/atlas?lang=en&visual=${visualId}`, { headers: { cookie } });
  if (retired.status !== 404) failures.push(`/paper-1/atlas removed visual ${visualId}: expected 404, got ${retired.status}`);
}

if (failures.length) { console.error(`Paper 1 HTTP routes: FAIL (${failures.length})`); failures.forEach((entry) => console.error(`- ${entry}`)); process.exit(1); }
const explicitLocalizedPages = 2 * (3 + practiceChapters.length + catalog.sections.length + catalog.topics.length);
if (explicitLocalizedPages !== 138) throw new Error(`Chapter 8 route count mismatch: expected 138 explicit EN/VI pages, got ${explicitLocalizedPages}`);
console.log(`Paper 1 HTTP routes: PASS (${explicitLocalizedPages} explicit EN/VI pages + English default route; Atlas + legacy practice + ${practiceChapters.length} chapter-practice routes; Chapter 8 Section/P1-CP08/7 lesson routes included; ${catalog.topics.length}/${catalog.topics.length} topics with six anchors and visual IDs; Chapter 8 source-alignment notes render without copied publisher images and removed exam identities stay unavailable; ${publicPreview ? "opt-in public preview with isolated progress scope" : "language-preserving authenticated gate"}; unknown topic/practice and removed Atlas items 404)`);
