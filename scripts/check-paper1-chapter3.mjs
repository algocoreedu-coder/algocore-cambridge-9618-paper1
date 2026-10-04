import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (name) => { try { return JSON.parse(fs.readFileSync(path.join(root, name), "utf8")); } catch (error) { failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`); return null; } };
const text = (value) => typeof value === "string" && value.trim().length > 0;
const localized = (value, label) => check(value && text(value.en) && text(value.vi), `${label}: EN/VI parity missing`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const unique = (values, label) => check(new Set(values).size === values.length, `${label}: duplicate stable ID`);
const allStrings = (value, visit) => { if (typeof value === "string") visit(value); else if (Array.isArray(value)) value.forEach((entry) => allStrings(entry, visit)); else if (value && typeof value === "object") Object.values(value).forEach((entry) => allStrings(entry, visit)); };
const safe = (value, label) => allStrings(value, (entry) => { check(!/(?:[A-Z]:\\|file:\/\/|\.\.\/|CONTROLLED_CHECK)/i.test(entry), `${label}: private/local reference leaked`); check(!/\b(?:TODO|TBD|PLACEHOLDER|LOREM IPSUM|NOT_AUTHORED)\b/i.test(entry), `${label}: unfinished placeholder leaked`); });

const expected = [
  { lessonId: "P1-L19", slug: "computer-organisation", order: 19, strand: "3.1", objectives: ["AC26-3.1-01", "AC26-3.1-04"], requirements: ["REQ-3.1-01-01", "REQ-3.1-04-01"], prerequisites: [] },
  { lessonId: "P1-L20", slug: "device-principles", order: 20, strand: "3.1", objectives: ["AC26-3.1-03"], requirements: ["REQ-3.1-03-01", "REQ-3.1-03-02", "REQ-3.1-03-03", "REQ-3.1-03-04", "REQ-3.1-03-05", "REQ-3.1-03-06", "REQ-3.1-03-07", "REQ-3.1-03-08"], prerequisites: [] },
  { lessonId: "P1-L21", slug: "embedded-control", order: 21, strand: "3.1", objectives: ["AC26-3.1-02", "AC26-3.1-08"], requirements: ["REQ-3.1-02-01", "REQ-3.1-08-01", "REQ-3.1-08-02", "REQ-3.1-08-03", "REQ-3.1-08-04"], prerequisites: ["P1-L19"] },
  { lessonId: "P1-L22", slug: "memory-technologies", order: 22, strand: "3.1", objectives: ["AC26-3.1-05", "AC26-3.1-06", "AC26-3.1-07"], requirements: ["REQ-3.1-05-01", "REQ-3.1-05-02", "REQ-3.1-06-01", "REQ-3.1-06-02", "REQ-3.1-07-01"], prerequisites: ["P1-L19"] },
  { lessonId: "P1-L23", slug: "logic-gates", order: 23, strand: "3.2", objectives: ["AC26-3.2-01", "AC26-3.2-02"], requirements: ["REQ-3.2-01-01", "REQ-3.2-01-02", "REQ-3.2-02-01"], prerequisites: [] },
  { lessonId: "P1-L24", slug: "logic-design", order: 24, strand: "3.2", objectives: ["AC26-3.2-03", "AC26-3.2-04", "AC26-3.2-05"], requirements: ["REQ-3.2-03-01", "REQ-3.2-04-01", "REQ-3.2-05-01"], prerequisites: ["P1-L23"] },
];
const lessonIds = new Set(expected.map((entry) => entry.lessonId));
const objectiveIds = new Set(expected.flatMap((entry) => entry.objectives));
const requirementIds = new Set(expected.flatMap((entry) => entry.requirements));
const blocks = Array.from({ length: 11 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);
check(expected.length === 6, "validator fixture must contain six lessons");
check(objectiveIds.size === 13, `validator fixture must contain 13 objectives, got ${objectiveIds.size}`);
check(requirementIds.size === 26, `validator fixture must contain 26 requirements, got ${requirementIds.size}`);

const catalog = read("content/paper1/catalog.json");
const manifest = read("content/paper1/release-manifest.json");
const releaseChapter = Number(manifest?.releaseId?.match(/^paper1-chapter(\d+)-/i)?.[1]);
const practice = read("content/paper1/practice/chapter-3.json");
const definitions = read("content/paper1/visual-definitions.json");
const oracles = read("content/paper1/chapter3-visual-oracles.json");

if (catalog) {
  const section = catalog.sections?.find((entry) => entry.id === "3");
  check(section?.status === "available", "catalog: Section 3 must be available");
  localized(section?.title, "catalog Section 3 title"); localized(section?.summary, "catalog Section 3 summary"); localized(section?.question, "catalog Section 3 question");
  const strands = catalog.strands?.filter((entry) => entry.sectionId === "3") ?? [];
  check(same(strands.map((entry) => entry.id), ["3.1", "3.2"]), "catalog: Chapter 3 must expose strands 3.1 and 3.2 in order");
  strands.forEach((entry) => localized(entry.title, `catalog strand ${entry.id}`));
  const topics = catalog.topics?.filter((entry) => entry.sectionId === "3") ?? [];
  check(topics.length === 6, `catalog: expected six Chapter 3 topics, got ${topics.length}`);
  unique(topics.map((entry) => entry.lessonId), "catalog Chapter 3 lesson IDs");
  for (const item of expected) {
    const topic = topics.find((entry) => entry.lessonId === item.lessonId);
    check(Boolean(topic), `catalog: ${item.lessonId} missing`); if (!topic) continue;
    check(topic.slug === item.slug && topic.order === item.order && topic.strandId === item.strand, `${item.lessonId}: catalog route/order/strand mismatch`);
    check(same(topic.objectiveIds, item.objectives), `${item.lessonId}: catalog objectives mismatch`);
    check(same(topic.requirementIds, item.requirements), `${item.lessonId}: catalog requirements mismatch`);
    check(same(topic.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: catalog prerequisites mismatch`);
    localized(topic.title, `${item.lessonId} catalog title`); localized(topic.summary, `${item.lessonId} catalog summary`);
    check(Array.isArray(topic.searchTerms) && topic.searchTerms.length > 0 && topic.searchTerms.every(text), `${item.lessonId}: search terms missing`);
  }
  check(["4", "5", "6", "7"].every((id) => catalog.sections?.find((entry) => entry.id === id)?.status === "available") && catalog.sections?.find((entry) => entry.id === "8")?.status === (releaseChapter >= 8 ? "available" : "planned"), "catalog: Sections 4–7 must remain available; Section 8 must be planned through Chapter 7 and available from Chapter 8");
  safe(catalog, "catalog");
}

if (manifest) {
  check(/^paper1-chapter(?:[3-9]|[1-9]\d)-/i.test(manifest.releaseId ?? ""), "release manifest must identify Chapter 3 or a later cumulative candidate");
  unique(manifest.lessons?.map((entry) => entry.lessonId) ?? [], "release manifest lesson IDs");
  for (const item of expected) {
    const released = manifest.lessons?.find((entry) => entry.lessonId === item.lessonId);
    check(released?.slug === item.slug && released?.state === "available", `${item.lessonId}: manifest availability mismatch`);
    check(/^\d+\.\d+\.\d+$/.test(released?.contentVersion ?? "") && /^\d+\.\d+\.\d+$/.test(released?.assessmentVersion ?? ""), `${item.lessonId}: invalid version`);
    check(released?.modelVersions?.includes(`VIS-${item.lessonId}@1`), `${item.lessonId}: versioned visual model missing`);
  }
}

const assessmentOwners = new Map();
for (const item of expected) {
  const lesson = read(`content/paper1/lessons/${item.slug}.json`);
  if (!lesson) continue;
  check(lesson.schemaVersion === 1 && lesson.lessonId === item.lessonId && lesson.slug === item.slug, `${item.lessonId}: identity mismatch`);
  check(lesson.sectionId === "3" && lesson.strandId === item.strand, `${item.lessonId}: section/strand mismatch`);
  check(same(lesson.objectives?.map((entry) => entry.id), item.objectives), `${item.lessonId}: lesson objectives mismatch`);
  check(same(lesson.requirementIds, item.requirements), `${item.lessonId}: lesson requirements mismatch`);
  check(same(lesson.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: lesson prerequisites mismatch`);
  localized(lesson.title, `${item.lessonId} title`); localized(lesson.question, `${item.lessonId} question`); localized(lesson.opening, `${item.lessonId} opening`);
  lesson.objectives?.forEach((entry) => localized(entry.text, `${item.lessonId}/${entry.id} objective`));
  check(Array.isArray(lesson.theory) && lesson.theory.length >= 3, `${item.lessonId}: at least three theory blocks required`);
  lesson.theory?.forEach((entry, index) => { localized(entry.title, `${item.lessonId} theory ${index} title`); entry.paragraphs?.forEach((paragraph, paragraphIndex) => localized(paragraph, `${item.lessonId} theory ${index} paragraph ${paragraphIndex}`)); check(entry.sourceIds?.includes("SYL-2026") && entry.sourceIds?.includes("BOOK-C03"), `${item.lessonId}: theory source IDs incomplete`); });
  check(lesson.workedExample?.steps?.length >= 3, `${item.lessonId}: worked example needs at least three steps`);
  lesson.workedExample?.steps?.forEach((entry, index) => { localized(entry.action, `${item.lessonId} worked action ${index}`); localized(entry.result, `${item.lessonId} worked result ${index}`); });
  check(lesson.recognition?.items?.length >= 1 && lesson.recognition?.misconceptions?.length >= 1, `${item.lessonId}: recognition/misconception incomplete`);
  check(lesson.assessments?.length === item.requirements.length, `${item.lessonId}: expected one primary assessment per requirement`);
  for (const requirementId of item.requirements) {
    const matches = lesson.assessments?.filter((entry) => entry.requirementId === requirementId) ?? [];
    check(matches.length === 1, `${item.lessonId}/${requirementId}: expected exactly one primary assessment`);
    if (matches[0]) {
      check(matches[0].id === `${item.lessonId}-CHECK-${requirementId}`, `${item.lessonId}/${requirementId}: assessment ID mismatch`);
      check(!assessmentOwners.has(requirementId), `${requirementId}: assessed by more than one lesson`); assessmentOwners.set(requirementId, item.lessonId);
      localized(matches[0].prompt, `${item.lessonId}/${requirementId} prompt`); localized(matches[0].hint, `${item.lessonId}/${requirementId} hint`); localized(matches[0].solution?.modelAnswer, `${item.lessonId}/${requirementId} answer`);
      check(matches[0].origin === "original" && matches[0].claim_kind === "algocore_guidance", `${item.lessonId}/${requirementId}: provenance mismatch`);
    }
  }
  check(same(Object.keys(lesson.contractCoverage ?? {}), blocks), `${item.lessonId}: B01–B11 contract keys mismatch`);
  blocks.forEach((block) => check(Array.isArray(lesson.contractCoverage?.[block]) && lesson.contractCoverage[block].length > 0, `${item.lessonId}/${block}: coverage empty`));
  const kinds = new Set(lesson.sources?.map((entry) => entry.kind)); check(kinds.has("syllabus") && kinds.has("coursebook") && kinds.has("algocore"), `${item.lessonId}: source kinds incomplete`);
  check(lesson.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual ID mismatch`);
  safe(lesson, item.lessonId);
}
check(assessmentOwners.size === 26, `primary assessments cover ${assessmentOwners.size}/26 requirements`);

if (practice) {
  check(practice.practiceId === "P1-CP03" && practice.chapterId === "3", "practice identity mismatch");
  check(practice.items?.length === 15, `practice: expected 15 items, got ${practice.items?.length ?? 0}`);
  const marks = practice.items?.reduce((sum, entry) => sum + entry.marks, 0) ?? 0;
  const pointMarks = practice.items?.reduce((sum, entry) => sum + entry.solution.markingPoints.reduce((subtotal, point) => subtotal + point.marks, 0), 0) ?? 0;
  const ao1 = practice.items?.filter((entry) => entry.ao === "AO1").reduce((sum, entry) => sum + entry.marks, 0) ?? 0;
  const ao2 = practice.items?.filter((entry) => entry.ao === "AO2").reduce((sum, entry) => sum + entry.marks, 0) ?? 0;
  check(practice.totalMarks === 60 && marks === 60 && pointMarks === 60, `practice marks mismatch (${practice.totalMarks}/${marks}/${pointMarks})`);
  check(ao1 === 36 && ao2 === 24 && practice.aoBlueprint?.AO1 === 36 && practice.aoBlueprint?.AO2 === 24, `practice AO mismatch (${ao1}:${ao2})`);
  const coveredRequirements = new Set(practice.items?.flatMap((entry) => entry.requirementIds) ?? []);
  const coveredObjectives = new Set(practice.items?.flatMap((entry) => entry.objectiveIds) ?? []);
  const pointRequirements = new Set(practice.items?.flatMap((entry) => entry.solution.markingPoints.flatMap((point) => point.requirementIds)) ?? []);
  check(requirementIds.size === coveredRequirements.size && [...requirementIds].every((id) => coveredRequirements.has(id)), `practice item coverage ${coveredRequirements.size}/26`);
  check(requirementIds.size === pointRequirements.size && [...requirementIds].every((id) => pointRequirements.has(id)), `practice marking-point coverage ${pointRequirements.size}/26`);
  check(objectiveIds.size === coveredObjectives.size && [...objectiveIds].every((id) => coveredObjectives.has(id)), `practice objective coverage ${coveredObjectives.size}/13`);
  unique(practice.items?.map((entry) => entry.id) ?? [], "practice item IDs");
  practice.items?.forEach((entry) => { localized(entry.prompt, `${entry.id} prompt`); localized(entry.hint, `${entry.id} hint`); localized(entry.solution?.modelAnswer, `${entry.id} answer`); check(entry.solution?.markingPoints?.reduce((sum, point) => sum + point.marks, 0) === entry.marks, `${entry.id}: marking points do not sum to item marks`); check(lessonIds.has(expected.find((item) => item.slug === entry.revisitLessonSlug)?.lessonId), `${entry.id}: revisit slug not in Chapter 3`); });
  safe(practice, "Chapter 3 practice");
}

if (definitions) {
  const chapter = definitions.filter((entry) => lessonIds.has(entry.lessonId));
  check(chapter.length === 6, `visual definitions: expected six, got ${chapter.length}`);
  for (const item of expected) {
    const definition = chapter.find((entry) => entry.lessonId === item.lessonId);
    check(definition?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual definition missing`);
    localized(definition?.title, `${item.lessonId} visual title`); localized(definition?.learnerAction, `${item.lessonId} learner action`); localized(definition?.observableOutcome, `${item.lessonId} outcome`); localized(definition?.modelScope, `${item.lessonId} model scope`); localized(definition?.modelLimitations, `${item.lessonId} model limits`);
    check(definition?.reviewStatus === "model-reviewed-with-scope-limits", `${item.lessonId}: review status mismatch`);
    check(Array.isArray(definition?.sceneIds) && definition.sceneIds.length >= 3, `${item.lessonId}: scene IDs missing`);
    check(Array.isArray(definition?.atlasIds) && definition.atlasIds.length > 0, `${item.lessonId}: Atlas IDs missing`);
  }
}

if (oracles) {
  check(Array.isArray(oracles) && oracles.length === 6, "visual oracles: expected six lesson records");
  const byId = new Map(oracles.map((entry) => [entry.lessonId, entry]));
  check(byId.get("P1-L19")?.fixtures?.some((entry) => entry.full && entry.overflow === 2), "L19 oracle: full-buffer fixture missing");
  check(byId.get("P1-L19")?.fixtures?.some((entry) => !entry.full && entry.waiting === 1), "L19 oracle: non-full fixture missing");
  check(byId.get("P1-L20")?.deviceFamilies?.length === 8 && byId.get("P1-L20")?.phaseCount === 4, "L20 oracle: eight distinct four-phase devices required");
  check(byId.get("P1-L21")?.fixtures?.some((entry) => entry.reading === entry.target && entry.actuator === "off"), "L21 oracle: equality boundary fixture missing");
  check(byId.get("P1-L22")?.facts?.SRAM?.volatile === true && byId.get("P1-L22")?.facts?.DRAM?.refresh === true, "L22 oracle: SRAM/DRAM facts incorrect");
  const gateTables = byId.get("P1-L23")?.truthTables;
  check(same(gateTables?.XOR?.map((entry) => entry.y), [0, 1, 1, 0]), "L23 oracle: XOR table incorrect");
  check(same(gateTables?.NAND?.map((entry) => entry.y), [1, 1, 1, 0]), "L23 oracle: NAND table incorrect");
  const circuits = byId.get("P1-L24")?.circuits;
  check(circuits?.alarm?.length === 8 && circuits?.permission?.length === 8, "L24 oracle: both circuits need eight rows");
  check(circuits?.alarm?.find((row) => row.a === 1 && row.b === 0 && row.c === 0)?.y === 1, "L24 oracle: alarm representative row incorrect");
}

const registry = fs.readFileSync(path.join(root, "app/lib/paper1/lesson-registry.ts"), "utf8");
const practiceRegistry = fs.readFileSync(path.join(root, "app/lib/paper1/practice-registry.ts"), "utf8");
const visualSource = fs.readFileSync(path.join(root, "app/components/paper1-learning/Chapter3VisualLab.tsx"), "utf8");
expected.forEach((entry) => { check(registry.includes(`\"${entry.slug}\"`), `${entry.slug}: missing from lesson registry`); check(visualSource.includes(entry.lessonId), `${entry.lessonId}: missing from Chapter 3 visual component`); });
check(practiceRegistry.includes('"3"'), "Chapter 3 practice registry entry missing");
check(visualSource.includes("GateShape") && visualSource.includes("truth table") && visualSource.includes("deviceSpecs"), "Chapter 3 visual implementation lacks gate/table/device-specific structures");

if (failures.length) {
  console.error("Paper 1 Chapter 3 contract: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Paper 1 Chapter 3 contract: PASS");
console.log("6 lessons · 13 objectives · 26 atomic requirements · 26 primary checks · 15 practice items / 60 marks · 6 interactive visual models");
