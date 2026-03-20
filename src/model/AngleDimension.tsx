import { useMemo } from "react";
import * as THREE from "three";
import { NumberInput } from "./NumberInput";

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
      <NumberInput
        position={labelPos}
        value={angleDeg}
        unit="°"
        onValueChange={onChange}
      />
    </>
  );
}
