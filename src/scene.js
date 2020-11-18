import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    SpotLight,
    PointLight,
    RGBDEncoding,
    TextureLoader,
    WebGLCubeRenderTarget,
    Group
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
let purpleSpotLight = new SpotLight(0xA771C0);
purpleSpotLight.position.set( 0, 150, 0 );
purpleSpotLight.intensity = 0.75;
purpleSpotLight.distance = 170;
purpleSpotLight.angle = Math.PI/2;
scene.add(purpleSpotLight);

// Main blue point light
let bluePointLight = new PointLight(0x368DF3);
bluePointLight.position.set( 0, 50, 0 );
bluePointLight.intensity = 4.5;
bluePointLight.distance = 200;
scene.add(bluePointLight);

// Pavilion blue point light
let pavPointLight = new PointLight(0x4B26CF);
pavPointLight.position.set( -25, 25, -25 );
pavPointLight.intensity = 1.5;
pavPointLight.distance = 140;
scene.add(pavPointLight);

// grass green point light
let greenGrassLight = new PointLight(0x3CD667);
greenGrassLight.position.set( 125, 15, -50 );
greenGrassLight.intensity = 5;
greenGrassLight.distance = 150;
scene.add(greenGrassLight);

export {
    scene,
    camera,
    renderer
}
        