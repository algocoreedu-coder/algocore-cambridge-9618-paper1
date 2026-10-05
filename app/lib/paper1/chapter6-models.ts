export type ModelFrame<T> = Readonly<{
  id: string;
  state: T;
  activeIds: readonly string[];
  ticket: string;
}>;

export type SecurityIncident = "stranger-read" | "purpose-overshare" | "mark-transposition";
export type SecurityProperty = "security" | "privacy" | "integrity";

export type SecurityIncidentFacts = Readonly<{
  incident: SecurityIncident;
  actor: string;
  actorRights: string;
  authorisedPurpose: string;
  action: string;
  access: "granted";
  dataAccess: "read" | "disclosed" | "none";
  dataChange: "none" | "80-to-08";
  affectedProperties: readonly SecurityProperty[];
  protectedTarget: string;
  evidenceStatement: string;
  limitation: string;
}>;

export const SECURITY_INCIDENTS: Readonly<Record<SecurityIncident, SecurityIncidentFacts>> = {
  "stranger-read": {
    incident: "stranger-read",
    actor: "unknown-visitor",
    actorRights: "no-record-access-right",
    authorisedPurpose: "none",
    action: "request-and-read-student-record",
    access: "granted",
    dataAccess: "read",
    dataChange: "none",
    affectedProperties: ["security", "privacy"],
    protectedTarget: "personal-data-and-system-access-path",
    evidenceStatement: "an-unauthorised-actor-read-personal-data",
    limitation: "one-login-screen-does-not-prove-total-security",
  },
  "purpose-overshare": {
    incident: "purpose-overshare",
    actor: "authorised-school-app",
    actorRights: "read-for-progress-reporting-only",
    authorisedPurpose: "prepare-student-progress-report",
    action: "share-record-beyond-stated-purpose",
    access: "granted",
    dataAccess: "disclosed",
    dataChange: "none",
    affectedProperties: ["privacy"],
    protectedTarget: "personal-data-use-and-disclosure",
    evidenceStatement: "valid-read-access-did-not-authorise-later-disclosure",
    limitation: "authentication-does-not-authorise-every-use-of-data",
  },
  "mark-transposition": {
    incident: "mark-transposition",
    actor: "authorised-teacher",
    actorRights: "write-mark-for-assigned-class",
    authorisedPurpose: "record-assessed-mark",
    action: "save-08-instead-of-source-80",
    access: "granted",
    dataAccess: "none",
    dataChange: "80-to-08",
    affectedProperties: ["integrity"],
    protectedTarget: "input-process-and-stored-mark",
    evidenceStatement: "stored-value-no-longer-matches-supplied-source",
    limitation: "this-fixture-does-not-show-unauthorised-access",
  },
};

export type SecurityIncidentState = SecurityIncidentFacts & Readonly<{
  phase: "record" | "boundary" | "observe" | "verdict";
  observedAccess: "not-observed" | "granted";
  observedDataAccess: "not-observed" | SecurityIncidentFacts["dataAccess"];
  observedDataChange: "not-observed" | SecurityIncidentFacts["dataChange"];
  revealedProperties: readonly SecurityProperty[];
  revealedTarget: string;
}>;

export function securityIncidentFrames(incident: SecurityIncident): readonly ModelFrame<SecurityIncidentState>[] {
  const facts = SECURITY_INCIDENTS[incident];
  const state = (
    phase: SecurityIncidentState["phase"],
    observed: boolean,
    reveal: boolean,
  ): SecurityIncidentState => ({
    ...facts,
    phase,
    observedAccess: observed ? facts.access : "not-observed",
    observedDataAccess: observed ? facts.dataAccess : "not-observed",
    observedDataChange: observed ? facts.dataChange : "not-observed",
    revealedProperties: reveal ? facts.affectedProperties : [],
    revealedTarget: reveal ? facts.protectedTarget : "not-revealed",
  });
  return [
    { id: "record", state: state("record", false, false), activeIds: ["record"], ticket: "01" },
    { id: "boundary", state: state("boundary", false, false), activeIds: ["actor", "boundary"], ticket: "02" },
    { id: "observe", state: state("observe", true, false), activeIds: ["boundary", "observed-state"], ticket: "03" },
    { id: "verdict", state: state("verdict", true, true), activeIds: ["observed-state", "verdict"], ticket: "04" },
  ];
}

export type ThreatPath = "phishing" | "pharming" | "virus" | "spyware" | "unauthorised-access" | "plaintext-interception" | "changed-signed-message" | "biometric-access";

export type ThreatFacts = Readonly<{
  path: ThreatPath;
  actor: string;
  attackStep: string;
  trustBoundary: string;
  control: string;
  protectionPoint: string;
  asset: string;
  unprotectedOutcome: string;
  protectedOutcome: string;
  unprotectedAssetState: string;
  protectedAssetState: string;
  unprotectedRisk: string;
  protectedRisk: string;
}>;

export const THREAT_PATHS: Readonly<Record<ThreatPath, ThreatFacts>> = {
  phishing: {
    path: "phishing", actor: "message-impersonating-school-support", attackStep: "deceptive-message-asks-user-to-follow-a-link", trustBoundary: "user-decision-and-account-authentication", control: "verify-origin-avoid-deceptive-link-and-use-mfa", protectionPoint: "before-credential-disclosure", asset: "student-account", unprotectedOutcome: "deceptive-route-reaches-credential-request", protectedOutcome: "deceptive-route-rejected", unprotectedAssetState: "credential-disclosed-in-fixture", protectedAssetState: "credential-not-disclosed-in-fixture", unprotectedRisk: "account-misuse-can-follow", protectedRisk: "user-judgement-and-authentication-configuration-still-matter",
  },
  pharming: {
    path: "pharming", actor: "fraudulent-site-route", attackStep: "name-resolution-route-leads-to-fraudulent-site", trustBoundary: "trusted-name-resolution-and-site-identity", control: "trusted-dns-router-configuration-and-certificate-check", protectionPoint: "before-sensitive-data-is-submitted", asset: "login-data", unprotectedOutcome: "fraudulent-destination-accepted", protectedOutcome: "site-identity-mismatch-exposed", unprotectedAssetState: "login-data-entered-at-fraudulent-site", protectedAssetState: "submission-stopped-in-fixture", unprotectedRisk: "data-disclosure-can-follow", protectedRisk: "a-familiar-looking-page-is-never-proof-by-itself",
  },
  virus: {
    path: "virus", actor: "virus-in-downloaded-file", attackStep: "host-file-attempts-malicious-execution-and-replication", trustBoundary: "endpoint-execution", control: "updated-antivirus-scan-quarantine-and-least-privilege", protectionPoint: "before-or-during-execution", asset: "files-and-system-operation", unprotectedOutcome: "malicious-file-executes", protectedOutcome: "suspicious-file-quarantined", unprotectedAssetState: "data-and-operation-exposed-to-change", protectedAssetState: "fixture-isolated-before-execution", unprotectedRisk: "damage-or-replication-can-follow", protectedRisk: "not-every-malware-sample-is-guaranteed-detected",
  },
  spyware: {
    path: "spyware", actor: "covert-monitoring-software", attackStep: "software-attempts-secret-collection-and-exfiltration", trustBoundary: "endpoint-permissions-and-outbound-monitoring", control: "antispyware-permission-review-and-least-privilege", protectionPoint: "at-installation-permission-and-monitoring-boundaries", asset: "private-activity-and-data", unprotectedOutcome: "covert-collection-continues", protectedOutcome: "covert-collector-detected-and-restricted", unprotectedAssetState: "private-data-collected-in-fixture", protectedAssetState: "collection-stopped-in-fixture", unprotectedRisk: "secret-disclosure-can-follow", protectedRisk: "endpoint-and-user-decisions-remain-relevant",
  },
  "unauthorised-access": {
    path: "unauthorised-access", actor: "unauthorised-account-request", attackStep: "request-attempts-to-reach-staff-records", trustBoundary: "network-identity-and-authorisation", control: "account-password-authentication-firewall-and-access-rights", protectionPoint: "network-entry-then-resource-operation", asset: "staff-records", unprotectedOutcome: "unauthorised-request-reaches-record", protectedOutcome: "request-blocked-or-denied-by-rights", unprotectedAssetState: "record-readable-or-changeable-in-fixture", protectedAssetState: "record-remains-restricted", unprotectedRisk: "view-copy-change-delete-or-disruption-can-follow", protectedRisk: "authenticated-identities-still-need-correct-authorisation",
  },
  "plaintext-interception": {
    path: "plaintext-interception", actor: "network-observer", attackStep: "observer-captures-transmitted-content", trustBoundary: "confidentiality-of-data-in-transit", control: "encryption-with-protected-key-and-endpoints", protectionPoint: "before-data-crosses-untrusted-network", asset: "message-content", unprotectedOutcome: "captured-plaintext-is-readable", protectedOutcome: "captured-ciphertext-is-unreadable-without-key", unprotectedAssetState: "content-understood-by-observer", protectedAssetState: "content-not-intelligible-to-observer-in-fixture", unprotectedRisk: "privacy-loss-can-follow", protectedRisk: "endpoint-or-key-compromise-remains-possible",
  },
  "changed-signed-message": {
    path: "changed-signed-message", actor: "message-alteration-in-transit", attackStep: "signed-message-content-is-changed", trustBoundary: "message-origin-and-integrity", control: "verify-digital-signature-with-trusted-public-key", protectionPoint: "before-message-is-trusted", asset: "message-integrity", unprotectedOutcome: "changed-message-is-treated-as-trusted", protectedOutcome: "signature-verification-is-invalid", unprotectedAssetState: "alteration-not-exposed-in-fixture", protectedAssetState: "change-or-untrusted-origin-is-flagged", unprotectedRisk: "changed-content-can-be-accepted", protectedRisk: "signing-does-not-encrypt-the-message-content",
  },
  "biometric-access": {
    path: "biometric-access", actor: "person-presenting-biometric-sample", attackStep: "captured-sample-is-compared-with-enrolled-template", trustBoundary: "identity-then-resource-authorisation", control: "biometric-template-match-then-access-rights", protectionPoint: "identity-check-followed-by-policy-check", asset: "medical-record", unprotectedOutcome: "identity-claim-is-not-checked", protectedOutcome: "identity-matched-then-record-access-denied-by-policy", unprotectedAssetState: "record-exposed-without-identity-evidence", protectedAssetState: "record-remains-restricted-by-rights", unprotectedRisk: "impersonation-and-overbroad-access-can-follow", protectedRisk: "false-accept-or-reject-and-policy-errors-remain-possible",
  },
};

export type ThreatProtectionState = ThreatFacts & Readonly<{
  phase: "source" | "approach" | "checkpoint" | "outcome";
  controlApplied: boolean;
  outcome: string;
  protectedAssetStateObserved: string;
  remainingRisk: string;
  evidenceStatement: string;
  contentEncrypted: boolean;
  authenticated: boolean;
  authorised: boolean;
}>;

export function threatProtectionFrames(path: ThreatPath, controlApplied: boolean): readonly ModelFrame<ThreatProtectionState>[] {
  const facts = THREAT_PATHS[path];
  const finalOutcome = controlApplied ? facts.protectedOutcome : facts.unprotectedOutcome;
  const finalAssetState = controlApplied ? facts.protectedAssetState : facts.unprotectedAssetState;
  const finalRisk = controlApplied ? facts.protectedRisk : facts.unprotectedRisk;
  const state = (phase: ThreatProtectionState["phase"]): ThreatProtectionState => {
    const checkpointReached = phase === "checkpoint" || phase === "outcome";
    const finished = phase === "outcome";
    return {
      ...facts,
      phase,
      controlApplied,
      outcome: checkpointReached ? finalOutcome : "not-observed",
      protectedAssetStateObserved: finished ? finalAssetState : "not-observed",
      remainingRisk: finished ? finalRisk : "not-revealed",
      evidenceStatement: finished ? `${controlApplied ? "applied" : "omitted"}-control-produced-declared-fixture-outcome` : "not-revealed",
      contentEncrypted: path === "plaintext-interception" && controlApplied,
      authenticated: path === "biometric-access" && controlApplied,
      authorised: false,
    };
  };
  return [
    { id: "source", state: state("source"), activeIds: ["source", "asset"], ticket: "01" },
    { id: "approach", state: state("approach"), activeIds: ["threat", "boundary"], ticket: "02" },
    { id: "checkpoint", state: state("checkpoint"), activeIds: ["boundary", "control"], ticket: "03" },
    { id: "outcome", state: state("outcome"), activeIds: ["control", "asset-state"], ticket: "04" },
  ];
}

export type ValidationRule = "range" | "format" | "length" | "presence" | "existence" | "limit" | "check-digit";
export type ValidationFixture = "passes" | "fails";

export type ValidationFacts = Readonly<{
  rule: ValidationRule;
  fixture: ValidationFixture;
  fieldPurpose: string;
  input: string;
  condition: string;
  lookupOrWeights: readonly string[];
  calculation: string;
  expected: string;
  pass: boolean;
  integrityBenefit: string;
  limitation: string;
  classification: "validation";
  factuallyCorrect: false;
}>;

export const VALIDATION_FIXTURES: Readonly<Record<ValidationRule, Readonly<Record<ValidationFixture, ValidationFacts>>>> = {
  range: {
    passes: { rule: "range", fixture: "passes", fieldPurpose: "student-age", input: "18", condition: "18-less-than-or-equal-to-age-less-than-or-equal-to-120", lookupOrWeights: ["lower=18", "upper=120"], calculation: "18-is-on-the-inclusive-lower-bound", expected: "18-to-120-inclusive", pass: true, integrityBenefit: "rejects-values-outside-both-declared-bounds", limitation: "rule-valid-does-not-mean-factually-correct", classification: "validation", factuallyCorrect: false },
    fails: { rule: "range", fixture: "fails", fieldPurpose: "student-age", input: "17", condition: "18-less-than-or-equal-to-age-less-than-or-equal-to-120", lookupOrWeights: ["lower=18", "upper=120"], calculation: "17-is-less-than-the-inclusive-lower-bound-18", expected: "18-to-120-inclusive", pass: false, integrityBenefit: "rejects-values-outside-both-declared-bounds", limitation: "rule-valid-does-not-mean-factually-correct", classification: "validation", factuallyCorrect: false },
  },
  format: {
    passes: { rule: "format", fixture: "passes", fieldPurpose: "exam-date", input: "04/10/2026", condition: "exact-pattern-DD-slash-MM-slash-YYYY", lookupOrWeights: ["DD", "/", "MM", "/", "YYYY"], calculation: "two-digits-slash-two-digits-slash-four-digits", expected: "DD/MM/YYYY", pass: true, integrityBenefit: "rejects-input-that-does-not-match-the-declared-character-pattern", limitation: "pattern-match-does-not-prove-the-date-is-the-intended-real-world-date", classification: "validation", factuallyCorrect: false },
    fails: { rule: "format", fixture: "fails", fieldPurpose: "exam-date", input: "2026-10-04", condition: "exact-pattern-DD-slash-MM-slash-YYYY", lookupOrWeights: ["DD", "/", "MM", "/", "YYYY"], calculation: "four-digits-hyphen-two-digits-hyphen-two-digits-does-not-match", expected: "DD/MM/YYYY", pass: false, integrityBenefit: "rejects-input-that-does-not-match-the-declared-character-pattern", limitation: "display-formatting-is-not-input-validation", classification: "validation", factuallyCorrect: false },
  },
  length: {
    passes: { rule: "length", fixture: "passes", fieldPurpose: "student-code", input: "AC260418", condition: "exactly-8-characters", lookupOrWeights: ["required-length=8"], calculation: "character-count=8", expected: "8-characters", pass: true, integrityBenefit: "rejects-values-with-the-wrong-character-count", limitation: "correct-length-does-not-prove-the-code-belongs-to-the-student", classification: "validation", factuallyCorrect: false },
    fails: { rule: "length", fixture: "fails", fieldPurpose: "student-code", input: "AC26041", condition: "exactly-8-characters", lookupOrWeights: ["required-length=8"], calculation: "character-count=7", expected: "8-characters", pass: false, integrityBenefit: "rejects-values-with-the-wrong-character-count", limitation: "correct-length-does-not-prove-the-code-belongs-to-the-student", classification: "validation", factuallyCorrect: false },
  },
  presence: {
    passes: { rule: "presence", fixture: "passes", fieldPurpose: "student-name", input: "Mina", condition: "trimmed-input-must-not-be-empty", lookupOrWeights: ["trim-whitespace", "length-greater-than-zero"], calculation: "trimmed-length=4", expected: "non-empty", pass: true, integrityBenefit: "rejects-a-required-field-that-is-empty", limitation: "present-content-can-still-be-wrong", classification: "validation", factuallyCorrect: false },
    fails: { rule: "presence", fixture: "fails", fieldPurpose: "student-name", input: "   ", condition: "trimmed-input-must-not-be-empty", lookupOrWeights: ["trim-whitespace", "length-greater-than-zero"], calculation: "trimmed-length=0", expected: "non-empty", pass: false, integrityBenefit: "rejects-a-required-field-that-is-empty", limitation: "presence-does-not-check-meaning-or-accuracy", classification: "validation", factuallyCorrect: false },
  },
  existence: {
    passes: { rule: "existence", fixture: "passes", fieldPurpose: "course-code", input: "CS02", condition: "value-must-exist-in-authorised-course-table", lookupOrWeights: ["CS01", "CS02", "CS03"], calculation: "CS02-is-a-member-of-the-fixed-table", expected: "member-of-CS01-CS02-CS03", pass: true, integrityBenefit: "rejects-a-value-absent-from-the-declared-data-store", limitation: "membership-does-not-prove-a-person-or-claim-is-genuine", classification: "validation", factuallyCorrect: false },
    fails: { rule: "existence", fixture: "fails", fieldPurpose: "course-code", input: "CS09", condition: "value-must-exist-in-authorised-course-table", lookupOrWeights: ["CS01", "CS02", "CS03"], calculation: "CS09-is-not-a-member-of-the-fixed-table", expected: "member-of-CS01-CS02-CS03", pass: false, integrityBenefit: "rejects-a-value-absent-from-the-declared-data-store", limitation: "membership-does-not-prove-a-person-or-claim-is-genuine", classification: "validation", factuallyCorrect: false },
  },
  limit: {
    passes: { rule: "limit", fixture: "passes", fieldPurpose: "upload-size-MiB", input: "5", condition: "size-less-than-or-equal-to-5-MiB", lookupOrWeights: ["upper-limit=5-MiB"], calculation: "5-equals-the-inclusive-upper-limit", expected: "at-most-5-MiB", pass: true, integrityBenefit: "rejects-values-beyond-one-declared-bound", limitation: "a-limit-check-has-one-bound-and-is-not-a-two-bound-range-check", classification: "validation", factuallyCorrect: false },
    fails: { rule: "limit", fixture: "fails", fieldPurpose: "upload-size-MiB", input: "5.1", condition: "size-less-than-or-equal-to-5-MiB", lookupOrWeights: ["upper-limit=5-MiB"], calculation: "5.1-is-greater-than-the-upper-limit-5", expected: "at-most-5-MiB", pass: false, integrityBenefit: "rejects-values-beyond-one-declared-bound", limitation: "a-limit-check-has-one-bound-and-is-not-a-two-bound-range-check", classification: "validation", factuallyCorrect: false },
  },
  "check-digit": {
    passes: { rule: "check-digit", fixture: "passes", fieldPurpose: "teaching-identifier", input: "3141594", condition: "weighted-modulo-11-complement-rule", lookupOrWeights: ["digits=3,1,4,1,5,9", "weights=7,6,5,4,3,2", "products=21,6,20,4,15,18"], calculation: "sum=84-remainder=7-check-digit=11-minus-7=4", expected: "final-digit=4", pass: true, integrityBenefit: "detects-many-likely-entry-errors-covered-by-this-declared-algorithm", limitation: "matching-check-digit-does-not-guarantee-the-complete-number-is-correct", classification: "validation", factuallyCorrect: false },
    fails: { rule: "check-digit", fixture: "fails", fieldPurpose: "teaching-identifier", input: "3141595", condition: "weighted-modulo-11-complement-rule", lookupOrWeights: ["digits=3,1,4,1,5,9", "weights=7,6,5,4,3,2", "products=21,6,20,4,15,18"], calculation: "sum=84-remainder=7-expected-check-digit=4-but-received=5", expected: "final-digit=4", pass: false, integrityBenefit: "detects-many-likely-entry-errors-covered-by-this-declared-algorithm", limitation: "this-is-one-published-classroom-rule-not-a-universal-barcode-algorithm", classification: "validation", factuallyCorrect: false },
  },
};

export type ValidationState = Omit<ValidationFacts, "pass"> & Readonly<{
  phase: "input" | "rule" | "apply" | "verdict";
  pass: boolean | null;
  revealedCalculation: string;
  revealedVerdict: string;
}>;

export function validationFrames(rule: ValidationRule, fixture: ValidationFixture): readonly ModelFrame<ValidationState>[] {
  const facts = VALIDATION_FIXTURES[rule][fixture];
  const state = (phase: ValidationState["phase"]): ValidationState => ({
    ...facts,
    phase,
    pass: phase === "verdict" ? facts.pass : null,
    revealedCalculation: phase === "apply" || phase === "verdict" ? facts.calculation : "not-revealed",
    revealedVerdict: phase === "verdict" ? (facts.pass ? "pass" : "fail") : "not-revealed",
  });
  return [
    { id: "input", state: state("input"), activeIds: ["input"], ticket: "01" },
    { id: "rule", state: state("rule"), activeIds: ["input", "rule"], ticket: "02" },
    { id: "apply", state: state("apply"), activeIds: ["rule", "calculation"], ticket: "03" },
    { id: "verdict", state: state("verdict"), activeIds: ["calculation", "verdict"], ticket: "04" },
  ];
}

export type VerificationMethod = "visual" | "double-entry" | "byte-parity" | "block-parity" | "checksum";
export type VerificationFixture = "match" | "difference" | "same-wrong-twice" | "no-change" | "one-flip" | "two-flips" | "rectangle" | "one-changed-byte" | "compensating";
export type CheckValue = string | number | readonly string[] | readonly number[];

export type VerificationFacts = Readonly<{
  method: VerificationMethod;
  errorFixture: VerificationFixture;
  source: readonly string[];
  enteredOrReceived: readonly string[];
  checkConvention: string;
  checkDataSent: CheckValue;
  changedPositions: readonly string[];
  recomputedCheck: CheckValue;
  failedRows: readonly number[];
  failedColumns: readonly number[];
  detected: boolean;
  correctableUnderFixture: boolean;
  limitation: string;
}>;

const visual = (fixture: "match" | "difference"): VerificationFacts => ({
  method: "visual",
  errorFixture: fixture,
  source: ["STU-2048"],
  enteredOrReceived: [fixture === "match" ? "STU-2048" : "STU-2408"],
  checkConvention: "human-compares-entered-value-with-visible-source",
  checkDataSent: "source-document-remains-available",
  changedPositions: fixture === "match" ? [] : ["character-5", "character-6"],
  recomputedCheck: fixture === "match" ? "human-comparison-match" : "human-comparison-difference",
  failedRows: [], failedColumns: [], detected: fixture === "difference", correctableUnderFixture: false,
  limitation: "visual-comparison-depends-on-the-source-and-human-observation",
});

const doubleEntry = (fixture: "match" | "difference" | "same-wrong-twice"): VerificationFacts => {
  const entries = fixture === "match" ? ["Mina Nguyen", "Mina Nguyen"] : fixture === "difference" ? ["Mina Nguyen", "Mnia Nguyen"] : ["Mnia Nguyen", "Mnia Nguyen"];
  return { method: "double-entry", errorFixture: fixture, source: ["Mina Nguyen"], enteredOrReceived: entries, checkConvention: "two-independent-entries-are-compared", checkDataSent: "no-separate-check-data", changedPositions: fixture === "match" ? [] : fixture === "difference" ? ["entry-2-characters-3-and-4"] : ["entry-1-characters-3-and-4", "entry-2-characters-3-and-4"], recomputedCheck: entries[0] === entries[1] ? "entries-match" : "entries-differ", failedRows: [], failedColumns: [], detected: entries[0] !== entries[1], correctableUnderFixture: false, limitation: fixture === "same-wrong-twice" ? "the-same-wrong-value-entered-twice-can-match-and-remain-undetected" : "matching-entries-reduce-transcription-risk-but-do-not-prove-source-correctness" };
};

function flipBits(bits: string, positions: readonly number[]) {
  const changed = bits.split("");
  for (const position of positions) changed[position] = changed[position] === "1" ? "0" : "1";
  return changed.join("");
}

const byteParity = (fixture: "no-change" | "one-flip" | "two-flips"): VerificationFacts => {
  const source = "10110010";
  const positions = fixture === "no-change" ? [] : fixture === "one-flip" ? [2] : [1, 4];
  const received = flipBits(source, positions);
  const detected = received.split("").filter((bit) => bit === "1").length % 2 !== 0;
  return { method: "byte-parity", errorFixture: fixture, source: [source], enteredOrReceived: [received], checkConvention: "even-parity-seven-data-bits-plus-rightmost-parity-bit-at-index-7", checkDataSent: "parity-bit=0", changedPositions: positions.map((position) => `bit-${position}`), recomputedCheck: `ones=${received.split("").filter((bit) => bit === "1").length};parity=${detected ? "odd" : "even"}`, failedRows: detected ? [0] : [], failedColumns: [], detected, correctableUnderFixture: false, limitation: fixture === "two-flips" ? "an-even-number-of-flips-can-preserve-byte-parity" : "byte-parity-detects-a-mismatch-but-does-not-locate-or-repair-the-bit" };
};

const BLOCK_SOURCE = Object.freeze(["1010", "1100", "0110", "0000"] as const);
const blockParity = (fixture: "no-change" | "one-flip" | "rectangle"): VerificationFacts => {
  const positions: readonly (readonly [number, number])[] = fixture === "no-change" ? [] : fixture === "one-flip" ? [[1, 1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
  const rows = BLOCK_SOURCE.map((row) => row.split(""));
  for (const [row, column] of positions) rows[row][column] = rows[row][column] === "1" ? "0" : "1";
  const received = rows.map((row) => row.join(""));
  const failedRows = received.flatMap((row, index) => row.split("").filter((bit) => bit === "1").length % 2 ? [index] : []);
  const failedColumns = [0, 1, 2, 3].flatMap((column) => received.reduce((sum, row) => sum + Number(row[column]), 0) % 2 ? [column] : []);
  const detected = failedRows.length > 0 || failedColumns.length > 0;
  return { method: "block-parity", errorFixture: fixture, source: BLOCK_SOURCE, enteredOrReceived: received, checkConvention: "even-row-and-column-parity-in-4-by-4-block-data-region-is-top-left-3-by-3", checkDataSent: ["rightmost-column=row-parity", "bottom-row=column-parity"], changedPositions: positions.map(([row, column]) => `row-${row}-column-${column}`), recomputedCheck: [`failed-rows=${failedRows.join(",") || "none"}`, `failed-columns=${failedColumns.join(",") || "none"}`], failedRows, failedColumns, detected, correctableUnderFixture: fixture === "one-flip" && failedRows.length === 1 && failedColumns.length === 1, limitation: fixture === "rectangle" ? "four-corner-changes-can-preserve-every-row-and-column-parity" : "a-single-bit-intersection-does-not-generalise-to-arbitrary-multiple-errors" };
};

const checksum = (fixture: "no-change" | "one-changed-byte" | "compensating"): VerificationFacts => {
  const source = [60, 80, 100];
  const received = fixture === "no-change" ? source : fixture === "one-changed-byte" ? [60, 81, 100] : [61, 79, 100];
  const sent = source.reduce((sum, value) => sum + value, 0) % 256;
  const recalculated = received.reduce((sum, value) => sum + value, 0) % 256;
  return { method: "checksum", errorFixture: fixture, source: source.map(String), enteredOrReceived: received.map(String), checkConvention: "direct-sum-of-bytes-modulo-256", checkDataSent: sent, changedPositions: received.flatMap((value, index) => value === source[index] ? [] : [`byte-${index}`]), recomputedCheck: recalculated, failedRows: [], failedColumns: [], detected: sent !== recalculated, correctableUnderFixture: false, limitation: fixture === "compensating" ? "plus-one-and-minus-one-changes-can-preserve-this-checksum" : "a-checksum-mismatch-does-not-locate-or-repair-the-error" };
};

export const VERIFICATION_FIXTURES: Readonly<Record<VerificationMethod, readonly VerificationFixture[]>> = {
  visual: ["match", "difference"],
  "double-entry": ["match", "difference", "same-wrong-twice"],
  "byte-parity": ["no-change", "one-flip", "two-flips"],
  "block-parity": ["no-change", "one-flip", "rectangle"],
  checksum: ["no-change", "one-changed-byte", "compensating"],
};

export function verificationFacts(method: VerificationMethod, fixture: VerificationFixture): VerificationFacts {
  if (!VERIFICATION_FIXTURES[method].includes(fixture)) throw new Error(`Fixture ${fixture} is not valid for ${method}`);
  if (method === "visual") return visual(fixture as "match" | "difference");
  if (method === "double-entry") return doubleEntry(fixture as "match" | "difference" | "same-wrong-twice");
  if (method === "byte-parity") return byteParity(fixture as "no-change" | "one-flip" | "two-flips");
  if (method === "block-parity") return blockParity(fixture as "no-change" | "one-flip" | "rectangle");
  return checksum(fixture as "no-change" | "one-changed-byte" | "compensating");
}

export type VerificationState = Omit<VerificationFacts, "detected" | "recomputedCheck" | "failedRows" | "failedColumns" | "correctableUnderFixture"> & Readonly<{
  phase: "source" | "transfer" | "recompute" | "verdict";
  detected: boolean | null;
  recomputedCheck: CheckValue | "not-revealed";
  failedRows: readonly number[];
  failedColumns: readonly number[];
  correctableUnderFixture: boolean | null;
}>;

export function verificationFrames(method: VerificationMethod, fixture: VerificationFixture): readonly ModelFrame<VerificationState>[] {
  const facts = verificationFacts(method, fixture);
  const state = (phase: VerificationState["phase"]): VerificationState => ({
    ...facts,
    phase,
    detected: phase === "verdict" ? facts.detected : null,
    recomputedCheck: phase === "recompute" || phase === "verdict" ? facts.recomputedCheck : "not-revealed",
    failedRows: phase === "recompute" || phase === "verdict" ? facts.failedRows : [],
    failedColumns: phase === "recompute" || phase === "verdict" ? facts.failedColumns : [],
    correctableUnderFixture: phase === "verdict" ? facts.correctableUnderFixture : null,
  });
  return [
    { id: "source", state: state("source"), activeIds: ["source", "check-data"], ticket: "01" },
    { id: "transfer", state: state("transfer"), activeIds: ["received", "changed-positions"], ticket: "02" },
    { id: "recompute", state: state("recompute"), activeIds: ["received", "recomputed-check"], ticket: "03" },
    { id: "verdict", state: state("verdict"), activeIds: ["recomputed-check", "verdict"], ticket: "04" },
  ];
}
