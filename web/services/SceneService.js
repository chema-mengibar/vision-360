import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Games from './Games'
export default class SceneService {

  scene = new THREE.Scene();
  loader = new GLTFLoader();

  camera = null
  renderer = null

  cameraTop = null
  rendererTop = null

  delta = 0;
  
  flow = {
    gameCursor: 1,
    crono: 5,
    cronoLimit: 5
  }

  constructor() {

    const camConfig = {
      fov: 100,
      // aspect: window.innerWidth / window.innerHeight,
      aspect: 1,
      near: 0.1,
      far: 1000.0
    };
    this.camera = this.createCam(camConfig);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('main-frame').appendChild(this.renderer.domElement);
    this.scene.add(this.camera);
    this.renderer.setClearColor( 0xffffff, 1);

    const camConfigTop = {
      fov: 75,
      aspect: 1,
      near: 0.1,
      far: 1000.0
    };
    this.cameraTop = this.createCam(camConfigTop);
    this.rendererTop = new THREE.WebGLRenderer();
    this.rendererTop.setSize(300, 300);
    this.rendererTop.setClearColor( 0xffffff, 1);
    document.getElementById('top-frame').appendChild(this.rendererTop.domElement);
    this.scene.add(this.cameraTop);

    const controls = new OrbitControls(this.cameraTop, this.rendererTop.domElement);
    controls.object.position.set(5, 1, 0);
    controls.target = new THREE.Vector3(-6, 0, -6);

    this.cameraTop.position.set(0, 35, 0);
    const pt = new THREE.Vector3(0, 0, 0)
    this.cameraTop.lookAt(pt);

    this.animate = this.animate.bind(this)
    this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this)

    this.load3D();


  }


  createCam(camConfig) {
    return new THREE.PerspectiveCamera(camConfig.fov, camConfig.aspect, camConfig.near, camConfig.far);

  }


  init() {
    const _ = this;
    setTimeout(() => {
      this.light();
      // this.grid();
      _.renderer.render(_.scene, _.camera);
      this.animate();

      document.addEventListener('keydown', this.onDocumentKeyDown, false);
    }, 0)
  }


  onDocumentKeyDown(event) {
    if(!this.camera){ return;}
    this.delta = 0.01;

    event = event || window.event;
    const keycode = event.keyCode;
 
    const angleRot = 25;
    const radiansRot = 2 * Math.PI * (angleRot / 360);
    console.log(keycode)
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
        this.camera.rotation.y = this.camera.rotation.y + radiansRot;
        break;
      case 39:
        this.camera.rotation.y = this.camera.rotation.y - radiansRot;
        break;
      case 96:
        this.loadGame();
        break;
    }
  }

  animate() {
    requestAnimationFrame(this.animate)
    this.rendererTop.render(this.scene, this.cameraTop);
    this.renderer.render(this.scene, this.camera)
  }
  
  light(){
    const light = new THREE.AmbientLight(0xffffff);
    light.position.set(10, 10, 20)
    light.intensity = 5
    light.castShadow = true;
    this.scene.add(light)
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
  
  setAssets(){
    const _ = this;
    let b;
    
    this.scene.traverse(o => {
      // dist-1
      // dist-2

      if (o.name.includes('player-')) {
        o.children.forEach((child, idx) => {
          if (o.name === 'player-g-1') {
            b = o
          }

          // player color: home or guest
          let color = o.name.includes('-h') ? '#ff0000' : '#0000ff'
          let opacity = 1;

          if (o.name === 'player-h-0') {
            color = '#00ff00'
          }

          // basis circle in player
          if (idx === 1) {
            color = o.name.includes('-h') ? '#880000' : '#000088'
            if (o.name === 'player-h-0') {
              color = '#008800'
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
  
  loadGame(){
    this.flow.gameCursor += 1;
    this.setAssets();
  }

  load3D() {
    const _ = this;

    this.loader.load('hall.glb', function (gltf) {
      _.init()
      _.scene.add(gltf.scene);
      _.setAssets()

    }, undefined, function (error) {
      console.error('>>>>>>>>', error);
    });
  }


}