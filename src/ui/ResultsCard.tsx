import { useResults } from "@/useResults";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

function UtilizationValue({
  utilization,
  title,
}: {
  utilization: number;
  title: string;
}) {
  if (!Number.isFinite(utilization)) {
    return (
      <p className="text-red-500" title={title}>
        –
      </p>
    );
  }
  return (
    <p
      className={utilization < 1 ? "text-green-500" : "text-red-500"}
      title={title}
    >
      {Math.round(utilization * 100)}%
    </p>
  );
}

export function ResultsCard() {
  const { overturning, sliding } = useResults();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <p className="flex-1">Overturn</p>
            <UtilizationValue
              utilization={overturning.utilization}
              title={`Mdst = ${overturning.Mdst.toFixed(1)} kN·m/m, Mstb = ${overturning.Mstb.toFixed(1)} kN·m/m`}
            />
          </div>
          <div className="flex gap-2 items-center">
            <p className="flex-1">Sliding</p>
            <UtilizationValue
              utilization={sliding.utilization}
              title={`Hd = ${sliding.Hd.toFixed(1)} kN/m, Rd = ${sliding.Rd.toFixed(1)} kN/m`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
