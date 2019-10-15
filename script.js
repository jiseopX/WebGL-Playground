// THREE START
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import * as e2c from 'electron-to-chromium';
var versions = e2c.fullVersions;
console.log(versions['5.0.0']);
const createLoop = require("raf-loop");
const glslify = require("glslify");

//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
//import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
// three js
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-400, 400, 225, -225);
const renderer = new THREE.WebGLRenderer();
const threeContainer = document.getElementById("three-container");
threeContainer.appendChild(renderer.domElement);
renderer.setSize(800, 450);
const video = document.getElementById("video");

const geometry = new THREE.PlaneGeometry(800, 450);
const Texture = new THREE.VideoTexture(video);
Texture.minFilter = THREE.LinearFilter;
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: Texture
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
//TODO: add light!
mesh.position.z = -1;

const target = new THREE.WebGLRenderTarget(800, 450);
//target.texture.stencil = false;
target.texture.minFilter = THREE.LinearFilter;
target.texture.magFilter = THREE.LinearFilter;
target.texture.format = THREE.RGBFormat;
target.texture.generateMipmaps = false;

const composer = new EffectComposer(renderer, target);

composer.addPass(new RenderPass(scene, camera));

const lut = new ShaderPass({
  vertexShader: glslify(`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `),
  fragmentShader: glslify(`
  precision mediump float;
  #define LUT_FLIP_Y

  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform sampler2D tLookup;

  #pragma glslify: lut = require('glsl-lut')

  void main () {
    gl_FragColor = texture2D(tDiffuse, vUv);
    gl_FragColor.rgb = lut(gl_FragColor, tLookup).rgb;
  }
`),
  uniforms: {
    tDiffuse: { type: "t", value: new THREE.Texture() },
    tLookup: { type: "t", value: new THREE.Texture() }
  }
});
composer.addPass(lut);

const tLookup = new THREE.TextureLoader().load("mercury.png");
tLookup.generateMipmaps = false;
tLookup.minFilter = THREE.LinearFilter;
lut.uniforms.tLookup.value = tLookup;

composer.passes[composer.passes.length - 1].renderToScreen = true;

createLoop(() => {
  composer.passes.forEach(pass => {
    if (pass.uniforms && pass.uniforms.resolution) {
      pass.uniforms.resolution.value.set(800, 450);
    }
  });
  composer.render();
}).start();

const playButton = document.getElementById("play");
playButton.onclick = () => video.play();
const stopButton = document.getElementById("pause");
stopButton.onclick = () => {
  video.pause();
};
// THREE END
//
//
//
// THREE RAW START

const sceneRaw = new THREE.Scene();
const cameraRaw = new THREE.OrthographicCamera(-400, 400, 225, -225);
const rendererRaw = new THREE.WebGLRenderer();
const thrawContainer = document.getElementById("thraw-container");
thrawContainer.appendChild(rendererRaw.domElement);
rendererRaw.setSize(800, 450);

const geometryRaw = new THREE.PlaneGeometry(800, 450);
const TextureRaw = new THREE.VideoTexture(video);
TextureRaw.minFilter = THREE.LinearFilter;
const materialRaw = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: TextureRaw
});
const meshRaw = new THREE.Mesh(geometryRaw, materialRaw);
sceneRaw.add(meshRaw);
//TODO: add light!
meshRaw.position.z = -1;

function animate() {
  requestAnimationFrame(animate);
  rendererRaw.render(sceneRaw, cameraRaw);
}
animate();
