import { useResults } from "@/useResults";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const WARN_LEVEL = 0.85;

function UtilizationCheck({
  label,
  utilization,
  detail,
}: {
  label: string;
  utilization: number;
  detail: React.ReactNode;
}) {
  const finite = Number.isFinite(utilization);
  const ok = finite && utilization < 1;
  const warn = ok && utilization >= WARN_LEVEL;
  const barColor = !ok
    ? "bg-red-500"
    : warn
      ? "bg-amber-500"
      : "bg-green-500";
  const verdictColor = !ok
    ? "text-red-600 dark:text-red-400"
    : warn
      ? "text-amber-600 dark:text-amber-400"
      : "text-green-600 dark:text-green-500";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <p className="flex-1">{label}</p>
        <p className="font-medium tabular-nums">
          {finite ? `${Math.round(utilization * 100)}%` : "—"}
        </p>
        <p className={`w-13 text-right text-xs font-semibold ${verdictColor}`}>
          {ok ? "OK" : "Not OK"}
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{
            width: `${finite ? Math.min(100, utilization * 100) : 100}%`,
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">{detail}</p>
    </div>
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
        <div className="flex flex-col gap-4">
          <UtilizationCheck
            label="Overturning"
            utilization={overturning.utilization}
            detail={
              <>
                M<sub>dst</sub> {overturning.Mdst.toFixed(1)} / M<sub>stb</sub>{" "}
                {overturning.Mstb.toFixed(1)} kN·m/m
              </>
            }
          />
          <UtilizationCheck
            label="Sliding"
            utilization={sliding.utilization}
            detail={
              <>
                H<sub>d</sub> {sliding.Hd.toFixed(1)} / R<sub>d</sub>{" "}
                {sliding.Rd.toFixed(1)} kN/m
              </>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
