import placementData from "@/content/paper1/visual-placements.json";
import { getAllPaper1AtlasItems, getPaper1AtlasItem } from "./atlas-registry";
import type {
  Paper1InstructionalVisualPlacement,
  Paper1LessonStage,
  Paper1LessonVisualPlacementContract,
  Paper1ReferenceVisualPlacement,
  Paper1VisualPlacementData,
  ResolvedInstructionalVisualPlacement,
  ResolvedLearnerAtlasItem,
  ResolvedReferenceVisualPlacement,
} from "./types";

const contracts = placementData as Paper1VisualPlacementData;

function requireItem(lessonId: string, visualId: string, atlasId: string) {
  const item = getPaper1AtlasItem(atlasId);
  if (!item || item.lessonId !== lessonId || item.visualId !== visualId) {
    throw new Error(`Paper 1 visual placement mismatch: ${lessonId}/${visualId}/${atlasId}`);
  }
  return item;
}

function resolveInstructional(contract: Paper1LessonVisualPlacementContract, placement: Paper1InstructionalVisualPlacement): ResolvedInstructionalVisualPlacement {
  return { placement, item: requireItem(contract.lessonId, contract.visualId, placement.atlasId) };
}

function resolveReference(contract: Paper1LessonVisualPlacementContract, placement: Paper1ReferenceVisualPlacement): ResolvedReferenceVisualPlacement {
  return { placement, item: requireItem(contract.lessonId, contract.visualId, placement.atlasId) };
}

export function getPaper1LessonVisualPlacement(lessonId: string): Paper1LessonVisualPlacementContract | undefined {
  return contracts.lessons.find((entry) => entry.lessonId === lessonId);
}

export function resolvePaper1InstructionalPlacements(lessonId: string): readonly ResolvedInstructionalVisualPlacement[] {
  const contract = getPaper1LessonVisualPlacement(lessonId);
  if (!contract) return [];
  return contract.instructionalPlacements.map((placement) => resolveInstructional(contract, placement));
}

export function getPaper1InstructionalPlacementsForStage(lessonId: string, stage: Paper1LessonStage): readonly ResolvedInstructionalVisualPlacement[] {
  return resolvePaper1InstructionalPlacements(lessonId)
    .filter(({ placement }) => placement.stage === stage)
    .toSorted((left, right) => left.placement.order - right.placement.order);
}

export function resolvePaper1ReferencePlacements(lessonId: string): readonly ResolvedReferenceVisualPlacement[] {
  const contract = getPaper1LessonVisualPlacement(lessonId);
  if (!contract) return [];
  return contract.referencePlacements
    .map((placement) => resolveReference(contract, placement))
    .toSorted((left, right) => left.placement.order - right.placement.order);
}

export function getPaper1LearnerAtlasItems(): readonly ResolvedLearnerAtlasItem[] {
  const byId = new Map<string, ResolvedLearnerAtlasItem>();
  for (const contract of contracts.lessons) {
    for (const placement of contract.instructionalPlacements) {
      byId.set(placement.atlasId, resolveInstructional(contract, placement));
    }
    for (const placement of contract.referencePlacements) {
      byId.set(placement.atlasId, resolveReference(contract, placement));
    }
  }

  return getAllPaper1AtlasItems().flatMap((item) => {
    const resolved = byId.get(item.id);
    if (!resolved) throw new Error(`Paper 1 Atlas item has no placement: ${item.id}`);
    return resolved.placement.disposition === "DUPLICATE_OR_REMOVE" ? [] : [resolved];
  });
}

export function getPaper1LearnerAtlasItem(id: string): ResolvedLearnerAtlasItem | undefined {
  return getPaper1LearnerAtlasItems().find(({ item }) => item.id === id);
}
