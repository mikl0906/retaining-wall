import * as THREE from "three";
import { Instance, Instances, Line } from "@react-three/drei";
import { NumberInput } from "./NumberInput";

const arrowMinLength = 80;
const arrowScale = 30;
const arrowSpacing = 300;

const coneGeometry = new THREE.ConeGeometry(20, 80, 12);
coneGeometry.translate(0, -40, 0);
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
  color?: string;
  onChange?: (value: number) => void;
}

export function AreaLoad({
  polygon,
  normal,
  color = "green",
  onChange,
}: AreaLoadProps) {
  if (polygon.length < 3) return null;

  const origin = new THREE.Vector3().copy(polygon[0]);
  const dir = new THREE.Vector3().copy(polygon[1]).sub(origin).normalize();
  const axisY = new THREE.Vector3().crossVectors(normal, dir).normalize();
  const axisX = new THREE.Vector3().crossVectors(axisY, normal).normalize();
  const axisZ = new THREE.Vector3().crossVectors(axisX, axisY).normalize();

  const localPolygon = polygon.map((p) => {
    const localPoint = new THREE.Vector3().copy(p).sub(origin);
    return new THREE.Vector3(
      localPoint.dot(axisX),
      localPoint.dot(axisY),
      localPoint.dot(axisZ),
    );
  });

  const rotation = new THREE.Euler().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(axisX, axisY, axisZ),
  );
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
  const topPolygonAverage = topPolygon
    .reduce((acc, p) => acc.add(p), new THREE.Vector3())
    .divideScalar(topPolygon.length);
  topPolygon.push(topPolygon[0]);

  const arrows: {
    position: THREE.Vector3;
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
        position: point,
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

  const minValue = Math.min(...polygon.map((p) => p.value));
  const maxValue = Math.max(...polygon.map((p) => p.value));
  const value =
    maxValue - minValue > 0.1
      ? `${minValue.toFixed(1)}...${maxValue.toFixed(1)}`
      : `${maxValue.toFixed(1)}`;

  return (
    <group position={origin} rotation={rotation}>
      <Instances geometry={coneGeometry} count={arrows.length}>
        <meshStandardMaterial color={color} />
        {arrows.map((arrow, i) => (
          <Instance key={i} position={arrow.position} />
        ))}
      </Instances>
      <Line points={arrowLines} color={color} segments />
      <Line points={topPolygon} color={color} />
      <NumberInput
        position={topPolygonAverage}
        value={value}
        unit="kN/m²"
        onChange={onChange}
      />
    </group>
  );
}
