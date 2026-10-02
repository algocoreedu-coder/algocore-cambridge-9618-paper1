import visualData from "@/content/paper1/visual-definitions.json";
import type { Paper1VisualDefinition } from "./types";

const definitions = visualData as readonly Paper1VisualDefinition[];

export function getPaper1VisualDefinition(visualId: string): Paper1VisualDefinition | undefined {
  return definitions.find((entry) => entry.visualId === visualId);
}

export function getPaper1VisualDefinitions(): readonly Paper1VisualDefinition[] {
  return definitions;
}
