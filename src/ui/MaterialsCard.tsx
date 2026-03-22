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
  setMaterials,
  updateMaterial,
  useModel,
} from "@/modelStore";
import { GripVertical, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { GroundMaterial } from "@/types";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { move } from "@dnd-kit/helpers";

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
        <DragDropProvider
          onDragEnd={(e) => {
            setMaterials(move(materials, e));
          }}
          modifiers={[RestrictToVerticalAxis]}
        >
          <div className="flex flex-col gap-2">
            {materials.map((material, index) => (
              <MaterialItem
                key={material.id}
                material={material}
                index={index}
              />
            ))}
          </div>
        </DragDropProvider>
      </CardContent>
    </Card>
  );
}

function MaterialItem({
  material,
  index,
}: {
  material: GroundMaterial;
  index: number;
}) {
  const { ref, handleRef } = useSortable({
    id: material.id,
    index: index,
  });

  const handleRemoveMaterial = (id: string) => {
    removeMaterial(id);
  };

  return (
    <div
      ref={ref}
      className="grid grid-cols-[1.5rem_1fr_4.5rem_4.5rem_2rem] gap-2 items-center"
    >
      <GripVertical
        ref={handleRef}
        className="cursor-grab text-muted-foreground w-5 h-5 mx-auto"
      />
      <Input
        value={material.name}
        onChange={(e) => updateMaterial(material.id, { name: e.target.value })}
      />
      <Input
        type="number"
        value={material.weight}
        onChange={(e) =>
          updateMaterial(material.id, {
            weight: Number(e.target.value),
          })
        }
      />
      <Input
        type="number"
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
  );
}
