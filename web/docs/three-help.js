
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
import * as THREE from "three";

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



// ######################################################################### CONTROLS
//const controls = new OrbitControls( camera, renderer.domElement );
// controls.object.position.set(5, 1, 0);
// controls.target = new THREE.Vector3(-6, 0, -6);

// controls.maxPolarAngle = Math.PI / 2.2;
// controls.minPolarAngle = Math.PI / 2.2;

// controls.object.position.set(1, 1,  5);
// controls.target = new THREE.Vector3(5, 1, 10);

// controls.enableZoom = false;



