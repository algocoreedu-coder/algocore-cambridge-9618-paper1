export type Paper1Locale = "en" | "vi";
export type Localized = { readonly en: string; readonly vi: string };

export interface Paper1Section {
  readonly id: string;
  readonly title: Localized;
  readonly summary: Localized;
  readonly question: Localized;
  readonly status: "available" | "planned";
}

export interface Paper1Strand {
  readonly id: string;
  readonly sectionId: string;
  readonly title: Localized;
}

export interface Paper1Topic {
  readonly topicId: string;
  readonly lessonId: string;
  readonly slug: string;
  readonly sectionId: string;
  readonly strandId: string;
  readonly order: number;
  readonly title: Localized;
  readonly summary: Localized;
  readonly objectiveIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly prerequisiteLessonIds: readonly string[];
  readonly learningMode:
    | "concept"
    | "representation"
    | "calculation"
    | "comparison"
    | "scenario"
    | "diagram"
    | "state-sequence"
    | "logic"
    | "cpu-trace"
    | "assembly"
    | "validation"
    | "argument"
    | "database"
    | "sql";
  readonly searchTerms: readonly string[];
}

export interface Paper1Catalog {
  readonly schemaVersion: 1;
  readonly course: {
    readonly id: "CAIE-9618-P1-2026";
    readonly examYear: 2026;
    readonly syllabusVersion: 2;
    readonly durationMinutes: 90;
    readonly marks: 75;
  };
  readonly sections: readonly Paper1Section[];
  readonly strands: readonly Paper1Strand[];
  readonly topics: readonly Paper1Topic[];
}

export interface Paper1Source {
  readonly id: string;
  readonly title: Localized;
  readonly locator: string;
  readonly kind: "syllabus" | "coursebook" | "algocore";
}

export interface Paper1VisualDefinition {
  readonly visualId: string;
  readonly lessonId: string;
  readonly title: Localized;
  readonly learnerAction: Localized;
  readonly observableOutcome: Localized;
  readonly modelScope: Localized;
  readonly modelLimitations: Localized;
  readonly atlasIds: readonly string[];
  readonly sceneIds: readonly string[];
  readonly reviewStatus: "model-reviewed-with-scope-limits";
}

export type Paper1InstructionalVisualDisposition =
  | "INLINE_UNDERSTAND"
  | "INLINE_OBSERVE_SCENE"
  | "INLINE_WORKED_EXAMPLE"
  | "INLINE_RECOGNISE";

export type Paper1ReferenceVisualDisposition =
  | "LESSON_REFERENCE_DISCLOSURE"
  | "CHAPTER_ATLAS_ONLY"
  | "DUPLICATE_OR_REMOVE";

export type Paper1LessonStage = "understand" | "observe" | "worked-example" | "recognise";
export type Paper1VisualAnchorKind = "theory-block" | "visual-scene" | "worked-step" | "recognition-item";
export type Paper1VisualAnchorRelation = "before" | "after" | "within";
export type Paper1VisualDynamicRelation =
  | "prepares-dynamic-model"
  | "annotates-dynamic-scene"
  | "transfers-to-worked-example"
  | "contrasts-misconception"
  | "independent";

export interface Paper1VisualPlacementAnchor {
  readonly kind: Paper1VisualAnchorKind;
  readonly targetId: string;
  readonly relation: Paper1VisualAnchorRelation;
}

export interface Paper1InstructionalVisualPlacement {
  readonly atlasId: string;
  readonly disposition: Paper1InstructionalVisualDisposition;
  readonly stage: Paper1LessonStage;
  readonly anchor: Paper1VisualPlacementAnchor;
  readonly objectiveIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly teachingClaim: Localized;
  readonly learnerAction: Localized;
  readonly teacherPrompt: Localized;
  readonly expectedObservation: Localized;
  readonly misconceptionOrLimit: Localized;
  readonly instructionalCaption: Localized;
  readonly textEquivalent: Localized;
  readonly dynamicRelation: Paper1VisualDynamicRelation;
  readonly order: number;
  readonly coDisplayGroup?: string;
  readonly coDisplayRationale?: Localized;
}

export interface Paper1ReferenceVisualPlacement {
  readonly atlasId: string;
  readonly disposition: Paper1ReferenceVisualDisposition;
  readonly rationale: Localized;
  readonly order: number;
}

export interface Paper1LessonVisualPlacementContract {
  readonly lessonId: string;
  readonly visualId: string;
  readonly placementContractVersion: 1;
  readonly instructionalPlacements: readonly Paper1InstructionalVisualPlacement[];
  readonly referencePlacements: readonly Paper1ReferenceVisualPlacement[];
}

export interface Paper1VisualPlacementData {
  readonly schemaVersion: 1;
  readonly chapterId: string;
  readonly lessons: readonly Paper1LessonVisualPlacementContract[];
}

export type Paper1AtlasRole = "required" | "supporting" | "extension";

export interface Paper1AtlasItem {
  readonly id: string;
  readonly lessonId: string;
  readonly visualId: string;
  readonly role: Paper1AtlasRole;
  readonly title: Localized;
  readonly description: Localized;
  readonly source: {
    readonly printedPage: number;
    readonly label: string;
  };
  readonly preview: Localized;
}

export interface Paper1AtlasManifest {
  readonly schemaVersion: 1;
  readonly selection: "representative-final-frame";
  readonly itemCount: number;
  readonly items: readonly Paper1AtlasItem[];
}

export interface Paper1Assessment {
  readonly id: string;
  readonly requirementId: string;
  readonly origin: "official" | "adapted" | "original";
  readonly claim_kind: "official_marking_requirement" | "algocore_guidance";
  readonly semanticTags: readonly string[];
  readonly kind: "single-choice" | "numeric" | "short-text" | "explain" | "compare" | "justify";
  readonly level: "guided" | "faded" | "independent";
  readonly prompt: Localized;
  readonly choices?: readonly { readonly id: string; readonly label: Localized }[];
  readonly correctChoiceId?: string;
  readonly acceptedAnswers?: readonly string[];
  readonly hint: Localized;
  readonly solution: {
    readonly steps: readonly Localized[];
    readonly modelAnswer: Localized;
    readonly rubric?: readonly Localized[];
    readonly alternatives?: readonly Localized[];
  };
}

export interface Paper1Lesson {
  readonly schemaVersion: 1;
  readonly contentVersion: string;
  readonly assessmentVersion: string;
  readonly lessonId: string;
  readonly slug: string;
  readonly sectionId: string;
  readonly strandId: string;
  readonly title: Localized;
  readonly question: Localized;
  readonly opening: Localized;
  readonly objectives: readonly { readonly id: string; readonly text: Localized }[];
  readonly requirementIds: readonly string[];
  readonly prerequisiteLessonIds: readonly string[];
  readonly theory: readonly {
    readonly id: string;
    readonly title: Localized;
    readonly paragraphs: readonly Localized[];
    readonly bullets?: readonly Localized[];
    readonly sourceIds: readonly string[];
  }[];
  readonly workedExample: {
    readonly title: Localized;
    readonly prompt: Localized;
    readonly steps: readonly { readonly id: string; readonly action: Localized; readonly result: Localized }[];
    readonly result: Localized;
  };
  readonly recognition: {
    readonly cues: readonly Localized[];
    readonly method: readonly Localized[];
    readonly misconceptions: readonly { readonly mistake: Localized; readonly correction: Localized }[];
    readonly items: readonly {
      readonly id: string;
      readonly title: Localized;
      readonly setup: Localized;
      readonly prompt: Localized;
      readonly expectedEvidence: Localized;
    }[];
  };
  readonly assessments: readonly Paper1Assessment[];
  readonly recall: { readonly prompt: Localized; readonly answerPoints: readonly Localized[] };
  readonly glossary: readonly { readonly term: string; readonly meaning: Localized }[];
  readonly relatedSlugs: readonly string[];
  readonly sources: readonly Paper1Source[];
  readonly visualId: string;
  readonly contractCoverage: Readonly<Record<`B${"01"|"02"|"03"|"04"|"05"|"06"|"07"|"08"|"09"|"10"|"11"}`, readonly string[]>>;
}

export interface Paper1ReleaseManifest {
  readonly schemaVersion: 1;
  readonly courseId: "CAIE-9618-P1-2026";
  readonly releaseId: string;
  readonly lessons: readonly {
    readonly lessonId: string;
    readonly slug: string;
    readonly state: "draft" | "candidate" | "reviewed" | "available";
    readonly contentVersion: string;
    readonly assessmentVersion: string;
    readonly modelVersions: readonly string[];
  }[];
}

export interface ResolvedInstructionalVisualPlacement {
  readonly placement: Paper1InstructionalVisualPlacement;
  readonly item: Paper1AtlasItem;
}

export interface ResolvedReferenceVisualPlacement {
  readonly placement: Paper1ReferenceVisualPlacement;
  readonly item: Paper1AtlasItem;
}

export interface Paper1PracticeMarkingPoint {
  readonly id: string;
  readonly marks: number;
  readonly requirementIds: readonly string[];
  readonly point: Localized;
}

export interface Paper1PracticeItem {
  readonly id: string;
  readonly level: "guided" | "faded" | "independent";
  readonly requirementIds: readonly string[];
  readonly objectiveIds: readonly string[];
  readonly strandIds: readonly string[];
  readonly ao: "AO1" | "AO2";
  readonly commandWord: string;
  readonly responseProduct: string;
  readonly novelContext: boolean;
  readonly marks: number;
  readonly prompt: Localized;
  readonly hint: Localized;
  readonly solution: {
    readonly modelAnswer: Localized;
    readonly markingPoints: readonly Paper1PracticeMarkingPoint[];
    readonly rubric: readonly Localized[];
    readonly alternatives: readonly Localized[];
  };
  readonly revisitLessonSlug: string;
  readonly origin: "original";
  readonly claim_kind: "algocore_guidance";
}

export interface Paper1ChapterPractice {
  readonly schemaVersion: 1;
  readonly contentVersion: string;
  readonly practiceId: string;
  readonly courseId: "CAIE-9618-P1-2026";
  readonly chapterId: string;
  readonly title: Localized;
  readonly intro: Localized;
  readonly timing: { readonly timedMinutes: number; readonly untimedAvailable: boolean };
  readonly totalMarks: number;
  readonly aoBlueprint: { readonly AO1: number; readonly AO2: number; readonly note: Localized };
  readonly revealPolicy: string;
  readonly provenance: readonly { readonly id: string; readonly kind: "syllabus" | "coursebook" | "algocore"; readonly locator: string }[];
  readonly items: readonly Paper1PracticeItem[];
}

export type ResolvedLearnerAtlasItem =
  | ResolvedInstructionalVisualPlacement
  | ResolvedReferenceVisualPlacement;

export type Paper1ReleaseState = Paper1ReleaseManifest["lessons"][number]["state"];
