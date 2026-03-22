import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addMaterial,
  removeMaterial,
  updateMaterial,
  useModel,
} from "@/modelStore";
import { GripVertical, Plus } from "lucide-react";
import { SortableList, SortableListItem } from "./SortableList";
import { Input } from "@/components/ui/input";

export function MaterialsCard() {
  const materials = useModel((state) => state.materials);

  const handleAddMaterial = () => {
    addMaterial({
      id: crypto.randomUUID(),
      name: "New material",
      weight: 18,
      phi: 35,
    });
  };

  const handleRemoveMaterial = (id: string) => {
    removeMaterial(id);
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
        <div className="grid grid-cols-[1.5rem_1fr_4.5rem_4.5rem_2rem] gap-2 mb-2 px-1 text-sm font-medium text-muted-foreground">
          <div></div>
          <div>Name</div>
          <div className="text-center" title="Weight">
            γ, kN/m³
          </div>
          <div className="text-center" title="Friction angle">
            φ', °
          </div>
          <div></div>
        </div>
        <SortableList ids={materials.map((m) => m.id)}>
          <div className="flex flex-col gap-2">
            {materials.map((material) => (
              <SortableListItem key={material.id} id={material.id}>
                <div className="grid grid-cols-[1.5rem_1fr_4.5rem_4.5rem_2rem] gap-2 items-center">
                  <GripVertical className="cursor-grab text-muted-foreground w-5 h-5 mx-auto" />
                  <Input
                    className="h-8"
                    value={material.name}
                    onChange={(e) =>
                      updateMaterial(material.id, { name: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    className="h-8"
                    value={material.weight}
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        weight: Number(e.target.value),
                      })
                    }
                  />
                  <Input
                    type="number"
                    className="h-8"
                    value={material.phi}
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        phi: Number(e.target.value),
                      })
                    }
                  />
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => handleRemoveMaterial(material.id)}
                  >
                    <Plus className="rotate-45" />
                  </Button>
                </div>
              </SortableListItem>
            ))}
          </div>
        </SortableList>
      </CardContent>
    </Card>
  );
}
