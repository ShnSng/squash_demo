import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

var canvas = document.getElementById("game"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const createWall = (props) => {
    const wall = new BABYLON.MeshBuilder.CreateBox(
        "wall", {
            width: props.size,
            height: props.size,
            depth: props.depth
        },
        scene
    );
    wall.parent = props.parent;
    wall.material = props.material;
    wall.position = {...wall.position, ...props.position};
    wall.rotation = {...wall.rotation, ...props.rotation};
    return wall;
}

/******* Add the create scene function ******/
var createScene = function () {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.CannonJSPlugin()); // Physics

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera(
        "Camera",
        Math.PI / 2,
        Math.PI / 3,
        35,
        new BABYLON.Vector3.Zero(), scene
    );
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(engine.getRenderingCanvas(), true);

    // Add lights to the scene
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Create playground
    const material = new BABYLON.StandardMaterial("groundMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(0.25, 0.5, 1);
    material.specularColor = BABYLON.Color3.White();
    material.ambientColor = new BABYLON.Color3(0.1, 0, 0);

    var size = 30;

    var playground = new BABYLON.MeshBuilder.CreateGround("ground", {}, scene);
    const vertexData = BABYLON.VertexData.CreateBox({
        width: size,
        height: size,
        depth: 0.05
    });
    vertexData.applyToMesh(playground);
    playground.material = material;
    playground.position.y = -1;
    playground.rotation.x = Math.PI / 2;

    // Playground physics
    playground.physicsImpostor = new BABYLON.PhysicsImpostor(
        playground,
        BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        },
        scene
    );

    // Create walls
    const wallsCommonProps = {
        depth: 1,
        material: material,
        parent: playground,
        scene: scene,
        size: size
    };
    const topWall = createWall({
        ...wallsCommonProps,
        position: {z: -size},
        rotation: {}
    });
    const northWall = createWall({
        ...wallsCommonProps,
        position: {y: -size / 2, z: -size / 2},
        rotation: {x: Math.PI / 2}
    });
    const eastWall = createWall({
        ...wallsCommonProps,
        position: {x: -size / 2, z: -size / 2},
        rotation: {y: Math.PI / 2}
    });
    // const southWall = createWall({
    //     ...wallsCommonProps,
    //     position: {y: size / 2, z: -size / 2},
    //     rotation: {x: Math.PI / 2}
    // });
    const westWall = createWall({
        ...wallsCommonProps,
        position: {x: size / 2, y: -1 / size, z: -size / 2},
        rotation: {y: Math.PI / 2}
    });

    // Create ball
    const ball = new BABYLON.Mesh.CreateSphere("ball", {}, scene);
    const ballVertexData = BABYLON.VertexData.CreateSphere({diameter: 1});
    ballVertexData.applyToMesh(ball);

    const ballMaterial = new BABYLON.StandardMaterial(
      'ballMaterial',
      scene
    );

    ballMaterial.diffuseColor = new BABYLON.Color3(0.3, 0, 0.8);
    ballMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0.8);
    ballMaterial.alpha = 0.6;
    ballMaterial.specularPower = 16;
    ballMaterial.specularColor = new BABYLON.Color3(0.7, 0.7, 1);

    // Fresnel
    ballMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();

    ballMaterial.emissiveFresnelParameters = new BABYLON.FresnelParameters();
    ballMaterial.emissiveFresnelParameters.bias = 0.6;
    ballMaterial.emissiveFresnelParameters.power = 4;
    ballMaterial.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
    ballMaterial.emissiveFresnelParameters.rightColor = BABYLON.Color3.Black();

    ballMaterial.opacityFresnelParameters = new BABYLON.FresnelParameters();
    ballMaterial.opacityFresnelParameters.leftColor = BABYLON.Color3.White();
    ballMaterial.opacityFresnelParameters.rightColor = BABYLON.Color3.Black();

    ball.material = ballMaterial;
    ball.position = new BABYLON.Vector3(0, 1, 0);

    // Ball physics
    ball.physicsImpostor = new BABYLON.PhysicsImpostor(
        ball,
        BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            friction: 0.9,
            restitution: 0.9
        },
        scene
    );
    
    scene.ambientColor = BABYLON.Color3.White();

    return scene;
};
/******* End of the create scene function ******/

var scene = createScene(); // Call the createScene function

// Import players

// Player1
BABYLON.SceneLoader.ImportMesh("", "assets/Player/", "Idle.glb", scene, function (meshes, particleSystems, skeletons) {
    const root = meshes.find((mesh) => mesh.name === "__root__");
    root.position = new BABYLON.Vector3(10, 0, 10);
    root.rotation = new BABYLON.Vector3(0, 0, 0);

    // root.physicsImpostor = new BABYLON.PhysicsImpostor(
    //     root,
    //     BABYLON.PhysicsImpostor.BoxImpostor, {
    //         mass: 1,
    //         restitution: 0.9
    //     }, scene
    // );

    // Movements
    var movestep = 0.1;

    let idleIsImported = true;

    let forward = {
        pressed: false,
        imported: false
    };
    let left = {
        pressed: false,
        imported: false
    };
    let backward = {
        pressed: false,
        imported: false
    };
    let right = {
        pressed: false,
        imported: false
    };

    window.addEventListener("keydown", event => {
        switch (event.keyCode) {
            case 90: // Z
                forward.pressed = true;
            break;
            case 81: // Q
                left.pressed = true;
            break;
            case 83: // S
                backward.pressed = true;
            break;
            case 68: // D
                right.pressed = true;
            break;
            default:
            break;
        }
    });

    window.addEventListener("keyup", event => {
        switch (event.keyCode) {
            case 90: // Z
                forward.pressed = false;
                forward.imported = false;
            break;
            case 81: // Q
                left.pressed = false;
                left.imported = false;
            break;
            case 83: // S
                backward.pressed = false;
                backward.imported = false;
            break;
            case 68: // D
                right.pressed = false;
                right.imported = false;
            break;
            default:
            break;
        }
    });

    scene.registerBeforeRender(function() {
        if (!scene.isReady()) return;
        
        if (forward.pressed) {
            if (!forward.imported) {
                BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "RunForward.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                    idleIsImported = false;
                    forward.imported = true;
                    if (scene.animationGroups.length > 0) {
                        scene.animationGroups[scene.animationGroups.length - 1].play(true);
                    }
                });
            }
            root.moveWithCollisions(new BABYLON.Vector3(0, 0, -movestep));
        } else if (left.pressed) {
            if (!left.imported) {
                BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "RunLeft.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                    idleIsImported = false;
                    left.imported = true;
                    if (scene.animationGroups.length > 0) {
                        scene.animationGroups[scene.animationGroups.length - 1].play(true);
                    }
                });
            }
            root.moveWithCollisions(new BABYLON.Vector3(movestep, 0, 0));
        } else if (backward.pressed) {
            if (!backward.imported) {
                BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "RunBackward.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                    idleIsImported = false;
                    backward.imported = true;
                    if (scene.animationGroups.length > 0) {
                        scene.animationGroups[scene.animationGroups.length - 1].play(true);
                    }
                });
            }
            root.moveWithCollisions(new BABYLON.Vector3(0, 0, movestep));
        } else if (right.pressed) {
            if (!right.imported) {
                BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "RunRight.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                    idleIsImported = false;
                    right.imported = true;
                    if (scene.animationGroups.length > 0) {
                        scene.animationGroups[scene.animationGroups.length - 1].play(true);
                    }
                });
            }
            root.moveWithCollisions(new BABYLON.Vector3(-movestep, 0, 0));
        } else {
            if (!idleIsImported) {
                BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "Idle.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                    idleIsImported = true;
                    if (scene.animationGroups.length > 0) {
                        scene.animationGroups[scene.animationGroups.length - 1].play(true);
                    }
                });
            }
        }
    });
});

// // Player2
// BABYLON.SceneLoader.ImportMesh(null, "assets/Player/", "player.glb", scene, function (meshes) {
//     meshes[0].position = new BABYLON.Vector3(-10, 0, 10);
// });

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});