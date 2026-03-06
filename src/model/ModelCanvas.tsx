import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Edges, PerspectiveCamera } from "@react-three/drei";
import {
  setFoundationLeft,
  setFoundationRight,
  setFoundationThickness,
  setGroundThickness,
  setSlabAngle,
  setSlabThickness,
  setWallHeight,
  setWallThickness,
  useModel,
} from "../modelStore";
import { cutGeometryByPart, cutGeometryByPlane } from "@/manifold";
import { LineDimension } from "./LineDimension";
import { AngleDimension } from "./AngleDimension";

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
  const leftEdge = -model.wall.thickness / 2 - model.foundation.left - 1000;
  const rightEdge = model.wall.thickness / 2 + model.foundation.right + 1000;
  const leftGroundWidth = model.foundation.left + 1000;
  const rightGroundWidth = model.foundation.right + 1000;

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

  const groundLeft: {
    bottom: number;
    top: number;
    middle: number;
    geometry: THREE.BufferGeometry;
  }[] = [];
  let bottom = 0;
  for (const layer of model.groundLeft) {
    const g = new THREE.BoxGeometry(1000, leftGroundWidth, layer.thickness);
    g.translate(
      0,
      leftEdge + leftGroundWidth / 2,
      -totalHeight / 2 + bottom + layer.thickness / 2,
    );
    groundLeft.push({
      bottom,
      top: bottom + layer.thickness,
      middle: bottom + layer.thickness / 2,
      geometry: cutGeometryByPart(g, foundation),
    });
    bottom += layer.thickness;
  }

  const groundRight: {
    bottom: number;
    top: number;
    middle: number;
    geometry: THREE.BufferGeometry;
  }[] = [];
  bottom = 0;
  let i = 0;
  for (const layer of model.groundRight) {
    const isTopLayer = i == model.groundRight.length - 1;
    const addHeight = isTopLayer ? rightGroundWidth * tanAlpha : 0;
    const g = new THREE.BoxGeometry(
      1000,
      rightGroundWidth,
      layer.thickness + addHeight,
    );
    g.translate(
      0,
      rightEdge - rightGroundWidth / 2,
      -totalHeight / 2 + bottom + layer.thickness / 2 + addHeight / 2,
    );
    let geometry = cutGeometryByPart(g, foundation);
    if (isTopLayer) {
      // Construct a plane to cut the top layer with slope
      const planeMatrix = new THREE.Matrix4().makeRotationX(
        Math.atan(tanAlpha),
      );
      planeMatrix.setPosition(
        0,
        rightEdge - rightGroundWidth / 2,
        -totalHeight / 2 + bottom + layer.thickness + addHeight / 2,
      );

      geometry = cutGeometryByPlane(geometry, planeMatrix);
    }
    groundRight.push({
      bottom,
      top: bottom + layer.thickness,
      middle: bottom + layer.thickness / 2,
      geometry,
    });
    bottom += layer.thickness;
    i++;
  }

  const slab = new THREE.BoxGeometry(
    1000,
    rightGroundWidth,
    model.slab.thickness,
  );
  const slabMatrix = new THREE.Matrix4().makeShear(0, 0, 0, tanAlpha, 0, 0);
  slabMatrix.setPosition(
    0,
    model.wall.thickness / 2 + rightGroundWidth / 2,
    -totalHeight / 2 +
      groundRight[groundRight.length - 1].top +
      model.slab.thickness / 2 +
      (tanAlpha * rightGroundWidth) / 2,
  );
  slab.applyMatrix4(slabMatrix);

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
      <mesh geometry={slab} material={concreteMaterial}>
        <Edges color="gray" />
      </mesh>
      {/* Ground left */}
      {groundLeft.map((ground, index) => (
        <mesh key={index} geometry={ground.geometry} material={soilMaterial}>
          <Edges color="orange" />
        </mesh>
      ))}
      {/* Ground right */}
      {groundRight.map((ground, index) => (
        <mesh key={index} geometry={ground.geometry} material={soilMaterial}>
          <Edges color="orange" />
        </mesh>
      ))}
      {/* <AreaLoad
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
      /> */}
      <LineDimension
        start={
          new THREE.Vector3(
            0,
            -model.wall.thickness / 2,
            -totalHeight / 2 + model.foundation.thickness,
          )
        }
        end={new THREE.Vector3(0, -model.wall.thickness / 2, totalHeight / 2)}
        up={new THREE.Vector3(0, -1, 0)}
        offset={200}
        onChange={setWallHeight}
      />
      <LineDimension
        start={new THREE.Vector3(0, -model.wall.thickness / 2, totalHeight / 2)}
        end={new THREE.Vector3(0, model.wall.thickness / 2, totalHeight / 2)}
        up={new THREE.Vector3(0, 0, 1)}
        offset={200}
        onChange={setWallThickness}
      />
      <LineDimension
        start={
          new THREE.Vector3(
            0,
            -model.wall.thickness / 2 - model.foundation.left,
            -totalHeight / 2,
          )
        }
        end={
          new THREE.Vector3(
            0,
            -model.wall.thickness / 2 - model.foundation.left,
            -totalHeight / 2 + model.foundation.thickness,
          )
        }
        up={new THREE.Vector3(0, -1, 0)}
        offset={200}
        onChange={setFoundationThickness}
      />
      <LineDimension
        start={
          new THREE.Vector3(
            0,
            -model.wall.thickness / 2 - model.foundation.left,
            -totalHeight / 2 + model.foundation.thickness,
          )
        }
        end={
          new THREE.Vector3(
            0,
            -model.wall.thickness / 2,
            -totalHeight / 2 + model.foundation.thickness,
          )
        }
        up={new THREE.Vector3(0, 0, 1)}
        offset={200}
        onChange={setFoundationLeft}
      />
      <LineDimension
        start={
          new THREE.Vector3(
            0,
            model.wall.thickness / 2,
            -totalHeight / 2 + model.foundation.thickness,
          )
        }
        end={
          new THREE.Vector3(
            0,
            model.wall.thickness / 2 + model.foundation.right,
            -totalHeight / 2 + model.foundation.thickness,
          )
        }
        up={new THREE.Vector3(0, 0, 1)}
        offset={200}
        onChange={setFoundationRight}
      />
      <LineDimension
        start={
          new THREE.Vector3(
            0,
            rightEdge,
            -totalHeight / 2 +
              groundRight[groundRight.length - 1].top +
              tanAlpha * rightGroundWidth,
          )
        }
        end={
          new THREE.Vector3(
            0,
            rightEdge,
            -totalHeight / 2 +
              groundRight[groundRight.length - 1].top +
              tanAlpha * rightGroundWidth +
              model.slab.thickness,
          )
        }
        up={new THREE.Vector3(0, 1, 0)}
        offset={200}
        onChange={setSlabThickness}
      />
      <AngleDimension
        vertex={
          new THREE.Vector3(
            0,
            model.wall.thickness / 2 + rightGroundWidth / 2,
            -totalHeight / 2 + groundRight[groundRight.length - 1].top,
          )
        }
        from={new THREE.Vector3(0, 1, 0)}
        to={new THREE.Vector3(0, 1, tanAlpha)}
        radius={200}
        onChange={setSlabAngle}
      />
      {groundLeft.map((ground, index) => (
        <LineDimension
          key={index}
          start={
            new THREE.Vector3(0, leftEdge, -totalHeight / 2 + ground.bottom)
          }
          end={new THREE.Vector3(0, leftEdge, -totalHeight / 2 + ground.top)}
          up={new THREE.Vector3(0, -1, 0)}
          offset={200}
          onChange={(v) => setGroundThickness("left", index, v)}
        />
      ))}
      {groundRight.map((ground, index) => (
        <LineDimension
          key={index}
          start={
            new THREE.Vector3(0, rightEdge, -totalHeight / 2 + ground.bottom)
          }
          end={new THREE.Vector3(0, rightEdge, -totalHeight / 2 + ground.top)}
          up={new THREE.Vector3(0, 1, 0)}
          offset={200}
          onChange={(v) => setGroundThickness("right", index, v)}
        />
      ))}
    </Canvas>
  );
}
