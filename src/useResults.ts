import { useMemo } from "react";
import { useModel } from "./modelStore";
import { computeResults } from "./results";

export const useResults = () => {
  const model = useModel();

  return useMemo(() => computeResults(model), [model]);
};
