import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addMaterial, useModel } from "@/modelStore";
import { Plus } from "lucide-react";

export function MaterialsCard() {
  const model = useModel();

  const handleAddMaterial = () => {
    addMaterial({
      id: crypto.randomUUID(),
      name: "New material",
      weight: 18,
      phi: 35,
      alpha: 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ground materials</CardTitle>
        <CardAction>
          <Button size="sm" variant="outline" onClick={handleAddMaterial}>
            <Plus />
            Add
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>g, kN/m³</TableHead>
              <TableHead>φ, deg</TableHead>
              <TableHead>α, deg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.materials.map((ground) => (
              <TableRow key={ground.id}>
                <TableCell>{ground.name}</TableCell>
                <TableCell>{ground.weight}</TableCell>
                <TableCell>{ground.phi}</TableCell>
                <TableCell>{ground.alpha}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
