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
    height: z.number().default(3000), // in mm
    thickness: z.number().default(300), // in mm
  }),
  foundation: z.object({
    left: z.number().default(500), // in mm
    right: z.number().default(800), // in mm
    thickness: z.number().default(300), // in mm
  }),
  slab: z.object({
    thickness: z.number().default(300), // in mm
    angle: z.number().default(10), // in degrees, positive means sloping upwards to the right
  }),
  groundLeft: z.array(GroundLayer),
  groundRight: z.array(GroundLayer),
  // Partial factors
  gammaGdst: z.number().default(1.1), // Partial factor for destabilizing load
  gammaGstb: z.number().default(0.9), // Partial factor for stabilizing load
  gammaRh: z.number().default(1.1), // Partial factor for sliding resistance
  // Loads
  q_k: z.number().default(5), // Live load in kN/m²
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
