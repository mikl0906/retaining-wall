import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function ResultsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <p className="flex-1">Overturn</p>
            <p className="text-green-500">86%</p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="flex-1">Sliding</p>
            <p className="text-green-500">72%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
