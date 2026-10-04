export type ModelFrame<T> = Readonly<{
  id: string;
  state: T;
  activeIds: readonly string[];
  ticket?: string;
}>;

export type OsRequestCase = "memory" | "file" | "security" | "hardware" | "process";

export type OsCaseFacts = Readonly<{
  requester: string;
  request: string;
  resourceStateBefore: string;
  manager: string;
  managementAction: string;
  resourceOwner: string;
  resourceStateAfter: string;
  result: string;
  limitation: string;
}>;

export const OS_CASES: Readonly<Record<OsRequestCase, OsCaseFacts>> = {
  memory: {
    requester: "image-editor",
    request: "allocate-three-free-blocks",
    resourceStateBefore: "three-free-protected-blocks",
    manager: "memory-management",
    managementAction: "allocate-and-protect-blocks",
    resourceOwner: "image-editor",
    resourceStateAfter: "three-blocks-owned-no-overlap",
    result: "memory-allocated",
    limitation: "no-paging-or-replacement-algorithm-modelled",
  },
  file: {
    requester: "coursework-app",
    request: "save-report-in-coursework",
    resourceStateBefore: "valid-folder-no-report-entry",
    manager: "file-management",
    managementAction: "check-name-path-rights-and-update-directory",
    resourceOwner: "coursework-app",
    resourceStateAfter: "report-entry-and-storage-metadata-recorded",
    result: "file-saved",
    limitation: "save-is-not-a-backup",
  },
  security: {
    requester: "guest-user",
    request: "open-staff-file",
    resourceStateBefore: "staff-file-private-and-unchanged",
    manager: "security-management",
    managementAction: "check-identity-and-access-rights",
    resourceOwner: "staff-account",
    resourceStateAfter: "access-denied-file-unchanged",
    result: "confidentiality-preserved",
    limitation: "permission-check-does-not-prove-all-system-security",
  },
  hardware: {
    requester: "document-app",
    request: "print-report",
    resourceStateBefore: "printer-busy-job-not-printed",
    manager: "hardware-management",
    managementAction: "use-driver-then-queue-and-buffer-job",
    resourceOwner: "printer-queue",
    resourceStateAfter: "job-queued-not-physically-printed",
    result: "print-request-accepted",
    limitation: "the-model-does-not-operate-a-real-printer",
  },
  process: {
    requester: "process-b",
    request: "request-shared-processor-resource",
    resourceStateBefore: "resource-owned-by-process-a",
    manager: "process-management",
    managementAction: "record-wait-and-keep-process-states-coherent",
    resourceOwner: "process-a-until-release",
    resourceStateAfter: "process-b-waiting-request-recorded",
    result: "resource-conflict-managed",
    limitation: "no-specific-scheduling-algorithm-modelled",
  },
};

export type OsRequestState = OsCaseFacts & Readonly<{
  caseId: OsRequestCase;
  phase: "request" | "classify" | "handle" | "receipt";
}>;

export function osRequestFrames(caseId: OsRequestCase): readonly ModelFrame<OsRequestState>[] {
  const facts = OS_CASES[caseId];
  const state = (phase: OsRequestState["phase"]): OsRequestState => ({ caseId, phase, ...facts });
  return [
    { id: "request", state: state("request"), activeIds: ["request"], ticket: "01" },
    { id: "classify", state: state("classify"), activeIds: ["os", "manager"], ticket: "02" },
    { id: "handle", state: state("handle"), activeIds: ["manager", "action", "resource"], ticket: "03" },
    { id: "receipt", state: state("receipt"), activeIds: ["result", "limitation"], ticket: "04" },
  ];
}

export type UtilityCase = "format" | "virus" | "defragment" | "repair" | "compression" | "backup" | "library" | "dll";
export type UtilityScenario = "standard" | "blank-disk" | "used-disk" | "definitions-current" | "definitions-outdated" | "false-positive" | "compatible-trusted" | "missing" | "incompatible" | "corrupt";

export const UTILITY_SCENARIOS: Readonly<Record<UtilityCase, readonly UtilityScenario[]>> = {
  format: ["blank-disk", "used-disk"],
  virus: ["definitions-current", "definitions-outdated", "false-positive"],
  defragment: ["standard"],
  repair: ["standard"],
  compression: ["standard"],
  backup: ["standard"],
  library: ["standard"],
  dll: ["compatible-trusted", "missing", "incompatible", "corrupt"],
};

export function utilityScenarioDefault(caseId: UtilityCase): UtilityScenario {
  return UTILITY_SCENARIOS[caseId][0];
}

export const DEFRAG_BEFORE = Object.freeze(["A", "A", "·", "B", "B", "·", "A", "·", "C", "C", "A", "·"] as const);
export const DEFRAG_AFTER = Object.freeze(["A", "A", "A", "A", "B", "B", "C", "C", "·", "·", "·", "·"] as const);

export type UtilityCaseFacts = Readonly<{
  problem: string;
  selectedService: string;
  stateBefore: string;
  operation: string;
  artifact: string;
  stateAfter: string;
  invariant: string;
  limitation: string;
  beforeBlocks?: readonly string[];
  afterBlocks?: readonly string[];
}>;

export const UTILITY_CASES: Readonly<Record<UtilityCase, UtilityCaseFacts>> = {
  format: {
    problem: "blank-disk-needs-usable-structure",
    selectedService: "disk-formatter",
    stateBefore: "blank-twelve-block-fixture",
    operation: "create-partition-and-file-system-metadata",
    artifact: "partition-directory-and-toc-map",
    stateAfter: "fixture-recognised-for-file-storage",
    invariant: "model-only-no-disk-operation",
    limitation: "formatting-a-used-disk-may-destroy-data",
  },
  virus: {
    problem: "suspicious-file-behaviour",
    selectedService: "virus-checker",
    stateBefore: "file-not-yet-trusted",
    operation: "compare-signature-and-check-behaviour",
    artifact: "quarantine-record-for-review",
    stateAfter: "file-isolated-not-deleted-automatically",
    invariant: "updates-and-review-stay-visible",
    limitation: "false-positives-and-undetected-malware-remain-possible",
  },
  defragment: {
    problem: "hdd-file-blocks-are-scattered",
    selectedService: "defragmentation-software",
    stateBefore: "fragmented-hdd-block-map",
    operation: "rearrange-blocks-into-contiguous-runs",
    artifact: "contiguous-hdd-block-map",
    stateAfter: "same-files-fewer-head-movements",
    invariant: "file-counts-a4-b2-c2-free4-preserved",
    limitation: "ssd-has-no-mechanical-head-benefit",
    beforeBlocks: DEFRAG_BEFORE,
    afterBlocks: DEFRAG_AFTER,
  },
  repair: {
    problem: "disk-reports-bad-or-corrupt-sector",
    selectedService: "disk-analysis-and-repair",
    stateBefore: "one-sector-flagged-bad",
    operation: "analyse-usage-mark-bad-and-remap-spare",
    artifact: "usage-report-and-remap-record",
    stateAfter: "bad-sector-avoided-future-writes",
    invariant: "lost-content-is-never-invented",
    limitation: "repair-cannot-guarantee-corrupted-data-recovery",
  },
  compression: {
    problem: "fixture-needs-less-storage-or-transfer-space",
    selectedService: "file-compression",
    stateBefore: "twelve-block-original-fixture",
    operation: "encode-reviewed-repeating-pattern",
    artifact: "seven-block-compressed-fixture",
    stateAfter: "decompression-restores-original-fixture",
    invariant: "fixture-round-trip-equals-original",
    limitation: "displayed-ratio-is-not-universal",
  },
  backup: {
    problem: "file-needs-recoverable-earlier-version",
    selectedService: "backup-and-restore",
    stateBefore: "working-v3-plus-backups-v1-v2",
    operation: "select-copy-v2-and-restore-it",
    artifact: "restored-copy-of-v2",
    stateAfter: "selected-v2-content-is-current",
    invariant: "source-and-backup-identities-remain-distinct",
    limitation: "backup-supports-recovery-it-does-not-prevent-deletion",
  },
  library: {
    problem: "program-needs-a-sort-routine",
    selectedService: "program-library",
    stateBefore: "main-program-without-sort-implementation",
    operation: "call-reviewed-sort-records-routine",
    artifact: "linked-call-to-reusable-routine",
    stateAfter: "program-reuses-library-behaviour",
    invariant: "routine-remains-a-separate-reviewed-module",
    limitation: "tested-does-not-mean-error-free",
  },
  dll: {
    problem: "program-needs-printer-routine-at-runtime",
    selectedService: "dynamic-link-library",
    stateBefore: "main-program-holds-runtime-link",
    operation: "resolve-compatible-trusted-print-document-dll",
    artifact: "runtime-linked-shared-routine",
    stateAfter: "routine-available-without-embedding-its-code",
    invariant: "main-program-and-dll-remain-separate-files",
    limitation: "missing-incompatible-corrupt-or-malicious-dll-can-fail",
  },
};

export type UtilityState = UtilityCaseFacts & Readonly<{
  caseId: UtilityCase;
  phase: "inspect" | "select" | "apply" | "receipt";
  scenario: UtilityScenario;
  proposedService: string;
  choiceCorrect: boolean;
  operationExecuted: boolean;
  outcomeKind: "success" | "wrong-service" | "guarded" | "warning" | "failure";
  traceOperation: string;
  traceArtifact: string;
  traceStateAfter: string;
  warning: string;
}>;

export function utilityFrames(caseId: UtilityCase, proposedService = UTILITY_CASES[caseId].selectedService, scenario: UtilityScenario = utilityScenarioDefault(caseId)): readonly ModelFrame<UtilityState>[] {
  const facts = UTILITY_CASES[caseId];
  const safeScenario = UTILITY_SCENARIOS[caseId].includes(scenario) ? scenario : utilityScenarioDefault(caseId);
  const choiceCorrect = proposedService === facts.selectedService;
  let trace = {
    operationExecuted: true,
    outcomeKind: "success" as UtilityState["outcomeKind"],
    traceOperation: facts.operation,
    traceArtifact: facts.artifact,
    traceStateAfter: facts.stateAfter,
    warning: "none",
  };
  if (!choiceCorrect) {
    trace = { operationExecuted: false, outcomeKind: "wrong-service", traceOperation: "stop-before-operation-wrong-service", traceArtifact: "no-artifact", traceStateAfter: facts.stateBefore, warning: "proposed-service-does-not-address-stated-need" };
  } else if (caseId === "format" && safeScenario === "used-disk") {
    trace = { operationExecuted: false, outcomeKind: "guarded", traceOperation: "stop-before-format-and-request-confirmed-backup", traceArtifact: "destructive-format-warning", traceStateAfter: "used-disk-unchanged", warning: "formatting-used-disk-may-destroy-existing-data" };
  } else if (caseId === "virus" && safeScenario === "definitions-outdated") {
    trace = { operationExecuted: false, outcomeKind: "warning", traceOperation: "require-definition-update-before-reviewed-scan", traceArtifact: "definition-update-required", traceStateAfter: "file-not-yet-classified", warning: "outdated-definitions-can-miss-new-malware" };
  } else if (caseId === "virus" && safeScenario === "false-positive") {
    trace = { operationExecuted: true, outcomeKind: "warning", traceOperation: "scan-then-quarantine-for-human-review", traceArtifact: "possible-false-positive-quarantine-record", traceStateAfter: "file-isolated-pending-review", warning: "signature-match-does-not-prove-malware" };
  } else if (caseId === "dll" && safeScenario !== "compatible-trusted") {
    trace = { operationExecuted: false, outcomeKind: "failure", traceOperation: "attempt-runtime-link", traceArtifact: `${safeScenario}-dll-link-failure`, traceStateAfter: "shared-routine-unavailable-program-cannot-continue", warning: `${safeScenario}-dll-must-not-be-loaded` };
  }
  const state = (phase: UtilityState["phase"]): UtilityState => ({ caseId, phase, scenario: safeScenario, proposedService, choiceCorrect, ...trace, ...facts });
  return [
    { id: "inspect", state: state("inspect"), activeIds: ["problem"], ticket: "01" },
    { id: "select", state: state("select"), activeIds: ["problem", "service"], ticket: "02" },
    { id: "apply", state: state("apply"), activeIds: ["service", "operation", "artifact"], ticket: "03" },
    { id: "receipt", state: state("receipt"), activeIds: ["artifact", "result", "limitation"], ticket: "04" },
  ];
}

export function orderedPredictionChoices(correctId: string, distractors: readonly string[], correctPosition: number): readonly string[] {
  const choices = [correctId, ...distractors.filter((id) => id !== correctId)].slice(0, 3);
  const position = Math.max(0, Math.min(choices.length - 1, correctPosition));
  const [correct, ...others] = choices;
  return [...others.slice(0, position), correct, ...others.slice(position)];
}

export type TranslatorModel = "assembler" | "compiler" | "interpreter" | "java-hybrid";
export type TranslatorErrorScenario = "none" | "translation-diagnostic" | "runtime-failure" | "logic-error";

export type TranslatorFacts = Readonly<{
  sourceLanguage: string;
  sourceStage: string;
  translatorAction: string;
  artifactKind: string;
  artifactStored: boolean;
  runtimeComponent: string;
  executionStage: string;
  translatorRequiredAtRun: boolean;
  tradeoff: string;
}>;

export const TRANSLATOR_CASES: Readonly<Record<TranslatorModel, TranslatorFacts>> = {
  assembler: {
    sourceLanguage: "assembly-language",
    sourceStage: "target-specific-mnemonics",
    translatorAction: "assembler-translates-to-target-machine-object-code",
    artifactKind: "target-machine-object-program",
    artifactStored: true,
    runtimeComponent: "compatible-loader-and-processor",
    executionStage: "load-then-execute-translated-program",
    translatorRequiredAtRun: false,
    tradeoff: "machine-dependent-output-can-run-again-on-compatible-target",
  },
  compiler: {
    sourceLanguage: "high-level-language",
    sourceStage: "whole-source-program",
    translatorAction: "compiler-translates-before-separate-execution",
    artifactKind: "stored-object-or-executable-program",
    artifactStored: true,
    runtimeComponent: "compatible-loader-and-runtime",
    executionStage: "run-stored-artifact-recompile-after-source-change",
    translatorRequiredAtRun: false,
    tradeoff: "repeated-runs-avoid-retranslation-but-debug-cycle-is-separate",
  },
  interpreter: {
    sourceLanguage: "high-level-language",
    sourceStage: "next-source-statement",
    translatorAction: "translate-and-execute-one-statement-in-this-run",
    artifactKind: "no-standalone-object-program",
    artifactStored: false,
    runtimeComponent: "interpreter-with-source-program",
    executionStage: "repeat-translation-and-execution-each-run",
    translatorRequiredAtRun: true,
    tradeoff: "incremental-testing-is-convenient-but-runtime-translation-repeats",
  },
  "java-hybrid": {
    sourceLanguage: "java-high-level-source",
    sourceStage: "whole-java-source-program",
    translatorAction: "compiler-produces-machine-independent-bytecode",
    artifactKind: "stored-bytecode-intermediate-code",
    artifactStored: true,
    runtimeComponent: "virtual-machine-interpreter",
    executionStage: "virtual-machine-interprets-bytecode-for-execution",
    translatorRequiredAtRun: true,
    tradeoff: "bytecode-needs-the-required-runtime-and-is-not-native-machine-code",
  },
};

export type TranslatorState = TranslatorFacts & Readonly<{
  model: TranslatorModel;
  errorScenario: TranslatorErrorScenario;
  phase: "source" | "translate" | "artifact" | "execute";
  errorLocation: string;
  diagnostic: string;
}>;

export function translatorFrames(model: TranslatorModel, errorScenario: TranslatorErrorScenario = "none"): readonly ModelFrame<TranslatorState>[] {
  const facts = TRANSLATOR_CASES[model];
  const diagnostic = errorScenario === "translation-diagnostic"
    ? "translation-diagnostic-reported"
    : errorScenario === "runtime-failure"
      ? "translation-succeeded-runtime-failure-declared"
    : errorScenario === "logic-error"
      ? "no-translation-diagnostic-logic-error-remains"
      : "no-declared-error";
  const errorLocation = errorScenario === "translation-diagnostic"
    ? (model === "interpreter" ? "current-statement" : "translation-stage")
    : errorScenario === "runtime-failure" ? "runtime-stage"
    : errorScenario === "logic-error" ? "program-behaviour" : "none";
  const successfulArtifact = errorScenario !== "translation-diagnostic";
  const adjusted: TranslatorFacts = {
    ...facts,
    artifactKind: successfulArtifact ? facts.artifactKind : "no-successful-artifact",
    artifactStored: successfulArtifact && facts.artifactStored,
    executionStage: successfulArtifact
      ? errorScenario === "runtime-failure" ? "runtime-failure-before-declared-completion" : facts.executionStage
      : "execution-blocked-or-paused-at-diagnostic",
  };
  const state = (phase: TranslatorState["phase"]): TranslatorState => ({ model, errorScenario, phase, errorLocation, diagnostic, ...adjusted });
  return [
    { id: "source", state: state("source"), activeIds: ["source"], ticket: "01" },
    { id: "translate", state: state("translate"), activeIds: ["source", "translator"], ticket: "02" },
    { id: "artifact", state: state("artifact"), activeIds: successfulArtifact ? ["translator", "artifact"] : ["translator", "diagnostic"], ticket: "03" },
    { id: "execute", state: state("execute"), activeIds: successfulArtifact ? ["artifact", "runtime", "execution"] : ["diagnostic", "execution"], ticket: "04" },
  ];
}

export type IdePacket = "authoring" | "debugging";
export type AuthoringPresentation = "prettyprint" | "collapsed";

export type IdeState = Readonly<{
  packet: IdePacket;
  phase: string;
  sourceLines: readonly string[];
  currentLine: number;
  breakpointLine: number | null;
  executionPaused: boolean;
  variables: Readonly<Record<string, number | string>>;
  watchExpression: string;
  watchValue: number | string;
  diagnostic: string;
  presentationState: string;
  toolFeedback: string;
  stepsCompleted: number;
  programOutput: string;
}>;

const AUTHORING_SOURCE = Object.freeze([
  "def show_area(length, width):",
  "result = length * width",
  "pri(result",
] as const);

const DEBUG_SOURCE = Object.freeze([
  "length = 4",
  "width = 3",
  "area = length + width",
  "print(area)",
] as const);

export function ideFrames(packet: IdePacket, presentation: AuthoringPresentation = "prettyprint"): readonly ModelFrame<IdeState>[] {
  if (packet === "authoring") {
    const base = {
      packet,
      sourceLines: AUTHORING_SOURCE,
      currentLine: 3,
      breakpointLine: null,
      executionPaused: false,
      variables: {},
      watchExpression: "",
      watchValue: "—",
      stepsCompleted: 0,
      programOutput: "not-run",
    } as const;
    return [
      { id: "cursor", state: { ...base, phase: "cursor", diagnostic: "not-checked", presentationState: "plain-expanded", toolFeedback: "cursor-after-incomplete-token-pri" }, activeIds: ["editor", "current-line"], ticket: "01" },
      { id: "prompt", state: { ...base, phase: "prompt", diagnostic: "not-checked", presentationState: "plain-expanded", toolFeedback: "context-prompt-offers-print" }, activeIds: ["current-line", "context-prompt"], ticket: "02" },
      { id: "diagnostic", state: { ...base, phase: "diagnostic", diagnostic: "missing-closing-parenthesis", presentationState: "plain-expanded", toolFeedback: "dynamic-syntax-check-before-execution" }, activeIds: ["current-line", "syntax-diagnostic"], ticket: "03" },
      { id: "presentation", state: { ...base, phase: "presentation", diagnostic: "missing-closing-parenthesis-remains", presentationState: presentation === "prettyprint" ? "prettyprinted-expanded" : "prettyprinted-collapsed", toolFeedback: presentation === "prettyprint" ? "indentation-and-spacing-presented" : "complete-block-collapsed-not-deleted" }, activeIds: ["editor", "presentation"], ticket: "04" },
    ];
  }

  const base = {
    packet,
    sourceLines: DEBUG_SOURCE,
    breakpointLine: 3,
    watchExpression: "length * width",
    diagnostic: "syntax-valid-deliberate-logic-error",
    presentationState: "prettyprinted-expanded",
  } as const;
  return [
    { id: "set-breakpoint", state: { ...base, phase: "set-breakpoint", currentLine: 1, executionPaused: false, variables: {}, watchValue: "not-evaluated", toolFeedback: "breakpoint-set-before-line-three", stepsCompleted: 0, programOutput: "not-run" }, activeIds: ["breakpoint", "line-3"], ticket: "01" },
    { id: "pause-before-line", state: { ...base, phase: "pause-before-line", currentLine: 3, executionPaused: true, variables: { length: 4, width: 3, area: "undefined" }, watchValue: "not-evaluated", toolFeedback: "line-three-has-not-executed", stepsCompleted: 0, programOutput: "not-run" }, activeIds: ["breakpoint", "current-line", "variables"], ticket: "02" },
    { id: "single-step-line-three", state: { ...base, phase: "single-step-line-three", currentLine: 4, executionPaused: true, variables: { length: 4, width: 3, area: 7 }, watchValue: "not-evaluated", toolFeedback: "exactly-line-three-executed", stepsCompleted: 1, programOutput: "not-run" }, activeIds: ["line-3", "area"], ticket: "03" },
    { id: "single-step-line-four", state: { ...base, phase: "single-step-line-four", currentLine: 5, executionPaused: true, variables: { length: 4, width: 3, area: 7 }, watchValue: "not-evaluated", toolFeedback: "line-four-executed-paused-before-report", stepsCompleted: 2, programOutput: "7" }, activeIds: ["current-line", "variables", "output"], ticket: "04" },
    { id: "report", state: { ...base, phase: "report", currentLine: 5, executionPaused: false, variables: { length: 4, width: 3, area: 7 }, watchValue: 12, toolFeedback: "watch-value-exposes-wrong-operator", stepsCompleted: 2, programOutput: "7" }, activeIds: ["report-window", "watch-expression", "logic-error"], ticket: "05" },
  ];
}
