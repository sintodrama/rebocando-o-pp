import {
    renderer,
    camera,
    scene,
} from './src/scene.js';

import {
    resonanceAudioScene
} from './src/audio-sources.js';

import {
    controller1,
    controller2,
    cleanIntersected,
    intersectObjects,
    teleportCallBack,
} from './src/vr-control.js';

import {
    Vector3
} from 'https://cdn.rawgit.com/mrdoob/three.js/dev/build/three.module.js';


function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
    renderer.setSize(width, height, false);
    }
    return needResize;
}

const tempForwardVector = new Vector3();
const tempUpVector = new Vector3();
// var headPos = renderer.xr.getCamera(camera).getWorldPosition(tempVec);
// console.log(renderer.xr.getCamera(camera));

function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    }
    
    cleanIntersected();
    intersectObjects( controller1 );
    // intersectObjects( controller2 );
    teleportCallBack();

    renderer.render(scene, camera);

    tempForwardVector.set(0, 0, -1);
    tempForwardVector.applyQuaternion(camera.quaternion);

    tempUpVector.set(0, 1, 0);
    tempUpVector.applyQuaternion(camera.quaternion);

    resonanceAudioScene.setListenerOrientation(
        tempForwardVector.x,
        tempForwardVector.y,
        tempForwardVector.z,
        tempUpVector.x,
        tempUpVector.y,
        tempUpVector.z
    );
    
    resonanceAudioScene.setListenerPosition(camera.position.x,camera.position.y,camera.position.z);
    // requestAnimationFrame(render);
}

// In WebXR is AnimationLoop instead of AnimationFrame
renderer.setAnimationLoop( render );