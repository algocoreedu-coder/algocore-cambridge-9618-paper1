import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { binaryPlaceValueFixture, bitmapRleFixture, bitmapStorage, characterEncoding, numberRepresentation, pcmStorage, rleComparison, rleDecode, sampleAndQuantiseFixture, signedArithmetic, unitConversion, vectorDrawing } from "../app/lib/paper1/models.ts";
import { bufferOccupancy, circuitRows, controlDecision, evaluateLogicCircuit, logicGateOutput, logicGateRows, memoryEventOutcome, memoryFacts } from "../app/lib/paper1/chapter3-models.ts";
import { BRANCH_PROGRAM, LOAD_STORE_PROGRAM, PERFORMANCE_CASES, addressModel, addressingFrames, assembleFixture, branchPacketFrames, cpuPacketFrames, cpuTransferFrames, loadStorePacketFrames, mask8, normalizeBoundedInteger, performanceFrames, shift8 } from "../app/lib/paper1/chapter4-models.ts";
import { DEFRAG_AFTER, DEFRAG_BEFORE, OS_CASES, TRANSLATOR_CASES, UTILITY_CASES, ideFrames, orderedPredictionChoices, osRequestFrames, translatorFrames, utilityFrames } from "../app/lib/paper1/chapter5-models.ts";

const checks = [];
const run = (name, test) => { test(); checks.push(name); };
run("2 KiB oracle", () => assert.deepEqual(unitConversion(2, 1, "binary"), { base: 1024, unit: "KiB", bytes: 2048, bits: 16384 }));
run("1 kB oracle", () => assert.equal(unitConversion(1, 1, "decimal").bytes, 1000));
run("59 binary", () => assert.equal(numberRepresentation(59, "unsigned").bits, "00111011"));
run("59 BCD", () => assert.equal(numberRepresentation(59, "bcd").bits, "01011001"));
run("238 place-value fixture", () => assert.deepEqual(binaryPlaceValueFixture(), { value: 238, weights: [128, 64, 32, 16, 8, 4, 2, 1], bits: [1, 1, 1, 0, 1, 1, 1, 0], sum: 238 }));
run("238 toggle 32", () => assert.equal(binaryPlaceValueFixture(238, 32).sum, 206));
run("fractional representation rejected", () => assert.deepEqual(numberRepresentation(59.5, "unsigned"), { valid: false, reason: "integer-required" }));
run("-5 ones", () => assert.equal(numberRepresentation(-5, "ones").bits, "11111010"));
run("-5 twos", () => assert.equal(numberRepresentation(-5, "twos").bits, "11111011"));
run("127 + 1 overflow", () => { const { bitsResult, signedResult, carryOut, overflow } = signedArithmetic(127, 1, "add"); assert.deepEqual({ bitsResult, signedResult, carryOut, overflow }, { bitsResult: "10000000", signedResult: -128, carryOut: 0, overflow: true }); });
run("-1 + 1 flags", () => { const value = signedArithmetic(-1, 1, "add"); assert.equal(value.signedResult, 0); assert.equal(value.carryOut, 1); assert.equal(value.overflow, false); });
run("fractional signed operand rejected", () => assert.throws(() => signedArithmetic(1.5, 1, "add"), /integers/));
run("UTF-8 é", () => assert.deepEqual(characterEncoding("é").utf8Bytes, [0xC3, 0xA9]));
run("bitmap fixture", () => assert.equal(bitmapStorage(32, 16, 4).bytes, 256));
run("bitmap final-byte padding", () => assert.deepEqual(bitmapStorage(1, 1, 1), { pixels: 1, colours: 2, bits: 1, bytes: 1, remainderBits: 1, paddingBits: 7 }));
run("fractional bitmap dimension rejected", () => assert.throws(() => bitmapStorage(32.5, 16, 4), /positive integers/));
run("vector scale", () => assert.equal(vectorDrawing("badge", 2).outputWidth, 200));
run("PCM fixture", () => assert.equal(pcmStorage(8000, 8, 2, 1).bytes, 16000));
run("sampling rate changes times only", () => {
  const baseline = sampleAndQuantiseFixture("baseline", 2);
  const higher = sampleAndQuantiseFixture("higher", 2);
  assert.equal(baseline.rows.length, 3);
  assert.equal(higher.rows.length, 5);
  for (const row of baseline.rows) assert.deepEqual(higher.rows.find((candidate) => candidate.time === row.time), row);
});
run("sampling resolution keeps measurements and can reduce error", () => {
  const lower = sampleAndQuantiseFixture("baseline", 2);
  const higher = sampleAndQuantiseFixture("baseline", 3);
  assert.deepEqual(higher.rows.map(({ time, measured }) => ({ time, measured })), lower.rows.map(({ time, measured }) => ({ time, measured })));
  assert.ok(higher.meanQuantisationError < lower.meanQuantisationError);
  assert.ok(higher.rows.every((row) => row.binary.length === 3));
});
run("RLE saving", () => { const value = rleComparison("AAABB"); assert.equal(value.encodedBytes, 4); assert.equal(rleDecode(value.runs), "AAABB"); });
run("RLE expansion", () => assert.equal(rleComparison("AB").encodedBytes, 4));
run("bitmap RLE canonical fixture", () => {
  const fixture = bitmapRleFixture();
  assert.equal(fixture.sequence.length, 64);
  assert.deepEqual(fixture.firstRun, { character: "W", count: 9 });
  assert.equal(fixture.runs.length, 15);
  assert.equal(fixture.rawBytes, 64);
  assert.equal(fixture.encodedBytes, 30);
  assert.deepEqual(fixture.decodedGrid, fixture.grid);
});
run("bitmap RLE alternate scan round trip", () => {
  const fixture = bitmapRleFixture("column-major");
  assert.deepEqual(fixture.decodedGrid, fixture.grid);
});
run("finite buffer full fixture", () => assert.deepEqual(bufferOccupancy(4, 8, 2), { waiting: 4, overflow: 2, full: true }));
run("finite buffer absorbs fixture", () => assert.deepEqual(bufferOccupancy(4, 5, 4), { waiting: 1, overflow: 0, full: false }));
run("control below-target fixture", () => assert.deepEqual(controlDecision("control", 21, 24), { comparison: "below", actuator: "on", nextReading: 22 }));
run("control equality boundary", () => assert.deepEqual(controlDecision("control", 24, 24), { comparison: "equal", actuator: "off", nextReading: 24 }));
run("monitoring has no actuator", () => assert.deepEqual(controlDecision("monitor", 21, 24), { comparison: "below", actuator: "none", nextReading: 21 }));
run("DRAM refresh fact", () => assert.equal(memoryFacts.DRAM.refresh, true));
run("SRAM remains volatile", () => assert.equal(memoryFacts.SRAM.volatile, true));
run("EPROM and EEPROM lifecycle", () => { assert.equal(memoryEventOutcome("EPROM", "write"), "uv-erase"); assert.equal(memoryEventOutcome("EEPROM", "write"), "electrical"); });
run("all six gate truth tables", () => {
  assert.deepEqual(logicGateRows("NOT").map((row) => row.output), [1, 0]);
  assert.deepEqual(logicGateRows("AND").map((row) => row.output), [0, 0, 0, 1]);
  assert.deepEqual(logicGateRows("OR").map((row) => row.output), [0, 1, 1, 1]);
  assert.deepEqual(logicGateRows("NAND").map((row) => row.output), [1, 1, 1, 0]);
  assert.deepEqual(logicGateRows("NOR").map((row) => row.output), [1, 0, 0, 0]);
  assert.deepEqual(logicGateRows("XOR").map((row) => row.output), [0, 1, 1, 0]);
});
run("NOT ignores B", () => assert.equal(logicGateOutput("NOT", 0, 1), logicGateOutput("NOT", 0, 0)));
run("alarm representative row", () => assert.deepEqual(evaluateLogicCircuit("alarm", 1, 0, 0), { p: 0, q: 1, output: 1, expression: "Y = (A AND B) OR (NOT C)" }));
run("permission representative row", () => assert.deepEqual(evaluateLogicCircuit("permission", 0, 1, 1), { p: 1, q: 1, output: 1, expression: "Y = (A OR B) AND C" }));
run("three-input circuits have eight rows", () => { assert.equal(circuitRows("alarm").length, 8); assert.equal(circuitRows("permission").length, 8); });
run("Chapter 4 CPU bus read/write fixtures", () => {
  const read = cpuTransferFrames("read", 100, 42);
  const write = cpuTransferFrames("write", 100, 42);
  assert.equal(read.length, 4); assert.equal(write.length, 4);
  assert.deepEqual({ MAR: read[1].state.MAR, addressBus: read[1].state.addressBus }, { MAR: 100, addressBus: 100 });
  assert.deepEqual({ memoryControl: read[2].state.memoryControl, MDR: read[3].state.MDR, dataBus: read[3].state.dataBus }, { memoryControl: "READ", MDR: 42, dataBus: 42 });
  assert.deepEqual({ memoryControl: write[2].state.memoryControl, memoryValue: write[3].state.memoryValue, dataBus: write[3].state.dataBus }, { memoryControl: "WRITE", memoryValue: 42, dataBus: 42 });
});
run("Chapter 4 conditional performance and port cases", () => {
  assert.deepEqual(Object.keys(PERFORMANCE_CASES), ["processor", "clock", "cores", "cache", "bus", "usb", "hdmi", "vga"]);
  for (const key of Object.keys(PERFORMANCE_CASES)) assert.deepEqual(performanceFrames(key).map((frame) => frame.id), ["need", "change", "effect", "limit"]);
  assert.equal(PERFORMANCE_CASES.hdmi.effect, "digital-video-and-audio");
  assert.equal(PERFORMANCE_CASES.vga.limit, "no-standard-audio");
});
run("Chapter 4 fetch and interrupt state packets", () => {
  const fetch = cpuPacketFrames("fetch", 42, true);
  assert.deepEqual({ PC0: fetch[0].state.PC, MAR: fetch[0].state.MAR, instructionMemory: fetch[0].state.memoryValue, PC1: fetch[1].state.PC, CIR: fetch[3].state.CIR }, { PC0: 200, MAR: 200, instructionMemory: "LDD 100", PC1: 201, CIR: "LDD 100" });
  const interrupt = cpuPacketFrames("interrupt", 42, true);
  assert.deepEqual({ PC: interrupt[1].state.PC, ACC: interrupt[1].state.ACC, status: interrupt[1].state.status, interruptRequest: interrupt[1].state.interruptRequest, cuState: interrupt[1].state.cuState, savedContext: interrupt[1].state.savedContext }, { PC: 201, ACC: 42, status: "Z=1", interruptRequest: "PENDING", cuState: "SAVE PC/ACC/STATUS", savedContext: { PC: 201, ACC: 42, status: "Z=1" } });
  assert.deepEqual({ PC: interrupt[3].state.PC, ACC: interrupt[3].state.ACC, status: interrupt[3].state.status }, { PC: 901, ACC: 7, status: "Z=0" });
  const restored = cpuPacketFrames("return", 42, true).at(-1).state;
  assert.deepEqual({ PC: restored.PC, ACC: restored.ACC, status: restored.status, cuState: restored.cuState }, { PC: 201, ACC: 42, status: "Z=1", cuState: "RESUME MAIN PROGRAM" });
  const noInterrupt = cpuPacketFrames("interrupt", 42, false);
  assert.deepEqual(noInterrupt.map((frame) => [frame.state.interruptRequest, frame.state.cuState]), [["NONE", "CHECK INTERRUPT"], ["NONE", "NEXT CYCLE"], ["NONE", "FETCH NEXT"], ["NONE", "FETCH NEXT"]]);
  assert.ok(noInterrupt.every((frame) => frame.state.PC === 201 && frame.state.ACC === 42 && frame.state.status === "Z=1" && frame.state.savedContext === undefined));
});
run("Chapter 4 two-pass assembler forward label", () => {
  const fixture = assembleFixture(100);
  assert.deepEqual(fixture.source[0], ["START", "LDM", "#5"]);
  assert.deepEqual(fixture.symbols, { START: 100, VALUE: 102, DONE: 103 });
  assert.deepEqual(fixture.object[0], { address: 100, opcode: 1, operand: 5 });
  assert.deepEqual(fixture.object[1], { address: 101, opcode: 2, operand: 103 });
  assert.deepEqual(assembleFixture(240).symbols, { START: 240, VALUE: 242, DONE: 243 });
});
run("Chapter 4 five addressing-mode fixtures", () => {
  assert.deepEqual(addressModel("immediate"), { mode: "immediate", operand: 100, ix: 5, pc: 201, effectiveAddress: null, value: 100, readCount: 0, path: [100] });
  assert.deepEqual({ ...addressModel("direct") }, { mode: "direct", operand: 100, ix: 5, pc: 201, effectiveAddress: 100, value: 120, readCount: 1, path: [100, 120] });
  assert.deepEqual({ ...addressModel("indirect") }, { mode: "indirect", operand: 100, ix: 5, pc: 201, effectiveAddress: 120, value: 77, readCount: 2, path: [100, 120, 77] });
  assert.equal(addressModel("indexed").effectiveAddress, 105);
  assert.deepEqual({ effectiveAddress: addressModel("relative").effectiveAddress, value: addressModel("relative").value, readCount: addressModel("relative").readCount, purpose: addressModel("relative").purpose }, { effectiveAddress: 203, value: 203, readCount: 0, purpose: "control-flow-target" });
  assert.deepEqual(addressingFrames("immediate").at(-1).activeIds, ["literal", "value"]);
});
run("Chapter 4 branch taken and not-taken traces", () => {
  const taken = branchPacketFrames(65, "decision");
  const notTaken = branchPacketFrames(66, "decision");
  assert.deepEqual({ ACC: taken[1].state.ACC, equal: taken[1].state.equal, PC: taken[2].state.PC }, { ACC: 65, equal: true, PC: 5 });
  assert.deepEqual({ ACC: notTaken[1].state.ACC, equal: notTaken[1].state.equal, PC: notTaken[2].state.PC }, { ACC: 66, equal: false, PC: 3 });
  assert.deepEqual({ instruction: branchPacketFrames(65, "completion").at(-2).state.instruction, output: branchPacketFrames(65, "completion").at(-2).state.output }, { instruction: "END", output: "A" });
  assert.deepEqual({ instruction: branchPacketFrames(66, "completion").at(-1).state.instruction, output: branchPacketFrames(66, "completion").at(-1).state.output }, { instruction: "END", output: "C" });
  const fullTaken = [...branchPacketFrames(65, "decision").slice(0, 3), ...branchPacketFrames(65, "completion")];
  const fullNotTaken = [...branchPacketFrames(66, "decision").slice(0, 3), ...branchPacketFrames(66, "completion")];
  assert.deepEqual(fullTaken.map((frame) => frame.state.instruction), ["IN", "CMP #65", "JPE 5", "skip 3–4", "OUT", "END", "trace verified"]);
  assert.deepEqual(fullNotTaken.map((frame) => frame.state.instruction), ["IN", "CMP #65", "JPE 5", "ADD #1", "JMP 5", "OUT", "END"]);
});
run("Chapter 4 load/store END boundary", () => {
  const first = loadStorePacketFrames("load-store");
  assert.deepEqual({ instruction: first[2].state.instruction, ACC: first[2].state.ACC, memory20: first[2].state.memory20 }, { instruction: "STO 20", ACC: 12, memory20: 12 });
  const end = loadStorePacketFrames("add-finish").at(-1).state;
  assert.deepEqual({ instruction: end.instruction, PC: end.PC, ACC: end.ACC, memory22: end.memory22, halted: end.halted, returnedToOS: end.returnedToOS, output: end.output }, { instruction: "END", PC: 5, ACC: 20, memory22: 20, halted: true, returnedToOS: true, output: "" });
  const fullTrace = [...loadStorePacketFrames("load-store"), ...loadStorePacketFrames("add-finish").slice(1)];
  assert.deepEqual(fullTrace.map((frame) => frame.state.instruction), ["initial", "LDM #12", "STO 20", "LDD 21", "ADD 20", "STO 22", "END"]);
});
run("Chapter 4 six shift rules and byte invariants", () => {
  assert.deepEqual({ after: shift8(150, "lsl").after, outgoing: shift8(150, "lsl").outgoingBit }, { after: "00101100", outgoing: 1 });
  assert.deepEqual({ after: shift8(150, "asr").after, inserted: shift8(150, "asr").insertedBit }, { after: "11001011", inserted: 1 });
  assert.equal(shift8(149, "lsr").after, "01001010");
  assert.equal(shift8(149, "ror").after, "11001010");
  assert.equal(shift8(149, "rol").after, "00101011");
  assert.equal(shift8(150, "asl").overflow, true);
  for (let value = 0; value < 256; value += 1) for (const kind of ["lsl", "lsr", "asl", "asr", "rol", "ror"]) {
    const result = shift8(value, kind); assert.equal(result.after.length, 8); assert.ok(result.result >= 0 && result.result <= 255);
  }
});
run("Chapter 4 bounded integer controls", () => {
  assert.equal(normalizeBoundedInteger(100.9, 0, 255), 100);
  assert.equal(normalizeBoundedInteger(-3, 0, 7), 0);
  assert.equal(normalizeBoundedInteger(999, 0, 240), 240);
  assert.equal(normalizeBoundedInteger(Number.NaN, 0, 255), 0);
});
run("Chapter 4 exhaustive one-hot mask invariants", () => {
  const monitored = mask8(150, 2, "AND", "greenhouse");
  assert.deepEqual({ accAfter: monitored.accAfter, test: monitored.testResult, explicitWriteBack: monitored.explicitWriteBack, sourceChanged: monitored.sourceRegisterChanged, deviceState: monitored.deviceState }, { accAfter: 4, test: "set", explicitWriteBack: false, sourceChanged: false, deviceState: { scenario: "greenhouse", deviceName: "greenhouse channel 2", mode: "monitoring", before: "active", after: "active", explicitWriteBack: false, commitPerformed: false, deviceRegisterChanged: false, targetChanged: false } });
  assert.equal(mask8(150, 2, "OR").result, 150);
  assert.deepEqual({ explicitWriteBack: mask8(150, 2, "OR").explicitWriteBack, commitPerformed: mask8(150, 2, "OR").commitPerformed, sourceRegisterChanged: mask8(150, 2, "OR").sourceRegisterChanged, deviceRegisterChanged: mask8(150, 2, "OR").deviceRegisterChanged, targetChanged: mask8(150, 2, "OR").targetChanged }, { explicitWriteBack: true, commitPerformed: true, sourceRegisterChanged: false, deviceRegisterChanged: false, targetChanged: false });
  assert.equal(mask8(150, 2, "XOR").result, 146);
  assert.deepEqual(mask8(128, 7, "XOR", "alarm-panel").deviceState, { scenario: "alarm-panel", deviceName: "alarm zone 7", mode: "control", before: "active", after: "inactive", explicitWriteBack: true, commitPerformed: true, deviceRegisterChanged: true, targetChanged: true });
  for (let value = 0; value < 256; value += 1) for (let bit = 0; bit < 8; bit += 1) {
    const mask = 1 << bit;
    for (const operation of ["AND", "OR", "XOR"]) {
      const fixture = mask8(value, bit, operation);
      const expected = operation === "AND" ? value & mask : operation === "OR" ? value | mask : value ^ mask;
      assert.equal(fixture.accAfter, expected);
      assert.equal(fixture.sourceRegister, value);
      assert.equal(fixture.sourceRegisterChanged, false);
      assert.equal(fixture.explicitWriteBack, operation !== "AND");
      assert.equal(fixture.commitPerformed, operation !== "AND");
      assert.equal(fixture.deviceRegisterAfter, operation === "AND" ? value : expected);
      assert.equal(fixture.deviceRegisterChanged, operation !== "AND" && expected !== value);
      assert.equal(fixture.inputBits.length, 8); assert.equal(fixture.maskBits.length, 8); assert.equal(fixture.resultBits.length, 8);
      for (let index = 0; index < 8; index += 1) {
        const inputBit = Number(fixture.inputBits[index]); const maskBit = Number(fixture.maskBits[index]);
        const resultBit = operation === "AND" ? inputBit & maskBit : operation === "OR" ? inputBit | maskBit : inputBit ^ maskBit;
        assert.equal(Number(fixture.resultBits[index]), resultBit);
      }
    }
  }
});

run("Chapter 5 OS request cases and bounded emphasis", () => {
  assert.deepEqual(Object.keys(OS_CASES), ["memory", "file", "security", "hardware", "process"]);
  for (const caseId of Object.keys(OS_CASES)) {
    const frames = osRequestFrames(caseId);
    assert.deepEqual(frames.map((frame) => frame.id), ["request", "classify", "handle", "receipt"]);
    assert.ok(frames.every((frame) => frame.activeIds.length <= 3));
    assert.deepEqual(osRequestFrames(caseId), frames, `${caseId} must be deterministic`);
  }
  assert.equal(OS_CASES.security.result, "confidentiality-preserved");
  assert.equal(OS_CASES.hardware.resourceStateAfter, "job-queued-not-physically-printed");
  assert.equal(OS_CASES.process.limitation, "no-specific-scheduling-algorithm-modelled");
});
run("Chapter 5 utility and reusable-code cases", () => {
  assert.deepEqual(Object.keys(UTILITY_CASES), ["format", "virus", "defragment", "repair", "compression", "backup", "library", "dll"]);
  for (const caseId of Object.keys(UTILITY_CASES)) {
    const frames = utilityFrames(caseId);
    assert.deepEqual(frames.map((frame) => frame.id), ["inspect", "select", "apply", "receipt"]);
    assert.ok(frames.every((frame) => frame.activeIds.length <= 3));
    assert.deepEqual(utilityFrames(caseId), frames, `${caseId} must be deterministic`);
  }
  assert.deepEqual([...DEFRAG_BEFORE].sort(), [...DEFRAG_AFTER].sort(), "defragmentation must preserve every fixture block");
  assert.match(UTILITY_CASES.format.invariant, /no-disk-operation/);
  assert.match(UTILITY_CASES.repair.invariant, /never-invented/);
  assert.match(UTILITY_CASES.dll.limitation, /missing-incompatible-corrupt-or-malicious/);
});
run("Chapter 5 utility choices alter guarded traces", () => {
  const wrong = utilityFrames("format", "virus-checker", "blank-disk").at(-1).state;
  assert.equal(wrong.proposedService, "virus-checker");
  assert.equal(wrong.choiceCorrect, false);
  assert.equal(wrong.operationExecuted, false);
  assert.equal(wrong.traceOperation, "stop-before-operation-wrong-service");
  const usedDisk = utilityFrames("format", "disk-formatter", "used-disk").at(-1).state;
  assert.equal(usedDisk.outcomeKind, "guarded");
  assert.equal(usedDisk.traceArtifact, "destructive-format-warning");
  const outdated = utilityFrames("virus", "virus-checker", "definitions-outdated").at(-1).state;
  assert.equal(outdated.traceArtifact, "definition-update-required");
  const falsePositive = utilityFrames("virus", "virus-checker", "false-positive").at(-1).state;
  assert.equal(falsePositive.traceArtifact, "possible-false-positive-quarantine-record");
  for (const scenario of ["missing", "incompatible", "corrupt"]) {
    const dll = utilityFrames("dll", "dynamic-link-library", scenario).at(-1).state;
    assert.equal(dll.outcomeKind, "failure");
    assert.equal(dll.operationExecuted, false);
    assert.match(dll.traceArtifact, new RegExp(`^${scenario}-dll-link-failure$`));
  }
});
run("Chapter 5 prediction order is deterministic and varied", () => {
  const first = orderedPredictionChoices("correct", ["wrong-a", "wrong-b"], 0);
  const middle = orderedPredictionChoices("correct", ["wrong-a", "wrong-b"], 1);
  const last = orderedPredictionChoices("correct", ["wrong-a", "wrong-b"], 2);
  assert.deepEqual(first, ["correct", "wrong-a", "wrong-b"]);
  assert.deepEqual(middle, ["wrong-a", "correct", "wrong-b"]);
  assert.deepEqual(last, ["wrong-a", "wrong-b", "correct"]);
  assert.deepEqual(orderedPredictionChoices("correct", ["wrong-a", "wrong-b"], 2), last);
});
run("Chapter 5 translator pipelines and diagnostic boundaries", () => {
  assert.deepEqual(Object.keys(TRANSLATOR_CASES), ["assembler", "compiler", "interpreter", "java-hybrid"]);
  for (const model of Object.keys(TRANSLATOR_CASES)) {
    const facts = TRANSLATOR_CASES[model];
    const frames = translatorFrames(model, "none");
    assert.deepEqual(frames.map((frame) => frame.id), ["source", "translate", "artifact", "execute"]);
    assert.ok(frames.every((frame) => frame.activeIds.length <= 3));
    assert.deepEqual(translatorFrames(model, "none"), frames, `${model} must be deterministic`);
    const diagnostic = translatorFrames(model, "translation-diagnostic");
    assert.equal(diagnostic[2].state.artifactKind, "no-successful-artifact");
    assert.equal(diagnostic[2].state.artifactStored, false);
    const runtimeFailure = translatorFrames(model, "runtime-failure");
    assert.equal(runtimeFailure[3].state.errorLocation, "runtime-stage");
    assert.equal(runtimeFailure[3].state.diagnostic, "translation-succeeded-runtime-failure-declared");
    assert.equal(runtimeFailure[3].state.artifactKind, facts.artifactKind);
    assert.equal(runtimeFailure[3].state.artifactStored, facts.artifactStored);
    assert.equal(runtimeFailure[3].state.executionStage, "runtime-failure-before-declared-completion");
    for (const scenario of ["none", "translation-diagnostic", "runtime-failure", "logic-error"]) {
      const scenarioFrames = translatorFrames(model, scenario);
      assert.ok(scenarioFrames.every((frame) => frame.activeIds.length <= 3));
      assert.deepEqual(translatorFrames(model, scenario), scenarioFrames, `${model}/${scenario} must be deterministic`);
    }
  }
  assert.equal(TRANSLATOR_CASES.interpreter.artifactStored, false);
  assert.equal(TRANSLATOR_CASES.interpreter.translatorRequiredAtRun, true);
  assert.equal(TRANSLATOR_CASES.compiler.translatorRequiredAtRun, false);
  assert.equal(TRANSLATOR_CASES["java-hybrid"].artifactKind, "stored-bytecode-intermediate-code");
  assert.equal(TRANSLATOR_CASES["java-hybrid"].runtimeComponent, "virtual-machine-interpreter");
});
run("Chapter 5 IDE authoring and breakpoint execution boundary", () => {
  const authoring = ideFrames("authoring", "collapsed");
  assert.deepEqual(authoring.map((frame) => frame.id), ["cursor", "prompt", "diagnostic", "presentation"]);
  assert.equal(authoring[2].state.diagnostic, "missing-closing-parenthesis");
  assert.equal(authoring[3].state.presentationState, "prettyprinted-collapsed");
  assert.deepEqual(authoring[3].state.sourceLines, authoring[0].state.sourceLines, "collapse must not delete source lines");
  const debugging = ideFrames("debugging");
  assert.deepEqual(debugging.map((frame) => frame.id), ["set-breakpoint", "pause-before-line", "single-step-line-three", "single-step-line-four", "report"]);
  assert.deepEqual(debugging[1].state.variables, { length: 4, width: 3, area: "undefined" });
  assert.equal(debugging[1].state.toolFeedback, "line-three-has-not-executed");
  assert.deepEqual(debugging[2].state.variables, { length: 4, width: 3, area: 7 });
  assert.equal(debugging[2].state.stepsCompleted, 1);
  assert.equal(debugging[3].state.stepsCompleted, 2);
  assert.equal(debugging[3].state.programOutput, "7");
  assert.equal(debugging[3].state.currentLine, 5);
  assert.equal(debugging[3].state.executionPaused, true);
  assert.equal(debugging[3].state.toolFeedback, "line-four-executed-paused-before-report");
  assert.equal(debugging[4].state.watchValue, 12);
  assert.equal(debugging[4].state.stepsCompleted, 2);
  assert.equal(debugging[4].state.currentLine, 5);
  assert.equal(debugging[4].state.executionPaused, false);
  assert.ok([...authoring, ...debugging].every((frame) => frame.activeIds.length <= 3));
});

const chapter4Oracles = JSON.parse(readFileSync(new URL("../content/paper1/chapter4-visual-oracles.json", import.meta.url), "utf8"));
const chapter5Oracles = JSON.parse(readFileSync(new URL("../content/paper1/chapter5-visual-oracles.json", import.meta.url), "utf8"));
const projectDeclared = (actual, declared, path = "fixture") => {
  if (Array.isArray(declared)) {
    assert.ok(Array.isArray(actual), `${path} must be an array`);
    assert.equal(actual.length, declared.length, `${path} length`);
    return declared.map((value, index) => projectDeclared(actual[index], value, `${path}[${index}]`));
  }
  if (declared !== null && typeof declared === "object") {
    assert.ok(actual !== null && typeof actual === "object", `${path} must be an object`);
    return Object.fromEntries(Object.entries(declared).map(([key, value]) => {
      assert.ok(Object.hasOwn(actual, key), `${path}.${key} is missing from model output`);
      return [key, projectDeclared(actual[key], value, `${path}.${key}`)];
    }));
  }
  return actual;
};
const assertDeclared = (actual, declared, path) => assert.deepEqual(projectDeclared(actual, declared, path), declared, path);

run("Chapter 4 declared visual-oracle parity", () => {
  assert.deepEqual(chapter4Oracles.map((entry) => entry.lessonId), ["P1-L25", "P1-L26", "P1-L27", "P1-L28", "P1-L29", "P1-L30", "P1-L31", "P1-L32"]);
  const oracle = Object.fromEntries(chapter4Oracles.map((entry) => [entry.lessonId, entry]));

  for (const fixture of oracle["P1-L25"].fixtures) {
    const actual = cpuTransferFrames(fixture.mode, fixture.address, fixture.payload).map((frame) => ({ id: frame.id, ...frame.state }));
    assertDeclared(actual, fixture.frames, `P1-L25.${fixture.mode}`);
  }
  for (const [name, expectedFacts] of Object.entries(oracle["P1-L26"].cases)) {
    assert.deepEqual(performanceFrames(name).map((frame) => frame.state.fact), expectedFacts, `P1-L26.${name}`);
  }
  for (const [name, expectedFrames] of Object.entries(oracle["P1-L27"].packets)) {
    const packet = name === "interruptNone" ? "interrupt" : name;
    const actual = cpuPacketFrames(packet, oracle["P1-L27"].operand, name !== "interruptNone").map((frame) => ({ id: frame.id, ...frame.state }));
    assertDeclared(actual, expectedFrames, `P1-L27.${name}`);
  }

  assertDeclared(assembleFixture(oracle["P1-L28"].fixture.start), oracle["P1-L28"].fixture, "P1-L28.fixture");
  for (const fixture of oracle["P1-L29"].fixtures) assertDeclared(addressModel(fixture.mode), fixture, `P1-L29.${fixture.mode}`);

  const branchOracle = oracle["P1-L30"].branchFixture;
  assert.deepEqual(BRANCH_PROGRAM, branchOracle.program, "P1-L30.branch.program");
  const takenStates = [...branchPacketFrames(65, "decision").slice(0, 3), ...branchPacketFrames(65, "completion").filter((frame) => frame.id === "out" || frame.id === "end")].map((frame) => frame.state);
  const notTakenStates = [...branchPacketFrames(66, "decision").slice(0, 3), ...branchPacketFrames(66, "completion")].map((frame) => frame.state);
  assertDeclared(takenStates, branchOracle.input65, "P1-L30.branch.input65");
  assertDeclared(notTakenStates, branchOracle.input66, "P1-L30.branch.input66");
  const loadOracle = oracle["P1-L30"].loadStoreFixture;
  assert.deepEqual(LOAD_STORE_PROGRAM, loadOracle.program, "P1-L30.loadStore.program");
  const loadStates = [...loadStorePacketFrames("load-store"), ...loadStorePacketFrames("add-finish").slice(1)].map(({ state }) => ({ instruction: state.instruction, PC: state.PC, ACC: state.ACC, M20: state.memory20, M21: state.memory21, M22: state.memory22, halted: state.halted, returnedToOS: state.returnedToOS, output: state.output }));
  assertDeclared(loadStates, loadOracle.states, "P1-L30.loadStore.states");

  for (const fixture of oracle["P1-L31"].fixtures) {
    const actual = shift8(fixture.value, fixture.kind);
    assertDeclared({ value: actual.input, ...actual }, fixture, `P1-L31.${fixture.kind}.${fixture.value}`);
  }
  for (const fixture of oracle["P1-L32"].fixtures) {
    const actual = mask8(fixture.input, fixture.targetBit, fixture.operation, fixture.scenario);
    assertDeclared({ scenario: actual.deviceState.scenario, ...actual }, fixture, `P1-L32.${fixture.operation}.${fixture.input}.${fixture.targetBit}`);
  }
});

run("Chapter 5 declared visual-oracle parity", () => {
  assert.deepEqual(chapter5Oracles.map((entry) => entry.lessonId), ["P1-L33", "P1-L34", "P1-L35", "P1-L36"]);
  const oracle = Object.fromEntries(chapter5Oracles.map((entry) => [entry.lessonId, entry]));

  const osOracle = oracle["P1-L33"];
  assert.deepEqual(Object.keys(osOracle.cases), Object.keys(OS_CASES));
  for (const [caseId, declared] of Object.entries(osOracle.cases)) {
    const frames = osRequestFrames(caseId);
    assert.deepEqual(frames.map((frame) => frame.id), osOracle.frameIds, `P1-L33.${caseId}.frameIds`);
    const facts = OS_CASES[caseId];
    assertDeclared({ manager: facts.manager, action: facts.managementAction, result: facts.result, finalState: facts.resourceStateAfter }, declared, `P1-L33.${caseId}`);
  }

  const utilityOracle = oracle["P1-L34"];
  assert.deepEqual(Object.keys(utilityOracle.cases), Object.keys(UTILITY_CASES));
  for (const [caseId, declared] of Object.entries(utilityOracle.cases)) {
    const frames = utilityFrames(caseId);
    assert.deepEqual(frames.map((frame) => frame.id), utilityOracle.frameIds, `P1-L34.${caseId}.frameIds`);
    const facts = UTILITY_CASES[caseId];
    assertDeclared({ service: facts.selectedService, artifact: facts.artifact, finalState: facts.stateAfter, limit: facts.limitation, invariant: facts.invariant, beforeBlocks: facts.beforeBlocks, afterBlocks: facts.afterBlocks }, declared, `P1-L34.${caseId}`);
  }
  const usedDisk = utilityFrames("format", "disk-formatter", "used-disk").at(-1).state;
  assertDeclared({ operationExecuted: usedDisk.operationExecuted, outcomeKind: usedDisk.outcomeKind, artifact: usedDisk.traceArtifact, finalState: usedDisk.traceStateAfter, warning: usedDisk.warning }, utilityOracle.scenarioBranches.format["used-disk"], "P1-L34.format.used-disk");
  for (const scenario of ["definitions-outdated", "false-positive"]) {
    const state = utilityFrames("virus", "virus-checker", scenario).at(-1).state;
    assertDeclared({ operationExecuted: state.operationExecuted, artifact: state.traceArtifact, finalState: state.traceStateAfter, warning: state.warning }, utilityOracle.scenarioBranches.virus[scenario], `P1-L34.virus.${scenario}`);
  }
  for (const scenario of ["missing", "incompatible", "corrupt"]) {
    const state = utilityFrames("dll", "dynamic-link-library", scenario).at(-1).state;
    assertDeclared({ operationExecuted: state.operationExecuted, artifact: state.traceArtifact, warning: state.warning }, utilityOracle.scenarioBranches.dll[scenario], `P1-L34.dll.${scenario}`);
  }
  const wrongChoice = utilityFrames("format", "virus-checker", "blank-disk").at(-1).state;
  assert.equal(wrongChoice.traceOperation, utilityOracle.choiceContract.wrongChoiceOutcome, "P1-L34 wrong learner choice must change the trace");
  assert.equal(wrongChoice.choiceCorrect, false, "P1-L34 wrong learner choice must be classified false");

  const translatorOracle = oracle["P1-L35"];
  assert.deepEqual(Object.keys(translatorOracle.models), Object.keys(TRANSLATOR_CASES));
  assert.deepEqual(Object.keys(translatorOracle.errorScenarios), ["none", "translation-diagnostic", "runtime-failure", "logic-error"]);
  assert.equal(translatorOracle.combinationCount, Object.keys(translatorOracle.models).length * Object.keys(translatorOracle.errorScenarios).length);
  assert.deepEqual(translatorOracle.errorScenarios, {
    none: {
      errorLocation: "none",
      diagnostic: "no-declared-error",
      artifactRule: "use-the-selected-model-artifact",
      executionRule: "use-the-selected-model-execution-stage",
    },
    "translation-diagnostic": {
      errorLocationRule: "current-statement-for-interpreter-otherwise-translation-stage",
      diagnostic: "translation-diagnostic-reported",
      artifactKind: "no-successful-artifact",
      artifactStored: false,
      executionStage: "execution-blocked-or-paused-at-diagnostic",
    },
    "runtime-failure": {
      errorLocation: "runtime-stage",
      diagnostic: "translation-succeeded-runtime-failure-declared",
      artifactRule: "preserve-the-selected-model-artifact-and-its-stored-flag-where-applicable",
      executionStage: "runtime-failure-before-declared-completion",
    },
    "logic-error": {
      errorLocation: "program-behaviour",
      diagnostic: "no-translation-diagnostic-logic-error-remains",
      artifactRule: "preserve-the-selected-model-artifact-and-its-stored-flag",
      executionRule: "translation-and-execution-can-complete-with-wrong-program-behaviour",
    },
  }, "P1-L35 error scenario contract");
  for (const [model, declared] of Object.entries(translatorOracle.models)) {
    const facts = TRANSLATOR_CASES[model];
    assertDeclared(facts, declared, `P1-L35.${model}`);
    for (const scenario of Object.keys(translatorOracle.errorScenarios)) {
      const frames = translatorFrames(model, scenario);
      assert.deepEqual(frames.map((frame) => frame.id), translatorOracle.frameIds, `P1-L35.${model}.${scenario}.frameIds`);
      const state = frames.at(-1).state;
      if (scenario === "none") {
        assertDeclared(state, { errorLocation: "none", diagnostic: "no-declared-error", artifactKind: facts.artifactKind, artifactStored: facts.artifactStored, executionStage: facts.executionStage }, `P1-L35.${model}.none`);
      } else if (scenario === "translation-diagnostic") {
        assertDeclared(state, { errorLocation: model === "interpreter" ? "current-statement" : "translation-stage", diagnostic: "translation-diagnostic-reported", artifactKind: "no-successful-artifact", artifactStored: false, executionStage: "execution-blocked-or-paused-at-diagnostic" }, `P1-L35.${model}.translation-diagnostic`);
      } else if (scenario === "runtime-failure") {
        assertDeclared(state, { errorLocation: "runtime-stage", diagnostic: "translation-succeeded-runtime-failure-declared", artifactKind: facts.artifactKind, artifactStored: facts.artifactStored, executionStage: "runtime-failure-before-declared-completion" }, `P1-L35.${model}.runtime-failure`);
      } else {
        assertDeclared(state, { errorLocation: "program-behaviour", diagnostic: "no-translation-diagnostic-logic-error-remains", artifactKind: facts.artifactKind, artifactStored: facts.artifactStored, executionStage: facts.executionStage }, `P1-L35.${model}.logic-error`);
      }
    }
  }

  const ideOracle = oracle["P1-L36"];
  assert.deepEqual(Object.keys(ideOracle.packets), ["authoring", "debugging"]);
  const authoring = ideFrames("authoring", "prettyprint");
  const collapsed = ideFrames("authoring", "collapsed");
  const presentationRule = "prettyprint-or-collapse-changes-presentation-without-fixing-or-deleting-code";
  assert.deepEqual(authoring.at(-1).state.sourceLines, authoring[0].state.sourceLines, "P1-L36 prettyprint preserves source");
  assert.deepEqual(collapsed.at(-1).state.sourceLines, collapsed[0].state.sourceLines, "P1-L36 collapse preserves source");
  assert.notEqual(authoring.at(-1).state.presentationState, collapsed.at(-1).state.presentationState, "P1-L36 presentation controls remain distinct");
  const authoringActual = authoring.map((frame) => ({ id: frame.id, ...frame.state, ...(frame.id === "presentation" ? { presentationRule } : {}) }));
  assertDeclared(authoringActual, ideOracle.packets.authoring, "P1-L36.authoring");
  const debuggingActual = ideFrames("debugging").map((frame) => ({ id: frame.id, ...frame.state }));
  assertDeclared(debuggingActual, ideOracle.packets.debugging, "P1-L36.debugging");
});

console.log(`Paper 1 model checks: PASS (${checks.length} named checks; Chapter 4 and Chapter 5 JSON fixtures compared plus exhaustive shift/mask domains; Chapter 5 finite OS, utility, translator and IDE domains checked)`);
