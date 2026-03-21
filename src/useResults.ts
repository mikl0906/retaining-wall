import { useMemo } from "react";
import { useModel } from "./modelStore";
import { computeGroundPressure } from "./groundPressure";
import { computeStabilizingMoment } from "./stability";

export const useResults = () => {
  const model = useModel();

  return useMemo(() => {
    const q_d = model.slab.thickness * 0.025 + model.q_k;

    const groundPressureLeft = computeGroundPressure(
      model.groundLeft,
      model.materials,
      0,
      0,
    );

    // const leftPassivePressureMoment = computePressureMoment(
    //   model.groundLeft,
    //   model.materials,
    // );

    const groundPressureRight = computeGroundPressure(
      model.groundRight,
      model.materials,
      model.slab.angle,
      q_d,
    );

    const stabilizingMoment = computeStabilizingMoment(model);

    // TODO: any other computations you want here
    // e.g. overturning checks

    return {
      q_d,
      groundPressureLeft,
      groundPressureRight,
      stabilizingMoment,
    };
  }, [model]);
};
