global.THREE = require('three');
const createLoop = require('raf-loop');
const EffectComposer = require('three-effectcomposer')(THREE);
const glslify = require('glslify');
const fragment = require('./lut.frag')
const vertex = require('./pass.vert')
console.log(fragment)

//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
//import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
// three js
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-400, 400, 225, -225);
const renderer = new THREE.WebGLRenderer();
const videoContainer = document.getElementById('video-container');
videoContainer.appendChild(renderer.domElement);
renderer.setSize(800, 450);
const video = document.getElementById('video');

const geometry = new THREE.PlaneGeometry(800, 450);
const texture = new THREE.VideoTexture(video);
texture.minFilter = THREE.LinearFilter
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: texture,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
//TODO: add light!
mesh.position.z = -1;

const target = new THREE.WebGLRenderTarget(800, 450);
target.texture.stencil = false;
target.texture.minFilter = THREE.LinearFilter;
target.texture.magFilter = THREE.LinearFilter;
target.texture.format = THREE.RGBFormat;
target.texture.generateMipmaps = false;

const composer = new EffectComposer(renderer, target);

composer.addPass(new EffectComposer.RenderPass(scene, camera));


const lut = new EffectComposer.ShaderPass({
  vertexShader: glslify(vertex),
  fragmentShader: glslify(fragment),
  uniforms: {
    tDiffuse: { type: 't', value: new THREE.Texture() },
    tLookup: { type: 't', value: new THREE.Texture() }
  }
});
composer.addPass(lut);

const tLookup = new THREE.TextureLoader().load('mercury.png');
tLookup.generateMipmaps = false;
tLookup.minFilter = THREE.LinearFilter;
lut.uniforms.tLookup.value = tLookup;

composer.passes[composer.passes.length - 1].renderToScreen = true;


createLoop(() => {
  composer.passes.forEach(pass => {
    if (pass.uniforms && pass.uniforms.resolution) {
      pass.uniforms.resolution.value.set(
        800, 450
      );
    }
  });
  composer.render();
}).start();


const playButton = document.getElementById('play');
playButton.onclick = () => video.play();
const stopButton = document.getElementById('pause');
stopButton.onclick = () => {
  video.pause();
};
