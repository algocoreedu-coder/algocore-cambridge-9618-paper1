import assert from "node:assert/strict";
import fs from "node:fs";
import { createStudentProgressScope, isValidStudentProgressScope } from "../app/lib/auth.ts";
import { computePaper1PracticeDiagnostics } from "../app/lib/paper1/practice-diagnostics.ts";
import {
  paper1ProgressStorageKey,
  projectPaper1LearnerProgress,
  readPaper1ProgressEnvelope,
} from "../app/components/paper1-learning/paper1-progress.ts";

class MemoryStorage {
  #items = new Map();
  getItem(key) { return this.#items.get(key) ?? null; }
  setItem(key, value) { this.#items.set(key, String(value)); }
  removeItem(key) { this.#items.delete(key); }
}

globalThis.localStorage = new MemoryStorage();

const scope = "abcdefghijklmnopqrstuv";
const lessonId = "P1-L99";
const ids = ["A-1", "A-2"];
const rules = [{ id: "A-1", reviewKind: "deterministic" }, { id: "A-2", reviewKind: "self-review" }];
const envelope = {
  meta: { assessmentVersion: "2.0.0", assessmentIds: ids, assessmentReviewRules: rules, lastAssessmentId: "A-2" },
  items: {
    "A-1": { draft: "x", attemptCount: 1, independentAttemptCount: 1, supportedAttemptCount: 0, hintSeen: false, solutionSeen: false, everCorrect: true },
    "A-2": { draft: "y", attemptCount: 1, independentAttemptCount: 1, supportedAttemptCount: 0, hintSeen: false, solutionSeen: true, rubricReviewConfirmed: true },
  },
};
localStorage.setItem(paper1ProgressStorageKey(scope, lessonId), JSON.stringify(envelope));

const current = readPaper1ProgressEnvelope(scope, lessonId, "2.0.0", ids, rules);
assert.ok(current, "current progress contract should restore");
assert.equal(projectPaper1LearnerProgress(current).status, "reviewed");
assert.equal(readPaper1ProgressEnvelope(scope, lessonId, "3.0.0", ids, rules), undefined, "stale assessment version must be rejected");
assert.equal(readPaper1ProgressEnvelope(scope, lessonId, "2.0.0", ["A-1", "A-3"], rules), undefined, "changed assessment IDs must be rejected");
assert.equal(readPaper1ProgressEnvelope(scope, lessonId, "2.0.0", ids, [{ ...rules[0], reviewKind: "self-review" }, rules[1]]), undefined, "changed review rules must be rejected");

const firstScope = createStudentProgressScope();
const secondScope = createStudentProgressScope();
assert.match(firstScope, /^[A-Za-z0-9_-]{22}$/);
assert.match(secondScope, /^[A-Za-z0-9_-]{22}$/);
assert.notEqual(firstScope, secondScope, "each sign-in needs a distinct learner scope");
assert.equal(isValidStudentProgressScope(firstScope), true);
assert.equal(isValidStudentProgressScope(undefined), false);
assert.equal(isValidStudentProgressScope("invalid scope"), false);

const practice = JSON.parse(fs.readFileSync("content/paper1/practice/chapter-3.json", "utf8"));
const emptyDiagnostics = computePaper1PracticeDiagnostics(practice, {});
assert.equal(emptyDiagnostics.ao.reduce((total, row) => total + row.possible, 0), practice.totalMarks);
assert.ok(emptyDiagnostics.weakAreas.length > 0);
const perfectStates = Object.fromEntries(practice.items.map((item) => [item.id, { awardedPointIds: item.solution.markingPoints.map((point) => point.id) }]));
const perfectDiagnostics = computePaper1PracticeDiagnostics(practice, perfectStates);
assert.deepEqual(perfectDiagnostics.ao.map((row) => row.awarded), perfectDiagnostics.ao.map((row) => row.possible));
assert.deepEqual(perfectDiagnostics.weakAreas, []);

const chapter4 = JSON.parse(fs.readFileSync("content/paper1/practice/chapter-4.json", "utf8"));
const q16 = chapter4.items.find((item) => item.id === "P1-CP04-Q16");
assert.ok(q16, "Chapter 4 Q16 fixture missing");
const partialStates = {
  "P1-CP04-Q16": { awardedPointIds: q16.solution.markingPoints.slice(0, 3).map((point) => point.id) },
};
const partialDiagnostics = computePaper1PracticeDiagnostics(chapter4, partialStates);
const bitMasking = partialDiagnostics.weakAreas.find((area) => area.revisitLessonSlug === "bit-masking");
assert.ok(bitMasking, "partial-credit weak area missing");
assert.ok(bitMasking.requirementIds.includes("REQ-4.3-02-01"));
assert.deepEqual(bitMasking.objectiveIds, ["AC26-4.3-02"], "missed monitoring point must not report the achieved bit-operation objective");

console.log("Paper 1 shared UX integrity: PASS (progress contract, session scope, practice diagnostics)");
