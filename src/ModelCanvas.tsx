import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Edges, PerspectiveCamera } from "@react-three/drei";
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
          width={2000}
          offsetY={-model.wall.thickness / 2 - 1000}
          offsetZ={-totalHeight / 2 + groundLeftHeights[index]}
        />
      ))}
      {/* Right ground layers */}
      {model.groundRight.map((_, index) => (
        <GroundLevel
          width={2000}
          offsetY={model.wall.thickness / 2 + 1000}
          offsetZ={-totalHeight / 2 + groundRightHeights[index]}
        />
      ))}
      <Load
        polygon={[
          new THREE.Vector3(
            500,
            model.wall.thickness / 2,
            -totalHeight / 2 + groundRightHeights[0],
          ),
          new THREE.Vector3(
            500,
            model.wall.thickness / 2,
            -totalHeight / 2 + model.foundation.thickness,
          ),
          new THREE.Vector3(
            -500,
            model.wall.thickness / 2,
            -totalHeight / 2 + model.foundation.thickness,
          ),
          new THREE.Vector3(
            -500,
            model.wall.thickness / 2,
            -totalHeight / 2 + groundRightHeights[0],
          ),
        ]}
        normal={new THREE.Vector3(0, 1, 0)}
        magnitude={1}
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
  polygon: THREE.Vector3[];
  normal: THREE.Vector3;
  magnitude: number;
}

const coneGeometry = new THREE.ConeGeometry(20, 100, 12);
coneGeometry.translate(0, -50, 0);
coneGeometry.rotateX(-Math.PI / 2);
const coneMaterial = new THREE.MeshStandardMaterial({ color: "green" });
const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);

function Load({ polygon, normal, magnitude }: LoadProps) {
  return (
    <group position={[1000, 0, 0]}>
      <primitive object={coneMesh} />
    </group>
  );
}

// interface LoadArrowProps {
//   magnitude: number;
// }

// function LoadArrow({ magnitude }: LoadArrowProps) {
//   return (
//     <group>
//       <primitive object={coneMesh} />
//       <mesh>

//       </mesh>
//     </group>
//   );
// }
