import type { LayerGeometry, Model, Pressure } from "./types";

export const computeStabilizingMoment = (model: Model): number => {
  // Vertical ground pressure on foundation
  const g_m_left =
    (model.groundLeft.reduce((g, layer) => {
      const material = model.materials.find((m) => m.id === layer.materialId);
      if (!material) {
        console.warn(`Material with id ${layer.materialId} not found`);
        return g;
      }
      return g + (layer.thickness / 1000) * material.weight;
    }, 0) *
      model.foundation.left) /
    1000;

  const e_m_left = model.foundation.left / 2;

  const g_m_right =
    (model.groundRight.reduce((g, layer) => {
      const material = model.materials.find((m) => m.id === layer.materialId);
      if (!material) {
        console.warn(`Material with id ${layer.materialId} not found`);
        return g;
      }
      return g + (layer.thickness / 1000) * material.weight;
    }, 0) *
      model.foundation.right) /
    1000;

  const e_m_right =
    model.foundation.left + model.wall.thickness + model.foundation.right / 2;

  // Wall
  const g_w = (model.wall.height * model.wall.thickness * 25) / 1000000; // Assuming wall density of 25 kN/m³
  const e_w = model.foundation.left + model.wall.thickness / 2;

  // Foundation
  const f_width =
    model.foundation.left + model.wall.thickness + model.foundation.right;
  const g_f = (f_width * model.foundation.thickness * 25) / 1000000; // Assuming foundation density of 25 kN/m³
  const e_f = f_width / 2;

  return (
    model.gammaGstb *
    (g_m_left * e_m_left + g_m_right * e_m_right + g_w * e_w + g_f * e_f)
  );
};

export const computePressureForce = (pressure: Pressure): number => {
  return pressure.reduce((acc, p) => {
    const b = p.bottom / 1000;
    const t = p.top / 1000;
    const h = t - b;
    return acc + (b + (t - b) / 2) * h;
  }, 0);
};

export const computePressureMoment = (
  layers: LayerGeometry,
  pressure: Pressure,
): number => {
  if (layers.length !== pressure.length) {
    console.warn("Layers and pressure arrays must have the same length.");
    return 1000000;
  }

  const moment = layers.reduce((acc, layer, index) => {
    const b = layer.bottom / 1000;
    const t = layer.top / 1000;
    const h = t - b;

    const pressureValue = pressure[index];
    const p_b = pressureValue.bottom;
    const p_t = pressureValue.top;

    const p = p_b + ((p_t - p_b) * h) / 2;
    const e =
      ((p_b * h) / 2 + ((((p_t - p_b) * h) / 2) * h) / 3) /
      (p_b + ((p_t - p_b) * h) / 2);
    return acc + p * e;
  }, 0);

  return moment;
};
