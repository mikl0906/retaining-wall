import { useModel } from "@/modelStore";
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
            Permanent load γ<sub>g</sub>
          </p>
          <Input className="w-25" value={model.gammaDL} />
          <p>
            Variable load γ<sub>q</sub>
          </p>
          <Input className="w-25" value={model.gammaLL} />
          <p>
            Destabilizing load γ<sub>dstb</sub>
          </p>
          <Input className="w-25" value={model.gammaGdst} />
          <p>
            Stabilizing load γ<sub>stb</sub>
          </p>
          <Input className="w-25" value={model.gammaGstb} />
        </div>
      </CardContent>
    </Card>
  );
}
