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
  { lessonId: "P1-L44", slug: "relational-foundations", order: 44, strand: "8.1", mode: "comparison", objectives: ["AC26-8.1-01", "AC26-8.1-02"], requirements: ["REQ-8.1-01-01", "REQ-8.1-02-01"], prerequisites: [], stateCount: 24, selectorCount: 6, frameIds: ["observe-duplicate-files", "apply-change", "trace-propagation", "compare-integrity"] },
  { lessonId: "P1-L45", slug: "keys-relationships", order: 45, strand: "8.1", mode: "database", objectives: ["AC26-8.1-03", "AC26-8.1-04"], requirements: ["REQ-8.1-03-01", "REQ-8.1-03-02", "REQ-8.1-03-03", "REQ-8.1-03-04", "REQ-8.1-04-01"], prerequisites: ["P1-L44"], stateCount: 48, selectorCount: 12, frameIds: ["inspect-schema", "declare-key", "apply-operation", "verify-relationship"] },
  { lessonId: "P1-L46", slug: "normalisation", order: 46, strand: "8.1", mode: "database", objectives: ["AC26-8.1-05", "AC26-8.1-06", "AC26-8.1-07"], requirements: ["REQ-8.1-05-01", "REQ-8.1-05-02", "REQ-8.1-05-03", "REQ-8.1-06-01", "REQ-8.1-07-01"], prerequisites: ["P1-L45"], stateCount: 30, selectorCount: 6, frameIds: ["declare-dependencies", "reach-1nf", "reach-2nf", "reach-3nf", "verify-lossless-links"] },
  { lessonId: "P1-L47", slug: "dbms", order: 47, strand: "8.2", mode: "scenario", objectives: ["AC26-8.2-01", "AC26-8.2-02"], requirements: ["REQ-8.2-01-01", "REQ-8.2-01-02", "REQ-8.2-01-03", "REQ-8.2-01-04", "REQ-8.2-02-01", "REQ-8.2-02-02"], prerequisites: ["P1-L44"], stateCount: 24, selectorCount: 6, frameIds: ["inspect-request", "route-responsibility", "invoke-dbms-tool", "verify-control"] },
  { lessonId: "P1-L48", slug: "sql-foundations", order: 48, strand: "8.3", mode: "sql", objectives: ["AC26-8.3-01", "AC26-8.3-02", "AC26-8.3-03", "AC26-8.3-04"], requirements: ["REQ-8.3-01-01", "REQ-8.3-02-01", "REQ-8.3-03-01", "REQ-8.3-04-01"], prerequisites: ["P1-L47"], stateCount: 32, selectorCount: 8, frameIds: ["read-statement", "predict-language-role", "trace-target", "verify-effect"] },
  { lessonId: "P1-L49", slug: "sql-ddl", order: 49, strand: "8.3", mode: "sql", objectives: ["AC26-8.3-05"], requirements: ["REQ-8.3-05-01", "REQ-8.3-05-02", "REQ-8.3-05-03", "REQ-8.3-05-04", "REQ-8.3-05-05"], prerequisites: ["P1-L48"], stateCount: 40, selectorCount: 10, frameIds: ["inspect-requirement", "assemble-ddl", "apply-schema-change", "verify-constraint"] },
  { lessonId: "P1-L50", slug: "sql-dml", order: 50, strand: "8.3", mode: "sql", objectives: ["AC26-8.3-06"], requirements: ["REQ-8.3-06-01", "REQ-8.3-06-02", "REQ-8.3-06-03", "REQ-8.3-06-04"], prerequisites: ["P1-L48"], stateCount: 50, selectorCount: 10, frameIds: ["parse", "source", "match", "transform", "result"] },
];
const lessonIds = new Set(expected.map((entry) => entry.lessonId));
const slugs = new Set(expected.map((entry) => entry.slug));
const objectives = new Set(expected.flatMap((entry) => entry.objectives));
const requirements = new Set(expected.flatMap((entry) => entry.requirements));
const coverageBlocks = Array.from({ length: 11 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);
check(expected.length === 7, "validator fixture must contain seven lessons");
check(objectives.size === 15, `validator fixture must contain 15 objectives, got ${objectives.size}`);
check(requirements.size === 31, `validator fixture must contain 31 requirements, got ${requirements.size}`);
check(expected.reduce((sum, entry) => sum + entry.stateCount, 0) === 248, "validator fixture must contain 248 visual states");

const catalog = read("content/paper1/catalog.json");
const manifest = read("content/paper1/release-manifest.json");
const definitions = read("content/paper1/visual-definitions.json");
const atlasAudit = read("content/paper1/chapter8-atlas-audit.json");
const visualPlacements = read("content/paper1/visual-placements.json");
const practice = read("content/paper1/practice/chapter-8.json");
const oracles = read("content/paper1/chapter8-visual-oracles.json");

if (catalog) {
  check(catalog.sections?.length === 8 && catalog.sections.every((entry) => entry.status === "available"), "catalog: all eight sections must be available");
  const section = catalog.sections?.find((entry) => entry.id === "8");
  localized(section?.title, "catalog Section 8 title"); localized(section?.summary, "catalog Section 8 summary"); localized(section?.question, "catalog Section 8 question");
  const strands = catalog.strands?.filter((entry) => entry.sectionId === "8") ?? [];
  check(same(strands.map((entry) => entry.id), ["8.1", "8.2", "8.3"]), "catalog: Section 8 strand order must be 8.1/8.2/8.3");
  const topics = catalog.topics?.filter((entry) => entry.sectionId === "8") ?? [];
  check(catalog.topics?.length === 50, `catalog: cumulative topic count must be 50, got ${catalog.topics?.length ?? 0}`);
  check(topics.length === 7, `catalog: expected seven Chapter 8 topics, got ${topics.length}`);
  unique(catalog.topics?.map((entry) => entry.lessonId) ?? [], "catalog lesson IDs"); unique(catalog.topics?.map((entry) => entry.slug) ?? [], "catalog slugs");
  check(new Set(catalog.topics?.flatMap((entry) => entry.objectiveIds ?? []) ?? []).size === 99, "catalog: cumulative objective count must be 99");
  check(new Set(catalog.topics?.flatMap((entry) => entry.requirementIds ?? []) ?? []).size === 205, "catalog: cumulative requirement count must be 205");
  for (const item of expected) {
    const topic = topics.find((entry) => entry.lessonId === item.lessonId);
    check(Boolean(topic), `catalog: ${item.lessonId} missing`); if (!topic) continue;
    check(topic.topicId === item.lessonId && topic.slug === item.slug && topic.order === item.order && topic.strandId === item.strand, `${item.lessonId}: catalog identity/order/strand mismatch`);
    check(topic.learningMode === item.mode, `${item.lessonId}: learning mode mismatch`);
    check(same(topic.objectiveIds, item.objectives), `${item.lessonId}: catalog objectives mismatch`);
    check(same(topic.requirementIds, item.requirements), `${item.lessonId}: catalog requirements mismatch`);
    check(same(topic.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: catalog prerequisites mismatch`);
    localized(topic.title, `${item.lessonId} catalog title`); localized(topic.summary, `${item.lessonId} catalog summary`);
  }
  safe(catalog, "catalog");
}

if (manifest) {
  check(/^paper1-chapter8-/i.test(manifest.releaseId ?? ""), "release manifest must identify Chapter 8");
  check(manifest.lessons?.length === 50, `release manifest must contain 50 lessons, got ${manifest.lessons?.length ?? 0}`);
  unique(manifest.lessons?.map((entry) => entry.lessonId) ?? [], "release manifest lesson IDs");
  check(manifest.lessons?.every((entry) => entry.state === "available"), "release manifest: every lesson must be available");
  for (const item of expected) {
    const released = manifest.lessons?.find((entry) => entry.lessonId === item.lessonId);
    check(released?.slug === item.slug, `${item.lessonId}: manifest slug mismatch`);
    check(/^\d+\.\d+\.\d+$/.test(released?.contentVersion ?? "") && /^\d+\.\d+\.\d+$/.test(released?.assessmentVersion ?? ""), `${item.lessonId}: manifest version invalid`);
    check(same(released?.modelVersions, [`VIS-${item.lessonId}@1`]), `${item.lessonId}: manifest model version mismatch`);
  }
  safe(manifest, "release manifest");
}

const assessmentOwners = new Map();
for (const item of expected) {
  const lesson = read(`content/paper1/lessons/${item.slug}.json`); if (!lesson) continue;
  check(lesson.schemaVersion === 1 && lesson.lessonId === item.lessonId && lesson.slug === item.slug, `${item.lessonId}: lesson identity mismatch`);
  check(lesson.sectionId === "8" && lesson.strandId === item.strand, `${item.lessonId}: section/strand mismatch`);
  check(same(lesson.objectives?.map((entry) => entry.id), item.objectives), `${item.lessonId}: objective IDs mismatch`);
  check(same(lesson.requirementIds, item.requirements), `${item.lessonId}: requirement IDs mismatch`);
  check(same(lesson.prerequisiteLessonIds, item.prerequisites), `${item.lessonId}: prerequisites mismatch`);
  check(lesson.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual ID mismatch`);
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
    if (["explain", "compare", "justify", "design", "construct", "write-sql"].includes(assessment.kind)) {
      check(Array.isArray(assessment.solution?.rubric) && assessment.solution.rubric.length > 0, `${assessment.id}: open-response rubric missing`);
      check(!Object.hasOwn(assessment, "acceptedAnswers"), `${assessment.id}: open response must not use keyword-only accepted answers`);
    }
    check(!assessmentOwners.has(requirementId), `${requirementId}: duplicate primary owner`); assessmentOwners.set(requirementId, item.lessonId);
  }
  check(same(Object.keys(lesson.contractCoverage ?? {}), coverageBlocks), `${item.lessonId}: B01–B11 contract keys mismatch`);
  coverageBlocks.forEach((block) => check(Array.isArray(lesson.contractCoverage?.[block]) && lesson.contractCoverage[block].length > 0 && lesson.contractCoverage[block].every(nonEmpty), `${item.lessonId}/${block}: coverage empty`));
  const sourceIds = lesson.sources?.map((entry) => entry.id) ?? []; unique(sourceIds, `${item.lessonId} source IDs`);
  for (const id of ["SYL-2026", "BOOK-C08", "ALG-P1"]) check(sourceIds.includes(id), `${item.lessonId}: source ${id} missing`);
  const released = manifest?.lessons?.find((entry) => entry.lessonId === item.lessonId);
  check(released?.contentVersion === lesson.contentVersion && released?.assessmentVersion === lesson.assessmentVersion, `${item.lessonId}: manifest/lesson version mismatch`);
  safe(lesson, item.lessonId);
}
check(assessmentOwners.size === 31, `primary assessments cover ${assessmentOwners.size}/31 requirements`);

if (practice) {
  check(practice.schemaVersion === 1 && practice.practiceId === "P1-CP08" && practice.chapterId === "8", "practice identity mismatch");
  check(practice.courseId === "CAIE-9618-P1-2026", "practice course ID mismatch"); validateLocalizedTree(practice, "P1-CP08");
  check(practice.timing?.timedMinutes === 72 && practice.timing?.untimedAvailable === true, "practice timing must be 72 minutes with untimed mode");
  check(practice.totalMarks === 60 && practice.aoBlueprint?.AO1 === 36 && practice.aoBlueprint?.AO2 === 24, "practice mark/AO blueprint mismatch");
  check(practice.items?.length === 12, `practice: expected 12 items, got ${practice.items?.length ?? 0}`); unique(practice.items?.map((entry) => entry.id) ?? [], "practice item IDs");
  const levels = { guided: 0, faded: 0, independent: 0 }; const aoMarks = { AO1: 0, AO2: 0 };
  let itemMarks = 0; let pointMarks = 0; const itemRequirements = new Set(); const pointRequirements = new Set(); const itemObjectives = new Set(); const pointIds = [];
  for (const item of practice.items ?? []) {
    check(Object.hasOwn(levels, item.level), `${item.id}: invalid level`); if (Object.hasOwn(levels, item.level)) levels[item.level] += 1;
    check(Object.hasOwn(aoMarks, item.ao), `${item.id}: invalid AO`); if (Object.hasOwn(aoMarks, item.ao)) aoMarks[item.ao] += item.marks;
    const allocation = { guided: { ao: "AO1", marks: 5 }, faded: { ao: "AO1", marks: 4 }, independent: { ao: "AO2", marks: 6 } }[item.level];
    check(Boolean(allocation) && item.ao === allocation.ao && item.marks === allocation.marks, `${item.id}: per-level AO/mark allocation mismatch`);
    check(slugs.has(item.revisitLessonSlug), `${item.id}: invalid revisit lesson`);
    check(item.origin === "original" && item.claim_kind === "algocore_guidance", `${item.id}: provenance mismatch`);
    const marks = item.solution?.markingPoints?.reduce((sum, point) => sum + point.marks, 0) ?? 0;
    check(marks === item.marks, `${item.id}: item/marking-point marks mismatch`);
    itemMarks += item.marks; pointMarks += marks;
    item.requirementIds?.forEach((id) => itemRequirements.add(id)); item.objectiveIds?.forEach((id) => itemObjectives.add(id));
    for (const point of item.solution?.markingPoints ?? []) { pointIds.push(point.id); point.requirementIds?.forEach((id) => pointRequirements.add(id)); }
  }
  check(same(levels, { guided: 4, faded: 4, independent: 4 }), `practice level split mismatch: ${JSON.stringify(levels)}`);
  check(same(aoMarks, { AO1: 36, AO2: 24 }), `practice AO marks mismatch: ${JSON.stringify(aoMarks)}`);
  check(itemMarks === 60 && pointMarks === 60, `practice marks must aggregate to 60, got items=${itemMarks}, points=${pointMarks}`);
  check(same([...itemRequirements].toSorted(), [...requirements].toSorted()), "practice item-level requirement coverage mismatch");
  check(same([...pointRequirements].toSorted(), [...requirements].toSorted()), "practice marking-point requirement coverage mismatch");
  check(same([...itemObjectives].toSorted(), [...objectives].toSorted()), "practice objective coverage mismatch");
  unique(pointIds, "practice marking-point IDs");
  safe(practice, "P1-CP08");
}

if (atlasAudit) {
  const taxonomy = ["INLINE_UNDERSTAND", "INLINE_OBSERVE_SCENE", "INLINE_WORKED_EXAMPLE", "INLINE_RECOGNISE", "LESSON_REFERENCE_DISCLOSURE", "CHAPTER_ATLAS_ONLY", "DUPLICATE_OR_REMOVE"];
  check(atlasAudit.chapterId === "8" && atlasAudit.items?.length === 29, "Atlas audit must contain 29 Chapter 8 identities");
  unique(atlasAudit.items?.map((entry) => entry.atlasId) ?? [], "Atlas audit identities");
  const mappings = atlasAudit.items?.flatMap((entry) => entry.lessonMappings?.map((mapping) => ({ ...mapping, atlasId: entry.atlasId, disposition: entry.disposition })) ?? []) ?? [];
  check(mappings.length === 37, `Atlas audit must contain 37 mappings, got ${mappings.length}`);
  check(same(expected.map((entry) => mappings.filter((row) => row.lessonId === entry.lessonId).length), [6, 9, 8, 1, 2, 3, 8]), "Atlas per-lesson mapping vector mismatch");
  const dispositionCounts = Object.fromEntries(taxonomy.map((name) => [name, atlasAudit.items.filter((entry) => entry.disposition === name).length]));
  check(same(taxonomy.map((name) => dispositionCounts[name]), [10, 4, 9, 1, 2, 0, 3]), `Atlas disposition vector mismatch: ${JSON.stringify(dispositionCounts)}`);
  const removeIds = atlasAudit.items.filter((entry) => entry.disposition === "DUPLICATE_OR_REMOVE").map((entry) => entry.atlasId).toSorted();
  check(same(removeIds, ["BOOK-C08-P215-EXAM-PROGDEV", "BOOK-C08-P215-EXAM-PROGRAMMER-TABLES", "BOOK-C08-P216-EXAM-SCHOOL-SCHEMA"]), "Atlas remove set mismatch");
  atlasAudit.items.forEach((entry) => { check(entry.renderStatus === "not-rendered-source-pointer", `${entry.atlasId}: source pointer must not render publisher artwork`); localized(entry.rationale, `${entry.atlasId} rationale`); });
  safe(atlasAudit, "Chapter 8 Atlas audit");
}

if (visualPlacements) {
  const contracts = (visualPlacements.sourcePointerLessons ?? []).filter((entry) => lessonIds.has(entry.lessonId));
  check(same(contracts.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "visual placements: Chapter 8 lesson order mismatch");
  const rows = contracts.flatMap((lesson) => [...(lesson.instructionalPlacements ?? []), ...(lesson.referencePlacements ?? [])].map((placement) => ({ lesson, placement })));
  check(rows.length === 37, `visual placements: expected 37 mappings, got ${rows.length}`);
  check(same(expected.map((entry) => rows.filter((row) => row.lesson.lessonId === entry.lessonId).length), [6, 9, 8, 1, 2, 3, 8]), "visual placements: per-lesson mapping vector mismatch");
  const auditRows = atlasAudit?.items?.flatMap((entry) => entry.lessonMappings.map((mapping) => `${mapping.lessonId}/${entry.atlasId}/${entry.disposition}`)) ?? [];
  const placementRows = rows.map(({ lesson, placement }) => `${lesson.lessonId}/${placement.atlasId}/${placement.disposition}`);
  check(same(placementRows.toSorted(), auditRows.toSorted()), "visual placements: exact lesson/Atlas/disposition ledger differs from audit");
  rows.forEach(({ lesson, placement }) => {
    check(placement.replacementVisualId === `VIS-${lesson.lessonId}`, `${lesson.lessonId}/${placement.atlasId}: replacement visual mismatch`);
    check(placement.renderMode === "source-pointer-note" && placement.renderStatus === "not-rendered-source-pointer", `${lesson.lessonId}/${placement.atlasId}: source pointer render boundary mismatch`);
    if (placement.stage) {
      check(isObject(placement.anchor) && nonEmpty(placement.anchor.targetId), `${lesson.lessonId}/${placement.atlasId}: instructional anchor missing`);
      for (const key of ["teachingClaim", "learnerAction", "teacherPrompt", "expectedObservation", "misconceptionOrLimit", "instructionalCaption", "textEquivalent"]) localized(placement[key], `${lesson.lessonId}/${placement.atlasId}/${key}`);
    } else localized(placement.rationale, `${lesson.lessonId}/${placement.atlasId}/rationale`);
  });
  safe(contracts, "Chapter 8 source-pointer placements");
}

if (definitions) {
  const chapterDefinitions = definitions.filter((entry) => lessonIds.has(entry.lessonId));
  check(same(chapterDefinitions.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "visual definitions: Chapter 8 order mismatch");
  for (const item of expected) {
    const definition = chapterDefinitions.find((entry) => entry.lessonId === item.lessonId);
    check(definition?.visualId === `VIS-${item.lessonId}`, `${item.lessonId}: visual definition identity mismatch`);
    check(definition?.sceneIds?.length === item.stateCount, `${item.lessonId}: visual definition scene count mismatch`);
    const expectedAtlasIds = atlasAudit?.items?.filter((entry) => entry.lessonMappings?.some((mapping) => mapping.lessonId === item.lessonId)).map((entry) => entry.atlasId) ?? [];
    check(same(definition?.atlasIds, expectedAtlasIds), `${item.lessonId}: visual definition Atlas IDs mismatch`);
    localized(definition?.title, `${item.lessonId} visual title`); localized(definition?.learnerAction, `${item.lessonId} visual learner action`); localized(definition?.observableOutcome, `${item.lessonId} visual outcome`); localized(definition?.modelScope, `${item.lessonId} visual scope`); localized(definition?.modelLimitations, `${item.lessonId} visual limitations`);
  }
}

if (oracles) {
  check(same(oracles.map((entry) => entry.lessonId), expected.map((entry) => entry.lessonId)), "oracle lesson order mismatch");
  check(same(oracles.map((entry) => entry.stateCount), expected.map((entry) => entry.stateCount)), "oracle state-count vector mismatch");
  check(oracles.reduce((sum, entry) => sum + (entry.states?.length ?? 0), 0) === 248, "oracle must contain 248 states");
  for (const item of expected) {
    const oracle = oracles.find((entry) => entry.lessonId === item.lessonId); if (!oracle) continue;
    check(oracle.visualId === `VIS-${item.lessonId}` && oracle.modelVersion === `VIS-${item.lessonId}@1`, `${item.lessonId}: oracle identity/version mismatch`);
    check(same(oracle.frameIds, item.frameIds), `${item.lessonId}: oracle frame order mismatch`);
    check(oracle.states?.length === item.stateCount, `${item.lessonId}: oracle state cardinality mismatch`);
    const keys = oracle.states?.map((entry) => `${JSON.stringify(entry.selector)}::${entry.frameId}`) ?? [];
    unique(keys, `${item.lessonId} selector/frame tuples`);
    check(new Set(oracle.states?.map((entry) => JSON.stringify(entry.selector)) ?? []).size === item.selectorCount, `${item.lessonId}: selector cardinality mismatch`);
    const bySelector = new Map();
    oracle.states?.forEach((state) => {
      check(Array.isArray(state.activeIds) && state.activeIds.length <= 3, `${item.lessonId}/${state.frameId}: more than three active semantic objects`);
      const reveal = state.state?.reveal;
      const hasExactRevealShape = isObject(reveal)
        && same(Object.keys(reveal), ["source", "operation", "result", "ledgerFields", "tableFields"])
        && nonEmpty(reveal.source)
        && nonEmpty(reveal.operation)
        && nonEmpty(reveal.result)
        && Array.isArray(reveal.ledgerFields)
        && reveal.ledgerFields.every(nonEmpty)
        && Array.isArray(reveal.tableFields)
        && reveal.tableFields.every(nonEmpty);
      check(hasExactRevealShape, `${item.lessonId}/${state.frameId}: exact progressive-reveal map missing or malformed`);
      if (!hasExactRevealShape) return;
      unique(reveal.ledgerFields, `${item.lessonId}/${state.frameId}/ledgerFields`);
      unique(reveal.tableFields, `${item.lessonId}/${state.frameId}/tableFields`);
      const selectorKey = JSON.stringify(state.selector);
      if (!bySelector.has(selectorKey)) bySelector.set(selectorKey, []);
      bySelector.get(selectorKey).push(state);
    });
    for (const [selectorKey, states] of bySelector) {
      states.sort((left, right) => item.frameIds.indexOf(left.frameId) - item.frameIds.indexOf(right.frameId));
      const hasExactFrameSequence = same(states.map((state) => state.frameId), item.frameIds);
      check(hasExactFrameSequence, `${item.lessonId}/${selectorKey}: frame sequence mismatch`);
      if (!hasExactFrameSequence) continue;
      for (let index = 1; index < states.length; index += 1) {
        const before = states[index - 1].state.reveal;
        const after = states[index].state.reveal;
        check(!same(before, after), `${item.lessonId}/${selectorKey}: frame ${index + 1} reveals no new semantic transition`);
        for (const channel of ["ledgerFields", "tableFields"]) {
          for (const field of before[channel]) check(after[channel].includes(field), `${item.lessonId}/${selectorKey}: ${channel} drops ${field} on Next`);
        }
        for (const channel of ["source", "operation", "result"]) {
          if (before[channel] !== "not-revealed") check(after[channel] !== "not-revealed", `${item.lessonId}/${selectorKey}: ${channel} regresses to hidden`);
        }
        check(states[index].ticket.endsWith(String(index + 1)), `${item.lessonId}/${selectorKey}: one-transition ticket order mismatch`);
      }
    }
    const definition = definitions?.find((entry) => entry.lessonId === item.lessonId);
    const reachableSceneIds = oracle.states?.map((entry) => `${item.lessonId}-${Object.values(entry.selector).join("-")}-${entry.frameId}`) ?? [];
    check(same(definition?.sceneIds, reachableSceneIds), `${item.lessonId}: visual definition scenes must exactly enumerate reachable selector/frame states`);
  }
  safe(oracles, "Chapter 8 visual oracles");
}

const registry = source("app/lib/paper1/lesson-registry.ts");
const practiceRegistry = source("app/lib/paper1/practice-registry.ts");
const dispatcher = source("app/components/paper1-learning/Paper1VisualLab.tsx");
const modelSource = source("app/lib/paper1/chapter8-models.ts");
const componentSource = source("app/components/paper1-learning/Chapter8VisualLab.tsx");
const sourceDisclosureSource = source("app/components/paper1-learning/AtlasReferenceGallery.tsx");
const proxySource = source("proxy.ts");
const envExample = source(".env.example");
const packageSource = source("package.json");
const readme = source("README.md");
for (const item of expected) check(registry.includes(`"${item.slug}"`) && registry.includes(`${item.slug}.json`), `${item.lessonId}: lesson registry entry missing`);
check(practiceRegistry.includes('"8"') && practiceRegistry.includes("chapter-8.json"), "practice registry: Chapter 8 missing");
check(dispatcher.includes("Chapter8VisualLab") && dispatcher.includes("chapter8VisualLessonIds"), "visual dispatcher: Chapter 8 branch missing");
for (const exportName of ["buildL44RelationalProofbenchState", "buildL45KeyRelationState", "buildL46NormalisationState", "buildL47DbmsControlState", "buildL48SqlRoleState", "buildL49DdlSchemaState", "buildL50DmlTraceState"]) check(modelSource.includes(exportName), `model module: ${exportName} missing`);
for (const prohibited of ["Math.random", "Date.now", "fetch(", "localStorage", "sessionStorage"]) check(!modelSource.includes(prohibited), `model module: prohibited side effect ${prohibited}`);
check(!/acceptedAnswers|keyword\s*(?:match|matching)|\.includes\([^)]*answer/i.test(componentSource), "Chapter 8 UI must not keyword-grade open SQL/design responses");
check(sourceDisclosureSource.includes("lessonSourceNoteDispositions") && sourceDisclosureSource.includes(".filter((placement) => lessonSourceNoteDispositions.has(placement.disposition))"), "teacher source disclosure must filter non-runtime dispositions");
check(!sourceDisclosureSource.match(/lessonSourceNoteDispositions[\s\S]{0,300}DUPLICATE_OR_REMOVE/), "teacher source disclosure must never render DUPLICATE_OR_REMOVE pointers");
check(componentSource.includes("state.reveal.ledgerFields") && componentSource.includes("state.reveal.tableFields"), "Chapter 8 UI must gate ledger and table projections through the authored reveal map");
check(componentSource.includes("frame.state.reveal") && !componentSource.includes("const frameView = toView(frame"), "Chapter 8 cumulative text must use only each frame's reveal projection");
check(/\.filter\([^\n]*reveal\.ledgerFields\.includes/.test(componentSource) && /\.filter\([^\n]*reveal\.tableFields\.includes/.test(componentSource), "Chapter 8 UI must filter stable receipt/table IDs before rendering");
check(componentSource.includes("chapter8SemanticText as semanticText") && modelSource.includes("export const chapter8SemanticText") && modelSource.includes("export const chapter8UnmappedVietnameseTokens"), "Chapter 8 UI and validators must share the exported pure semantic formatter and unmapped-token audit");
for (const expression of [
  "semanticText(locale, fact.value)",
  "semanticText(locale, node.value)",
  "semanticText(locale, entry.value)",
  "semanticText(locale, current.id)",
  "semanticText(locale, frame.id)",
  "semanticText(locale, reveal.source)",
  "semanticText(locale, reveal.operation)",
  "semanticText(locale, reveal.result)",
  "semanticText(locale, view.result)",
]) check(componentSource.includes(expression), `Chapter 8 VI semantic evidence bypasses localization: ${expression}`);
check(!/>\s*\{human\(/.test(componentSource), "Chapter 8 rendered evidence must not humanize raw English slugs directly");
check((componentSource.match(/aria-live="polite"/g) ?? []).length >= 2 && componentSource.includes('aria-atomic="true"'), "Chapter 8 must announce both prediction status and each localized evidence-step change");
check((componentSource.match(/disabled=\{submitted\}/g) ?? []).length >= 2 && componentSource.includes("disabled={!ready || submitted}"), "submitted Chapter 8 prediction inputs must remain locked until Reset or a selector change");
check(componentSource.includes("previousStateKey.current !== stateKey") && componentSource.includes("setSubmitted(false)") && componentSource.includes("setChoice(\"\")") && componentSource.includes("setReason(\"\")"), "selector changes must unlock a fresh Chapter 8 prediction attempt");
check(proxySource.includes('process.env.ALGOCORE_PUBLIC_PREVIEW === "true"') && proxySource.includes("if (publicPreview)") && proxySource.includes("withProgressScope"), "public preview must be explicit and assign an isolated progress scope");
check(envExample.includes("ALGOCORE_PUBLIC_PREVIEW=false") && /keep it `false` in production/i.test(readme), "public preview must remain disabled by default and documented as non-production");
check(packageSource.includes('"check:paper1:chapter8"') && packageSource.indexOf("check:paper1:chapter8") < packageSource.indexOf("check:paper1:ux"), "package: Chapter 8 validator missing or out of verify order");
check(/50 bilingual lessons/i.test(readme) && /205 requirement-level checks/i.test(readme) && /eight chapter-practice sets/i.test(readme), "README cumulative Chapter 8 facts missing");
check(/three all-course mixed revision sets/i.test(readme) && /two full 75-mark, 90-minute mock forms/i.test(readme), "README remaining mixed-set/mock boundary missing");
check(!/eight mixed revision sets/i.test(readme), "README must not call chapter practice the all-course mixed sets");

if (failures.length) {
  console.error(`Paper 1 Chapter 8 validation: FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Paper 1 Chapter 8 validation: PASS (7 lessons; 15 objectives; 31 requirements/checkpoints; cumulative 50/99/205; P1-CP08 12 items/60 marks/72 minutes; 29 Atlas IDs/37 mappings; 248 oracle states; Section 8 release integration complete)");
