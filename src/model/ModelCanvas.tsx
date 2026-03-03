import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Edges, PerspectiveCamera } from "@react-three/drei";
import { useModel } from "../modelStore";
import { ConcreteBox } from "./ConcreteBox";
import { AreaLoad } from "./AreaLoad";

// Z direction is up (common for engineering)
// World length unit is 1 mm (common for engineering)
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

export function ModelCanvas() {
  const model = useModel();

  const totalHeight = model.wall.height + model.foundation.thickness;

  const groundLeftHeights: number[] = [];
  let current = 0;
  for (const layer of model.groundLeft) {
    current += layer.thickness;
    groundLeftHeights.push(current);
  }

  const groundRightHeights: number[] = [];
  current = 0;
  for (const layer of model.groundRight) {
    current += layer.thickness;
    groundRightHeights.push(current);
  }

  const groundLeftLevels: number[] = [];
  current = 0;
  for (const layer of model.groundLeft) {
    current += layer.thickness / 2;
    groundLeftLevels.push(current);
    current += layer.thickness / 2;
  }

  const groundRightLevels: number[] = [];
  current = 0;
  for (const layer of model.groundRight) {
    current += layer.thickness / 2;
    groundRightLevels.push(current);
    current += layer.thickness / 2;
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
        minDistance={2000}
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
      {model.groundLeft.map((layer, index) => (
        <mesh
          position={[
            0,
            -1000 - model.wall.thickness / 2,
            -totalHeight / 2 + groundLeftLevels[index],
          ]}
          key={index}
        >
          <boxGeometry args={[1000, 2000, layer.thickness]} />
          <meshStandardMaterial color={"brown"} transparent opacity={0.5} />
          <Edges color="brown" />
        </mesh>
      ))}
      {model.groundRight.map((layer, index) => (
        <mesh
          position={[
            0,
            1000 + model.wall.thickness / 2,
            -totalHeight / 2 + groundRightLevels[index],
          ]}
          key={index}
        >
          <boxGeometry args={[1000, 2000, layer.thickness]} />
          <meshStandardMaterial color={"brown"} transparent opacity={0.5} />
          <Edges color="brown" />
        </mesh>
      ))}
      <AreaLoad
        polygon={[
          {
            x: 500,
            y: model.wall.thickness / 2,
            z: -totalHeight / 2 + groundRightLevels[0],
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
