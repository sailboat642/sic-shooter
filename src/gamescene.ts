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


   // gamescene.ts
export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement) {
    const scene = new Scene(engine);
    const flashOverlay = document.getElementById('flash-overlay')!;

    const camera = new FreeCamera("camera", new Vector3(28, 10, 0), scene);
    camera.setTarget(Vector3.Zero());
    // We don't attach control here; main.ts handles it on transition

    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const havokInstance = await HavokPhysics();
    const hk = new HavokPlugin(false, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    new Board(scene);
    const dice = new Dice(scene);

    const yBias = 0.5; // Lowered from 1.0 to prevent purely vertical shots
    const bulletPower = 25; // Increased for a more "explosive" feel on 1kg mass
    const hipFireSource = new Vector3(14, 1.5, 0);

    let timeScale = 1.0;
    const slowMoFactor = 0.1;

    canvas.oncontextmenu = (e) => e.preventDefault();

    // UNIFIED BABYLON POINTER DETECTION
    scene.onPointerObservable.add((pointerInfo) => {
        const event = pointerInfo.event as PointerEvent;

        // --- LEFT CLICK (Shoot) ---
        if (pointerInfo.type === 0x01 && event.button === 0) { 
            const pickInfo = pointerInfo.pickInfo;
            if (pickInfo && pickInfo.hit && pickInfo.pickedMesh === dice.mesh) {
                const hitPoint = pickInfo.pickedPoint!;
                const rawDirection = hitPoint.subtract(hipFireSource).normalize();
                
                // Lerp creates a blend between target and UP
                const biasedDirection = Vector3.Lerp(rawDirection, Vector3.Up(), yBias).normalize();
                const bulletImpulse = biasedDirection.scale(bulletPower);
                
                dice.roll(flashOverlay, bulletImpulse, hitPoint);

                const interval = setInterval(() => {
                    if (dice.mesh.physicsBody!.getLinearVelocity().length() < 0.01) {
                        console.log("Dice result:", dice.getRollResult());
                        clearInterval(interval);
                    }
                }, 100);
            }
        }

        // --- RIGHT CLICK (Dead Eye) ---
        if (event.button === 2) {
            if (pointerInfo.type === 0x01) { // POINTERDOWN
                timeScale = slowMoFactor;
                document.getElementById('app')?.classList.add('dead-eye');
            } else if (pointerInfo.type === 0x02) { // POINTERUP
                timeScale = 1.0;
                document.getElementById('app')?.classList.remove('dead-eye');
            }
        }
    });

    // HANDLE PHYSICS STEPPING PER FRAME
    scene.onBeforeRenderObservable.add(() => {
        const realDelta = engine.getDeltaTime() / 1000;
        hk.setTimeStep(realDelta * timeScale);
    });

    return scene; // NO runRenderLoop here
}