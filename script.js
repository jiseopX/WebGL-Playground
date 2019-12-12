
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
  const videoStyle = window.getComputedStyle(video)
  const vWidth = parseInt(videoStyle.width, 10);
  const vHeight = parseInt(videoStyle.height, 10)
  console.log(`${vWidth} X ${vHeight}`)
  if (vWidth > vHeight) {
    video.setAttribute('width', '640px');
    video.setAttribute('height', `${640 * vHeight / vWidth}px`)
    canvas.setAttribute('width', `640px`)
    canvas.setAttribute('height', `${640 * vHeight / vWidth}px`)
  }
  else {
    video.setAttribute('height', '640px');
    video.setAttribute('width', `${640 * vWeight / vHidth}px`)
    canvas.setAttribute('height', '640px');
    canvas.setAttribute('width', `${640 * vWeight / vHidth}px`)
  }
  applyFilter("mercury.png")
  gl = createContext(canvas, render)
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
    applyFilter(url)
  }
  reader.readAsDataURL(file)
}

function applyFilter(url) {
  lookupTexture = getTex2D(url);
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