import { create } from "zustand";
import type { GroundMaterial, Model } from "./types";
import { createJSONStorage, persist } from "zustand/middleware";
import { searchParamsStorage } from "./searchParams";

const emptyModel: Model = {
  project: "New project",
  part: "",
  author: "",
  date: new Date().getUTCDate().toString(),
  wall: {
    height: 3000,
    thickness: 300,
  },
  foundation: {
    left: 500,
    right: 800,
    thickness: 300,
  },
  slab: {
    thickness: 300,
    angle: 10,
  },
  materials: [
    {
      id: "bacf7a0a-c6af-428e-b946-5c7809b51dab",
      name: "Sand",
      weight: 18,
      phi: 35,
      alpha: 0,
    },
  ],
  groundLeft: [
    {
      thickness: 1500,
      materialId: "bacf7a0a-c6af-428e-b946-5c7809b51dab",
    },
  ],
  groundRight: [
    {
      thickness: 2000,
      materialId: "bacf7a0a-c6af-428e-b946-5c7809b51dab",
    },
    {
      thickness: 1000,
      materialId: "bacf7a0a-c6af-428e-b946-5c7809b51dab",
    },
  ],
  gammaDL: 1.15,
  gammaLL: 1.5,
  gammaGdst: 1.1,
  gammaGstb: 0.9,
  liveLoad: 5,
};

export const useModel = create<Model>()(
  persist(() => emptyModel, {
    name: "model",
    storage: createJSONStorage(() => searchParamsStorage),
  }),
);

// Materials
export const addMaterial = (material: GroundMaterial) => {
  useModel.setState((state) => ({
    ...state,
    materials: [...state.materials, material],
  }));
};

export const removeMaterial = (materialId: string) => {
  useModel.setState((state) => ({
    ...state,
    materials: state.materials.filter((m) => m.id !== materialId),
  }));
};

// Geometry
export const setWallHeight = (height: number) => {
  useModel.setState((state) => ({
    ...state,
    wall: {
      ...state.wall,
      height,
    },
  }));
};

export const setWallThickness = (thickness: number) => {
  useModel.setState((state) => ({
    ...state,
    wall: {
      ...state.wall,
      thickness,
    },
  }));
};

export const setFoundationLeft = (left: number) => {
  useModel.setState((state) => ({
    ...state,
    foundation: {
      ...state.foundation,
      left,
    },
  }));
};

export const setFoundationRight = (right: number) => {
  useModel.setState((state) => ({
    ...state,
    foundation: {
      ...state.foundation,
      right,
    },
  }));
};

export const setFoundationThickness = (thickness: number) => {
  useModel.setState((state) => ({
    ...state,
    foundation: {
      ...state.foundation,
      thickness,
    },
  }));
};

export const setSlabThickness = (thickness: number) => {
  useModel.setState((state) => ({
    ...state,
    slab: {
      ...state.slab,
      thickness,
    },
  }));
};

export const setSlabAngle = (angle: number) => {
  useModel.setState((state) => ({
    ...state,
    slab: {
      ...state.slab,
      angle,
    },
  }));
};

// Loads

export const setLiveLoad = (liveLoad: number) => {
  useModel.setState((state) => ({
    ...state,
    liveLoad,
  }));
};

// Ground
export const setGroundThickness = (
  ground: "left" | "right",
  index: number,
  thickness: number,
) => {
  useModel.setState((state) => {
    const groundKey = ground === "left" ? "groundLeft" : "groundRight";
    const updatedGround = [...state[groundKey]];
    updatedGround[index] = {
      ...updatedGround[index],
      thickness,
    };
    return {
      ...state,
      [groundKey]: updatedGround,
    };
  });
};

export const setGroundMaterial = (
  ground: "left" | "right",
  index: number,
  materialId: string,
) => {
  useModel.setState((state) => {
    const groundKey = ground === "left" ? "groundLeft" : "groundRight";
    const updatedGround = [...state[groundKey]];
    updatedGround[index] = {
      ...updatedGround[index],
      materialId: materialId,
    };
    return {
      ...state,
      [groundKey]: updatedGround,
    };
  });
};
