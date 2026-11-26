import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = '/models/van.glb';

// --- Driving tuning (units per second / radians) ---
const MAX_SPEED = 10;          // forward top speed
const MAX_REVERSE_SPEED = 4;   // reverse top speed
const ACCELERATION = 8;        // throttle acceleration
const BRAKE = 16;              // deceleration when pressing the opposite direction
const FRICTION = 4;            // coast-down when no throttle
const TURN_SPEED = 1.8;        // max yaw rate at full speed
const MAX_WHEEL_ANGLE = 0.5;   // visual steering angle of the front wheels
const WHEEL_RADIUS = 0.3;

/** Drivable van. The model faces +Z and its wheels touch y = 0. */
export class Van {
  object = new THREE.Group();
  speed = 0;
  heading = 0;

  #wheels = { frontLeft: null, frontRight: null, backLeft: null, backRight: null };
  #wheelRoll = 0;
  #wheelSteer = 0;

  constructor(groundY = 0) {
    this.object.position.y = groundY;
    new GLTFLoader().load(MODEL_URL, (gltf) => this.#onLoad(gltf));
  }

  get position() {
    return this.object.position;
  }

  #onLoad(gltf) {
    this.object.add(gltf.scene);
    const w = this.#wheels;
    w.frontLeft = gltf.scene.getObjectByName('wheel-front-left');
    w.frontRight = gltf.scene.getObjectByName('wheel-front-right');
    w.backLeft = gltf.scene.getObjectByName('wheel-back-left');
    w.backRight = gltf.scene.getObjectByName('wheel-back-right');
    // Steer (Y) is applied on top of the roll (X), so the wheel rolls around its own axle
    for (const wheel of Object.values(w)) {
      if (wheel) wheel.rotation.order = 'YXZ';
    }
  }

  update(dt, input) {
    const throttle = input.axis('forward', 'backward');
    const steer = input.axis('left', 'right');
    this.#updateSpeed(dt, throttle);
    this.#updateMovement(dt, steer);
    this.#updateWheels(dt, steer);
  }

  #updateSpeed(dt, throttle) {
    if (throttle !== 0) {
      // Braking is stronger than accelerating when pushing against the current direction
      const opposing = this.speed !== 0 && Math.sign(throttle) !== Math.sign(this.speed);
      this.speed += throttle * (opposing ? BRAKE : ACCELERATION) * dt;
    } else {
      const drop = FRICTION * dt;
      this.speed = Math.abs(this.speed) <= drop ? 0 : this.speed - Math.sign(this.speed) * drop;
    }
    this.speed = THREE.MathUtils.clamp(this.speed, -MAX_REVERSE_SPEED, MAX_SPEED);
  }

  #updateMovement(dt, steer) {
    // Steering only turns the van while it moves; reversing flips the direction naturally
    this.heading += steer * TURN_SPEED * (this.speed / MAX_SPEED) * dt;
    this.object.rotation.y = this.heading;
    this.position.x += Math.sin(this.heading) * this.speed * dt;
    this.position.z += Math.cos(this.heading) * this.speed * dt;
  }

  #updateWheels(dt, steer) {
    // Roll with distance travelled, front wheels ease toward the steer angle
    this.#wheelRoll += (this.speed * dt) / WHEEL_RADIUS;
    this.#wheelSteer = THREE.MathUtils.damp(this.#wheelSteer, steer * MAX_WHEEL_ANGLE, 10, dt);
    const w = this.#wheels;
    for (const wheel of Object.values(w)) {
      if (wheel) wheel.rotation.x = this.#wheelRoll;
    }
    if (w.frontLeft) w.frontLeft.rotation.y = this.#wheelSteer;
    if (w.frontRight) w.frontRight.rotation.y = this.#wheelSteer;
  }
}
