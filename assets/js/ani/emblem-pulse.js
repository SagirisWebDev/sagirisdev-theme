import {
  Vector2,
  Vector3,
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Raycaster,
  TextureLoader,
  LinearFilter,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
} from 'three';

const THEME_IMG = '/wp-content/themes/sagirisdev/assets/img';

const TEXTURES = {
  distorted: `${THEME_IMG}/black-sand-1.webp`,
  mask: `${THEME_IMG}/swd-emb-mask.webp`,
  pulseMask: `${THEME_IMG}/pulse-mask.webp`,
  pulseOverlayMask: `${THEME_IMG}/pulse-overlay-mask.webp`,
  overlay: `${THEME_IMG}/swd-brandmarkv2.webp`,
};

const FALLBACK_SRC = TEXTURES.overlay;
const FALLBACK_ALT = 'Sagiris Web Development emblem';

const MAX_RENDER_WIDTH = 1535;

const TIERS = [
  { minWidth: 1535, conf: { x: -0.5, y: 0.33, maskOffsetX: 0.833, maskOffsetY: -0.55, overlayScale: 0.3, overlayAR: 1 / 1 } },
  { minWidth: 860,  conf: { x: -0.7, y: 0.33, maskOffsetX: 1.17,  maskOffsetY: -0.55, overlayScale: 0.3, overlayAR: 1 / 1 } },
  { minWidth: 0,    conf: { x: -0.2, y: 0.33, maskOffsetX: 0.17,  maskOffsetY: -0.49, overlayScale: 0.6, overlayAR: 16 / 9 } },
];

function defaultTuneFor(width) {
  return TIERS.find((t) => width >= t.minWidth).conf;
}

const DEBUG_DEFAULTS = {
  showMask: false,
  showPulseMask: false,
  showBaseDebugColor: false,
  showDistortedDebug: false,
  showPulseOverlayMask: false,
};

export function mount(canvas, opts = {}) {
  if (!canvas) throw new Error('emblem-pulse: canvas element required');

  const tuneFor = opts.tuneFor || defaultTuneFor;
  const debug = { ...DEBUG_DEFAULTS, ...(opts.debug || {}) };

  if (!shouldRunAnimation()) {
    const fallback = mountFallback(canvas);
    return { destroy: () => fallback.destroy() };
  }

  const engine = new Engine(canvas, tuneFor, debug);
  let destroyed = false;
  let fallback = null;

  engine.start().catch((err) => {
    if (destroyed) return;
    // eslint-disable-next-line no-console
    console.error('emblem-pulse: failed to start, falling back to static image', err);
    engine.destroy();
    fallback = mountFallback(canvas);
  });

  return {
    destroy() {
      destroyed = true;
      engine.destroy();
      if (fallback) fallback.destroy();
    },
  };
}

function shouldRunAnimation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return hasWebGL();
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function mountFallback(canvas) {
  // Fallback composition mimics the WebGL desktop tier (~30% of canvas width, offset left).
  // The img sizes itself; the wrapper inherits because it's position:absolute with no
  // explicit dimensions. max-width: none overrides Tailwind preflight's img max-width.
  const img = document.createElement('img');
  img.src = FALLBACK_SRC;
  img.alt = FALLBACK_ALT;
  img.decoding = 'async';
  img.style.cssText = `
    width: min(40vw, ${Math.round(MAX_RENDER_WIDTH * 0.3)}px);
    height: auto;
    aspect-ratio: 1 / 1;
    max-width: none;
    margin-top: 10vh;
    margin-left: 5vw;
    opacity: 1;
    display: block;
  `;
  img.setAttribute('data-emblem-fallback', '');
  canvas.style.display = 'none';
  canvas.parentNode.insertBefore(img, canvas.nextSibling);
  return {
    destroy() {
      img.remove();
      canvas.style.display = '';
    },
  };
}

class Engine {
  constructor(canvas, tuneFor, debug) {
    this.canvas = canvas;
    this.tuneFor = tuneFor;
    this.debug = debug;
    this.destroyed = false;
    this.firstFrameRendered = false;
    this.rafId = null;
    this.resizeRafId = null;

    this.mouse = new Vector2(10, 10); // off-screen until cursor enters canvas
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 10);
    this.camera.position.z = 1;
    this.renderer = new WebGLRenderer({ canvas, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.applyRenderSize();
    this.raycaster = new Raycaster();

    const conf = this.tuneFor(window.innerWidth);
    this.applyConfig(conf);
    this.activeTier = conf;

    this.uniforms = {
      uTexture: { value: null },
      uTextureBase: { value: null },
      uMask: { value: null },
      uPulseMask: { value: null },
      uPulseOverlayMask: { value: null },
      uMaskOffset: { value: new Vector2(this.maskOffsetX, this.maskOffsetY) },
      uMaskScale: { value: new Vector2(1 / this.overlayScale, 1 / this.overlayScale) },
      uMouse: { value: this.mouse },
      uTime: { value: 0 },
      uPulseUV: { value: new Vector2(this.maskOffsetX, -this.maskOffsetY) },
      uPulseStartTime: { value: -1.0 },
      uGoldLocal: { value: new Vector2(0.0, 0.07) },
    };

    this.animate = this.animate.bind(this);

    // Bound listeners (kept for cleanup)
    this._onResize = () => this.scheduleResize();
    this._onMouseMove = (e) => this.onMouseMove(e);
    this._onMouseLeaveWindow = () => this.mouse.set(10, 10);
    this._onClick = (e) => this.onClick(e);
    this._onTouchStart = (e) => this.onTouchStart(e);
    this._onTouchMove = (e) => this.onTouchMove(e);

    window.addEventListener('resize', this._onResize);
    window.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseleave', this._onMouseLeaveWindow);
    window.addEventListener('click', this._onClick);
    window.addEventListener('touchstart', this._onTouchStart, { passive: false });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });
  }

  applyConfig({ x, y, maskOffsetX, maskOffsetY, overlayScale, overlayAR }) {
    this.x = x;
    this.y = y;
    this.maskOffsetX = maskOffsetX;
    this.maskOffsetY = maskOffsetY;
    this.overlayScale = overlayScale;
    this.overlayAR = overlayAR;
  }

  applyRenderSize() {
    this.renderer.setSize(Math.min(window.innerWidth, MAX_RENDER_WIDTH), window.innerHeight);
  }

  async start() {
    await this.loadTextures();
    if (this.destroyed) return;
    this.createOverlay();
    this.createPlanes();
    this.animate();
  }

  async loadTextures() {
    const loader = new TextureLoader();
    const needsPulseMask = this.debug.showPulseMask || this.debug.showPulseOverlayMask;
    const [distorted, mask, pulseOverlayMask, overlay, pulseMask] = await Promise.all([
      loader.loadAsync(TEXTURES.distorted),
      loader.loadAsync(TEXTURES.mask),
      loader.loadAsync(TEXTURES.pulseOverlayMask),
      loader.loadAsync(TEXTURES.overlay),
      needsPulseMask ? loader.loadAsync(TEXTURES.pulseMask) : Promise.resolve(null),
    ]);

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    distorted.minFilter = LinearFilter;
    distorted.magFilter = LinearFilter;
    distorted.anisotropy = maxAniso;
    overlay.minFilter = LinearFilter;
    overlay.magFilter = LinearFilter;
    overlay.anisotropy = maxAniso;

    this.textureDistorted = distorted;
    this.textureMask = mask;
    this.texturePulseOverlayMask = pulseOverlayMask;
    this.textureOverlay = overlay;
    this.texturePulseMask = pulseMask;

    this.uniforms.uTexture.value = distorted;
    this.uniforms.uTextureBase.value = distorted;
    this.uniforms.uMask.value = mask;
    this.uniforms.uPulseOverlayMask.value = pulseOverlayMask;
    if (pulseMask) this.uniforms.uPulseMask.value = pulseMask;
  }

  createOverlay() {
    const overlayMat = new MeshBasicMaterial({
      map: this.textureOverlay,
      transparent: true,
      depthTest: false,
      alphaTest: 0.05,
    });
    const overlayGeo = new PlaneGeometry(2, 2);
    this.overlayPlane = new Mesh(overlayGeo, overlayMat);
    this.overlayPlane.renderOrder = 8;
    this.updateOverlayScale();
    this.scene.add(this.overlayPlane);
    this.updateOverlayPosition();
  }

  createPlanes() {
    const geometry = new PlaneGeometry(2, 2);

    const make = (frag) => new ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: frag,
    });

    const addPlane = (mat, order) => {
      const plane = new Mesh(geometry.clone(), mat);
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
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
        float overlayAlpha = texture2D(uMask, scaledUv).r;
        float d = distance(vUv, uMouse);
        vec2 dir = normalize(vUv - uMouse);
        float distortWeight = overlayAlpha;
        vec2 offset = dir * 0.02 * exp(-d * 20.0) * distortWeight;
        vec4 col = texture2D(uTexture, vUv + offset);
        gl_FragColor = col;
      }`;

    const debugFrag = `
      uniform sampler2D uTexture;
      uniform sampler2D uMask;
      uniform vec2 uMaskScale;
      uniform vec2 uMaskOffset;
      uniform vec2 uMouse;
      varying vec2 vUv;
      void main() {
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
        float overlayAlpha = texture2D(uMask, scaledUv).r;
        float visible = 1.0 - overlayAlpha;
        if (visible < 0.01) discard;
        float d = distance(vUv, uMouse);
        vec2 dir = normalize(vUv - uMouse);
        float hover = exp(-d * 20.0);
        float edgeBoost = smoothstep(0.0, 0.2, visible);
        vec2 offset = dir * 0.02 * hover * edgeBoost;
        vec4 col = texture2D(uTexture, vUv + offset);
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
      uniform sampler2D uMask;
      uniform vec2 uMaskScale;
      uniform vec2 uMaskOffset;
      uniform float uTime;
      uniform vec2 uPulseUV;
      uniform float uPulseStartTime;
      varying vec2 vUv;
      void main() {
        float distFromPulse = distance(vUv, uPulseUV);
        float timeSincePulse = uTime - uPulseStartTime;
        float waveRadius = timeSincePulse * 0.5;
        float waveWidth = 0.05;
        float ring = smoothstep(waveRadius - waveWidth, waveRadius, distFromPulse)
                   * (1.0 - smoothstep(waveRadius, waveRadius + waveWidth, distFromPulse));
        ring *= step(0.0, timeSincePulse);
        vec2 delta = vUv - uPulseUV;
        float len = max(length(delta), 1e-6);
        vec2 shockOffset = (delta / len) * ring * 0.02;
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
        float distToGold = distance(vUv, uPulseUV);
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
      uniform sampler2D uPulseMask;
      uniform sampler2D uPulseOverlayMask;
      uniform sampler2D uMask;
      uniform vec2  uMaskScale;
      uniform vec2  uMaskOffset;
      uniform float uTime;
      uniform vec2  uPulseUV;
      uniform float uPulseStartTime;
      varying vec2 vUv;
      void main() {
        float t = uTime - uPulseStartTime;
        if (t < 0.0) discard;
        float speed = 0.5;
        float ringWidth = 0.05;
        float halfExtent = 0.5 / max(uMaskScale.x, uMaskScale.y);
        float waveRadius = halfExtent + t * speed;
        float d = distance(vUv, uPulseUV);
        float ring = smoothstep(waveRadius - ringWidth, waveRadius, d)
                  * (1.0 - smoothstep(waveRadius, waveRadius + ringWidth, d));
        vec2 scaledUv = (vUv - 0.5) * uMaskScale + 0.5 + uMaskOffset;
        float overlayAlpha = texture2D(uMask, scaledUv).r;
        float inGap = step(0.5, overlayAlpha);
        float pulseTex = texture2D(uPulseMask, vUv).r;
        float joinTex  = texture2D(uPulseOverlayMask,  scaledUv).r;
        float maskCombined = max(pulseTex, joinTex);
        float intensity = ring * maskCombined * inGap;
        if (intensity < 0.01) discard;
        gl_FragColor = vec4(vec3(intensity), intensity);
      }`;

    this.distortedPlane = addPlane(make(distortedFrag), 1);
    this.maskPlane = addPlane(make(maskFrag), 2);
    this.distortedDebugPlane = addPlane(make(debugFrag), 3);
    this.basePlane = addPlane(make(baseFrag), 4);
    this.pulseOverlayMaskPlane = addPlane(make(pulseOverlayMaskFrag), 5);
    this.baseLayoutPlane = addPlane(make(baseLayoutFrag), 6);
    this.pulseMaskPlane = addPlane(make(pulseMaskFrag), 7);

    this.maskPlane.visible = this.debug.showMask;
    this.pulseMaskPlane.visible = this.debug.showPulseMask;
    this.pulseOverlayMaskPlane.visible = this.debug.showPulseOverlayMask;
    this.baseLayoutPlane.visible = this.debug.showBaseDebugColor;
    this.distortedDebugPlane.visible = this.debug.showDistortedDebug;
  }

  updateOverlayPosition() {
    this.overlayPlane.position.set(this.x, this.y, 0);
  }

  updateOverlayScale() {
    const scaleX = this.overlayScale;
    const scaleY = scaleX / this.overlayAR;
    this.overlayPlane.scale.set(scaleX, scaleY, 1);
    this.uniforms.uMaskScale.value.set(1 / this.overlayPlane.scale.x, 1 / this.overlayPlane.scale.y);
    this.updateMaskOffset();
  }

  updateMaskOffset() {
    this.overlayPlane.updateMatrixWorld(true);
    const overlayWorld = new Vector3();
    overlayWorld.setFromMatrixPosition(this.overlayPlane.matrixWorld);
    overlayWorld.project(this.camera);
    const uv = new Vector2(0.5 + this.maskOffsetX, 0.5 + this.maskOffsetY);
    this.uniforms.uMaskOffset.value.copy(uv.sub(new Vector2(0.5, 0.5)));
  }

  scheduleResize() {
    if (this.resizeRafId != null) return;
    this.resizeRafId = requestAnimationFrame(() => {
      this.resizeRafId = null;
      this.handleResize();
    });
  }

  handleResize() {
    this.applyRenderSize();
    const conf = this.tuneFor(window.innerWidth);
    if (conf !== this.activeTier) {
      this.applyConfig(conf);
      this.activeTier = conf;
    }
    this.updateOverlayScale();
    this.updateOverlayPosition();
  }

  cursorToCanvasUV(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const u = (clientX - rect.left) / rect.width;
    const v = 1 - (clientY - rect.top) / rect.height;
    if (u < 0 || u > 1 || v < 0 || v > 1) return null;
    return { u, v };
  }

  onMouseMove(e) {
    const uv = this.cursorToCanvasUV(e.clientX, e.clientY);
    if (!uv) {
      this.mouse.set(10, 10); // off-screen → exp(-d*20) ≈ 0, no distortion
      return;
    }
    this.mouse.set(uv.u, uv.v);
  }

  onClick(e) {
    const uv = this.cursorToCanvasUV(e.clientX, e.clientY);
    if (!uv) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    );

    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObject(this.overlayPlane, true);
    if (!hits.length || !hits[0].uv) return;

    const clickUV = hits[0].uv;
    const diamondUVLocal = new Vector2(0.5, 0.535);
    if (clickUV.distanceTo(diamondUVLocal) > 0.08) return;

    const diamondScreenUV = this.getPulseUVFromPlaneUV(this.overlayPlane, diamondUVLocal, this.camera);
    this.uniforms.uPulseUV.value.copy(diamondScreenUV);
    this.uniforms.uPulseStartTime.value = this.uniforms.uTime.value;
  }

  onTouchMove(e) {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    const uv = this.cursorToCanvasUV(t.clientX, t.clientY);
    if (!uv) {
      this.mouse.set(10, 10);
      return;
    }
    this.mouse.set(uv.u, uv.v);
  }

  onTouchStart(e) {
    if (e.touches.length === 0) return;
    this.onTouchMove(e);
    const t = e.touches[0];
    const uv = this.cursorToCanvasUV(t.clientX, t.clientY);
    if (!uv) return;

    const goldUV = new Vector2(0.5, 0.535);
    const goldScreen = this.getPulseUVFromPlaneUV(this.overlayPlane, goldUV, this.camera);
    const dist = goldScreen.distanceTo(new Vector2(uv.u, uv.v));
    if (dist < 0.05) {
      this.uniforms.uPulseStartTime.value = this.uniforms.uTime.value;
      this.uniforms.uPulseUV.value.copy(goldScreen);
    }
  }

  animate() {
    if (this.destroyed) return;
    this.rafId = requestAnimationFrame(this.animate);
    this.uniforms.uTime.value = performance.now() / 1000;
    this.renderer.render(this.scene, this.camera);
    if (!this.firstFrameRendered) {
      this.firstFrameRendered = true;
      // Reveal canvas after first real frame; CSS transition on the element handles the fade.
      this.canvas.style.opacity = '1';
    }
  }

  getPulseUVFromPlaneUV(plane, uv, camera) {
    const posAttr = plane.geometry.attributes.position;
    const uvAttr = plane.geometry.attributes.uv;
    const uvA = new Vector2().fromBufferAttribute(uvAttr, 0);
    const uvB = new Vector2().fromBufferAttribute(uvAttr, 1);
    const uvC = new Vector2().fromBufferAttribute(uvAttr, 2);
    const a = new Vector3().fromBufferAttribute(posAttr, 0);
    const b = new Vector3().fromBufferAttribute(posAttr, 1);
    const c = new Vector3().fromBufferAttribute(posAttr, 2);
    const bary = getBarycentricWeights(uv, uvA, uvB, uvC);
    const pos = new Vector3()
      .addScaledVector(a, bary.x)
      .addScaledVector(b, bary.y)
      .addScaledVector(c, bary.z);
    plane.updateMatrixWorld();
    pos.applyMatrix4(plane.matrixWorld);
    const ndc = pos.project(camera);
    return new Vector2(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    if (this.resizeRafId != null) cancelAnimationFrame(this.resizeRafId);

    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseleave', this._onMouseLeaveWindow);
    window.removeEventListener('click', this._onClick);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchmove', this._onTouchMove);

    this.textureDistorted?.dispose();
    this.textureMask?.dispose();
    this.texturePulseOverlayMask?.dispose();
    this.textureOverlay?.dispose();
    this.texturePulseMask?.dispose();

    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
    this.renderer.dispose();
  }
}

function getBarycentricWeights(p, a, b, c) {
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
  return new Vector3(1 - v - w, v, w);
}
