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

    const ko = getKo(material.phi, betta);
    const ka = getKa(material.phi, material.alpha, betta);

    const topPassive = ko * load;
    const topActive = ka * load;

    load += (layer.thickness / 1000) * material.weight;

    const bottomPassive = ko * load;
    const bottomActive = ka * load;

    passivePressure.push([topPassive, bottomPassive]);
    activePressure.push([topActive, bottomActive]);
  }

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
