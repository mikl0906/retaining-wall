import * as THREE from "three";
import { NumberInput } from "./NumberInput";

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
      <NumberInput
        position={center}
        value={length}
        unit="mm"
        onChange={onChange}
      />
    </>
  );
}
