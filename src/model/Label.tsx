import React from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface LabelProps extends React.ComponentPropsWithoutRef<typeof Html> {
  position: THREE.Vector3 | [number, number, number];
  text: string;
  unit?: string;
  variant?: "primary" | "secondary";
}

export function Label({
  position,
  text,
  unit,
  variant = "primary",
  ...props
}: LabelProps) {
  return (
    <Html position={position} center {...props}>
      <div
        className={`px-2 rounded-md border text-nowrap ${variant === "primary" ? "bg-background/80" : "bg-background/30"}`}
      >
        {text}
        <span className="opacity-60"> {unit}</span>
      </div>
    </Html>
  );
}
