"use strict"

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    RATIO = WIDTH / HEIGHT,
    VIEW_ANGLE = 45,
    NEAR = 1,
    FAR = 10000;

var camera, scene, clock, controls, renderer, stats, container;

var loader = new THREE.JSONLoader();

var tex = THREE.ImageUtils.loadTexture("pinetex.png", new THREE.UVMapping(), function(){
    loader.load("pinetree.js", createPine);
    pineMat = new THREE.MeshLambertMaterial({map: tex});
});

var sceneSpeed = 0.1;

var pineGeo, pineMat;

var trees = [];


//TODO: this stuff
function addNewTree(){
    var tree = new THREE.Mesh(pineGeo, pineMat);

    tree.position.z = -40;

    var posx = 0;
    while (posx > -2 && posx < 2){
        posx = Math.random()*50-25;
    }
    tree.position.x = posx;

    trees.push(tree);

    scene.add(tree);
}

function updateTrees(dt){
    for (var i = 0; i < trees.length; ++i){
        trees[i].position.z += dt*1.5;

        if (trees[i].position.z > 0){
            scene.remove(trees[i]);
            trees.splice(i, 1);
        }
    }
}

function createPine(geo, mat){
    pineGeo = geo;
    init();
    animate();
}

var groundGeo, groundMat, groundTex, groundPlane;

var groundPlaneInit = false;

var pine;

function init(){

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0xffffff);
    container.appendChild( renderer.domElement );

    clock = new THREE.Clock();
    clock.start();

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, RATIO, NEAR, FAR);
    camera.position.y = 1;

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );
    
    controls = new THREE.TrackballControls(camera);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65, 83, 68];

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xffffff, 0.05);
    scene.add(camera);

    scene.add( new THREE.AmbientLight(0xffffff) );

    pine = new THREE.Mesh(pineGeo, new THREE.MeshLambertMaterial({map: tex}));
    pine.position.z = -30;

    //scene.add(pine);

    window.addEventListener("resize", onWindowResize, false);

    groundTex = THREE.ImageUtils.loadTexture("snowtex.png", new THREE.UVMapping(), function(){
        groundGeo = new THREE.PlaneGeometry(50, 50, 1, 1);
        groundMat = new THREE.MeshLambertMaterial({map:groundTex});
        groundPlane = new THREE.Mesh(groundGeo, groundMat);
        
        groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;

        groundTex.repeat.set(10, 10);
        
        groundPlane.rotation.x = -90 * (Math.PI/180.0);

        groundPlane.position.z = -10;
        
        scene.add(groundPlane);

        groundPlaneInit = true;
    });
}

function onWindowResize() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.aspect = WIDTH/HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize(WIDTH,HEIGHT);
}

var time = 0;

function animate(){
    requestAnimationFrame(animate);

    var dt = clock.getDelta();
    time += dt;

    update(dt);
    render();

    stats.update();
}

var treeSpawnTime = 3;
var treeSpawnAmount = 3;

var treeTime = 0;

function update(dt){
    treeTime += dt*1.3;

    if (treeTime > treeSpawnTime){
        for (var i = 0; i < treeSpawnAmount; ++i){
            addNewTree();
        }
        treeTime = 0;
    }

    updateTrees(dt);

    if (groundPlaneInit){
        groundTex.offset.set(0, time*0.3);
    }

    camera.position.y = 1.5 + Math.sin(time*10)*0.05;
    
    camera.rotation.y = Math.sin(time*0.1)*0.5;
}

function render(){
    renderer.render(scene, camera);
}
