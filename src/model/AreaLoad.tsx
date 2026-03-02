import * as THREE from "three";
import { Line } from "@react-three/drei";

const arrowMinLength = 100;
const arrowScale = 100;
const arrowSpacing = 400;

const coneGeometry = new THREE.ConeGeometry(20, 100, 12);
coneGeometry.translate(0, -50, 0);
coneGeometry.rotateX(-Math.PI / 2);

interface AreaLoadProps {
  polygon: {
    x: number;
    y: number;
    z: number;
    value: number;
  }[];
  normal: {
    x: number;
    y: number;
    z: number;
  };
}

export function AreaLoad({ polygon, normal }: AreaLoadProps) {
  const origin = new THREE.Vector3().copy(polygon[0]);
  const axisX = new THREE.Vector3().copy(polygon[1]).sub(origin).normalize();
  const axisY = new THREE.Vector3().crossVectors(normal, axisX).normalize();
  const axisZ = new THREE.Vector3().crossVectors(axisX, axisY).normalize();

  const rotation = new THREE.Euler().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(axisX, axisY, axisZ),
  );

  const localPolygon = polygon.map((p) => {
    const localPoint = new THREE.Vector3().copy(p).sub(origin);
    return new THREE.Vector3(
      localPoint.dot(axisX),
      localPoint.dot(axisY),
      localPoint.dot(axisZ),
    );
  });

  const localNormal = new THREE.Vector3()
    .copy(normal)
    .applyQuaternion(new THREE.Quaternion().setFromEuler(rotation).invert());

  const topPolygon = localPolygon.map((p, i) =>
    p
      .clone()
      .addScaledVector(
        localNormal,
        arrowMinLength + polygon[i].value * arrowScale,
      ),
  );
  topPolygon.push(topPolygon[0]);

  const arrows: {
    p: THREE.Vector3;
    length: number;
  }[] = [];
  const arrowLines: THREE.Vector3[] = [];

  for (let i = 0; i < localPolygon.length; i++) {
    const p1 = localPolygon[i];
    const p2 = localPolygon[(i + 1) % localPolygon.length];
    const length = p1.distanceTo(p2);
    const segments = Math.ceil(length / arrowSpacing);
    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      const point = new THREE.Vector3().lerpVectors(p1, p2, t);
      const value1 = polygon[i].value;
      const value2 = polygon[(i + 1) % polygon.length].value;
      const value = value1 * (1 - t) + value2 * t;
      arrows.push({
        p: point,
        length: value,
      });
      arrowLines.push(
        point,
        point
          .clone()
          .addScaledVector(localNormal, arrowMinLength + value * arrowScale),
      );
    }
  }

  return (
    <group position={origin} rotation={rotation}>
      <axesHelper args={[100]} />
      {arrows.map((segment, index) => (
        <mesh key={index} geometry={coneGeometry} position={segment.p}>
          <meshStandardMaterial color="green" />
        </mesh>
      ))}
      <Line points={arrowLines} color={"green"} segments />
      <Line points={topPolygon} color={"green"} />
    </group>
  );
}
