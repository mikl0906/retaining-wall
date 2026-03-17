import { Html } from "@react-three/drei";
import React from "react";
import * as THREE from "three";

export function HoverName({
  name,
  position,
  offset,
  children,
}: {
  name: string;
  position?: [number, number, number];
  offset?: [number, number, number];
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = React.useState(false);
  const rootRef = React.useRef<THREE.Group>(null);
  const measuredChildrenRef = React.useRef<THREE.Group>(null);
  const [autoPosition, setAutoPosition] = React.useState<
    [number, number, number]
  >([0, 0, 0]);

  const updateAutoPosition = React.useCallback(() => {
    if (position || !rootRef.current || !measuredChildrenRef.current) {
      return;
    }

    const bbox = new THREE.Box3().setFromObject(measuredChildrenRef.current);
    if (bbox.isEmpty()) {
      return;
    }

    const center = bbox.getCenter(new THREE.Vector3());
    rootRef.current.worldToLocal(center);
    setAutoPosition([center.x, center.y, center.z]);
  }, [position]);

  React.useLayoutEffect(() => {
    updateAutoPosition();
  }, [children, updateAutoPosition]);

  const basePosition = position ?? autoPosition;
  const labelPosition: [number, number, number] = offset
    ? [
        basePosition[0] + offset[0],
        basePosition[1] + offset[1],
        basePosition[2] + offset[2],
      ]
    : basePosition;

  return (
    <group
      ref={rootRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        updateAutoPosition();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <group ref={measuredChildrenRef}>{children}</group>
      {hovered && (
        <Html position={labelPosition} center className="pointer-events-none">
          <div className="px-2 bg-background/80 rounded-md border">{name}</div>
        </Html>
      )}
    </group>
  );
}
