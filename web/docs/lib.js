



const _ = {}

 

// ---------------------------------------------------------------------------------------------------- EVENTS 

// KEYs





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


