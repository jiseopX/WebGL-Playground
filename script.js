
import FragmentShader from './lut.frag';
import VertexShader from './lut.vert';
import Triangle from 'a-big-triangle'
import createTex2d from 'gl-texture2d'
import createShader from 'gl-shader'
import Stats from 'stats.js'

var stats = new Stats();

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
  const gl = canvases[index].getContext('webgl2');
  const videoTexture= initTexture(gl);
  applyFilter(index)

  const rafCallback=() => {
    stats.begin();
    updateTexture(gl,videoTexture,videos[index])
    render(index,videoTexture)
    stats.end();
    requestAnimationFrame(rafCallback)
  }
  gls.push(gl)
  const shader = createShader(gls[index],
    VertexShader, FragmentShader
  )
  requestAnimationFrame(rafCallback)
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
  lookupTextures[index] = getFilter(index);
}

function render(index,videoTexture) {
  if (!lookupTextures[index].texture)
    return;
  shaders[index].bind()
  shaders[index].uniforms.uLookup = lookupTextures[index].texture.bind(1);
  shaders[index].uniforms.uTexture = videoTexture;
  Triangle(gls[index])
}

function getFilter(index) {
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

function initTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because video has to be download over the internet
  // they might take a moment until it's ready so
  // put a single pixel in the texture so we can
  // use it immediately.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  // Turn off mips and set  wrapping to clamp to edge so it
  // will work regardless of the dimensions of the video.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  return texture;
}

function updateTexture(gl, texture, video) {
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                srcFormat, srcType, video);
}