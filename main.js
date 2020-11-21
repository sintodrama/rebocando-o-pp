import {
    renderer,
    camera,
    scene,
    bluePointLight,
    oscLight
} from './src/scene.js';

import {
    resonanceAudioScene, 
    updateAudioNodes,
    playAudio,
    pauseAudio,
    audioContext,
    audioSources,
    customRolloff
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

// select our play button
const playButton = document.querySelector('button');

playButton.addEventListener('click', function() {

    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        playAudio(audioSources);
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        pauseAudio(audioSources);
        this.dataset.playing = 'false';
    }

}, false);

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
let phase = 0;
let freq = 0.1;
let dt = 0.01;
let minIntensity = 0.5;
let dInt = 10;

function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    if (phase < (2 * Math.PI)) {
        phase += (2 * Math.PI * freq * dt);
    } else {
        phase = 0.0;
    }
    // console.log(phase);
    
    // oscLight(bluePointLight,phase,minIntensity,dInt);

    cleanIntersected();
    intersectObjects( controller1 );
    // intersectObjects( controller2 );
    teleportCallBack();
    updateAudioNodes();
    customRolloff(camera);
    

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

    renderer.render(scene, camera);
    // requestAnimationFrame(render);
}

// In WebXR is AnimationLoop instead of AnimationFrame
renderer.setAnimationLoop( render );