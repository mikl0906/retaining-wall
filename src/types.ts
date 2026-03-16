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
  name: z.string().default("Untitled model"),
  author: z.string().default(""),
  date: z.string().default(() => new Date().toISOString()),
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
  // Loads
  gammaDL: z.number(), // Partial factor for dead load
  gammaLL: z.number(), // Partial factor for live load
  gammaGdst: z.number(), // Partial factor for destabilizing load
  gammaGstb: z.number(), // Partial factor for stabilizing load
  q_k: z.number(), // Live load in kN/m²
  // Library
  materials: z.array(GroundMaterial),
  // Ground layers
  groundLeft: z.array(GroundLayer),
  groundRight: z.array(GroundLayer),
});
export type Model = z.infer<typeof Model>;
