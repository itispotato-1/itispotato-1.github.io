import "./style.css";
import GUI from "lil-gui";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

const app = document.querySelector("#app");
app.innerHTML = `
  <div id="loading-screen" aria-live="polite">
    <div>Loading Scene PBR Shader...</div>
    <div class="loading-track"><div id="loading-bar"></div></div>
    <div id="loading-text">0 / 0</div>
  </div>
`;

const loadingBar = document.querySelector("#loading-bar");
const loadingText = document.querySelector("#loading-text");
const manager = new THREE.LoadingManager();
const loadingScreen = document.querySelector("#loading-screen");

manager.onProgress = (_url, loaded, total) => {
  loadingBar.style.width = `${(loaded / total) * 100}%`;
  loadingText.textContent = `${loaded} / ${total}`;
};
manager.onLoad = () => {
  loadingScreen.classList.add("is-hidden");
  window.setTimeout(() => loadingScreen.remove(), 500);
};
manager.onError = (url) => console.error(`Unable to load ${url}`);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const startPosition = new THREE.Vector3(3, 0.8, 2.5);
const targetPosition = new THREE.Vector3(0.5, 3, 3.5);
let cameraIntro = 0;

camera.position.copy(startPosition);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0x404040, 1));
const light = new THREE.PointLight(0xffffff, 15);
light.castShadow = true;
// scene.add(light);

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.castShadow = true;
// scene.add(sun);

const exrSkyboxUrl = `${import.meta.env.BASE_URL}coures/2dPicture/puresky.exr`;
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new EXRLoader(manager).setDataType(THREE.HalfFloatType).load(
  exrSkyboxUrl,
  (texture) => {
    const skybox = pmremGenerator.fromEquirectangular(texture).texture;
    scene.background = skybox;
    // scene.environment = skybox;

    texture.dispose();
    pmremGenerator.dispose();
  },
  undefined,
  (error) => {
    console.error("Unable to load EXR skybox:", error);
  },
);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: 0x2389da,
    roughness: 0.8,
    metalness: 0.1,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const clock = new THREE.Clock();
let mixer;
const loader = new GLTFLoader(manager);
loader.load(
  `${import.meta.env.BASE_URL}model/factoryV4ColorAnimate.glb`,
  (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;
      }
    });
    model.scale.setScalar(0.8);
    model.position.set(0, 0.5, 0);
    model.rotation.y = THREE.MathUtils.degToRad(140);
    scene.add(model);

    gltf.scene.traverse((object) => {
      console.log(object.name, object.type);
      if (object.name == "LEDfactory Mesh") {
        console.log("พบ Cube:", object);
      }
    });

    mixer = new THREE.AnimationMixer(model);

    const gearRoatateClip = THREE.AnimationClip.findByName(
      gltf.animations,
      "gearRotate",
    );
    const transportClip = THREE.AnimationClip.findByName(
      gltf.animations,
      "transportRotate",
    );

    if (gearRoatateClip) mixer.clipAction(gearRoatateClip).play();
    if (transportClip) mixer.clipAction(transportClip).play();
  },
);

let lastTime = 0;

function animate(time) {
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  const deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
  lastTime = time;

  if (cameraIntro < 1) {
    cameraIntro = Math.min(cameraIntro + deltaTime * 0.5, 1);

    camera.position.lerpVectors(startPosition, targetPosition, cameraIntro);
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
