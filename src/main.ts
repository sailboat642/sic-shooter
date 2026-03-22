import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  HavokPlugin
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import { Board } from "./board";
import { Dice } from "./dice";
import './style.css';

async function createInternalScene() {
  const canvas = document.querySelector<HTMLCanvasElement>('#app canvas')!;
  const flashOverlay = document.getElementById('flash-overlay')!;
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  const camera = new FreeCamera("camera", new Vector3(28, 10, 0), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  const havokInstance = await HavokPhysics();
  const hk = new HavokPlugin(false, havokInstance);
  scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

  new Board(scene);
  const dice = new Dice(scene);
  // --- HIP FIRE CONFIGURATION ---
  const yBias = 1; // Increase this (e.g., 0.8) to make the dice fly higher, decrease for a flatter shot
  const bulletPower = 10;
  const hipFireSource = new Vector3(14, 1.5, 0);

  // --- TIME DILATION CONFIG ---
  let timeScale = 1.0;
  let timestep = 1 / 60;
  const slowMoFactor = 0.1; // 10% speed for that cinematic window

  // 1. Disable the browser's right-click menu
  canvas.oncontextmenu = (e) => e.preventDefault();

  // 2. Input Listeners for the Right Mouse Button (Button 2)
  canvas.addEventListener("pointerdown", (evt) => {
    if (evt.button === 2) {
      timeScale = slowMoFactor;
      document.getElementById('app')?.classList.add('dead-eye');
      console.log("Dead Eye active... Partner.");
    }
  });

  canvas.addEventListener("pointerup", (evt) => {
    if (evt.button === 2) {
      document.getElementById('app')?.classList.remove('dead-eye');
      timeScale = 1.0
    }
  });

  canvas.addEventListener("click", () => {
    // 1. Raycast to check for a hit
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);

    // 2. Strict Hit Detection: Only act if the dice was clicked
    if (pickInfo.hit && pickInfo.pickedMesh === dice.mesh) {
      const hitPoint = pickInfo.pickedPoint!;


      const rawDirection = hitPoint.subtract(hipFireSource).normalize();

      // Blend the two directions
      const biasedDirection = Vector3.Lerp(rawDirection, Vector3.Up(), yBias).normalize();

      const bulletImpulse = biasedDirection.scale(bulletPower);

      // 3. Trigger the integrated roll/flash logic
      dice.roll(flashOverlay, bulletImpulse, hitPoint);

      // Monitor for result
      const interval = setInterval(() => {
        if (dice.mesh.physicsBody!.getLinearVelocity().length() < 0.01) {
          console.log("Dice roll result:", dice.getRollResult());
          clearInterval(interval);
        }
      }, 100);
    }
  });

  engine.runRenderLoop(() => {
    if (scene.getPhysicsEngine()) {
      // Get the real time passed since the last frame (seconds)
      const realDelta = engine.getDeltaTime() / 1000;

      // Calculate the 'perceived' time for physics
      // Normal: ~0.008s * 1.0 = 0.008s
      // Slow:   ~0.008s * 0.1 = 0.0008s
      const physicsStep = realDelta * timeScale;

      // Feed the scaled step directly to the plugin
      hk.setTimeStep(physicsStep);
    }

    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
}

createInternalScene();
