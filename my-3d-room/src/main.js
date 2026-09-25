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
const startPosition = new THREE.Vector3(-3, 0.8, 0);
const targetPosition = new THREE.Vector3(-2.5, 3, -2.5);
let cameraIntro = 0;

camera.position.copy(startPosition);
const controls = new OrbitControls(camera, renderer.domElement);
let currentTarget = new THREE.Vector3(0, 0, 0);
controls.target.copy(currentTarget);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.1));
const light = new THREE.PointLight(0xffffff, 15);
light.castShadow = true;
// scene.add(light);

const sun = new THREE.DirectionalLight(0xffffff, 0.1);
// const sun = new THREE.DirectionalLight(0x000000, 3);
sun.castShadow = true;
scene.add(sun);

const exrSkyboxUrl = `${import.meta.env.BASE_URL}coures/2dPicture/sky1k.exr`;
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

const textureLoader = new THREE.TextureLoader();

// const screens = {
//   home: textureLoader.load("/screens/screen-home.png"),
//   project: textureLoader.load("/screens/screen-project.png"),
//   about: textureLoader.load("/screens/screen-about.png"),
//   game: textureLoader.load("/screens/screen-game.png"),
// };

// --------------------- VIDEO -------------------------
const video = document.createElement("video");

video.muted = true;
video.playsInline = true;

const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.center.set(0.5, 0.5);
videoTexture.rotation = Math.PI / 2;
videoTexture.repeat.set(0.8, 0.8);
videoTexture.offset.set(0.1, 0.1);
videoTexture.wrapS = THREE.ClampToEdgeWrapping;
videoTexture.wrapT = THREE.ClampToEdgeWrapping;

const videoList = [
  `${import.meta.env.BASE_URL}video/game1.mp4`,
  `${import.meta.env.BASE_URL}video/game2.mp4`,
];

let currentVideo = 0;

function playVideo(index) {
  currentVideo = index;

  video.src = videoList[currentVideo];
  video.load();
  video.play();
}

video.addEventListener("ended", () => {
  currentVideo++;

  if (currentVideo >= videoList.length) {
    currentVideo = 0;
  }

  playVideo(currentVideo);
});
// --------------------- VIDEO -------------------------

const uniforms = {
  uTime: { value: 0.0 },
  uTexture: {
    value: new THREE.TextureLoader().load(
      `${import.meta.env.BASE_URL}coures/2dPicture/waterTexture.jpg`,
    ),
  },
};

const vertexShader = `
    uniform float uTime;

    varying vec2 vUv;

    void main() {
      vUv = uv;

      vec3 pos = position;

      // เริ่มเขียน vertex shader ที่นี่
      pos.z += sin(pos.x * 5.0 + (uTime*7.0)) * 0.05;
      // pos.x += sin(pos.z * 5.0 + uTime) * 0.5;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

const fragmentShader = `
    precision mediump float;

    uniform float uTime;

    varying vec2 vUv;

    uniform sampler2D uTexture;

    void main() {
      vec3 color = texture2D(uTexture, vUv).rgb;
      gl_FragColor = vec4(color, 1.0);

      // เริ่มเขียน fragment shader ที่นี่
      //vec3 color = vec3(vUv, 0.5);

      
      // vec3 color = vec3(0.1, 0.7, 0.9);

      // gl_FragColor = vec4(color, 1.0);
    }
  `;

// ใช้ segment หลายช่อง เพื่อให้ vertex shader ดัดรูปทรงได้ละเอียด
// const Planegeometry = new THREE.PlaneGeometry(1.5, 1.5, 32, 32);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  side: THREE.DoubleSide,
});

// const mesh = new THREE.Mesh(Planegeometry, material);
// scene.add(mesh);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 64, 64),
  material,
  // new THREE.MeshStandardMaterial({
  //   color: 0x2389da,
  //   roughness: 0.8,
  //   metalness: 0.1,
  // }),
);
floor.rotation.x = -Math.PI / 2;
floor.rotation.z = THREE.MathUtils.degToRad(-140);
floor.receiveShadow = true;
scene.add(floor);

const clock = new THREE.Clock();
let mixer;
const can_picking = [];
let sign1 = null;
let sign2 = null;
let sign3 = null;
let monitor = null;

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
    scene.add(model);

    gltf.scene.traverse((object) => {
      // console.log(object.name);

      if (object.name == "signLED1") {
        sign1 = object;
        sign1.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
        playVideo(0);
        can_picking.push(object);
      }
      if (object.name == "signLED2") {
        sign2 = object;
        can_picking.push(object);
      }
      if (object.name == "signLED3") {
        sign3 = object;
        can_picking.push(object);
      }
      if (object.name == "Monitor001") {
        monitor = object;
        can_picking.push(object);
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

// sign1.material = new THREE.MeshBasicMaterial({
//   map: videoTexture,
// });

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let picked_object = null;
let returningHome = false;
renderer.domElement.addEventListener("click", onPick);
function onPick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  const x = (e.clientX ?? e.touches[0].clientX) - r.left;
  const y = (e.clientY ?? e.touches[0].clientY) - r.top;
  pointer.x = (x / r.width) * 2 - 1;
  pointer.y = -(y / r.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(can_picking, false)[0];
  if (hit == null) {
    if (picked_object != null) {
      returningHome = true;
    }
    picked_object = null;
    return;
  }
  picked_object = hit.object;

  const worldPosition = new THREE.Vector3();
  picked_object.getWorldPosition(worldPosition);

  
  // console.log("Picked:", picked_object.name);
  // console.log("World position:", worldPosition);
}

let lastTime = 0;

function animate(time) {
  uniforms.uTime.value = time * 0.001;

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  const deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
  lastTime = time;

  if (cameraIntro < 1) {
    cameraIntro = Math.min(cameraIntro + deltaTime * 0.5, 1);
    const eased = cameraIntro * cameraIntro * (3 - 2 * cameraIntro);
    camera.position.lerpVectors(startPosition, targetPosition, eased);
  }

  if (picked_object) {
    // controls.target = picked_object.position;

    // controls.target.lerpVectors(targetPosition, picked_object.position, 0.1);
    if (picked_object) {
      const worldPosition = new THREE.Vector3();
      picked_object.getWorldPosition(worldPosition);
      let newPosition = worldPosition.clone();
      const offset = new THREE.Vector3(0, 0, 0);
      if (picked_object.name.startsWith("sign")) {
        offset.z = -0.4;
      } else {
        offset.y = 0.4;
      }

      offset.applyQuaternion(picked_object.quaternion);

      newPosition.add(offset);
      controls.target.lerp(worldPosition, 0.05);
      camera.position.lerp(newPosition, 0.05);
    }
  }

  if (returningHome) {
    camera.position.lerp(targetPosition, 0.025);
    controls.target.lerp(currentTarget, 0.025);

    if (camera.position.distanceTo(targetPosition) < 0.5) {
      returningHome = false;
      console.log("check");
      
    }
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
