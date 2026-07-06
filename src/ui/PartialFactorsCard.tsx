import {
  setGammaGdst,
  setGammaGstb,
  setGammaQdst,
  setGammaRh,
  useModel,
} from "@/modelStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { NumberField } from "../components/number-field";

export function PartialFactorsCard() {
  const model = useModel();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partial factors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <p>
            Destabilizing load γ<sub>G,dst</sub>
          </p>
          <NumberField
            className="w-25"
            step={0.05}
            min={0.1}
            max={10}
            value={model.gammaGdst}
            onValueChange={setGammaGdst}
          />
          <p>
            Variable load γ<sub>Q,dst</sub>
          </p>
          <NumberField
            className="w-25"
            step={0.05}
            min={0.1}
            max={10}
            value={model.gammaQdst}
            onValueChange={setGammaQdst}
          />
          <p>
            Stabilizing load γ<sub>G,stb</sub>
          </p>
          <NumberField
            className="w-25"
            step={0.05}
            min={0.1}
            max={10}
            value={model.gammaGstb}
            onValueChange={setGammaGstb}
          />
          <p>
            Sliding resistance γ<sub>R,h</sub>
          </p>
          <NumberField
            className="w-25"
            step={0.05}
            min={0.1}
            max={10}
            value={model.gammaRh}
            onValueChange={setGammaRh}
          />
        </div>
      </CardContent>
    </Card>
  );
}
