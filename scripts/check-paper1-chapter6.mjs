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
  {
    lessonId: "P1-L37", slug: "security-foundations", order: 37, strand: "6.1", learningMode: "scenario",
    objectives: ["AC26-6.1-01", "AC26-6.1-02"],
    requirements: ["REQ-6.1-01-01", "REQ-6.1-02-01"], prerequisites: [], stateCount: 12, selectorCount: 3,
  },
  {
    lessonId: "P1-L38", slug: "threats-protection", order: 38, strand: "6.1", learningMode: "scenario",
    objectives: ["AC26-6.1-03", "AC26-6.1-04", "AC26-6.1-05", "AC26-6.1-06"],
    requirements: ["REQ-6.1-03-01", "REQ-6.1-03-02", "REQ-6.1-03-03", "REQ-6.1-03-04", "REQ-6.1-04-01", "REQ-6.1-04-02", "REQ-6.1-04-03", "REQ-6.1-04-04", "REQ-6.1-05-01", "REQ-6.1-06-01", "REQ-6.1-06-02"],
    prerequisites: [], stateCount: 64, selectorCount: 16,
  },
  {
    lessonId: "P1-L39", slug: "validation", order: 39, strand: "6.2", learningMode: "validation",
    objectives: ["AC26-6.2-01", "AC26-6.2-02"],
    requirements: ["REQ-6.2-01-01", "REQ-6.2-02-01", "REQ-6.2-02-02", "REQ-6.2-02-03", "REQ-6.2-02-04", "REQ-6.2-02-05", "REQ-6.2-02-06", "REQ-6.2-02-07"],
    prerequisites: [], stateCount: 56, selectorCount: 14,
  },
  {
    lessonId: "P1-L40", slug: "verification-transfer", order: 40, strand: "6.2", learningMode: "validation",
    objectives: ["AC26-6.2-03"],
    requirements: ["REQ-6.2-03-01", "REQ-6.2-03-02", "REQ-6.2-03-03", "REQ-6.2-03-04"],
    prerequisites: ["P1-L39"], stateCount: 56, selectorCount: 14,
  },
];

const lessonIds = new Set(expected.map((entry) => entry.lessonId));
const slugs = new Set(expected.map((entry) => entry.slug));
const objectives = new Set(expected.flatMap((entry) => entry.objectives));
const requirements = new Set(expected.flatMap((entry) => entry.requirements));
const coverageBlocks = Array.from({ length: 11 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);
check(expected.length === 4, "validator fixture must contain 4 lessons");
check(objectives.size === 9, `validator fixture must contain 9 objectives, got ${objectives.size}`);
check(requirements.size === 25, `validator fixture must contain 25 requirements, got ${requirements.size}`);
check(expected.reduce((sum, entry) => sum + entry.stateCount, 0) === 188, "validator fixture must contain 188 visual states");

const catalog = read("content/paper1/catalog.json");
const manifest = read("content/paper1/release-manifest.json");
const definitions = read("content/paper1/visual-definitions.json");
const atlasAudit = read("content/paper1/chapter6-atlas-audit.json");
const visualPlacements = read("content/paper1/visual-placements.json");
const practice = read("content/paper1/practice/chapter-6.json");
const oracles = read("content/paper1/chapter6-visual-oracles.json");
const lessonPayloads = new Map();

if (catalog) {
  const section = catalog.sections?.find((entry) => entry.id === "6");
  check(section?.status === "available", "catalog: Section 6 must be available");
  localized(section?.title, "catalog Section 6 title"); localized(section?.summary, "catalog Section 6 summary"); localized(section?.question, "catalog Section 6 question");
  check(catalog.sections?.filter((entry) => ["7", "8"].includes(entry.id)).every((entry) => entry.status === "planned"), "catalog: Sections 7–8 must remain planned");
  const strands = catalog.strands?.filter((entry) => entry.sectionId === "6") ?? [];
  check(same(strands.map((entry) => entry.id), ["6.1", "6.2"]), "catalog: Chapter 6 strands/order mismatch");
  strands.forEach((entry) => localized(entry.title, `catalog strand ${entry.id}`));
  const topics = catalog.topics?.filter((entry) => entry.sectionId === "6") ?? [];
  check(topics.length === 4, `catalog: expected 4 Chapter 6 topics, got ${topics.length}`);
  check(catalog.topics?.length === 40, `catalog: cumulative topic count must be 40, got ${catalog.topics?.length ?? 0}`);
  unique(catalog.topics?.map((entry) => entry.lessonId) ?? [], "catalog lesson IDs"); unique(catalog.topics?.map((entry) => entry.slug) ?? [], "catalog slugs");
  const cumulativeObjectives = new Set(catalog.topics?.flatMap((entry) => entry.objectiveIds ?? []) ?? []);
  const cumulativeRequirements = new Set(catalog.topics?.flatMap((entry) => entry.requirementIds ?? []) ?? []);
  check(cumulativeObjectives.size === 79, `catalog: cumulative objective count must be 79, got ${cumulativeObjectives.size}`);
  check(cumulativeRequirements.size === 165, `catalog: cumulative requirement count must be 165, got ${cumulativeRequirements.size}`);
  for (const item of expected) {
    const topic = topics.find((entry) => entry.lessonId === item.lessonId);
    check(Boolean(topic), `catalog: ${item.lessonId} missing`); if (!topic) continue;
    check(topic.topicId === item.lessonId && topic.slug === item.slug && topic.order === item.order && topic.strandId === item.strand, `${item.lessonId}: catalog identity/order/strand mismatch`);
    check(topic.learningMode === item.learningMode, `${item.lessonId}: catalog learning mode mismatch`);
    check(same(topic.objectiveIds, item.objectives), `${item.lessonId}: catalog objectives mismatch`);
    check(same(topic.requirementIds, item.requirements), `${item.lessonId}: catalog requirements mismatch`);
    check(same(topic.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: catalog prerequisites mismatch`);
    localized(topic.title, `${item.lessonId} catalog title`); localized(topic.summary, `${item.lessonId} catalog summary`);
    check(Array.isArray(topic.searchTerms) && topic.searchTerms.length > 0 && topic.searchTerms.every(nonEmpty), `${item.lessonId}: search terms missing`);
  }
  safe(catalog, "catalog");
}

if (manifest) {
  check(/chapter-?6/i.test(manifest.releaseId ?? ""), "release manifest must identify Chapter 6");
  check(manifest.lessons?.length === 40, `release manifest must contain 40 lessons, got ${manifest.lessons?.length ?? 0}`);
  unique(manifest.lessons?.map((entry) => entry.lessonId) ?? [], "release manifest lesson IDs");
  check(manifest.lessons?.every((entry) => entry.state === "available"), "release manifest: all 40 released lessons must be available");
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
  check(lesson.sectionId === "6" && lesson.strandId === item.strand, `${item.lessonId}: section/strand mismatch`);
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
    check(!assessmentOwners.has(requirementId), `${requirementId}: duplicate primary owner`); assessmentOwners.set(requirementId, item.lessonId);
  }
  check(same(Object.keys(lesson.contractCoverage ?? {}), coverageBlocks), `${item.lessonId}: B01–B11 contract keys mismatch`);
  coverageBlocks.forEach((block) => check(Array.isArray(lesson.contractCoverage?.[block]) && lesson.contractCoverage[block].length > 0 && lesson.contractCoverage[block].every(nonEmpty), `${item.lessonId}/${block}: coverage empty`));
  const sourceIds = lesson.sources?.map((entry) => entry.id) ?? []; unique(sourceIds, `${item.lessonId} source IDs`);
  for (const id of ["SYL-2026", "BOOK-C06", "ALG-P1"]) check(sourceIds.includes(id), `${item.lessonId}: source ${id} missing`);
  const declaredSources = new Set(sourceIds);
  lesson.theory?.forEach((block) => block.sourceIds?.forEach((id) => check(declaredSources.has(id), `${item.lessonId}/${block.id}: undeclared source ${id}`)));
  const released = manifest?.lessons?.find((entry) => entry.lessonId === item.lessonId);
  check(released?.contentVersion === lesson.contentVersion && released?.assessmentVersion === lesson.assessmentVersion, `${item.lessonId}: manifest/lesson version mismatch`);
  safe(lesson, item.lessonId);
}
check(assessmentOwners.size === 25, `primary assessments cover ${assessmentOwners.size}/25 requirements`);

if (practice) {
  check(practice.schemaVersion === 1 && practice.practiceId === "P1-CP06" && practice.chapterId === "6", "practice identity mismatch");
  check(practice.courseId === "CAIE-9618-P1-2026", "practice course ID mismatch"); validateLocalizedTree(practice, "P1-CP06");
  const provenanceIds = practice.provenance?.map((entry) => entry.id) ?? [];
  for (const id of ["SYL-2026", "BOOK-C06", "ALG-P1"]) check(provenanceIds.includes(id), `practice provenance ${id} missing`);
  check(practice.items?.length === 12, `practice: expected 12 items, got ${practice.items?.length ?? 0}`); unique(practice.items?.map((entry) => entry.id) ?? [], "practice item IDs");
  const levels = { guided: 0, faded: 0, independent: 0 }; const aoMarks = { AO1: 0, AO2: 0 };
  let itemMarks = 0; let pointMarks = 0; const itemRequirements = new Set(); const pointRequirements = new Set(); const itemObjectives = new Set(); const markingPointIds = [];
  practice.items?.forEach((entry, index) => {
    check(entry.id === `P1-CP06-Q${String(index + 1).padStart(2, "0")}`, `${entry.id}: stable item ID/order mismatch`);
    check(Object.hasOwn(levels, entry.level), `${entry.id}: invalid level`); if (Object.hasOwn(levels, entry.level)) levels[entry.level] += 1;
    check(Object.hasOwn(aoMarks, entry.ao), `${entry.id}: invalid AO`); if (Object.hasOwn(aoMarks, entry.ao)) aoMarks[entry.ao] += entry.marks;
    check(Number.isInteger(entry.marks) && entry.marks > 0, `${entry.id}: invalid marks`); itemMarks += entry.marks;
    check(entry.origin === "original" && entry.claim_kind === "algocore_guidance", `${entry.id}: must be AlgoCore-original`);
    check(slugs.has(entry.revisitLessonSlug), `${entry.id}: revisit slug is not a Chapter 6 lesson`);
    entry.requirementIds?.forEach((id) => { check(requirements.has(id), `${entry.id}: unknown requirement ${id}`); itemRequirements.add(id); });
    entry.objectiveIds?.forEach((id) => { check(objectives.has(id), `${entry.id}: unknown objective ${id}`); itemObjectives.add(id); });
    const owner = expected.find((lesson) => lesson.slug === entry.revisitLessonSlug);
    check(entry.requirementIds?.some((id) => owner?.requirements.includes(id)), `${entry.id}: revisit lesson owns no assessed requirement`);
    let marks = 0;
    entry.solution?.markingPoints?.forEach((point, pointIndex) => {
      const id = `P1-CP06-Q${String(index + 1).padStart(2, "0")}-M${pointIndex + 1}`;
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
  check(itemRequirements.size === 25 && [...requirements].every((id) => itemRequirements.has(id)), `practice item requirement coverage ${itemRequirements.size}/25`);
  check(pointRequirements.size === 25 && [...requirements].every((id) => pointRequirements.has(id)), `practice marking-point requirement coverage ${pointRequirements.size}/25`);
  check(itemObjectives.size === 9 && [...objectives].every((id) => itemObjectives.has(id)), `practice objective coverage ${itemObjectives.size}/9`);
  safe(practice, "P1-CP06");
}

if (atlasAudit) {
  const allowed = ["INLINE_UNDERSTAND", "INLINE_OBSERVE_SCENE", "INLINE_WORKED_EXAMPLE", "INLINE_RECOGNISE", "LESSON_REFERENCE_DISCLOSURE", "CHAPTER_ATLAS_ONLY", "DUPLICATE_OR_REMOVE"];
  check(atlasAudit.schemaVersion === 1 && atlasAudit.auditId === "P1-C06-ATLAS-AUDIT-2026-10-04" && atlasAudit.chapterId === "6", "Atlas audit: identity mismatch");
  check(same(atlasAudit.taxonomy?.allowedDispositions, allowed), "Atlas audit: disposition taxonomy mismatch"); localized(atlasAudit.copyrightBoundary, "Atlas audit copyright boundary");
  check(atlasAudit.authority?.learnerVisualOrigin === "AlgoCore-original", "Atlas audit: learner visuals must be original");
  check(atlasAudit.inventory?.totalIds === 25 && atlasAudit.inventory?.uniqueIds === 25 && atlasAudit.inventory?.mappingCount === 28, "Atlas audit: inventory must be 25 unique / 28 mappings");
  check(Array.isArray(atlasAudit.items) && atlasAudit.items.length === 25, `Atlas audit: expected 25 items, got ${atlasAudit.items?.length ?? 0}`);
  const ids = atlasAudit.items?.map((entry) => entry.atlasId) ?? []; unique(ids, "Atlas audit IDs");
  check(ids.every((id) => /^BOOK-C06-P\d{3}-[A-Z0-9-]+$/.test(id)), "Atlas audit: invalid BOOK-C06 ID");
  const mappings = atlasAudit.items?.flatMap((entry) => (entry.lessonMappings ?? []).map((mapping) => ({ entry, mapping }))) ?? [];
  check(mappings.length === 28, `Atlas audit: expected 28 lesson mappings, got ${mappings.length}`);
  unique(mappings.map(({ entry, mapping }) => `${entry.atlasId}:${mapping.lessonId}`), "Atlas audit pointer/lesson mappings");
  for (const { entry, mapping } of mappings) {
    check(lessonIds.has(mapping.lessonId), `${entry.atlasId}: unknown lesson mapping ${mapping.lessonId}`);
    check(mapping.replacementVisualId === `VIS-${mapping.lessonId}`, `${entry.atlasId}/${mapping.lessonId}: replacement visual mismatch`);
  }
  for (const entry of atlasAudit.items ?? []) {
    check(allowed.includes(entry.disposition), `${entry.atlasId}: unsupported disposition`); localized(entry.rationale, `${entry.atlasId} rationale`);
    check(nonEmpty(entry.sourceLocator), `${entry.atlasId}: source locator missing`);
    check(entry.renderStatus === "not-rendered-source-pointer" && entry.referenceStatus === "mapped-to-original-learner-visual", `${entry.atlasId}: render/reference status mismatch`);
  }
  const dispositionCounts = Object.fromEntries(allowed.map((disposition) => [disposition, atlasAudit.items.filter((entry) => entry.disposition === disposition).length]));
  check(same(dispositionCounts, { INLINE_UNDERSTAND: 3, INLINE_OBSERVE_SCENE: 4, INLINE_WORKED_EXAMPLE: 4, INLINE_RECOGNISE: 1, LESSON_REFERENCE_DISCLOSURE: 7, CHAPTER_ATLAS_ONLY: 3, DUPLICATE_OR_REMOVE: 3 }), "Atlas audit: disposition counts mismatch");
  check(same(atlasAudit.inventory?.dispositionCounts, dispositionCounts), "Atlas audit: declared disposition counts drift");
  check(same(atlasAudit.inventory?.lessonMappingCounts, { "P1-L37": 1, "P1-L38": 7, "P1-L39": 7, "P1-L40": 13 }), "Atlas audit: lesson mapping counts mismatch");
  safe(atlasAudit, "Chapter 6 Atlas audit");
}

if (atlasAudit && visualPlacements) {
  const contracts = (visualPlacements.sourcePointerLessons ?? []).filter((entry) => lessonIds.has(entry.lessonId));
  const rows = contracts.flatMap((lesson) => [...(lesson.instructionalPlacements ?? []), ...(lesson.referencePlacements ?? [])].map((placement) => ({ lesson, placement })));
  const instructionalDispositions = new Set(["INLINE_UNDERSTAND", "INLINE_OBSERVE_SCENE", "INLINE_WORKED_EXAMPLE", "INLINE_RECOGNISE"]);
  const expectedStage = { INLINE_UNDERSTAND: "understand", INLINE_OBSERVE_SCENE: "observe", INLINE_WORKED_EXAMPLE: "worked-example", INLINE_RECOGNISE: "recognise" };
  check(contracts.length === 4 && same(contracts.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "visual placements: Chapter 6 lesson contracts/order mismatch");
  check(rows.length === 28, `visual placements: expected 28 Chapter 6 mappings, got ${rows.length}`);
  check(contracts.reduce((sum, entry) => sum + (entry.instructionalPlacements?.length ?? 0), 0) === 13, "visual placements: expected 13 instructional mappings");
  check(contracts.reduce((sum, entry) => sum + (entry.referencePlacements?.length ?? 0), 0) === 15, "visual placements: expected 15 reference mappings");
  unique(rows.map(({ lesson, placement }) => `${placement.atlasId}:${lesson.lessonId}`), "visual placements Chapter 6 mapping IDs");
  const auditMappings = new Set(atlasAudit.items.flatMap((entry) => entry.lessonMappings.map((mapping) => `${entry.atlasId}:${mapping.lessonId}`)));
  check(rows.every(({ lesson, placement }) => auditMappings.has(`${placement.atlasId}:${lesson.lessonId}`)), "visual placements: mapping absent from audit");
  check([...auditMappings].every((key) => rows.some(({ lesson, placement }) => `${placement.atlasId}:${lesson.lessonId}` === key)), "visual placements: audit mapping absent from placement contract");
  const auditById = new Map(atlasAudit.items.map((entry) => [entry.atlasId, entry]));
  for (const { lesson, placement } of rows) {
    const audit = auditById.get(placement.atlasId);
    check(placement.disposition === audit?.disposition && placement.sourceLocator === audit?.sourceLocator, `${placement.atlasId}/${lesson.lessonId}: audit/placement drift`);
    check(placement.renderMode === "source-pointer-note" && placement.renderStatus === "not-rendered-source-pointer", `${placement.atlasId}/${lesson.lessonId}: source pointer must not render book art`);
    check(placement.referenceStatus === "mapped-to-original-learner-visual" && placement.replacementVisualId === `VIS-${lesson.lessonId}`, `${placement.atlasId}/${lesson.lessonId}: replacement mapping mismatch`);
    check(!Object.hasOwn(placement, "preview") && !Object.hasOwn(placement, "image"), `${placement.atlasId}: embedded book image is forbidden`);
    if (instructionalDispositions.has(placement.disposition)) {
      check(placement.stage === expectedStage[placement.disposition], `${placement.atlasId}/${lesson.lessonId}: stage/disposition mismatch`);
      check(Array.isArray(placement.objectiveIds) && placement.objectiveIds.every((id) => objectives.has(id)), `${placement.atlasId}/${lesson.lessonId}: unknown objective mapping`);
      check(Array.isArray(placement.requirementIds) && placement.requirementIds.every((id) => requirements.has(id)), `${placement.atlasId}/${lesson.lessonId}: unknown requirement mapping`);
      for (const key of ["teachingClaim", "learnerAction", "teacherPrompt", "expectedObservation", "misconceptionOrLimit", "instructionalCaption", "textEquivalent"]) localized(placement[key], `${placement.atlasId}/${lesson.lessonId} ${key}`);
      const content = lessonPayloads.get(lesson.lessonId);
      const definition = definitions?.find((entry) => entry.lessonId === lesson.lessonId);
      const anchorExists = placement.anchor?.kind === "theory-block"
        ? content?.theory?.some((entry) => entry.id === placement.anchor.targetId)
        : placement.anchor?.kind === "worked-step"
          ? content?.workedExample?.steps?.some((entry) => entry.id === placement.anchor.targetId)
          : placement.anchor?.kind === "recognition-item"
            ? content?.recognition?.items?.some((entry) => entry.id === placement.anchor.targetId)
            : placement.anchor?.kind === "visual-scene"
              ? definition?.sceneIds?.includes(placement.anchor.targetId)
              : false;
      check(anchorExists, `${placement.atlasId}/${lesson.lessonId}: anchor target is missing`);
    } else {
      localized(placement.rationale, `${placement.atlasId}/${lesson.lessonId} rationale`);
    }
  }
  const chapter5Contracts = (visualPlacements.sourcePointerLessons ?? []).filter((entry) => /^P1-L3[3-6]$/.test(entry.lessonId));
  check(chapter5Contracts.length === 4, "visual placements: Chapter 5 contracts were displaced");
  const chapter5Ids = new Set(chapter5Contracts.flatMap((entry) => [...(entry.instructionalPlacements ?? []), ...(entry.referencePlacements ?? [])].map((placement) => placement.atlasId)));
  check([...new Set(rows.map(({ placement }) => placement.atlasId))].every((id) => !chapter5Ids.has(id)), "visual placements: Chapter 5/6 pointer namespace collision");
  safe(contracts, "Chapter 6 visual placements");
}

if (definitions && atlasAudit) {
  const chapter = definitions.filter((entry) => lessonIds.has(entry.lessonId)); check(chapter.length === 4, `visual definitions: expected 4, got ${chapter.length}`);
  unique(definitions.map((entry) => entry.visualId), "visual definition IDs");
  const auditMappings = atlasAudit.items.flatMap((entry) => entry.lessonMappings.map((mapping) => ({ atlasId: entry.atlasId, lessonId: mapping.lessonId })));
  for (const item of expected) {
    const definition = chapter.find((entry) => entry.lessonId === item.lessonId);
    check(definition?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual definition missing`);
    for (const key of ["title", "learnerAction", "observableOutcome", "modelScope", "modelLimitations"]) localized(definition?.[key], `${item.lessonId} ${key}`);
    check(definition?.reviewStatus === "model-reviewed-with-scope-limits", `${item.lessonId}: review status mismatch`);
    const expectedIds = auditMappings.filter((entry) => entry.lessonId === item.lessonId).map((entry) => entry.atlasId);
    check(same(definition?.atlasIds, expectedIds), `${item.lessonId}: visual-definition/Atlas mapping mismatch`);
    check(Array.isArray(definition?.sceneIds) && definition.sceneIds.length === item.stateCount, `${item.lessonId}: scene count must be ${item.stateCount}`);
    unique(definition?.sceneIds ?? [], `${item.lessonId} scene IDs`);
  }
  check(chapter.flatMap((entry) => entry.atlasIds).length === 28, "visual definitions: expected 28 Chapter 6 lesson mappings");
  check(new Set(chapter.flatMap((entry) => entry.atlasIds)).size === 25, "visual definitions: expected 25 unique Chapter 6 pointers");
  check(chapter.flatMap((entry) => entry.sceneIds).length === 188, "visual definitions: expected 188 Chapter 6 scene states");
  safe(chapter, "Chapter 6 visual definitions");
}

if (oracles) {
  check(Array.isArray(oracles) && oracles.length === 4, "visual oracles: expected 4 records");
  check(same(oracles?.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "visual oracles: lesson order mismatch"); unique(oracles?.map((entry) => entry.lessonId) ?? [], "visual oracle lesson IDs");
  let stateCount = 0;
  for (const item of expected) {
    const oracle = oracles.find((entry) => entry.lessonId === item.lessonId);
    check(oracle?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: oracle record missing`);
    check(oracle?.stateCount === item.stateCount, `${item.lessonId}: oracle state count must be ${item.stateCount}`); stateCount += oracle?.stateCount ?? 0;
    check(Array.isArray(oracle?.frameIds) && oracle.frameIds.length === 4, `${item.lessonId}: four frame IDs required`);
    check(Array.isArray(oracle?.invariants) && oracle.invariants.length > 0 && oracle.invariants.every(nonEmpty), `${item.lessonId}: oracle invariants missing`);
    const states = oracle?.states ?? [];
    check(Array.isArray(states) && states.length === item.stateCount, `${item.lessonId}: oracle states must contain ${item.stateCount} records`);
    unique(states.map((entry) => `${JSON.stringify(entry.selector)}::${entry.frameId}`), `${item.lessonId} oracle selector/frame records`);
    const selectors = new Set(states.map((entry) => JSON.stringify(entry.selector)));
    check(selectors.size === item.selectorCount, `${item.lessonId}: expected ${item.selectorCount} selector combinations, got ${selectors.size}`);
  }
  check(stateCount === 188, `visual oracles: state total must be 188, got ${stateCount}`);
  safe(oracles, "Chapter 6 visual oracles");
}

const lessonRegistry = source("app/lib/paper1/lesson-registry.ts");
const practiceRegistry = source("app/lib/paper1/practice-registry.ts");
const visualDispatcher = source("app/components/paper1-learning/Paper1VisualLab.tsx");
const chapterVisual = source("app/components/paper1-learning/Chapter6VisualLab.tsx");
const modelSource = source("app/lib/paper1/chapter6-models.ts");
for (const item of expected) {
  check(lessonRegistry.includes(`"${item.slug}"`), `${item.slug}: lesson registry entry missing`);
  check(chapterVisual.includes(item.lessonId) || chapterVisual.includes(`VIS-${item.lessonId}`), `${item.lessonId}: Chapter 6 visual implementation missing`);
}
check(practiceRegistry.includes('"6"'), "P1-CP06 practice registry entry missing");
check(visualDispatcher.includes("Chapter6VisualLab") && visualDispatcher.includes("chapter6VisualLessonIds"), "Paper1VisualLab: Chapter 6 dispatch missing");
for (const name of ["securityIncidentFrames", "threatProtectionFrames", "validationFrames", "verificationFrames"]) check(modelSource.includes(`function ${name}`), `Chapter 6 model export ${name} missing`);
check(!/Math\.random|Date\.now|fetch\(|localStorage|sessionStorage/.test(modelSource), "Chapter 6 model module must remain deterministic and side-effect free");
check(chapterVisual.includes("styles.lockedStage"), "Chapter6VisualLab: prediction-locked stage missing");

if (failures.length) {
  console.error(`Paper 1 Chapter 6 contract: FAIL (${failures.length})`); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1);
}
console.log("Paper 1 Chapter 6 contract: PASS");
console.log("4 lessons · 9 objectives · 25 atomic requirements · 25 primary checks · 12 practice items / 60 marks · AO1:AO2 36:24 · levels 4:4:4 · 4 interactive models / 188 oracle states · 25 Atlas IDs / 28 lesson mappings");
