import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import './style.scss'

const scene = new THREE.Scene();

const camConfig = {
    fov: 75,
    aspect: (window.innerWidth/2) / window.innerHeight,
    near: 0.1,
    far: 1000.0
}


const camera = new THREE.PerspectiveCamera( camConfig.fov, camConfig.aspect , camConfig.near, camConfig.far );

scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth / 2 , window.innerHeight );
document.body.appendChild( renderer.domElement );

// AXIS HELPER
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );



// ######################################################################### LIGHT
const light = new THREE.AmbientLight( 0xffffff );
light.position.set(10, 10, 20)
light.intensity = 5
light.castShadow = true;
scene.add(light)

// ######################################################################### 3D


const players = {
    'player-g-1': {x:10, z:10},
    'player-g-2': {x:20, z:10},
    'player-g-3': {x:15, z:0},
    'player-g-4': {x:0, z:10},
    'player-g-goalie': {x:0, z:0},
    'player-h-goalie': {x:0, z:0},
    'player-h-1': {x:5, z:0},
    'player-h-2': {x:5, z:10},
    'player-h-3': {x:0, z:5},
    'player-h-0': {x:-18, z:0},
}

const _ = {}

const loader = new GLTFLoader();
loader.load( 'hall.glb', function ( gltf ) {
    _.scene = gltf.scene;

    _.scene.traverse(o => {

        if(o.name.includes('player-')){

            console.log(o.name)

            o.children.forEach( (child, idx) =>{

                // player color: home or guest
                let color =  o.name.includes('-h') ? '#ff0000' :  '#0000ff'
                let opacity = 1;
                
                if(o.name === 'player-h-0'){
                    color = '#00ff00'
                }

                // basis circle in player
                if(idx === 1){
                    color = o.name.includes('-h') ? '#550000' :  '#000055'
                    if(o.name === 'player-h-0'){
                        color = '#005500'
                    }
                    opacity = 0.4;
                }
                const m = new THREE.MeshBasicMaterial({ color: color })
                m.side = THREE.DoubleSide;
                m.side = THREE.DoubleSide;
                m.opacity = opacity;
                m.transparent = true;
                m.needsUpdate = true;
                child.material = m;
            })

            if(!o.name.includes('goalie')){
                o.position.x = players[o.name].x;
                o.position.z = players[o.name].z;
            }

            if(o.name === 'player-h-0'){
                camera.position.x =  players[o.name].x;
                camera.position.z =  players[o.name].z;
                camera.position.y =  1.5;

                const pt = new THREE.Vector3(0,1.7,0)
                camera.lookAt(pt);
            }
        }
    })


    scene.add( _.scene );

}, undefined, function ( error ) {
    console.error( '>>>>>>>>', error );
} );


// ######################################################################### CONTROLS
//const controls = new OrbitControls( camera, renderer.domElement );
// controls.object.position.set(5, 1, 0);
// controls.target = new THREE.Vector3(-6, 0, -6);

// controls.maxPolarAngle = Math.PI / 2.2;
// controls.minPolarAngle = Math.PI / 2.2;

// controls.object.position.set(1, 1,  5);
// controls.target = new THREE.Vector3(5, 1, 10);

// controls.enableZoom = false;


// ######################################################################### CAMERA














// ---------------------------------------------------------------------------------------------------- EVENTS 

// KEYs
var delta = 0;
var h = 0;

function onDocumentKeyDown(event){
    delta = 0.01;
    h = 0.02;
    event = event || window.event;
    var keycode = event.keyCode;
    console.log(keycode)

    let angleRot = 5;
    let radiansRot = 2 * Math.PI * (angleRot / 360);
    const pt = new THREE.Vector3(0,0,0)

    switch(keycode){
        case 37 :
            camera.rotation.y = camera.rotation.y + radiansRot;
            break;
        case 39 :
            camera.rotation.y = camera.rotation.y - radiansRot;
            break;
        // case 38 :
        //     camera.rotation.x = camera.rotation.x + h;
        //     break;
        // case 40 :
        //     camera.rotation.x = camera.rotation.x - h;
        //     break;
    }
}

document.addEventListener('keydown',onDocumentKeyDown,false);


// ---------

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


window.addEventListener('mousedown', onTouchCallback)

function onTouchCallback(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        const objId = intersects[i].object.userData.id
        console.log(objId)
    }

}


function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}



animate()
