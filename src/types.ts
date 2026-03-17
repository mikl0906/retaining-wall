import * as z from "zod";

const GroundMaterial = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number(), // kN/m³
  phi: z.number(), // angle of internal friction in degrees
});
export type GroundMaterial = z.infer<typeof GroundMaterial>;

const GroundLayer = z.object({
  thickness: z.number(), // height of this layer in mm
  materialId: z.string(), // id of the ground type from the list of grounds
});
export type GroundLayer = z.infer<typeof GroundLayer>;

export const Model = z.object({
  // Metadata
  name: z.string().default("Untitled model"),
  author: z.string().default(""),
  date: z.string().default(() => new Date().toISOString()),
  // Library
  materials: z.array(GroundMaterial),
  // Geometry
  wall: z.object({
    height: z.number(), // in mm
    thickness: z.number(), // in mm
  }),
  foundation: z.object({
    left: z.number(), // in mm
    right: z.number(), // in mm
    thickness: z.number(), // in mm
  }),
  slab: z.object({
    thickness: z.number(), // in mm
    angle: z.number(), // in degrees, positive means sloping upwards to the right
  }),
  groundLeft: z.array(GroundLayer),
  groundRight: z.array(GroundLayer),
  // Partial factors
  gammaGdst: z.number(), // Partial factor for destabilizing load
  gammaGstb: z.number(), // Partial factor for stabilizing load
  // Loads
  q_k: z.number(), // Live load in kN/m²
});
export type Model = z.infer<typeof Model>;

// Ground layer levels from the bottom to the top
export type LayerGeometry = {
  bottom: number;
  top: number;
}[];

// Diagram of ground pressure
// A list of pressures at the bottom and top of each layer, starting from the bottom layer to the top
export type Pressure = { bottom: number; top: number }[];
