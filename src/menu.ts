import { Scene, FreeCamera, Vector3, Engine } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Rectangle, TextBlock } from "@babylonjs/gui";

export class MenuScene {
    public scene: Scene;

    constructor(engine: Engine, onStart: () => void) {
        this.scene = new Scene(engine);
        
        // 1. Dedicated Menu Camera (No movement needed)
        const camera = new FreeCamera("menuCamera", new Vector3(0, 0, -10), this.scene);
        camera.setTarget(Vector3.Zero());

        // 2. High-DPI GUI Setup
        const ui = AdvancedDynamicTexture.CreateFullscreenUI("MenuUI", true, this.scene);
        ui.renderAtIdealSize = true;
        ui.idealWidth = 1080;
        ui.idealHeight = 720;

        // 3. Background
        const bg = new Rectangle("bg");
        bg.width = "100%";
        bg.height = "100%";
        bg.background = "#1a1a1a";
        bg.thickness = 0;
        ui.addControl(bg);

        // 4. Title
        const title = new TextBlock("title", "SIC BO SHOOTER");
        title.color = "white";
        title.fontSize = 64;
        title.top = "-100px";
        bg.addControl(title);

        // 5. Start Button
        const startBtn = Button.CreateSimpleButton("startBtn", "GIVE 'EM LEAD");
        startBtn.width = "250px";
        startBtn.height = "60px";
        startBtn.color = "white";
        startBtn.background = "#8B4513";
        startBtn.cornerRadius = 5;
        startBtn.hoverCursor = "pointer";
        
        // When clicked, we fire the callback to switch scenes in main.ts
        startBtn.onPointerClickObservable.add(() => {
            console.log("Starting Game...");
            onStart();
        });
        
        bg.addControl(startBtn);
    }
}