import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Edges, PerspectiveCamera } from "@react-three/drei";
import {
  setFoundationLeft,
  setFoundationRight,
  setFoundationThickness,
  setGroundMaterial,
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
import React from "react";
import { MaterialSelect } from "./MaterialSelect";
import { AreaLoad } from "./AreaLoad";
import { computeGroundPressure } from "@/groundPressure";

// Z direction is up (common for engineering)
// World length unit is 1 mm (common for engineering)
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const leftGroundFreeSpace = 1000;
const rightGroundFreeSpace = 1000;
const dimPlane = 500;

const concreteMaterial = new THREE.MeshStandardMaterial({
  color: "gray",
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
  const leftGroundWidth = model.foundation.left + leftGroundFreeSpace;
  const rightGroundWidth = model.foundation.right + rightGroundFreeSpace;
  const leftEdge = -model.wall.thickness / 2 - leftGroundWidth;
  const rightEdge = model.wall.thickness / 2 + rightGroundWidth;

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

  const leftGroundPressure = computeGroundPressure(
    model.groundLeft,
    model.materials,
    model.slab.angle,
    model.liveLoad,
  );
  console.log(leftGroundPressure);

  const rightGroundPressure = computeGroundPressure(
    model.groundRight,
    model.materials,
    model.slab.angle,
    model.liveLoad,
  );
  console.log(rightGroundPressure);

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
        dollySpeed={1}
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
      <LineDimension
        start={
          new THREE.Vector3(
            dimPlane,
            -model.wall.thickness / 2,
            -totalHeight / 2 + model.foundation.thickness,
          )
        }
        end={
          new THREE.Vector3(
            dimPlane,
            -model.wall.thickness / 2,
            totalHeight / 2,
          )
        }
        up={new THREE.Vector3(0, -1, 0)}
        offset={model.foundation.left + 300}
        onChange={setWallHeight}
      />
      <LineDimension
        start={
          new THREE.Vector3(
            dimPlane,
            -model.wall.thickness / 2,
            totalHeight / 2,
          )
        }
        end={
          new THREE.Vector3(dimPlane, model.wall.thickness / 2, totalHeight / 2)
        }
        up={new THREE.Vector3(0, 0, 1)}
        offset={200}
        onChange={setWallThickness}
      />
      {/* Foundation */}
      <mesh geometry={foundation} material={concreteMaterial}>
        <Edges color="gray" />
      </mesh>
      <LineDimension
        start={
          new THREE.Vector3(
            dimPlane,
            -model.wall.thickness / 2 - model.foundation.left,
            -totalHeight / 2,
          )
        }
        end={
          new THREE.Vector3(
            dimPlane,
            -model.wall.thickness / 2 - model.foundation.left,
            -totalHeight / 2 + model.foundation.thickness,
          )
        }
        up={new THREE.Vector3(0, -1, 0)}
        offset={300}
        onChange={setFoundationThickness}
      />
      <LineDimension
        start={
          new THREE.Vector3(
            dimPlane,
            -model.wall.thickness / 2 - model.foundation.left,
            -totalHeight / 2,
          )
        }
        end={
          new THREE.Vector3(
            dimPlane,
            -model.wall.thickness / 2,
            -totalHeight / 2,
          )
        }
        up={new THREE.Vector3(0, 0, 1)}
        offset={-200}
        onChange={setFoundationLeft}
      />
      <LineDimension
        start={
          new THREE.Vector3(
            dimPlane,
            model.wall.thickness / 2,
            -totalHeight / 2,
          )
        }
        end={
          new THREE.Vector3(
            dimPlane,
            model.wall.thickness / 2 + model.foundation.right,
            -totalHeight / 2,
          )
        }
        up={new THREE.Vector3(0, 0, 1)}
        offset={-200}
        onChange={setFoundationRight}
      />
      {/* Ground Slab */}
      <mesh geometry={slab} material={concreteMaterial}>
        <Edges color="gray" />
      </mesh>
      <LineDimension
        start={
          new THREE.Vector3(
            dimPlane,
            rightEdge,
            -totalHeight / 2 +
              groundRight[groundRight.length - 1].top +
              tanAlpha * rightGroundWidth,
          )
        }
        end={
          new THREE.Vector3(
            dimPlane,
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
            dimPlane,
            model.wall.thickness / 2 + rightGroundWidth / 2,
            -totalHeight / 2 + groundRight[groundRight.length - 1].top,
          )
        }
        from={new THREE.Vector3(0, 1, 0)}
        to={new THREE.Vector3(0, 1, tanAlpha)}
        radius={200}
        onChange={setSlabAngle}
      />
      {/* Ground left */}
      {groundLeft.map((ground, index) => (
        <React.Fragment key={index}>
          <mesh geometry={ground.geometry} material={soilMaterial}>
            <Edges color="orange" />
          </mesh>
          <LineDimension
            start={
              new THREE.Vector3(
                dimPlane,
                leftEdge,
                -totalHeight / 2 + ground.bottom,
              )
            }
            end={
              new THREE.Vector3(
                dimPlane,
                leftEdge,
                -totalHeight / 2 + ground.top,
              )
            }
            up={new THREE.Vector3(0, -1, 0)}
            offset={200}
            onChange={(v) => setGroundThickness("left", index, v)}
          />
          <MaterialSelect
            position={
              new THREE.Vector3(
                dimPlane,
                leftEdge + 400,
                -totalHeight / 2 + ground.middle,
              )
            }
            value={
              model.materials.find(
                (m) => m.id === model.groundLeft[index].materialId,
              )!
            }
            options={model.materials}
            onChange={(material) => {
              setGroundMaterial("left", index, material.id);
            }}
          />
          <AreaLoad
            polygon={[
              {
                x: 500,
                y: -model.wall.thickness / 2,
                z: Math.max(
                  -totalHeight / 2 + ground.bottom,
                  -totalHeight / 2 + model.foundation.thickness,
                ),
                value: 5,
              },
              {
                x: -500,
                y: -model.wall.thickness / 2,
                z: Math.max(
                  -totalHeight / 2 + ground.bottom,
                  -totalHeight / 2 + model.foundation.thickness,
                ),
                value: 5,
              },
              {
                x: -500,
                y: -model.wall.thickness / 2,
                z: -totalHeight / 2 + ground.top,
                value: 2,
              },
              {
                x: 500,
                y: -model.wall.thickness / 2,
                z: -totalHeight / 2 + ground.top,
                value: 2,
              },
            ]}
            normal={{ x: 0, y: -1, z: 0 }}
            color="orange"
          />
        </React.Fragment>
      ))}
      {/* Ground right */}
      {groundRight.map((ground, index) => (
        <React.Fragment key={index}>
          <mesh geometry={ground.geometry} material={soilMaterial}>
            <Edges color="orange" />
          </mesh>
          <LineDimension
            start={
              new THREE.Vector3(
                dimPlane,
                rightEdge,
                -totalHeight / 2 + ground.bottom,
              )
            }
            end={
              new THREE.Vector3(
                dimPlane,
                rightEdge,
                -totalHeight / 2 + ground.top,
              )
            }
            up={new THREE.Vector3(0, 1, 0)}
            offset={200}
            onChange={(v) => setGroundThickness("right", index, v)}
          />
          <MaterialSelect
            position={
              new THREE.Vector3(
                dimPlane,
                rightEdge - 400,
                -totalHeight / 2 + ground.middle,
              )
            }
            value={
              model.materials.find(
                (m) => m.id === model.groundRight[index].materialId,
              )!
            }
            options={model.materials}
            onChange={(material) => {
              setGroundMaterial("right", index, material.id);
            }}
          />
          <AreaLoad
            polygon={[
              {
                x: 500,
                y: model.wall.thickness / 2,
                z: Math.max(
                  -totalHeight / 2 + ground.bottom,
                  -totalHeight / 2 + model.foundation.thickness,
                ),
                value: 5,
              },
              {
                x: -500,
                y: model.wall.thickness / 2,
                z: Math.max(
                  -totalHeight / 2 + ground.bottom,
                  -totalHeight / 2 + model.foundation.thickness,
                ),
                value: 5,
              },
              {
                x: -500,
                y: model.wall.thickness / 2,
                z: -totalHeight / 2 + ground.top,
                value: 2,
              },
              {
                x: 500,
                y: model.wall.thickness / 2,
                z: -totalHeight / 2 + ground.top,
                value: 2,
              },
            ]}
            normal={{ x: 0, y: 1, z: 0 }}
            color="orange"
          />
        </React.Fragment>
      ))}
      {/* Live load */}
      <AreaLoad
        polygon={[
          {
            x: 500,
            y: model.wall.thickness / 2,
            z:
              -totalHeight / 2 +
              groundRight[groundRight.length - 1].top +
              model.slab.thickness,
            value: model.liveLoad,
          },
          {
            x: 500,
            y: model.wall.thickness / 2 + rightGroundWidth,
            z:
              -totalHeight / 2 +
              groundRight[groundRight.length - 1].top +
              model.slab.thickness +
              tanAlpha * rightGroundWidth,
            value: model.liveLoad,
          },
          {
            x: -500,
            y: model.wall.thickness / 2 + rightGroundWidth,
            z:
              -totalHeight / 2 +
              groundRight[groundRight.length - 1].top +
              model.slab.thickness +
              tanAlpha * rightGroundWidth,
            value: model.liveLoad,
          },
          {
            x: -500,
            y: model.wall.thickness / 2,
            z:
              -totalHeight / 2 +
              groundRight[groundRight.length - 1].top +
              model.slab.thickness,
            value: model.liveLoad,
          },
        ]}
        normal={{ x: 0, y: 0, z: 1 }}
      />
      <AreaLoad
        polygon={[
          {
            x: 500,
            y: -model.wall.thickness / 2 - model.foundation.left,
            z: -totalHeight / 2,
            value: 3,
          },
          {
            x: -500,
            y: -model.wall.thickness / 2 - model.foundation.left,
            z: -totalHeight / 2,
            value: 3,
          },
          {
            x: -500,
            y: -model.wall.thickness / 2 - model.foundation.left,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
          {
            x: 500,
            y: -model.wall.thickness / 2 - model.foundation.left,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
        ]}
        normal={{ x: 0, y: -1, z: 0 }}
        color="orange"
      />
      <AreaLoad
        polygon={[
          {
            x: 500,
            y: -model.wall.thickness / 2,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
          {
            x: -500,
            y: -model.wall.thickness / 2,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
          {
            x: -500,
            y: -model.wall.thickness / 2 - model.foundation.left,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
          {
            x: 500,
            y: -model.wall.thickness / 2 - model.foundation.left,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
        ]}
        normal={{ x: 0, y: 0, z: 1 }}
        color="orange"
      />
      <AreaLoad
        polygon={[
          {
            x: 500,
            y: model.wall.thickness / 2 + model.foundation.right,
            z: -totalHeight / 2,
            value: 3,
          },
          {
            x: -500,
            y: model.wall.thickness / 2 + model.foundation.right,
            z: -totalHeight / 2,
            value: 3,
          },
          {
            x: -500,
            y: model.wall.thickness / 2 + model.foundation.right,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
          {
            x: 500,
            y: model.wall.thickness / 2 + model.foundation.right,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
        ]}
        normal={{ x: 0, y: 1, z: 0 }}
        color="orange"
      />
      <AreaLoad
        polygon={[
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
            value: 2,
          },
          {
            x: -500,
            y: model.wall.thickness / 2 + model.foundation.right,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
          {
            x: 500,
            y: model.wall.thickness / 2 + model.foundation.right,
            z: -totalHeight / 2 + model.foundation.thickness,
            value: 2,
          },
        ]}
        normal={{ x: 0, y: 0, z: 1 }}
        color="orange"
      />
    </Canvas>
  );
}
