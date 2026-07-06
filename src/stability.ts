import { computeGroundWeightAtLevel } from "./groundPressure";
import type { LayerGeometry, Model, Pressure } from "./types";

const CONCRETE_WEIGHT = 25; // kN/m³

// Characteristic weights (kN/m per running meter) and their lever arms
// about the toe (left-bottom foundation corner), in m
const computeWeightComponents = (model: Model): { g: number; e: number }[] => {
  // Soil columns resting on the foundation, above its top surface
  // (the band 0..foundation.thickness is occupied by concrete)
  const g_m_left =
    computeGroundWeightAtLevel(
      model.groundLeft,
      model.materials,
      model.foundation.thickness,
    ) *
    (model.foundation.left / 1000);
  const e_m_left = model.foundation.left / 2000;

  const g_m_right =
    computeGroundWeightAtLevel(
      model.groundRight,
      model.materials,
      model.foundation.thickness,
    ) *
    (model.foundation.right / 1000);
  const e_m_right =
    (model.foundation.left +
      model.wall.thickness +
      model.foundation.right / 2) /
    1000;

  // Wall stem
  const g_w =
    (model.wall.height / 1000) *
    (model.wall.thickness / 1000) *
    CONCRETE_WEIGHT;
  const e_w = (model.foundation.left + model.wall.thickness / 2) / 1000;

  // Foundation
  const f_width =
    (model.foundation.left + model.wall.thickness + model.foundation.right) /
    1000;
  const g_f = f_width * (model.foundation.thickness / 1000) * CONCRETE_WEIGHT;
  const e_f = f_width / 2;

  return [
    { g: g_m_left, e: e_m_left },
    { g: g_m_right, e: e_m_right },
    { g: g_w, e: e_w },
    { g: g_f, e: e_f },
  ];
};

// Characteristic vertical force on the foundation base, kN/m
export const computeVerticalForce = (model: Model): number => {
  return computeWeightComponents(model).reduce((acc, c) => acc + c.g, 0);
};

// Characteristic stabilizing moment about the toe, kN·m/m
export const computeStabilizingMoment = (model: Model): number => {
  return computeWeightComponents(model).reduce((acc, c) => acc + c.g * c.e, 0);
};

// Resultant of a trapezoidal pressure diagram, kN/m
export const computePressureForce = (
  layers: LayerGeometry,
  pressure: Pressure,
): number => {
  if (layers.length !== pressure.length) {
    throw new Error("Layers and pressure arrays must have the same length.");
  }

  return layers.reduce((acc, layer, index) => {
    const h = (layer.top - layer.bottom) / 1000;
    const p = pressure[index];
    return acc + ((p.bottom + p.top) / 2) * h;
  }, 0);
};

// Moment of a trapezoidal pressure diagram about z = 0, kN·m/m
export const computePressureMoment = (
  layers: LayerGeometry,
  pressure: Pressure,
): number => {
  if (layers.length !== pressure.length) {
    throw new Error("Layers and pressure arrays must have the same length.");
  }

  return layers.reduce((acc, layer, index) => {
    const b = layer.bottom / 1000;
    const h = (layer.top - layer.bottom) / 1000;
    const { bottom: p_b, top: p_t } = pressure[index];

    // Rectangle p_b over h (centroid at b + h/2) plus
    // triangle (p_t - p_b) (centroid at b + 2h/3, apex at the bottom)
    return (
      acc + p_b * h * (b + h / 2) + (p_t - p_b) * (h / 2) * (b + (2 * h) / 3)
    );
  }, 0);
};
