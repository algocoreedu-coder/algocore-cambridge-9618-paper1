import type { Paper1ChapterPractice } from "./types";

export type Paper1PracticeDiagnosticState = Readonly<Record<string, { readonly awardedPointIds: readonly string[] }>>;

export type Paper1PracticeDiagnostics = {
  readonly ao: readonly { readonly id: "AO1" | "AO2"; readonly awarded: number; readonly possible: number }[];
  readonly weakAreas: readonly {
    readonly revisitLessonSlug: string;
    readonly lostMarks: number;
    readonly requirementIds: readonly string[];
    readonly objectiveIds: readonly string[];
  }[];
};

function objectiveIdForRequirement(requirementId: string) {
  const match = /^REQ-(.+)-\d{2}$/.exec(requirementId);
  return match ? `AC26-${match[1]}` : undefined;
}

export function computePaper1PracticeDiagnostics(practice: Paper1ChapterPractice, states: Paper1PracticeDiagnosticState): Paper1PracticeDiagnostics {
  const ao = (["AO1", "AO2"] as const).map((id) => {
    const items = practice.items.filter((item) => item.ao === id);
    return {
      id,
      possible: items.reduce((total, item) => total + item.marks, 0),
      awarded: items.reduce((total, item) => {
        const awardedIds = new Set(states[item.id]?.awardedPointIds ?? []);
        return total + item.solution.markingPoints.reduce((marks, point) => marks + (awardedIds.has(point.id) ? point.marks : 0), 0);
      }, 0),
    };
  });

  const weakAreas = new Map<string, { lostMarks: number; requirementIds: Set<string>; objectiveIds: Set<string> }>();
  for (const item of practice.items) {
    const awardedIds = new Set(states[item.id]?.awardedPointIds ?? []);
    const missedPoints = item.solution.markingPoints.filter((point) => !awardedIds.has(point.id));
    if (!missedPoints.length) continue;
    const area = weakAreas.get(item.revisitLessonSlug) ?? { lostMarks: 0, requirementIds: new Set<string>(), objectiveIds: new Set<string>() };
    area.lostMarks += missedPoints.reduce((total, point) => total + point.marks, 0);
    missedPoints.forEach((point) => point.requirementIds.forEach((id) => {
      area.requirementIds.add(id);
      const objectiveId = objectiveIdForRequirement(id);
      if (objectiveId && item.objectiveIds.includes(objectiveId)) area.objectiveIds.add(objectiveId);
    }));
    weakAreas.set(item.revisitLessonSlug, area);
  }

  return {
    ao,
    weakAreas: [...weakAreas.entries()]
      .map(([revisitLessonSlug, area]) => ({
        revisitLessonSlug,
        lostMarks: area.lostMarks,
        requirementIds: [...area.requirementIds].sort(),
        objectiveIds: [...area.objectiveIds].sort(),
      }))
      .sort((left, right) => right.lostMarks - left.lostMarks || left.revisitLessonSlug.localeCompare(right.revisitLessonSlug)),
  };
}
