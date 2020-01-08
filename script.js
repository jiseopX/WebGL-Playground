import FragmentShader from "./lut.frag";
import VertexShader from "./lut.vert";
import Triangle from "a-big-triangle";
import createShader from "gl-shader";
import Stats from "stats.js";

var stats = new Stats();

const playButton = document.getElementById("play");
const stopButton = document.getElementById("pause");
const uploadFilterButton = document.getElementById("upload-filter");
const uploadVideoButton = document.getElementById("upload-video");
var filterUrl1 = "glow.png";
var filterUrl2 = "mercury.png";
var filterUrl3 = "gray_city.png";
var filterUrl4 = "grayscale1.png";
var videos = [];
videos.push(document.getElementById("video-0"));
var canvases = [];
canvases.push(document.getElementById("canvas-0"));
var lookupTexture;
var shaders = [];
var gls = [];
var filterAlpha = 70;

document.body.appendChild(stats.dom);
videos[0].addEventListener("loadeddata", () => onVideoLoaded(0), false);

function onVideoLoaded(index) {
  initSize(index);
  const gl = canvases[index].getContext("webgl");
  gls.push(gl);
  const videoTexture = initTexture(gl, 0);
  getFilter(index).then(function() {
    bindTexture(gl, videoTexture, 0);
    const rafCallback = () => {
      stats.begin();
      updateTexture(gl, videos[index]);
      render(index);
      stats.end();
      requestAnimationFrame(rafCallback);
    };
    const shader = createShader(gls[index], VertexShader, FragmentShader);
    // gl.viewport(-640 * 1.5, 0, 640 * 1.5 * 2, 360 * 1.5 * 2);
    requestAnimationFrame(rafCallback);
    shaders.push(shader);
  });

  if (index === 0) {
    initButtons();
    if (gls[0] === null) {
      alert("no init");
    }
  }
}

function initSize(index) {
  const videoStyle = window.getComputedStyle(videos[index]);
  const vWidth = parseInt(videoStyle.width, 10);
  const vHeight = parseInt(videoStyle.height, 10);
  const dpr = window.devicePixelRatio || 1;

  if (vWidth > vHeight) {
    videos[index].setAttribute("width", "640px");
    videos[index].setAttribute("height", `${(640 * vHeight) / vWidth}px`);
    canvases[index].setAttribute("width", `${640 * dpr}px`);
    canvases[index].setAttribute(
      "height",
      `${(640 * dpr * vHeight) / vWidth}px`
    );
    canvases[index].style.width = `${640}px`;
    canvases[index].style.height = `${(640 * vHeight) / vWidth}px`;
  } else {
    videos[index].setAttribute("height", "640px");
    videos[index].setAttribute("width", `${(640 * vWidth) / vHeight}px`);
    canvases[index].setAttribute("height", `${640 * dpr}px`);
    canvases[index].setAttribute(
      "width",
      `${(640 * dpr * vWidth) / vHeight}px`
    );
    canvases[index].style.height = `${640}px`;
    canvases[index].style.width = `${(640 * vWidth) / vHeight}px`;
  }
}

function initButtons() {
  playButton.onclick = () => videos.forEach(video => video.play());
  stopButton.onclick = () => {
    videos.forEach(video => video.pause());
  };
  uploadFilterButton.onchange = uploadFilter;
  uploadVideoButton.onchange = uploadVideo;
  var slider = document.getElementById("filter-alpha");
  var output = document.getElementById("alpha-meter");
  output.innerHTML = slider.value;

  slider.oninput = function() {
    filterAlpha = this.value;
    output.innerHTML = `alpha : ${filterAlpha}`;
  };
}

function uploadVideo(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const newDiv = document.createElement("div");
    const newVideo = document.createElement("video");
    const newCanvas = document.createElement("canvas");
    newVideo.id = `video-${videos.length}`;
    newVideo.src = reader.result;

    newCanvas.id = `canvas-${canvases.length}`;

    newDiv.style.display = "flex";
    newDiv.style.flexDirection = "row";
    newDiv.style.marginTop = "20px";

    videos.push(newVideo);
    canvases.push(newCanvas);
    document.body.append(newDiv);
    newDiv.appendChild(newVideo);
    newDiv.appendChild(newCanvas);
    newVideo.addEventListener(
      "loadeddata",
      () => onVideoLoaded(videos.length - 1),
      false
    );
  };
  reader.readAsDataURL(file);
}

function uploadFilter(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    filterUrl1 = reader.result;
    videos.forEach((video, index) => getFilter(index));
  };
  reader.readAsDataURL(file);
}

function render(index) {
  if (!lookupTexture) return;
  const gl = gls[index];
  shaders[index].bind();
  shaders[index].uniforms.uLookup1 = 1;
  shaders[index].uniforms.uLookup2 = 2;
  shaders[index].uniforms.uLookup3 = 3;
  shaders[index].uniforms.uLookup4 = 4;
  shaders[index].uniforms.uTexture = 0;
  shaders[index].uniforms.filterAlpha = filterAlpha / 100;
  const now = Date.now();
  shaders[index].uniforms.t = (now % 5000) - (now % 25);
  Triangle(gl);
}

function getFilter(index) {
  return new Promise(resolve => {
    //filter 1
    var image1 = new Image();
    image1.src = filterUrl1;
    image1.onload = () => {
      const gl = gls[index];
      const texture = initTexture(gl, 1);
      updateTexture(gl, image1);
      lookupTexture = texture;
      gl.activeTexture(gl.TEXTURE0);
      //filter 2
      var image2 = new Image();
      image2.src = filterUrl2;
      image2.onload = () => {
        const gl = gls[index];
        const texture = initTexture(gl, 2);
        updateTexture(gl, image2);
        lookupTexture = texture;
        gl.activeTexture(gl.TEXTURE0);
        //filter 3
        var image3 = new Image();
        image3.src = filterUrl3;
        image3.onload = () => {
          const gl = gls[index];
          const texture = initTexture(gl, 3);
          updateTexture(gl, image3);
          lookupTexture = texture;
          gl.activeTexture(gl.TEXTURE0);
          //filter 4
          var image4 = new Image();
          image4.src = filterUrl4;
          image4.onload = () => {
            const gl = gls[index];
            const texture = initTexture(gl, 4);
            updateTexture(gl, image4);
            lookupTexture = texture;
            gl.activeTexture(gl.TEXTURE0);
            resolve();
          };
        };
      };
    };
  });
}

function initTexture(gl, unit) {
  const texture = gl.createTexture();
  bindTexture(gl, texture, unit);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

function updateTexture(gl, screen) {
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    srcFormat,
    srcType,
    screen
  );
}

function bindTexture(gl, texture, unit) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
}
