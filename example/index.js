import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ViewCube } from '../src/index.js';
import ViewCubeHelper from '../src/ViewCubeHelper.js';

var scene = new THREE.Scene();
var perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 5;
var orthographicCamera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    1000
);

perspectiveCamera.position.z = 5;
orthographicCamera.position.z = 5;

var camera = perspectiveCamera;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var loader = new GLTFLoader();
loader.load('./models/25042_Perseverance.glb', function (object) {
    object.scene.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(object.scene);
});

var controls = new OrbitControls(camera, renderer.domElement);

const options = {
    viewCubeVisible: true,
    // ...options,
};
const viewCube = new ViewCube(camera);
viewCube.rollButtonType = ViewCubeHelper.ROLL_BUTTON_TYPE.ALWAYS_ON;

const world = scene;//this.world;
world.addEventListener('orientation-changed', () => {
    viewCube.setAxesOrientation(this.world.quaternion);
});

// const renderer = this.renderer;
const viewCubeContainer = document.createElement('div');

// TODO: this is making an assumption that the cube orientation should align to mars rover
// axes (X is forward, Y is left)
viewCube.setFaceOrientation(new THREE.Euler(0, Math.PI / 2, 0));

viewCubeContainer.style.position = 'relative';
viewCubeContainer.appendChild(viewCube.domElement);

viewCube.domElement.style.position = 'absolute';
viewCube.domElement.style.right = '0';
viewCube.domElement.style.top = '0';

// viewCube.xDomElement.style.visibility = 'hidden';
// viewCube.yDomElement.style.visibility = 'hidden';
// viewCube.zDomElement.style.visibility = 'hidden';

viewCube.onChange = () => {
};

const cameraToggle = document.createElement('div');
cameraToggle.style.borderRadius = '10px';
cameraToggle.style.width = '20px';
cameraToggle.style.height = '20px';
cameraToggle.style.background = 'rgba(0, 0, 0, 0.25)';
cameraToggle.style.right = '10px';
cameraToggle.style.bottom = '0';
cameraToggle.style.position = 'absolute';

const lineStyles = 'stroke: white; stroke-width: 1.5; vector-effect: non-scaling-stroke; stroke-linecap: round;';
const orthoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
orthoSvg.setAttribute('width', '20');
orthoSvg.setAttribute('height', '20');
orthoSvg.setAttribute('preserveAspectRatio', 'none');
orthoSvg.setAttribute('viewBox', '-0.3 -1 1.6 3');
orthoSvg.setAttributeNS(
    'http://www.w3.org/2000/xmlns/',
    'xmlns:xlink',
    'http://www.w3.org/1999/xlink',
);
orthoSvg.style.display = 'block';
orthoSvg.innerHTML = `
        <line
            x1="0"
            y1="0"
            x2="1"
            y2="0"
            style="${lineStyles}"
        >
        </line>
        <line
            x1="0"
            y1="0.5"
            x2="1"
            y2="0.5"
            style="${lineStyles}"
        >
        </line>
        <line
            x1="0"
            y1="1"
            x2="1"
            y2="1"
            style="${lineStyles}"
        >
        </line>
    `;

const perspSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
perspSvg.setAttribute('width', '20');
perspSvg.setAttribute('height', '20');
perspSvg.setAttribute('preserveAspectRatio', 'none');
perspSvg.setAttribute('viewBox', '-0.3 -1 1.6 3');
perspSvg.setAttributeNS(
    'http://www.w3.org/2000/xmlns/',
    'xmlns:xlink',
    'http://www.w3.org/1999/xlink',
);
perspSvg.style.display = 'block';
perspSvg.innerHTML = `
        <line
            x1="0"
            y1="0.5"
            x2="0.85"
            y2="-0.3"
            style="${lineStyles}"
        >
        </line>
        <line
            x1="0"
            y1="0.5"
            x2="1"
            y2="0.5"
            style="${lineStyles}"
        >
        </line>
        <line
            x1="0"
            y1="0.5"
            x2="0.85"
            y2="1.3"
            style="${lineStyles}"
        >
        </line>
    `;
cameraToggle.appendChild(orthoSvg);
cameraToggle.appendChild(perspSvg);

let orthographic = false;

orthoSvg.style.display = orthographic ? 'block' : 'none';
perspSvg.style.display = orthographic ? 'none' : 'block';

cameraToggle.addEventListener('click', () => {
    orthographic = !orthographic;

    // Preserve camera position and lookAt target when switching
    const oldPosition = camera.position.clone();
    const oldTarget = controls.target.clone(); // Get current target from controls

    camera = orthographic ? orthographicCamera : perspectiveCamera;

    camera.position.copy(oldPosition);
    camera.lookAt(oldTarget);

    // Update OrbitControls to use the new camera
    controls.object = camera;
    controls.target.copy(oldTarget); // Ensure controls maintain the target
    controls.update(); // Update controls after changing camera

    viewCube.camera = camera;
    orthoSvg.style.display = orthographic ? 'block' : 'none';
    perspSvg.style.display = orthographic ? 'none' : 'block';
});

viewCube.domElement.appendChild(cameraToggle);

const cameraIcon = document.createElement('div');
cameraIcon.style.display = 'inline-block';

const _updateViewCubeCenterCallback = () => {
    viewCube.lerpCenter.copy(controls.target);
    viewCube.orbitCenter.copy(controls.target);
};

controls.addEventListener('change', _updateViewCubeCenterCallback);

document.getElementById('viewCubeInset').appendChild(viewCube.domElement);

// Create a directional light
const light = new THREE.DirectionalLight(0xffffff, 3.0);

// move the light back and up a bit
light.position.set(10, 10, 10);

// remember to add the light to the scene
scene.add(light);

var light2 = new THREE.AmbientLight(0x808080);
scene.add(light2);

var light3 =  new THREE.DirectionalLight(0xffffff, 1.0);
light3.position.set(-10, -10, -10);
scene.add(light3);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
