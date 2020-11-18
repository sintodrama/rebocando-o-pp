import {
    Matrix4,
    BufferGeometry,
    Vector3,
    Line,
    LineBasicMaterial,
    PointLight,
    Raycaster,
    BufferAttribute,
    Group
} from 'https://cdn.rawgit.com/mrdoob/three.js/dev/build/three.module.js';

import {scene, renderer, camera} from './scene.js';
import { XRControllerModelFactory } from 'https://unpkg.com/three/examples/jsm/webxr/XRControllerModelFactory.js';
import { VRButton } from 'https://unpkg.com/three/examples/jsm/webxr/VRButton.js';
import {group} from './audio-sources.js';

document.body.appendChild(VRButton.createButton(renderer));

let raycaster;

const intersected = [];
const tempMatrix = new Matrix4();

// VR controller and intersection
const controller1 = renderer.xr.getController( 0 );
controller1.addEventListener( 'selectstart', onSelectStartGrab );
controller1.addEventListener( 'selectend', onSelectEndGrab );
scene.add( controller1 );

const controller2 = renderer.xr.getController( 1 );
controller2.addEventListener( 'selectstart', onSelectStartMove );
controller2.addEventListener( 'selectend', onSelectEndMove );
scene.add( controller2 );

let guidingController = null;

const controllerModelFactory = new XRControllerModelFactory();

const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
scene.add( controllerGrip1 );

const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
scene.add( controllerGrip2 );

//

const tempGeometry = new BufferGeometry().setFromPoints( [ new Vector3( 0, 0, 0 ), new Vector3( 0, 0, - 1 ) ] );

const line = new Line( tempGeometry );
line.name = 'line';
line.scale.z = 5;

controller1.add( line.clone() );
// controller2.add( line.clone() );

raycaster = new Raycaster();

// Utility Vectors
const g = new Vector3(0,-9.8,0);
const tempVec = new Vector3();
const tempVec1 = new Vector3();
const tempVecP = new Vector3();
const tempVecV = new Vector3();

const lineSegments = 10;
const lineGeometry = new BufferGeometry();
const lineGeometryVertices = new Float32Array((lineSegments +1) * 3);
lineGeometryVertices.fill(0);
lineGeometry.setAttribute('position', new BufferAttribute(lineGeometryVertices, 3));
const lineMaterial = new LineBasicMaterial({ color: 0x888888});
const guideline = new Line( lineGeometry, lineMaterial );
const guidelight = new PointLight(0xffeeaa, 0, 2);

function positionAtT(inVec,t,p,v,g) {
    inVec.copy(p);
    inVec.addScaledVector(v,t);
    inVec.addScaledVector(g,0.5*t**2);
    return inVec;
}

// controller1.addEventListener('selectstart', onSelectStart);
// controller1.addEventListener('selectend', onSelectEnd);

// function onWindowResize() {

//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();

//     renderer.setSize( window.innerWidth, window.innerHeight );

// }

function onSelectStartGrab( event ) {

    const controller = event.target;

    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

        const intersection = intersections[ 0 ];

        const object = intersection.object;
        object.material.emissive.b = 1;
        controller.attach( object );

        controller.userData.selected = object;

    }

}

function onSelectEndGrab( event ) {

    const controller = event.target;

    if ( controller.userData.selected !== undefined ) {

        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        group.attach( object );

        controller.userData.selected = undefined;

    }


}

function getIntersections( controller ) {

    tempMatrix.identity().extractRotation( controller.matrixWorld );

    raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    return raycaster.intersectObjects( group.children );

}

function intersectObjects( controller ) {

    // Do not highlight when already selected

    if ( controller.userData.selected !== undefined ) return;

    const line = controller.getObjectByName( 'line' );
    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

        const intersection = intersections[ 0 ];

        const object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push( object );

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function cleanIntersected() {

    while ( intersected.length ) {

        const object = intersected.pop();
        object.material.emissive.r = 0;

    }

}

function onSelectStartMove() {
    guidingController = this;
    guidelight.intensity = 1;
    this.add(guideline);
    // scene.add(guidesprite);
}

function onSelectEndMove(targetPoint) {
    if (guidingController === this) {
        const headPos = renderer.xr.getCamera(camera).position;
        const offset = targetPoint.sub(headPos);
        offset.y = 0;

        // feet position
        // const feetPos = renderer.xr.getCamera(camera).getWorldPosition(tempVec);
        // feetPos.y = 0;

        // cursor position
        const p = guidingController.getWorldPosition(tempVecP);
        const v = guidingController.getWorldDirection(tempVecV);
        v.multiplyScalar(6);
        const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;
        const cursorPos = positionAtT(tempVec1,t,p,v,g);

        // Offset
        // const offset = cursorPos.addScaledVector(feetPos ,-1);

        // Do the teleport
        // camera.position.add(offset);
        cameraRig.position.add(offset);

        // clean up
        guidingController = null;
        guidelight.intensity = 0;
        this.remove(guideline);
        // scene.remove(guidesprite);
    }
}

function teleportCallBack() {
    if (guidingController) {
        // Controller start position
        const p = guidingController.getWorldPosition(tempVecP);

        // Set Vector V to the direction of the controller, at 1m/s
        const v = guidingController.getWorldDirection(tempVecV);

        // Scale the initial velocity to 6m/s
        v.multiplyScalar(6);

        // Time for tele ball to hit ground
        const t = (-v.y  + Math.sqrt(v.y**2 - 2*p.y*g.y))/g.y;

        const vertex = tempVec.set(0,0,0);
        for (let i=1; i<=lineSegments; i++) {

            // set vertex to current position of the virtual ball at time t
            positionAtT(vertex,i*t/lineSegments,p,v,g);
            guidingController.worldToLocal(vertex);
            vertex.toArray(lineGeometryVertices,i*3);
        }
        guideline.geometry.attributes.position.needsUpdate = true;

        // Place the light and sprite near the end of the poing
        positionAtT(guidelight.position,t*0.98,p,v,g);
        // positionAtT(guidesprite.position,t*0.98,p,v,g);
    }
};

var cameraRig = new Group();
cameraRig.add(camera);
cameraRig.add(controller1);
cameraRig.add(controller2);
cameraRig.position.set(32,6,0)
scene.add(cameraRig);

export {controller1, controller2, cleanIntersected, intersectObjects, teleportCallBack, cameraRig};