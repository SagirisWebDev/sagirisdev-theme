import * as THREE from "../../../node_modules/three/build/three.module.js";

export default class PulseDistortEffect {
  constructor({
    canvas,
    textureDistortedPath,
    textureMaskPath,
    texturePulseMaskPath,
    texturePulseOverlayMaskPath,
    textureOverlayPath,
    x = 0,
    y = 0,
    maskOffsetX = 0,
    maskOffsetY = 0,
    overlayScale = 1,
    overlayAR = 1/1,
    showMask = false,
    showPulseMask = false,
    showBaseDebugColor = false,
    showDistortedDebug = false,
    showPulseOverlayMask = false,
  }) {
    this.canvas = canvas;
    this.textureDistortedPath = textureDistortedPath;
    this.textureMaskPath = textureMaskPath;
    this.texturePulseMaskPath = texturePulseMaskPath;
    this.texturePulseOverlayMaskPath = texturePulseOverlayMaskPath;
    this.textureOverlayPath = textureOverlayPath;
    this.x = x;
    this.y = y;
    this.maskOffsetX = maskOffsetX;
    this.maskOffsetY = maskOffsetY;
    this.overlayScale = overlayScale;
    this.overlayAR = overlayAR;
    this.showMask = showMask;
    this.showPulseMask = showPulseMask;
    this.showBaseDebugColor = showBaseDebugColor;
    this.showDistortedDebug = showDistortedDebug;
    this.showPulseOverlayMask = showPulseOverlayMask;

    this.mouse = new THREE.Vector2(0.5, 0.5);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    this.camera.position.z = 1;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.raycaster = new THREE.Raycaster();
    this.mouseNDC = new THREE.Vector2();
    this.uniforms = {
      uTexture: { value: null },
      uTextureBase: { value: null },
      uMask: { value: null },
      uPulseMask: { value: null },
      uPulseOverlayMask: { value: null },
      uMaskOffset: { value: new THREE.Vector2(this.maskOffsetX, this.maskOffsetY) },
      uMaskScale: { value: new THREE.Vector2(1 / this.overlayScale, 1 / this.overlayScale) },
      uMouse: { value: this.mouse },
      uTime: { value: 0 },
      uPulseUV: { value: new THREE.Vector2(this.maskOffsetX, -(this.maskOffsetY)) },
      uPulseStartTime: { value: -1.0 },
      uGoldLocal: { value: new THREE.Vector2(0.0, 0.07) },
    };

    this.animate = this.animate.bind(this);
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener("touchstart", (e) => this.onTouchStart(e), { passive: false });
    window.addEventListener("touchmove", (e) => this.onTouchMove(e), { passive: false });
    this.onClick = this.onClick.bind(this);
    this.renderer.domElement.addEventListener('click', this.onClick);
  }

  async init() {
    await this.loadTextures();
    this.createOverlay();
    this.createPlanes();
    this.animate();
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();
    return Promise.all([
      loader.loadAsync(this.textureDistortedPath),
      loader.loadAsync(this.textureDistortedPath), // base texture
      loader.loadAsync(this.textureMaskPath),
      loader.loadAsync(this.texturePulseMaskPath),
      loader.loadAsync(this.texturePulseOverlayMaskPath),
      loader.loadAsync(this.textureOverlayPath)
    ]).then(([distorted, base, mask, pulseMask, pulseOverlayMask, overlay]) => {
      this.textureDistorted = distorted;
      this.textureDistorted.minFilter = THREE.LinearFilter;
      this.textureDistorted.magFilter = THREE.LinearFilter;
      this.textureDistorted.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.textureBase = base;
      this.textureBase.minFilter = THREE.LinearFilter;
      this.textureBase.magFilter = THREE.LinearFilter;
      this.textureBase.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.textureMask = mask;
      this.texturePulseMask = pulseMask;
      this.texturePulseOverlayMask = pulseOverlayMask;
      this.textureOverlay = overlay;
      this.textureOverlay.minFilter = THREE.LinearFilter;
      this.textureOverlay.magFilter = THREE.LinearFilter;
      this.textureOverlay.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.uniforms.uTexture.value = distorted;
      this.uniforms.uTextureBase.value = base;
      this.uniforms.uMask.value = mask;
      this.uniforms.uPulseMask.value = pulseMask;
      this.uniforms.uPulseOverlayMask.value = pulseOverlayMask;
    });
  }

  createOverlay() {
    const overlayMat = new THREE.MeshBasicMaterial({
      map: this.textureOverlay,
      transparent: true,
      depthTest: false,
      alphaTest: 0.05
    });
    const overlayGeo = new THREE.PlaneGeometry(2, 2);
    overlayGeo.translate(0, 0, 0);
    this.overlayPlane = new THREE.Mesh(overlayGeo, overlayMat); 
    this.overlayPlane.renderOrder = 8; // ensure it renders last
    this.updateOverlayScale();
    this.scene.add(this.overlayPlane);
    this.updateOverlayPosition();
  }

  createPlanes() {
    const geometry = new THREE.PlaneGeometry(2, 2);

    const createShaderMat = (frag) => new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: frag
    });

    const addPlane = (mat, order) => {
      const plane = new THREE.Mesh(geometry.clone(), mat);
      plane.renderOrder = order;
      this.scene.add(plane);
      return plane;
    };
    const distortedFrag = `
      uniform sampler2D uTexture;
      uniform sampler2D uMask;
      uniform vec2 uMaskScale;
      uniform vec2 uMaskOffset;
      uniform vec2 uMouse;
      varying vec2 vUv;
      void main() {
        // Align mask to overlay
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
        float overlayAlpha = texture2D(uMask, scaledUv).r;

        // Visible only under overlay's transparent areas
        float invMask = 1.0 - overlayAlpha;

        // Hover distortion (optional)
        float d = distance(vUv, uMouse);
        vec2 dir = normalize(vUv - uMouse);
        float distortWeight = overlayAlpha;
        vec2 offset = dir * 0.02 * exp(-d * 20.0) * distortWeight;

        vec4 col = texture2D(uTexture, vUv + offset);

        // Keep color; gate alpha by invMask so it only shows under overlay cutouts
        gl_FragColor = col;
      }`;
    const debugFrag = `
      uniform sampler2D uTexture;      // distorted texture
      uniform sampler2D uMask;         // overlay mask
      uniform vec2 uMaskScale;
      uniform vec2 uMaskOffset;
      uniform vec2 uMouse;
      varying vec2 vUv;

      void main() {
        // Align mask to overlay
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
        float overlayAlpha = texture2D(uMask, scaledUv).r;

        // Only show UNDER transparent parts of overlay
        float visible = 1.0 - overlayAlpha;
        if (visible < 0.01) discard;

        // Hover distortion, strongest near mouse, tapered by proximity to overlay edge
        float d = distance(vUv, uMouse);
        vec2 dir = normalize(vUv - uMouse);
        float hover = exp(-d * 20.0);              // radial falloff from mouse
        float edgeBoost = smoothstep(0.0, 0.2, visible); // stronger near overlay edge
        vec2 offset = dir * 0.02 * hover * edgeBoost;

        vec4 col = texture2D(uTexture, vUv + offset);

        // Subtle debug tint so you can tell this layer is active
        vec3 tint = mix(col.rgb, vec3(1.0, 0.25, 0.25), 0.15 * edgeBoost);
        gl_FragColor = vec4(tint, 1.0);
      }`;
    const maskFrag = `
      uniform sampler2D uMask;
      uniform vec2 uMaskScale;
      uniform vec2 uMaskOffset;
      varying vec2 vUv;
      void main() {
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
        gl_FragColor = texture2D(uMask, scaledUv);
      }`;
    const baseFrag = `
      uniform sampler2D uTextureBase;
      uniform sampler2D uPulseMask;
      uniform sampler2D uMask;
      uniform vec2 uMaskScale;
      uniform vec2 uMaskOffset;
      uniform float uTime;
      uniform vec2 uPulseUV;
      uniform float uPulseStartTime;
      uniform vec2 uGoldLocal;
      varying vec2 vUv;
      void main() {
        float distFromPulse = distance(vUv, uPulseUV);
        float timeSincePulse = uTime - uPulseStartTime;
        float overlaySize = 1.0 / uMaskScale.x;
        float waveRadius = timeSincePulse * 0.5;
        float waveWidth = 0.05;
        float ring = smoothstep(waveRadius - waveWidth, waveRadius, distFromPulse) * (1.0 - smoothstep(waveRadius, waveRadius + waveWidth, distFromPulse));
        ring *= step(0.0, timeSincePulse);
        vec2 halfExtent = vec2(0.5) / uMaskScale;
        vec2 goldUV = uPulseUV + uGoldLocal * halfExtent;
        float distToGold  = distance(vUv, goldUV);
        float diamondMask = step(distToGold, 0.05);
        float pulseMask = 1.0; // TEMP: ensure the pulse is visible everywhere
        vec2 delta = vUv - uPulseUV;
        float len = max(length(delta), 1e-6);
        vec2 shockOffset = (delta / len) * ring * 0.02 * pulseMask;
        vec2 uv = vUv + shockOffset;
        vec4 color = texture2D(uTextureBase, uv);
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + uMaskOffset + 0.5;
        float overlayAlpha = texture2D(uMask, scaledUv).r;
        float pad = 0.02;
        float alphaThreshold = smoothstep(0.05 - pad, 0.05 + pad, overlayAlpha);
        if (alphaThreshold > 0.5) discard;
        gl_FragColor = vec4(color.rgb, color.a);
      }`;
    const baseLayoutFrag = `
      uniform sampler2D uMask;
      uniform vec2 uMaskScale;
      uniform vec2 uMaskOffset;
      varying vec2 vUv;
      void main() {
        vec2 scaledUv = vUv * uMaskScale + uMaskOffset + (0.5 - 0.5 * uMaskScale);
        float overlayAlpha = texture2D(uMask, scaledUv).r;
        float pad = 0.02;
        float alphaThreshold = smoothstep(0.05 - pad, 0.05 + pad, overlayAlpha);
        if (alphaThreshold > 0.5) discard;
        gl_FragColor = vec4(1.0, 0.0, 0.0, 0.3);
      }`;
    const pulseMaskFrag = `
      uniform sampler2D uPulseMask;
      uniform sampler2D uMask;
      uniform vec2 uMaskScale;
      uniform vec2 uMaskOffset;
      uniform vec2 uPulseUV;
      varying vec2 vUv;
      void main() {
        vec2 goldUV = uPulseUV;
        float distToGold = distance(vUv, goldUV);
        vec4 texel = texture2D(uPulseMask, vUv);
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
        float overlayAlpha = texture2D(uMask, scaledUv).r;
        float edgeFade = smoothstep(0.05, 0.1, overlayAlpha);
        float goldFade = 1.0 - smoothstep(0.045, 0.06, distToGold);
        float visibility = max(goldFade, 1.0 - edgeFade);
        if (visibility < 0.05) discard;
        gl_FragColor = vec4(texel.rgb, visibility);
        
      }`;
    const pulseOverlayMaskFrag = `
      uniform sampler2D uPulseMask;   // screen-space pulse mask (vUv)
      uniform sampler2D uPulseOverlayMask;    // your new white overlay-shape/edge mask (aligned to overlay)
      uniform sampler2D uMask;        // overlay mask (for in-gap gating)
      uniform vec2  uMaskScale;
      uniform vec2  uMaskOffset;
      uniform float uTime;
      uniform vec2  uPulseUV;
      uniform float uPulseStartTime;
      varying vec2 vUv;

      void main() {
        // 1) ring timing
        float t = uTime - uPulseStartTime;
        if (t < 0.0) discard;

        // 2) ring radius starting at overlay edge (half-extent heuristic)
        float speed = 0.5;
        float ringWidth = 0.05;
        float halfExtent = 0.5 / max(uMaskScale.x, uMaskScale.y);
        float waveRadius = halfExtent + t * speed;

        float d = distance(vUv, uPulseUV);
        float ring = smoothstep(waveRadius - ringWidth, waveRadius, d)
                  * (1.0 - smoothstep(waveRadius, waveRadius + ringWidth, d));

        // 3) in-gap test (only inside overlay)
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
        float overlayAlpha = texture2D(uMask, scaledUv).r;
        float inGap = step(0.5, overlayAlpha);  // 1 when inside overlay, 0 outside

        // 4) combine your pulse mask (screen) with the new join/edge mask (overlay-aligned)
        float pulseTex = texture2D(uPulseMask, vUv).r;
        float joinTex  = texture2D(uPulseOverlayMask,  scaledUv).r;
        float maskCombined = max(pulseTex, joinTex);

        // 5) final intensity (only inside the gap)
        float intensity = ring * maskCombined * inGap;
        if (intensity < 0.01) discard;

        // White pulse; use additive blending in material
        gl_FragColor = vec4(vec3(intensity), intensity);
      }`;

    this.distoredPlane = addPlane(createShaderMat(distortedFrag), 1);
    this.maskPlane = addPlane(createShaderMat(maskFrag), 2);
    this.distortedDebugPlane = addPlane(createShaderMat(debugFrag), 3);
    this.basePlane = addPlane(createShaderMat(baseFrag), 4);
    this.pulseOverlayMaskPlane = addPlane(createShaderMat(pulseOverlayMaskFrag), 5);
    this.baseLayoutPlane = addPlane(createShaderMat(baseLayoutFrag), 6);
    this.pulseMaskPlane = addPlane(createShaderMat(pulseMaskFrag), 7);

    this.maskPlane.visible = this.showMask;
    this.pulseMaskPlane.visible = this.showPulseMask;
    this.pulseOverlayMaskPlane.visible = this.showPulseOverlayMask;
    this.baseLayoutPlane.visible = this.showBaseDebugColor;
    this.distortedDebugPlane.visible = this.showDistortedDebug;
  }

  updateOverlayPosition() {
    this.overlayPlane.position.set(this.x, this.y, 0);
  }

  updateOverlayScale() {

    // Maintain aspect ratio
    const overlayAspect = this.textureOverlay.image.width / this.textureOverlay.image.height;
    const screenAspect = window.innerWidth / window.innerHeight;
  
    let scaleX = this.overlayScale;
    let scaleY = scaleX / this.overlayAR;
  
    this.overlayPlane.scale.set(scaleX, scaleY, 1);

    // Update distortion mask
    this.updateDistortMaskScale();
  }

  updateDistortMaskScale() {
    this.uniforms.uMaskScale.value.set(1 / this.overlayPlane.scale.x, 1 / this.overlayPlane.scale.y);
    this.updateMaskOffset();
  }

  updateMaskOffset() {
    this.overlayPlane.updateMatrixWorld(true);
    const overlayWorld = new THREE.Vector3();
    overlayWorld.setFromMatrixPosition(this.overlayPlane.matrixWorld);
    overlayWorld.project(this.camera);
    const overlayCenterUV = new THREE.Vector2(overlayWorld.x * 0.5 + 0.5, overlayWorld.y * 0.5 + 0.5);
    const uv = new THREE.Vector2(
      0.5 + this.maskOffsetX,
      0.5 + this.maskOffsetY
    );
    this.uniforms.uMaskOffset.value.copy(uv.sub(new THREE.Vector2(0.5, 0.5)));
  }

  setAspectRatio(width = window.innerWidth, height = window.innerHeight, ratio = 4/3) {
    const windowAspect = width / height;
    const targetAspect = ratio
    if (windowAspect > targetAspect) {
      // Window is too wide
      width = height * targetAspect;
    } else {
      // Window is too tall
      height = width / targetAspect;
    }

    return { width, height };
  }

  onResize() {
    // const { width, height } = this.setAspectRatio(window.innerWidth, window.innerHeight, 3/2);
    // this.renderer.setSize(width, height);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.updateOverlayScale();
    this.updateOverlayPosition();
    this.updateMaskOffset();
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX / window.innerWidth;
    this.mouse.y = 1 - e.clientY / window.innerHeight;
  }
  onClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    );

    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObject(this.overlayPlane, true);
    if (!hits.length || !hits[0].uv) return;

    // 1) validate click is near the gold diamond in overlay-local UV
    const clickUV  = hits[0].uv;                    // 0..1 on overlay quad
    const diamondUVLocal = new THREE.Vector2(0.5, 0.535);
    const threshold = 0.08;                         // tweak if needed
    if (clickUV.distanceTo(diamondUVLocal) > threshold) return;

    // 2) convert diamond overlay-UV -> screen UV (0..1) for the base shader
    const diamondScreenUV = this.getPulseUVFromPlaneUV(this.overlayPlane, diamondUVLocal, this.camera);

    // 3) set origin + fire
    this.uniforms.uPulseUV.value.copy(diamondScreenUV);
    this.uniforms.uPulseStartTime.value = this.uniforms.uTime.value;
  }
  
  onTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.renderer.domElement.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = 1.0 - (touch.clientY - rect.top) / rect.height;
  
      this.mouse.x = x;
      this.mouse.y = y;
    }
  }
  
  onTouchStart(e) {
    this.onTouchMove(e); // update mouse position first
  
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) / rect.width;
    const y = 1.0 - (e.touches[0].clientY - rect.top) / rect.height;
  
    const goldUV = new THREE.Vector2(0.5, 0.535);
    const goldScreen = this.getPulseUVFromPlaneUV(this.overlayPlane, goldUV, this.camera);
    const dist = goldScreen.distanceTo(new THREE.Vector2(x, y));
  
    if (dist < 0.05) {
      this.uniforms.uPulseStartTime.value = this.uniforms.uTime.value;
      this.uniforms.uPulseUV.value.copy(goldScreen);
    }
  }
  
  animate() {
    requestAnimationFrame(this.animate);
    this.uniforms.uTime.value = performance.now() / 1000;
    const goldUV = new THREE.Vector2(0.485, 0.475);
    this.renderer.render(this.scene, this.camera);
  }

  getPulseUVFromPlaneUV(plane, uv, camera) {
    const posAttr = plane.geometry.attributes.position;
    const uvAttr = plane.geometry.attributes.uv;
    const i = [0, 1, 2];
    const uvA = new THREE.Vector2().fromBufferAttribute(uvAttr, i[0]);
    const uvB = new THREE.Vector2().fromBufferAttribute(uvAttr, i[1]);
    const uvC = new THREE.Vector2().fromBufferAttribute(uvAttr, i[2]);
    const a = new THREE.Vector3().fromBufferAttribute(posAttr, i[0]);
    const b = new THREE.Vector3().fromBufferAttribute(posAttr, i[1]);
    const c = new THREE.Vector3().fromBufferAttribute(posAttr, i[2]);
    const bary = this.getBarycentricWeights(uv, uvA, uvB, uvC);
    const pos = new THREE.Vector3()
      .addScaledVector(a, bary.x)
      .addScaledVector(b, bary.y)
      .addScaledVector(c, bary.z);
    plane.updateMatrixWorld();
    pos.applyMatrix4(plane.matrixWorld);
    const ndc = pos.project(camera);
    return new THREE.Vector2(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);
  }

  getBarycentricWeights(p, a, b, c) {
    const v0 = b.clone().sub(a);
    const v1 = c.clone().sub(a);
    const v2 = p.clone().sub(a);
    const d00 = v0.dot(v0);
    const d01 = v0.dot(v1);
    const d11 = v1.dot(v1);
    const d20 = v2.dot(v0);
    const d21 = v2.dot(v1);
    const denom = d00 * d11 - d01 * d01;
    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    return new THREE.Vector3(1 - v - w, v, w);
  }
}
