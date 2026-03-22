import { 
    Scene,
    MeshBuilder,
    StandardMaterial,
    Color3,
    PhysicsAggregate,
    PhysicsShapeType
} from '@babylonjs/core';

export class Board {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
        this.createBoard();
    }

    private createBoard() {
        // 1. Updated Ground: 30 (Width/X) by 20 (Height/Z)
        const ground = MeshBuilder.CreateGround("ground", { width: 30, height: 20 }, this._scene);
        const groundMaterial = new StandardMaterial("groundMaterial", this._scene);
        groundMaterial.diffuseColor = new Color3(0, 0.4, 0.1); // Darker casino green
        ground.material = groundMaterial;
        
        // Static physics for the floor
        new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, this._scene);

        // Wall Dimensions
        const wallHeight = 50; 
        const wallThickness = 0.1;

        // 2. Invisible Wall Helper Function
        const createInvisibleWall = (name: string, width: number, depth: number, x: number, z: number) => {
            const wall = MeshBuilder.CreateBox(name, { width, height: wallHeight, depth }, this._scene);
            wall.position.y = wallHeight / 2; // Sit exactly on top of the ground
            wall.position.x = x;
            wall.position.z = z;
            
            // This hides the wall from the renderer but keeps it in the physics world
            wall.isVisible = false; 

            new PhysicsAggregate(wall, PhysicsShapeType.BOX, { mass: 0 }, this._scene);
        };

        // Top Wall (Z+)
        createInvisibleWall("wall_top", 30, wallThickness, 0, 10);
        
        // Bottom Wall (Z-)
        createInvisibleWall("wall_bottom", 30, wallThickness, 0, -10);
        
        // Right Wall (X+)
        createInvisibleWall("wall_right", wallThickness, 20, 15, 0);
        
        // Left Wall (X-)
        createInvisibleWall("wall_left", wallThickness, 20, -15, 0);
    }
}