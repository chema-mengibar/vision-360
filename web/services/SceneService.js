import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Games from './Games'
import {FlakesTexture, Sky} from "three/addons";

export default class SceneService {

  scene = new THREE.Scene();
  loader = new GLTFLoader();

  camera = null
  renderer = null

  cameraTop = null
  rendererTop = null

  flow = {
    gameCursor: 0,
    crono: 5,
    cronoLimit: 5
  }

  constructor() {
    //A
    const camConfig = {
      fov: 100,
      // aspect: window.innerWidth / window.innerHeight,
      aspect: 1.5,
      near: 0.1,
      far: 1000.0
    };
    this.camera = this.createCam(camConfig);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('main-frame').appendChild(this.renderer.domElement);
    this.scene.add(this.camera);
   

    //B
    const camConfigTop = {
      fov: 75,
      aspect: 1.2,
      near: 0.1,
      far: 1000.0
    };
    this.cameraTop = this.createCam(camConfigTop);
    this.rendererTop = new THREE.WebGLRenderer();
    this.rendererTop.setSize(200, 160);
    this.rendererTop.setClearColor(0xffffff, 1);
    document.getElementById('top-frame').appendChild(this.rendererTop.domElement);
    this.scene.add(this.cameraTop);

    const controls = new OrbitControls(this.cameraTop, this.rendererTop.domElement);
    controls.object.position.set(5, 1, 0);
    controls.target = new THREE.Vector3(-6, 0, -6);

    this.cameraTop.position.set(0, 28, 0);
    const pt = new THREE.Vector3(0, 0, 0)
    this.cameraTop.lookAt(pt);
    // Flow
    this.animate = this.animate.bind(this)
    this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this)
        //
    this.load3D();
  }
  
  


  createCam(camConfig) {
    return new THREE.PerspectiveCamera(camConfig.fov, camConfig.aspect, camConfig.near, camConfig.far);

  }


  init() {
    const _ = this;
    setTimeout(() => {
      this.sky();
      this.light();
      // this.grid();
      _.renderer.render(_.scene, _.camera);
      this.animate();

      document.addEventListener('keydown', this.onDocumentKeyDown, false);
    }, 0)
  }


  onDocumentKeyDown(event) {
    if (!this.camera) { return; }

    event = event || window.event;
    const keycode = event.keyCode;

    console.log(keycode);

    switch (keycode) {
      case 97: // 1
      case 98: // 2
      case 99: // 3
      case 100: // 4
      case 101: // 5
      case 102: // 6
      case 103: // 7
      case 104: // 8
      case 105: // 9
        console.log(keycode)
        break;
      case 37:
        this.moveCam('left')
        break;
      case 39:
        this.moveCam('right')
        break;
      case 96:
        this.loadGame();
        break;
    }
  }

  moveCam(direction = 'left') {
    const angleRot = 25;
    const radiansRot = 2 * Math.PI * (angleRot / 360);
    if (direction === 'left') {
      this.camera.rotation.y = this.camera.rotation.y + radiansRot;
    } else {
      this.camera.rotation.y = this.camera.rotation.y - radiansRot;
    }
  }

  animate() {

    requestAnimationFrame(this.animate)
    this.rendererTop.render(this.scene, this.cameraTop);
    this.renderer.render(this.scene, this.camera)
  }
  

  light() {
    
     const l0 = new THREE.AmbientLight(0xffffff, 2)
    
    const l1 = new THREE.DirectionalLight(0xd4fbff, 3);
    l1.position.set(-1, 11, 3);  
    
 


    //     light.shadowCameraLeft = -3000;
    // light.shadowCameraRight = 3000;
    // light.shadowCameraTop = 3500;
    // light.shadowCameraBottom = -3000;



    this.scene.add( l0, l1 );
  }


  sky(){
     this.renderer.setClearColor(0x000000, 0);
    
     // renderer.setClearColor(0x000000, 0);
  }

  grid() {

    // AXIS HELPER
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    const color = 0x4f4f4e
    const size = 45;
    const divisions = 45;
    const gridHelper = new THREE.GridHelper(size, divisions, color, color);
    this.scene.add(gridHelper);
  }

  get players() {
    return Games[this.flow.gameCursor].players
  }
    


  setAssets() {
    const _ = this;
    let b;

    this.scene.traverse(o => {
      // dist-1
      // dist-2


      
      if(o.name === 'rink-floor'){
       o.material.color = new THREE.Color(0xd4fbff);
      }

      if(o.name === 'rink-band'){

        const texture = new THREE.CanvasTexture(new FlakesTexture());
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = 2;
        texture.repeat.y = 15;
        texture.rotation = 2;
        
        const rMat = new THREE.MeshPhysicalMaterial({ 
          color: 0xececec, 
          clearcoat: 25.8,
          clearcoatRoughness: 8.0,
          metalness: 0.1,
          roughness: 10.9,
          normalMap: texture,
          normalScale: new THREE.Vector2(0.2, 0.15)
          

        })
        
        o.children.forEach((child, idx) => {
          
          // side bands
          let color = 0xbebebe;
          
          // nord, south bands
          if(idx === 0 ){
            color = 0xbcbcbc;
          }
          // child.material.color = new THREE.Color(color);
          child.material = rMat;
        })
        
      }

      // if(o.name.includes('dummy')){
      //   let parent = o.parent;
      //     parent.remove( o );
      //    console.log(parent)

      //   // const selectedObject = _.scene.getObjectByName(o.name);
      //   //  _.scene.remove( parent );
      //   // console.log(selectedObject)
      // }

      if (o.name.includes('player-')) {
        o.children.forEach((child, idx) => {
          if (o.name === 'player-g-1') {
            b = o
          }

          // player color: home or guest
          let color = o.name.includes('-h') ? '#ff0000' : '#0000ff'
          let opacity = 1;

          if (o.name === 'player-h-0') {
            color = '#b32d93'
          }

          // basis circle in player
          if (idx === 1) {
            color = o.name.includes('-h') ? '#880000' : '#000088'
            if (o.name === 'player-h-0') {
              color = '#ff9ce8'
            }
            opacity = 0.8;
          }

          // numbers
          if (idx > 1) {
            color = '#000000'

            opacity = 1;
          }

          const m = new THREE.MeshBasicMaterial({ color: color })
          m.side = THREE.DoubleSide;
          m.side = THREE.DoubleSide;
          m.opacity = opacity;
          m.transparent = true;
          m.needsUpdate = true;
          child.material = m;
        })

        if (!o.name.includes('goalie')) {
          o.position.x = _.players[o.name].x;
          o.position.z = _.players[o.name].z;
          // o.rotation.y = 4.5;
        }

        if (o.name === 'player-h-0') {
          _.camera.position.x = _.players[o.name].x;
          _.camera.position.z = _.players[o.name].z;
          _.camera.position.y = 1.5;

          const pt = new THREE.Vector3(b.position.x, 1.7, b.position.z)
          _.camera.lookAt(pt);

        }
      }
    })
  }

  loadGame() {
    if (this.flow.gameCursor < Games.length - 1) {
      this.flow.gameCursor += 1;

    } else {
      this.flow.gameCursor = 0;
    }



    this.setAssets();
    this.startFlow();
    this.display();
  }


  display() {
    const displayContainer = document.getElementById('display');
    displayContainer.innerHTML = 'Scene: ' + this.flow.gameCursor;
  }



  startFlow() {
    setTimeout(() => {
      // alert('time!')
    }, 5000)
  }

  load3D() {
    const _ = this;

    this.loader.load('hall.glb', function (gltf) {
      _.init()
      _.scene.add(gltf.scene);
      _.setAssets()
      _.display()
      _.startFlow()

    }, undefined, function (error) {
      console.error('>>>>>>>>', error);
    });
  }

  fullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }


}