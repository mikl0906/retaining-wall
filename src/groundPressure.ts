import type { GroundLayer, GroundMaterial } from "./types";

export const computeGroundPressure = (
  layers: GroundLayer[],
  materials: GroundMaterial[],
  betta: number,
  q_d: number,
): {
  passivePressure: [number, number][];
  activePressure: [number, number][];
} => {
  let load = q_d;

  const passivePressure: [number, number][] = [];
  const activePressure: [number, number][] = [];

  for (const layer of layers) {
    const material = materials.find((m) => m.id === layer.materialId);
    if (!material) {
      console.warn(`Material with id ${layer.materialId} not found`);
      continue;
    }

    // Passive
    const ko1 = getKo1(material.phi, betta);
    const topPassive = ko1 * load;
    load += layer.thickness * material.weight;
    const bottomPassive = ko1 * load;
    passivePressure.push([topPassive, bottomPassive]);

    // Active
    const kah1 = getKah1(material.phi, material.alpha, betta);
    const topActive = kah1 * load;
    load += layer.thickness * material.weight;
    const bottomActive = kah1 * load;
    activePressure.push([topActive, bottomActive]);
  }

  return {
    passivePressure,
    activePressure,
  };
};

const getKo1 = (phi: number, betta: number) => {
  const phiRad = (phi * Math.PI) / 180;
  const bettaRad = (betta * Math.PI) / 180;
  return (1 - Math.sin(phiRad)) / (1 + Math.sin(bettaRad));
};

const getKah1 = (phi: number, alpha: number, betta: number) => {
  const phiRad = (phi * Math.PI) / 180;
  const alphaRad = (alpha * Math.PI) / 180;
  const bettaRad = (betta * Math.PI) / 180;
  const deltaRad = alphaRad;
  return (
    Math.cos(phiRad + alphaRad) ** 2 /
    (Math.cos(alphaRad) ** 2 *
      (1 +
        Math.sqrt(
          (Math.sin(phiRad + deltaRad) * Math.sin(deltaRad - bettaRad)) /
            (Math.cos(alphaRad - deltaRad) * Math.cos(alphaRad + bettaRad)),
        )) **
        2)
  );
};

// const testMaterials
