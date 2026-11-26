import { createScene, createCamera, createRenderer, handleResize } from './core/setup.js';
import { Input } from './core/input.js';
import { createGround, GROUND_Y } from './world/ground.js';
import { createLights } from './world/lights.js';
import { Van } from './entities/van.js';
import { FollowCamera } from './camera/followCamera.js';

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
handleResize(camera, renderer);

scene.add(createGround());
scene.add(createLights());

const input = new Input();
const van = new Van(GROUND_Y);
scene.add(van.object);

const followCamera = new FollowCamera(camera, van);

let lastTime = 0;
renderer.setAnimationLoop((time) => {
  // Clamp dt so a backgrounded tab doesn't teleport the van on return
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  van.update(dt, input);
  followCamera.update(dt);
  renderer.render(scene, camera);
});
