"use strict"

var speedFactor = 1;

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    RATIO = WIDTH / HEIGHT,
    VIEW_ANGLE = 45,
    NEAR = 0.1,
    FAR = 10000;

var camera, scene, clock, controls, renderer, stats, container;

var loader = new THREE.JSONLoader();

var pineloaded = false;

var tex = THREE.ImageUtils.loadTexture("pinetex.png", new THREE.UVMapping(), function(){
    loader.load("pinetree.js", function(geo){
        pineGeo = geo;
        
        pineloaded = true;
        
        runIfReady();   
    });
    pineMat = new THREE.MeshLambertMaterial({map: tex});
    
});

var iglooloaded = false;
var igloogeo, igloomat;

var iglootex = THREE.ImageUtils.loadTexture("iglootex2.png", new THREE.UVMapping(), function(){
    igloomat = new THREE.MeshLambertMaterial({map: iglootex});
    loader.load("igloores.js", function(geo){
        iglooloaded = true;
        igloogeo = geo;

        runIfReady();
    });
});

var groundTexLoaded = false;

groundTex = THREE.ImageUtils.loadTexture("snowtex.png", new THREE.UVMapping(), function(){
    groundTexLoaded = true;

    runIfReady();
});

var snowFlakeTexLoaded = false;
var snowFlakeTex = THREE.ImageUtils.loadTexture("snowflake.png", new THREE.UVMapping(), function(){
    snowFlakeTexLoaded = true;

    runIfReady();
});

var bedLoaded = false;
var bedGeo, bedMat;
var bedTex = THREE.ImageUtils.loadTexture("bedtex.png", new THREE.UVMapping(), function(){
    loader.load("bed.js", function(geo){
        
        bedLoaded = true;
        bedGeo = geo;
        bedMat = new THREE.MeshLambertMaterial({map:bedTex});
        runIfReady();
    });

});

var doorLoaded = false;
var doorGeo, doorMat;
var doorTex = THREE.ImageUtils.loadTexture("doortex.png", new THREE.UVMapping(), function(){
    loader.load("door.js", function(geo){
        doorLoaded = true;
        doorGeo = geo;
        doorMat = new THREE.MeshLambertMaterial({map:doorTex});
        runIfReady();
    });

});

function runIfReady(){
    if (pineloaded && iglooloaded && groundTexLoaded && snowFlakeTexLoaded && bedLoaded && doorLoaded){
        init();
        animate();
    }
}

var pineGeo, pineMat;

var objects = [];


var distFromCenter = 3;
var treeSpread = 80;

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function addNewTree(){
    var tree = new THREE.Mesh(pineGeo, pineMat);

    tree.castShadow = true;

    tree.position.z = -40;

    var posx = 0;
    while (posx > -distFromCenter && posx < distFromCenter){
        posx = Math.random()*treeSpread - treeSpread/2;
    }
    tree.position.x = posx;

    objects.push(tree);

    scene.add(tree);

    return tree;
}

function updateTrees(dt){
    for (var i = 0; i < objects.length; ++i){
        objects[i].position.z += dt*1.5*speedFactor;

        if (objects[i].position.z > 8){
            scene.remove(objects[i]);
            objects.splice(i, 1);
        }
    }
}

var groundGeo, groundMat, groundTex, groundPlane;

var groundPlaneInit = false;

var particleGeometry, particleMaterial, particles;

var xPositions = [];
var speeds = [];

var minPartSpeed = 0.5;
var maxPartSpeed = 1.5;

var closestSnow = -0.4, furthestSnow = -40;

var particleAmount = 10000;

var light;

function init(){
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0xffffff, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = false;

    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    
    clock = new THREE.Clock();
    clock.start();

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, RATIO, NEAR, FAR);
    camera.position.x = 1;
    scene.add(camera);
    
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

    scene.fog = new THREE.FogExp2( 0xffffff, 0.05);

    scene.add( new THREE.AmbientLight(0xcccccc) );

    light = new THREE.DirectionalLight(0xaaaaaa, 0.3);

    light.position.set(0, 15, 0);
    
    light.castShadow = true;

    light.shadowCameraFar = FAR;
    light.shadowCameraNear = 3;
    light.shadowDarkness = 0.4;
    light.shadowCameraVisible = false;

    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;

    var d = 20;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    scene.add(light);

    light.castShadow = true;
    
    window.addEventListener("resize", onWindowResize, false);

    particleGeometry = new THREE.Geometry();
    
    var colors = [];

    var colRange = 0.05;

    for (var i = 0; i < particleAmount; ++i){
        var vertex = new THREE.Vector3();
        vertex.x = Math.random()*30 - 15;
        vertex.y = Math.random()*5;
        vertex.z = randFloat(closestSnow, furthestSnow);

        xPositions.push(vertex.x);
        speeds.push(randFloat(minPartSpeed, maxPartSpeed));

        particleGeometry.vertices.push( vertex );
        var col = new THREE.Color(0xffffff);
        col.setHSL( 0, 0, 1 - Math.random()*colRange  );
        colors.push(col);
    }

    particleGeometry.colors = colors;

    particleMaterial = new THREE.ParticleBasicMaterial( { size: 0.1,
                        map: snowFlakeTex,
                        //blending: THREE.AdditiveBlending,
                        vertexColors: true,
                        opacity: 0.98,
                        transparent: true });

    particles = new THREE.ParticleSystem( particleGeometry, particleMaterial );
    
    particles.sortParticles = false;

    scene.add(particles);

    groundGeo = new THREE.PlaneGeometry(50, 50, 1, 1);
    groundMat = new THREE.MeshLambertMaterial({
        map:groundTex,
    });
    groundPlane = new THREE.Mesh(groundGeo, groundMat);
    
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;

    groundTex.repeat.set(10, 10);
    
    groundPlane.rotation.x = -90 * (Math.PI/180.0);

    groundPlane.position.z = -10;

    groundPlane.receiveShadow = true;
    
    scene.add(groundPlane);

    groundPlaneInit = true;
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

var treeSpawnTime = 5;
var treeSpawnAmount = 3;

var treeTime = 0;

var distBetweenTrees = 3;

function repositionTrees(ar){
    var tooClose = false;
    do{
        tooClose = false;
        for (var i = 0; i < ar.length-1; ++i){
            for (var j = i + 1; j < ar.length; ++j){
                if (Math.max(ar[i].position.x, ar[j].position.x) - Math.min(ar[i].position.x, ar[j].position.x) < distBetweenTrees){
                    tooClose = true;
                    
                    var posx = 0;
                    while (posx > -distFromCenter && posx < distFromCenter){
                        posx = Math.random()*treeSpread - treeSpread/2;
                    }
                    ar[i].position.x = posx;
                }
            }
        }
    } while (tooClose);
}

var rowsSinceLastIgloo = 0;

function findPosX(ar, dist){
    var posx = 0;
    var tooClose = false;
    do{
        tooClose = false;
        posx = Math.random()*treeSpread - treeSpread/2;

        for (var i = 0; i < ar.length; ++i){
            if (Math.max(ar[i].position.x, posx) - Math.min(ar[i].position.x, posx) < dist){
                tooClose = true;
            }
            if (posx > -distFromCenter && posx < distFromCenter){
                tooClose = true;
            }
        }
    } while (tooClose);

    return posx;

}

var rowsBetweenBeds = 10;
var rowsAfterBed = 0;

// TODO: refactor this mess
function update(dt){
    treeTime += dt*1.3;

    if (treeTime > treeSpawnTime/speedFactor){
        var spawnedTrees = [];
        for (var i = 0; i < treeSpawnAmount; ++i){
            spawnedTrees.push(addNewTree());
        }
        // then go over trees and see they aren't too close to each other
        repositionTrees(spawnedTrees);
        
        // possibly spawn bed or door
        if (Math.random() < 0.05 && rowsAfterBed > rowsBetweenBeds){
            var obj;
            if (Math.random() < 0.5){
                obj = new THREE.Mesh(bedGeo, bedMat);
            } else {
                obj = new THREE.Mesh(doorGeo, doorMat);
            }

            obj.castShadow = true;
            
            obj.rotation.y = (Math.random()>0.5) ? 0 : 90*(Math.PI/180);

            obj.position.z = -50;
            
            var objTooClose = false;
            var objposx;
            objposx = findPosX(spawnedTrees, 4);

            obj.scale.set(0.6, 0.6, 0.6);

            obj.position.x = objposx;

            spawnedTrees.push(obj);
            objects.push(obj);

            scene.add(obj);

            rowsAfterBed = 0;
        } else {
            rowsAfterBed += 1;
        }
        
        // possibly spawn igloo
        if ((Math.random() < 0.2) && (rowsSinceLastIgloo > 2)){
            var igloo = new THREE.Mesh(igloogeo, igloomat);

            igloo.castShadow = true;
            
            igloo.position.z = -50;
            igloo.position.y = 0.07;
            
            var posx;
            posx = findPosX(spawnedTrees, 4); 

            igloo.position.x = posx;
            
            var centerRoadPos = new THREE.Vector3(0, 0, igloo.position.z);
            igloo.lookAt(centerRoadPos);
            igloo.rotation.y -= 90 * (Math.PI/180);
            igloo.rotation.x = 0;
            igloo.rotation.z = 0;
            
            scene.add(igloo);

            objects.push(igloo);

            rowsSinceLastIgloo = 0;
        } else {
            rowsSinceLastIgloo += 1;
        }

        treeTime = 0;
    }

    updateTrees(dt);

    if (groundPlaneInit){
        groundTex.offset.set(0, time*0.3*speedFactor);
    }

    updateSnow(dt);
    
    camera.position.y = 1.5 + Math.sin(time*10)*0.05;
    
    camera.rotation.y = Math.sin(time*0.2)*0.7;
}

function updateSnow(dt){
    for (var k = 0; k < particleGeometry.vertices.length; ++k){
        particleGeometry.vertices[k].x = xPositions[k] + Math.sin((particleGeometry.vertices[k].y + particleGeometry.vertices[k].z));
        particleGeometry.vertices[k].y = (particleGeometry.vertices[k].y - dt*speeds[k]);
        particleGeometry.vertices[k].z += speedFactor*dt*1.5;
        
        if (particleGeometry.vertices[k].y < 0 || particleGeometry.vertices[k].z > 3){
            particleGeometry.vertices[k].y = 5;
            particleGeometry.vertices[k].x = Math.random()*30 - 15;
            particleGeometry.vertices[k].z = randFloat(closestSnow, furthestSnow);

            speeds[k] = randFloat(minPartSpeed, maxPartSpeed);
        }
    }

    particleGeometry.verticesNeedUpdate = true;

}

function render(){
    renderer.render(scene, camera);
}
