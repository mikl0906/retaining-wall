import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  CameraControls,
  Edges,
  Line,
  PerspectiveCamera,
} from "@react-three/drei";
import { useModel } from "./modelStore";

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

export function ModelCanvas() {
  const model = useModel();

  const totalHeight = model.wall.height + model.foundation.thickness;

  const groundLeftHeights: number[] = [];
  let currentHeight = 0;
  for (const layer of model.groundLeft) {
    currentHeight += layer.thickness;
    groundLeftHeights.push(currentHeight);
  }

  const groundRightHeights: number[] = [];
  currentHeight = 0;
  for (const layer of model.groundRight) {
    currentHeight += layer.thickness;
    groundRightHeights.push(currentHeight);
  }

  return (
    <Canvas>
      <ambientLight />
      <directionalLight position={[3, 10, 0]} />
      <PerspectiveCamera makeDefault position={5000} near={1} far={10000000} />
      <axesHelper args={[1000]} />
      <CameraControls
        makeDefault
        truckSpeed={0}
        dollySpeed={3}
        minDistance={500}
        maxDistance={20000}
        draggingSmoothTime={0.1}
      />
      {/* Wall */}
      <ConcreteBox
        height={model.wall.height}
        width={model.wall.thickness}
        offsetY={0}
        offsetZ={totalHeight / 2 - model.wall.height / 2}
      />
      {/* Foundation */}
      <ConcreteBox
        height={model.foundation.thickness}
        width={
          model.foundation.left + model.wall.thickness + model.foundation.right
        }
        offsetY={(model.foundation.right - model.foundation.left) / 2}
        offsetZ={-totalHeight / 2 + model.foundation.thickness / 2}
      />
      {/* Ground Slab */}
      <mesh
        position={[
          0,
          model.wall.thickness / 2 + 1000,
          groundRightHeights[groundRightHeights.length - 1] +
            model.groundSlab.thickness / 2 -
            totalHeight / 2,
        ]}
        rotation={new THREE.Euler().setFromVector3(
          new THREE.Vector3((model.groundSlab.angle / 180) * Math.PI, 0, 0),
        )}
      >
        <boxGeometry args={[1000, 2000, model.groundSlab.thickness]} />
        <meshStandardMaterial color="gray" transparent opacity={0.5} />
        <Edges color="gray" />
      </mesh>
      {/* Bottol ground levels */}
      <GroundLevel
        width={model.wall.thickness + 4000}
        offsetY={0}
        offsetZ={-totalHeight / 2}
      />
      {/* Left ground layers */}
      {model.groundLeft.map((_, index) => (
        <GroundLevel
          key={index}
          width={2000}
          offsetY={-model.wall.thickness / 2 - 1000}
          offsetZ={-totalHeight / 2 + groundLeftHeights[index]}
        />
      ))}
      {/* Right ground layers */}
      {model.groundRight.map((_, index) => (
        <GroundLevel
          key={index}
          width={2000}
          offsetY={model.wall.thickness / 2 + 1000}
          offsetZ={-totalHeight / 2 + groundRightHeights[index]}
        />
      ))}
      <AreaLoad
        polygon={[
          {
            x: 500,
            y: model.wall.thickness / 2,
            z: -totalHeight / 2 + groundRightHeights[0],
            value: 1,
          },
          {
            x: 500,
            y: model.wall.thickness / 2,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
          {
            x: -500,
            y: model.wall.thickness / 2,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 3,
          },
          {
            x: -500,
            y: model.wall.thickness / 2,
            z: -totalHeight / 2 + groundRightHeights[0],
            value: 4,
          },
        ]}
        normal={{ x: 0, y: 1, z: 0 }}
      />
    </Canvas>
  );
}

interface ConcreteBoxProps {
  height: number;
  width: number;
  offsetZ: number;
  offsetY: number;
}

function ConcreteBox({ height, width, offsetY, offsetZ }: ConcreteBoxProps) {
  return (
    <mesh position={[0, offsetY, offsetZ]}>
      <boxGeometry args={[1000, width, height]} />
      <meshStandardMaterial color="gray" transparent opacity={0.5} />
      <Edges color="gray" />
    </mesh>
  );
}

interface GroundLevelProps {
  width: number;
  offsetZ: number;
  offsetY: number;
}

function GroundLevel({ width, offsetY, offsetZ }: GroundLevelProps) {
  return (
    <mesh position={[0, offsetY, offsetZ]}>
      <planeGeometry args={[1000, width]} />
      <meshStandardMaterial
        color="brown"
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
      <Edges color="brown" />
    </mesh>
  );
}

interface LoadProps {
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

const arrowMinLength = 100;
const arrowScale = 100;
const arrowSpacing = 400;

const coneGeometry = new THREE.ConeGeometry(20, 100, 12);
coneGeometry.translate(0, -50, 0);
coneGeometry.rotateX(-Math.PI / 2);

function AreaLoad({ polygon, normal }: LoadProps) {
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
