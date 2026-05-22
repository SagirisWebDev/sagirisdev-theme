import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Raycaster
const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
camera.position.z = 2;
const clock = new THREE.Clock();

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
  uMouse: { value: mouse },
  uTime: { value: 0 },
  uPulseUV: { value: new THREE.Vector2(0.5, 0.5) },
  uPulseStartTime: { value: -1.0 },
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
    uniform float uTime;
    uniform vec2 uPulseUV;
    uniform float uPulseStartTime;

    varying vec2 vUv;

    void main() {
      // Mask sample
      vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
      float mask = texture2D(uMask, scaledUv).r;

      // Default distortion by mouse (very subtle)
      float baseDist = distance(vUv, uMouse);
      vec2 distortion = normalize(vUv - uMouse) * 0.001 * mask / baseDist;
      float dist = distance(vUv, uMouse);
      
      float distFromPulse = distance(vUv, uPulseUV);
      float timeSincePulse = uTime - uPulseStartTime;

      // Create a ring that expands outward
      float waveRadius = timeSincePulse * 0.5; // speed
      float waveWidth = 0.05; // thickness of the ring

      // Smooth edge of ring
      float ring = smoothstep(waveRadius - waveWidth, waveRadius, distFromPulse) *
      (1.0 - smoothstep(waveRadius, waveRadius + waveWidth, distFromPulse));

      // Scale intensity
      ring *= step(0.0, timeSincePulse); // only activate after click

      // Distort away from the center
      vec2 shockOffset = normalize(vUv - uPulseUV) * ring * 0.02;

      // Combine ripple with mouse distortion
      vec2 distortedUV = vUv + normalize(vUv - uMouse) * 0.001 * mask + shockOffset;


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

// Handle clicks for pulse
window.addEventListener('click', (e) => {
  const mouseNDC = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouseNDC, camera);
  const intersects = raycaster.intersectObject(overlayPlane);

  if (intersects.length > 0) {
    const uv = intersects[0].uv;

    // Approximate region for the gold gem in the UV space
    const goldCenter = new THREE.Vector2(0.5, 0.535);
    const threshold = 0.05;

    if (uv.distanceTo(goldCenter) < threshold) {
      // Trigger ripple!
      uniforms.uPulseUV.value.copy(uv);
      uniforms.uPulseStartTime.value = uniforms.uTime.value;


    }
  }
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
  uniforms.uTime.value = performance.now() / 1000;
  updatePulsePosition(overlayPlane, camera);
  renderer.render(scene, camera);
}

animate();