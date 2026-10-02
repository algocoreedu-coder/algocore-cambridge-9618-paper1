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
  readonly learningMode: "concept" | "representation" | "calculation" | "comparison";
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
  readonly reviewStatus: "model-reviewed-with-scope-limits";
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
  readonly itemCount: 56;
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
  readonly lessonId: string;
  readonly slug: string;
  readonly sectionId: "1";
  readonly strandId: "1.1" | "1.2" | "1.3";
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
    readonly modelVersions: readonly string[];
  }[];
}

export type Paper1ReleaseState = Paper1ReleaseManifest["lessons"][number]["state"];
