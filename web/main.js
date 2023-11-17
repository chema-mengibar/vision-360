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
const loader = new GLTFLoader();
loader.load( 'rink-base.glb', function ( gltf ) {
     scene.add( gltf.scene );

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
// camera.position.z = 5;
// camera.position.x = 1;
// camera.position.y =5;

//
camera.position.set(0,45,0);
// camera.rotation.set(50,0,0);
//camera.quaternion.set(50,0,0, 1);

const pt = new THREE.Vector3(0,0,0)
camera.lookAt(pt);

// camera.rotation.z = 1.57




// ##########################################################################  OBJECTS

// ------------------------------------------ BOX
const geometry = new THREE.BoxGeometry( 1, 1, 0.1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.userData.id ="CUBE"

scene.add( cube );


const xMax = 12.5;
const xMin = -xMax;

const yMax = 30;
const yMin = -yMax;

// 30:13, 29:8,  28:10, 27:10

cube.position.x = 27;
cube.position.z = 10;
cube.position.y = 0;

let angle = 90;
let radians = 2 * Math.PI * (angle / 360);
cube.rotation.y =  radians;

// ------------------------------------------ TRIANGLE
let vertices = new Float32Array([
    0.0, 0.0, 0.0,    // vertex 1
    0.0, 2.0, 0.0,     // vertex 2
    0.0, 0.0, 2.0,      // vertex 3
]);

const  a = new THREE.BufferGeometry();
a.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

const m = new THREE.MeshBasicMaterial({ color: 'red' })
m.side = THREE.DoubleSide;
const d = new THREE.Mesh(a, m);


let angle1 = 220;
let radians1 = 2 * Math.PI * (angle1 / 360);
d.rotation.y =  radians1;
d.userData.id = "TRIANGLE"
scene.add(d)




// ---------------------------------------------------------------------------------------------------- EVENTS 

// KEYs
var delta = 0;
var h = 0;



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
