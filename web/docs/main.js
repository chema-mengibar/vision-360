import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import './style.scss'

const scene = new THREE.Scene();

const camConfig = {
    fov: 75,
    aspect: (window.innerWidth/2) / window.innerHeight,
    // aspect: (window.innerWidth) / window.innerHeight,
    near: 0.1,
    far: 1000.0
}


const _ = {}

const camera = new THREE.PerspectiveCamera( camConfig.fov, camConfig.aspect , camConfig.near, camConfig.far );

scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth / 2 , window.innerHeight );
// renderer.setSize( window.innerWidth  , window.innerHeight );
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



const players = {
    'player-g-1': {x:10, z:-10},
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

// ######################################################################### 3D
const loader = new GLTFLoader();
loader.load( 'hall.glb', function ( gltf ) {

    _.scene = gltf.scene;

    _.scene.traverse(o => {
        
        if(o.name.includes('player-')){

            o.children.forEach( (child, idx) =>{
               
                // player color: home or guest
                let color =  o.name.includes('-h') ? '#ff0000' :  '#0000ff'
                let opacity = 1; 
                
                if(o.name === 'player-h-0'){
                    color = '#00ff00'
                }
                
                // basis circle in player
                if(idx === 1){
                   
                    opacity = 1;
                }

                if(idx > 1){
                    color =  '#000000'

                    opacity = 1;
                }
                
                const m = new THREE.MeshBasicMaterial({ color: color })
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

           


              
           
        }
    })


    scene.add( _.scene );
   
     

}, undefined, function ( error ) {
    console.error( '>>>>>>>>', error );
} );


// ######################################################################### CONTROLS
const controls = new OrbitControls( camera, renderer.domElement );
controls.object.position.set(5, 1, 0);
controls.target = new THREE.Vector3(-6, 0, -6);

// controls.maxPolarAngle = Math.PI / 2.2;
// controls.minPolarAngle = Math.PI / 2.2;
//
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


const color =  0x4f4f4e
const sizeX = 45;
const sizeZ = 27;
const size = 45;
const divisions = 60;
const gridHelper = new THREE.GridHelper(size, divisions, 0xff0000, color);
scene.add(gridHelper);




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
