import Module, { type Mesh } from "manifold-3d";
import * as THREE from "three";

// Load Manifold WASM library
const wasm = await Module();
wasm.setup();
const { Manifold, Mesh } = wasm;

// Convert Three.js BufferGeometry to Manifold Mesh
function geometry2mesh(geometry: THREE.BufferGeometry) {
  // Only using position in this sample for simplicity. Can interleave any other
  // desired attributes here such as UV, normal, etc.
  const vertProperties = geometry.attributes.position.array as Float32Array;
  // Manifold only uses indexed geometry, so generate an index if necessary.
  const triVerts =
    geometry.index != null
      ? (geometry.index.array as Uint32Array)
      : new Uint32Array(vertProperties.length / 3).map((_, idx) => idx);
  // Create the MeshGL for I/O with Manifold library.
  const mesh = new Mesh({
    numProp: 3,
    vertProperties,
    triVerts,
  });
  mesh.merge();
  return mesh;
}

// Convert Manifold Mesh to Three.js BufferGeometry
function mesh2geometry(mesh: Mesh) {
  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute(
    "position",
    new THREE.BufferAttribute(mesh.vertProperties, 3),
  );
  indexed.setIndex(new THREE.BufferAttribute(mesh.triVerts, 1));
  // Convert to non-indexed so each triangle has its own vertices.
  // This prevents computeVertexNormals from averaging across hard edges,
  // which would cause a shading gradient at sharp corners.
  const geometry = indexed.toNonIndexed();
  geometry.computeVertexNormals();
  return geometry;
}

const getDifference = (
  geometry1: THREE.BufferGeometry,
  geometry2: THREE.BufferGeometry,
): THREE.BufferGeometry => {
  const manifoldGeometry1 = new Manifold(geometry2mesh(geometry1));
  const manifoldGeometry2 = new Manifold(geometry2mesh(geometry2));
  const difference = Manifold.difference(manifoldGeometry1, manifoldGeometry2);
  const finalMesh = mesh2geometry(difference.getMesh());

  // Clean up WASM memory
  manifoldGeometry1.delete();
  manifoldGeometry2.delete();
  difference.delete();

  return finalMesh;
};

export const cutGeometryByPart = (
  geometry: THREE.BufferGeometry,
  cutter: THREE.BufferGeometry,
) => {
  return getDifference(geometry, cutter);
};

// Plane cutting is implemented by creating a large box geometry
// that is transformed to align with the cut plane.
// If this size becomes larger, like 1_000_000 some geometry produces my manifold is corrupted
const cutBoxSize = 100_000; // mm
const cutPlaneBox = new THREE.BoxGeometry(cutBoxSize, cutBoxSize, cutBoxSize);
cutPlaneBox.translate(0, 0, cutBoxSize / 2);

const invertedCutPlaneBox = new THREE.BufferGeometry().copy(cutPlaneBox);
invertedCutPlaneBox.translate(0, 0, -cutBoxSize);

export const cutGeometryByPlane = (
  geometry: THREE.BufferGeometry,
  cutPlaneMatrix: THREE.Matrix4,
  invert: boolean = false,
) => {
  const cutter = new THREE.BufferGeometry().copy(
    invert ? invertedCutPlaneBox : cutPlaneBox,
  );
  cutter.applyMatrix4(cutPlaneMatrix);

  return getDifference(geometry, cutter);
};
