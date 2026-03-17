import React from "react";
import * as THREE from "three";
import { NumberInput } from "./NumberInput";
import { DragControls } from "./DragControls";

const dimLine = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-0.5, -1, 0),
  new THREE.Vector3(-0.5, 0, 0),
  new THREE.Vector3(-0.5, 0, 0),
  new THREE.Vector3(0.5, 0, 0),
  new THREE.Vector3(0.5, 0, 0),
  new THREE.Vector3(0.5, -1, 0),
]);

const coneLeft = new THREE.ConeGeometry(20, 80, 12);
coneLeft.rotateZ(Math.PI / 2);
coneLeft.translate(40, 0, 0);

const coneRight = coneLeft.clone();
coneRight.rotateZ(Math.PI);

const coneMaterial = new THREE.MeshBasicMaterial({
  color: "magenta",
  side: THREE.DoubleSide,
});

const coneHighlightMaterial = new THREE.MeshBasicMaterial({
  color: "white",
  side: THREE.DoubleSide,
});

interface DimensionLineProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  up: THREE.Vector3;
  offset: number;
  onChange: (value: number) => void;
}

export function LineDimension({
  start,
  end,
  up,
  offset,
  onChange,
}: DimensionLineProps) {
  const [leftConeHovered, setLeftConeHovered] = React.useState(false);
  const [rightConeHovered, setRightConeHovered] = React.useState(false);

  const center = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)
    .addScaledVector(up, offset);
  const length = start.distanceTo(end);

  const xAxis = new THREE.Vector3().subVectors(end, start).normalize();
  const zAxis = new THREE.Vector3().crossVectors(xAxis, up).normalize();
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

  const matrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
  const euler = new THREE.Euler().setFromRotationMatrix(matrix);

  return (
    <>
      <group position={center} rotation={euler}>
        <lineSegments geometry={dimLine} scale={[length, offset, 1]}>
          <lineBasicMaterial color="magenta" />
        </lineSegments>
        <DragControls
          autoTransform
          onHover={(hovered) => setLeftConeHovered(hovered)}
          axisDrag="x"
        >
          <mesh
            geometry={coneLeft}
            position={[-length / 2, 0, 0]}
            material={leftConeHovered ? coneHighlightMaterial : coneMaterial}
          />
          <mesh position={[-length / 2 + 50, 0, 0]}>
            <sphereGeometry args={[70]} />
            <meshBasicMaterial color="white" transparent opacity={0} />
          </mesh>
        </DragControls>
        <DragControls
          autoTransform
          onHover={(hovered) => setRightConeHovered(hovered)}
          axisDrag="x"
        >
          <mesh
            geometry={coneRight}
            position={[length / 2, 0, 0]}
            material={rightConeHovered ? coneHighlightMaterial : coneMaterial}
          />
          <mesh position={[length / 2 - 50, 0, 0]}>
            <sphereGeometry args={[70]} />
            <meshBasicMaterial color="white" transparent opacity={0} />
          </mesh>
        </DragControls>
      </group>
      <NumberInput
        position={center}
        value={length}
        unit="mm"
        onChange={onChange}
      />
    </>
  );
}
