
import FragmentShader from './lut.frag';
import VertexShader from './lut.vert';
import Triangle from 'a-big-triangle'
import createContext from 'gl-context'
import createTex2d from 'gl-texture2d'
import createShader from 'gl-shader'
import Stats from 'stats.js'

var stats = new Stats();
const createLoop = require("raf-loop");

const playButton = document.getElementById("play");
const stopButton = document.getElementById("pause");
const uploadFilterButton = document.getElementById("upload-filter");
const uploadVideoButton = document.getElementById("upload-video");
var filterUrl = "mercury.png";
var videos = [];
videos.push(document.getElementById("video-0"))
var canvases = []
canvases.push(document.getElementById("canvas-0"))
var lookupTextures = [];
var videoTextures = [];
var shaders = [];
var gls = [];

document.body.appendChild(stats.dom)
videos[0].addEventListener('loadeddata', () => onVideoLoaded(0), false);

function onVideoLoaded(index) {
  const videoStyle = window.getComputedStyle(videos[index])
  const vWidth = parseInt(videoStyle.width, 10);
  const vHeight = parseInt(videoStyle.height, 10)
  if (vWidth > vHeight) {
    videos[index].setAttribute('width', '640px');
    videos[index].setAttribute('height', `${640 * vHeight / vWidth}px`)
    canvases[index].setAttribute('width', `640px`)
    canvases[index].setAttribute('height', `${640 * vHeight / vWidth}px`)
  }
  else {
    videos[index].setAttribute('height', '640px');
    videos[index].setAttribute('width', `${640 * vWidth / vHeight}px`)
    canvases[index].setAttribute('height', '640px');
    canvases[index].setAttribute('width', `${640 * vWidth / vHeight}px`)
  }
  applyFilter(index)

  createLoop(() => {
    stats.begin();
    const videoTexture = createTex2d(gls[index], videos[index])
    if (gls[index]) {
      videoTexture.minFilter = gls[index].LINEAR
      videoTexture.magFilter = gls[index].LINEAR
    }
    videoTextures[index] ? (videoTextures[index] = videoTexture) :
      videoTextures.push(videoTexture)
    stats.end();
  }).start();
  const gl = createContext(canvases[index], () => render(index))
  gls.push(gl)
  const shader = createShader(gls[index],
    VertexShader, FragmentShader
  )
  shaders.push(shader);

  if (index === 0) {
    initButtons();
    if (gls[0] === null) {
      alert('no init')
    }
  }
}





function initButtons() {
  playButton.onclick = () => videos.forEach(video => video.play())
  stopButton.onclick = () => {
    videos.forEach(video => video.pause())
  };
  uploadFilterButton.onchange = uploadFilter;
  uploadVideoButton.onchange = uploadVideo;
}

function uploadVideo(e) {
  const file = e.target.files[0]
  const reader = new FileReader();
  reader.onload = () => {
    const url = reader.result;
    //video.src = url
    const newDiv = document.createElement('div');
    const newVideo = document.createElement('video');
    const newCanvas = document.createElement('canvas');
    newVideo.id = `video-${videos.length}`
    newVideo.src = reader.result

    newCanvas.id = `canvas-${canvases.length}`

    newDiv.style.display = 'flex'
    newDiv.style.flexDirection = 'row'
    newDiv.style.marginTop = '20px'

    videos.push(newVideo)
    canvases.push(newCanvas)
    document.body.append(newDiv);
    newDiv.appendChild(newVideo)
    newDiv.appendChild(newCanvas);
    newVideo.addEventListener('loadeddata', () => onVideoLoaded(videos.length - 1), false);


  }
  reader.readAsDataURL(file)
}

function uploadFilter(e) {
  const file = e.target.files[0]
  const reader = new FileReader();
  reader.onload = () => {
    filterUrl = reader.result;
    videos.forEach((video, index) => applyFilter(index))
  }
  reader.readAsDataURL(file)
}

function applyFilter(index) {
  lookupTextures[index] = getTex2D(index);
}

function render(index) {
  if (!lookupTextures[index].texture)
    return;
  shaders[index].bind()
  shaders[index].uniforms.uLookup = lookupTextures[index].texture.bind(1);
  shaders[index].uniforms.uTexture = videoTextures[index].bind(0);
  Triangle(gls[index])
}

function getTex2D(index) {
  var obj = {
    image: new Image(),
    texture: null
  };
  obj.image.onload = () => {
    obj.texture = createTex2d(gls[index], obj.image)
    obj.texture.minFilter = obj.texture.magFilter = gls[index].LINEAR;
  };
  obj.image.src = filterUrl
  return obj;
}