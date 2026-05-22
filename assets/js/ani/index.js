import PulseDistortEffect from "./PulseDistortEffect.js";

const canvas = document.getElementById('canvas');

const mobileConf = {
  x: 0,
  y: 0.33,
  maskOffsetX: 0,
  maskOffsetY: -0.49,
  overlayScale: 0.6,
  overlayAR: 16/9
};

const desktopVW = 860;
const desktopConf = {
  x: -0.425,
  y: 0.33,
  maskOffsetX: 0.71,
  maskOffsetY: -0.55,
  overlayScale: 0.3,
  overlayAR: 1/1,
};

const fourKVW = 2215;
const fourKConf = {
  x: -0.4,
  y: 0.5,
  maskOffsetX: 0.71,
  maskOffsetY: -0.425,
  overlayScale: 0.3,
  overlayAR: 1/1.3,
};

const initAni = (confObj) => {
  const args = {
    canvas: canvas,
    textureDistortedPath: '/wp-content/themes/sagirisdev/assets/img/black-sand.webp',
    textureMaskPath: '/wp-content/themes/sagirisdev/assets/img/swd-emb-mask.webp',
    texturePulseMaskPath: '/wp-content/themes/sagirisdev/assets/img/pulse-mask.webp',
    texturePulseOverlayMaskPath: '/wp-content/themes/sagirisdev/assets/img/pulse-overlay-mask.webp',
    textureOverlayPath: '/wp-content/themes/sagirisdev/assets/img/swd-brandmarkv2.webp',
    x: confObj.x,
    y: confObj.y,
    maskOffsetX: confObj.maskOffsetX,
    maskOffsetY: confObj.maskOffsetY,
    overlayScale: confObj.overlayScale,
    overlayAR: confObj.overlayAR,
    showMask: false,
    showPulseMask: false,
    showBaseDebugColor: false,
    showDistortedDebug: false,
    showPulseOverlayMask: false,
  }
  const ani = new PulseDistortEffect(args);
  ani.init();
}
switch(true) {
  case window.innerWidth < desktopVW:
    initAni(mobileConf);
    break;
  case window.innerWidth >= desktopVW && window.innerWidth < fourKVW:
    initAni(desktopConf);
    break;
  case window.innerWidth >= fourKVW:
    initAni(fourKConf);
    break;
  default:
    initAni(mobileConf);
    break;
}