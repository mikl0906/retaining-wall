import type { GroundLayer, GroundMaterial } from "./types";

export const computeGroundPressure = (
  layers: GroundLayer[],
  materials: GroundMaterial[],
  betta: number,
  q_d: number,
): {
  passivePressure: { bottom: number; top: number }[];
  activePressure: { bottom: number; top: number }[];
} => {
  let load = q_d;

  const passivePressure: { bottom: number; top: number }[] = [];
  const activePressure: { bottom: number; top: number }[] = [];

  // The layers come from bottom to top, but we need to calculate pressure from top to bottom, so we reverse the order

  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    const material = materials.find((m) => m.id === layer.materialId);
    if (!material) {
      console.warn(`Material with id ${layer.materialId} not found`);
      continue;
    }

    const ko = getKo(material.phi, betta);
    const ka = getKa(material.phi, 0, betta);

    const topPassive = ko * load;
    const topActive = ka * load;

    load += (layer.thickness / 1000) * material.weight;

    const bottomPassive = ko * load;
    const bottomActive = ka * load;

    passivePressure.push({ bottom: bottomPassive, top: topPassive });
    activePressure.push({ bottom: bottomActive, top: topActive });
  }

  // We reverse the pressures back to match the original order of layers (from bottom to top)
  passivePressure.reverse();
  activePressure.reverse();

  return {
    passivePressure,
    activePressure,
  };
};

const getKo = (phi: number, betta: number) => {
  const phiRad = (phi * Math.PI) / 180;
  const bettaRad = (betta * Math.PI) / 180;

  return (1 - Math.sin(phiRad)) * (1 + Math.sin(bettaRad));
};

const getKa = (phi: number, alpha: number, betta: number) => {
  const f = (phi * Math.PI) / 180;
  const a = (alpha * Math.PI) / 180;
  const b = (betta * Math.PI) / 180;
  const d = f;

  return (
    Math.cos(f + a) ** 2 /
    (Math.cos(a) ** 2 *
      (1 +
        Math.sqrt(
          (Math.sin(f + d) * Math.sin(f - b)) /
            (Math.cos(a - d) * Math.cos(a + b)),
        )) **
        2)
  );
};

// const testMaterials: GroundMaterial[] = [
//   {
//     id: "1",
//     name: "Sand",
//     weight: 17,
//     phi: 33,
//     alpha: 0,
//   },
//   {
//     id: "2",
//     name: "Gravel",
//     weight: 18,
//     phi: 35,
//     alpha: 0,
//   },
//   {
//     id: "3",
//     name: "Moraine",
//     weight: 20,
//     phi: 38,
//     alpha: 0,
//   },
// ];

// const testLayers: GroundLayer[] = [
//   {
//     thickness: 150,
//     materialId: "2",
//   },
//   {
//     thickness: 850,
//     materialId: "3",
//   },
// ];

// const q_d = 5.5;
// const betta = 10;
// const result = computeGroundPressure(testLayers, testMaterials, betta, q_d);
// console.log(result);
