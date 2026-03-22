// main.ts
import { Engine, Scene } from "@babylonjs/core";
import { MenuScene } from "./menu";
import { createGameScene } from "./gamescene";
import './style.css';

async function bootstrap() {
    const canvas = document.querySelector<HTMLCanvasElement>('#app canvas')!;
    const engine = new Engine(canvas, true);

    // 1. Create the Game Scene (It returns a scene but DOES NOT start a loop)
    const gameScene = await createGameScene(engine, canvas);
    let activeScene: Scene;

    // 2. Create the Menu Scene
    const menu = new MenuScene(engine, () => {
        activeScene = gameScene;
        if (gameScene.activeCamera) {
          gameScene.activeCamera.attachControl(canvas, true);
        }
        menu.scene.dispose(); // Cleanup menu memory
    });

    activeScene = menu.scene;

    // THE ONLY RENDER LOOP
    engine.runRenderLoop(() => {
        activeScene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}

bootstrap();