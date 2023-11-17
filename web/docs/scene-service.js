// import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";


export default class SceneService {

    constructor(configService) {

        this.scene = null
        this.renderer = null

        this.camera = null
        this.cameraIdx = null
        this.cameras = []

        this.model = null
        this.raycaster = new THREE.Raycaster()

        this.raycastList = []


        this.animationId = null;

        this.puck = null
        this.puckSegments = null
        this.stickSegments = null
        this.playerSegments = null
        this.segment = 0
        this.animationCursor = 0;

        this.animation = {
            clock: new THREE.Clock(),
            delta: 0,
            interval: 1 / 30
        }

        this.config = {
            onIce: configService.config.onIce,
            height: window.innerWidth * 1,
            sceneData: null,
            scenario: {
                limits: {
                    x: [0, 0],
                    z: [0, 0]
                },
                center: [],
                top: 1,
                delta: [0, 0, 0],
                deltaIso: 0
            }
        }

        this.state = {
            hideSticks: false,
        }


        this.animate = this.animate.bind(this)
    }


    async fetchCards() {
        return fetch(`//hockey-3d-server.motuo.info/cards.php`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then((res) => {
                return res.json()
            })
            .then((jsonResponse) => {
                if (jsonResponse.data) {
                    return jsonResponse.data
                }
            }, (error) => {
                console.error('[SERV Filter] fetchFilters:', error)
            })
    }

    async fetchCard(sendData) {
        return fetch(`//hockey-3d-server.motuo.info/card.php?cardId=${sendData.cardId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            .then((res) => {
                return res.json()
            })
            .then((jsonResponse) => {
                if (jsonResponse.data) {
                    this.config.sceneData = jsonResponse.data
                }
            }, (error) => {
                console.error('[SERV Filter] fetchFilters:', error)
            })
    }

    load(options) {
        const cardId = options.cardId;

        if (!cardId) {
            return
        }
        const sendData = {
            cardId: cardId
        };
        this.fetchCard(sendData).then(() => {
            this.init()
        })
    }

    init() {

        const _ = this;

        this.puck = null
        this.puckSegments = null
        this.stickSegments = null
        this.segment = 0
        this.animationCursor = 0;
        this.config.scenario.limits = {
            x: [0, 0],
            z: [0, 0]
        }

        this.config.scenariocenter = []
        this.config.scenariotop = 1

        this.createScene();

        let width = window.innerWidth
        let height = _.config.height;
        _.renderer.setSize(width, height, false);

        setTimeout(() => {

            this.placeAssets();
            this.grid()
            this.createAnimation();
            _.renderer.render(_.scene, _.camera);
            this.animate();
        }, 2000)
    }

    createScene() {

        const modelPath = './src/assets/3d/items-01.glb';
        const canvas = document.querySelector('#c');

        const backgroundColor = 0x66d1ff;

        // Init the scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(backgroundColor);
        this.scene.fog = new THREE.Fog(backgroundColor, 60, 100);

        // Init the renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);

        const container = document.querySelector('#scene')
        container.appendChild(this.renderer.domElement);

        const main = document.querySelector('main')
        var childNodes = [...main.childNodes]

        let i = -1;
        childNodes.forEach((node, idx) => {
            if (node.nodeName === 'CANVAS') {
                i = idx
            }
        })
        if (i > -1) {
            main.removeChild(main.childNodes[i]);
        }

        // Add a camera
        const ratio = window.innerWidth / this.config.height;

        const cam01 = new THREE.PerspectiveCamera(50, ratio, 0.1, 1000, -50, 150);
        cam01.type = 'top'
        cam01.delta = [0, 2, -0.05]
        cam01.position.set(0, 2, -0.05); // Top position will be calculate later again
        cam01.lookAt(0, 0, 0);
        cam01.followPuck = false


        this.cameras.push(cam01)

        // Isometric camera
        const iso = 1;
        const cam02 = new THREE.OrthographicCamera(-iso * ratio, iso * ratio, iso, -iso, -iso, 10);
        cam02.position.set(iso, iso, iso);
        cam02.lookAt(0, 0, 0);
        cam02.followPuck = true
        cam02.delta = [iso, iso, iso]
        cam02.type = 'iso'
        this.cameras.push(cam02)

        const cam03 = new THREE.PerspectiveCamera(50, ratio, 0.1, 1000, -50, 150);
        cam03.position.set(0, 1, -1);
        cam03.lookAt(0, 0, 0);
        cam03.followPuck = true
        cam03.delta = [0, 1, -1]
        cam03.type = 'first'
        this.cameras.push(cam03)

        this.cameraIdx = 1;

        this.camera = this.cameras[this.cameraIdx]

        var loader = new THREE.GLTFLoader();

        const _ = this

        loader.load(
            modelPath,
            function(gltf) {
                _.model = gltf.scene;

                const objects = [];

                const namesToAdd = _.config.sceneData.assets.map(assetItem => assetItem.name)

                _.model.traverse(o => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = false;
                        o.visible = false;
                        o.layer = 10;

                        if (o.name === 'CONE') {
                            o.material = new THREE.MeshToonMaterial({ color: 0xeb9e34 });
                        } else if (o.name === 'STICK') {
                            o.material = new THREE.MeshToonMaterial({
                                color: 0x999999,
                                opacity: 0.95,
                                transparent: true
                            });

                        } else if (o.name === 'BASE') {
                            o.material = new THREE.MeshToonMaterial({ color: 0x0040ff });
                        } else if (o.name === 'PLAYER') {
                            o.material = new THREE.MeshToonMaterial({ color: 0x336699 });
                        } else if (o.name === 'BASE') {
                            o.material = new THREE.MeshToonMaterial({ color: 0x0040ff });
                        } else if (o.name === 'BAR_MODULE') {
                            o.material = new THREE.MeshToonMaterial({ color: 0x763b8f });
                        } else if (o.name === 'BAR_MODULE_TAIL') {
                            o.material = new THREE.MeshToonMaterial({ color: 0x763b8f });
                        } else if (o.name === 'BAR') {
                            o.material = new THREE.MeshToonMaterial({ color: 0x6e6b6b });
                        } else if (o.name === 'PUCK') {
                            if (_.config.onIce) {
                                o.material = new THREE.MeshToonMaterial({ color: 0x3e403e }); //ice
                            } else {
                                o.material = new THREE.MeshToonMaterial({ color: 0x14f00c }); // asfalt
                            }
                        }

                        objects.push(o)
                    }
                });

                const objectsToAdd = objects.filter((o) => namesToAdd.includes(o.name))

                _.scene.add(...objectsToAdd); //_.scene.add(..._.model.children);

            },
            undefined,
            function(error) { console.error(error); }
        );

        // Add lights
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.7);
        hemiLight.position.set(0, 0, 0);
        this.scene.add(hemiLight);

        // Add directional Light to scene
        let d = 7;
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight.position.set(-8, 12, 8);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 1500;
        dirLight.shadow.camera.left = d * -1;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = d * -1;
        this.scene.add(dirLight);

        // Floor
        let floorGeometry = new THREE.PlaneGeometry(200, 200, 1, 1);
        let floorMaterial = new THREE.MeshPhongMaterial({
            color: _.config.onIce ? 0xfefefe : 0x403f3e,
            shininess: 0
        });

        let floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -0.5 * Math.PI;
        floor.receiveShadow = true;
        floor.name = "FLOOR"
        floor.layer = 1;
        floor.position.y = -0.01;
        this.scene.add(floor);
    }

    placeAssets() {
        const _ = this;

        const limits = _.config.scenario.limits

        _.config.sceneData.assets
            //.filter(sceneItem => sceneItem.name !== 'STICK')
            .forEach((sceneItem) => {
                const m0 = _.toolClone({ refName: sceneItem.name, org: sceneItem.loc })

                // Get scenario limits, for top camera
                limits.x[0] = Math.min(limits.x[0], sceneItem.loc[0]);
                limits.x[1] = Math.max(limits.x[1], sceneItem.loc[0]);

                limits.z[0] = Math.min(limits.z[0], sceneItem.loc[2]);
                limits.z[1] = Math.max(limits.z[1], sceneItem.loc[2]);


                if (sceneItem.name === 'PLAYER') {
                    _.player = m0;
                    const s = 0.4
                    _.player.scale.set(s, s, s);
                }

                if (sceneItem.name === 'PUCK') {
                    _.puck = m0;
                }

                if (sceneItem.name === 'STICK') {
                    _.stick = m0;
                    _.stick.rotation.order = 'YXZ';
                    _.stick.receiveShadow = false;
                    _.stick.castShadow = false;
                }

                if (sceneItem.rot && sceneItem.name !== 'STICK') {
                    const [x, y, z] = sceneItem.rot;
                    m0.rotation.order = 'YXZ';
                    const _x = THREE.Math.degToRad(x);
                    const _y = THREE.Math.degToRad(y - 180);
                    const _z = THREE.Math.degToRad(z);

                    m0.rotateX(_x);
                    m0.rotateY(_y);
                    m0.rotateZ(_z);
                }

                if (sceneItem.rot && sceneItem.name === 'STICK') {
                    const [x, y, z] = sceneItem.rot
                    const _x = THREE.Math.degToRad(x);
                    const _y = THREE.Math.degToRad(y - 180);
                    const _z = THREE.Math.degToRad(z);
                    _.stick.rotation.z = _z;
                    _.stick.rotation.y = _y;
                    _.stick.rotation.x = _x;

                }
            })

        let _cX = (limits.x[0] < 0) ? (limits.x[1] + limits.x[0]) : (limits.x[1] - limits.x[0]);
        let _cZ = (limits.z[0] < 0) ? (limits.z[1] + limits.z[0]) : (limits.z[1] - limits.z[0]);


        const cX = _cX / 2
        const cZ = _cZ / 2


        // Calculate the camera distance
        let sizeX = this.getSum(limits.x[1], limits.x[0]);
        let sizeZ = this.getSum(limits.z[1], limits.z[0]);

        const fov = _.cameras[0].fov * (Math.PI / 180);
        const objectSize = Math.max(sizeX, sizeZ)
        const top = Math.abs(objectSize / Math.sin(fov))

        _.cameras[0].position.set(cX, top, cZ);
        _.config.scenario.limits = limits
        _.config.scenario.center = [cX, cZ]
        _.config.scenario.top = top


        if (!_.config.sceneData.tracks.puck || _.config.sceneData.tracks.puck.length === 0) {
            return
        }

        // STICK Place

        // _.config.sceneData.tracks.stick.forEach((frame) => {
        //     const stickTemp = _.toolClone({ refName: 'STICK', org: frame.loc })
        //     stickTemp.rotation.order = 'YXZ';
        //     const [x, y, z] = frame.rot

        //     const _x = THREE.Math.degToRad(x);
        //     const _y = THREE.Math.degToRad(y - 180);
        //     const _z = THREE.Math.degToRad(z);

        //     stickTemp.rotation.z = _z;
        //     stickTemp.rotation.y = _y;
        //     stickTemp.rotation.x = _x;
        //     stickTemp.receiveShadow = false;
        //     stickTemp.castShadow = false;

        // });

    }

    animate() {
        const _ = this;

        _.animationId = requestAnimationFrame(_.animate);

        if (!_.puckSegments || !_.puck || _.puckSegments[_.segment] === undefined) {
            cancelAnimationFrame(_.animationId)
                // ISSUE solution: https://stackoverflow.com/questions/25353557/three-js-3d-cube-spins-faster-and-faster-when-re-initializing
            return
        }

        if (_.puck && _.animationCursor < _.puckSegments[_.segment].length) {
            _.puck.position.copy(_.puckSegments[_.segment][_.animationCursor]);

            if (_.stick) {
                _.stick.position.copy(_.stickSegments.loc[_.segment][_.animationCursor]);
                const { x, y, z } = _.stickSegments.rot[_.segment][_.animationCursor]
                _.stick.rotation.z = z;
                _.stick.rotation.y = y;
                _.stick.rotation.x = x;
            }

            if (_.player) {
                _.player.position.copy(_.playerSegments.loc[_.segment][_.animationCursor]);
                const { x, y, z } = _.playerSegments.rot[_.segment][_.animationCursor]
                _.player.rotation.z = z;
                _.player.rotation.y = y;
                _.player.rotation.x = x;
            }

            _.animationCursor++;
        } else {
            _.animationCursor = 0;
            _.segment++;
        }

        _.setCameraDelta()

        _.renderer.render(_.scene, _.camera);

        // _.animation.delta += _.animation.clock.getDelta();
        // if (_.animation.delta > _.animation.interval) {

        //     _.animation.delta = _.animation.delta % _.animation.interval;
        // }


    }

    setCameraDelta() {
        const _ = this;
        if (!this.player) {
            return
        }
        if (_.camera.type === 'iso') {
            const _x = _.player.position.x + _.camera.delta[0]; //+ _.config.scenario.deltaIso;
            const _y = _.player.position.y + _.camera.delta[1]; //+ _.config.scenario.deltaIso;
            const _z = _.player.position.z + _.camera.delta[2]; //+ _.config.scenario.deltaIso;

            _.camera.zoom = _.camera.delta[0] + _.config.scenario.deltaIso;
            _.camera.position.set(_x, _y, _z);
            _.camera.updateProjectionMatrix();

            // _.camera.fov = 20;
            //_.camera.lookAt(_.player.position.x, _.player.position.y, _.player.position.z);
        } else {
            const _x = _.player.position.x + _.camera.delta[0] + _.config.scenario.delta[0];
            const _y = _.camera.delta[1] + _.config.scenario.delta[1];
            const _z = _.player.position.z + _.camera.delta[2] + _.config.scenario.delta[2];
            _.camera.position.set(_x, _y, _z);

        }

    }


    createAnimation() {
        const _ = this;
        _.puckSegments = []

        const puckSegments = this.createSegments(_.config.sceneData.tracks.puck, 'loc')

        const material = new THREE.LineBasicMaterial({
            color: 0xff00f0,
        });
        const geometry = new THREE.Geometry();
        puckSegments.forEach(segment => {
            for (let i = 0; i < segment.length; i++) {
                geometry.vertices.push(segment[i]);
            }
        })
        const line = new THREE.Line(geometry, material);
        _.scene.add(line);

        _.puckSegments = puckSegments


        const stickLocSegments = this.createSegments(_.config.sceneData.tracks.stick, 'loc')
        const stickRotSegments = this.createSegments(_.config.sceneData.tracks.stick, 'rot')

        _.stickSegments = {
            loc: stickLocSegments,
            rot: this.mapStickRotation(stickRotSegments)
        }

        const playerLocSegments = this.createSegments(_.config.sceneData.tracks.player, 'loc')
        const playerRotSegments = this.createSegments(_.config.sceneData.tracks.player, 'rot')

        _.playerSegments = {
            loc: playerLocSegments,
            rot: this.mapStickRotation(playerRotSegments)
        }
    }

    // -------------------------------------------------- HELPERS

    mapStickRotation(stickRotSegments) {
        return stickRotSegments.map(stickRotSegment => {
            return stickRotSegment.map(vector => {
                return {
                    x: -(THREE.Math.degToRad(vector.x)),
                    y: THREE.Math.degToRad(vector.y - 180),
                    z: THREE.Math.degToRad(vector.z)
                }
            })
        })

    }

    createSegments(elementTrackFrames, propName) { //example: (data.tracks.stick, 'loc')

        const segments = []

        elementTrackFrames.forEach((frameData, idx) => {
            if (idx === elementTrackFrames.length - 1) {
                return
            }
            const currentFrameData = frameData[propName] // same as .loc
            const nextFrameData = elementTrackFrames[idx + 1][propName] // same as .loc

            const splineNodes = [];
            //x,z,y
            splineNodes.push(new THREE.Vector3(-currentFrameData[0], currentFrameData[1],
                currentFrameData[2],
            ))
            splineNodes.push(new THREE.Vector3(-nextFrameData[0], nextFrameData[1],
                nextFrameData[2],
            ))
            const spline = new THREE.SplineCurve3(splineNodes);
            const splinePoints = spline.getPoints(frameData.d / 6); // duration

            splinePoints.pop()
            segments.push(splinePoints)

        })
        return segments
    }


    toolClone(options) {
        const _ = this;
        const meshOrginal = _.scene.getObjectByName(options.refName);
        if (!meshOrginal) {
            return
        }

        let vector = new THREE.Vector3(-options.org[0], options.org[1], options.org[2]);
        var clone = new THREE.Mesh(meshOrginal.geometry, meshOrginal.material);
        clone.name = `${options.refName}_${_.scene.children.length}`;
        clone.position.copy(vector);
        clone.visible = true;
        clone.receiveShadow = false;
        clone.castShadow = true;

        _.raycastList.push(clone)


        console.log(options.refName)

        if (options.refName === 'CONE') {
            clone.rotateZ(THREE.Math.degToRad(180));
        }

        if (options.refName === 'PUCK') {
            clone.scale.set(0.01, 0.01, 0.01);
        } else if (options.refName === 'BAR_MODULE' || options.refName === 'BAR_MODULE_TAIL' || options.refName === 'BAR') {
            clone.scale.set(0.054, 0.054, 0.054);

        } else if (options.refName === 'STICK') {
            const s = 0.0005;
            clone.scale.set(s, s, s);
            clone.rotateZ(THREE.Math.degToRad(180));
        } else {
            clone.scale.set(0.1, 0.1, 0.1);
        }

        _.scene.add(clone);
        return clone
    }

    grid() {
        const _ = this;

        const color = _.config.onIce ? 0xf5f5f5 : 0x4f4f4e

        const limits = _.config.scenario.limits;
        const sizeX = (limits.x[0] < 0) ? (limits.x[1] - limits.x[0]) : (limits.x[1] + limits.x[0]);
        const sizeZ = (limits.z[0] < 0) ? (limits.z[1] - limits.z[0]) : (limits.z[1] + limits.z[0]);
        const size = Math.max(sizeX, sizeZ) * 2;
        const divisions = size * 5;
        const gridHelper = new THREE.GridHelper(size, divisions, color, color);
        _.scene.add(gridHelper);
    }

    getSum(a, b) {
        const _a = (a < 0) ? a * -1 : a;
        const _b = (b < 0) ? b * -1 : b;
        return _a + _b;
    };

    // -------------------------------------------------- CONTROLS

    ctrlSelectByName(name) {
        var color = 0xff0000;
        const o = this.scene.getObjectByName(name);
        o._material = o.material.clone();
        o.material.color.setHex(color);
    }

    ctrlDeselectByName(name) {
        const o = this.scene.getObjectByName(name);
        o.material = o._material;
        delete o._material
    }

    startAnimation() {
        console.log('startAnimation')
        this.animationCursor = 0;
        this.segment = 0;
        cancelAnimationFrame(this.animationId)
        this.animate()
    }

    switchCam(camId = 0) {
        this.cameraIdx = camId;

        this.config.scenario.delta[0] = 0;
        this.config.scenario.delta[1] = 0;
        this.config.scenario.delta[2] = 0;

        this.camera = this.cameras[this.cameraIdx];
        this.renderer.render(this.scene, this.camera);
    }

    hideSticks() {
        const state = !this.state.hideSticks
        this.state.hideSticks = state
        this.scene.children.forEach(child => {
            if (child.name.includes('STICK')) {
                child.visible = !state
            }
        })
        this.renderer.render(this.scene, this.camera);
    }

    onOffIce() {
        this.config.onIce = !this.config.onIce
        this.init()
        this.renderer.render(this.scene, this.camera);
    }

    delta(d, coor = 1) { //x=0, y=1, z=2
        this.config.scenario.delta[coor] += d;
        this.setCameraDelta()
        this.renderer.render(this.scene, this.camera);

    }

    deltaIso(d) {
        this.config.scenario.deltaIso += d;

        if (this.config.scenario.deltaIso < -0.45) {
            this.config.scenario.deltaIso = -0.45
        }
        if (this.config.scenario.deltaIso > 1) {
            this.config.scenario.deltaIso = 1
        }
        console.log(this.config.scenario.deltaIso)
        this.setCameraDelta()
        this.renderer.render(this.scene, this.camera);

    }

}