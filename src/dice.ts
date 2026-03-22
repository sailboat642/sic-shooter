
import { 
    Scene,
    MeshBuilder,
    Mesh,
    Color4,
    PhysicsAggregate,
    PhysicsShapeType,
    Vector3,
    Axis,
    Quaternion
} from '@babylonjs/core';

export class Dice {
    private _scene: Scene;
    public mesh!: Mesh;

    constructor(scene: Scene) {
        this._scene = scene;
        this.mesh = this.createDice();
    }

    private createDice() {
        const faceColors = [
            new Color4(1, 0, 0, 1), // red
            new Color4(1, 1, 0, 1), // yellow
            new Color4(0, 0, 1, 1), // blue
            new Color4(1, 0.5, 0, 1), // orange
            new Color4(1, 0, 1, 1), // magenta
            new Color4(1, 1, 1, 1), // white
        ];

        const options = {
            size: 0.5,
            faceColors: faceColors,
        };

        const box = MeshBuilder.CreateBox("dice", options, this._scene);
        box.position.y = 4;
        new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1, restitution: 0.6 }, this._scene);

        return box;
    }

    public roll(flashElement: HTMLElement, impulse?: Vector3, contactPoint?: Vector3) {
        // 1. Internalized Flash Logic
        flashElement.classList.remove('flash');
        void flashElement.offsetWidth; // Force reflow to restart animation
        flashElement.classList.add('flash');

        // 2. Physics Logic
        if (impulse && contactPoint) {
            // Precise shot impact
            this.mesh.physicsBody?.applyImpulse(impulse, contactPoint);
        } else {
            // Default toss if no specific shot data is provided
            this.mesh.physicsBody?.applyImpulse(new Vector3(0, 5, 0), this.mesh.getAbsolutePosition());
            this.mesh.physicsBody?.applyTorque(new Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10));
        }
    }

    public getRollResult(): string {
        const dice = this.mesh;

        const faceColors = [
            { normal: new Vector3(0, 0, 1), color: "red" },
            { normal: new Vector3(0, 0, -1), color: "yellow" },
            { normal: new Vector3(1, 0, 0), color: "blue" },
            { normal: new Vector3(-1, 0, 0), color: "orange" },
            { normal: new Vector3(0, 1, 0), color: "magenta" },
            { normal: new Vector3(0, -1, 0), color: "white" },
        ];
        
        let result = "";
        let highestDot = -Infinity;

        for (const face of faceColors) {
            const worldNormal = Vector3.TransformNormal(face.normal, dice.getWorldMatrix());
            const dot = Vector3.Dot(worldNormal, Axis.Y);
            if (dot > highestDot) {
                highestDot = dot;
                result = face.color;
            }
        }
        return result;
    }
}
