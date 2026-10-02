import assert from "node:assert/strict";
import { binaryPlaceValueFixture, bitmapRleFixture, bitmapStorage, characterEncoding, numberRepresentation, pcmStorage, rleComparison, rleDecode, sampleAndQuantiseFixture, signedArithmetic, unitConversion, vectorDrawing } from "../app/lib/paper1/models.ts";

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
console.log(`Paper 1 visual model oracles: PASS (${checks.length})`);
