import { useModel } from "@/modelStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";

export function ModelInfoCard() {
  const model = useModel();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[4rem_1fr] gap-2 items-center">
          <p>Name</p>
          <Input value={model.name} />
          <p>Author</p>
          <Input value={model.author} />
          <p>Date</p>
          <Input value={model.date} />
        </div>
      </CardContent>
    </Card>
  );
}
