import * as THREE from 'three';

export const GROUND_Y = -1;
const GROUND_SIZE = 200;
const GROUND_COLOR = 0x2e7d32;

export function createGround() {
  // Large green plane, rotated from vertical (XY) to horizontal (XZ)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
    new THREE.MeshStandardMaterial({ color: GROUND_COLOR }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = GROUND_Y;
  return ground;
}
