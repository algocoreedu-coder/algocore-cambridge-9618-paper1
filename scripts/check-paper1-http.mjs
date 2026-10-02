import fs from "node:fs";

const baseUrl = (process.env.PAPER1_BASE_URL ?? "http://127.0.0.1:3041").replace(/\/$/, "");
const username = process.env.STUDENT_LOGIN_USERNAME ?? process.env.ALGOCORE_STUDENT_USERNAME;
const password = process.env.STUDENT_LOGIN_PASSWORD ?? process.env.ALGOCORE_STUDENT_PASSWORD;
if (!username || !password) throw new Error("Paper 1 HTTP check requires local test credentials; values are never printed.");
const catalog = JSON.parse(fs.readFileSync("content/paper1/catalog.json", "utf8"));
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
  for (const section of catalog.sections) await page(`/paper-1/sections/${section.id}?lang=${locale}`, [`data-paper1-section=\"${section.id}\"`]);
  for (const topic of catalog.topics) await page(`/paper-1/topics/${topic.slug}?lang=${locale}`, [
    `data-paper1-lesson=\"${topic.lessonId}\"`, `data-paper1-visual=\"VIS-${topic.lessonId}\"`,
    `id=\"understand\"`, `id=\"observe\"`, `id=\"worked-example\"`, `id=\"recognise\"`, `id=\"check\"`, `id=\"recall\"`,
    topic.title[locale],
  ]);
}
const unknown = await fetch(`${baseUrl}/paper-1/topics/not-a-paper1-topic?lang=en`, { headers: { cookie } });
if (unknown.status !== 404) failures.push(`/paper-1/topics/not-a-paper1-topic: expected 404, got ${unknown.status}`);
if (failures.length) { console.error(`Paper 1 HTTP routes: FAIL (${failures.length})`); failures.forEach((entry) => console.error(`- ${entry}`)); process.exit(1); }
console.log(`Paper 1 HTTP routes: PASS (${2 * (1 + catalog.sections.length + catalog.topics.length)} EN/VI pages; 8/8 topics with six anchors and visual IDs; unknown topic 404)`);
