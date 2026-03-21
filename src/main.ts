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

    const camera = new FreeCamera("camera", new Vector3(25, 10, 0), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const havokInstance = await HavokPhysics();
    const hk = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

    new Board(scene);
    const dice = new Dice(scene);

    canvas.addEventListener("click", () => {
        flashOverlay.classList.add('flash');
        dice.roll();
        setTimeout(() => {
            flashOverlay.classList.remove('flash');
        }, 500); // must match animation duration in style.css

        const interval = setInterval(() => {
            if (dice.mesh.physicsBody.getLinearVelocity().length() < 0.01) {
                const result = dice.getRollResult();
                console.log("Dice roll result:", result);
                clearInterval(interval);
            }
        }, 100);
    });

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}

createInternalScene();
