import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Edges, PerspectiveCamera } from "@react-three/drei";
import { useModel } from "../modelStore";
import { AreaLoad } from "./AreaLoad";
import { cutGeometryByPart, cutGeometryByPlane } from "@/manifold";

// Z direction is up (common for engineering)
// World length unit is 1 mm (common for engineering)
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const concreteMaterial = new THREE.MeshStandardMaterial({
  color: "gray",
  transparent: true,
  opacity: 0.5,
});

const soilMaterial = new THREE.MeshStandardMaterial({
  color: "orange",
  transparent: true,
  opacity: 0.5,
});

export function ModelCanvas() {
  const model = useModel();

  const totalHeight = model.wall.height + model.foundation.thickness;
  const tanAlpha = Math.tan((model.slab.angle / 180) * Math.PI);

  const foundation = new THREE.BoxGeometry(
    1000,
    model.foundation.left + model.wall.thickness + model.foundation.right,
    model.foundation.thickness,
  );
  foundation.translate(
    0,
    (model.foundation.right - model.foundation.left) / 2,
    -totalHeight / 2 + model.foundation.thickness / 2,
  );

  const groundLeftTop: number[] = [];
  const groundLeftMiddle: number[] = [];
  const groundLeft: THREE.BufferGeometry[] = [];
  let current = 0;
  for (const layer of model.groundLeft) {
    current += layer.thickness / 2;
    groundLeftMiddle.push(current);
    current += layer.thickness / 2;
    groundLeftTop.push(current);

    const geometry = new THREE.BoxGeometry(1000, 2000, layer.thickness);
    geometry.translate(
      0,
      -1000 - model.wall.thickness / 2,
      -totalHeight / 2 + current - layer.thickness / 2,
    );
    groundLeft.push(cutGeometryByPart(geometry, foundation));
  }

  const groundRightTop: number[] = [];
  const groundRightMiddle: number[] = [];
  const groundRight: THREE.BufferGeometry[] = [];
  current = 0;
  let i = 0;
  for (const layer of model.groundRight) {
    current += layer.thickness / 2;
    groundRightMiddle.push(current);
    current += layer.thickness / 2;
    groundRightTop.push(current);

    const isTopLayer = i == model.groundRight.length - 1;
    const addHeight = isTopLayer ? 2000 * tanAlpha : 0;

    const geometry = new THREE.BoxGeometry(
      1000,
      2000,
      layer.thickness + addHeight,
    );
    geometry.translate(
      0,
      1000 + model.wall.thickness / 2,
      -totalHeight / 2 + current - layer.thickness / 2 + addHeight / 2,
    );

    let g = cutGeometryByPart(geometry, foundation);

    if (isTopLayer) {
      // Construct a plane to cut the top layer with slope
      const planeMatrix = new THREE.Matrix4().makeRotationX(
        Math.atan(tanAlpha),
      );
      planeMatrix.setPosition(
        0,
        1000 + model.wall.thickness / 2,
        -totalHeight / 2 + current + addHeight / 2,
      );

      g = cutGeometryByPlane(g, planeMatrix);
    }
    groundRight.push(g);
    i++;
  }
  const rightTop = current;

  const slabBox = new THREE.BoxGeometry(1000, 2000, model.slab.thickness);
  const slabMatrix = new THREE.Matrix4().makeShear(0, 0, 0, tanAlpha, 0, 0);
  slabMatrix.setPosition(
    0,
    model.wall.thickness / 2 + 1000,
    -totalHeight / 2 + rightTop + model.slab.thickness / 2 + tanAlpha * 1000,
  );
  slabBox.applyMatrix4(slabMatrix);

  return (
    <Canvas>
      <ambientLight />
      <directionalLight position={[3, 0, 10]} />
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
      <mesh
        position={[0, 0, model.foundation.thickness / 2]}
        material={concreteMaterial}
      >
        <boxGeometry args={[1000, model.wall.thickness, model.wall.height]} />
        <Edges color="gray" />
      </mesh>
      {/* Foundation */}
      <mesh geometry={foundation} material={concreteMaterial}>
        <Edges color="gray" />
      </mesh>
      {/* Ground Slab */}
      <mesh geometry={slabBox} material={concreteMaterial}>
        <Edges color="gray" />
      </mesh>
      {/* Ground left */}
      {groundLeft.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={soilMaterial}>
          <Edges color="orange" />
        </mesh>
      ))}
      {/* Ground right */}
      {groundRight.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={soilMaterial}>
          <Edges color="orange" />
        </mesh>
      ))}
      <AreaLoad
        polygon={[
          {
            x: 500,
            y: model.wall.thickness / 2,
            z: -totalHeight / 2 + groundRightMiddle[0],
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
            z: -totalHeight / 2 + groundRightTop[0],
            value: 4,
          },
        ]}
        normal={{ x: 0, y: 1, z: 0 }}
      />
    </Canvas>
  );
}
