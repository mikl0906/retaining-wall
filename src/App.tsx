import { Download, Plus, Printer, Upload } from "lucide-react";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import { ButtonGroup } from "./components/ui/button-group";
import { ModelCanvas } from "./ModelCanvas";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModel } from "./modelStore";
import { Input } from "./components/ui/input";

export function App() {
  return (
    <ThemeProvider>
      <div className="absolute w-full h-full">
        <ModelCanvas />
      </div>
      <div className="absolute top-4 left-4 min-w-80 flex flex-col gap-4">
        <Menu />
        <Materials />
        <Loads />
        <Results />
      </div>
    </ThemeProvider>
  );
}

function Menu() {
  return (
    <ButtonGroup>
      <Button variant="outline">
        <Upload />
        Open
      </Button>
      <Button variant="outline">
        <Download />
        Save
      </Button>
      <Button variant="outline">
        <Printer />
        Print
      </Button>
    </ButtonGroup>
  );
}

function Materials() {
  const model = useModel();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ground materials</CardTitle>
        <CardAction>
          <Button size="sm" variant="outline">
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

function Loads() {
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

function Results() {
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
