import { Edges } from "@react-three/drei";
import * as THREE from "three";

interface GroundLevelProps {
  width: number;
  offsetZ: number;
  offsetY: number;
}

export function GroundLevel({ width, offsetY, offsetZ }: GroundLevelProps) {
  return (
    <mesh position={[0, offsetY, offsetZ]}>
      <planeGeometry args={[1000, width]} />
      <meshStandardMaterial
        color="brown"
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
      <Edges color="brown" />
    </mesh>
  );
}
