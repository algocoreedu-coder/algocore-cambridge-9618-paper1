import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const read = (name) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, name), "utf8")); }
  catch (error) { failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`); return null; }
};
const unique = (values, label) => check(new Set(values).size === values.length, `${label}: duplicate stable ID`);
const localized = (value, label) => check(isObject(value) && nonEmpty(value.en) && nonEmpty(value.vi), `${label}: EN/VI parity missing`);
const localizedList = (value, label, allowEmpty = false) => {
  check(Array.isArray(value) && (allowEmpty || value.length > 0), `${label}: localized list missing`);
  value?.forEach((entry, index) => localized(entry, `${label}[${index}]`));
};
const allStrings = (value, visit) => {
  if (typeof value === "string") visit(value);
  else if (Array.isArray(value)) value.forEach((entry) => allStrings(entry, visit));
  else if (isObject(value)) Object.values(value).forEach((entry) => allStrings(entry, visit));
};
const validateLocalizedTree = (value, label) => {
  if (Array.isArray(value)) return value.forEach((entry, index) => validateLocalizedTree(entry, `${label}[${index}]`));
  if (!isObject(value)) return;
  if (Object.hasOwn(value, "en") || Object.hasOwn(value, "vi")) localized(value, label);
  for (const [key, entry] of Object.entries(value)) validateLocalizedTree(entry, `${label}.${key}`);
};
const safe = (value, label) => allStrings(value, (entry) => {
  check(!/(?:[A-Z]:\\|file:\/\/|\.\.\/|CONTROLLED_CHECK)/i.test(entry), `${label}: private/local reference leaked`);
  check(!/\b(?:TODO|TBD|PLACEHOLDER|LOREM IPSUM|NOT_AUTHORED)\b/i.test(entry), `${label}: unfinished placeholder leaked`);
});

const expected = [
  { lessonId: "P1-L25", slug: "cpu-architecture", order: 25, strand: "4.1", objectives: ["AC26-4.1-01", "AC26-4.1-02", "AC26-4.1-03", "AC26-4.1-04"], requirements: ["REQ-4.1-01-01", "REQ-4.1-02-01", "REQ-4.1-02-02", "REQ-4.1-03-01", "REQ-4.1-03-02", "REQ-4.1-04-01", "REQ-4.1-04-02", "REQ-4.1-04-03"], prerequisites: [], atlas: ["BOOK-C04-P109-VON-NEUMANN", "BOOK-C04-P110-T4-1", "BOOK-C04-P111-FLAGS-POSITIVE", "BOOK-C04-P111-FLAGS-NEGATIVE", "BOOK-C04-P112-SYSTEM-BUSES"] },
  { lessonId: "P1-L26", slug: "performance-ports", order: 26, strand: "4.1", objectives: ["AC26-4.1-05", "AC26-4.1-06"], requirements: ["REQ-4.1-05-01", "REQ-4.1-05-02", "REQ-4.1-05-03", "REQ-4.1-05-04", "REQ-4.1-06-01", "REQ-4.1-06-02", "REQ-4.1-06-03"], prerequisites: [], atlas: ["BOOK-C04-P113-CORE-LINKS", "BOOK-C04-P114-PORT-CABLES", "BOOK-C04-P115-T4-2", "BOOK-C04-P116-T4-3", "BOOK-C04-P120-A4A-PORT-MATCH"] },
  { lessonId: "P1-L27", slug: "fetch-execute-interrupts", order: 27, strand: "4.1", objectives: ["AC26-4.1-07", "AC26-4.1-08"], requirements: ["REQ-4.1-07-01", "REQ-4.1-07-02", "REQ-4.1-08-01", "REQ-4.1-08-02", "REQ-4.1-08-03", "REQ-4.1-08-04"], prerequisites: ["P1-L25"], atlas: ["BOOK-C04-P117-FETCH-CYCLE", "BOOK-C04-P117-RTN", "BOOK-C04-P118-RTN-RISC", "BOOK-C04-P118-INTERRUPT-CYCLE"] },
  { lessonId: "P1-L28", slug: "assembly-translation", order: 28, strand: "4.2", objectives: ["AC26-4.2-01", "AC26-4.2-02", "AC26-4.2-03"], requirements: ["REQ-4.2-01-01", "REQ-4.2-02-01", "REQ-4.2-03-01"], prerequisites: [], atlas: ["BOOK-C04-P122-ASM-HEX-BINARY", "BOOK-C04-P122-OPCODE-OPERAND", "BOOK-C04-P122-LABEL-ADDRESS", "BOOK-C04-P123-ASSEMBLER-PASSES", "BOOK-C04-P123-ASSEMBLER-SYMBOLS", "BOOK-C04-P126-T4-9"] },
  { lessonId: "P1-L29", slug: "addressing-modes", order: 29, strand: "4.2", objectives: ["AC26-4.2-06"], requirements: ["REQ-4.2-06-01", "REQ-4.2-06-02", "REQ-4.2-06-03", "REQ-4.2-06-04", "REQ-4.2-06-05"], prerequisites: [], atlas: [] },
  { lessonId: "P1-L30", slug: "assembly-tracing", order: 30, strand: "4.2", objectives: ["AC26-4.2-04", "AC26-4.2-05"], requirements: ["REQ-4.2-04-01", "REQ-4.2-05-01", "REQ-4.2-05-02", "REQ-4.2-05-03", "REQ-4.2-05-04", "REQ-4.2-05-05"], prerequisites: ["P1-L29"], atlas: ["BOOK-C04-P124-T4-4", "BOOK-C04-P124-T4-5", "BOOK-C04-P124-T4-6", "BOOK-C04-P125-T4-7", "BOOK-C04-P125-T4-8", "BOOK-C04-P126-SUM-HIGHLEVEL", "BOOK-C04-P126-SUM-ASSEMBLY", "BOOK-C04-P127-SUM-SYMBOLS", "BOOK-C04-P127-SUM-TRACE", "BOOK-C04-P127-LOOP-HIGHLEVEL", "BOOK-C04-P127-LOOP-ASSEMBLY", "BOOK-C04-P128-LOOP-SYMBOLS", "BOOK-C04-P128-LOOP-TRACE", "BOOK-C04-P129-A4B-BRANCH"] },
  { lessonId: "P1-L31", slug: "bit-shifts", order: 31, strand: "4.3", objectives: ["AC26-4.3-01"], requirements: ["REQ-4.3-01-01", "REQ-4.3-01-02"], prerequisites: ["P1-L02"], atlas: ["BOOK-C04-P131-T4-10", "BOOK-C04-P132-A4C-BEFORE-AFTER"] },
  { lessonId: "P1-L32", slug: "bit-masking", order: 32, strand: "4.3", objectives: ["AC26-4.3-02", "AC26-4.3-03"], requirements: ["REQ-4.3-02-01", "REQ-4.3-03-01", "REQ-4.3-03-02", "REQ-4.3-03-03"], prerequisites: ["P1-L23", "P1-L31"], atlas: ["BOOK-C04-P130-AND-OR-XOR-TABLE", "BOOK-C04-P131-T4-11", "BOOK-C04-P132-SENSOR3-MASK", "BOOK-C04-P133-SENSOR-BIT-LAYOUT", "BOOK-C04-P134-Q5-ISA", "BOOK-C04-P134-Q5-PROGRAM", "BOOK-C04-P135-Q5-TRACE"] },
];

const lessonIds = new Set(expected.map((entry) => entry.lessonId));
const slugs = new Set(expected.map((entry) => entry.slug));
const objectives = new Set(expected.flatMap((entry) => entry.objectives));
const requirements = new Set(expected.flatMap((entry) => entry.requirements));
const requirementOwner = new Map(expected.flatMap((entry) => entry.requirements.map((id) => [id, entry])));
const coverageBlocks = Array.from({ length: 11 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);
check(expected.length === 8, "validator fixture must contain 8 lessons");
check(objectives.size === 17, `validator fixture must contain 17 objectives, got ${objectives.size}`);
check(requirements.size === 41, `validator fixture must contain 41 requirements, got ${requirements.size}`);
check(expected.reduce((sum, entry) => sum + entry.atlas.length, 0) === 43, "validator fixture must contain 43 Atlas IDs");

const catalog = read("content/paper1/catalog.json");
const manifest = read("content/paper1/release-manifest.json");
const definitions = read("content/paper1/visual-definitions.json");
const atlasAudit = read("content/paper1/chapter4-atlas-audit.json");
const practice = read("content/paper1/practice/chapter-4.json");
const oracles = read("content/paper1/chapter4-visual-oracles.json");

if (catalog) {
  const section = catalog.sections?.find((entry) => entry.id === "4");
  check(section?.status === "available", "catalog: Section 4 must be available");
  localized(section?.title, "catalog Section 4 title"); localized(section?.summary, "catalog Section 4 summary"); localized(section?.question, "catalog Section 4 question");
  check(catalog.sections?.filter((entry) => ["5", "6", "7", "8"].includes(entry.id)).every((entry) => entry.status === "planned"), "catalog: Sections 5–8 must remain planned");
  const strands = catalog.strands?.filter((entry) => entry.sectionId === "4") ?? [];
  check(same(strands.map((entry) => entry.id), ["4.1", "4.2", "4.3"]), "catalog: Chapter 4 strands/order mismatch");
  strands.forEach((entry) => localized(entry.title, `catalog strand ${entry.id}`));
  const topics = catalog.topics?.filter((entry) => entry.sectionId === "4") ?? [];
  check(topics.length === 8, `catalog: expected 8 Chapter 4 topics, got ${topics.length}`);
  unique(catalog.topics?.map((entry) => entry.lessonId) ?? [], "catalog lesson IDs");
  unique(catalog.topics?.map((entry) => entry.slug) ?? [], "catalog slugs");
  for (const item of expected) {
    const topic = topics.find((entry) => entry.lessonId === item.lessonId);
    check(Boolean(topic), `catalog: ${item.lessonId} missing`); if (!topic) continue;
    check(topic.topicId === item.lessonId && topic.slug === item.slug && topic.order === item.order && topic.strandId === item.strand, `${item.lessonId}: catalog identity/order/strand mismatch`);
    check(same(topic.objectiveIds, item.objectives), `${item.lessonId}: catalog objectives mismatch`);
    check(same(topic.requirementIds, item.requirements), `${item.lessonId}: catalog requirements mismatch`);
    check(same(topic.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: catalog prerequisites mismatch`);
    localized(topic.title, `${item.lessonId} catalog title`); localized(topic.summary, `${item.lessonId} catalog summary`);
    check(Array.isArray(topic.searchTerms) && topic.searchTerms.length > 0 && topic.searchTerms.every(nonEmpty), `${item.lessonId}: search terms missing`);
  }
  safe(catalog, "catalog");
}

if (manifest) {
  check(/chapter-?4/i.test(manifest.releaseId ?? ""), "release manifest must identify Chapter 4 candidate");
  unique(manifest.lessons?.map((entry) => entry.lessonId) ?? [], "release manifest lesson IDs");
  for (const item of expected) {
    const released = manifest.lessons?.find((entry) => entry.lessonId === item.lessonId);
    check(released?.slug === item.slug && released?.state === "available", `${item.lessonId}: manifest availability mismatch`);
    check(/^\d+\.\d+\.\d+$/.test(released?.contentVersion ?? "") && /^\d+\.\d+\.\d+$/.test(released?.assessmentVersion ?? ""), `${item.lessonId}: manifest version invalid`);
    check(same(released?.modelVersions, [`VIS-${item.lessonId}@1`]), `${item.lessonId}: manifest model version mismatch`);
  }
  safe(manifest, "release manifest");
}

const assessmentOwners = new Map();
for (const item of expected) {
  const lesson = read(`content/paper1/lessons/${item.slug}.json`);
  if (!lesson) continue;
  check(lesson.schemaVersion === 1 && lesson.lessonId === item.lessonId && lesson.slug === item.slug, `${item.lessonId}: lesson identity mismatch`);
  check(lesson.sectionId === "4" && lesson.strandId === item.strand, `${item.lessonId}: section/strand mismatch`);
  check(same(lesson.objectives?.map((entry) => entry.id), item.objectives), `${item.lessonId}: objective IDs mismatch`);
  check(same(lesson.requirementIds, item.requirements), `${item.lessonId}: requirement IDs mismatch`);
  check(same(lesson.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: prerequisites mismatch`);
  check(lesson.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual ID mismatch`);
  check(/^\d+\.\d+\.\d+$/.test(lesson.contentVersion ?? "") && /^\d+\.\d+\.\d+$/.test(lesson.assessmentVersion ?? ""), `${item.lessonId}: lesson version invalid`);
  validateLocalizedTree(lesson, item.lessonId);
  check(Array.isArray(lesson.theory) && lesson.theory.length >= 3, `${item.lessonId}: at least three theory blocks required`);
  check(Array.isArray(lesson.workedExample?.steps) && lesson.workedExample.steps.length >= 3, `${item.lessonId}: worked example needs at least three steps`);
  check(Array.isArray(lesson.recognition?.cues) && lesson.recognition.cues.length > 0, `${item.lessonId}: recognition cues missing`);
  check(Array.isArray(lesson.recognition?.misconceptions) && lesson.recognition.misconceptions.length > 0, `${item.lessonId}: misconception repair missing`);
  check(isObject(lesson.recall), `${item.lessonId}: recall missing`);
  check(lesson.assessments?.length === item.requirements.length, `${item.lessonId}: expected one primary assessment per requirement`);
  unique(lesson.assessments?.map((entry) => entry.id) ?? [], `${item.lessonId} assessment IDs`);
  for (const requirementId of item.requirements) {
    const matches = lesson.assessments?.filter((entry) => entry.requirementId === requirementId) ?? [];
    check(matches.length === 1, `${item.lessonId}/${requirementId}: expected exactly one primary assessment`);
    const assessment = matches[0]; if (!assessment) continue;
    check(assessment.id === `${item.lessonId}-CHECK-${requirementId}`, `${item.lessonId}/${requirementId}: assessment ID mismatch`);
    check(assessment.origin === "original" && assessment.claim_kind === "algocore_guidance", `${assessment.id}: provenance mismatch`);
    if (["single-choice", "numeric", "short-text"].includes(assessment.kind)) {
      if (assessment.kind === "single-choice") check(Array.isArray(assessment.choices) && assessment.choices.some((choice) => choice.id === assessment.correctChoiceId), `${assessment.id}: deterministic choice answer missing`);
      else check(Array.isArray(assessment.acceptedAnswers) && assessment.acceptedAnswers.length > 0 && assessment.acceptedAnswers.every(nonEmpty), `${assessment.id}: deterministic acceptedAnswers missing`);
    }
    check(!assessmentOwners.has(requirementId), `${requirementId}: duplicate primary owner`);
    assessmentOwners.set(requirementId, item.lessonId);
  }
  check(same(Object.keys(lesson.contractCoverage ?? {}), coverageBlocks), `${item.lessonId}: B01–B11 contract keys mismatch`);
  coverageBlocks.forEach((block) => check(Array.isArray(lesson.contractCoverage?.[block]) && lesson.contractCoverage[block].length > 0 && lesson.contractCoverage[block].every(nonEmpty), `${item.lessonId}/${block}: coverage empty`));
  const sourceIds = lesson.sources?.map((entry) => entry.id) ?? [];
  unique(sourceIds, `${item.lessonId} source IDs`);
  for (const id of ["SYL-2026", "BOOK-C04", "ALG-P1"]) check(sourceIds.includes(id), `${item.lessonId}: source ${id} missing`);
  const sourceKinds = new Set(lesson.sources?.map((entry) => entry.kind));
  for (const kind of ["syllabus", "coursebook", "algocore"]) check(sourceKinds.has(kind), `${item.lessonId}: source kind ${kind} missing`);
  lesson.sources?.forEach((source, index) => check(nonEmpty(source.locator), `${item.lessonId}: source[${index}] locator missing`));
  const declaredSources = new Set(sourceIds);
  lesson.theory?.forEach((block) => block.sourceIds?.forEach((id) => check(declaredSources.has(id), `${item.lessonId}/${block.id}: undeclared source ${id}`)));
  const released = manifest?.lessons?.find((entry) => entry.lessonId === item.lessonId);
  check(released?.contentVersion === lesson.contentVersion && released?.assessmentVersion === lesson.assessmentVersion, `${item.lessonId}: manifest/lesson version mismatch`);
  safe(lesson, item.lessonId);
}
check(assessmentOwners.size === 41, `primary assessments cover ${assessmentOwners.size}/41 requirements`);

if (practice) {
  check(practice.schemaVersion === 1 && practice.practiceId === "P1-CP04" && practice.chapterId === "4", "practice identity mismatch");
  check(practice.courseId === "CAIE-9618-P1-2026", "practice course ID mismatch");
  validateLocalizedTree(practice, "P1-CP04");
  const provenanceIds = practice.provenance?.map((entry) => entry.id) ?? [];
  for (const id of ["SYL-2026", "BOOK-C04", "ALG-P1"]) check(provenanceIds.includes(id), `practice provenance ${id} missing`);
  practice.provenance?.forEach((source, index) => check(nonEmpty(source.locator), `practice provenance[${index}] locator missing`));
  check(practice.items?.length === 16, `practice: expected 16 items, got ${practice.items?.length ?? 0}`);
  unique(practice.items?.map((entry) => entry.id) ?? [], "practice item IDs");
  const levels = { guided: 0, faded: 0, independent: 0 };
  const aoMarks = { AO1: 0, AO2: 0 };
  let itemMarks = 0;
  let pointMarks = 0;
  const itemRequirements = new Set();
  const pointRequirements = new Set();
  const itemObjectives = new Set();
  const markingPointIds = [];
  practice.items?.forEach((entry, index) => {
    check(entry.id === `P1-CP04-Q${String(index + 1).padStart(2, "0")}`, `${entry.id}: stable item ID/order mismatch`);
    check(Object.hasOwn(levels, entry.level), `${entry.id}: invalid level`); if (Object.hasOwn(levels, entry.level)) levels[entry.level] += 1;
    check(Object.hasOwn(aoMarks, entry.ao), `${entry.id}: invalid AO`); if (Object.hasOwn(aoMarks, entry.ao)) aoMarks[entry.ao] += entry.marks;
    check(Number.isInteger(entry.marks) && entry.marks > 0, `${entry.id}: invalid marks`); itemMarks += entry.marks;
    check(entry.origin === "original" && entry.claim_kind === "algocore_guidance", `${entry.id}: must be AlgoCore-original`);
    check(slugs.has(entry.revisitLessonSlug), `${entry.id}: revisit slug is not a Chapter 4 lesson`);
    entry.requirementIds?.forEach((id) => { check(requirements.has(id), `${entry.id}: unknown requirement ${id}`); itemRequirements.add(id); });
    entry.objectiveIds?.forEach((id) => { check(objectives.has(id), `${entry.id}: unknown objective ${id}`); itemObjectives.add(id); });
    const owner = expected.find((lesson) => lesson.slug === entry.revisitLessonSlug);
    check(entry.requirementIds?.some((id) => owner?.requirements.includes(id)), `${entry.id}: revisit lesson owns no assessed requirement`);
    let marks = 0;
    entry.solution?.markingPoints?.forEach((point, pointIndex) => {
      const id = `P1-CP04-Q${String(index + 1).padStart(2, "0")}-M${pointIndex + 1}`;
      check(point.id === id, `${entry.id}: marking point ${pointIndex + 1} must be ${id}`);
      check(Number.isInteger(point.marks) && point.marks > 0, `${point.id}: invalid marks`);
      markingPointIds.push(point.id); marks += point.marks; pointMarks += point.marks;
      point.requirementIds?.forEach((requirementId) => { check(entry.requirementIds?.includes(requirementId), `${point.id}: requirement outside item`); pointRequirements.add(requirementId); });
    });
    check(marks === entry.marks, `${entry.id}: item/marking-point mark mismatch`);
    const evidenced = new Set(entry.solution?.markingPoints?.flatMap((point) => point.requirementIds ?? []) ?? []);
    entry.requirementIds?.forEach((id) => check(evidenced.has(id), `${entry.id}: ${id} has no marking-point evidence`));
  });
  unique(markingPointIds, "practice marking-point IDs");
  check(practice.totalMarks === 60 && itemMarks === 60 && pointMarks === 60, `practice marks mismatch (${practice.totalMarks}/${itemMarks}/${pointMarks})`);
  check(aoMarks.AO1 === 36 && aoMarks.AO2 === 24 && practice.aoBlueprint?.AO1 === 36 && practice.aoBlueprint?.AO2 === 24, `practice AO mismatch (${aoMarks.AO1}:${aoMarks.AO2})`);
  check(same(levels, { guided: 5, faded: 5, independent: 6 }), `practice levels mismatch (${levels.guided}:${levels.faded}:${levels.independent})`);
  check(itemRequirements.size === 41 && [...requirements].every((id) => itemRequirements.has(id)), `practice item requirement coverage ${itemRequirements.size}/41`);
  check(pointRequirements.size === 41 && [...requirements].every((id) => pointRequirements.has(id)), `practice marking-point requirement coverage ${pointRequirements.size}/41`);
  check(itemObjectives.size === 17 && [...objectives].every((id) => itemObjectives.has(id)), `practice objective coverage ${itemObjectives.size}/17`);
  safe(practice, "P1-CP04");
}

if (definitions) {
  const chapter = definitions.filter((entry) => lessonIds.has(entry.lessonId));
  check(chapter.length === 8, `visual definitions: expected 8, got ${chapter.length}`);
  unique(definitions.map((entry) => entry.visualId), "visual definition IDs");
  for (const item of expected) {
    const definition = chapter.find((entry) => entry.lessonId === item.lessonId);
    check(definition?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual definition missing`);
    for (const key of ["title", "learnerAction", "observableOutcome", "modelScope", "modelLimitations"]) localized(definition?.[key], `${item.lessonId} ${key}`);
    check(definition?.reviewStatus === "model-reviewed-with-scope-limits", `${item.lessonId}: visual review status mismatch`);
    check(same(definition?.atlasIds, item.atlas), `${item.lessonId}: classified Atlas IDs mismatch`);
    check(Array.isArray(definition?.sceneIds) && definition.sceneIds.length >= 4, `${item.lessonId}: scene IDs missing`);
    check(item.lessonId !== "P1-L29" || /original|AlgoCore/i.test(`${definition?.modelScope?.en} ${definition?.modelLimitations?.en}`), "P1-L29: original-model boundary missing");
  }
  const atlasIds = chapter.flatMap((entry) => entry.atlasIds);
  const sceneIds = chapter.flatMap((entry) => entry.sceneIds);
  check(atlasIds.length === 43, "visual definitions: Chapter 4 must expose exactly 43 Atlas IDs");
  unique(atlasIds, "Chapter 4 Atlas IDs");
  unique(sceneIds, "Chapter 4 scene IDs");
  safe(chapter, "Chapter 4 visual definitions");
}

if (atlasAudit) {
  const allowedDispositions = [
    "INLINE_UNDERSTAND",
    "INLINE_OBSERVE_SCENE",
    "INLINE_WORKED_EXAMPLE",
    "INLINE_RECOGNISE",
    "LESSON_REFERENCE_DISCLOSURE",
    "CHAPTER_ATLAS_ONLY",
    "DUPLICATE_OR_REMOVE",
  ];
  const allowedDispositionSet = new Set(allowedDispositions);
  const expectedAtlasIds = expected.flatMap((entry) => entry.atlas);
  const auditIds = atlasAudit.items?.map((entry) => entry.atlasId) ?? [];
  const auditById = new Map(atlasAudit.items?.map((entry) => [entry.atlasId, entry]) ?? []);
  const definitionByLesson = new Map((definitions ?? []).filter((entry) => lessonIds.has(entry.lessonId)).map((entry) => [entry.lessonId, entry]));

  check(atlasAudit.schemaVersion === 1 && atlasAudit.auditId === "P1-C04-ATLAS-AUDIT-2026-10-04" && atlasAudit.chapterId === "4", "Atlas audit: identity mismatch");
  check(same(atlasAudit.taxonomy?.allowedDispositions, allowedDispositions), "Atlas audit: allowed disposition taxonomy mismatch");
  check(same(atlasAudit.taxonomy?.renderStatuses, ["not-rendered-source-pointer"]), "Atlas audit: render-status taxonomy mismatch");
  check(same(atlasAudit.taxonomy?.referenceStatuses, ["mapped-to-original-learner-visual"]), "Atlas audit: reference-status taxonomy mismatch");
  localized(atlasAudit.copyrightBoundary, "Atlas audit copyright boundary");
  check(atlasAudit.authority?.learnerVisualOrigin === "AlgoCore-original", "Atlas audit: learner visual origin must be AlgoCore-original");
  check(atlasAudit.inventory?.totalIds === 43 && atlasAudit.inventory?.uniqueIds === 43, "Atlas audit: declared inventory must be 43/43");
  check(Array.isArray(atlasAudit.items) && atlasAudit.items.length === 43, `Atlas audit: expected exactly 43 records, got ${atlasAudit.items?.length ?? 0}`);
  unique(auditIds, "Atlas audit IDs");
  check(same([...auditIds].sort(), [...expectedAtlasIds].sort()), "Atlas audit: exact ID inventory differs from the Chapter 4 contract");
  check(same(atlasAudit.inventory?.zeroAtlasLessonIds, ["P1-L29"]), "Atlas audit: L29 must be the explicit zero-Atlas lesson");

  for (const item of expected) {
    const lessonAuditIds = atlasAudit.items?.filter((entry) => entry.lessonId === item.lessonId).map((entry) => entry.atlasId) ?? [];
    check(same(lessonAuditIds, item.atlas), `${item.lessonId}: Atlas audit mapping differs from the lesson contract`);
    check(same(lessonAuditIds, definitionByLesson.get(item.lessonId)?.atlasIds ?? []), `${item.lessonId}: Atlas audit mapping differs from visual-definitions.json`);
    check(atlasAudit.inventory?.lessonCounts?.[item.lessonId] === item.atlas.length, `${item.lessonId}: Atlas audit lesson count mismatch`);
  }

  for (const atlasId of expectedAtlasIds) {
    const audit = auditById.get(atlasId);
    const owner = expected.find((entry) => entry.atlas.includes(atlasId));
    check(Boolean(audit), `${atlasId}: Atlas audit record missing`); if (!audit) continue;
    check(audit.lessonId === owner?.lessonId, `${atlasId}: Atlas audit lesson owner mismatch`);
    check(allowedDispositionSet.has(audit.disposition), `${atlasId}: unsupported disposition ${audit.disposition ?? "missing"}`);
    localized(audit.rationale, `${atlasId} rationale`);
    check(nonEmpty(audit.sourceLocator), `${atlasId}: source locator missing`);
    check(audit.renderStatus === "not-rendered-source-pointer", `${atlasId}: book source must not render in the public learner runtime`);
    check(audit.referenceStatus === "mapped-to-original-learner-visual", `${atlasId}: reference status mismatch`);
    check(audit.replacementVisualId === `VIS-${audit.lessonId}`, `${atlasId}: original learner visual mapping mismatch`);
    check(/AlgoCore-original/.test(audit.rationale.en) && /gốc của AlgoCore/.test(audit.rationale.vi), `${atlasId}: bilingual copyright rationale missing`);
  }

  const actualDispositionCounts = Object.fromEntries(allowedDispositions.map((disposition) => [disposition, atlasAudit.items?.filter((entry) => entry.disposition === disposition).length ?? 0]));
  check(same(atlasAudit.inventory?.dispositionCounts, actualDispositionCounts), "Atlas audit: disposition counts do not recompute");
  safe(atlasAudit, "Chapter 4 Atlas audit");
}

if (oracles) {
  check(Array.isArray(oracles) && oracles.length === 8, "visual oracles: expected 8 records");
  unique(oracles?.map((entry) => entry.lessonId) ?? [], "visual oracle lesson IDs");
  for (const item of expected) {
    const oracle = oracles.find((entry) => entry.lessonId === item.lessonId);
    check(oracle?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: oracle record missing`);
  }
  const byId = new Map(oracles.map((entry) => [entry.lessonId, entry]));
  check(byId.get("P1-L25")?.fixtures?.length === 2, "L25 oracle: read/write fixtures missing");
  check(Object.keys(byId.get("P1-L26")?.cases ?? {}).length === 8, "L26 oracle: eight cases required");
  check(Object.values(byId.get("P1-L27")?.packets ?? {}).every((packet) => packet.length === 4), "L27 oracle: every packet must contain four states");
  check(byId.get("P1-L28")?.fixture?.symbols?.DONE === 103, "L28 oracle: forward label fixture incorrect");
  check(byId.get("P1-L29")?.fixtures?.find((entry) => entry.mode === "immediate")?.readCount === 0, "L29 oracle: immediate must not dereference memory");
  check(byId.get("P1-L30")?.branchFixture?.input65?.at(-1)?.instruction === "END", "L30 oracle: input 65 END state missing");
  check(byId.get("P1-L30")?.loadStoreFixture?.states?.at(-1)?.instruction === "END" && byId.get("P1-L30")?.loadStoreFixture?.states?.at(-1)?.PC === 5, "L30 oracle: END boundary missing");
  check(new Set(byId.get("P1-L31")?.fixtures?.map((entry) => entry.kind)).size === 6, "L31 oracle: all six shifts required");
  check(new Set(byId.get("P1-L32")?.fixtures?.map((entry) => entry.operation)).size === 3, "L32 oracle: AND/OR/XOR fixtures required");
  safe(oracles, "Chapter 4 visual oracles");
}

const lessonRegistry = fs.readFileSync(path.join(root, "app/lib/paper1/lesson-registry.ts"), "utf8");
const practiceRegistry = fs.readFileSync(path.join(root, "app/lib/paper1/practice-registry.ts"), "utf8");
const visualDispatcher = fs.readFileSync(path.join(root, "app/components/paper1-learning/Paper1VisualLab.tsx"), "utf8");
const chapterVisual = fs.readFileSync(path.join(root, "app/components/paper1-learning/Chapter4VisualLab.tsx"), "utf8");
const modelSource = fs.readFileSync(path.join(root, "app/lib/paper1/chapter4-models.ts"), "utf8");
expected.forEach((item) => {
  check(lessonRegistry.includes(`"${item.slug}"`), `${item.slug}: lesson registry entry missing`);
  check(chapterVisual.includes(item.lessonId), `${item.lessonId}: Chapter 4 visual implementation missing`);
});
check(practiceRegistry.includes('"4"'), "P1-CP04 practice registry entry missing");
check(visualDispatcher.includes("Chapter4VisualLab") && visualDispatcher.includes("chapter4VisualLessonIds"), "Paper1VisualLab: Chapter 4 dispatch missing");
for (const symbol of ["cpuTransferFrames", "performanceFrames", "cpuPacketFrames", "assemblerFrames", "addressingFrames", "branchPacketFrames", "loadStorePacketFrames", "shiftFrames", "maskFrames"]) check(modelSource.includes(`export function ${symbol}`), `Chapter 4 model export ${symbol} missing`);
check(modelSource.includes("instructionMemory") && modelSource.includes("savedContext") && modelSource.includes("deviceState"), "Chapter 4 model state lacks instruction-memory, saved-context or device-state evidence");
for (const marker of ["noInterruptTitles", "staticEquivalent", "perBitLedger", "Device scenario"]) check(chapterVisual.includes(marker), `Chapter 4 visual implementation lacks ${marker}`);

if (failures.length) {
  console.error(`Paper 1 Chapter 4 contract: FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Paper 1 Chapter 4 contract: PASS");
console.log("8 lessons · 17 objectives · 41 atomic requirements · 41 primary checks · 16 practice items / 60 marks · AO1:AO2 36:24 · levels 5:5:6 · 8 interactive visual models / 43 Atlas IDs");
