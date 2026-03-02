import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";

export function LoadsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <p className="flex-1">
              Dead load factor γ<sub>DL</sub>
            </p>
            <Input className="w-30" placeholder="Value" />
          </div>
          <div className="flex gap-2 items-center">
            <p className="flex-1">
              Live load factor γ<sub>LL</sub>
            </p>
            <Input className="w-30" placeholder="Value" />
          </div>
          <div className="flex gap-2 items-center">
            <p className="flex-1">Live load q</p>
            <Input className="w-30" placeholder="Value" />
            <p>
              kN / m<sup>2</sup>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
