export type TransferMode = "read" | "write";

export type CpuValue = number | string;

export type CpuSnapshot = Readonly<{
  PC: CpuValue;
  MAR: CpuValue;
  MDR: CpuValue;
  CIR: CpuValue;
  ACC: CpuValue;
  IX: CpuValue;
  status: string;
  memoryControl: string;
  interruptRequest: string;
  cuState: string;
  addressBus: CpuValue;
  dataBus: CpuValue;
  memoryValue: CpuValue;
  savedContext?: Readonly<{ PC: number; ACC: number; status: string }>;
}>;

export type ModelFrame<T> = Readonly<{
  id: string;
  state: T;
  activeIds: readonly string[];
  payload?: CpuValue;
}>;

const EMPTY = "—";

export function normalizeBoundedInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function cpuTransferFrames(mode: TransferMode, address = 100, payload = 42): readonly ModelFrame<CpuSnapshot>[] {
  const write = mode === "write";
  const base: CpuSnapshot = {
    PC: 200,
    MAR: EMPTY,
    MDR: write ? payload : EMPTY,
    CIR: EMPTY,
    ACC: write ? payload : 0,
    IX: 0,
    status: "Z=1",
    memoryControl: EMPTY,
    interruptRequest: EMPTY,
    cuState: "IDLE",
    addressBus: EMPTY,
    dataBus: EMPTY,
    memoryValue: write ? 0 : payload,
  };
  const selected = { ...base, MAR: address, addressBus: address };
  const controlled = { ...selected, memoryControl: write ? "WRITE" : "READ", cuState: write ? "ISSUE WRITE" : "ISSUE READ" };
  const committed = write
    ? { ...controlled, dataBus: payload, memoryValue: payload }
    : { ...controlled, MDR: payload, dataBus: payload };
  return [
    { id: "inspect", state: base, activeIds: [write ? "MDR" : "memory"], payload },
    { id: "address", state: selected, activeIds: ["MAR", "addressBus"], payload: address },
    { id: "control", state: controlled, activeIds: ["CU", "controlBus"], payload: controlled.memoryControl },
    { id: "commit", state: committed, activeIds: [write ? "MDR" : "memory", "dataBus", write ? "memory" : "MDR"], payload },
  ];
}

export type PerformanceCase = "processor" | "clock" | "cores" | "cache" | "bus" | "usb" | "hdmi" | "vga";

export const PERFORMANCE_CASES: Readonly<Record<PerformanceCase, Readonly<{
  family: "performance" | "port";
  need: string;
  change: string;
  effect: string;
  limit: string;
}>>> = {
  processor: { family: "performance", need: "workload-instruction-profile", change: "different-processor-type", effect: "architecture-may-match-workload", limit: "software-system-and-task-still-matter" },
  clock: { family: "performance", need: "cpu-bound", change: "higher-clock", effect: "more-cycles-per-second", limit: "cpi-and-io-still-matter" },
  cores: { family: "performance", need: "parallelisable-work", change: "more-cores", effect: "parts-run-concurrently", limit: "serial-work-and-coordination" },
  cache: { family: "performance", need: "repeated-data-read", change: "nearer-copy", effect: "cache-hit-reduces-wait", limit: "cache-miss-needs-slower-memory" },
  bus: { family: "performance", need: "word-transfer", change: "wider-data-bus", effect: "more-bits-per-transfer", limit: "compatibility-and-workload" },
  usb: { family: "port", need: "peripheral-data", change: "usb", effect: "data-exchange", limit: "version-device-cable" },
  hdmi: { family: "port", need: "digital-display", change: "hdmi", effect: "digital-video-and-audio", limit: "matching-compatible-endpoints" },
  vga: { family: "port", need: "analogue-display", change: "vga", effect: "analogue-video", limit: "no-standard-audio" },
};

export function performanceFrames(selected: PerformanceCase) {
  const facts = PERFORMANCE_CASES[selected];
  return [
    { id: "need", state: { selected, phase: "need", fact: facts.need }, activeIds: ["need"] },
    { id: "change", state: { selected, phase: "change", fact: facts.change }, activeIds: ["need", "change"] },
    { id: "effect", state: { selected, phase: "effect", fact: facts.effect }, activeIds: ["change", "effect"] },
    { id: "limit", state: { selected, phase: "limit", fact: facts.limit }, activeIds: ["effect", "limit"] },
  ] as const;
}

export type CpuPacket = "fetch" | "execute" | "interrupt" | "return";

function baseCpu(operand: number): CpuSnapshot {
  return { PC: 200, MAR: EMPTY, MDR: EMPTY, CIR: EMPTY, ACC: 0, IX: 0, status: "Z=1", memoryControl: EMPTY, interruptRequest: EMPTY, cuState: "IDLE", addressBus: EMPTY, dataBus: EMPTY, memoryValue: operand };
}

export function cpuPacketFrames(packet: CpuPacket, operand = 42, interrupt = true): readonly ModelFrame<CpuSnapshot>[] {
  const initial = baseCpu(operand);
  if (packet === "fetch") {
    const instructionMemory = { ...initial, memoryValue: "LDD 100" };
    const mar = { ...instructionMemory, MAR: 200, addressBus: 200 };
    const increment = { ...mar, PC: 201 };
    const mdr = { ...increment, MDR: "LDD 100", memoryControl: "READ", cuState: "FETCH INSTRUCTION", dataBus: "LDD 100" };
    const cir = { ...mdr, CIR: "LDD 100", memoryControl: EMPTY, cuState: "LOAD CIR", dataBus: EMPTY };
    return [
      { id: "mar-from-pc", state: mar, activeIds: ["PC", "MAR"], payload: 200 },
      { id: "increment-pc", state: increment, activeIds: ["PC"], payload: 201 },
      { id: "instruction-to-mdr", state: mdr, activeIds: ["memory", "controlBus", "dataBus", "MDR", "CU"], payload: "LDD 100" },
      { id: "mdr-to-cir", state: cir, activeIds: ["MDR", "CIR", "CU"], payload: "LDD 100" },
    ];
  }
  const fetched: CpuSnapshot = { ...initial, PC: 201, MAR: 200, MDR: "LDD 100", CIR: "LDD 100" };
  if (packet === "execute") {
    const decode = { ...fetched, cuState: "DECODE LDD" };
    const address = { ...decode, MAR: 100, addressBus: 100, cuState: "SELECT OPERAND" };
    const read = { ...address, MDR: operand, memoryControl: "READ", cuState: "READ OPERAND", dataBus: operand };
    const execute = { ...read, ACC: operand, memoryControl: EMPTY, cuState: "EXECUTE LDD", dataBus: EMPTY };
    return [
      { id: "decode", state: decode, activeIds: ["CIR", "CU"] },
      { id: "operand-address", state: address, activeIds: ["MAR", "addressBus"], payload: 100 },
      { id: "operand-read", state: read, activeIds: ["memory", "controlBus", "dataBus", "MDR", "CU"], payload: operand },
      { id: "acc-from-mdr", state: execute, activeIds: ["MDR", "ACC", "CU"], payload: operand },
    ];
  }
  const executed: CpuSnapshot = { ...fetched, MAR: 100, MDR: operand, ACC: operand };
  if (packet === "interrupt") {
    const checked = { ...executed, interruptRequest: interrupt ? "PENDING" : "NONE", cuState: "CHECK INTERRUPT" };
    const savedContext = interrupt ? { PC: 201, ACC: operand, status: "Z=1" } : undefined;
    const saved = { ...checked, cuState: interrupt ? "SAVE PC/ACC/STATUS" : "NEXT CYCLE", savedContext };
    const dispatched = interrupt ? { ...saved, PC: 900, cuState: "DISPATCH ISR" } : { ...saved, cuState: "FETCH NEXT" };
    const serviced = interrupt ? { ...dispatched, PC: 901, ACC: 7, status: "Z=0", cuState: "SERVICE DEVICE" } : dispatched;
    return [
      { id: "interrupt-check", state: checked, activeIds: ["device", "interruptRequest", "CU"] },
      { id: "save-context", state: saved, activeIds: interrupt ? ["savedContext", "CU"] : ["CU"] },
      { id: "dispatch", state: dispatched, activeIds: interrupt ? ["PC", "CU"] : ["CU"] },
      { id: "service", state: serviced, activeIds: interrupt ? ["PC", "ACC", "status", "CU"] : ["CU"] },
    ];
  }
  const savedContext = { PC: 201, ACC: operand, status: "Z=1" } as const;
  const isr: CpuSnapshot = { ...executed, PC: 901, ACC: 7, status: "Z=0", cuState: "ISR COMPLETE", savedContext };
  const restoreStatus = { ...isr, status: savedContext.status, cuState: "RESTORE STATUS" };
  const restoreAcc = { ...restoreStatus, ACC: savedContext.ACC, cuState: "RESTORE ACC" };
  const restorePc = { ...restoreAcc, PC: savedContext.PC, cuState: "RESUME MAIN PROGRAM" };
  return [
    { id: "isr-complete", state: isr, activeIds: ["CU"] },
    { id: "restore-status", state: restoreStatus, activeIds: ["status", "CU"] },
    { id: "restore-acc", state: restoreAcc, activeIds: ["ACC", "CU"] },
    { id: "restore-pc", state: restorePc, activeIds: ["PC", "CU"] },
  ];
}

export type AssemblySourceRow = readonly [label: string, mnemonic: string, operand: string | number];

export function assembleFixture(start = 100) {
  const source: readonly AssemblySourceRow[] = [
    ["START", "LDM", "#5"],
    ["", "JMP", "DONE"],
    ["VALUE", "DAT", 7],
    ["DONE", "OUT", ""],
    ["", "END", ""],
  ];
  const symbols = Object.fromEntries(source.flatMap(([label], index) => label ? [[label, start + index]] : [])) as Readonly<Record<string, number>>;
  const opcodes: Readonly<Record<string, number>> = { LDM: 1, JMP: 2, DAT: 0, OUT: 3, END: 4 };
  const object = source.map(([, mnemonic, operand], index) => ({
    address: start + index,
    opcode: opcodes[mnemonic],
    operand: typeof operand === "string" && operand.startsWith("#")
      ? Number(operand.slice(1))
      : typeof operand === "string" && operand
        ? symbols[operand]
        : Number(operand) || 0,
  }));
  return { start, forwardReferenceAddress: start + 1, source, symbols, object } as const;
}

export function assemblerFrames(start = 100) {
  const fixture = assembleFixture(start);
  return [
    { id: "source", state: { pass: "source", forwardReferenceAddress: fixture.forwardReferenceAddress, symbols: {}, resolvedJmp: null, object: [] }, activeIds: ["source-1"] },
    { id: "pass-1", state: { pass: 1, symbols: fixture.symbols, resolvedJmp: null, object: [] }, activeIds: ["source", "symbols"] },
    { id: "pass-2", state: { pass: 2, symbols: fixture.symbols, resolvedJmp: start + 3, object: [] }, activeIds: ["source-1", "symbols"] },
    { id: "object", state: { pass: "complete", symbols: fixture.symbols, resolvedJmp: start + 3, object: fixture.object }, activeIds: ["source", "object"] },
  ] as const;
}

export type AddressingMode = "immediate" | "direct" | "indirect" | "indexed" | "relative";

export const ADDRESS_MEMORY: Readonly<Record<number, number>> = { 100: 120, 105: 42, 120: 77, 203: 88 };

export function addressModel(mode: AddressingMode, operand = mode === "relative" ? 2 : 100, ix = 5, pc = 201) {
  if (mode === "immediate") return { mode, operand, ix, pc, effectiveAddress: null, value: operand, readCount: 0, path: [operand] } as const;
  if (mode === "indirect") {
    const pointer = ADDRESS_MEMORY[operand];
    return { mode, operand, ix, pc, effectiveAddress: pointer, value: ADDRESS_MEMORY[pointer], readCount: 2, path: [operand, pointer, ADDRESS_MEMORY[pointer]] } as const;
  }
  if (mode === "relative") {
    const targetAddress = pc + operand;
    return { mode, operand, ix, pc, effectiveAddress: targetAddress, value: targetAddress, readCount: 0, path: [targetAddress], purpose: "control-flow-target" } as const;
  }
  const effectiveAddress = mode === "indexed" ? operand + ix : operand;
  return { mode, operand, ix, pc, effectiveAddress, value: ADDRESS_MEMORY[effectiveAddress], readCount: 1, path: [effectiveAddress, ADDRESS_MEMORY[effectiveAddress]] } as const;
}

export function addressingFrames(mode: AddressingMode) {
  const model = addressModel(mode);
  return [
    { id: "read", state: { ...model, phase: "read", visiblePath: [model.operand] }, activeIds: ["instruction"] },
    { id: "resolve", state: { ...model, phase: "resolve", visiblePath: model.path.slice(0, Math.min(2, model.path.length)) }, activeIds: mode === "immediate" ? ["literal"] : ["calculation", "effectiveAddress"] },
    { id: "dereference", state: { ...model, phase: "dereference", visiblePath: model.path }, activeIds: mode === "immediate" ? ["literal"] : mode === "relative" ? ["effectiveAddress", "value"] : mode === "indirect" ? ["pointer", "memory"] : ["effectiveAddress", "memory"] },
    { id: "verify", state: { ...model, phase: "verify", visiblePath: model.path }, activeIds: [mode === "immediate" ? "literal" : "effectiveAddress", "value"] },
  ] as const;
}

export type BranchPacket = "decision" | "completion";

export const BRANCH_PROGRAM = Object.freeze(["IN", "CMP #65", "JPE 5", "ADD #1", "JMP 5", "OUT", "END"] as const);

export type BranchState = Readonly<{ PC: number; ACC: number; equal: boolean | null; output: string; instruction: string; skipped?: readonly string[] }>;

export function branchPacketFrames(input: 65 | 66, packet: BranchPacket): readonly ModelFrame<BranchState>[] {
  const equal = input === 65;
  if (packet === "decision") {
    return [
      { id: "in", state: { PC: 1, ACC: input, equal: null, output: EMPTY, instruction: "IN" }, activeIds: ["IN", "ACC"] },
      { id: "cmp", state: { PC: 2, ACC: input, equal, output: EMPTY, instruction: "CMP #65" }, activeIds: ["CMP", "equal"] },
      { id: "jpe", state: { PC: equal ? 5 : 3, ACC: input, equal, output: EMPTY, instruction: "JPE 5" }, activeIds: ["JPE", "PC"] },
      { id: "route", state: { PC: equal ? 5 : 3, ACC: input, equal, output: EMPTY, instruction: equal ? "route → 5" : "route → 3" }, activeIds: ["PC"] },
    ];
  }
  if (equal) {
    return [
      { id: "skip", state: { PC: 5, ACC: input, equal, output: EMPTY, instruction: "skip 3–4", skipped: ["ADD #1", "JMP 5"] }, activeIds: ["JPE", "PC"] },
      { id: "out", state: { PC: 6, ACC: input, equal, output: "A", instruction: "OUT" }, activeIds: ["ACC", "OUT"] },
      { id: "end", state: { PC: 6, ACC: input, equal, output: "A", instruction: "END" }, activeIds: ["END"] },
      { id: "verify", state: { PC: 6, ACC: input, equal, output: "A", instruction: "trace verified", skipped: ["ADD #1", "JMP 5"] }, activeIds: ["OUT"] },
    ];
  }
  return [
    { id: "add", state: { PC: 4, ACC: 67, equal, output: EMPTY, instruction: "ADD #1" }, activeIds: ["ADD", "ACC"] },
    { id: "jmp", state: { PC: 5, ACC: 67, equal, output: EMPTY, instruction: "JMP 5" }, activeIds: ["JMP", "PC"] },
    { id: "out", state: { PC: 6, ACC: 67, equal, output: "C", instruction: "OUT" }, activeIds: ["ACC", "OUT"] },
    { id: "end", state: { PC: 6, ACC: 67, equal, output: "C", instruction: "END" }, activeIds: ["END"] },
  ];
}

export type LoadStorePacket = "load-store" | "add-finish";
export type LoadStoreState = Readonly<{
  PC: number;
  ACC: number;
  memory20: number;
  memory21: number;
  memory22: number;
  instruction: string;
  halted: boolean;
  returnedToOS: boolean;
  output: "";
}>;

const LOAD_STORE_STATES: readonly LoadStoreState[] = [
  { PC: 0, ACC: 0, memory20: 0, memory21: 8, memory22: 0, instruction: "initial", halted: false, returnedToOS: false, output: "" },
  { PC: 1, ACC: 12, memory20: 0, memory21: 8, memory22: 0, instruction: "LDM #12", halted: false, returnedToOS: false, output: "" },
  { PC: 2, ACC: 12, memory20: 12, memory21: 8, memory22: 0, instruction: "STO 20", halted: false, returnedToOS: false, output: "" },
  { PC: 3, ACC: 8, memory20: 12, memory21: 8, memory22: 0, instruction: "LDD 21", halted: false, returnedToOS: false, output: "" },
  { PC: 4, ACC: 20, memory20: 12, memory21: 8, memory22: 0, instruction: "ADD 20", halted: false, returnedToOS: false, output: "" },
  { PC: 5, ACC: 20, memory20: 12, memory21: 8, memory22: 20, instruction: "STO 22", halted: false, returnedToOS: false, output: "" },
  { PC: 5, ACC: 20, memory20: 12, memory21: 8, memory22: 20, instruction: "END", halted: true, returnedToOS: true, output: "" },
];

export const LOAD_STORE_PROGRAM = Object.freeze(["LDM #12", "STO 20", "LDD 21", "ADD 20", "STO 22", "END"] as const);

export function loadStorePacketFrames(packet: LoadStorePacket): readonly ModelFrame<LoadStoreState>[] {
  const stateIndexes = packet === "load-store" ? [0, 1, 2, 3] : [3, 4, 5, 6];
  return stateIndexes.map((stateIndex, packetIndex) => {
    const state = LOAD_STORE_STATES[stateIndex];
    const activeIds = packetIndex === 0
      ? ["PC"]
      : state.instruction.startsWith("STO")
        ? ["ACC", `memory${state.instruction.slice(4)}`]
        : state.instruction.startsWith("LDD") || state.instruction.startsWith("LDM") || state.instruction.startsWith("ADD")
          ? ["instruction", "ACC"]
          : ["END"];
    return { id: `${packet}-${packetIndex}`, state, activeIds };
  });
}

export type ShiftKind = "lsl" | "lsr" | "asl" | "asr" | "rol" | "ror";

function byte(value: number) { return value & 0xff; }
export function binary8(value: number) { return byte(value).toString(2).padStart(8, "0"); }

export function shift8(value: number, kind: ShiftKind) {
  const input = byte(value);
  const signedBefore = input >= 128 ? input - 256 : input;
  let result: number;
  if (kind === "lsl" || kind === "asl") result = byte(input << 1);
  else if (kind === "lsr") result = input >>> 1;
  else if (kind === "asr") result = (input >>> 1) | (input & 128);
  else if (kind === "rol") result = byte((input << 1) | (input >>> 7));
  else result = (input >>> 1) | ((input & 1) << 7);
  const left = kind.endsWith("l");
  const outgoingBit = Number(binary8(input)[left ? 0 : 7]);
  const insertedBit = kind === "asr" ? Number(binary8(input)[0]) : kind === "rol" || kind === "ror" ? outgoingBit : 0;
  return {
    kind,
    input,
    before: binary8(input),
    result,
    after: binary8(result),
    signedBefore,
    signedAfter: result >= 128 ? result - 256 : result,
    outgoingBit,
    insertedBit,
    overflow: kind === "asl" && (signedBefore * 2 < -128 || signedBefore * 2 > 127),
  } as const;
}

export function shiftFrames(value: number, kind: ShiftKind) {
  const model = shift8(value, kind);
  return [
    { id: "edge", state: { ...model, phase: "edge" }, activeIds: ["edge-bit"] },
    { id: "rule", state: { ...model, phase: "rule" }, activeIds: ["edge-bit", "insert-bit"] },
    { id: "move", state: { ...model, phase: "move" }, activeIds: ["bit-rail"] },
    { id: "result", state: { ...model, phase: "result" }, activeIds: ["result", "interpretation"] },
  ] as const;
}

export type MaskOperation = "AND" | "OR" | "XOR";
export type DeviceScenario = "greenhouse" | "alarm-panel";

export function mask8(value: number, targetBit: number, operation: MaskOperation, scenario: DeviceScenario = "greenhouse") {
  const input = byte(value);
  const bit = Math.max(0, Math.min(7, Math.trunc(targetBit)));
  const mask = 1 << bit;
  const result = operation === "AND" ? input & mask : operation === "OR" ? input | mask : input ^ mask;
  const targetBefore = (input >> bit) & 1;
  const accTargetAfter = (result >> bit) & 1;
  const monitoring = operation === "AND";
  const explicitWriteBack = !monitoring;
  const commitPerformed = explicitWriteBack;
  const deviceRegisterAfter = commitPerformed ? result : input;
  const targetAfter = (deviceRegisterAfter >> bit) & 1;
  const deviceRegisterChanged = deviceRegisterAfter !== input;
  const targetChanged = targetAfter !== targetBefore;
  const deviceName = scenario === "greenhouse" ? `greenhouse channel ${bit}` : `alarm zone ${bit}`;
  return {
    input,
    sourceRegister: input,
    inputBits: binary8(input),
    sourceBits: binary8(input),
    accBefore: input,
    targetBit: bit,
    targetBefore,
    mask,
    maskBits: binary8(mask),
    operation,
    result,
    resultBits: binary8(result),
    accAfter: result,
    accAfterBits: binary8(result),
    accTargetAfter,
    testResult: operation === "AND" ? (result === 0 ? "clear" : "set") : "not-a-test",
    sourceRegisterChanged: false,
    explicitWriteBack,
    commitPerformed,
    deviceRegisterAfter,
    deviceRegisterChanged,
    targetChanged,
    targetAfter,
    deviceState: {
      scenario,
      deviceName,
      mode: monitoring ? "monitoring" : "control",
      before: targetBefore === 1 ? "active" : "inactive",
      after: targetAfter === 1 ? "active" : "inactive",
      explicitWriteBack,
      commitPerformed,
      deviceRegisterChanged,
      targetChanged,
    },
  } as const;
}

export function maskFrames(value: number, targetBit: number, operation: MaskOperation, scenario: DeviceScenario = "greenhouse") {
  const model = mask8(value, targetBit, operation, scenario);
  const beforeCommit = {
    ...model,
    commitPerformed: false,
    deviceRegisterAfter: model.sourceRegister,
    deviceRegisterChanged: false,
    targetAfter: model.targetBefore,
    targetChanged: false,
    deviceState: {
      ...model.deviceState,
      after: model.deviceState.before,
      commitPerformed: false,
      deviceRegisterChanged: false,
      targetChanged: false,
    },
  } as const;
  return [
    { id: "locate", state: { ...beforeCommit, phase: "locate" }, activeIds: ["source-register", "target-bit"] },
    { id: "mask", state: { ...beforeCommit, phase: "mask" }, activeIds: ["target-bit", "mask-bit"] },
    { id: "apply", state: { ...beforeCommit, phase: "apply" }, activeIds: ["ALU", "ACC"] },
    { id: "interpret", state: { ...model, phase: "interpret" }, activeIds: operation === "AND" ? ["ACC", "monitoring"] : ["ACC", "explicit-write", "device-bit"] },
  ] as const;
}
