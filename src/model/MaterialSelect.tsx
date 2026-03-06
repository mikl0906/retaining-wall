import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { GroundMaterial } from "@/types";

interface MaterialSelectProps {
  position: THREE.Vector3;
  value: GroundMaterial;
  options: GroundMaterial[];
  onChange: (value: GroundMaterial) => void;
}

export function MaterialSelect({
  position,
  value,
  options,
  onChange,
}: MaterialSelectProps) {
  return (
    <Html position={position} center>
      <select
        value={value.name}
        onChange={(e) =>
          onChange(options.find((option) => option.id === e.target.value)!)
        }
        className="px-2 py-1 bg-gray-900 rounded-md"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </Html>
  );
}
