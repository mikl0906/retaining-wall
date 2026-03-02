import * as z from "zod";

const Wall = z.object({
  height: z.number(),
  thickness: z.number(),
});

const Foundation = z.object({
  left: z.number(),
  right: z.number(),
  thickness: z.number(),
});

const groundSlab = z.object({
  thickness: z.number(),
  angle: z.number(),
});

const GroundMaterial = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number(), // kN/m³
  phi: z.number(), // angle of internal friction in degrees
  alpha: z.number(), // degrees
});
export type GroundMaterial = z.infer<typeof GroundMaterial>;

const GroundLayer = z.object({
  thickness: z.number(), // height of this layer in mm
  groundId: z.string(), // id of the ground type from the list of grounds
});

const Model = z.object({
  name: z.string(),
  // Library
  materials: z.array(GroundMaterial),
  // Geometry
  wall: Wall,
  foundation: Foundation,
  groundSlab: groundSlab,
  groundLeft: z.array(GroundLayer),
  groundRight: z.array(GroundLayer),
  // Loads
  gammaDL: z.number(), // Partial factor for dead load
  gammaLL: z.number(), // Partial factor for live load
  gammaGdst: z.number(), // Partial factor for destabilizing load
  gammaGstb: z.number(), // Partial factor for stabilizing load
  liveLoad: z.number(), // Live load in kN/m²
});
export type Model = z.infer<typeof Model>;
