export type LogicGate = "NOT" | "AND" | "OR" | "NAND" | "NOR" | "XOR";

export function logicGateOutput(gate: LogicGate, inputA: 0 | 1, inputB: 0 | 1): 0 | 1 {
  if (gate === "NOT") return inputA === 0 ? 1 : 0;
  if (gate === "AND") return inputA === 1 && inputB === 1 ? 1 : 0;
  if (gate === "OR") return inputA === 1 || inputB === 1 ? 1 : 0;
  if (gate === "NAND") return inputA === 1 && inputB === 1 ? 0 : 1;
  if (gate === "NOR") return inputA === 0 && inputB === 0 ? 1 : 0;
  return inputA !== inputB ? 1 : 0;
}

export function logicGateRows(gate: LogicGate) {
  const inputs: readonly [0 | 1, 0 | 1][] = gate === "NOT" ? [[0, 0], [1, 0]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
  return inputs.map(([inputA, inputB]) => ({ inputA, inputB, output: logicGateOutput(gate, inputA, inputB) }));
}

export type ControlMode = "monitor" | "control";
export function controlDecision(mode: ControlMode, reading: number, target: number) {
  if (mode === "monitor") return { comparison: reading < target ? "below" : reading === target ? "equal" : "above", actuator: "none" as const, nextReading: reading };
  const actuator = reading < target ? "on" as const : "off" as const;
  return { comparison: reading < target ? "below" : reading === target ? "equal" : "above", actuator, nextReading: actuator === "on" ? reading + 1 : reading };
}

export type MemoryType = "RAM" | "ROM" | "SRAM" | "DRAM" | "PROM" | "EPROM" | "EEPROM";
export type MemoryEvent = "power-off" | "write" | "refresh";
export type MemoryUse = "main-memory" | "cache" | "fixed-firmware" | "prototype-firmware" | "device-settings";

export const memoryFacts: Readonly<Record<MemoryType, Readonly<{
  volatile: boolean;
  writable: "normal" | "once" | "uv-erase" | "electrical" | "fixed";
  refresh: boolean;
  bestUses: readonly MemoryUse[];
}>>> = {
  RAM: { volatile: true, writable: "normal", refresh: false, bestUses: ["main-memory"] },
  ROM: { volatile: false, writable: "fixed", refresh: false, bestUses: ["fixed-firmware"] },
  SRAM: { volatile: true, writable: "normal", refresh: false, bestUses: ["cache"] },
  DRAM: { volatile: true, writable: "normal", refresh: true, bestUses: ["main-memory"] },
  PROM: { volatile: false, writable: "once", refresh: false, bestUses: ["fixed-firmware"] },
  EPROM: { volatile: false, writable: "uv-erase", refresh: false, bestUses: ["prototype-firmware"] },
  EEPROM: { volatile: false, writable: "electrical", refresh: false, bestUses: ["device-settings", "prototype-firmware"] },
};

export function memoryEventOutcome(memory: MemoryType, event: MemoryEvent) {
  const facts = memoryFacts[memory];
  if (event === "power-off") return facts.volatile ? "lost" as const : "retained" as const;
  if (event === "refresh") return facts.refresh ? "required" as const : "not-required" as const;
  return facts.writable;
}

export type LogicCircuit = "alarm" | "permission";
export function evaluateLogicCircuit(circuit: LogicCircuit, inputA: 0 | 1, inputB: 0 | 1, inputC: 0 | 1) {
  if (circuit === "alarm") {
    const p = logicGateOutput("AND", inputA, inputB);
    const q = logicGateOutput("NOT", inputC, 0);
    return { p, q, output: logicGateOutput("OR", p, q), expression: "Y = (A AND B) OR (NOT C)" } as const;
  }
  const p = logicGateOutput("OR", inputA, inputB);
  const q = inputC;
  return { p, q, output: logicGateOutput("AND", p, q), expression: "Y = (A OR B) AND C" } as const;
}

export function circuitRows(circuit: LogicCircuit) {
  const bits: readonly (0 | 1)[] = [0, 1];
  return bits.flatMap((inputA) => bits.flatMap((inputB) => bits.map((inputC) => ({ inputA, inputB, inputC, ...evaluateLogicCircuit(circuit, inputA, inputB, inputC) }))));
}

export function bufferOccupancy(capacity: number, produced: number, consumed: number) {
  const waiting = Math.max(0, produced - consumed);
  return { waiting: Math.min(capacity, waiting), overflow: Math.max(0, waiting - capacity), full: waiting >= capacity };
}
