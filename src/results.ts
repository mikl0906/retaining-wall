import { computeGroundPressure, computeLayerGeometry } from "./groundPressure";
import {
  computePressureForce,
  computePressureMoment,
  computeStabilizingMoment,
  computeVerticalForce,
} from "./stability";
import type { Model } from "./types";

export type Results = {
  q_perm: number; // permanent surcharge on the slab (self-weight), kN/m²
  q_d: number; // total surcharge on the slab, kN/m²
  groundPressureLeft: ReturnType<typeof computeGroundPressure>;
  groundPressureRight: ReturnType<typeof computeGroundPressure>;
  overturning: {
    MaPerm: number; // active moment about the toe, permanent share, kN·m/m
    MaVar: number; // active moment about the toe, variable share, kN·m/m
    Mp: number; // at-rest earth moment on the front side, kN·m/m
    Mweights: number; // moment of the characteristic weights, kN·m/m
    Mdst: number; // design destabilizing moment, kN·m/m
    Mstb: number; // design stabilizing moment, kN·m/m
    utilization: number;
  };
  sliding: {
    EaPerm: number; // active thrust, permanent share, kN/m
    EaVar: number; // active thrust, variable share, kN/m
    Vk: number; // characteristic vertical force, kN/m
    deltaDeg: number; // base friction angle δ, degrees
    Hd: number; // design driving force, kN/m
    Rd: number; // design sliding resistance, kN/m
    utilization: number;
  };
};

export const computeResults = (model: Model): Results => {
  const q_perm = model.slab.thickness * 0.025;
  const q_d = q_perm + model.q_k;

  const layersLeft = computeLayerGeometry(model.groundLeft);
  const layersRight = computeLayerGeometry(model.groundRight);

  const groundPressureLeft = computeGroundPressure(
    model.groundLeft,
    model.materials,
    0,
    0,
  );
  const groundPressureRightPerm = computeGroundPressure(
    model.groundRight,
    model.materials,
    model.slab.angle,
    q_perm,
  );
  const groundPressureRight = computeGroundPressure(
    model.groundRight,
    model.materials,
    model.slab.angle,
    q_d,
  );

  // Active thrust and its moment about the base level, split into the
  // permanent and variable (q_k) shares — pressure is linear in the surcharge
  const EaPerm = computePressureForce(
    layersRight,
    groundPressureRightPerm.activePressure,
  );
  const EaVar =
    computePressureForce(layersRight, groundPressureRight.activePressure) -
    EaPerm;

  const MaPerm = computePressureMoment(
    layersRight,
    groundPressureRightPerm.activePressure,
  );
  const MaVar =
    computePressureMoment(layersRight, groundPressureRight.activePressure) -
    MaPerm;

  // Overturning (EQU)
  const Mp = computePressureMoment(
    layersLeft,
    groundPressureLeft.passivePressure,
  );
  const Mweights = computeStabilizingMoment(model);
  const Mdst = model.gammaGdst * MaPerm + model.gammaQdst * MaVar;
  const Mstb = model.gammaGstb * (Mweights + Mp);

  // Sliding (EC7 6.5.3, cast-in-place concrete: δ = φ of the foundation soil;
  // front-side resistance neglected)
  const Vk = computeVerticalForce(model);
  const foundationMaterial =
    model.materials.find((m) => m.id === model.foundationMaterialId) ??
    model.materials.find((m) => m.id === model.groundLeft[0]?.materialId);
  const deltaDeg = foundationMaterial?.phi ?? 0;
  const Hd = model.gammaGdst * EaPerm + model.gammaQdst * EaVar;
  const Rd =
    (model.gammaGstb * Vk * Math.tan((deltaDeg * Math.PI) / 180)) /
    model.gammaRh;

  return {
    q_perm,
    q_d,
    groundPressureLeft,
    groundPressureRight,
    overturning: {
      MaPerm,
      MaVar,
      Mp,
      Mweights,
      Mdst,
      Mstb,
      utilization: Mstb > 0 ? Mdst / Mstb : Infinity,
    },
    sliding: {
      EaPerm,
      EaVar,
      Vk,
      deltaDeg,
      Hd,
      Rd,
      utilization: Rd > 0 ? Hd / Rd : Infinity,
    },
  };
};
