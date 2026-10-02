export type LearningLocale = "en" | "vi";

export type UnitConvention = "decimal" | "binary";
export type UnitPrefix = 1 | 2 | 3 | 4;

export function unitConversion(value: number, prefix: UnitPrefix, convention: UnitConvention) {
  const base = convention === "binary" ? 1024 : 1000;
  const symbols = convention === "binary" ? ["B", "KiB", "MiB", "GiB", "TiB"] : ["B", "kB", "MB", "GB", "TB"];
  const bytes = value * base ** prefix;
  return { base, unit: symbols[prefix], bytes, bits: bytes * 8 };
}

export type RepresentationKind = "unsigned" | "hex" | "bcd" | "ones" | "twos";

export const BINARY_PLACE_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1] as const;
export type BinaryPlaceWeight = (typeof BINARY_PLACE_WEIGHTS)[number];

export function binaryPlaceValueFixture(value = 238, toggledWeight?: BinaryPlaceWeight) {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError("Binary place-value fixture requires an unsigned 8-bit integer.");
  }
  if (toggledWeight !== undefined && !BINARY_PLACE_WEIGHTS.includes(toggledWeight)) {
    throw new RangeError("Binary place-value toggle must be an 8-bit column weight.");
  }

  const bits: number[] = BINARY_PLACE_WEIGHTS.map((weight) => {
    const encodedBit = value & weight ? 1 : 0;
    return toggledWeight === weight ? (encodedBit === 1 ? 0 : 1) : encodedBit;
  });
  const sum = bits.reduce<number>((total, bit, index) => total + bit * BINARY_PLACE_WEIGHTS[index], 0);
  return { value, weights: BINARY_PLACE_WEIGHTS, bits, sum };
}

function byteBits(value: number) {
  return (value & 0xff).toString(2).padStart(8, "0");
}

export function numberRepresentation(value: number, kind: RepresentationKind) {
  if (!Number.isInteger(value)) return { valid: false as const, reason: "integer-required" as const };
  if (kind === "unsigned") {
    if (value < 0 || value > 255) return { valid: false as const, reason: "unsigned-range" as const };
    return { valid: true as const, bits: byteBits(value), label: `${value}\u2081\u2080`, groups: [byteBits(value)] };
  }
  if (kind === "hex") {
    if (value < 0 || value > 255) return { valid: false as const, reason: "unsigned-range" as const };
    const hex = value.toString(16).toUpperCase().padStart(2, "0");
    return { valid: true as const, bits: byteBits(value), label: `${hex}\u2081\u2086`, groups: [byteBits(value).slice(0, 4), byteBits(value).slice(4)] };
  }
  if (kind === "bcd") {
    if (value < 0 || value > 99) return { valid: false as const, reason: "bcd-range" as const };
    const digits = String(value).padStart(2, "0").split("");
    const groups = digits.map((digit) => Number(digit).toString(2).padStart(4, "0"));
    return { valid: true as const, bits: groups.join(""), label: `${value} BCD`, groups };
  }
  const minimum = kind === "twos" ? -128 : -127;
  if (value < minimum || value > 127) return { valid: false as const, reason: "signed-range" as const };
  const magnitude = byteBits(Math.abs(value));
  const ones = magnitude.replace(/[01]/g, (bit) => bit === "0" ? "1" : "0");
  const bits = value >= 0 ? byteBits(value) : kind === "ones" ? ones : byteBits((~Math.abs(value) + 1) & 0xff);
  return { valid: true as const, bits, label: String(value), groups: [bits], magnitude, inverted: ones };
}

export type SignedOperation = "add" | "subtract";

export function signedArithmetic(a: number, b: number, operation: SignedOperation) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) throw new RangeError("Signed arithmetic operands must be integers.");
  if (a < -128 || a > 127 || b < -128 || b > 127) throw new RangeError("Signed arithmetic operands must fit signed 8-bit.");
  const operandB = operation === "subtract" ? -b : b;
  const encodedA = a & 0xff;
  const encodedB = operandB & 0xff;
  const exact = a + operandB;
  const raw = encodedA + encodedB;
  const encodedResult = raw & 0xff;
  const signedResult = encodedResult < 128 ? encodedResult : encodedResult - 256;
  let carry = 0;
  const columns = Array.from({ length: 8 }, (_, index) => {
    const bitA = (encodedA >> index) & 1;
    const bitB = (encodedB >> index) & 1;
    const sum = bitA + bitB + carry;
    const column = { index, bitA, bitB, carryIn: carry, result: sum & 1, carryOut: sum >> 1 };
    carry = column.carryOut;
    return column;
  });
  return {
    exact,
    encodedA,
    encodedB,
    encodedResult,
    signedResult,
    carryOut: carry,
    overflow: exact < -128 || exact > 127,
    columns,
    bitsA: byteBits(encodedA),
    bitsB: byteBits(encodedB),
    bitsResult: byteBits(encodedResult),
  };
}

export function characterEncoding(character: string) {
  const glyph = Array.from(character)[0] ?? "A";
  const codePoint = glyph.codePointAt(0) ?? 65;
  const bytes = Array.from(new TextEncoder().encode(glyph));
  return {
    glyph,
    codePoint,
    codePointHex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
    codePointBinary: codePoint.toString(2),
    utf8Bytes: bytes,
    utf8Bits: bytes.map(byteBits),
    ascii: codePoint <= 0x7f ? codePoint : null,
  };
}

export function bitmapStorage(width: number, height: number, depth: number) {
  if (![width, height, depth].every(Number.isInteger) || width < 1 || height < 1 || depth < 1) throw new RangeError("Bitmap dimensions and colour depth must be positive integers.");
  const pixels = width * height;
  const colours = 2 ** depth;
  const bits = pixels * depth;
  const remainderBits = bits % 8;
  const paddingBits = remainderBits === 0 ? 0 : 8 - remainderBits;
  return { pixels, colours, bits, bytes: Math.ceil(bits / 8), remainderBits, paddingBits };
}

export type VectorShape = "badge" | "arrow" | "icon";

export function vectorDrawing(shape: VectorShape, scale: number) {
  const objects = shape === "badge"
    ? ["circle cx=50 cy=50 r=34", "text x=50 y=57: A"]
    : shape === "arrow"
      ? ["line x1=18 y1=50 x2=76 y2=50", "polygon points=68,36 86,50 68,64"]
      : ["rect x=20 y=24 width=60 height=52", "circle cx=50 cy=50 r=13"];
  return { objects, scale, outputWidth: 100 * scale, outputHeight: 100 * scale };
}

export function pcmStorage(sampleRate: number, resolution: number, duration: number, channels: number) {
  const samplesPerChannel = sampleRate * duration;
  const totalSamples = samplesPerChannel * channels;
  const bits = totalSamples * resolution;
  return { samplesPerChannel, totalSamples, levels: 2 ** resolution, bits, bytes: Math.ceil(bits / 8) };
}

export type SamplingDensity = "baseline" | "higher";

const SAMPLING_WAVEFORM = [
  { time: 0, measured: 0.12 },
  { time: 0.25, measured: 0.68 },
  { time: 0.5, measured: 0.43 },
  { time: 0.75, measured: 0.9 },
  { time: 1, measured: 0.28 },
] as const;

export function sampleAndQuantiseFixture(density: SamplingDensity = "baseline", resolutionBits = 2) {
  if (!Number.isInteger(resolutionBits) || resolutionBits < 1 || resolutionBits > 8) {
    throw new RangeError("Sampling resolution must be an integer from 1 to 8 bits.");
  }
  const levels = 2 ** resolutionBits;
  const sourceRows = density === "higher" ? SAMPLING_WAVEFORM : SAMPLING_WAVEFORM.filter((_, index) => index % 2 === 0);
  const rows = sourceRows.map(({ time, measured }) => {
    const level = Math.round(measured * (levels - 1));
    const quantised = level / (levels - 1);
    return {
      time,
      measured,
      quantised,
      binary: level.toString(2).padStart(resolutionBits, "0"),
      error: Math.abs(measured - quantised),
    };
  });
  return {
    density,
    resolutionBits,
    levels,
    sampleSpacing: density === "higher" ? 0.25 : 0.5,
    rows,
    meanQuantisationError: rows.reduce((total, row) => total + row.error, 0) / rows.length,
  };
}

export interface Run { readonly character: string; readonly count: number }

export function rleEncode(value: string): Run[] {
  const runs: { character: string; count: number }[] = [];
  for (const character of value) {
    const previous = runs.at(-1);
    if (previous?.character === character) previous.count += 1;
    else runs.push({ character, count: 1 });
  }
  return runs;
}

export function rleDecode(runs: readonly Run[]) {
  return runs.map((run) => run.character.repeat(run.count)).join("");
}

export function rleComparison(value: string) {
  const runs = rleEncode(value);
  const originalBytes = value.length;
  const encodedBytes = runs.length * 2;
  return { runs, originalBytes, encodedBytes, savesSpace: encodedBytes < originalBytes };
}

export type BitmapScanOrder = "row-major" | "column-major";

export const RLE_MONO_GRID = [
  "WWWWWWWW",
  "WBBBBBBW",
  "WBWWWWWW",
  "WBWWWWWW",
  "WBBBBBWW",
  "WBWWWWWW",
  "WBWWWWWW",
  "WBWWWWWW",
] as const;

export function bitmapRleFixture(scanOrder: BitmapScanOrder = "row-major") {
  const width = RLE_MONO_GRID[0].length;
  const height = RLE_MONO_GRID.length;
  const sequence = scanOrder === "row-major"
    ? RLE_MONO_GRID.join("")
    : Array.from({ length: width }, (_, column) => RLE_MONO_GRID.map((row) => row[column]).join("")).join("");
  const runs = rleEncode(sequence);
  const decodedSequence = rleDecode(runs);
  const decodedGrid = scanOrder === "row-major"
    ? Array.from({ length: height }, (_, row) => decodedSequence.slice(row * width, (row + 1) * width))
    : Array.from({ length: height }, (_, row) => Array.from({ length: width }, (_, column) => decodedSequence[column * height + row]).join(""));

  return {
    scanOrder,
    width,
    height,
    grid: RLE_MONO_GRID,
    sequence,
    runs,
    decodedGrid,
    rawBytes: width * height,
    encodedBytes: runs.length * 2,
    firstRun: runs[0],
  };
}
