import { useMemo } from "react";
import { useModel } from "./modelStore";

export const useGeometry = () => {
  const model = useModel();

  return useMemo(() => {
    return {
      wallHeight: model.wall.height,
    };
  }, [model]);
};
