import { describe, expect, it } from "vitest";
import {
  computeGroundPressure,
  computeGroundWeightAtLevel,
  computeLayerGeometry,
  getKa,
  getKo,
} from "./groundPressure";
import type { GroundLayer, GroundMaterial } from "./types";

const materials: GroundMaterial[] = [
  { id: "sand", name: "Sand", weight: 17, phi: 33 },
  { id: "gravel", name: "Gravel", weight: 18, phi: 35 },
  { id: "moraine", name: "Moraine", weight: 20, phi: 38 },
];

// Bottom to top: 150 mm gravel, 850 mm moraine
const layers: GroundLayer[] = [
  { thickness: 150, materialId: "gravel" },
  { thickness: 850, materialId: "moraine" },
];

describe("getKo", () => {
  it("computes the at-rest coefficient (1 - sin phi)(1 + sin betta)", () => {
    expect(getKo(33, 0)).toBeCloseTo(0.45536, 4);
    expect(getKo(33, 10)).toBeCloseTo(0.53443, 4);
    expect(getKo(35, 0)).toBeCloseTo(0.42642, 4);
  });
});

describe("getKa", () => {
  it("computes the Coulomb active coefficient with delta = phi", () => {
    expect(getKa(33, 0, 0)).toBeCloseTo(0.22445, 4);
    expect(getKa(33, 0, 10)).toBeCloseTo(0.25605, 4);
    expect(getKa(38, 0, 10)).toBeCloseTo(0.19907, 4);
  });
});

describe("computeLayerGeometry", () => {
  it("returns cumulative levels from z = 0, bottom to top", () => {
    expect(computeLayerGeometry(layers)).toEqual([
      { bottom: 0, top: 150 },
      { bottom: 150, top: 1000 },
    ]);
  });

  it("returns an empty array for no layers", () => {
    expect(computeLayerGeometry([])).toEqual([]);
  });
});

describe("computeGroundPressure", () => {
  it("accumulates overburden from the top and keeps bottom-to-top order", () => {
    const q_d = 5.5;
    const betta = 10;
    const { activePressure, passivePressure } = computeGroundPressure(
      layers,
      materials,
      betta,
      q_d,
    );

    expect(activePressure).toHaveLength(2);
    expect(passivePressure).toHaveLength(2);

    const kaMoraine = getKa(38, 0, betta);
    const koMoraine = getKo(38, betta);
    const kaGravel = getKa(35, 0, betta);
    const koGravel = getKo(35, betta);

    // Top layer (index 1, moraine): surcharge only at its top,
    // surcharge + 0.85 m * 20 kN/m³ = 22.5 kN/m² at its bottom
    expect(activePressure[1].top).toBeCloseTo(kaMoraine * 5.5, 6);
    expect(activePressure[1].bottom).toBeCloseTo(kaMoraine * 22.5, 6);
    expect(passivePressure[1].top).toBeCloseTo(koMoraine * 5.5, 6);
    expect(passivePressure[1].bottom).toBeCloseTo(koMoraine * 22.5, 6);

    // Bottom layer (index 0, gravel): 22.5 at its top,
    // 22.5 + 0.15 m * 18 kN/m³ = 25.2 kN/m² at its bottom
    expect(activePressure[0].top).toBeCloseTo(kaGravel * 22.5, 6);
    expect(activePressure[0].bottom).toBeCloseTo(kaGravel * 25.2, 6);
    expect(passivePressure[0].top).toBeCloseTo(koGravel * 22.5, 6);
    expect(passivePressure[0].bottom).toBeCloseTo(koGravel * 25.2, 6);
  });
});

describe("computeGroundWeightAtLevel", () => {
  it("sums the weight of all soil above the given level", () => {
    // Above z = 300: 700 mm of moraine
    expect(computeGroundWeightAtLevel(layers, materials, 300)).toBeCloseTo(
      14,
      6,
    );
    // Above z = 0: full column
    expect(computeGroundWeightAtLevel(layers, materials, 0)).toBeCloseTo(
      0.15 * 18 + 0.85 * 20,
      6,
    );
    // Above the column: nothing
    expect(computeGroundWeightAtLevel(layers, materials, 1000)).toBeCloseTo(
      0,
      6,
    );
  });
});
