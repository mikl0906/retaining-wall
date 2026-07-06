import { describe, expect, it } from "vitest";
import { computeResults } from "./results";
import { Model } from "./types";

// Mirrors the app's default model
const model = Model.parse({
  materials: [
    { id: "sand", name: "Sand", weight: 17, phi: 33 },
    { id: "gravel", name: "Gravel", weight: 18, phi: 35 },
  ],
  wall: { height: 3000, thickness: 300 },
  foundation: { left: 500, right: 800, thickness: 300 },
  slab: { thickness: 300, angle: 10 },
  groundLeft: [{ thickness: 1500, materialId: "sand" }],
  groundRight: [
    { thickness: 2000, materialId: "sand" },
    { thickness: 1000, materialId: "sand" },
  ],
  foundationMaterialId: "sand",
  q_k: 5,
});

describe("computeResults", () => {
  const results = computeResults(model);

  it("computes the surcharges", () => {
    expect(results.q_perm).toBeCloseTo(7.5, 6);
    expect(results.q_d).toBeCloseTo(12.5, 6);
  });

  it("verifies overturning for the default model", () => {
    // Hand calculation: Ka(33°, 0, 10°) = 0.25605,
    // MaPerm = Ka (4.5 q_perm + 76.5) = 28.230, MaVar = Ka * 4.5 * 5 = 5.761,
    // Mp = K0(33°, 0) * 17 * 0.5625 = 4.354, Mweights = 70.839
    const { overturning } = results;
    expect(overturning.MaPerm).toBeCloseTo(28.23, 2);
    expect(overturning.MaVar).toBeCloseTo(5.761, 2);
    expect(overturning.Mp).toBeCloseTo(4.354, 2);
    expect(overturning.Mweights).toBeCloseTo(70.839, 3);
    expect(overturning.Mdst).toBeCloseTo(1.1 * 28.2297 + 1.5 * 5.7612, 2);
    expect(overturning.Mstb).toBeCloseTo(0.9 * (70.839 + 4.3544), 2);
    expect(overturning.utilization).toBeCloseTo(0.5866, 3);
  });

  it("verifies sliding for the default model", () => {
    // EaPerm = Ka (3 q_perm + 76.5) = 25.349, EaVar = Ka * 3 * 5 = 3.841,
    // Vk = 81.42, delta = 33°, Rd = 0.9 * 81.42 * tan 33° / 1.1 = 43.261
    const { sliding } = results;
    expect(sliding.EaPerm).toBeCloseTo(25.349, 2);
    expect(sliding.EaVar).toBeCloseTo(3.841, 2);
    expect(sliding.Vk).toBeCloseTo(81.42, 6);
    expect(sliding.deltaDeg).toBe(33);
    expect(sliding.Hd).toBeCloseTo(33.645, 2);
    expect(sliding.Rd).toBeCloseTo(43.261, 2);
    expect(sliding.utilization).toBeCloseTo(0.7777, 3);
  });

  it("increases utilizations when the live load grows", () => {
    const loaded = computeResults({ ...model, q_k: 20 });
    expect(loaded.overturning.utilization).toBeGreaterThan(
      results.overturning.utilization,
    );
    expect(loaded.sliding.utilization).toBeGreaterThan(
      results.sliding.utilization,
    );
  });

  it("increases utilizations when the wall gets taller with taller backfill", () => {
    const taller = computeResults({
      ...model,
      wall: { ...model.wall, height: 4000 },
      groundRight: [
        { thickness: 2000, materialId: "sand" },
        { thickness: 2000, materialId: "sand" },
      ],
    });
    expect(taller.overturning.utilization).toBeGreaterThan(
      results.overturning.utilization,
    );
    expect(taller.sliding.utilization).toBeGreaterThan(
      results.sliding.utilization,
    );
  });

  it("falls back to the bottom left layer material for base friction", () => {
    const fallback = computeResults({ ...model, foundationMaterialId: "" });
    expect(fallback.sliding.deltaDeg).toBe(33);
    expect(fallback.sliding.utilization).toBeCloseTo(
      results.sliding.utilization,
      6,
    );
  });
});
