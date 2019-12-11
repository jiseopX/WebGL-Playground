
import FragmentShader from './lut.frag';
import VertexShader from './lut.vert';
import Triangle from 'a-big-triangle'
import createContext from 'gl-context'
import createTex2d from 'gl-texture2d'
import createShader from 'gl-shader'

const createLoop = require("raf-loop");

const playButton = document.getElementById("play");
const stopButton = document.getElementById("pause");
const uploadFilterButton = document.getElementById("upload-filter");
const uploadVideoButton = document.getElementById("upload-video");
const video = document.getElementById("video");
const canvas = document.getElementById("gl-canvas");
var lookupTexture;
var tex;
var shader;
var gl;
video.addEventListener('loadeddata', function () {

  lookupTexture = getTex2D("mercury.png");
  gl = createContext(canvas, render)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  shader = createShader(gl,
    VertexShader, FragmentShader
  )
  createLoop(() => {
    tex = createTex2d(gl, video)
  }).start();


  initButtons();
  if (gl === null) {
    alert('no init')
  }
}, false);





function initButtons() {
  playButton.onclick = () => video.play();
  stopButton.onclick = () => {
    video.pause();
  };
  uploadFilterButton.onchange = uploadFilter;
  uploadVideoButton.onchange = uploadVideo;
}

function uploadVideo(e) {
  const file = e.target.files[0]
  const reader = new FileReader();
  reader.onload = () => {
    const url = reader.result;
    video.src = url
  }
  reader.readAsDataURL(file)
}

function uploadFilter(e) {
  const file = e.target.files[0]
  const reader = new FileReader();
  reader.onload = () => {
    const url = reader.result;
    const tLookup = new THREE.TextureLoader().load(url);
    tLookup.generateMipmaps = false;
    tLookup.minFilter = THREE.LinearFilter;
    lut.uniforms.tLookup.value = tLookup;
  }
  reader.readAsDataURL(file)
}

function render() {
  if (!lookupTexture.texture)
    return;
  shader.bind()
  shader.uniforms.uTexture = tex.bind(0)
  shader.uniforms.uLookup = lookupTexture.texture.bind(1);
  Triangle(gl)
}

function getTex2D(path) {
  var obj = {
    image: new Image(),
    texture: null
  };
  obj.image.onload = function () {
    obj.texture = createTex2d(gl, obj.image)
    obj.texture.minFilter = obj.texture.magFilter = gl.LINEAR;
  };
  obj.image.src = path;
  return obj;
}