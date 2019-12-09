
import FragmentShader from './lutCompiled.frag';
import VertexShader from './pass.vert';
const createLoop = require("raf-loop");
const canvas = document.getElementById("gl-canvas");
const gl = canvas.getContext("webgl");
const playButton = document.getElementById("play");
const stopButton = document.getElementById("pause");
const uploadFilterButton = document.getElementById("upload-filter");
const uploadVideoButton = document.getElementById("upload-video");

main();

function main() {
  if (gl === null) {
    alert('no init')
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

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
