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
  check(!entry.includes("\uFFFD"), `${label}: Unicode replacement character leaked`);
  check(!/(?:[A-Z]:\\|file:\/\/|\.\.\/|CONTROLLED_CHECK)/i.test(entry), `${label}: private/local reference leaked`);
  check(!/\b(?:TODO|TBD|PLACEHOLDER|LOREM IPSUM|NOT_AUTHORED)\b/i.test(entry), `${label}: unfinished placeholder leaked`);
});

const expected = [
  { lessonId: "P1-L41", slug: "professional-ethics", order: 41, objectives: ["AC26-7.1-01", "AC26-7.1-02"], requirements: ["REQ-7.1-01-01", "REQ-7.1-01-02", "REQ-7.1-02-01", "REQ-7.1-02-02"], prerequisites: [], stateCount: 24, selectorCount: 6, frameIds: ["facts", "action", "effects", "argument"] },
  { lessonId: "P1-L42", slug: "copyright-licences", order: 42, objectives: ["AC26-7.1-03", "AC26-7.1-04"], requirements: ["REQ-7.1-03-01", "REQ-7.1-04-01", "REQ-7.1-04-02"], prerequisites: [], stateCount: 64, selectorCount: 16, frameIds: ["needs", "profile", "compare", "verdict"] },
  { lessonId: "P1-L43", slug: "ai-impacts", order: 43, objectives: ["AC26-7.1-05"], requirements: ["REQ-7.1-05-01", "REQ-7.1-05-02"], prerequisites: [], stateCount: 36, selectorCount: 9, frameIds: ["application", "dimension", "causal-paths", "conclusion"] },
];
const lessonIds = new Set(expected.map((entry) => entry.lessonId));
const slugs = new Set(expected.map((entry) => entry.slug));
const objectives = new Set(expected.flatMap((entry) => entry.objectives));
const requirements = new Set(expected.flatMap((entry) => entry.requirements));
const coverageBlocks = Array.from({ length: 11 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);
check(expected.length === 3, "validator fixture must contain 3 lessons");
check(objectives.size === 5, `validator fixture must contain 5 objectives, got ${objectives.size}`);
check(requirements.size === 9, `validator fixture must contain 9 requirements, got ${requirements.size}`);
check(expected.reduce((sum, entry) => sum + entry.stateCount, 0) === 124, "validator fixture must contain 124 visual states");

const catalog = read("content/paper1/catalog.json");
const manifest = read("content/paper1/release-manifest.json");
const releaseChapter = Number(manifest?.releaseId?.match(/^paper1-chapter(\d+)-/i)?.[1]);
const definitions = read("content/paper1/visual-definitions.json");
const atlasAudit = read("content/paper1/chapter7-atlas-audit.json");
const visualPlacements = read("content/paper1/visual-placements.json");
const practice = read("content/paper1/practice/chapter-7.json");
const oracles = read("content/paper1/chapter7-visual-oracles.json");
const lessonPayloads = new Map();

if (catalog) {
  const section = catalog.sections?.find((entry) => entry.id === "7");
  check(section?.status === "available", "catalog: Section 7 must be available");
  localized(section?.title, "catalog Section 7 title"); localized(section?.summary, "catalog Section 7 summary"); localized(section?.question, "catalog Section 7 question");
  check(catalog.sections?.find((entry) => entry.id === "8")?.status === (releaseChapter >= 8 ? "available" : "planned"), "catalog: Section 8 must be planned through Chapter 7 and available from Chapter 8");
  const strands = catalog.strands?.filter((entry) => entry.sectionId === "7") ?? [];
  check(same(strands.map((entry) => entry.id), ["7.1"]), "catalog: Chapter 7 must expose exactly strand 7.1");
  strands.forEach((entry) => localized(entry.title, `catalog strand ${entry.id}`));
  const topics = catalog.topics?.filter((entry) => entry.sectionId === "7") ?? [];
  check(topics.length === 3, `catalog: expected 3 Chapter 7 topics, got ${topics.length}`);
  const chapter7Prefix = catalog.topics?.filter((entry) => Number.isInteger(entry.order) && entry.order <= 43) ?? [];
  check(chapter7Prefix.length === 43, `catalog: Chapter 1–7 prefix topic count must be 43, got ${chapter7Prefix.length}`);
  unique(catalog.topics?.map((entry) => entry.lessonId) ?? [], "catalog lesson IDs"); unique(catalog.topics?.map((entry) => entry.slug) ?? [], "catalog slugs");
  const cumulativeObjectives = new Set(chapter7Prefix.flatMap((entry) => entry.objectiveIds ?? []));
  const cumulativeRequirements = new Set(chapter7Prefix.flatMap((entry) => entry.requirementIds ?? []));
  check(cumulativeObjectives.size === 84, `catalog: Chapter 1–7 prefix objective count must be 84, got ${cumulativeObjectives.size}`);
  check(cumulativeRequirements.size === 174, `catalog: Chapter 1–7 prefix requirement count must be 174, got ${cumulativeRequirements.size}`);
  for (const item of expected) {
    const topic = topics.find((entry) => entry.lessonId === item.lessonId);
    check(Boolean(topic), `catalog: ${item.lessonId} missing`); if (!topic) continue;
    check(topic.topicId === item.lessonId && topic.slug === item.slug && topic.order === item.order && topic.strandId === "7.1", `${item.lessonId}: catalog identity/order/strand mismatch`);
    check(topic.learningMode === "argument", `${item.lessonId}: learning mode must be argument`);
    check(same(topic.objectiveIds, item.objectives), `${item.lessonId}: catalog objectives mismatch`);
    check(same(topic.requirementIds, item.requirements), `${item.lessonId}: catalog requirements mismatch`);
    check(same(topic.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: catalog prerequisites mismatch`);
    localized(topic.title, `${item.lessonId} catalog title`); localized(topic.summary, `${item.lessonId} catalog summary`);
    check(Array.isArray(topic.searchTerms) && topic.searchTerms.length > 0 && topic.searchTerms.every(nonEmpty), `${item.lessonId}: search terms missing`);
  }
  safe(catalog, "catalog");
}

if (manifest) {
  check(/^paper1-chapter(?:[7-9]|[1-9]\d)-/i.test(manifest.releaseId ?? ""), "release manifest must identify Chapter 7 or a later cumulative candidate");
  const manifestPrefix = manifest.lessons?.filter((entry) => /^P1-L\d+$/.test(entry.lessonId) && Number(entry.lessonId.slice(4)) <= 43) ?? [];
  check(manifestPrefix.length === 43, `release manifest Chapter 1–7 prefix must contain 43 lessons, got ${manifestPrefix.length}`);
  unique(manifest.lessons?.map((entry) => entry.lessonId) ?? [], "release manifest lesson IDs");
  check(manifestPrefix.every((entry) => entry.state === "available"), "release manifest: all Chapter 1–7 prefix lessons must remain available");
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
  const lesson = read(`content/paper1/lessons/${item.slug}.json`); if (!lesson) continue;
  lessonPayloads.set(item.lessonId, lesson);
  check(lesson.schemaVersion === 1 && lesson.lessonId === item.lessonId && lesson.slug === item.slug, `${item.lessonId}: lesson identity mismatch`);
  check(lesson.sectionId === "7" && lesson.strandId === "7.1", `${item.lessonId}: section/strand mismatch`);
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
    check(["explain", "compare", "justify"].includes(assessment.kind), `${assessment.id}: Chapter 7 open reasoning must use explicit response plus rubric self-review`);
    check(Array.isArray(assessment.solution?.rubric) && assessment.solution.rubric.length > 0, `${assessment.id}: open-response rubric missing`);
    check(!Object.hasOwn(assessment, "correctChoiceId") && !Object.hasOwn(assessment, "acceptedAnswers"), `${assessment.id}: open reasoning must not be keyword/choice auto-graded`);
    check(!assessmentOwners.has(requirementId), `${requirementId}: duplicate primary owner`); assessmentOwners.set(requirementId, item.lessonId);
  }
  check(same(Object.keys(lesson.contractCoverage ?? {}), coverageBlocks), `${item.lessonId}: B01–B11 contract keys mismatch`);
  coverageBlocks.forEach((block) => check(Array.isArray(lesson.contractCoverage?.[block]) && lesson.contractCoverage[block].length > 0 && lesson.contractCoverage[block].every(nonEmpty), `${item.lessonId}/${block}: coverage empty`));
  const sourceIds = lesson.sources?.map((entry) => entry.id) ?? []; unique(sourceIds, `${item.lessonId} source IDs`);
  for (const id of ["SYL-2026", "BOOK-C07", "ALG-P1"]) check(sourceIds.includes(id), `${item.lessonId}: source ${id} missing`);
  const declaredSources = new Set(sourceIds);
  lesson.theory?.forEach((block) => block.sourceIds?.forEach((id) => check(declaredSources.has(id), `${item.lessonId}/${block.id}: undeclared source ${id}`)));
  const released = manifest?.lessons?.find((entry) => entry.lessonId === item.lessonId);
  check(released?.contentVersion === lesson.contentVersion && released?.assessmentVersion === lesson.assessmentVersion, `${item.lessonId}: manifest/lesson version mismatch`);
  safe(lesson, item.lessonId);
}
check(assessmentOwners.size === 9, `primary assessments cover ${assessmentOwners.size}/9 requirements`);

if (practice) {
  check(practice.schemaVersion === 1 && practice.practiceId === "P1-CP07" && practice.chapterId === "7", "practice identity mismatch");
  check(practice.courseId === "CAIE-9618-P1-2026", "practice course ID mismatch"); validateLocalizedTree(practice, "P1-CP07");
  const provenanceIds = practice.provenance?.map((entry) => entry.id) ?? [];
  for (const id of ["SYL-2026", "BOOK-C07", "ALG-P1"]) check(provenanceIds.includes(id), `practice provenance ${id} missing`);
  check(practice.items?.length === 12, `practice: expected 12 items, got ${practice.items?.length ?? 0}`); unique(practice.items?.map((entry) => entry.id) ?? [], "practice item IDs");
  const levels = { guided: 0, faded: 0, independent: 0 }; const aoMarks = { AO1: 0, AO2: 0 };
  let itemMarks = 0; let pointMarks = 0; const itemRequirements = new Set(); const pointRequirements = new Set(); const itemObjectives = new Set(); const markingPointIds = [];
  practice.items?.forEach((entry, index) => {
    check(entry.id === `P1-CP07-Q${String(index + 1).padStart(2, "0")}`, `${entry.id}: stable item ID/order mismatch`);
    check(Object.hasOwn(levels, entry.level), `${entry.id}: invalid level`); if (Object.hasOwn(levels, entry.level)) levels[entry.level] += 1;
    check(Object.hasOwn(aoMarks, entry.ao), `${entry.id}: invalid AO`); if (Object.hasOwn(aoMarks, entry.ao)) aoMarks[entry.ao] += entry.marks;
    check(Number.isInteger(entry.marks) && entry.marks > 0, `${entry.id}: invalid marks`); itemMarks += entry.marks;
    check(entry.origin === "original" && entry.claim_kind === "algocore_guidance", `${entry.id}: must be AlgoCore-original`);
    check(slugs.has(entry.revisitLessonSlug), `${entry.id}: revisit slug is not a Chapter 7 lesson`);
    entry.requirementIds?.forEach((id) => { check(requirements.has(id), `${entry.id}: unknown requirement ${id}`); itemRequirements.add(id); });
    entry.objectiveIds?.forEach((id) => { check(objectives.has(id), `${entry.id}: unknown objective ${id}`); itemObjectives.add(id); });
    check(entry.responseProduct === "structured-response", `${entry.id}: Chapter 7 practice requires an explicit structured response`);
    const owner = expected.find((lesson) => lesson.slug === entry.revisitLessonSlug);
    check(entry.requirementIds?.some((id) => owner?.requirements.includes(id)), `${entry.id}: revisit lesson owns no assessed requirement`);
    let marks = 0;
    entry.solution?.markingPoints?.forEach((point, pointIndex) => {
      const id = `P1-CP07-Q${String(index + 1).padStart(2, "0")}-M${pointIndex + 1}`;
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
  check(itemRequirements.size === 9 && [...requirements].every((id) => itemRequirements.has(id)), `practice item requirement coverage ${itemRequirements.size}/9`);
  check(pointRequirements.size === 9 && [...requirements].every((id) => pointRequirements.has(id)), `practice marking-point requirement coverage ${pointRequirements.size}/9`);
  check(itemObjectives.size === 5 && [...objectives].every((id) => itemObjectives.has(id)), `practice objective coverage ${itemObjectives.size}/5`);
  safe(practice, "P1-CP07");
}

const allowed = ["INLINE_UNDERSTAND", "INLINE_OBSERVE_SCENE", "INLINE_WORKED_EXAMPLE", "INLINE_RECOGNISE", "LESSON_REFERENCE_DISCLOSURE", "CHAPTER_ATLAS_ONLY", "DUPLICATE_OR_REMOVE"];
if (atlasAudit) {
  check(atlasAudit.schemaVersion === 1 && atlasAudit.auditId === "P1-C07-ATLAS-AUDIT-2026-10-04" && atlasAudit.chapterId === "7", "Atlas audit: identity mismatch");
  check(same(atlasAudit.taxonomy?.allowedDispositions, allowed), "Atlas audit: disposition taxonomy mismatch"); localized(atlasAudit.copyrightBoundary, "Atlas audit copyright boundary");
  check(atlasAudit.authority?.learnerVisualOrigin === "AlgoCore-original", "Atlas audit: learner visuals must be original");
  check(atlasAudit.inventory?.totalIds === 6 && atlasAudit.inventory?.uniqueIds === 6 && atlasAudit.inventory?.mappingCount === 6, "Atlas audit: inventory must be 6 unique / 6 mappings");
  check(Array.isArray(atlasAudit.items) && atlasAudit.items.length === 6, `Atlas audit: expected 6 items, got ${atlasAudit.items?.length ?? 0}`);
  const ids = atlasAudit.items?.map((entry) => entry.atlasId) ?? []; unique(ids, "Atlas audit IDs");
  const exactIds = ["BOOK-C07-P184-F7-1", "BOOK-C07-P195-EXAM-ETHICS-DIAGRAM", "BOOK-C07-P195-EXAM-ETHICS-TABLE", "BOOK-C07-P190-F7-2-TRAIN", "BOOK-C07-P190-F7-2-ARM", "BOOK-C07-P190-F7-2-ROBOT"];
  check(same(ids, exactIds), "Atlas audit: exact pointer inventory/order mismatch");
  const mappings = atlasAudit.items?.flatMap((entry) => (entry.lessonMappings ?? []).map((mapping) => ({ entry, mapping }))) ?? [];
  check(mappings.length === 6, `Atlas audit: expected 6 lesson mappings, got ${mappings.length}`); unique(mappings.map(({ entry, mapping }) => `${entry.atlasId}:${mapping.lessonId}`), "Atlas audit pointer/lesson mappings");
  for (const { entry, mapping } of mappings) { check(lessonIds.has(mapping.lessonId), `${entry.atlasId}: unknown lesson mapping`); check(mapping.replacementVisualId === `VIS-${mapping.lessonId}`, `${entry.atlasId}: replacement visual mismatch`); }
  for (const entry of atlasAudit.items ?? []) { check(allowed.includes(entry.disposition), `${entry.atlasId}: unsupported disposition`); localized(entry.rationale, `${entry.atlasId} rationale`); check(nonEmpty(entry.sourceLocator), `${entry.atlasId}: source locator missing`); check(entry.renderStatus === "not-rendered-source-pointer" && entry.referenceStatus === "mapped-to-original-learner-visual", `${entry.atlasId}: render/reference status mismatch`); }
  const dispositionCounts = Object.fromEntries(allowed.map((disposition) => [disposition, atlasAudit.items.filter((entry) => entry.disposition === disposition).length]));
  check(same(dispositionCounts, { INLINE_UNDERSTAND: 1, INLINE_OBSERVE_SCENE: 0, INLINE_WORKED_EXAMPLE: 0, INLINE_RECOGNISE: 0, LESSON_REFERENCE_DISCLOSURE: 3, CHAPTER_ATLAS_ONLY: 0, DUPLICATE_OR_REMOVE: 2 }), "Atlas audit: disposition counts mismatch");
  check(same(atlasAudit.inventory?.dispositionCounts, dispositionCounts), "Atlas audit: declared disposition counts drift");
  check(same(atlasAudit.inventory?.lessonMappingCounts, { "P1-L41": 3, "P1-L42": 0, "P1-L43": 3 }) && same(atlasAudit.inventory?.zeroAtlasLessonIds, ["P1-L42"]), "Atlas audit: lesson mapping/audited-zero mismatch");
  safe(atlasAudit, "Chapter 7 Atlas audit");
}

if (atlasAudit && visualPlacements) {
  const contracts = (visualPlacements.sourcePointerLessons ?? []).filter((entry) => lessonIds.has(entry.lessonId));
  const rows = contracts.flatMap((lesson) => [...(lesson.instructionalPlacements ?? []), ...(lesson.referencePlacements ?? [])].map((placement) => ({ lesson, placement })));
  check(contracts.length === 3 && same(contracts.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "visual placements: Chapter 7 lesson contracts/order mismatch");
  check(rows.length === 6, `visual placements: expected 6 Chapter 7 mappings, got ${rows.length}`);
  check(contracts.find((entry) => entry.lessonId === "P1-L42")?.instructionalPlacements?.length === 0 && contracts.find((entry) => entry.lessonId === "P1-L42")?.referencePlacements?.length === 0, "visual placements: P1-L42 audited-zero contract missing");
  unique(rows.map(({ lesson, placement }) => `${placement.atlasId}:${lesson.lessonId}`), "visual placements Chapter 7 mapping IDs");
  const auditMappings = new Set(atlasAudit.items.flatMap((entry) => entry.lessonMappings.map((mapping) => `${entry.atlasId}:${mapping.lessonId}`)));
  check(rows.every(({ lesson, placement }) => auditMappings.has(`${placement.atlasId}:${lesson.lessonId}`)) && [...auditMappings].every((key) => rows.some(({ lesson, placement }) => `${placement.atlasId}:${lesson.lessonId}` === key)), "visual placements: audit/placement mapping mismatch");
  const auditById = new Map(atlasAudit.items.map((entry) => [entry.atlasId, entry]));
  for (const { lesson, placement } of rows) {
    const audit = auditById.get(placement.atlasId);
    check(placement.disposition === audit?.disposition && placement.sourceLocator === audit?.sourceLocator, `${placement.atlasId}: audit/placement drift`);
    check(placement.renderMode === "source-pointer-note" && placement.renderStatus === "not-rendered-source-pointer" && !Object.hasOwn(placement, "image") && !Object.hasOwn(placement, "preview"), `${placement.atlasId}: source pointer must not render book art`);
    check(placement.referenceStatus === "mapped-to-original-learner-visual" && placement.replacementVisualId === `VIS-${lesson.lessonId}`, `${placement.atlasId}: replacement mapping mismatch`);
    if (placement.disposition === "INLINE_UNDERSTAND") {
      check(placement.stage === "understand" && placement.anchor?.kind === "theory-block", `${placement.atlasId}: inline anchor mismatch`);
      const content = lessonPayloads.get(lesson.lessonId);
      check(content?.theory?.some((entry) => entry.id === placement.anchor.targetId), `${placement.atlasId}: theory anchor target missing`);
      for (const key of ["teachingClaim", "learnerAction", "teacherPrompt", "expectedObservation", "misconceptionOrLimit", "instructionalCaption", "textEquivalent"]) localized(placement[key], `${placement.atlasId} ${key}`);
    } else localized(placement.rationale, `${placement.atlasId} rationale`);
  }
  const earlierIds = new Set((visualPlacements.sourcePointerLessons ?? []).filter((entry) => !lessonIds.has(entry.lessonId)).flatMap((entry) => [...(entry.instructionalPlacements ?? []), ...(entry.referencePlacements ?? [])].map((placement) => placement.atlasId)));
  check(rows.every(({ placement }) => !earlierIds.has(placement.atlasId)), "visual placements: Chapter 7 pointer namespace collision");
  safe(contracts, "Chapter 7 visual placements");
}

if (definitions && atlasAudit) {
  const chapter = definitions.filter((entry) => lessonIds.has(entry.lessonId)); check(chapter.length === 3, `visual definitions: expected 3, got ${chapter.length}`);
  unique(definitions.map((entry) => entry.visualId), "visual definition IDs");
  for (const item of expected) {
    const definition = chapter.find((entry) => entry.lessonId === item.lessonId);
    check(definition?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual definition missing`);
    for (const key of ["title", "learnerAction", "observableOutcome", "modelScope", "modelLimitations"]) localized(definition?.[key], `${item.lessonId} ${key}`);
    check(definition?.reviewStatus === "model-reviewed-with-scope-limits", `${item.lessonId}: review status mismatch`);
    const expectedIds = atlasAudit.items.filter((entry) => entry.lessonMappings.some((mapping) => mapping.lessonId === item.lessonId)).map((entry) => entry.atlasId);
    check(same(definition?.atlasIds, expectedIds), `${item.lessonId}: visual-definition/Atlas mapping mismatch`);
    check(Array.isArray(definition?.sceneIds) && definition.sceneIds.length === item.stateCount, `${item.lessonId}: scene count must be ${item.stateCount}`); unique(definition?.sceneIds ?? [], `${item.lessonId} scene IDs`);
  }
  check(chapter.flatMap((entry) => entry.sceneIds).length === 124, "visual definitions: expected 124 Chapter 7 scene states");
  safe(chapter, "Chapter 7 visual definitions");
}

if (oracles) {
  check(Array.isArray(oracles) && oracles.length === 3, "visual oracles: expected 3 records");
  check(same(oracles?.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "visual oracles: lesson order mismatch"); unique(oracles?.map((entry) => entry.lessonId) ?? [], "visual oracle lesson IDs");
  let stateCount = 0;
  for (const item of expected) {
    const oracle = oracles.find((entry) => entry.lessonId === item.lessonId);
    check(oracle?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: oracle record missing`);
    check(oracle?.stateCount === item.stateCount, `${item.lessonId}: oracle state count must be ${item.stateCount}`); stateCount += oracle?.stateCount ?? 0;
    check(same(oracle?.frameIds, item.frameIds), `${item.lessonId}: frame IDs/order mismatch`);
    check(Array.isArray(oracle?.invariants) && oracle.invariants.length > 0 && oracle.invariants.every(nonEmpty), `${item.lessonId}: oracle invariants missing`);
    const states = oracle?.states ?? [];
    check(states.length === item.stateCount, `${item.lessonId}: oracle states must contain ${item.stateCount} records`); unique(states.map((entry) => `${JSON.stringify(entry.selector)}::${entry.frameId}`), `${item.lessonId} oracle selector/frame records`);
    check(new Set(states.map((entry) => JSON.stringify(entry.selector))).size === item.selectorCount, `${item.lessonId}: selector cardinality mismatch`);
    states.forEach((entry) => check(Array.isArray(entry.activeIds) && entry.activeIds.length <= 3, `${item.lessonId}/${entry.frameId}: too many active semantic objects`));
  }
  const ethicsOracle = oracles.find((entry) => entry.lessonId === "P1-L41");
  const ethicsActions = {
    "unsafe-release": ["report-and-delay", "conceal-and-release"],
    "confidential-code-reuse": ["permission-or-reimplement", "copy-without-permission"],
    "known-bias-error": ["document-and-escalate", "suppress-evidence"],
  };
  const requiredEthicsFields = ["legalStatusBoundary", "legalEvidenceNeeded", "professionalEthicsRelation", "professionalEthicsEvidence", "professionalBodyContribution"];
  const categoricalLegalVerdict = /^(?:legal|illegal|lawful|unlawful|always-legal|always-illegal)$/i;
  for (const entry of ethicsOracle?.states ?? []) {
    const state = entry.state ?? {};
    for (const field of requiredEthicsFields) check(nonEmpty(state[field]), `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}/${entry.frameId}: ${field} must be explicit and non-empty`);
    const legalStatusBoundary = String(state.legalStatusBoundary ?? "");
    const legalEvidenceNeeded = String(state.legalEvidenceNeeded ?? "");
    const professionalEthicsRelation = String(state.professionalEthicsRelation ?? "");
    const professionalEthicsEvidence = String(state.professionalEthicsEvidence ?? "");
    check(["supports-duty", "conflicts-with-duty"].includes(professionalEthicsRelation), `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: invalid professional-ethics relation`);
    check(!categoricalLegalVerdict.test(legalStatusBoundary.trim()), `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: categorical legal verdict prohibited`);
    check(!Object.hasOwn(state, "legalVerdict") && !Object.hasOwn(state, "isLegal"), `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: legal verdict field prohibited`);
    check(legalStatusBoundary !== professionalEthicsRelation, `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: legal boundary and ethical relation collapsed`);
    check(legalEvidenceNeeded !== professionalEthicsEvidence, `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: legal and professional-ethics evidence collapsed`);
    check(!legalStatusBoundary.includes(professionalEthicsRelation) && !legalEvidenceNeeded.includes(professionalEthicsRelation), `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: legal fields derived from ethical relation`);
    check(/membership-does-not-guarantee-conduct/.test(String(state.professionalBodyContribution ?? "")), `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: membership-no-guarantee boundary missing`);
    if (entry.frameId === "facts") {
      check(state.revealedLegalStatusBoundary === "not-revealed" && state.revealedLegalEvidenceNeeded === "not-revealed", `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: facts frame leaks legal analysis`);
      check(state.revealedProfessionalEthicsRelation === "not-revealed" && state.revealedProfessionalEthicsEvidence === "not-revealed", `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: facts frame leaks professional-ethics analysis`);
      check(state.revealedRelation === "not-revealed", `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: facts frame leaks ethical relation`);
      check(state.revealedArgument === "not-revealed", `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: facts frame leaks conclusion`);
    }
    if (entry.frameId === "action" || entry.frameId === "effects") {
      check(state.revealedLegalStatusBoundary === legalStatusBoundary && state.revealedLegalEvidenceNeeded === legalEvidenceNeeded, `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: legal analysis must reveal from action frame`);
      check(state.revealedProfessionalEthicsRelation === "not-revealed" && state.revealedProfessionalEthicsEvidence === "not-revealed", `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: professional-ethics result leaks before final frame`);
    }
    if (entry.frameId === "argument") {
      check(state.revealedLegalStatusBoundary === legalStatusBoundary && state.revealedLegalEvidenceNeeded === legalEvidenceNeeded, `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: final frame loses legal analysis`);
      check(state.revealedProfessionalEthicsRelation === professionalEthicsRelation && state.revealedProfessionalEthicsEvidence === professionalEthicsEvidence, `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: final frame does not reveal distinct professional-ethics fields`);
      check(state.revealedRelation === professionalEthicsRelation, `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: final frame does not reveal professional-ethics relation`);
      check(nonEmpty(state.revealedArgument) && state.revealedArgument !== "not-revealed", `P1-L41/${entry.selector?.scenario}/${entry.selector?.action}: final frame lacks qualified argument`);
    }
  }
  for (const [scenario, [firstAction, secondAction]] of Object.entries(ethicsActions)) {
    const firstStates = (ethicsOracle?.states ?? []).filter((entry) => entry.selector?.scenario === scenario && entry.selector?.action === firstAction);
    const secondStates = (ethicsOracle?.states ?? []).filter((entry) => entry.selector?.scenario === scenario && entry.selector?.action === secondAction);
    check(firstStates.length === 4 && secondStates.length === 4, `P1-L41/${scenario}: both actions require four frames`);
    check(new Set([...firstStates, ...secondStates].map((entry) => entry.state?.legalStatusBoundary)).size === 1, `P1-L41/${scenario}: scenario legal-boundary caveat changes with ethical action`);
    check(firstStates[0]?.state?.professionalEthicsEvidence !== secondStates[0]?.state?.professionalEthicsEvidence, `P1-L41/${scenario}: action change does not change professional-ethics evidence`);
    check(!same(firstStates[0]?.state?.stakeholderEffects, secondStates[0]?.state?.stakeholderEffects), `P1-L41/${scenario}: action change does not change consequence trace`);
  }
  check(stateCount === 124, `visual oracles: state total must be 124, got ${stateCount}`);
  safe(oracles, "Chapter 7 visual oracles");
}

const lessonRegistry = source("app/lib/paper1/lesson-registry.ts");
const practiceRegistry = source("app/lib/paper1/practice-registry.ts");
const visualDispatcher = source("app/components/paper1-learning/Paper1VisualLab.tsx");
const chapterVisual = source("app/components/paper1-learning/Chapter7VisualLab.tsx");
const modelSource = source("app/lib/paper1/chapter7-models.ts");
const atlasReferenceGallery = source("app/components/paper1-learning/AtlasReferenceGallery.tsx");
const packageData = read("package.json");
for (const item of expected) { check(lessonRegistry.includes(`"${item.slug}"`), `${item.slug}: lesson registry entry missing`); check(chapterVisual.includes(item.lessonId) || chapterVisual.includes(`VIS-${item.lessonId}`), `${item.lessonId}: Chapter 7 visual implementation missing`); }
check(practiceRegistry.includes('"7"'), "P1-CP07 practice registry entry missing");
check(visualDispatcher.includes("Chapter7VisualLab") && visualDispatcher.includes("chapter7VisualLessonIds"), "Paper1VisualLab: Chapter 7 dispatch missing");
for (const name of ["professionalEthicsFrames", "licenceFitFrames", "aiImpactFrames"]) check(modelSource.includes(`function ${name}`), `Chapter 7 model export ${name} missing`);
check(!/Math\.random|Date\.now|fetch\(|localStorage|sessionStorage/.test(modelSource), "Chapter 7 model module must remain deterministic and side-effect free");
check(chapterVisual.includes("styles.lockedStage"), "Chapter7VisualLab: prediction-locked stage missing");
for (const field of ["legalStatusBoundary", "legalEvidenceNeeded", "professionalEthicsRelation", "professionalEthicsEvidence"]) check(chapterVisual.includes(field), `Chapter7VisualLab: ${field} must be rendered from deterministic state`);
for (const label of ["Legal status boundary", "Legal evidence needed", "Professional ethics relation", "Professional ethics evidence"]) check(chapterVisual.includes(label), `Chapter7VisualLab: distinct '${label}' row missing`);
const teacherAuditRenderer = atlasReferenceGallery.split("export function TeacherSourceAuditDisclosure")[1] ?? "";
check(teacherAuditRenderer.includes("if (!placements.length) return null;"), "AtlasReferenceGallery: audited-zero source-pointer contracts must not render an empty disclosure");
check(packageData?.scripts?.["check:paper1:chapter7"] === "node scripts/check-paper1-chapter7.mjs" && packageData?.scripts?.verify?.includes("check:paper1:chapter7"), "package scripts: Chapter 7 validation missing");

if (failures.length) { console.error(`Paper 1 Chapter 7 contract: FAIL (${failures.length})`); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
console.log("Paper 1 Chapter 7 contract: PASS");
console.log("3 lessons · 5 objectives · 9 atomic requirements · 9 primary checks · 12 practice items / 60 marks · AO1:AO2 36:24 · levels 4:4:4 · 3 interactive models / 124 oracle states · 6 Atlas IDs / 6 lesson mappings");
