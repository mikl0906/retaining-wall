import { create } from "zustand";
import type { Model } from "./types";

const emptyModel: Model = {
  name: "",
  wall: {
    height: 3000,
    thickness: 300,
  },
  foundation: {
    left: 500,
    right: 800,
    thickness: 300,
  },
  groundSlab: {
    thickness: 300,
    angle: 30,
  },
  grounds: [
    {
      id: "bacf7a0a-c6af-428e-b946-5c7809b51dab",
      name: "Default Ground",
      weight: 18,
      fi: 35,
      alfa: 0,
    },
  ],
  groundLeft: [
    {
      thickness: 1500,
      groundId: "bacf7a0a-c6af-428e-b946-5c7809b51dab",
    },
  ],
  groundRight: [
    {
      thickness: 2000,
      groundId: "bacf7a0a-c6af-428e-b946-5c7809b51dab",
    },
    {
      thickness: 1000,
      groundId: "bacf7a0a-c6af-428e-b946-5c7809b51dab",
    },
  ],
  gammaDL: 1.15,
  gammaLL: 1.5,
  gammaGdst: 1.1,
  gammaGstb: 0.9,
  liveLoad: 5,
};

export const useModel = create<Model>()(() => emptyModel);
