import { Html } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const dimLine = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-0.5, -1, 0),
  new THREE.Vector3(-0.5, 0, 0),
  new THREE.Vector3(-0.5, 0, 0),
  new THREE.Vector3(0.5, 0, 0),
  new THREE.Vector3(0.5, 0, 0),
  new THREE.Vector3(0.5, -1, 0),
]);

const coneLeft = new THREE.ConeGeometry(20, 100, 12);
coneLeft.rotateZ(Math.PI / 2);
coneLeft.translate(50, 0, 0);

const coneRight = coneLeft.clone();
coneRight.rotateZ(Math.PI);

const coneMaterial = new THREE.MeshBasicMaterial({
  color: "magenta",
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
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const center = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)
    .addScaledVector(up, offset);
  const length = start.distanceTo(end);

  const xAxis = new THREE.Vector3().subVectors(end, start).normalize();
  const zAxis = new THREE.Vector3().crossVectors(xAxis, up).normalize();
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

  const euler = new THREE.Euler().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis),
  );

  function startEditing() {
    setInputValue(String(length));
    setError(false);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const num = parseFloat(inputValue);
    if (!isFinite(num) || num <= 0) {
      setError(true);
      return;
    }
    setEditing(false);
    onChange(num);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  }

  return (
    <>
      <group position={center} rotation={euler}>
        <lineSegments geometry={dimLine} scale={[length, offset, 1]}>
          <lineBasicMaterial color="magenta" />
        </lineSegments>
        <mesh
          geometry={coneLeft}
          position={[-length / 2, 0, 0]}
          material={coneMaterial}
        />
        <mesh
          geometry={coneRight}
          position={[length / 2, 0, 0]}
          material={coneMaterial}
        />
      </group>
      <Html position={center} center>
        {editing ? (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(false);
            }}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
            className={`w-16 min-w-0 px-2 bg-background rounded-md text-center outline-none border ${error ? "border-red-500" : "border-magenta-400"}`}
          />
        ) : (
          <div
            className="px-2 bg-background/50 rounded-md border text-nowrap cursor-pointer"
            onClick={startEditing}
          >
            {length} mm
          </div>
        )}
      </Html>
    </>
  );
}
