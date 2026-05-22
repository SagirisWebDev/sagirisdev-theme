import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Raycaster
const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
camera.position.z = 2;

// Load textures
const loader = new THREE.TextureLoader();
const textureDistorted = loader.load('black-sand.jpg'); // distorted image
const textureMask = loader.load('swd-emb-mask.webp'); // grayscale/alpha mask
const textureOverlay = loader.load('swd-brandmark.webp'); // webp image to appear above

// Uniforms shared with distortion shader
const uniforms = {
  uTexture: { value: textureDistorted },
  uMask: { value: textureMask },
  uMaskScale: { value: new THREE.Vector2(1.0, 1.0) },
  uMaskOffset: { value: new THREE.Vector2(0.0, 0.0) },
  uMouse: { value: mouse }
};

// Shader material for base distortion
const baseMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform sampler2D uMask;
    uniform vec2 uMaskScale;
    uniform vec2 uMaskOffset;
    uniform vec2 uMouse;
    varying vec2 vUv;

    void main() {
      float dist = distance(vUv, uMouse);
      vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
      float mask = texture2D(uMask, scaledUv).r;
      vec2 distortedUV = vUv + normalize(vUv - uMouse) * 0.001 * mask / dist;
      gl_FragColor = texture2D(uTexture, distortedUV);
    }
  `,
  transparent: true
});

// Material for top layer image
const overlayMaterial = new THREE.MeshBasicMaterial({
  map: textureOverlay,
  transparent: true,
  depthTest: false, // makes sure it draws *on top*
});

// Plane for distorted image
uniforms.uMaskScale.value.set(3, 3);
const basePlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), baseMaterial);
scene.add(basePlane);

// Plane for overlay image
const overlayGeometry = new THREE.PlaneGeometry(2, 2);
overlayGeometry.center();
const overlayPlane = new THREE.Mesh(overlayGeometry, overlayMaterial);
overlayPlane.renderOrder = 1; // ensure it renders second
overlayPlane.scale.set(0.33, 0.33, 1);
scene.add(overlayPlane);

// Handle mouse move
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / window.innerWidth;
  mouse.y = 1 - e.clientY / window.innerHeight;
});

function updatePulsePosition(object3D, camera) {
  const vector = new THREE.Vector3();
  vector.setFromMatrixPosition(object3D.matrixWorld);
  vector.project(camera); // convert to screen space

  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

  const pulseEl = document.getElementById('pulse-marker');
  pulseEl.style.left = `${x}px`;
  pulseEl.style.top = `${y}px`;
}

function animate() {
  requestAnimationFrame(animate);
  updatePulsePosition(overlayPlane, camera);
  renderer.render(scene, camera);
}

animate();