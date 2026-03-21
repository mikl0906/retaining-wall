import * as THREE from "three";
import { Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { removeGroundLayer, setGroundMaterial, useModel } from "@/modelStore";

interface MaterialSelectProps {
  position: THREE.Vector3;
  groundLocation: "left" | "right";
  layerIndex: number;
}

export function GroundLayerLabel({
  position,
  groundLocation,
  layerIndex,
}: MaterialSelectProps) {
  const layers = useModel((state) =>
    groundLocation === "left" ? state.groundLeft : state.groundRight,
  );
  const layer = layers[layerIndex];
  const materials = useModel((state) => state.materials);
  const material = materials.find((m) => m.id === layer.materialId)!;

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMaterial = materials.find((m) => m.id === e.target.value);
    if (selectedMaterial) {
      setGroundMaterial(groundLocation, layerIndex, selectedMaterial.id);
    }
  };

  const handleRemoveLayer = () => {
    removeGroundLayer(groundLocation, layerIndex);
  };

  return (
    <Html position={position} center className="flex gap-1">
      <select
        value={material.id}
        onChange={handleMaterialChange}
        className="px-2 bg-background/80 rounded-md border"
        title="Change material"
      >
        {materials.map((material) => (
          <option key={material.id} value={material.id}>
            {material.name}
          </option>
        ))}
      </select>
      <Button
        size="icon-sm"
        variant="destructive"
        title="Remove layer"
        onClick={handleRemoveLayer}
      >
        <Trash2 />
      </Button>
    </Html>
  );
}
