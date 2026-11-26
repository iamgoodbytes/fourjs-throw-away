import * as THREE from 'three';

const OFFSET = new THREE.Vector3(0, 3, -6); // behind (-Z) and above the target, in target space
const LOOK_HEIGHT = 1;
const SMOOTHING = 4;                        // higher = snappier follow

/** Keeps a camera behind a target that has `position` and `heading`. */
export class FollowCamera {
  #desired = new THREE.Vector3();
  #lookAt = new THREE.Vector3();

  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
  }

  update(dt) {
    const { position, heading } = this.target;
    this.#desired.copy(OFFSET).applyAxisAngle(THREE.Object3D.DEFAULT_UP, heading).add(position);
    // Frame-rate independent smoothing
    this.camera.position.lerp(this.#desired, 1 - Math.exp(-SMOOTHING * dt));
    this.#lookAt.copy(position).setY(position.y + LOOK_HEIGHT);
    this.camera.lookAt(this.#lookAt);
  }
}
