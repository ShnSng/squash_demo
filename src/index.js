import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

var canvas = document.getElementById("game"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

function makeStaticImposter(object, scene) {
    return new BABYLON.PhysicsImpostor(
        object,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
            mass: 0,
            restitution: 0.9
        },
        scene
    );
}

/******* Add the create scene function ******/
var createScene = () => {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.CannonJSPlugin()); // Physics
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    // scene.collisionsEnabled = true;

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
    var size = 30;

    var playground = new BABYLON.MeshBuilder.CreateBox(
        "ground", {
            width: size,
            height: size,
            depth: 0.1
        }, scene
    );
    playground.position.y = -1;
    playground.rotation.x = Math.PI / 2;
    playground.physicsImpostor = makeStaticImposter(playground, scene);

    // Create walls
    var topWall = new BABYLON.MeshBuilder.CreateBox(
        'wall',
        {
            width: size,
            height: size,
            depth: 1
        },
        scene
    );
    topWall.position.z = -size;
    topWall.physicsImpostor = makeStaticImposter(topWall, scene);

    var northWall = new BABYLON.MeshBuilder.CreateBox(
        "wall",
        {
            width: size,
            height: size,
            depth: 1
        },
        scene
    );
    northWall.position.y = -size / 2;
    northWall.position.z = -size / 2;
    northWall.rotation.x = Math.PI / 2;
    northWall.physicsImpostor = makeStaticImposter(northWall, scene);
    
    var eastWall = new BABYLON.MeshBuilder.CreateBox(
        "wall",
        {
            width: size,
            height: size,
            depth: 1
        },
        scene
    );
    eastWall.position.x = -size / 2;
    eastWall.position.z = -size / 2;
    eastWall.rotation.y = Math.PI / 2;
    eastWall.physicsImpostor = makeStaticImposter(eastWall, scene);

    var westWall = new BABYLON.MeshBuilder.CreateBox(
        "wall",
        {
            width: size,
            height: size,
            depth: 1
        },
        scene
    );
    westWall.position.x = size / 2;
    westWall.position.z = -size / 2;
    westWall.rotation.y = Math.PI / 2;
    westWall.physicsImpostor = makeStaticImposter(westWall, scene);
    
    topWall.parent = playground;
    northWall.parent = playground;
    westWall.parent = playground;
    eastWall.parent = playground;

    var material = new BABYLON.StandardMaterial("groundMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(0.25, 0.5, 1);
    material.specularColor = BABYLON.Color3.White();
    material.ambientColor = new BABYLON.Color3(0.1, 0, 0);

    playground.material = material;
    topWall.material = material;
    northWall.material = material;
    eastWall.material = material;
    westWall.material = material;

    // Create ball
    var ball = new BABYLON.Mesh.CreateSphere("ball", {}, scene);

    var ballVertexData = BABYLON.VertexData.CreateSphere({diameter: 0.5});
    ballVertexData.applyToMesh(ball);

    var ballMaterial = new BABYLON.StandardMaterial(
      "ballMaterial",
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
            restitution: 0.9
        },
        scene
    );
    ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, -5));
    ball.showBoundingBox = true;
    // ball.ellipsoid = new BABYLON.Vector3(0, 0, 0);
    // ball.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);
    // ball.checkCollisions = true;
    
    scene.ambientColor = BABYLON.Color3.White();

    // Import players

    // Player1
    BABYLON.SceneLoader.ImportMesh("", "assets/Player/", "Idle.glb", scene, function (meshes, particleSystems, skeletons) {
        let root = meshes.find((mesh) => mesh.name === "__root__");
        let initPosition = new BABYLON.Vector3(10, -0.9, 10);
        let initRotation = new BABYLON.Vector3(0, 0, 0);
        root.position = initPosition;
        root.rotation = initRotation;

        // BABYLON.SceneLoader.ImportMesh("", "assets/Racket/", "Racket.glb", scene, function (meshes, particleSystems, skeletons) {
        //     let racket = meshes[0];
        //     racket.position = new BABYLON.Vector3(-1.4, 4, -0.5);
        //     racket.parent = root;
        // });

        root.physicsImpostor = new BABYLON.PhysicsImpostor(
            root,
            BABYLON.PhysicsImpostor.BoxImpostor,
            {
                mass: 0,
                restitution: 0.9
            },
            scene
        );
        
        root.ellipsoid = new BABYLON.Vector3(5, 5, 5);
        root.ellipsoidOffset = new BABYLON.Vector3(5, 5, 5);
        root.checkCollisions = true;
        root.showBoundingBox = true;

        var min = null;
        var max = null;
        meshes.forEach(function(mesh){
            const boundingBox = mesh.getBoundingInfo().boundingBox;
            if(min === null){
                min = new BABYLON.Vector3();
                min.copyFrom(boundingBox.minimum);
            }

            if(max === null){
                max = new BABYLON.Vector3();
                max.copyFrom(boundingBox.maximum);
            }

            min.x = boundingBox.minimum.x < min.x ? boundingBox.minimum.x : min.x;
            min.y = boundingBox.minimum.y < min.y ? boundingBox.minimum.y : min.y;
            min.z = boundingBox.minimum.z < min.z ? boundingBox.minimum.z : min.z;

            max.x = boundingBox.maximum.x > max.x ? boundingBox.maximum.x : max.x;
            max.y = boundingBox.maximum.y > max.y ? boundingBox.maximum.y : max.y;
            max.z = boundingBox.maximum.z > max.z ? boundingBox.maximum.z : max.z;
        });
        
        const m = BABYLON.MeshBuilder.CreateBox("bounds", {size:1}, scene);
        const size = max.subtract(min);
        size.x *= 3;
        size.y *= 2;
        size.z *= 2;
        m.parent = root;
        m.scaling.copyFrom(size);
        m.position.y = 2.9;
        m.visibility = 0.1;

        // root.applyGravity = true;

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
        let rightClick = {
            pressed: false,
            imported: false
        };
        let leftClick = {
            pressed: false,
            imported: false
        };

        let isInRange = false;

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
                case 65: // A
                    rightClick.pressed = true;
                break;
                case 69: // E
                    leftClick.pressed = true;
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
                case 65: // A
                    rightClick.pressed = false;
                    rightClick.imported = false;
                break;
                case 69: // E
                    leftClick.pressed = false;
                    leftClick.imported = false;
                break;
                default:
                break;
            }
        });

        scene.registerBeforeRender(function() {
            if (!scene.isReady()) return;

            if (m.intersectsMesh(ball, false)) {
                console.log("in range");
                isInRange = true;
            } else {
                isInRange = false;
            }

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
            } else if (rightClick.pressed) {
                if (!rightClick.imported) {
                    BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "ForeDropShot.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                        idleIsImported = false;
                        rightClick.imported = true;
                        if (scene.animationGroups.length > 0) {
                            scene.animationGroups[scene.animationGroups.length - 1].play(true);
                        }
                    });
                }
                if (isInRange) {
                    ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(5, 10, -10));
                }
            } else if (leftClick.pressed) {
                if (!leftClick.imported) {
                    BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "BackDropShot.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                        idleIsImported = false;
                        leftClick.imported = true;
                        if (scene.animationGroups.length > 0) {
                            scene.animationGroups[scene.animationGroups.length - 1].play(true);
                        }
                    });
                }
                if (isInRange) {
                    ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(-5, 10, -10));
                }
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

        // scene.registerAfterRender(() => {
        //     if (root.intersectsMesh(ball, false)) {
        //         console.log("in range");
        //         isInRange = true;
        //     } else {
        //         isInRange = false;
        //     }
        // });
    });

    // Player2
    BABYLON.SceneLoader.ImportMesh("", "assets/Player/", "Idle.glb", scene, function (meshes, particleSystems, skeletons) {
        let root = meshes.find((mesh) => mesh.name === "__root__");
        let initPosition = new BABYLON.Vector3(-10, -0.9, 10);
        let initRotation = new BABYLON.Vector3(0, 0, 0);
        root.position = initPosition;
        root.rotation = initRotation;

        root.physicsImpostor = new BABYLON.PhysicsImpostor(
            root,
            BABYLON.PhysicsImpostor.BoxImpostor,
            {
                mass: 0,
                restitution: 0.9
            },
            scene
        );
        
        root.ellipsoid = new BABYLON.Vector3(5, 5, 5);
        root.ellipsoidOffset = new BABYLON.Vector3(5, 5, 5);
        root.checkCollisions = true;
        root.showBoundingBox = true;

        var min = null;
        var max = null;
        meshes.forEach(function(mesh){
            const boundingBox = mesh.getBoundingInfo().boundingBox;
            if(min === null){
                min = new BABYLON.Vector3();
                min.copyFrom(boundingBox.minimum);
            }

            if(max === null){
                max = new BABYLON.Vector3();
                max.copyFrom(boundingBox.maximum);
            }

            min.x = boundingBox.minimum.x < min.x ? boundingBox.minimum.x : min.x;
            min.y = boundingBox.minimum.y < min.y ? boundingBox.minimum.y : min.y;
            min.z = boundingBox.minimum.z < min.z ? boundingBox.minimum.z : min.z;

            max.x = boundingBox.maximum.x > max.x ? boundingBox.maximum.x : max.x;
            max.y = boundingBox.maximum.y > max.y ? boundingBox.maximum.y : max.y;
            max.z = boundingBox.maximum.z > max.z ? boundingBox.maximum.z : max.z;
        });
        
        const m = BABYLON.MeshBuilder.CreateBox("bounds", {size:1}, scene);
        const size = max.subtract(min);
        size.x *= 3;
        size.y *= 2;
        size.z *= 2;
        m.parent = root;
        m.scaling.copyFrom(size);
        m.position.y = 2.9;
        m.visibility = 0.1;

        // root.applyGravity = true;

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
        let rightClick = {
            pressed: false,
            imported: false
        };
        let leftClick = {
            pressed: false,
            imported: false
        };

        let isInRange = false;

        window.addEventListener("keydown", event => {
            switch (event.keyCode) {
                case 73: // I
                    forward.pressed = true;
                break;
                case 74: // J
                    left.pressed = true;
                break;
                case 75: // K
                    backward.pressed = true;
                break;
                case 76: // L
                    right.pressed = true;
                break;
                case 85: // U
                    rightClick.pressed = true;
                break;
                case 79: // O
                    leftClick.pressed = true;
                break;
                default:
                break;
            }
        });

        window.addEventListener("keyup", event => {
            switch (event.keyCode) {
                case 73: // I
                    forward.pressed = false;
                    forward.imported = false;
                break;
                case 74: // J
                    left.pressed = false;
                    left.imported = false;
                break;
                case 75: // K
                    backward.pressed = false;
                    backward.imported = false;
                break;
                case 76: // L
                    right.pressed = false;
                    right.imported = false;
                break;
                case 85: // U
                    rightClick.pressed = false;
                    rightClick.imported = false;
                break;
                case 79: // O
                    leftClick.pressed = false;
                    leftClick.imported = false;
                break;
                default:
                break;
            }
        });

        scene.registerBeforeRender(function() {
            if (!scene.isReady()) return;

            if (m.intersectsMesh(ball, false)) {
                console.log("in range");
                isInRange = true;
            } else {
                isInRange = false;
            }

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
            } else if (rightClick.pressed) {
                if (!rightClick.imported) {
                    BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "ForeDropShot.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                        idleIsImported = false;
                        rightClick.imported = true;
                        if (scene.animationGroups.length > 0) {
                            scene.animationGroups[scene.animationGroups.length - 1].play(true);
                        }
                    });
                }
                if (isInRange) {
                    ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(5, 10, -10));
                }
            } else if (leftClick.pressed) {
                if (!leftClick.imported) {
                    BABYLON.SceneLoader.ImportAnimations("./assets/Player/", "BackDropShot.glb", scene, false, BABYLON.SceneLoaderAnimationGroupLoadingMode.Clean, null, (scene) => {
                        idleIsImported = false;
                        leftClick.imported = true;
                        if (scene.animationGroups.length > 0) {
                            scene.animationGroups[scene.animationGroups.length - 1].play(true);
                        }
                    });
                }
                if (isInRange) {
                    ball.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(-5, 10, -10));
                }
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

    return scene;
};
/******* End of the create scene function ******/

var scene = createScene(); // Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});