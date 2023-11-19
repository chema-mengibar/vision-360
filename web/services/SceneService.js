import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default class SceneService {

  scene = new THREE.Scene();
  loader = new GLTFLoader();

  camera = null
  renderer = null

  cameraTop = null
  rendererTop = null

  delta = 0;

  constructor() {

    const camConfig = {
      fov: 75,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 1000.0
    };
    this.camera = this.createCam(camConfig);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('main-frame').appendChild(this.renderer.domElement);
    this.scene.add(this.camera);

    this.cameraTop = this.createCam(camConfig);
    this.rendererTop = new THREE.WebGLRenderer();
    this.rendererTop.setSize(300, 300);
    document.getElementById('top-frame').appendChild(this.rendererTop.domElement);
    this.scene.add(this.cameraTop);


    const controls = new OrbitControls(this.cameraTop, this.rendererTop.domElement);
    controls.object.position.set(5, 1, 0);
    controls.target = new THREE.Vector3(-6, 0, -6);


    this.cameraTop.position.set(0, 45, 0);
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
      this.grid()
      _.renderer.render(_.scene, _.camera);
      this.animate();

      document.addEventListener('keydown', this.onDocumentKeyDown, false);
    }, 2000)
  }


  onDocumentKeyDown(event) {
    this.delta = 0.01;

    event = event || window.event;
    var keycode = event.keyCode;
 
    let angleRot = 25;
    let radiansRot = 2 * Math.PI * (angleRot / 360);

    // 1 -> 97
    // 2 -> 98
    // 3 -> 99
    // 4 -> 100
    // 5 -> 101
    // 6 -> 102
    // 7 -> 103
    // 8 -> 104

    console.log('onDocumentKeyDown')
    
    switch (keycode) {
      case 37:
        console.log(this.camera)
        if(!this.camera){ return;}
        this.camera.rotation.y = this.camera.rotation.y + radiansRot;
        break;
      case 39:
        if(!this.camera){ return;}
        this.camera.rotation.y = this.camera.rotation.y - radiansRot;
        break;
    }
  }

  animate() {
    requestAnimationFrame(this.animate)
    this.rendererTop.render(this.scene, this.cameraTop);
    this.renderer.render(this.scene, this.camera)
  }

  grid() {

    // AXIS HELPER
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    const light = new THREE.AmbientLight(0xffffff);
    light.position.set(10, 10, 20)
    light.intensity = 5
    light.castShadow = true;
    this.scene.add(light)


    const color = 0x4f4f4e
    const size = 45;
    const divisions = 45;
    const gridHelper = new THREE.GridHelper(size, divisions, color, color);
    this.scene.add(gridHelper);
  }

  get players() {
    return {
      'player-g-1': { x: 10, z: -10 },
      'player-g-2': { x: 20, z: 10 },
      'player-g-3': { x: 15, z: 0 },
      'player-g-4': { x: 0, z: 10 },
      'player-g-goalie': { x: 0, z: 0 },
      'player-h-goalie': { x: 0, z: 0 },
      'player-h-1': { x: 5, z: 0 },
      'player-h-2': { x: 5, z: 10 },
      'player-h-3': { x: 0, z: 5 },
      'player-h-0': { x: -18, z: 0 },
    }
  }

  load3D() {

    const _ = this;
    let b;
    this.loader.load('hall.glb', function (gltf) {

      _.init()
      const gltfScene = gltf.scene;

      gltfScene.traverse(o => {

        console.log(o.name)
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
              color = o.name.includes('-h') ? '#550000' : '#000055'
              if (o.name === 'player-h-0') {
                color = '#005500'
              }
              opacity = 0.4;
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


      _.scene.add(gltfScene);

    }, undefined, function (error) {
      console.error('>>>>>>>>', error);
    });
  }


}