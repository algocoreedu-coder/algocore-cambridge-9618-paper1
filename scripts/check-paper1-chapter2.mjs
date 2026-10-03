import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function readRequired(name) {
  const absolute = path.join(root, name);
  if (!fs.existsSync(absolute)) {
    failures.push(`${name}: required file is missing`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(absolute, "utf8"));
  } catch (error) {
    failures.push(`${name}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    return null;
  }
}

function unique(values, label) {
  const filtered = values.filter((value) => value !== undefined && value !== null);
  check(new Set(filtered).size === filtered.length, `${label}: duplicate stable ID`);
}

function localized(value, label) {
  check(isObject(value) && nonEmpty(value.en) && nonEmpty(value.vi), `${label}: EN/VI parity missing`);
}

function localizedList(value, label, { allowEmpty = false } = {}) {
  check(Array.isArray(value), `${label}: must be an array`);
  if (!Array.isArray(value)) return;
  check(allowEmpty || value.length > 0, `${label}: must not be empty`);
  value.forEach((entry, index) => localized(entry, `${label}[${index}]`));
}

function allStrings(value, visitor) {
  if (typeof value === "string") visitor(value);
  else if (Array.isArray(value)) value.forEach((entry) => allStrings(entry, visitor));
  else if (isObject(value)) Object.values(value).forEach((entry) => allStrings(entry, visitor));
}

function safePublicPayload(value, label) {
  allStrings(value, (entry) => {
    check(!/(?:[A-Z]:\\|file:\/\/|\.\.\/|CONTROLLED_CHECK)/i.test(entry), `${label}: private/local reference leaked`);
    check(!/\b(?:TODO|TBD|NOT_AUTHORED|PLACEHOLDER|LOREM IPSUM)\b/i.test(entry), `${label}: unfinished placeholder leaked`);
  });
}

const expectedLessons = [
  { lessonId: "P1-L09", slug: "network-foundations", order: 9, objectives: ["AC26-2.1-01", "AC26-2.1-02"], requirements: ["REQ-2.1-01-01", "REQ-2.1-02-01"], prerequisites: [] },
  { lessonId: "P1-L10", slug: "network-models", order: 10, objectives: ["AC26-2.1-03", "AC26-2.1-04"], requirements: ["REQ-2.1-03-01", "REQ-2.1-03-02", "REQ-2.1-03-03", "REQ-2.1-04-01"], prerequisites: ["P1-L09"] },
  { lessonId: "P1-L11", slug: "network-topologies", order: 11, objectives: ["AC26-2.1-05"], requirements: ["REQ-2.1-05-01", "REQ-2.1-05-02", "REQ-2.1-05-03"], prerequisites: ["P1-L09"] },
  { lessonId: "P1-L12", slug: "cloud-computing", order: 12, objectives: ["AC26-2.1-06"], requirements: ["REQ-2.1-06-01", "REQ-2.1-06-02"], prerequisites: [] },
  { lessonId: "P1-L13", slug: "transmission-media", order: 13, objectives: ["AC26-2.1-07"], requirements: ["REQ-2.1-07-01", "REQ-2.1-07-02"], prerequisites: [] },
  { lessonId: "P1-L14", slug: "network-hardware", order: 14, objectives: ["AC26-2.1-08", "AC26-2.1-09", "AC26-2.1-13"], requirements: ["REQ-2.1-08-01", "REQ-2.1-09-01", "REQ-2.1-13-01"], prerequisites: ["P1-L09"] },
  { lessonId: "P1-L15", slug: "ethernet", order: 15, objectives: ["AC26-2.1-10"], requirements: ["REQ-2.1-10-01"], prerequisites: [] },
  { lessonId: "P1-L16", slug: "streaming", order: 16, objectives: ["AC26-2.1-11"], requirements: ["REQ-2.1-11-01"], prerequisites: [] },
  { lessonId: "P1-L17", slug: "ip-addressing", order: 17, objectives: ["AC26-2.1-14"], requirements: ["REQ-2.1-14-01", "REQ-2.1-14-02", "REQ-2.1-14-03", "REQ-2.1-14-04", "REQ-2.1-14-05"], prerequisites: ["P1-L14"] },
  { lessonId: "P1-L18", slug: "web-url-dns", order: 18, objectives: ["AC26-2.1-12", "AC26-2.1-15"], requirements: ["REQ-2.1-12-01", "REQ-2.1-15-01", "REQ-2.1-15-02"], prerequisites: [] },
];

const expectedLessonIds = new Set(expectedLessons.map((entry) => entry.lessonId));
const expectedSlugs = new Set(expectedLessons.map((entry) => entry.slug));
const expectedObjectives = new Set(expectedLessons.flatMap((entry) => entry.objectives));
const expectedRequirements = new Set(expectedLessons.flatMap((entry) => entry.requirements));
const expectedVisualNodeKinds = new Set(["client", "server", "network", "cloud", "database", "warning", "fibre", "wireless", "document"]);
const requirementOwner = new Map(expectedLessons.flatMap((lesson) => lesson.requirements.map((requirementId) => [requirementId, lesson])));
const objectiveOwner = new Map(expectedLessons.flatMap((lesson) => lesson.objectives.map((objectiveId) => [objectiveId, lesson])));
const requiredCoverageBlocks = Array.from({ length: 11 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);

check(expectedLessons.length === 10, "validator fixture must contain 10 Chapter 2 lessons");
check(expectedObjectives.size === 15, `validator fixture must contain 15 objectives, got ${expectedObjectives.size}`);
check(expectedRequirements.size === 26, `validator fixture must contain 26 requirements, got ${expectedRequirements.size}`);

const catalog = readRequired("content/paper1/catalog.json");
const manifest = readRequired("content/paper1/release-manifest.json");
const practice = readRequired("content/paper1/practice/chapter-2.json");
const visualOracles = readRequired("content/paper1/chapter2-visual-oracles.json");
const visualDefinitions = readRequired("content/paper1/visual-definitions.json");

if (catalog) {
  check(catalog.schemaVersion === 1, "catalog: schemaVersion must be 1");
  check(catalog.course?.id === "CAIE-9618-P1-2026", "catalog: course ID mismatch");
  check(catalog.course?.examYear === 2026 && catalog.course?.syllabusVersion === 2, "catalog: must target Cambridge 9618 exams in 2026 syllabus v2");
  check(catalog.course?.durationMinutes === 90 && catalog.course?.marks === 75, "catalog: Paper 1 exam facts must remain 90 minutes / 75 marks");
  check(Array.isArray(catalog.sections) && catalog.sections.length === 8, `catalog: expected 8 sections, got ${catalog.sections?.length ?? 0}`);
  const section2 = catalog.sections?.find((entry) => entry.id === "2");
  check(section2?.status === "available", "catalog: Section 2 must be available");
  localized(section2?.title, "catalog Section 2 title");
  localized(section2?.summary, "catalog Section 2 summary");
  localized(section2?.question, "catalog Section 2 question");
  check(catalog.sections?.find((entry) => entry.id === "1")?.status === "available", "catalog: Section 1 regression; it must remain available");
  check(catalog.sections?.filter((entry) => ["4", "5", "6", "7", "8"].includes(entry.id)).every((entry) => entry.status === "planned"), "catalog: Sections 4–8 must remain planned in the cumulative candidate");

  const section2Strands = catalog.strands?.filter((entry) => entry.sectionId === "2") ?? [];
  check(section2Strands.length === 1 && section2Strands[0]?.id === "2.1", "catalog: Chapter 2 must expose exactly strand 2.1");
  section2Strands.forEach((strand) => localized(strand.title, `catalog strand ${strand.id} title`));

  const topics = catalog.topics?.filter((entry) => entry.sectionId === "2") ?? [];
  check(topics.length === 10, `catalog: expected 10 Chapter 2 topics, got ${topics.length}`);
  unique(topics.map((entry) => entry.topicId), "catalog Chapter 2 topicId");
  unique(topics.map((entry) => entry.lessonId), "catalog Chapter 2 lessonId");
  unique(topics.map((entry) => entry.slug), "catalog Chapter 2 slug");
  for (const expected of expectedLessons) {
    const topic = topics.find((entry) => entry.lessonId === expected.lessonId);
    check(Boolean(topic), `catalog: ${expected.lessonId} is missing`);
    if (!topic) continue;
    check(topic.topicId === expected.lessonId, `${expected.lessonId}: topicId must equal lessonId`);
    check(topic.slug === expected.slug && topic.order === expected.order, `${expected.lessonId}: slug/order mismatch`);
    check(topic.strandId === "2.1", `${expected.lessonId}: strand must be 2.1`);
    check(same(topic.objectiveIds, expected.objectives), `${expected.lessonId}: objective IDs do not match the canonical roadmap`);
    check(same(topic.requirementIds, expected.requirements), `${expected.lessonId}: requirement IDs do not match the canonical roadmap`);
    check(same(topic.prerequisiteLessonIds, expected.prerequisites), `${expected.lessonId}: prerequisite IDs do not match the canonical roadmap`);
    localized(topic.title, `${expected.lessonId} catalog title`);
    localized(topic.summary, `${expected.lessonId} catalog summary`);
    check(nonEmpty(topic.learningMode), `${expected.lessonId}: learningMode missing`);
    check(Array.isArray(topic.searchTerms) && topic.searchTerms.length > 0 && topic.searchTerms.every(nonEmpty), `${expected.lessonId}: search terms missing`);
  }
  safePublicPayload(catalog, "catalog");
}

if (manifest) {
  check(manifest.schemaVersion === 1 && manifest.courseId === "CAIE-9618-P1-2026", "release manifest identity mismatch");
  check(nonEmpty(manifest.releaseId) && /chapter-?[23]/i.test(manifest.releaseId), "release manifest ID must identify a cumulative candidate containing Chapter 2");
  const chapter2Entries = manifest.lessons?.filter((entry) => expectedLessonIds.has(entry.lessonId)) ?? [];
  check(chapter2Entries.length === 10, `release manifest: expected 10 Chapter 2 entries, got ${chapter2Entries.length}`);
  unique(manifest.lessons?.map((entry) => entry.lessonId) ?? [], "release manifest lessonId");
  unique(manifest.lessons?.map((entry) => entry.slug) ?? [], "release manifest slug");
  for (const expected of expectedLessons) {
    const released = chapter2Entries.find((entry) => entry.lessonId === expected.lessonId);
    check(Boolean(released), `release manifest: ${expected.lessonId} is missing`);
    if (!released) continue;
    check(released.slug === expected.slug, `${expected.lessonId}: manifest slug mismatch`);
    check(released.state === "available", `${expected.lessonId}: release state must be available`);
    check(/^\d+\.\d+\.\d+$/.test(released.contentVersion), `${expected.lessonId}: invalid contentVersion`);
    check(/^\d+\.\d+\.\d+$/.test(released.assessmentVersion), `${expected.lessonId}: invalid assessmentVersion`);
    check(Array.isArray(released.modelVersions) && released.modelVersions.some((value) => new RegExp(`^VIS-${expected.lessonId}@[1-9]\\d*$`).test(value)), `${expected.lessonId}: versioned visual model is missing`);
  }
  safePublicPayload(manifest, "release manifest");
}

if (visualOracles) {
  check(Array.isArray(visualOracles), "Chapter 2 visual oracles must be an array");
  const oracles = Array.isArray(visualOracles) ? visualOracles : [];
  check(oracles.length === 10, `Chapter 2 visual oracles: expected 10, got ${oracles.length}`);
  unique(oracles.map((oracle) => oracle.lessonId), "Chapter 2 visual-oracle lesson IDs");
  unique(oracles.map((oracle) => oracle.visualId), "Chapter 2 visual-oracle visual IDs");
  check(oracles.every((oracle) => expectedLessonIds.has(oracle.lessonId)), "Chapter 2 visual oracles contain a lesson outside L09–L18");

  for (const expected of expectedLessons) {
    const oracle = oracles.find((entry) => entry.lessonId === expected.lessonId);
    check(Boolean(oracle), `${expected.lessonId}: visual oracle missing`);
    if (!oracle) continue;
    check(oracle.visualId === `VIS-${expected.lessonId}`, `${expected.lessonId}: visual oracle ID mismatch`);
    localized(oracle.title, `${expected.lessonId} visual-oracle title`);
    localized(oracle.intro, `${expected.lessonId} visual-oracle intro`);
    localized(oracle.prompt, `${expected.lessonId} visual-oracle prediction prompt`);
    check(Array.isArray(oracle.choices) && oracle.choices.length >= 2, `${expected.lessonId}: visual-oracle choices missing`);
    unique(oracle.choices?.map((choice) => choice.id) ?? [], `${expected.lessonId} visual choice IDs`);
    oracle.choices?.forEach((choice, index) => {
      check(nonEmpty(choice.id), `${expected.lessonId} visual choice[${index}]: ID missing`);
      localized(choice.label, `${expected.lessonId} visual choice[${index}] label`);
    });
    const choiceIds = new Set(oracle.choices?.map((choice) => choice.id) ?? []);

    check(Array.isArray(oracle.scenarios) && oracle.scenarios.length >= 2, `${expected.lessonId}: at least two visual scenarios required`);
    unique(oracle.scenarios?.map((scenario) => scenario.id) ?? [], `${expected.lessonId} visual scenario IDs`);
    oracle.scenarios?.forEach((scenario, scenarioIndex) => {
      const scope = `${expected.lessonId}/${scenario.id ?? `scenario-${scenarioIndex + 1}`}`;
      check(nonEmpty(scenario.id), `${scope}: stable scenario ID missing`);
      localized(scenario.label, `${scope} label`);
      check(choiceIds.has(scenario.correctChoiceId), `${scope}: correctChoiceId ${scenario.correctChoiceId ?? "<missing>"} does not resolve`);

      check(Array.isArray(scenario.nodes) && scenario.nodes.length >= 2, `${scope}: at least two nodes required`);
      unique(scenario.nodes?.map((node) => node.id) ?? [], `${scope} node IDs`);
      const nodeIds = new Set(scenario.nodes?.map((node) => node.id) ?? []);
      scenario.nodes?.forEach((node, nodeIndex) => {
        check(nonEmpty(node.id) && nonEmpty(node.kind), `${scope} node[${nodeIndex}]: ID/kind missing`);
        check(expectedVisualNodeKinds.has(node.kind), `${scope}/${node.id}: unsupported node kind ${node.kind ?? "<missing>"}`);
        localized(node.label, `${scope} node[${nodeIndex}] label`);
        check(Number.isFinite(node.x) && Number.isFinite(node.y), `${scope}/${node.id}: finite x/y coordinates required`);
        check(node.x >= 58 && node.x <= 542 && node.y >= 27 && node.y <= 243, `${scope}/${node.id}: node box is clipped by the 600×270 viewBox`);
      });

      check(Array.isArray(scenario.edges) && scenario.edges.length > 0, `${scope}: graph edges missing`);
      unique(scenario.edges?.map((edge) => edge.id) ?? [], `${scope} edge IDs`);
      const edgeIds = new Set(scenario.edges?.map((edge) => edge.id) ?? []);
      scenario.edges?.forEach((edge, edgeIndex) => {
        check(nonEmpty(edge.id), `${scope} edge[${edgeIndex}]: ID missing`);
        localized(edge.label, `${scope} edge[${edgeIndex}] label`);
        check(nodeIds.has(edge.from), `${scope}/${edge.id}: from node ${edge.from ?? "<missing>"} does not resolve`);
        check(nodeIds.has(edge.to), `${scope}/${edge.id}: to node ${edge.to ?? "<missing>"} does not resolve`);
        check(edge.from !== edge.to, `${scope}/${edge.id}: self-loop is not a valid instructional edge`);
      });

      check(Array.isArray(scenario.steps) && scenario.steps.length >= 3, `${scope}: at least three visual steps required`);
      scenario.steps?.forEach((step, stepIndex) => {
        const stepScope = `${scope}/step-${stepIndex + 1}`;
        localized(step.title, `${stepScope} title`);
        localized(step.explanation, `${stepScope} explanation`);
        check(Array.isArray(step.activeNodes), `${stepScope}: activeNodes must be an array`);
        check(Array.isArray(step.activeEdges), `${stepScope}: activeEdges must be an array`);
        unique(step.activeNodes ?? [], `${stepScope} active node IDs`);
        unique(step.activeEdges ?? [], `${stepScope} active edge IDs`);
        step.activeNodes?.forEach((id) => check(nodeIds.has(id), `${stepScope}: active node ${id} does not resolve`));
        step.activeEdges?.forEach((id) => check(edgeIds.has(id), `${stepScope}: active edge ${id} does not resolve`));
        if (step.metric !== undefined) {
          localized(step.metric?.label, `${stepScope} metric label`);
          localized(step.metric?.value, `${stepScope} metric value`);
        }
      });
    });
  }
  safePublicPayload(oracles, "Chapter 2 visual oracles");
}

if (visualDefinitions) {
  check(Array.isArray(visualDefinitions), "visual definitions must be an array");
  const definitions = Array.isArray(visualDefinitions) ? visualDefinitions : [];
  const chapter2Definitions = definitions.filter((entry) => expectedLessonIds.has(entry.lessonId) || /^VIS-P1-L(?:09|1[0-8])$/.test(entry.visualId));
  check(chapter2Definitions.length === 10, `visual definitions: expected exactly 10 Chapter 2 entries, got ${chapter2Definitions.length}`);
  unique(definitions.map((entry) => entry.visualId), "all visual-definition IDs");
  unique(chapter2Definitions.map((entry) => entry.lessonId), "Chapter 2 visual-definition lesson IDs");

  for (const expected of expectedLessons) {
    const expectedVisualId = `VIS-${expected.lessonId}`;
    const definition = chapter2Definitions.find((entry) => entry.lessonId === expected.lessonId);
    const oracle = Array.isArray(visualOracles) ? visualOracles.find((entry) => entry.lessonId === expected.lessonId) : undefined;
    check(Boolean(definition), `${expected.lessonId}: visual definition missing`);
    if (!definition) continue;
    check(definition.visualId === expectedVisualId, `${expected.lessonId}: visual-definition ID must be ${expectedVisualId}`);
    check(definition.lessonId === expected.lessonId, `${expectedVisualId}: lesson mapping mismatch`);
    localized(definition.title, `${expectedVisualId} title`);
    localized(definition.learnerAction, `${expectedVisualId} learner action`);
    localized(definition.observableOutcome, `${expectedVisualId} observable outcome`);
    localized(definition.modelScope, `${expectedVisualId} model scope`);
    localized(definition.modelLimitations, `${expectedVisualId} model limitations`);
    check(Array.isArray(definition.atlasIds) && definition.atlasIds.length === 0, `${expectedVisualId}: Chapter 2 finite model must not claim an Atlas requirement`);
    check(Array.isArray(definition.sceneIds), `${expectedVisualId}: sceneIds must be an array`);
    unique(definition.sceneIds ?? [], `${expectedVisualId} scene IDs`);
    check(definition.reviewStatus === "model-reviewed-with-scope-limits", `${expectedVisualId}: scoped review status missing`);
    if (oracle) {
      check(same(definition.title, oracle.title), `${expectedVisualId}: oracle/definition titles differ`);
      const expectedSceneIds = oracle.scenarios?.flatMap((scenario) => scenario.steps?.map((_, index) => `${expected.lessonId}-${scenario.id}-step-${index + 1}`) ?? []) ?? [];
      check(definition.sceneIds?.length === expectedSceneIds.length, `${expectedVisualId}: scene count ${definition.sceneIds?.length ?? 0} does not match ${expectedSceneIds.length} oracle steps`);
      check(same(definition.sceneIds, expectedSceneIds), `${expectedVisualId}: scene IDs/order do not map exactly to oracle steps`);
    }
  }
  safePublicPayload(chapter2Definitions, "Chapter 2 visual definitions");
}

const loadedLessons = new Map();
const actualObjectives = new Set();
const actualRequirements = new Set();
const assessmentOwnerCounts = new Map();
const globallyStableIds = [];

for (const expected of expectedLessons) {
  const fileName = `content/paper1/lessons/${expected.slug}.json`;
  const lesson = readRequired(fileName);
  if (!lesson) continue;
  loadedLessons.set(expected.lessonId, lesson);
  check(lesson.schemaVersion === 1, `${expected.lessonId}: schemaVersion must be 1`);
  check(lesson.lessonId === expected.lessonId && lesson.slug === expected.slug, `${expected.lessonId}: file identity mismatch`);
  check(lesson.sectionId === "2" && lesson.strandId === "2.1", `${expected.lessonId}: section/strand mismatch`);
  check(lesson.visualId === `VIS-${expected.lessonId}`, `${expected.lessonId}: visualId mismatch`);
  check(/^\d+\.\d+\.\d+$/.test(lesson.contentVersion), `${expected.lessonId}: invalid contentVersion`);
  check(/^\d+\.\d+\.\d+$/.test(lesson.assessmentVersion), `${expected.lessonId}: invalid assessmentVersion`);
  check(same(lesson.objectives?.map((entry) => entry.id), expected.objectives), `${expected.lessonId}: lesson objectives do not match the roadmap`);
  check(same(lesson.requirementIds, expected.requirements), `${expected.lessonId}: lesson requirements do not match the roadmap`);
  check(same(lesson.prerequisiteLessonIds, expected.prerequisites), `${expected.lessonId}: lesson prerequisites do not match the roadmap`);
  expected.objectives.forEach((id) => actualObjectives.add(id));
  expected.requirements.forEach((id) => actualRequirements.add(id));

  localized(lesson.title, `${expected.lessonId} title`);
  localized(lesson.question, `${expected.lessonId} question`);
  localized(lesson.opening, `${expected.lessonId} opening`);
  check(Array.isArray(lesson.objectives) && lesson.objectives.length > 0, `${expected.lessonId}: objectives missing`);
  lesson.objectives?.forEach((objective, index) => localized(objective.text, `${expected.lessonId} objective[${index}]`));

  check(Array.isArray(lesson.theory) && lesson.theory.length > 0, `${expected.lessonId}: theory blocks missing`);
  unique(lesson.theory?.map((block) => block.id) ?? [], `${expected.lessonId} theory IDs`);
  lesson.theory?.forEach((block, index) => {
    check(nonEmpty(block.id), `${expected.lessonId} theory[${index}]: stable ID missing`);
    localized(block.title, `${expected.lessonId} theory[${index}] title`);
    localizedList(block.paragraphs, `${expected.lessonId} theory[${index}] paragraphs`);
    if (block.bullets !== undefined) localizedList(block.bullets, `${expected.lessonId} theory[${index}] bullets`, { allowEmpty: true });
    check(Array.isArray(block.sourceIds) && block.sourceIds.length > 0 && block.sourceIds.every(nonEmpty), `${expected.lessonId} theory[${index}]: source IDs missing`);
    globallyStableIds.push(block.id);
  });

  check(isObject(lesson.workedExample), `${expected.lessonId}: worked example missing`);
  localized(lesson.workedExample?.title, `${expected.lessonId} worked title`);
  localized(lesson.workedExample?.prompt, `${expected.lessonId} worked prompt`);
  localized(lesson.workedExample?.result, `${expected.lessonId} worked result`);
  check(Array.isArray(lesson.workedExample?.steps) && lesson.workedExample.steps.length > 0, `${expected.lessonId}: worked steps missing`);
  unique(lesson.workedExample?.steps?.map((step) => step.id) ?? [], `${expected.lessonId} worked-step IDs`);
  lesson.workedExample?.steps?.forEach((step, index) => {
    check(nonEmpty(step.id), `${expected.lessonId} worked step[${index}]: stable ID missing`);
    localized(step.action, `${expected.lessonId} worked step[${index}] action`);
    localized(step.result, `${expected.lessonId} worked step[${index}] result`);
    globallyStableIds.push(`${expected.lessonId}:worked:${step.id}`);
  });

  localizedList(lesson.recognition?.cues, `${expected.lessonId} recognition cues`);
  localizedList(lesson.recognition?.method, `${expected.lessonId} recognition method`);
  check(Array.isArray(lesson.recognition?.misconceptions) && lesson.recognition.misconceptions.length > 0, `${expected.lessonId}: misconceptions missing`);
  lesson.recognition?.misconceptions?.forEach((item, index) => {
    localized(item.mistake, `${expected.lessonId} misconception[${index}] mistake`);
    localized(item.correction, `${expected.lessonId} misconception[${index}] correction`);
  });
  check(Array.isArray(lesson.recognition?.items), `${expected.lessonId}: recognition item collection missing`);
  unique(lesson.recognition?.items?.map((item) => item.id) ?? [], `${expected.lessonId} recognition-item IDs`);
  lesson.recognition?.items?.forEach((item, index) => {
    check(nonEmpty(item.id), `${expected.lessonId} recognition item[${index}]: stable ID missing`);
    localized(item.title, `${expected.lessonId} recognition item[${index}] title`);
    localized(item.setup, `${expected.lessonId} recognition item[${index}] setup`);
    localized(item.prompt, `${expected.lessonId} recognition item[${index}] prompt`);
    localized(item.expectedEvidence, `${expected.lessonId} recognition item[${index}] expected evidence`);
    globallyStableIds.push(item.id);
  });

  check(Array.isArray(lesson.assessments) && lesson.assessments.length === expected.requirements.length, `${expected.lessonId}: must have exactly one assessment per requirement`);
  unique(lesson.assessments?.map((item) => item.id) ?? [], `${expected.lessonId} assessment IDs`);
  for (const requirementId of expected.requirements) {
    const matching = lesson.assessments?.filter((item) => item.requirementId === requirementId) ?? [];
    check(matching.length === 1, `${expected.lessonId}/${requirementId}: expected exactly one primary assessment, got ${matching.length}`);
  }
  lesson.assessments?.forEach((item, index) => {
    const expectedId = `${expected.lessonId}-CHECK-${item.requirementId}`;
    check(item.id === expectedId, `${expected.lessonId} assessment[${index}]: stable ID must be ${expectedId}`);
    check(expected.requirements.includes(item.requirementId), `${item.id}: requirement belongs to another lesson`);
    assessmentOwnerCounts.set(item.requirementId, (assessmentOwnerCounts.get(item.requirementId) ?? 0) + 1);
    check(item.origin === "original" && item.claim_kind === "algocore_guidance", `${item.id}: provenance must be AlgoCore-original guidance`);
    check(Array.isArray(item.semanticTags) && item.semanticTags.length > 0 && item.semanticTags.every(nonEmpty), `${item.id}: semantic tags missing`);
    unique(item.semanticTags ?? [], `${item.id} semantic tags`);
    check(["single-choice", "numeric", "short-text", "explain", "compare", "justify"].includes(item.kind), `${item.id}: invalid response kind`);
    check(["guided", "faded", "independent"].includes(item.level), `${item.id}: invalid learning level`);
    localized(item.prompt, `${item.id} prompt`);
    localized(item.hint, `${item.id} hint`);
    localizedList(item.solution?.steps, `${item.id} solution steps`, { allowEmpty: true });
    localized(item.solution?.modelAnswer, `${item.id} model answer`);
    if (item.kind === "single-choice") {
      check(Array.isArray(item.choices) && item.choices.length >= 2, `${item.id}: choices missing`);
      unique(item.choices?.map((choice) => choice.id) ?? [], `${item.id} choice IDs`);
      item.choices?.forEach((choice, choiceIndex) => localized(choice.label, `${item.id} choice[${choiceIndex}]`));
      check(item.choices?.some((choice) => choice.id === item.correctChoiceId), `${item.id}: correctChoiceId does not resolve`);
    } else if (["numeric", "short-text"].includes(item.kind)) {
      check(Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length > 0 && item.acceptedAnswers.every(nonEmpty), `${item.id}: accepted answers missing`);
    } else {
      localizedList(item.solution?.rubric, `${item.id} rubric`);
    }
    if (item.solution?.alternatives !== undefined) localizedList(item.solution.alternatives, `${item.id} alternatives`, { allowEmpty: true });
    globallyStableIds.push(item.id);
  });

  localized(lesson.recall?.prompt, `${expected.lessonId} recall prompt`);
  localizedList(lesson.recall?.answerPoints, `${expected.lessonId} recall points`);
  check(Array.isArray(lesson.glossary) && lesson.glossary.length > 0, `${expected.lessonId}: glossary missing`);
  unique(lesson.glossary?.map((entry) => entry.term) ?? [], `${expected.lessonId} glossary terms`);
  lesson.glossary?.forEach((entry, index) => {
    check(nonEmpty(entry.term), `${expected.lessonId} glossary[${index}]: term missing`);
    localized(entry.meaning, `${expected.lessonId} glossary[${index}] meaning`);
  });
  check(Array.isArray(lesson.relatedSlugs) && lesson.relatedSlugs.every(nonEmpty), `${expected.lessonId}: relatedSlugs invalid`);

  const sourceIds = lesson.sources?.map((source) => source.id) ?? [];
  unique(sourceIds, `${expected.lessonId} source IDs`);
  for (const requiredSource of ["SYL-2026", "BOOK-C02", "ALG-P1"]) check(sourceIds.includes(requiredSource), `${expected.lessonId}: required source ${requiredSource} missing`);
  lesson.sources?.forEach((source, index) => {
    check(nonEmpty(source.id) && nonEmpty(source.locator), `${expected.lessonId} source[${index}]: ID/locator missing`);
    check(["syllabus", "coursebook", "algocore"].includes(source.kind), `${expected.lessonId} source[${index}]: invalid kind`);
    localized(source.title, `${expected.lessonId} source[${index}] title`);
  });
  const declaredSourceIds = new Set(sourceIds);
  lesson.theory?.forEach((block) => block.sourceIds?.forEach((sourceId) => check(declaredSourceIds.has(sourceId), `${expected.lessonId}/${block.id}: undeclared source ID ${sourceId}`)));

  for (const block of requiredCoverageBlocks) {
    check(Array.isArray(lesson.contractCoverage?.[block]) && lesson.contractCoverage[block].length > 0 && lesson.contractCoverage[block].every(nonEmpty), `${expected.lessonId}: ${block} contract coverage missing`);
  }

  const released = manifest?.lessons?.find((entry) => entry.lessonId === expected.lessonId);
  check(released?.slug === lesson.slug, `${expected.lessonId}: manifest/lesson slug mismatch`);
  check(released?.contentVersion === lesson.contentVersion, `${expected.lessonId}: manifest/lesson contentVersion mismatch`);
  check(released?.assessmentVersion === lesson.assessmentVersion, `${expected.lessonId}: manifest/lesson assessmentVersion mismatch`);
  safePublicPayload(lesson, expected.lessonId);
}

check(loadedLessons.size === 10, `lessons: expected 10 Chapter 2 payloads, got ${loadedLessons.size}`);
check(actualObjectives.size === 15 && [...expectedObjectives].every((id) => actualObjectives.has(id)), `lessons: expected exact 15-objective coverage, got ${actualObjectives.size}`);
check(actualRequirements.size === 26 && [...expectedRequirements].every((id) => actualRequirements.has(id)), `lessons: expected exact 26-requirement coverage, got ${actualRequirements.size}`);
for (const requirementId of expectedRequirements) check(assessmentOwnerCounts.get(requirementId) === 1, `${requirementId}: must have exactly one primary lesson assessment`);
unique(globallyStableIds, "Chapter 2 stable content IDs");

if (practice) {
  check(practice.schemaVersion === 1, "Chapter 2 practice: schemaVersion must be 1");
  check(practice.practiceId === "P1-CP02" && practice.chapterId === "2", "Chapter 2 practice identity mismatch");
  check(practice.courseId === "CAIE-9618-P1-2026", "Chapter 2 practice course ID mismatch");
  check(/^\d+\.\d+\.\d+$/.test(practice.contentVersion), "Chapter 2 practice contentVersion invalid");
  localized(practice.title, "Chapter 2 practice title");
  localized(practice.intro, "Chapter 2 practice intro");
  check(Number.isInteger(practice.timing?.timedMinutes) && practice.timing.timedMinutes > 0, "Chapter 2 practice timed duration invalid");
  check(practice.timing?.untimedAvailable === true, "Chapter 2 practice must support untimed mode");
  check(nonEmpty(practice.revealPolicy) && /attempt/i.test(practice.revealPolicy), "Chapter 2 practice reveal policy must require an attempt");

  const provenanceIds = practice.provenance?.map((entry) => entry.id) ?? [];
  unique(provenanceIds, "Chapter 2 practice provenance IDs");
  for (const requiredSource of ["SYL-2026", "BOOK-C02", "ALG-P1"]) check(provenanceIds.includes(requiredSource), `Chapter 2 practice: required provenance ${requiredSource} missing`);
  practice.provenance?.forEach((entry, index) => {
    check(nonEmpty(entry.id) && nonEmpty(entry.locator), `Chapter 2 practice provenance[${index}]: ID/locator missing`);
    check(["syllabus", "coursebook", "algocore"].includes(entry.kind), `Chapter 2 practice provenance[${index}]: invalid kind`);
  });

  check(Array.isArray(practice.items) && practice.items.length > 0, "Chapter 2 practice items missing");
  unique(practice.items?.map((item) => item.id) ?? [], "Chapter 2 practice item IDs");
  const practiceRequirements = new Set();
  const practiceObjectives = new Set();
  const practiceLevels = new Set();
  const practiceAOs = new Set();
  const markingPointIds = [];
  let itemMarks = 0;
  let markingPointMarks = 0;
  const marksByAO = { AO1: 0, AO2: 0 };

  practice.items?.forEach((item, index) => {
    const questionNumber = String(index + 1).padStart(2, "0");
    check(item.id === `P1-CP02-Q${questionNumber}`, `Chapter 2 practice item[${index}]: stable ID/order mismatch`);
    check(["guided", "faded", "independent"].includes(item.level), `${item.id}: invalid practice level`);
    check(["AO1", "AO2"].includes(item.ao), `${item.id}: invalid AO`);
    check(nonEmpty(item.commandWord) && nonEmpty(item.responseProduct), `${item.id}: command word/response product missing`);
    check(typeof item.novelContext === "boolean", `${item.id}: novelContext must be explicit`);
    check(Number.isInteger(item.marks) && item.marks > 0, `${item.id}: marks must be a positive integer`);
    check(Array.isArray(item.requirementIds) && item.requirementIds.length > 0, `${item.id}: requirement IDs missing`);
    check(Array.isArray(item.objectiveIds) && item.objectiveIds.length > 0, `${item.id}: objective IDs missing`);
    check(same(item.strandIds, ["2.1"]), `${item.id}: strand IDs must be exactly [\"2.1\"]`);
    unique(item.requirementIds ?? [], `${item.id} requirement IDs`);
    unique(item.objectiveIds ?? [], `${item.id} objective IDs`);
    item.requirementIds?.forEach((requirementId) => {
      check(expectedRequirements.has(requirementId), `${item.id}: unknown Chapter 2 requirement ${requirementId}`);
      practiceRequirements.add(requirementId);
      const owner = requirementOwner.get(requirementId);
      check(item.objectiveIds?.some((objectiveId) => owner?.objectives.includes(objectiveId)), `${item.id}/${requirementId}: owning objective is not represented`);
    });
    item.objectiveIds?.forEach((objectiveId) => {
      check(expectedObjectives.has(objectiveId), `${item.id}: unknown Chapter 2 objective ${objectiveId}`);
      practiceObjectives.add(objectiveId);
      check(Boolean(objectiveOwner.get(objectiveId)), `${item.id}: objective has no canonical owner`);
    });
    localized(item.prompt, `${item.id} prompt`);
    localized(item.hint, `${item.id} hint`);
    localized(item.solution?.modelAnswer, `${item.id} model answer`);
    localizedList(item.solution?.rubric, `${item.id} rubric`);
    localizedList(item.solution?.alternatives, `${item.id} alternatives`, { allowEmpty: true });
    check(Array.isArray(item.solution?.markingPoints) && item.solution.markingPoints.length > 0, `${item.id}: marking points missing`);

    let pointsForItem = 0;
    item.solution?.markingPoints?.forEach((point, pointIndex) => {
      const expectedPointId = `Q${questionNumber}-M${pointIndex + 1}`;
      check(point.id === expectedPointId, `${item.id} marking point[${pointIndex}]: stable ID must be ${expectedPointId}`);
      check(Number.isInteger(point.marks) && point.marks > 0, `${point.id}: marks must be a positive integer`);
      check(Array.isArray(point.requirementIds) && point.requirementIds.length > 0, `${point.id}: requirement IDs missing`);
      point.requirementIds?.forEach((requirementId) => check(item.requirementIds.includes(requirementId), `${point.id}: requirement ${requirementId} is outside its item`));
      localized(point.point, `${point.id} marking point`);
      markingPointIds.push(point.id);
      pointsForItem += point.marks;
    });
    const evidencedRequirements = new Set(item.solution?.markingPoints?.flatMap((point) => point.requirementIds ?? []) ?? []);
    item.requirementIds?.forEach((requirementId) => check(evidencedRequirements.has(requirementId), `${item.id}: requirement ${requirementId} has no marking-point evidence`));
    check(pointsForItem === item.marks, `${item.id}: item marks ${item.marks} do not equal marking-point marks ${pointsForItem}`);
    check(expectedSlugs.has(item.revisitLessonSlug), `${item.id}: revisitLessonSlug must resolve to a Chapter 2 lesson`);
    const revisitOwner = expectedLessons.find((lesson) => lesson.slug === item.revisitLessonSlug);
    check(item.requirementIds?.some((requirementId) => revisitOwner?.requirements.includes(requirementId)), `${item.id}: revisit lesson does not own any assessed requirement`);
    check(item.origin === "original" && item.claim_kind === "algocore_guidance", `${item.id}: practice provenance must be AlgoCore-original guidance`);
    practiceLevels.add(item.level);
    practiceAOs.add(item.ao);
    itemMarks += item.marks;
    markingPointMarks += pointsForItem;
    if (item.ao in marksByAO) marksByAO[item.ao] += item.marks;
  });

  unique(markingPointIds, "Chapter 2 practice marking-point IDs");
  check(practiceRequirements.size === 26 && [...expectedRequirements].every((id) => practiceRequirements.has(id)), `Chapter 2 practice must cover 26/26 requirements, got ${practiceRequirements.size}`);
  check(practiceObjectives.size === 15 && [...expectedObjectives].every((id) => practiceObjectives.has(id)), `Chapter 2 practice must cover 15/15 objectives, got ${practiceObjectives.size}`);
  check(["guided", "faded", "independent"].every((level) => practiceLevels.has(level)), "Chapter 2 practice must include guided, faded and independent items");
  check(practiceAOs.has("AO1") && practiceAOs.has("AO2"), "Chapter 2 practice must include AO1 and AO2");
  check(practice.items?.some((item) => item.novelContext === true), "Chapter 2 practice must include novel-context evidence");
  check(Number.isInteger(practice.totalMarks) && practice.totalMarks > 0, "Chapter 2 practice totalMarks invalid");
  check(practice.totalMarks === itemMarks && itemMarks === markingPointMarks, `Chapter 2 practice mark mismatch: declared ${practice.totalMarks}, items ${itemMarks}, points ${markingPointMarks}`);
  check(practice.aoBlueprint?.AO1 === marksByAO.AO1 && practice.aoBlueprint?.AO2 === marksByAO.AO2, `Chapter 2 practice AO blueprint mismatch: declared ${practice.aoBlueprint?.AO1}/${practice.aoBlueprint?.AO2}, items ${marksByAO.AO1}/${marksByAO.AO2}`);
  check((practice.aoBlueprint?.AO1 ?? 0) + (practice.aoBlueprint?.AO2 ?? 0) === practice.totalMarks, "Chapter 2 practice AO marks must sum to totalMarks");
  localized(practice.aoBlueprint?.note, "Chapter 2 practice AO note");
  safePublicPayload(practice, "Chapter 2 practice");
}

if (failures.length) {
  console.error(`Paper 1 Chapter 2 contract: FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Paper 1 Chapter 2 contract: PASS");
console.log("10 lessons · 15 objectives · 26 atomic requirements · one primary assessment each · bilingual/source/version parity · practice coverage/marks/AO consistent");
