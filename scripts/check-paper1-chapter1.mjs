import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const catalog = read("content/paper1/catalog.json");
const manifest = read("content/paper1/release-manifest.json");
const visualDefinitions = read("content/paper1/visual-definitions.json");
const atlasManifest = read("content/paper1/atlas-manifest.json");
const visualPlacements = read("content/paper1/visual-placements.json");
const chapterPractice = read("content/paper1/practice/chapter-1.json");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const allStrings = (value, visitor) => {
  if (typeof value === "string") visitor(value);
  else if (Array.isArray(value)) value.forEach((entry) => allStrings(entry, visitor));
  else if (value && typeof value === "object") Object.values(value).forEach((entry) => allStrings(entry, visitor));
};
const assessmentOracles = {
  "REQ-1.1-01-01": { kinds: ["compare"], tags: ["decimal-prefix", "binary-prefix", "prefix-symbols"] },
  "REQ-1.1-01-02": { kinds: ["short-text"], tags: ["unit-conversion", "bits-bytes", "decimal-binary-magnitude"] },
  "REQ-1.1-02-01": { kinds: ["short-text"], tags: ["binary", "denary", "hexadecimal", "bcd"] },
  "REQ-1.1-02-02": { kinds: ["short-text"], tags: ["ones-complement", "twos-complement", "signed-binary"] },
  "REQ-1.1-03-01": { kinds: ["short-text"], tags: ["base-conversion", "binary-denary", "binary-hexadecimal"] },
  "REQ-1.1-04-01": { kinds: ["short-text"], tags: ["binary-addition", "binary-subtraction", "positive-negative-integers"] },
  "REQ-1.1-05-01": { kinds: ["explain"], tags: ["signed-overflow", "carry-out", "signed-range"] },
  "REQ-1.1-06-01": { kinds: ["explain"], tags: ["bcd-application", "hexadecimal-application"] },
  "REQ-1.1-07-01": { kinds: ["explain"], tags: ["ascii", "extended-ascii", "named-encoding", "unicode"] },
  "REQ-1.2-01-01": { kinds: ["explain"], tags: ["bitmap-encoding", "pixel-grid", "metadata"] },
  "REQ-1.2-01-02": { kinds: ["explain"], tags: ["pixel", "file-header", "image-resolution", "screen-resolution", "colour-depth"] },
  "REQ-1.2-02-01": { kinds: ["numeric"], tags: ["bitmap-file-size", "bits-to-bytes", "stated-assumptions"] },
  "REQ-1.2-03-01": { kinds: ["explain"], tags: ["resolution-quality", "resolution-size", "bit-depth-quality", "bit-depth-size"] },
  "REQ-1.2-04-01": { kinds: ["explain"], tags: ["vector-encoding", "drawing-instruction", "renderer"] },
  "REQ-1.2-04-02": { kinds: ["explain"], tags: ["drawing-object", "property", "drawing-list"] },
  "REQ-1.2-05-01": { kinds: ["justify"], tags: ["bitmap-vector-choice", "task-justification"] },
  "REQ-1.2-06-01": { kinds: ["explain"], tags: ["analogue-digital", "sampling", "quantisation", "binary-encoding"] },
  "REQ-1.2-06-02": { kinds: ["compare"], tags: ["sampling", "sampling-rate", "sampling-resolution"] },
  "REQ-1.2-07-01": { kinds: ["explain"], tags: ["rate-accuracy", "rate-size", "resolution-accuracy", "resolution-size"] },
  "REQ-1.3-01-01": { kinds: ["explain"], tags: ["compression-need", "storage", "transmission"] },
  "REQ-1.3-02-01": { kinds: ["compare"], tags: ["lossless", "lossy", "reconstruction"] },
  "REQ-1.3-02-02": { kinds: ["justify"], tags: ["compression-choice", "scenario-justification"] },
  "REQ-1.3-03-01": { kinds: ["explain"], tags: ["text-compression", "bitmap-compression", "vector-compression", "sound-compression", "rle"] },
};

check(catalog.sections.length === 8, `expected 8 sections, got ${catalog.sections.length}`);
check(catalog.course.examYear === 2026 && catalog.course.syllabusVersion === 2, "course must target Cambridge 9618 exams 2026 syllabus version 2");
check(catalog.topics.length === 8, `expected 8 released Chapter 1 topics, got ${catalog.topics.length}`);
check(manifest.lessons.length === 8, `expected 8 manifest lessons, got ${manifest.lessons.length}`);
check(visualDefinitions.length === 8, `expected 8 visual definitions, got ${visualDefinitions.length}`);
check(catalog.sections[0]?.status === "available", "Section 1 must be available");
check(catalog.sections.slice(1).every((entry) => entry.status === "planned"), "Sections 2–8 must remain planned");

const lessonIds = new Set();
const slugs = new Set();
const objectiveIds = new Set();
const requirementIds = new Set();
const assessedRequirements = new Map();
const lessonsById = new Map();
let assessmentCount = 0;
for (const topic of catalog.topics) {
  check(topic.topicId === topic.lessonId, `${topic.slug}: topicId must equal lessonId in v1`);
  check(!lessonIds.has(topic.lessonId), `${topic.lessonId}: duplicate lessonId`);
  check(!slugs.has(topic.slug), `${topic.slug}: duplicate slug`);
  lessonIds.add(topic.lessonId); slugs.add(topic.slug);
  const lesson = read(`content/paper1/lessons/${topic.slug}.json`);
  lessonsById.set(lesson.lessonId, lesson);
  check(lesson.lessonId === topic.lessonId && lesson.slug === topic.slug, `${topic.slug}: identity mismatch`);
  check(lesson.visualId === `VIS-${lesson.lessonId}`, `${topic.slug}: visual mapping mismatch`);
  check(/^1\.2\.\d+$/.test(lesson.contentVersion), `${topic.slug}: Chapter 1 completion contentVersion must be 1.2.x`);
  check(/^1\.\d+\.\d+$/.test(lesson.assessmentVersion), `${topic.slug}: assessmentVersion missing`);
  check(lesson.objectives.map((entry) => entry.id).join("|") === topic.objectiveIds.join("|"), `${topic.slug}: objective catalog mismatch`);
  check(lesson.requirementIds.join("|") === topic.requirementIds.join("|"), `${topic.slug}: requirement catalog mismatch`);
  lesson.objectives.forEach((entry) => objectiveIds.add(entry.id));
  lesson.requirementIds.forEach((id) => {
    check(!requirementIds.has(id), `${id}: assigned to more than one primary lesson`);
    requirementIds.add(id);
  });
  for (const id of Array.from({ length: 11 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`)) {
    check(Array.isArray(lesson.contractCoverage[id]) && lesson.contractCoverage[id].length > 0, `${topic.slug}: missing ${id} coverage`);
  }
  check(lesson.assessments.length === lesson.requirementIds.length, `${topic.slug}: assessment/requirement count mismatch`);
  check(Array.isArray(lesson.recognition?.items), `${topic.slug}: recognition task anchor collection missing`);
  check(lesson.sources.some((source) => source.id === "BOOK-C01" && source.kind === "coursebook"), `${topic.slug}: Chapter 1 coursebook provenance missing`);
  for (const item of lesson.assessments) {
    assessmentCount += 1;
    assessedRequirements.set(item.requirementId, (assessedRequirements.get(item.requirementId) ?? 0) + 1);
    check(lesson.requirementIds.includes(item.requirementId), `${item.id}: requirement is outside lesson`);
    check(item.hint.en && item.hint.vi && item.solution.modelAnswer.en && item.solution.modelAnswer.vi, `${item.id}: locale or solution missing`);
    check(item.origin === "original" && item.claim_kind === "algocore_guidance", `${item.id}: original assessment provenance missing`);
    const oracle = assessmentOracles[item.requirementId];
    check(Boolean(oracle), `${item.id}: semantic oracle missing`);
    check(oracle?.kinds.includes(item.kind), `${item.id}: response product does not match semantic oracle`);
    check(JSON.stringify(item.semanticTags) === JSON.stringify(oracle?.tags), `${item.id}: semantic coverage tags do not match oracle`);
    if (item.kind === "single-choice") {
      check(Array.isArray(item.choices) && item.choices.some((choice) => choice.id === item.correctChoiceId), `${item.id}: correct choice is missing`);
    } else if (["numeric", "short-text"].includes(item.kind)) {
      check(Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length > 0, `${item.id}: accepted answers are missing`);
    } else {
      check(Array.isArray(item.solution.rubric) && item.solution.rubric.length > 0, `${item.id}: self-review rubric is missing`);
    }
  }
  allStrings(lesson, (value) => check(!/(?:[A-Z]:\\|file:\/\/|\.\.\/|CONTROLLED_CHECK)/i.test(value), `${topic.slug}: private/local reference leaked`));
  const released = manifest.lessons.find((entry) => entry.lessonId === lesson.lessonId);
  check(released?.state === "available", `${topic.slug}: not available in manifest`);
  check(released?.slug === lesson.slug && released?.contentVersion === lesson.contentVersion, `${topic.slug}: manifest version mismatch`);
  check(released?.assessmentVersion === lesson.assessmentVersion, `${topic.slug}: manifest assessment version mismatch`);
}

const visualIds = new Set();
let atlasAssociationCount = 0;
for (const visual of visualDefinitions) {
  check(!visualIds.has(visual.visualId), `${visual.visualId}: duplicate visual definition`);
  visualIds.add(visual.visualId);
  check(visual.visualId === `VIS-${visual.lessonId}`, `${visual.visualId}: lesson identity mismatch`);
  check(visual.title?.en && visual.title?.vi && visual.learnerAction?.en && visual.learnerAction?.vi && visual.observableOutcome?.en && visual.observableOutcome?.vi, `${visual.visualId}: localized learning metadata missing`);
  check(visual.modelScope?.en && visual.modelScope?.vi && visual.modelLimitations?.en && visual.modelLimitations?.vi, `${visual.visualId}: localized scope/limitations missing`);
  check(visual.reviewStatus === "model-reviewed-with-scope-limits", `${visual.visualId}: review status missing`);
  check(Array.isArray(visual.atlasIds) && visual.atlasIds.length > 0 && visual.atlasIds.every((id) => /^BOOK-C\d{2}-P\d{3}-/.test(id)), `${visual.visualId}: atlas IDs missing or invalid`);
  atlasAssociationCount += visual.atlasIds.length;
}
check(atlasAssociationCount === 56, `expected 56 Chapter 1 atlas associations, got ${atlasAssociationCount}`);

const expectedAtlasIds = visualDefinitions.flatMap((visual) => visual.atlasIds);
const publishedAtlasIds = atlasManifest.items?.map((item) => item.id) ?? [];
const validAtlasRoles = new Set(["required", "supporting", "extension"]);
check(atlasManifest.schemaVersion === 1, "public Atlas schema version must be 1");
check(atlasManifest.selection === "representative-final-frame", "public Atlas must declare representative final-frame selection");
check(atlasManifest.itemCount === 56 && publishedAtlasIds.length === 56, `expected 56 public Atlas items, got ${publishedAtlasIds.length}`);
check(new Set(publishedAtlasIds).size === 56, "public Atlas IDs must be unique");
check(JSON.stringify(publishedAtlasIds) === JSON.stringify(expectedAtlasIds), "public Atlas IDs must resolve every visual association exactly and in lesson order");

for (const item of atlasManifest.items ?? []) {
  const visual = visualDefinitions.find((entry) => entry.visualId === item.visualId);
  check(Boolean(visual) && visual.lessonId === item.lessonId && visual.atlasIds.includes(item.id), `${item.id}: Atlas lesson/visual mapping mismatch`);
  check(validAtlasRoles.has(item.role), `${item.id}: invalid Atlas learning role`);
  check(Boolean(item.title?.en && item.title?.vi && item.description?.en && item.description?.vi), `${item.id}: localized Atlas title or description missing`);
  check(Number.isInteger(item.source?.printedPage) && item.source.printedPage > 0 && Boolean(item.source?.label), `${item.id}: printed page or source label missing`);
  for (const locale of ["en", "vi"]) {
    const expectedPreview = `/paper1/atlas/${locale}/${item.id}.svg`;
    check(item.preview?.[locale] === expectedPreview, `${item.id}: ${locale} preview path is not canonical`);
    const assetPath = path.join(root, "public", expectedPreview.slice(1));
    check(fs.existsSync(assetPath), `${item.id}: ${locale} SVG preview missing`);
    if (fs.existsSync(assetPath)) {
      const svg = fs.readFileSync(assetPath, "utf8");
      check(/^<svg[\s>]/.test(svg) && /<title>[^<]+<\/title>/.test(svg), `${item.id}: ${locale} preview is not a titled SVG`);
      check(!/<script\b|(?:href|src)\s*=|[A-Z]:\\|file:\/\//i.test(svg), `${item.id}: ${locale} preview contains an external or private reference`);
    }
  }
}
for (const lessonId of lessonIds) {
  check(atlasManifest.items.some((item) => item.lessonId === lessonId && item.role === "required"), `${lessonId}: Atlas must include at least one core visual`);
}
for (const role of validAtlasRoles) {
  check(atlasManifest.items.some((item) => item.role === role), `public Atlas has no ${role} visual`);
}
allStrings(atlasManifest, (value) => check(!/(?:[A-Z]:\\|file:\/\/|\.\.\/|CONTROLLED_CHECK)/i.test(value), "public Atlas manifest leaks a private/local reference"));

const placementRows = visualPlacements.lessons?.flatMap((lesson) => [
  ...(lesson.instructionalPlacements ?? []),
  ...(lesson.referencePlacements ?? []),
]) ?? [];
const dispositionCounts = Object.fromEntries([...new Set(placementRows.map((row) => row.disposition))].map((disposition) => [disposition, placementRows.filter((row) => row.disposition === disposition).length]));
check(visualPlacements.schemaVersion === 1 && visualPlacements.chapterId === "1", "visual placement contract identity mismatch");
check(visualPlacements.lessons?.length === 8, `expected 8 visual placement lesson contracts, got ${visualPlacements.lessons?.length ?? 0}`);
check(placementRows.length === 56, `expected 56 classified Atlas placements, got ${placementRows.length}`);
check(new Set(placementRows.map((row) => row.atlasId)).size === 56, "every Atlas item must have exactly one disposition");
check(dispositionCounts.INLINE_UNDERSTAND === 8, `expected 8 INLINE_UNDERSTAND, got ${dispositionCounts.INLINE_UNDERSTAND ?? 0}`);
check(dispositionCounts.INLINE_OBSERVE_SCENE === 3, `expected 3 INLINE_OBSERVE_SCENE, got ${dispositionCounts.INLINE_OBSERVE_SCENE ?? 0}`);
check(dispositionCounts.INLINE_WORKED_EXAMPLE === 5, `expected 5 INLINE_WORKED_EXAMPLE, got ${dispositionCounts.INLINE_WORKED_EXAMPLE ?? 0}`);
check(dispositionCounts.INLINE_RECOGNISE === 8, `expected 8 INLINE_RECOGNISE, got ${dispositionCounts.INLINE_RECOGNISE ?? 0}`);
check(dispositionCounts.LESSON_REFERENCE_DISCLOSURE === 23, `expected 23 lesson disclosures, got ${dispositionCounts.LESSON_REFERENCE_DISCLOSURE ?? 0}`);
check(dispositionCounts.CHAPTER_ATLAS_ONLY === 8, `expected 8 Chapter Atlas-only items, got ${dispositionCounts.CHAPTER_ATLAS_ONLY ?? 0}`);
check(dispositionCounts.DUPLICATE_OR_REMOVE === 1, `expected 1 retired item, got ${dispositionCounts.DUPLICATE_OR_REMOVE ?? 0}`);
check(placementRows.find((row) => row.disposition === "DUPLICATE_OR_REMOVE")?.atlasId === "BOOK-C03-P082-RGB-PIXEL", "retired cross-chapter duplicate mismatch");
for (const lesson of visualPlacements.lessons ?? []) {
  const lessonContent = lessonsById.get(lesson.lessonId);
  const visualDefinition = visualDefinitions.find((entry) => entry.lessonId === lesson.lessonId);
  check(Boolean(lessonContent), `${lesson.lessonId}: visual placement lesson is not released`);
  for (const placement of lesson.instructionalPlacements ?? []) {
    check(placement.teachingClaim?.en && placement.teachingClaim?.vi && placement.learnerAction?.en && placement.learnerAction?.vi, `${placement.atlasId}: instructional purpose/action missing`);
    check(placement.expectedObservation?.en && placement.expectedObservation?.vi && placement.textEquivalent?.en && placement.textEquivalent?.vi, `${placement.atlasId}: evidence/text equivalent missing`);
    const targetExists = placement.anchor?.kind === "theory-block"
      ? lessonContent?.theory?.some((block) => block.id === placement.anchor.targetId)
      : placement.anchor?.kind === "worked-step"
        ? lessonContent?.workedExample?.steps?.some((step) => step.id === placement.anchor.targetId)
        : placement.anchor?.kind === "recognition-item"
          ? lessonContent?.recognition?.items?.some((item) => item.id === placement.anchor.targetId)
          : placement.anchor?.kind === "visual-scene"
            ? visualDefinition?.sceneIds?.includes(placement.anchor.targetId)
            : false;
    check(Boolean(targetExists), `${placement.atlasId}: instructional anchor ${placement.anchor?.kind}/${placement.anchor?.targetId} does not exist`);
  }
}

const practiceRequirements = new Set(chapterPractice.items?.flatMap((item) => item.requirementIds) ?? []);
const practicePointMarks = chapterPractice.items?.reduce((total, item) => total + item.solution.markingPoints.reduce((subtotal, point) => subtotal + point.marks, 0), 0) ?? 0;
const highRisk = new Set(["REQ-1.1-01-02","REQ-1.1-02-02","REQ-1.1-04-01","REQ-1.1-05-01","REQ-1.2-02-01","REQ-1.2-03-01","REQ-1.2-07-01","REQ-1.3-03-01"]);
const novelRequirements = new Set(chapterPractice.items?.filter((item) => item.novelContext).flatMap((item) => item.requirementIds) ?? []);
check(chapterPractice.practiceId === "P1-CP01" && chapterPractice.items?.length === 17, "Chapter 1 mixed practice must contain the approved 17 items");
check(chapterPractice.totalMarks === 48 && practicePointMarks === 48, `Chapter 1 practice mark contract mismatch (${chapterPractice.totalMarks}/${practicePointMarks})`);
check(practiceRequirements.size === 23 && [...requirementIds].every((id) => practiceRequirements.has(id)), "Chapter 1 practice must cover 23/23 requirements");
check(new Set(chapterPractice.items.map((item) => item.ao)).size === 2, "Chapter 1 practice must include AO1 and AO2");
check([...highRisk].every((id) => novelRequirements.has(id)), "high-risk requirements need novel-context evidence");
check(chapterPractice.items.every((item) => item.origin === "original" && item.claim_kind === "algocore_guidance"), "Chapter 1 practice provenance must be AlgoCore-original");
check(JSON.stringify(chapterPractice.items.find((item) => item.requirementIds.includes("REQ-1.3-03-01")))?.match(/text.*bitmap.*vector.*sound/is), "compression transfer item must cover text, bitmap, vector and sound");

const l03Text = JSON.stringify(read("content/paper1/lessons/signed-arithmetic.json"));
const l08Text = JSON.stringify(read("content/paper1/lessons/compression.json"));
check(["37 + 58", "95 − 68", "127 + 1", "−1 + 1"].every((needle) => l03Text.includes(needle)), "P1-L03 approved Worked/Recall sequence is incomplete");
check(["theory-text", "theory-bitmap", "theory-vector", "theory-sound"].every((needle) => l08Text.includes(needle)), "P1-L08 must teach four media types before assessment");

check(objectiveIds.size === 17, `expected 17 objective IDs, got ${objectiveIds.size}`);
check(requirementIds.size === 23, `expected 23 requirement IDs, got ${requirementIds.size}`);
check(assessmentCount === 23, `expected 23 assessments, got ${assessmentCount}`);
for (const requirement of requirementIds) check(assessedRequirements.get(requirement) === 1, `${requirement}: must have exactly one primary assessment`);

if (failures.length) {
  console.error(`Paper 1 Chapter 1 contract: FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("Paper 1 Chapter 1 contract: PASS");
console.log("8 sections · 8 lessons · 17 objectives · 23 requirements · 23 semantic assessment oracles · 24 inline + 23 disclosure + 8 Chapter Atlas + 1 retired · 17-item/48-mark mixed practice · B01–B11 complete");
