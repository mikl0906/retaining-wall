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
import { Input } from "../components/ui/input";

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
          <Input
            className="w-25"
            type="number"
            step={0.05}
            value={model.gammaGdst}
            onChange={(e) => setGammaGdst(Number(e.target.value))}
          />
          <p>
            Variable load γ<sub>Q,dst</sub>
          </p>
          <Input
            className="w-25"
            type="number"
            step={0.05}
            value={model.gammaQdst}
            onChange={(e) => setGammaQdst(Number(e.target.value))}
          />
          <p>
            Stabilizing load γ<sub>G,stb</sub>
          </p>
          <Input
            className="w-25"
            type="number"
            step={0.05}
            value={model.gammaGstb}
            onChange={(e) => setGammaGstb(Number(e.target.value))}
          />
          <p>
            Sliding resistance γ<sub>R,h</sub>
          </p>
          <Input
            className="w-25"
            type="number"
            step={0.05}
            value={model.gammaRh}
            onChange={(e) => setGammaRh(Number(e.target.value))}
          />
        </div>
      </CardContent>
    </Card>
  );
}
