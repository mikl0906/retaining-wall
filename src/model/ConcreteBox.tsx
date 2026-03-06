import { Edges } from "@react-three/drei";

export interface ConcreteBoxProps {
  height: number;
  width: number;
  offsetZ: number;
  offsetY: number;
}

export function ConcreteBox({
  height,
  width,
  offsetY,
  offsetZ,
}: ConcreteBoxProps) {
  return (
    <mesh position={[0, offsetY, offsetZ]}>
      <boxGeometry args={[1000, width, height]} />
      <meshStandardMaterial color="gray" />
      <Edges color="gray" />
    </mesh>
  );
}
