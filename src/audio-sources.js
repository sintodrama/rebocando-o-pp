import {spheres} from './scene.js';

import {Vector3} from 'https://cdn.rawgit.com/mrdoob/three.js/dev/build/three.module.js';

let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();
let resonanceAudioScene = new ResonanceAudio(audioContext);

audioContext.suspend();

// const listener = new AudioListener();
// camera.add( listener );

var gainNode = audioContext.createGain()

resonanceAudioScene.output.connect(gainNode);
gainNode.connect(audioContext.destination);

let roomDimensions = {
    width: 50.0,
    height: 25.0,
    depth: 50.0,
};

let roomMaterials = {
    // Room wall materials
    left: 'concrete-block-coarse',
    right: 'concrete-block-coarse',
    front: 'transparent',
    back: 'transparent',
    // Room floor
    down: 'concrete-block-coarse',
    // Room ceiling
    up: 'concrete-block-coarse',
};

resonanceAudioScene.setRoomProperties(roomDimensions, roomMaterials);

const ANALYSER_FFT_SIZE = 1024;

function createAudioSource(options) {
    // Create a Resonance source and set its position in space.
    let source = resonanceAudioScene.createSource();
    let pos = options.position;
    source.setPosition(pos[0], pos[1], pos[2]);

    // Connect an analyser. This is only for visualization of the audio, and
    // in most cases you won't want it.
    let analyser = audioContext.createAnalyser();
    analyser.fftSize = ANALYSER_FFT_SIZE;
    analyser.lastRMSdB = 0;

    return fetch(options.url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => audioContext.decodeAudioData(buffer))
      .then((decodedBuffer) => {
        let bufferSource = createBufferSource(
          source, decodedBuffer, analyser);

        return {
          buffer: decodedBuffer,
          bufferSource: bufferSource,
          source: source,
          analyser: analyser,
          position: pos,
          node: null
        };
      });
  }

function createBufferSource(source, buffer, analyser) {
    // Create a buffer source. This will need to be recreated every time
    // we wish to start the audio, see
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
    let bufferSource = audioContext.createBufferSource();
    bufferSource.loop = true;
    bufferSource.connect(source.input);

    bufferSource.connect(analyser);

    bufferSource.buffer = buffer;

    return bufferSource;
  }

let fftBuffer = new Float32Array(ANALYSER_FFT_SIZE);

function getLoudnessScale(analyser) {
    analyser.getFloatTimeDomainData(fftBuffer);
    let sum = 0;
    for (let i = 0; i < fftBuffer.length; ++i)
        sum += fftBuffer[i] * fftBuffer[i];

    // Calculate RMS and convert it to DB for perceptual loudness.
    let rms = Math.sqrt(sum / fftBuffer.length);
    let db = 30 + 10 / Math.LN10 * Math.log(rms <= 0 ? 0.0001 : rms);

    // Moving average with the alpha of 0.525. Experimentally determined.
    analyser.lastRMSdB += 0.525 * ((db < 0 ? 0 : db) - analyser.lastRMSdB);

    // Scaling by 1/30 is also experimentally determined. Max is to present
    // objects from disappearing entirely.
    return Math.max(0.3, analyser.lastRMSdB / 30.0);
}

  let audioSources = [];

function updateAudioNodes() {
    let index = 0;
    for (let source of audioSources) {
        // Scale it based on loudness of the audio channel
        let scale = getLoudnessScale(source.analyser);
        // console.log(scale);
        // scale /= 0.3;
        // spheres[index].scale.set(new Vector3(scale,scale,scale));
        spheres[index].material.emissiveIntensity = 2*(scale - 0.3);
        // console.log(spheres[index].emissiveIntensity);
        index++;
    }
}

function playAudio(inputSources) {
    if (audioContext.state == 'running')
        return;

    audioContext.resume();

    for (let source of inputSources) {
        source.bufferSource.start(0);
        console.log('source played!');
    }
    // if (playButton) {
    //     playButton.iconTexture = pauseTexture;
    // }
    console.log('Audio Played!');
}

function pauseAudio(inputSources) {
    if (audioContext.state == 'suspended')
        return;

    for (let source of inputSources) {
        source.bufferSource.stop(0);
        source.bufferSource = createBufferSource(
        source.source, source.buffer, source.analyser);
    }

    audioContext.suspend();

    // if (playButton) {
    //     playButton.iconTexture = playTexture;
    // }
    console.log('Audio Paused!');
}

// let audioPromises = [];
// for (let index = 0; index < spheres.length; index++) {
//     audioPromises.push(new Promise(() =>{
//         createAudioSource({
//             url: 'sounds/' + index.toString() + '.wav',
//             position: [
//                     spheres[index].position.x,
//                     spheres[index].position.y,
//                     spheres[index].position.z
//                     ],
//           })
//         })
//     );
// }

Promise.all([
    createAudioSource({
    url: 'sounds/0.wav',
    position: [
            spheres[0].position.x,
            spheres[0].position.y,
            spheres[0].position.z
            ],
    }),
    createAudioSource({
        url: 'sounds/1.wav',
        position: [
                spheres[1].position.x,
                spheres[1].position.y,
                spheres[1].position.z
                ],
        }),
        createAudioSource({
            url: 'sounds/2.wav',
            position: [
                    spheres[2].position.x,
                    spheres[2].position.y,
                    spheres[2].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/3.wav',
            position: [
                    spheres[3].position.x,
                    spheres[3].position.y,
                    spheres[3].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/4.wav',
            position: [
                    spheres[4].position.x,
                    spheres[4].position.y,
                    spheres[4].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/5.wav',
            position: [
                    spheres[5].position.x,
                    spheres[5].position.y,
                    spheres[5].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/6.wav',
            position: [
                    spheres[6].position.x,
                    spheres[6].position.y,
                    spheres[6].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/7.wav',
            position: [
                    spheres[7].position.x,
                    spheres[7].position.y,
                    spheres[7].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/8.wav',
            position: [
                    spheres[8].position.x,
                    spheres[8].position.y,
                    spheres[8].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/9.wav',
            position: [
                    spheres[9].position.x,
                    spheres[9].position.y,
                    spheres[9].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/10.wav',
            position: [
                    spheres[10].position.x,
                    spheres[10].position.y,
                    spheres[10].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/11.wav',
            position: [
                    spheres[11].position.x,
                    spheres[11].position.y,
                    spheres[11].position.z
                    ],
            }),
        createAudioSource({
            url: 'sounds/12.wav',
            position: [
                    spheres[12].position.x,
                    spheres[12].position.y,
                    spheres[12].position.z
                    ],
            })
]).then((sources) => {
    console.log('Completion of source creation');
    audioSources = sources;
    // playAudio(audioSources);

    // Once the audio is loaded, create a button that toggles the
    // audio state when clicked.
    // playButton = new ButtonNode(playTexture, () => {
    //   if (audioContext.state == 'running') {
    //     pauseAudio();
    //   } else {
    //     playAudio();
    //   }
    // });
    // playButton.translation = [0, 1.2, -0.65];
    // scene.addNode(playButton);
  });


  function customRolloff(listener) {
    let origin = new Vector3(0,0,0);
    let distance = listener.position.distanceTo(origin);
    let maxRadius = roomDimensions.depth/2;
    let gain = 1.0 - (distance/maxRadius)**0.15;
    if ( gain < 0) {
        gain = 0.0;
    } 
    gainNode.gain.value = gain; // 10 %
  }



// for (let index = 0; index < numberOfSources; index++) {
//     // materialColor[index] = new Color(Math.random(),Math.random(),Math.random());
//     // material[index] = new MeshLambertMaterial({color: materialColor[index]});
//     // mesh[index] = new Mesh(geometry, new MeshLambertMaterial({color: new Color(Math.random(),Math.random(),Math.random())}));
//     mesh[index] = new Mesh(geometry, new MeshPhongMaterial({
//         map: new TextureLoader().load( 'textures/spheres/'+indexMat+'.jpg'),
//         // emissive: new Color(Math.random(),Math.random(),Math.random()),
//         emissive: new Color(emissiveColor[indexMat]),
//         emissiveIntensity : 0.5}));
//     if (indexMat < 6) {indexMat += 1 } else {indexMat = 1 };
//     mesh[index].position.x = initialPosition.x + radialDistance*Math.sin(r);
//     mesh[index].position.y = initialPosition.y;
//     mesh[index].position.z = initialPosition.z + radialDistance*Math.cos(r);
//     r += deltaAngle;
    
//     //create a global audio source
//     // sound[index] = new PositionalAudio( listener );
    
//     audioElement[index] = document.createElement('audio');
//     audioElement[index].src = 'sounds/' + index.toString() + '.wav';

//     audioElementSource[index] = audioContext.createMediaElementSource(audioElement[index]);
    
//     sound[index] = resonanceAudioScene.createSource();
//     sound[index].rolloff = 'linear';//'logarithmic';
//     sound[index].minDistance = 0.5;
//     sound[index].maxDistance = 100;
//     audioElementSource[index].connect(sound[index].input);

//     sound[index].setPosition(mesh[index].position.x, 
//                             mesh[index].position.y, 
//                             mesh[index].position.z);

//     // audioElement[index].play();
    
//     // load a sound and set it as the Audio object's buffer
//     // var audioLoader = new AudioLoader();
//     // audioLoader.load('sounds/' + index.toString() + '.mp3', function( buffer ) {
//     //     sound[index].setBuffer( buffer );
//     //     sound[index].setLoop( true );
//     //     sound[index].setVolume( 4.0 / numberOfSources );
//     //     // sound[index].play();
//     // });
    
//     // scene.add(mesh[index]);
//     // mesh[index].add(sound[index]);
//     group.add(mesh[index]);

//     // resonanceAudioScene.setListenerPosition(camera.position.x,camera.position.y,camera.position.z);
// };


export {
    resonanceAudioScene,
    audioSources,
    updateAudioNodes,
    playAudio,
    pauseAudio,
    audioContext,
    customRolloff
}