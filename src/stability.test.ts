import { describe, expect, it } from "vitest";
import {
  computePressureForce,
  computePressureMoment,
  computeStabilizingMoment,
  computeVerticalForce,
} from "./stability";
import { Model } from "./types";

describe("computePressureForce", () => {
  it("integrates a uniform pressure block", () => {
    // 10 kN/m² over 2 m
    expect(
      computePressureForce([{ bottom: 0, top: 2000 }], [{ bottom: 10, top: 10 }]),
    ).toBeCloseTo(20, 6);
  });

  it("integrates a triangular diagram (zero at the top)", () => {
    // 9 kN/m² at the bottom over 3 m
    expect(
      computePressureForce([{ bottom: 0, top: 3000 }], [{ bottom: 9, top: 0 }]),
    ).toBeCloseTo(13.5, 6);
  });

  it("sums multiple layers", () => {
    expect(
      computePressureForce(
        [
          { bottom: 0, top: 1000 },
          { bottom: 1000, top: 3000 },
        ],
        [
          { bottom: 4, top: 2 },
          { bottom: 2, top: 0 },
        ],
      ),
    ).toBeCloseTo(3 + 2, 6);
  });

  it("throws on array length mismatch", () => {
    expect(() =>
      computePressureForce([{ bottom: 0, top: 1000 }], []),
    ).toThrow();
  });
});

describe("computePressureMoment", () => {
  it("computes the moment of a uniform block about z = 0", () => {
    // 10 kN/m² over 1..3 m: F = 20 kN/m, centroid at 2 m
    expect(
      computePressureMoment(
        [{ bottom: 1000, top: 3000 }],
        [{ bottom: 10, top: 10 }],
      ),
    ).toBeCloseTo(40, 6);
  });

  it("computes the moment of a triangular diagram (zero at the top)", () => {
    // p(z) = 9 (1 - z/3): M = integral of p(z) z dz over 0..3 = 13.5
    expect(
      computePressureMoment(
        [{ bottom: 0, top: 3000 }],
        [{ bottom: 9, top: 0 }],
      ),
    ).toBeCloseTo(13.5, 6);
  });

  it("offsets the lever arm by the layer bottom", () => {
    // Same triangle lifted by 1 m: extra moment = F * 1 m = 13.5 + 13.5
    expect(
      computePressureMoment(
        [{ bottom: 1000, top: 4000 }],
        [{ bottom: 9, top: 0 }],
      ),
    ).toBeCloseTo(13.5 + 13.5, 6);
  });

  it("throws on array length mismatch", () => {
    expect(() =>
      computePressureMoment([{ bottom: 0, top: 1000 }], []),
    ).toThrow();
  });
});

const model = Model.parse({
  materials: [{ id: "sand", name: "Sand", weight: 17, phi: 33 }],
  wall: { height: 3000, thickness: 300 },
  foundation: { left: 500, right: 800, thickness: 300 },
  slab: { thickness: 300, angle: 10 },
  groundLeft: [{ thickness: 1500, materialId: "sand" }],
  groundRight: [
    { thickness: 2000, materialId: "sand" },
    { thickness: 1000, materialId: "sand" },
  ],
  foundationMaterialId: "sand",
});

describe("computeVerticalForce", () => {
  it("sums soil above the foundation top and the concrete weights", () => {
    // Soil left: 1.2 m * 17 * 0.5 m = 10.2; soil right: 2.7 m * 17 * 0.8 m = 36.72
    // Wall: 3 * 0.3 * 25 = 22.5; foundation: 1.6 * 0.3 * 25 = 12
    expect(computeVerticalForce(model)).toBeCloseTo(81.42, 6);
  });
});

describe("computeStabilizingMoment", () => {
  it("sums characteristic weight moments about the toe", () => {
    // 10.2 * 0.25 + 36.72 * 1.2 + 22.5 * 0.65 + 12 * 0.8
    expect(computeStabilizingMoment(model)).toBeCloseTo(70.839, 6);
  });
});
