
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
var lookupTexture;
var shaders = [];
var gls = [];
var filterAlpha = 70

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
  const gl = canvases[index].getContext('webgl');
  gls.push(gl)
  const videoTexture = initTexture(gl);
  getFilter(index).then(function () {
    const rafCallback = () => {
      stats.begin();
      bindTexture(gl, videoTexture, 0)
      updateTexture(gl, videos[index])
      render(index, videoTexture)
      stats.end();
      requestAnimationFrame(rafCallback)
    }
    const shader = createShader(gls[index],
      VertexShader, FragmentShader
    )
    requestAnimationFrame(rafCallback)
    shaders.push(shader);
  })

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
  var slider = document.getElementById("filter-alpha");
  var output = document.getElementById("alpha-meter");
  output.innerHTML = slider.value;

  slider.oninput = function () {
    filterAlpha = this.value
    output.innerHTML = `alpha : ${filterAlpha}`
  }
}

function uploadVideo(e) {
  const file = e.target.files[0]
  const reader = new FileReader();
  reader.onload = () => {
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
    videos.forEach((video, index) => getFilter(index))
  }
  reader.readAsDataURL(file)
}


function render(index, videoTexture) {
  if (!lookupTexture)
    return;
  shaders[index].bind()
  shaders[index].uniforms.uLookup = lookupTexture
  shaders[index].uniforms.uTexture = videoTexture;
  shaders[index].uniforms.filterAlpha = filterAlpha / 100
  Triangle(gls[index])
}

function getFilter(index) {
  return new Promise(resolve => {
    var image = new Image()
    image.src = filterUrl
    image.onload = () => {
      const gl = gls[index]
      const texture = createTex2d(gl, image)
      texture.minFilter = texture.magFilter = gl.LINEAR;
      lookupTexture = texture.bind(1)
      resolve()
    }
  })
}

function initTexture(gl, unit) {
  const texture = gl.createTexture();
  bindTexture(gl, texture, unit)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  return texture;
}

function updateTexture(gl, screen) {
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    srcFormat, srcType, screen);

}

function bindTexture(gl, texture, unit) {
  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, texture)
}