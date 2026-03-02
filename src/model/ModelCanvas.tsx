import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Edges, PerspectiveCamera } from "@react-three/drei";
import { useModel } from "../modelStore";
import { ConcreteBox } from "./ConcreteBox";
import { GroundLevel } from "./GroundLevel";
import { AreaLoad } from "./AreaLoad";

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
      <PerspectiveCamera
        makeDefault
        position={[7000, 2000, 2000]}
        near={1}
        far={10000000}
      />
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
            model.slab.thickness / 2 -
            totalHeight / 2,
        ]}
        rotation={new THREE.Euler().setFromVector3(
          new THREE.Vector3((model.slab.angle / 180) * Math.PI, 0, 0),
        )}
      >
        <boxGeometry args={[1000, 2000, model.slab.thickness]} />
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
