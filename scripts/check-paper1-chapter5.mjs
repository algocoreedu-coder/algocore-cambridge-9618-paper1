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
const source = (name) => {
  try { return fs.readFileSync(path.join(root, name), "utf8"); }
  catch (error) { failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`); return ""; }
};
const unique = (values, label) => check(new Set(values).size === values.length, `${label}: duplicate stable ID`);
const localized = (value, label) => check(isObject(value) && nonEmpty(value.en) && nonEmpty(value.vi), `${label}: EN/VI parity missing`);
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
  {
    lessonId: "P1-L33",
    slug: "operating-systems",
    order: 33,
    strand: "5.1",
    learningMode: "scenario",
    objectives: ["AC26-5.1-01", "AC26-5.1-02"],
    requirements: ["REQ-5.1-01-01", "REQ-5.1-02-01", "REQ-5.1-02-02", "REQ-5.1-02-03", "REQ-5.1-02-04", "REQ-5.1-02-05"],
    prerequisites: [],
  },
  {
    lessonId: "P1-L34",
    slug: "utilities-libraries",
    order: 34,
    strand: "5.1",
    learningMode: "scenario",
    objectives: ["AC26-5.1-03", "AC26-5.1-04"],
    requirements: ["REQ-5.1-03-01", "REQ-5.1-03-02", "REQ-5.1-03-03", "REQ-5.1-03-04", "REQ-5.1-03-05", "REQ-5.1-03-06", "REQ-5.1-04-01", "REQ-5.1-04-02"],
    prerequisites: [],
  },
  {
    lessonId: "P1-L35",
    slug: "translators",
    order: 35,
    strand: "5.2",
    learningMode: "comparison",
    objectives: ["AC26-5.2-01", "AC26-5.2-02", "AC26-5.2-03"],
    requirements: ["REQ-5.2-01-01", "REQ-5.2-01-02", "REQ-5.2-01-03", "REQ-5.2-02-01", "REQ-5.2-02-02", "REQ-5.2-03-01"],
    prerequisites: [],
  },
  {
    lessonId: "P1-L36",
    slug: "ide-tools",
    order: 36,
    strand: "5.2",
    learningMode: "scenario",
    objectives: ["AC26-5.2-04"],
    requirements: ["REQ-5.2-04-01", "REQ-5.2-04-02", "REQ-5.2-04-03", "REQ-5.2-04-04"],
    prerequisites: [],
  },
];

const lessonIds = new Set(expected.map((entry) => entry.lessonId));
const slugs = new Set(expected.map((entry) => entry.slug));
const objectives = new Set(expected.flatMap((entry) => entry.objectives));
const requirements = new Set(expected.flatMap((entry) => entry.requirements));
const coverageBlocks = Array.from({ length: 11 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);
check(expected.length === 4, "validator fixture must contain 4 lessons");
check(objectives.size === 8, `validator fixture must contain 8 objectives, got ${objectives.size}`);
check(requirements.size === 24, `validator fixture must contain 24 requirements, got ${requirements.size}`);

const catalog = read("content/paper1/catalog.json");
const manifest = read("content/paper1/release-manifest.json");
const definitions = read("content/paper1/visual-definitions.json");
const atlasAudit = read("content/paper1/chapter5-atlas-audit.json");
const visualPlacements = read("content/paper1/visual-placements.json");
const practice = read("content/paper1/practice/chapter-5.json");
const oracles = read("content/paper1/chapter5-visual-oracles.json");
const lessonPayloads = new Map();

if (catalog) {
  const section = catalog.sections?.find((entry) => entry.id === "5");
  check(section?.status === "available", "catalog: Section 5 must be available");
  localized(section?.title, "catalog Section 5 title");
  localized(section?.summary, "catalog Section 5 summary");
  localized(section?.question, "catalog Section 5 question");
  check(catalog.sections?.filter((entry) => ["6", "7", "8"].includes(entry.id)).every((entry) => entry.status === "planned"), "catalog: Sections 6–8 must remain planned");
  const strands = catalog.strands?.filter((entry) => entry.sectionId === "5") ?? [];
  check(same(strands.map((entry) => entry.id), ["5.1", "5.2"]), "catalog: Chapter 5 strands/order mismatch");
  strands.forEach((entry) => localized(entry.title, `catalog strand ${entry.id}`));
  const topics = catalog.topics?.filter((entry) => entry.sectionId === "5") ?? [];
  check(topics.length === 4, `catalog: expected 4 Chapter 5 topics, got ${topics.length}`);
  unique(catalog.topics?.map((entry) => entry.lessonId) ?? [], "catalog lesson IDs");
  unique(catalog.topics?.map((entry) => entry.slug) ?? [], "catalog slugs");
  for (const item of expected) {
    const topic = topics.find((entry) => entry.lessonId === item.lessonId);
    check(Boolean(topic), `catalog: ${item.lessonId} missing`); if (!topic) continue;
    check(topic.topicId === item.lessonId && topic.slug === item.slug && topic.order === item.order && topic.strandId === item.strand, `${item.lessonId}: catalog identity/order/strand mismatch`);
    check(topic.learningMode === item.learningMode, `${item.lessonId}: catalog learning mode mismatch`);
    check(same(topic.objectiveIds, item.objectives), `${item.lessonId}: catalog objectives mismatch`);
    check(same(topic.requirementIds, item.requirements), `${item.lessonId}: catalog requirements mismatch`);
    check(same(topic.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: catalog prerequisites mismatch`);
    localized(topic.title, `${item.lessonId} catalog title`);
    localized(topic.summary, `${item.lessonId} catalog summary`);
    check(Array.isArray(topic.searchTerms) && topic.searchTerms.length > 0 && topic.searchTerms.every(nonEmpty), `${item.lessonId}: search terms missing`);
  }
  safe(catalog, "catalog");
}

if (manifest) {
  check(/chapter-?5/i.test(manifest.releaseId ?? ""), "release manifest must identify Chapter 5 candidate");
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
  lessonPayloads.set(item.lessonId, lesson);
  check(lesson.schemaVersion === 1 && lesson.lessonId === item.lessonId && lesson.slug === item.slug, `${item.lessonId}: lesson identity mismatch`);
  check(lesson.sectionId === "5" && lesson.strandId === item.strand, `${item.lessonId}: section/strand mismatch`);
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
  for (const id of ["SYL-2026", "BOOK-C05", "ALG-P1"]) check(sourceIds.includes(id), `${item.lessonId}: source ${id} missing`);
  const sourceKinds = new Set(lesson.sources?.map((entry) => entry.kind));
  for (const kind of ["syllabus", "coursebook", "algocore"]) check(sourceKinds.has(kind), `${item.lessonId}: source kind ${kind} missing`);
  lesson.sources?.forEach((entry, index) => check(nonEmpty(entry.locator), `${item.lessonId}: source[${index}] locator missing`));
  const declaredSources = new Set(sourceIds);
  lesson.theory?.forEach((block) => block.sourceIds?.forEach((id) => check(declaredSources.has(id), `${item.lessonId}/${block.id}: undeclared source ${id}`)));
  const released = manifest?.lessons?.find((entry) => entry.lessonId === item.lessonId);
  check(released?.contentVersion === lesson.contentVersion && released?.assessmentVersion === lesson.assessmentVersion, `${item.lessonId}: manifest/lesson version mismatch`);
  safe(lesson, item.lessonId);
}
check(assessmentOwners.size === 24, `primary assessments cover ${assessmentOwners.size}/24 requirements`);

if (practice) {
  check(practice.schemaVersion === 1 && practice.practiceId === "P1-CP05" && practice.chapterId === "5", "practice identity mismatch");
  check(practice.courseId === "CAIE-9618-P1-2026", "practice course ID mismatch");
  validateLocalizedTree(practice, "P1-CP05");
  const provenanceIds = practice.provenance?.map((entry) => entry.id) ?? [];
  for (const id of ["SYL-2026", "BOOK-C05", "ALG-P1"]) check(provenanceIds.includes(id), `practice provenance ${id} missing`);
  practice.provenance?.forEach((entry, index) => check(nonEmpty(entry.locator), `practice provenance[${index}] locator missing`));
  check(practice.items?.length === 12, `practice: expected 12 items, got ${practice.items?.length ?? 0}`);
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
    check(entry.id === `P1-CP05-Q${String(index + 1).padStart(2, "0")}`, `${entry.id}: stable item ID/order mismatch`);
    check(Object.hasOwn(levels, entry.level), `${entry.id}: invalid level`); if (Object.hasOwn(levels, entry.level)) levels[entry.level] += 1;
    check(Object.hasOwn(aoMarks, entry.ao), `${entry.id}: invalid AO`); if (Object.hasOwn(aoMarks, entry.ao)) aoMarks[entry.ao] += entry.marks;
    check(Number.isInteger(entry.marks) && entry.marks > 0, `${entry.id}: invalid marks`); itemMarks += entry.marks;
    check(entry.origin === "original" && entry.claim_kind === "algocore_guidance", `${entry.id}: must be AlgoCore-original`);
    check(slugs.has(entry.revisitLessonSlug), `${entry.id}: revisit slug is not a Chapter 5 lesson`);
    entry.requirementIds?.forEach((id) => { check(requirements.has(id), `${entry.id}: unknown requirement ${id}`); itemRequirements.add(id); });
    entry.objectiveIds?.forEach((id) => { check(objectives.has(id), `${entry.id}: unknown objective ${id}`); itemObjectives.add(id); });
    const owner = expected.find((lesson) => lesson.slug === entry.revisitLessonSlug);
    check(entry.requirementIds?.some((id) => owner?.requirements.includes(id)), `${entry.id}: revisit lesson owns no assessed requirement`);
    let marks = 0;
    entry.solution?.markingPoints?.forEach((point, pointIndex) => {
      const id = `P1-CP05-Q${String(index + 1).padStart(2, "0")}-M${pointIndex + 1}`;
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
  check(same(levels, { guided: 4, faded: 4, independent: 4 }), `practice levels mismatch (${levels.guided}:${levels.faded}:${levels.independent})`);
  check(itemRequirements.size === 24 && [...requirements].every((id) => itemRequirements.has(id)), `practice item requirement coverage ${itemRequirements.size}/24`);
  check(pointRequirements.size === 24 && [...requirements].every((id) => pointRequirements.has(id)), `practice marking-point requirement coverage ${pointRequirements.size}/24`);
  check(itemObjectives.size === 8 && [...objectives].every((id) => itemObjectives.has(id)), `practice objective coverage ${itemObjectives.size}/8`);
  safe(practice, "P1-CP05");
}

if (definitions && atlasAudit) {
  const chapter = definitions.filter((entry) => lessonIds.has(entry.lessonId));
  check(chapter.length === 4, `visual definitions: expected 4, got ${chapter.length}`);
  unique(definitions.map((entry) => entry.visualId), "visual definition IDs");
  const auditByLesson = new Map(expected.map((entry) => [entry.lessonId, atlasAudit.items?.filter((audit) => audit.lessonId === entry.lessonId).map((audit) => audit.atlasId) ?? []]));
  for (const item of expected) {
    const definition = chapter.find((entry) => entry.lessonId === item.lessonId);
    check(definition?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual definition missing`);
    for (const key of ["title", "learnerAction", "observableOutcome", "modelScope", "modelLimitations"]) localized(definition?.[key], `${item.lessonId} ${key}`);
    check(definition?.reviewStatus === "model-reviewed-with-scope-limits", `${item.lessonId}: visual review status mismatch`);
    check(same(definition?.atlasIds, auditByLesson.get(item.lessonId)), `${item.lessonId}: visual-definition/Atlas-audit mapping mismatch`);
    check(Array.isArray(definition?.sceneIds) && definition.sceneIds.length >= 4, `${item.lessonId}: scene IDs missing`);
  }
  const atlasIds = chapter.flatMap((entry) => entry.atlasIds);
  const sceneIds = chapter.flatMap((entry) => entry.sceneIds);
  check(atlasIds.length === 26, `visual definitions: Chapter 5 must expose exactly 26 Atlas IDs, got ${atlasIds.length}`);
  unique(atlasIds, "Chapter 5 Atlas IDs");
  unique(sceneIds, "Chapter 5 scene IDs");
  safe(chapter, "Chapter 5 visual definitions");
}

if (atlasAudit) {
  const allowedDispositions = ["INLINE_UNDERSTAND", "INLINE_OBSERVE_SCENE", "INLINE_WORKED_EXAMPLE", "INLINE_RECOGNISE", "LESSON_REFERENCE_DISCLOSURE", "CHAPTER_ATLAS_ONLY", "DUPLICATE_OR_REMOVE"];
  const allowedDispositionSet = new Set(allowedDispositions);
  const auditIds = atlasAudit.items?.map((entry) => entry.atlasId) ?? [];
  check(atlasAudit.schemaVersion === 1 && atlasAudit.auditId === "P1-C05-ATLAS-AUDIT-2026-10-04" && atlasAudit.chapterId === "5", "Atlas audit: identity mismatch");
  check(same(atlasAudit.taxonomy?.allowedDispositions, allowedDispositions), "Atlas audit: allowed disposition taxonomy mismatch");
  check(same(atlasAudit.taxonomy?.renderStatuses, ["not-rendered-source-pointer"]), "Atlas audit: render-status taxonomy mismatch");
  check(same(atlasAudit.taxonomy?.referenceStatuses, ["mapped-to-original-learner-visual"]), "Atlas audit: reference-status taxonomy mismatch");
  localized(atlasAudit.copyrightBoundary, "Atlas audit copyright boundary");
  check(atlasAudit.authority?.learnerVisualOrigin === "AlgoCore-original", "Atlas audit: learner visual origin must be AlgoCore-original");
  check(atlasAudit.inventory?.totalIds === 26 && atlasAudit.inventory?.uniqueIds === 26, "Atlas audit: declared inventory must be 26/26");
  check(Array.isArray(atlasAudit.items) && atlasAudit.items.length === 26, `Atlas audit: expected exactly 26 records, got ${atlasAudit.items?.length ?? 0}`);
  unique(auditIds, "Atlas audit IDs");
  check(auditIds.every((id) => /^BOOK-C05-P\d{3}-[A-Z0-9-]+$/.test(id)), "Atlas audit: every source pointer must use BOOK-C05-Pnnn-* format");
  const actualLessonCounts = Object.fromEntries(expected.map((item) => [item.lessonId, atlasAudit.items?.filter((entry) => entry.lessonId === item.lessonId).length ?? 0]));
  check(same(atlasAudit.inventory?.lessonCounts, actualLessonCounts), "Atlas audit: lesson counts do not recompute");
  const actualZeroLessons = expected.filter((item) => actualLessonCounts[item.lessonId] === 0).map((item) => item.lessonId);
  check(same(atlasAudit.inventory?.zeroAtlasLessonIds, actualZeroLessons), "Atlas audit: zero-Atlas lesson list mismatch");
  for (const audit of atlasAudit.items ?? []) {
    check(lessonIds.has(audit.lessonId), `${audit.atlasId}: unknown Chapter 5 lesson owner`);
    check(allowedDispositionSet.has(audit.disposition), `${audit.atlasId}: unsupported disposition ${audit.disposition ?? "missing"}`);
    localized(audit.rationale, `${audit.atlasId} rationale`);
    check(nonEmpty(audit.sourceLocator), `${audit.atlasId}: source locator missing`);
    check(audit.renderStatus === "not-rendered-source-pointer", `${audit.atlasId}: book source must not render in the public learner runtime`);
    check(audit.referenceStatus === "mapped-to-original-learner-visual", `${audit.atlasId}: reference status mismatch`);
    check(audit.replacementVisualId === `VIS-${audit.lessonId}`, `${audit.atlasId}: original learner visual mapping mismatch`);
  }
  const actualDispositionCounts = Object.fromEntries(allowedDispositions.map((disposition) => [disposition, atlasAudit.items?.filter((entry) => entry.disposition === disposition).length ?? 0]));
  check(same(atlasAudit.inventory?.dispositionCounts, actualDispositionCounts), "Atlas audit: disposition counts do not recompute");
  safe(atlasAudit, "Chapter 5 Atlas audit");
}

if (atlasAudit && visualPlacements) {
  const sourcePointerLessons = visualPlacements.sourcePointerLessons ?? [];
  const expectedStage = {
    INLINE_UNDERSTAND: "understand",
    INLINE_OBSERVE_SCENE: "observe",
    INLINE_WORKED_EXAMPLE: "worked-example",
    INLINE_RECOGNISE: "recognise",
  };
  const instructionalDispositions = new Set(Object.keys(expectedStage));
  const auditById = new Map(atlasAudit.items.map((entry) => [entry.atlasId, entry]));
  const sourcePointerRows = sourcePointerLessons.flatMap((lesson) => [
    ...(lesson.instructionalPlacements ?? []).map((placement) => ({ lesson, placement, kind: "instructional" })),
    ...(lesson.referencePlacements ?? []).map((placement) => ({ lesson, placement, kind: "reference" })),
  ]);
  check(sourcePointerLessons.length === 4, `visual placements: expected four Chapter 5 source-pointer lesson contracts, got ${sourcePointerLessons.length}`);
  check(same(sourcePointerLessons.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "visual placements: Chapter 5 lesson order mismatch");
  check(sourcePointerRows.length === 26, `visual placements: expected 26 Chapter 5 source-pointer rows, got ${sourcePointerRows.length}`);
  unique(sourcePointerRows.map(({ placement }) => placement.atlasId), "visual placements Chapter 5 Atlas IDs");
  check(sourcePointerRows.every(({ placement }) => auditById.has(placement.atlasId)), "visual placements: source pointer absent from Chapter 5 audit");
  check([...auditById.keys()].every((id) => sourcePointerRows.some(({ placement }) => placement.atlasId === id)), "visual placements: Chapter 5 audit pointer missing from source-alignment contract");
  check((visualPlacements.lessons ?? []).every((lesson) => !lessonIds.has(lesson.lessonId)), "visual placements: Chapter 5 source pointers must not enter image-rendering contracts and duplicate the interactive visual");
  for (const item of expected) {
    const contract = sourcePointerLessons.find((entry) => entry.lessonId === item.lessonId);
    check(contract?.visualId === `VIS-${item.lessonId}` && contract?.placementContractVersion === 1, `${item.lessonId}: source-pointer contract identity mismatch`);
    const expectedIds = atlasAudit.items.filter((entry) => entry.lessonId === item.lessonId).map((entry) => entry.atlasId);
    const actualIds = [
      ...(contract?.instructionalPlacements ?? []).map((entry) => entry.atlasId),
      ...(contract?.referencePlacements ?? []).map((entry) => entry.atlasId),
    ];
    check(same(actualIds.toSorted(), expectedIds.toSorted()), `${item.lessonId}: source-pointer/audit membership mismatch`);
  }
  for (const { lesson, placement, kind } of sourcePointerRows) {
    const audit = auditById.get(placement.atlasId);
    check(audit?.lessonId === lesson.lessonId, `${placement.atlasId}: source-pointer lesson owner mismatch`);
    check(placement.disposition === audit?.disposition, `${placement.atlasId}: source-pointer disposition drift`);
    check(placement.sourceLocator === audit?.sourceLocator, `${placement.atlasId}: source locator drift`);
    check(placement.renderMode === "source-pointer-note", `${placement.atlasId}: must render as a source-pointer note`);
    check(placement.renderStatus === "not-rendered-source-pointer", `${placement.atlasId}: coursebook image must remain non-rendered`);
    check(placement.referenceStatus === "mapped-to-original-learner-visual", `${placement.atlasId}: original learner visual mapping missing`);
    check(placement.replacementVisualId === `VIS-${lesson.lessonId}`, `${placement.atlasId}: replacement visual mismatch`);
    check(!Object.hasOwn(placement, "preview") && !Object.hasOwn(placement, "image"), `${placement.atlasId}: source pointer must not embed a duplicate visual asset`);
    if (kind === "instructional") {
      check(instructionalDispositions.has(placement.disposition), `${placement.atlasId}: instructional row has reference disposition`);
      check(placement.stage === expectedStage[placement.disposition], `${placement.atlasId}: disposition/stage mismatch`);
      check(isObject(placement.anchor) && nonEmpty(placement.anchor.targetId), `${placement.atlasId}: instructional anchor missing`);
      const lessonPayload = lessonPayloads.get(lesson.lessonId);
      const definition = definitions?.find((entry) => entry.lessonId === lesson.lessonId);
      const validAnchorIds = new Set([
        ...(lessonPayload?.theory ?? []).map((entry) => entry.id),
        ...(lessonPayload?.workedExample?.steps ?? []).map((entry) => entry.id),
        ...(lessonPayload?.recognition?.items ?? []).map((entry) => entry.id),
        ...(definition?.sceneIds ?? []),
      ]);
      check(validAnchorIds.has(placement.anchor?.targetId), `${placement.atlasId}: anchor target does not exist in lesson or visual contract`);
      check(Array.isArray(placement.objectiveIds) && placement.objectiveIds.length > 0 && placement.objectiveIds.every((id) => objectives.has(id)), `${placement.atlasId}: objective mapping invalid`);
      check(Array.isArray(placement.requirementIds) && placement.requirementIds.length > 0 && placement.requirementIds.every((id) => requirements.has(id)), `${placement.atlasId}: requirement mapping invalid`);
      for (const field of ["teachingClaim", "learnerAction", "teacherPrompt", "expectedObservation", "misconceptionOrLimit", "instructionalCaption", "textEquivalent"]) localized(placement[field], `${placement.atlasId} ${field}`);
    } else {
      check(!instructionalDispositions.has(placement.disposition), `${placement.atlasId}: reference row has inline disposition`);
      localized(placement.rationale, `${placement.atlasId} reference rationale`);
    }
  }
  const dispositionCounts = Object.fromEntries(atlasAudit.taxonomy.allowedDispositions.map((disposition) => [
    disposition,
    sourcePointerRows.filter(({ placement }) => placement.disposition === disposition).length,
  ]));
  check(same(dispositionCounts, atlasAudit.inventory.dispositionCounts), "visual placements: disposition counts drift from Chapter 5 audit");
  check(sourcePointerRows.filter(({ placement }) => placement.disposition === "LESSON_REFERENCE_DISCLOSURE").length === 6, "visual placements: six lesson reference disclosures required");
  safe(sourcePointerLessons, "Chapter 5 visual placements");
}

if (oracles) {
  check(Array.isArray(oracles) && oracles.length === 4, "visual oracles: expected 4 records");
  unique(oracles?.map((entry) => entry.lessonId) ?? [], "visual oracle lesson IDs");
  check(same(oracles?.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "visual oracles: lesson order mismatch");
  for (const item of expected) {
    const oracle = oracles.find((entry) => entry.lessonId === item.lessonId);
    check(oracle?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: oracle record missing`);
    check(Array.isArray(oracle?.invariants) && oracle.invariants.length > 0 && oracle.invariants.every(nonEmpty), `${item.lessonId}: oracle invariants missing`);
  }
  const byId = new Map(oracles.map((entry) => [entry.lessonId, entry]));
  check(Object.keys(byId.get("P1-L33")?.cases ?? {}).length === 5, "P1-L33 oracle: five OS request cases required");
  check(Object.keys(byId.get("P1-L34")?.cases ?? {}).length === 8, "P1-L34 oracle: eight utility/library/DLL cases required");
  check(Object.keys(byId.get("P1-L35")?.models ?? {}).length === 4, "P1-L35 oracle: four translator models required");
  check(Object.keys(byId.get("P1-L35")?.errorScenarios ?? {}).length === 4, "P1-L35 oracle: four error scenarios required");
  check(byId.get("P1-L35")?.combinationCount === 16, "P1-L35 oracle: 4 × 4 translator/error combinations required");
  check(Array.isArray(byId.get("P1-L36")?.packets?.authoring) && byId.get("P1-L36").packets.authoring.length === 4, "P1-L36 oracle: four authoring frames required");
  const utilityOracle = byId.get("P1-L34");
  check(utilityOracle?.choiceContract?.choiceMustChangeTrace === true, "P1-L34 oracle: learner choice must change trace");
  check(utilityOracle?.choiceContract?.wrongChoiceOutcome === "stop-before-operation-wrong-service", "P1-L34 oracle: wrong-choice guard missing");
  check(utilityOracle?.scenarioBranches?.format?.["used-disk"]?.artifact === "destructive-format-warning", "P1-L34 oracle: used-disk destructive guard missing");
  check(utilityOracle?.scenarioBranches?.virus?.["definitions-outdated"]?.artifact === "definition-update-required", "P1-L34 oracle: virus definition update branch missing");
  check(utilityOracle?.scenarioBranches?.virus?.["false-positive"]?.artifact === "possible-false-positive-quarantine-record", "P1-L34 oracle: virus false-positive branch missing");
  check(["missing", "incompatible", "corrupt"].every((branch) => utilityOracle?.scenarioBranches?.dll?.[branch]?.operationExecuted === false), "P1-L34 oracle: DLL failure branches missing");
  check(Array.isArray(byId.get("P1-L36")?.packets?.debugging) && byId.get("P1-L36").packets.debugging.length === 5, "P1-L36 oracle: five debugging frames required");
  check(byId.get("P1-L36")?.packets?.debugging?.filter((frame) => frame.id.startsWith("single-step-")).length === 2, "P1-L36 oracle: two single-step frames required before report");
  safe(oracles, "Chapter 5 visual oracles");
}

const lessonRegistry = source("app/lib/paper1/lesson-registry.ts");
const practiceRegistry = source("app/lib/paper1/practice-registry.ts");
const visualDispatcher = source("app/components/paper1-learning/Paper1VisualLab.tsx");
const chapterVisual = source("app/components/paper1-learning/Chapter5VisualLab.tsx");
const atlasReferenceGallery = source("app/components/paper1-learning/AtlasReferenceGallery.tsx");
const modelSource = source("app/lib/paper1/chapter5-models.ts");
for (const item of expected) {
  check(lessonRegistry.includes(`"${item.slug}"`), `${item.slug}: lesson registry entry missing`);
  check(chapterVisual.includes(item.lessonId), `${item.lessonId}: Chapter 5 visual implementation missing`);
}
check(practiceRegistry.includes('"5"'), "P1-CP05 practice registry entry missing");
check(visualDispatcher.includes("Chapter5VisualLab") && visualDispatcher.includes("chapter5VisualLessonIds"), "Paper1VisualLab: Chapter 5 dispatch missing");
check((modelSource.match(/export function /g) ?? []).length >= 4, "Chapter 5 model module must export at least four pure model functions");
check(!/Math\.random|Date\.now|fetch\(|localStorage|sessionStorage/.test(modelSource), "Chapter 5 model module must remain deterministic and side-effect free");
check(atlasReferenceGallery.includes("sourcePointerLessons") && atlasReferenceGallery.includes("TeacherSourceAuditDisclosure"), "AtlasReferenceGallery: Chapter 5 teacher source-audit disclosure missing");
check(!atlasReferenceGallery.includes("SourcePointerNotes"), "AtlasReferenceGallery: source-audit pointers must not render inside learning stages");
check(atlasReferenceGallery.includes('placement.disposition === "LESSON_REFERENCE_DISCLOSURE"'), "AtlasReferenceGallery: lesson reference disclosure filter missing");
check(chapterVisual.includes("setStep(0); setChoice(entry.id)") && chapterVisual.includes("data-scene-id={current.sceneId}"), "Chapter5VisualLab: prediction changes must reset to Step 1 and expose the current scene ID");
check(chapterVisual.includes("choice ? <div className={styles.stage}") && chapterVisual.includes("styles.lockedStage"), "Chapter5VisualLab: answer-bearing stage must stay hidden until a prediction is selected");
check(chapterVisual.includes("setProposedService(UTILITY_CASES[caseId].selectedService)"), "P1-L34: safety-branch changes must clear a stale proposed service");

if (failures.length) {
  console.error(`Paper 1 Chapter 5 contract: FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Paper 1 Chapter 5 contract: PASS");
console.log("4 lessons · 8 objectives · 24 atomic requirements · 24 primary checks · 12 practice items / 60 marks · AO1:AO2 36:24 · levels 4:4:4 · 4 interactive visual models / 26 Atlas IDs");
