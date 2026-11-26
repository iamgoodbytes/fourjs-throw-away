import * as THREE from 'three';

export function createLights() {
  const lights = new THREE.Group();
  lights.add(new THREE.AmbientLight(0xffffff, 0.4));

  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(2, 3, 4);
  lights.add(sun);

  return lights;
}
