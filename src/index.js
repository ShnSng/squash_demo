import * as BABYLON from "babylonjs";

var canvas = document.getElementById("game"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const createWall = (props) => {
    const wall = new BABYLON.MeshBuilder.CreateBox(
        "wall", {
            width: props.size,
            height: props.size
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

    // Add and manipulate meshes in the scene
    var cube = new BABYLON.Mesh.CreateBox("box", 1, scene);

    // Create playground
    const material = new BABYLON.StandardMaterial("groundMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(0.25, 0.5, 1);
    material.specularColor = BABYLON.Color3.White();
    material.ambientColor = new BABYLON.Color3(0.1, 0, 0);

    var size = 30;

    var playground = new BABYLON.MeshBuilder.CreateGround("ground", {}, scene);
    const vertexData = BABYLON.VertexData.CreateBox({
        width: size,
        height: size
    });
    vertexData.applyToMesh(playground);
    playground.material = material;
    playground.position.y = -1;
    playground.rotation.x = Math.PI / 2;

    // Create walls
    const wallsCommonProps = {
        parent: playground,
        size: size,
        scene: scene,
        material: material
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
        position: {x: 0.5 + size / 2, y: 0.5 - 1 / size, z: -size / 2},
        rotation: {y: Math.PI / 2}
    });
    
    scene.ambientColor = BABYLON.Color3.White();

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