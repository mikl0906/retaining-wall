import React from "react";
import * as THREE from "three";
import { useCursor } from "@react-three/drei";
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

const DRAG_SNAP = 50; // mm
const MIN_LENGTH = 50; // mm

interface DimensionLineProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  up: THREE.Vector3;
  offset: number;
  title?: string;
  /** Which cones can be dragged; "end" keeps the start cone static
      (e.g. ground layers, which only grow from their top), "start"
      keeps the end cone static */
  drag?: "both" | "start" | "end";
  onChange: (value: number) => void;
}

export function LineDimension({
  start,
  end,
  up,
  offset,
  title,
  drag = "both",
  onChange,
}: DimensionLineProps) {
  const [leftConeHovered, setLeftConeHovered] = React.useState(false);
  const [rightConeHovered, setRightConeHovered] = React.useState(false);
  useCursor(leftConeHovered || rightConeHovered);

  // Length and grabbed-cone position captured when a drag starts; the live
  // model updates during the drag, so deltas are taken against this snapshot
  const dragStart = React.useRef({
    length: 0,
    position: new THREE.Vector3(),
  });

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

  const leftConePosition = center
    .clone()
    .addScaledVector(xAxis, -length / 2);
  const rightConePosition = center.clone().addScaledVector(xAxis, length / 2);

  const handleDragStart = (origin: THREE.Vector3) => {
    dragStart.current.length = length;
    dragStart.current.position.copy(origin);
  };

  // Dragging a cone outwards along the dimension axis grows the dimension:
  // sign is -1 for the start-side cone and +1 for the end-side cone
  const applyDrag = (sign: 1 | -1, localMatrix: THREE.Matrix4) => {
    const conePosition = new THREE.Vector3().setFromMatrixPosition(localMatrix);
    const delta = conePosition.sub(dragStart.current.position).dot(xAxis);
    const newLength = Math.max(
      MIN_LENGTH,
      Math.round((dragStart.current.length + sign * delta) / DRAG_SNAP) *
        DRAG_SNAP,
    );
    if (newLength !== length) {
      onChange(newLength);
    }
  };

  return (
    <>
      <group position={center} rotation={euler}>
        <lineSegments geometry={dimLine} scale={[length, offset, 1]}>
          <lineBasicMaterial color="magenta" />
        </lineSegments>
      </group>
      {drag !== "end" ? (
        <DragControls
          autoTransform={false}
          matrix={new THREE.Matrix4().setPosition(leftConePosition)}
          axisDrag={xAxis}
          onHover={setLeftConeHovered}
          onDragStart={handleDragStart}
          onDrag={(localMatrix) => applyDrag(-1, localMatrix)}
        >
          <group rotation={euler}>
            <mesh
              geometry={coneLeft}
              material={leftConeHovered ? coneHighlightMaterial : coneMaterial}
            />
            <mesh position={[50, 0, 0]}>
              <sphereGeometry args={[70]} />
              <meshBasicMaterial color="white" transparent opacity={0} />
            </mesh>
          </group>
        </DragControls>
      ) : (
        <group position={leftConePosition} rotation={euler}>
          <mesh geometry={coneLeft} material={coneMaterial} />
        </group>
      )}
      {drag !== "start" ? (
        <DragControls
          autoTransform={false}
          matrix={new THREE.Matrix4().setPosition(rightConePosition)}
          axisDrag={xAxis}
          onHover={setRightConeHovered}
          onDragStart={handleDragStart}
          onDrag={(localMatrix) => applyDrag(1, localMatrix)}
        >
          <group rotation={euler}>
            <mesh
              geometry={coneRight}
              material={rightConeHovered ? coneHighlightMaterial : coneMaterial}
            />
            <mesh position={[-50, 0, 0]}>
              <sphereGeometry args={[70]} />
              <meshBasicMaterial color="white" transparent opacity={0} />
            </mesh>
          </group>
        </DragControls>
      ) : (
        <group position={rightConePosition} rotation={euler}>
          <mesh geometry={coneRight} material={coneMaterial} />
        </group>
      )}
      <NumberInput
        position={center}
        value={length}
        unit="mm"
        onValueChange={onChange}
        title={title}
      />
    </>
  );
}
