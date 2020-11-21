import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    SpotLight,
    PointLight,
    AmbientLight,
    HemisphereLight,
    RGBDEncoding,
    TextureLoader,
    WebGLCubeRenderTarget,
    Group,
    SphereGeometry,
    Vector3,
    Mesh,
    MeshPhongMaterial,
    Color
} from 'https://cdn.rawgit.com/mrdoob/three.js/dev/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';
  
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#c');
const renderer = new WebGLRenderer({canvas, antialias: true});
renderer.xr.enabled = true;
renderer.outputEncoding = RGBDEncoding;

renderer.shadowMap.enabled = true;

const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 2000;


const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.set(32,6,0);


const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

const scene = new Scene();

{
    const loader = new TextureLoader();
    const texture = loader.load(
    'textures/skybox.png',
    () => {
        const rt = new WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt;
    });
}

var terrainLoader = new GLTFLoader();

terrainLoader.load(
    // resource URL
    'glb/terrain_new4.glb',
    // called when the resource is loaded
    function ( gltf ) {
        let terrain = gltf.scene;
        terrain.rotation.y = -180;
        // terrain.material = terrainMaterial;
        scene.add( terrain );
        // console.log(terrain.material.map);
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened in the terrain loader' );
    }
);

const ppLoader = new GLTFLoader();

ppLoader.load(
    'glb/pp_new_with_floor.glb',
    // called when the resource is loaded
    function ( gltf ) {
        let pp = gltf.scene;
        pp.scale.set(1.25,1.25,1.25);
        pp.rotation.y = 35;
        // console.log (pp);
        pp.castShadow = true;
        pp.receiveShadow = true;
        scene.add( pp );
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened in the pp loader' );
    }
);

// Purple top spot light
// let purpleSpotLight = new SpotLight(0xA771C0);
// purpleSpotLight.position.set( 0, 150, 0 );
// purpleSpotLight.intensity = 0.5;
// purpleSpotLight.distance = 170;
// purpleSpotLight.angle = Math.PI/2;
// scene.add(purpleSpotLight);

// Main blue point light
// let bluePointLight = new PointLight(0x368DF3);
let bluePointLight = new SpotLight(0x368DF3);
// let bluePointLight = new HemisphereLight(0x368DF3,0x368DF3,0.5);
bluePointLight.position.set( 0, -20000, 0 );
bluePointLight.intensity = 1.0;
bluePointLight.angle = Math.PI/2;
// bluePointLight.distance = 200;
bluePointLight.decay = 2;
scene.add(bluePointLight);

// Pavilion blue point light
// let pavPointLight = new PointLight(0x4B26CF);
let pavPointLight = new PointLight(0x368DF3);
pavPointLight.position.set( 0, 250000, 0 );
pavPointLight.intensity = 1;
// pavPointLight.distance = 140;
scene.add(pavPointLight);

// grass green point light
let greenGrassLight = new PointLight(0x3CD667);
greenGrassLight.position.set( 125, 1500, -50 );
greenGrassLight.intensity = 0.005;
// greenGrassLight.distance = 150;
scene.add(greenGrassLight);


function oscLight(light, phase, min, di)
{
    light.intensity = min + di*(1 + Math.cos(phase))/2;
    // console.log(Math.cos(phase));

}

// spheres
let sphereGroup = new Group();
scene.add( sphereGroup );

var geometry = new SphereGeometry(0.25,25,25);
let radialDistance = 5;
let numberOfSources = 13;
var spheres = [];
let initialPosition = new Vector3(0,1.5,0);
var deltaAngle = 2 * Math.PI / numberOfSources;
var r = 0;
let indexMat = 0;
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
    spheres[index] = new Mesh(geometry, new MeshPhongMaterial({
        map: new TextureLoader().load( 'textures/spheres/'+indexMat+'.jpg'),
        emissive: new Color(emissiveColor[indexMat]),
        emissiveIntensity : 0.0}));
    if (indexMat < 6) {indexMat += 1 } else {indexMat = 1 };
    spheres[index].position.x = initialPosition.x + radialDistance*Math.sin(r);
    spheres[index].position.y = initialPosition.y;
    spheres[index].position.z = initialPosition.z + radialDistance*Math.cos(r);
    r += deltaAngle;
    sphereGroup.add(spheres[index]);
    // resonanceAudioScene.setListenerPosition(camera.position.x,camera.position.y,camera.position.z);
};

export {
    scene,
    camera,
    renderer,
    spheres,
    sphereGroup,
    bluePointLight,
    oscLight
}
        