import { Html } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const ARC_SEGMENTS = 48;

// Cone: tip at origin, body extends in +X (arrow visually points in -X)
const coneStart = new THREE.ConeGeometry(20, 100, 12);
coneStart.rotateZ(Math.PI / 2);
coneStart.translate(50, 0, 0);

// Flipped cone: tip at origin, body extends in -X (arrow visually points in +X)
const coneEnd = coneStart.clone();
coneEnd.rotateZ(Math.PI);

const coneMaterial = new THREE.MeshBasicMaterial({
  color: "magenta",
  side: THREE.DoubleSide,
});

interface AngleDimensionProps {
  vertex: THREE.Vector3;
  from: THREE.Vector3;
  to: THREE.Vector3;
  radius: number;
  onChange: (degrees: number) => void;
}

export function AngleDimension({
  vertex,
  from,
  to,
  radius,
  onChange,
}: AngleDimensionProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fromDir = new THREE.Vector3().copy(from).normalize();
  const toDir = new THREE.Vector3().copy(to).normalize();
  const normal = new THREE.Vector3().crossVectors(fromDir, toDir).normalize();
  const angleRad = fromDir.angleTo(toDir);
  const angleDeg = Math.round(THREE.MathUtils.radToDeg(angleRad) * 100) / 100;

  const startPoint = vertex.clone().addScaledVector(fromDir, radius);
  const endPoint = vertex.clone().addScaledVector(toDir, radius);

  // Tangents used to orient arrowheads:
  // coneStart arrow points in -tangentStart → set tangentStart = normal × fromDir so arrow points outward
  const tangentStart = new THREE.Vector3()
    .crossVectors(normal, fromDir)
    .normalize();
  // coneEnd arrow points in +tangentEnd → set tangentEnd = toDir × normal so arrow points outward
  const tangentEnd = new THREE.Vector3()
    .crossVectors(toDir, normal)
    .normalize();

  const quatStart = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(-1, 0, 0),
    tangentStart,
  );
  const quatEnd = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(1, 0, 0),
    tangentEnd,
  );

  // Extract primitives so useMemo captures only stable scalar values
  const [fx, fy, fz] = [from.x, from.y, from.z];
  const [tx, ty, tz] = [to.x, to.y, to.z];
  const [vx, vy, vz] = [vertex.x, vertex.y, vertex.z];

  // Arc + arm lines in a single geometry
  const geometry = useMemo(() => {
    const v = new THREE.Vector3(vx, vy, vz);
    const fDir = new THREE.Vector3(fx, fy, fz).normalize();
    const tDir = new THREE.Vector3(tx, ty, tz).normalize();
    const n = new THREE.Vector3().crossVectors(fDir, tDir).normalize();
    const aRad = fDir.angleTo(tDir);

    const points: THREE.Vector3[] = [];

    // Arc (pairs of connected segments)
    for (let i = 0; i < ARC_SEGMENTS; i++) {
      const a0 = (i / ARC_SEGMENTS) * aRad;
      const a1 = ((i + 1) / ARC_SEGMENTS) * aRad;
      const q0 = new THREE.Quaternion().setFromAxisAngle(n, a0);
      const q1 = new THREE.Quaternion().setFromAxisAngle(n, a1);
      points.push(
        v.clone().addScaledVector(fDir.clone().applyQuaternion(q0), radius),
        v.clone().addScaledVector(fDir.clone().applyQuaternion(q1), radius),
      );
    }

    // Arm lines from vertex to arc endpoints
    points.push(
      v.clone(),
      v.clone().addScaledVector(fDir, radius),
      v.clone(),
      v.clone().addScaledVector(tDir, radius),
    );

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [fx, fy, fz, tx, ty, tz, vx, vy, vz, radius]);

  // Label position: arc midpoint offset slightly outward
  const midQuat = new THREE.Quaternion().setFromAxisAngle(normal, angleRad / 2);
  const labelPos = vertex
    .clone()
    .addScaledVector(fromDir.clone().applyQuaternion(midQuat), radius + 150);

  function startEditing() {
    setInputValue(String(angleDeg));
    setError(false);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const num = parseFloat(inputValue);
    if (!isFinite(num)) {
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
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="magenta" />
      </lineSegments>
      <mesh
        geometry={coneStart}
        position={startPoint}
        quaternion={quatStart}
        material={coneMaterial}
      />
      <mesh
        geometry={coneEnd}
        position={endPoint}
        quaternion={quatEnd}
        material={coneMaterial}
      />
      <Html position={labelPos} center>
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
            className={`w-16 min-w-0 px-2 bg-gray-900 rounded-md text-center text-white outline-none border ${
              error ? "border-red-500" : "border-magenta-400"
            }`}
          />
        ) : (
          <div
            className="px-2 bg-gray-900 rounded-md text-nowrap cursor-pointer hover:bg-gray-700"
            onClick={startEditing}
          >
            {angleDeg}°
          </div>
        )}
      </Html>
    </>
  );
}
