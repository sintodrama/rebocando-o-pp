import {scene} from './scene.js';

import {
    Group,
    SphereGeometry,
    Vector3,
    Mesh,
    MeshPhongMaterial,
    TextureLoader,
    Color,
    AudioListener,
    PositionalAudio,
    AudioLoader
} from 'https://cdn.rawgit.com/mrdoob/three.js/dev/build/three.module.js';

let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let resonanceAudioScene = new ResonanceAudio(audioContext);

// const listener = new AudioListener();
// camera.add( listener );

resonanceAudioScene.output.connect(audioContext.destination);

let roomDimensions = {
    width: 35.0,
    height: 15.0,
    depth: 35.0,
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

let group;
group = new Group();
scene.add( group );

var geometry = new SphereGeometry(0.25,10,10);
    
var deltaPosition = 5;

let numberOfSources = 12;
var mesh = [];
var randomRotation = [];
var materialColor = [];
var material = []; 
var sound = [];
let initialPosition = new Vector3(0,2,0);
let radialDistance = 5;
var deltaAngle = 2 * Math.PI / numberOfSources;
var r = 0;
let indexMat = 0;
let audioElement = [];
let audioElementSource = [];
let emissiveColor = [
    "rgb(182,164,168)",
    "rgb(53,199,238)",
    "rgb(42,147,9)",
    "rgb(115,179,71)",
    "rgb(0,72,185)",
    "rgb(171,135,135)",
    "rgb(102,109,191)",
];

for (let index = 0; index < numberOfSources; index++) {
    // materialColor[index] = new Color(Math.random(),Math.random(),Math.random());
    // material[index] = new MeshLambertMaterial({color: materialColor[index]});
    // mesh[index] = new Mesh(geometry, new MeshLambertMaterial({color: new Color(Math.random(),Math.random(),Math.random())}));
    mesh[index] = new Mesh(geometry, new MeshPhongMaterial({
        map: new TextureLoader().load( 'textures/spheres/'+indexMat+'.jpg'),
        // emissive: new Color(Math.random(),Math.random(),Math.random()),
        emissive: new Color(emissiveColor[indexMat]),
        emissiveIntensity : 0.5}));
    if (indexMat < 6) {indexMat += 1 } else {indexMat = 1 };
    mesh[index].position.x = initialPosition.x + radialDistance*Math.sin(r);
    mesh[index].position.y = initialPosition.y;
    mesh[index].position.z = initialPosition.z + radialDistance*Math.cos(r);
    r += deltaAngle;
    
    //create a global audio source
    // sound[index] = new PositionalAudio( listener );
    
    audioElement[index] = document.createElement('audio');
    audioElement[index].src = 'sounds/' + index.toString() + '.mp3';

    audioElementSource[index] = audioContext.createMediaElementSource(audioElement[index]);
    
    sound[index] = resonanceAudioScene.createSource();
    sound[index].rolloff = 'linear';//'logarithmic';
    sound[index].minDistance = 0.5;
    sound[index].maxDistance = 100;
    audioElementSource[index].connect(sound[index].input);

    sound[index].setPosition(mesh[index].position.x, 
                            mesh[index].position.y, 
                            mesh[index].position.z);

    // audioElement[index].play();
    
    // load a sound and set it as the Audio object's buffer
    // var audioLoader = new AudioLoader();
    // audioLoader.load('sounds/' + index.toString() + '.mp3', function( buffer ) {
    //     sound[index].setBuffer( buffer );
    //     sound[index].setLoop( true );
    //     sound[index].setVolume( 4.0 / numberOfSources );
    //     // sound[index].play();
    // });
    
    // scene.add(mesh[index]);
    // mesh[index].add(sound[index]);
    group.add(mesh[index]);

    // resonanceAudioScene.setListenerPosition(camera.position.x,camera.position.y,camera.position.z);
    window.addEventListener('click', ( ) => {
        for (let index = 0; index < numberOfSources; index++) {
            audioElement[index].play();
            // sound[index].play();
        }
    });

    // window.addEventListener('touchstart', ( ) => {
    //     for (let index = 0; index < numberOfSources; index++) {
    //         // audioElement[index].play();
    //         sound[index].play();
    //     }
    // });
};

export {
    resonanceAudioScene,
    group
}